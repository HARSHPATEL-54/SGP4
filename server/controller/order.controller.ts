import { Request, Response } from "express";
import { Restaurant } from "../models/restaurant.model";
import { Order } from "../models/order.model";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

type CheckoutSessionRequest = {
    cartItems: {
        menuId: string;
        name: string;
        image: string;
        price: number;
        quantity: number
    }[],
    deliveryDetails: {
        name: string;
        email: string;
        address: string;
        city: string
    },
    restaurantId: string
};

export const getOrders = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log('Getting orders for user ID:', req.id);
        
        // For admins, load all orders if query parameter is set
        if ((req as any).admin && req.query.all === 'true') {
            const allOrders = await Order.find({})
                .populate('user')
                .populate('restaurant')
                .sort({ createdAt: -1 });
                
            console.log(`Found ${allOrders.length} total orders in the system`);
            
            res.status(200).json({
                success: true,
                orders: allOrders
            });
            return;
        }
        
        // Standard order lookup for normal users or admins viewing their own orders
        const orders = await Order.find({ user: req.id })
            .populate('user')
            .populate('restaurant')
            .sort({ createdAt: -1 }); // Sort by newest first
        
        console.log(`Found ${orders.length} orders for user ID: ${req.id}`);
        
        res.status(200).json({
            success: true,
            orders
        });
    } catch (error) {
        console.error('Error fetching user orders:', error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Update order status (for users to track their orders)
export const getOrderById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { orderId } = req.params;
        
        const order = await Order.findById(orderId)
            .populate('user')
            .populate('restaurant');
            
        if (!order) {
            res.status(404).json({ success: false, message: "Order not found" });
            return;
        }
        
        // Check if the user is authorized to see this order
        if ((order.user as any)._id.toString() !== req.id && !(req as any).admin) {
            res.status(403).json({ success: false, message: "Not authorized to view this order" });
            return;
        }
        
        res.status(200).json({
            success: true,
            order
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Update order status (for admins to update order status)
export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;
        
        console.log(`Updating order ${orderId} to status: ${status}`);
        console.log(`Request from user: ${req.id}, isAdmin: ${(req as any).admin}`);
        
        if (!status) {
            res.status(400).json({ success: false, message: "Status is required" });
            return;
        }
        
        // Validate the status
        const validStatuses = ["pending", "confirmed", "preparing", "outfordelivery", "delivered", "cancelled"];
        if (!validStatuses.includes(status)) {
            res.status(400).json({ 
                success: false, 
                message: "Invalid status. Must be one of: pending, confirmed, preparing, outfordelivery, delivered, cancelled" 
            });
            return;
        }
        
        const order = await Order.findById(orderId);
        
        if (!order) {
            res.status(404).json({ success: false, message: "Order not found" });
            return;
        }
        
        // Check if the request is made by an admin - explicitly override any other checks
        if ((req as any).admin === true) {
            console.log(`Admin user ${req.id} authorized to update any order`);
            // Admin is authorized, continue with the update
        } else {
            // Not an admin, check if they're the restaurant owner
            console.log(`Non-admin user ${req.id} - checking restaurant ownership`);
            const restaurant = await Restaurant.findById(order.restaurant);
            
            if (!restaurant) {
                console.log(`Restaurant not found for order ${orderId}`);
                res.status(404).json({ success: false, message: "Restaurant not found" });
                return;
            }
            
            console.log(`Restaurant owner ID: ${restaurant.user.toString()}, Request user ID: ${req.id}`);
            if (restaurant.user.toString() !== req.id) {
                console.log(`User is not restaurant owner - access denied`);
                res.status(403).json({ success: false, message: "Not authorized to update this order" });
                return;
            }
            
            console.log(`Restaurant owner authorized to update order`);
        }
        
        // Update the order status and save
        order.status = status;
        await order.save();
        
        res.status(200).json({
            success: true,
            message: "Order status updated successfully",
            order
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const createCheckoutSession = async (req: Request, res: Response): Promise<void> => {
    try {
        const checkoutSessionRequest: CheckoutSessionRequest = req.body;
        console.log("Received checkout session request:", checkoutSessionRequest);
        
        // Basic validation
        if (!checkoutSessionRequest.restaurantId) {
            console.error("Error: Missing restaurant ID in checkout request");
            res.status(400).json({
                success: false,
                message: "Missing restaurant ID in checkout request."
            });
            return;
        }
        
        if (!checkoutSessionRequest.cartItems || checkoutSessionRequest.cartItems.length === 0) {
            console.error("Error: No cart items in checkout request");
            res.status(400).json({
                success: false,
                message: "No items in cart. Please add items before checkout."
            });
            return;
        }

        // Find restaurant and populate its menu items
        const restaurant = await Restaurant.findById(checkoutSessionRequest.restaurantId).populate('menus');

        if (!restaurant) {
            console.error("Error: Restaurant not found for ID:", checkoutSessionRequest.restaurantId);
            res.status(404).json({ success: false, message: "Restaurant not found." });
            return;
        }

        console.log("Found restaurant:", restaurant.restaurantName);

        // Create a new pending order (pending means payment not yet completed)
        const order: any = new Order({
            restaurant: restaurant._id,
            user: req.id,
            deliveryDetails: checkoutSessionRequest.deliveryDetails,
            cartItems: checkoutSessionRequest.cartItems,
            status: "pending",  // Initial status is pending until payment is completed
            totalAmount: 0  // Will be updated after payment completion
        });

        // Get menu items from the restaurant
        const menuItems = restaurant.menus;
        console.log("Menu items length:", menuItems ? menuItems.length : 0);

        if (!menuItems || menuItems.length === 0) {
            console.error("Error: No menu items found for restaurant:", checkoutSessionRequest.restaurantId);
            res.status(400).json({ success: false, message: "No menu items found for the restaurant" });
            return;
        }

        // Print menu items for debugging
        console.log("Menu items fetched from restaurant:", JSON.stringify(menuItems.map((item: any) => ({ 
            id: item._id.toString(),
            name: item.name,
            price: item.price 
        }))));

        // Generate line items for Stripe checkout
        const lineItems = createLineItems(checkoutSessionRequest, menuItems);
        console.log("Line items for Stripe checkout:", JSON.stringify(lineItems));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            shipping_address_collection: {
                allowed_countries: ['GB', 'US', 'CA']
            },
            line_items: lineItems,
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}/order/status`,
            cancel_url: `${process.env.FRONTEND_URL}/cart`,
            metadata: {
                orderId: order._id.toString(),
                images: JSON.stringify(menuItems.map((item: any) => item.image))
            }
        });

        if (!session.url) {
            console.error("Error: Failed to create Stripe session");
            res.status(400).json({ success: false, message: "Error while creating session" });
            return;
        }

        await order.save();
        res.status(200).json({ session });
    } catch (error) {
        console.error("Internal server error in checkout session:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const stripeWebhook = async (req: Request, res: Response): Promise<void> => {
    let event;

    try {
        const signature = req.headers["stripe-signature"];
        const payloadString = JSON.stringify(req.body, null, 2);
        
        if (!process.env.WEBHOOK_ENDPOINT_SECRET) {
            console.error('Webhook error: Missing WEBHOOK_ENDPOINT_SECRET in environment');
            res.status(500).send(`Server configuration error: Missing webhook secret`);
            return;
        }
        
        const secret = process.env.WEBHOOK_ENDPOINT_SECRET!;

        const header = stripe.webhooks.generateTestHeaderString({
            payload: payloadString,
            secret,
        });

        event = stripe.webhooks.constructEvent(payloadString, header, secret);
        console.log('Received webhook event type:', event.type);
    } catch (error: any) {
        console.error('Webhook error:', error.message);
        res.status(400).send(`Webhook error: ${error.message}`);
        return;
    }

    // Handle different Stripe events
    if (event.type === "checkout.session.completed") {
        try {
            const session = event.data.object as Stripe.Checkout.Session;
            console.log('Processing completed checkout session:', session.id);
            
            const order = await Order.findById(session.metadata?.orderId);

            if (!order) {
                console.error("Error: Order not found for session:", session.metadata?.orderId);
                res.status(404).json({ success: false, message: "Order not found" });
                return;
            }

            // Update order with payment information
            if (session.amount_total) {
                order.totalAmount = session.amount_total;
            }
            
            // Update status from pending to confirmed after successful payment
            order.status = "confirmed";
            await order.save();
            
            console.log(`Order ${order._id} successfully updated to confirmed status`);
        } catch (error) {
            console.error('Error handling checkout completion event:', error);
            res.status(500).json({ success: false, message: "Internal server error" });
            return;
        }
    } else if (event.type === "checkout.session.expired") {
        // Handle expired checkout sessions
        try {
            const session = event.data.object as Stripe.Checkout.Session;
            const order = await Order.findById(session.metadata?.orderId);
            
            if (order && order.status === "pending") {
                // If the checkout expired and order is still pending, mark it as expired
                order.status = "cancelled";
                await order.save();
                console.log(`Order ${order._id} marked as cancelled due to expired checkout`);
            }
        } catch (error) {
            console.error('Error handling checkout expiration event:', error);
        }
    }

    res.status(200).send();
};

export const createLineItems = (checkoutSessionRequest: CheckoutSessionRequest, menuItems: any) => {
    return checkoutSessionRequest.cartItems.map((cartItem) => {
        console.log("Processing cart item:", cartItem);

        // Find menu item by ID, comparing as strings to ensure consistent comparison
        const menuItem = menuItems.find((item: any) => {
            // Ensure we convert ObjectId to string for proper comparison
            const menuItemId = item._id ? item._id.toString() : '';
            const cartItemId = cartItem.menuId ? cartItem.menuId.toString() : '';
            const match = menuItemId === cartItemId;
            
            if (match) {
                console.log(`Found matching menu item: ${item.name} for cart item ID: ${cartItem.menuId}`);
            }
            
            return match;
        });

        if (!menuItem) {
            console.error(`Error: Menu item not found for ID ${cartItem.menuId}`);
            console.error(`Available menu items: ${menuItems.map((i: any) => i._id.toString()).join(', ')}`);
            throw new Error(`Menu item id ${cartItem.menuId} not found`);
        }

        return {
            price_data: {
                currency: 'inr',
                product_data: {
                    name: menuItem.name,
                    images: [menuItem.image],
                },
                unit_amount: menuItem.price * 100
            },
            quantity: parseInt(cartItem.quantity.toString()),
        };
    });
};
