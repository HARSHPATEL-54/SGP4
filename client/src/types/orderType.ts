export type CheckoutSessionRequest = {
    cartItems:{
        menuId:string;
        name:string;
        image:string;
        price:string;
        quantity:string;
    }[];
    deliveryDetails:{
        name:string;
        email:string;
        contact:string;
        address:string;
        city:string;
        country:string
    },
    restaurantId:string;
}
export interface Orders {
    _id: string;
    status: string;
    totalAmount: number;
    deliveryDetails: {
        name: string;
        email: string;
        address: string;
        city: string;
        contact?: string;
        country?: string;
    };
    cartItems: {
        menuId: string;
        name: string;
        image: string;
        price: string;
        quantity: string;
    }[];
    restaurant?: {
        _id: string;
        restaurantName: string;
        image?: string;
    };
    user?: any;
    createdAt: string;
    updatedAt: string;
}
export type OrderState = {
    loading: boolean;
    orders: Orders[];
    singleOrder: Orders | null;
    allOrders: Orders[];
    error: string | null;
    createCheckoutSession: (checkoutSessionRequest: CheckoutSessionRequest) => Promise<void>;
    getOrderDetails: () => Promise<void>;
    getOrderById: (orderId: string) => Promise<Orders | null>;
    updateOrderStatus: (orderId: string, status: string) => Promise<void>;
    getAllOrders: () => Promise<void>;
}