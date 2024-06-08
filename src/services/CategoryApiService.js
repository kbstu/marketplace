import axios from 'axios';

const API_URL = 'http://localhost:3000/api';
// const API_URL = 'http://192.168.20.21:3000/api';

class CategoryApiService {
	async getCategories() {
		try {
			const response = await axios.get(`${API_URL}/categories`);
			return response.data;
		} catch (error) {
			console.error('Error fetching categories:', error);
			throw error;
		}
	}

	async getCategoryById(categoryId) {
        try {
            const response = await axios.get(`${API_URL}/categories/${categoryId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching category by ID:', error);
            throw error;
        }
    }



    async createCategory(category) {
        try {
            const response = await axios.post(`${API_URL}/categories`, category);
            return response.data;
        } catch (error) {
            console.error('Error creating category:', error);
            throw error;
        }
    }

	async updateCategory(id, category) {
		try {
			const response = await axios.put(`${API_URL}/categories/${id}`, category);
			return response.data;
		} catch (error) {
			console.error('Error updating category:', error);
			throw error;
		}
	}

	async deleteCategory(id) {
		try {
			const response = await axios.delete(`${API_URL}/categories/${id}`);
			return response.data;
		} catch (error) {
			console.error('Error deleting category:', error);
			throw error;
		}
	}

    async searchCategories(search) {
        try {
            const response = await axios.get(`${API_URL}/categories/search`, { params: { q: search } });
            return response.data;
        } catch (error) {
            console.error('Error searching categories:', error);
            throw error;
        }
    }
}

export default new CategoryApiService();
