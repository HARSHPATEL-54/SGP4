import { CheckoutSessionRequest, Orders, OrderState } from "@/types/orderType";
import axios from "axios";
import { toast } from "sonner";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// Import useCartStore for clearing the cart
import { useCartStore } from "./useCartStore";

const API_END_POINT: string = "http://localhost:8000/api/v1/order";
const USER_API_END_POINT = "http://localhost:8000/api/v1/user";

axios.defaults.withCredentials = true;

export const useOrderStore = create<OrderState>()(persist(
  (set, get) => ({
    loading: false,
    orders: [],
    singleOrder: null,
    allOrders: [],
    error: null,
    createCheckoutSession: async (checkoutSession: CheckoutSessionRequest) => {
        try {
            set({ loading: true });
            const response = await axios.post(`${API_END_POINT}/checkout/create-checkout-session`, checkoutSession, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            // Store the checkout session ID in localStorage
            localStorage.setItem('pendingCheckoutSession', response.data.session.id);
            
            // Clear the cart after successful checkout creation
            useCartStore.getState().clearCart();
            
            // Redirect to Stripe checkout
            window.location.href = response.data.session.url;
            set({ loading: false });
        } catch (error) {
            console.error('Error creating checkout session:', error);
            set({ loading: false });
        }
    },
    getOrderDetails: async () => {
        try {
            set({loading: true, error: null});
            const response = await axios.get(`${API_END_POINT}/`);
          
            set({loading: false, orders: response.data.orders});
        } catch (error) {
            console.error('Error fetching orders:', error);
            set({loading: false, error: 'Failed to fetch orders'});
        }
    },
    
    // Get a single order by ID
    getOrderById: async (orderId: string) => {
        try {
            set({loading: true, error: null});
            const response = await axios.get(`${API_END_POINT}/${orderId}`);
            
            set({loading: false, singleOrder: response.data.order});
            return response.data.order;
        } catch (error) {
            console.error('Error fetching order details:', error);
            set({loading: false, error: 'Failed to fetch order details'});
            return null;
        }
    },
    
    // Update order status (admin function)
    updateOrderStatus: async (orderId: string, status: string) => {
        try {
            set({loading: true, error: null});
            const response = await axios.put(`${API_END_POINT}/${orderId}/status`, { status }, {
                headers: {
                  'Content-Type': 'application/json'
                }
              });
            if (response.data.success) {
                // Update the single order if it's the one we're viewing
                const { singleOrder } = get();
                if (singleOrder && singleOrder._id === orderId) {
                    set({singleOrder: response.data.order});
                }
                
                // Update the order in the orders list if it exists there
                const updatedOrder = get().orders.map((order: Orders) => {
                  return order._id === orderId ? { ...order, status: response.data.status } : order;
                });
                
                // Also update in allOrders list if it exists
                const updatedAllOrders = get().allOrders.map((order: Orders) => {
                  return order._id === orderId ? { ...order, status: response.data.status } : order;
                });
                
                set({ 
                  orders: updatedOrder,
                  allOrders: updatedAllOrders
                });
                toast.success(response.data.message);
            }
        } catch (error: any) {
            toast.error(error.response.data.message);
        }
    },
  
    // New function to get ALL orders for admin viewing
    getAllOrders: async () => {
        try {
            set({ loading: true });
            const response = await axios.get(`${USER_API_END_POINT}/all-orders`);
            if (response.data.success) {
                set({ allOrders: response.data.orders, loading: false });
            }
        } catch (error: any) {
            console.error('Error fetching all orders:', error);
            set({ loading: false });
        }
    }
  }),
  {
    name: 'order-name',
    storage: createJSONStorage(() => localStorage)
}))