import axios from 'axios';
import OrderItemApiService from '@/services/OrderItemApiService';
import BookApiService from '@/services/BookApiService';

const API_URL = 'http://localhost:3000/api';
// const API_URL = 'http://192.168.20.21:3000/api';

class OrderApiService {
	async getOrders() {
		try {
			const response = await axios.get(`${API_URL}/orders`);
			return response.data;
		} catch (error) {
			console.error('Error fetching orders:', error);
			throw error;
		}
	}

	
	async getOrdersByUserId(userId) {
		try {
			const response = await axios.get(`${API_URL}/orders/user?user_id=${userId}`);
			return response.data;
		} catch (error) {
			console.error('Error fetching orders:', error);
		}
	}
	

    async createOrder(order) {
        try {
            const response = await axios.post(`${API_URL}/orders`, order);
            return response.data;
        } catch (error) {
            console.error('Error creating order:', error);
            throw error;
        }
    }

	async updateOrder(id, order) {
		try {
			const response = await axios.put(`${API_URL}/orders/${id}`, order);
			return response.data;
		} catch (error) {
			console.error('Error updating order:', error);
			throw error;
		}
	}

	async deleteOrder(id) {
		try {
			const response = await axios.delete(`${API_URL}/orders/${id}`);
			return response.data;
		} catch (error) {
			console.error('Error deleting order:', error);
			throw error;
		}
	}

	async cancelOrder(orderId) {
        try {
			const orderItems = await OrderItemApiService.getOrderItemsByOrderId(orderId);
			
			for (const orderItem of orderItems) {
				try {
					const book = await BookApiService.getBook(orderItem.book_id);
					await BookApiService.updateStockCount(orderItem.book_id, book.stock_quantity + orderItem.quantity);
					await OrderItemApiService.deleteOrderItem(orderItem.order_item_id);
				} catch (error) {
					console.error('Error updating stock count:', error);
					throw error;
				}
			}
			const orderResponse = await this.deleteOrder(orderId);
			return orderResponse;
        } catch (error) {
            console.error('Error canceling order:', error);
            throw error;
        }
    }
}

export default new OrderApiService();
