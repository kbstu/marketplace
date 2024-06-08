import axios from 'axios';

const API_URL = 'http://localhost:3000/api';
//const API_URL = 'http://192.168.20.21:3000/api';

class AuthorApiService {
	async getAuthors() {
		try {
			const response = await axios.get(`${API_URL}/authors`);
			return response.data;
		} catch (error) {
			console.error('Error fetching authors:', error);
			throw error;
		}
	}

	async getAuthorById(id) {
        try {
            const response = await axios.get(`${API_URL}/authors/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching author by ID:', error);
			console.error('Error on Author ID:' + id, error.message)
            throw error;
        }
    }


    async createAuthor(author) {
        try {
            const response = await axios.post(`${API_URL}/authors`, author);
            return response.data;
        } catch (error) {
            console.error('Error creating author:', error);
            throw error;
        }
    }

	async updateAuthor(id, author) {
		try {
			const response = await axios.put(`${API_URL}/authors/${id}`, author);
			return response.data;
		} catch (error) {
			console.error('Error updating author:', error);
			throw error;
		}
	}

	async deleteAuthor(id) {
		try {
			const response = await axios.delete(`${API_URL}/authors/${id}`);
			return response.data;
		} catch (error) {
			console.error('Error deleting author:', error);
			throw error;
		}
	}

    async searchAuthors(search) {
        try {
            const response = await axios.get(`${API_URL}/authors/search`, { params: { q: search } });
            return response.data;
        } catch (error) {
            console.error('Error searching authors:', error);
            throw error;
        }
    }


}

export default new AuthorApiService();
