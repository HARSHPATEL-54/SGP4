import { CartState } from "@/types/cartType";
import { MenuItem } from "@/types/restaurantType";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";


export const useCartStore = create<CartState>()(persist((set) => ({
    cart: [],
    addToCart: (item: MenuItem) => {
        set((state) => {
            // Get the restaurant ID from the URL if available
            const urlParts = window.location.pathname.split('/');
            const restaurantId = urlParts.includes('restaurant') ? urlParts[urlParts.indexOf('restaurant') + 1] : null;
            
            // If we don't have a restaurant ID, we can't add the item to the cart
            if (!restaurantId) {
                console.error('Error: Could not determine restaurant ID from URL');
                return state; // Return unchanged state
            }
            
            // Check if we already have items from a different restaurant in the cart
            const hasItemsFromDifferentRestaurant = state.cart.length > 0 && 
                state.cart[0].restaurantId !== restaurantId;
            
            // If we have items from a different restaurant, we should clear the cart first
            if (hasItemsFromDifferentRestaurant) {
                // Clear cart since we're adding items from a different restaurant
                return {
                    cart: [{ ...item, quantity: 1, restaurantId }]
                };
            }
            
            // Check if the item already exists in the cart
            const existingItem = state.cart.find((cartItem) => cartItem._id === item._id);
            if (existingItem) {
                // Already added in cart, then increment quantity
                return {
                    cart: state.cart.map((cartItem) => 
                        cartItem._id === item._id 
                            ? { ...cartItem, quantity: cartItem.quantity + 1 } 
                            : cartItem
                    )
                };
            } else {
                // Add to cart with restaurant ID
                return {
                    cart: [...state.cart, { ...item, quantity: 1, restaurantId }]
                };
            }
        });
    },
    clearCart: () => {
        set({ cart: [] });
    },
    removeFromTheCart: (id: string) => {
        set((state) => ({
            cart: state.cart.filter((item) => item._id !== id)
        }))
    },
    incrementQuantity: (id: string) => {
        set((state) => ({
            cart: state.cart.map((item) => item._id === id ? { ...item, quantity: item.quantity + 1 } : item)
        }))
    },
    decrementQuantity: (id: string) => {
        set((state) => ({
            cart: state.cart.map((item) => item._id === id && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item)
        }))
    }
}),
    {
        name: 'cart-name',
        storage: createJSONStorage(() => localStorage)
    }
))