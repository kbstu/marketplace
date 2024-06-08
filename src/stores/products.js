import { defineStore } from 'pinia';
import BookApiService from '@/services/BookApiService.js';
import OrderApiService from '@/services/OrderApiService';
import OrderItemApiService from '@/services/OrderItemApiService';

export const productsStore = defineStore('products', {
    state: () => ({
        products: [],
        cart: []
    }),

    actions: {
        async fetchProductsFromDB() {
            try {
                const books = await BookApiService.getBooks();
                this.products = books;
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        },

        addToCart(product) {
            const index = this.cart.findIndex((cartItem) => cartItem.book_id === product.book_id);
            if (index !== -1) {
                const newQuantity = this.cart[index].quantity + product.quantity;
                this.cart[index].quantity = Math.min(newQuantity, product.stock_quantity);
            } else {
                this.cart.push(product);
            }
        },

        updateCart(item) {
            const index = this.cart.findIndex((cartItem) => cartItem.book_id === item.book_id);
            if (index !== -1) {
                this.cart[index] = item;
            }
        },

        removeFromCart(book_id) {
            this.cart = this.cart.filter((item) => item.book_id !== book_id);
        },

        // submits the order to the OrderApiService
        async handleCheckout(order) {
            try {
                const response = await OrderApiService.createOrder(order);
                if (response.message === 'success') {
                    // Submit Order Items
                    const order_id = response.order_id;
                    for (const item of this.cart) {
                        item.order_id = order_id;
                        await OrderItemApiService.createOrderItem(item);
                    }
                    this.cart = [];
                    return true;  // Indicate success
                } else {
                    return false;  // Indicate failure
                }
            } catch (error) {
                console.error('Error during checkout:', error);
                return false;  // Indicate failure
            }
        }
    }
});
