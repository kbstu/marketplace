import axios from 'axios';

const API_URL = 'http://localhost:3000/api';
// const API_URL = 'http://192.168.20.21:3000/api';


class UserApiService {

    // Login a user
    async login(email, password) {
        try {
            const response = await axios.post(`${API_URL}/login`, {
                email,
                password,
            });
            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    async signup(userDetails) {
        try {
            const response = await axios.post(`${API_URL}/signup`, userDetails);
            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    async getUsers() {
        try {
            const response = await axios.get(`${API_URL}/users`);
            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    async updateUser(id, updatedUser) {
        try {
            const response = await axios.put(`${API_URL}/users/${id}`, updatedUser);
            return response.data;
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }
    

    async deleteUser(id) {
        try {
            const response = await axios.delete(`${API_URL}/users/${id}`);
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

export default new UserApiService();

