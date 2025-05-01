import { MenuItem } from "./restaurantType";

export interface CartItem extends MenuItem { 
    quantity: number;
    restaurantId: string; // Add restaurantId to track which restaurant the item belongs to
}
export type CartState = {
    cart:CartItem[];
    addToCart:(item:MenuItem) => void;
    clearCart: () => void;
    removeFromTheCart: (id:string) => void;
    incrementQuantity: (id:string) => void;
    decrementQuantity: (id:string) => void;
}