import axios from 'axios';
import BookApiService from './BookApiService';

const API_URL = 'http://localhost:3000/api';
// const API_URL = 'http://192.168.20.21:3000/api';

class OrderItemApiService {
	async getOrderItems() {
		try {
			const response = await axios.get(`${API_URL}/orderitems`);
			return response.data;
		} catch (error) {
			console.error('Error fetching order items:', error);
			throw error;
		}
	}

	async getOrderItemsByOrderId(orderId) {
        try {
            const response = await axios.get(`${API_URL}/orderitems/order?order_id=${orderId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching order items:', error);
        }
    }

    async createOrderItem(orderItem) {
        try {
			const stock_response = await BookApiService.updateStockCount(orderItem.book_id, orderItem.stock_quantity - orderItem.quantity);
            const response = await axios.post(`${API_URL}/orderitems`, orderItem);
            return response.data, stock_response;
        } catch (error) {
            console.error('Error creating order item:', error);
            throw error;
        }
    }

	async updateOrderItem(id, orderItem) {
		try {
			const response = await axios.put(`${API_URL}/orderitems/${id}`, orderItem);
			return response.data;
		} catch (error) {
			console.error('Error updating order item:', error);
			throw error;
		}
	}

	async deleteOrderItem(id) {
		try {
			const response = await axios.delete(`${API_URL}/orderitems/${id}`);
			return response.data;
		} catch (error) {
			console.error('Error deleting order item:', error);
			throw error;
		}
	}
}

export default new OrderItemApiService();
