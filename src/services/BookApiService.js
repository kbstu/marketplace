import axios from 'axios';

const API_URL = 'http://localhost:3000/api';
// const API_URL = 'http://192.168.20.21:3000/api';

class BookApiService {

    // Get all books 
    async getBooks() {
        try {
            const response = await axios.get(`${API_URL}/books`);
            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    // Get book by ID
    async getBook(id) {
        try {
            const response = await axios.get(`${API_URL}/books/${id}`);
            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    // Create a new book
    async createBook(book) {
        try {
            const response = await axios.post(`${API_URL}/books`, book);
            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    // Update a book by ID
    async updateBook(id, book) {
        try {
            const response = await axios.put(`${API_URL}/books/${id}`, book);
            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    // Delete a book by ID
    async deleteBook(id) {
        try {
            const response = await axios.delete(`${API_URL}/books/${id}`);
            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    // Update Book Stock Count
    async updateStockCount(id, count) {
        try {
            const response = axios.put(`${API_URL}/books/${id}/stock`, { count });
            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    // Handle API errors
    handleError(error) {
        console.error('API Error:', error);
        throw error;
    }
}

export default new BookApiService();

