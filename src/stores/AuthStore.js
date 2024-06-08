import { defineStore } from 'pinia';
import UserApiService from '@/services/UserApiService';
import axios from 'axios';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        token: null,
    }),

    actions: {
        async login(email, password) {
        try {
            const data = await UserApiService.login(email, password);
            this.user = data.user;
            this.token = data.token;
            axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
            localStorage.setItem('token', this.token);
        } catch (error) {
            console.error('Error logging in:', error);
        }
        },

        logout() {
            this.user = null;
            this.token = null;
            delete axios.defaults.headers.common['Authorization'];
            localStorage.removeItem('token');
        },

        async signup(userDetails) {
        try {
            const data = await UserApiService.signup(userDetails);
            // account id not returned here, to "login" the created user.
            this.user = data.user;
            this.token = data.token;
            axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
            // fetch user details to obtain account ID
            this.fetchUser();
        } catch (error) {
            console.error('Error signing up:', error);
        }
        },

        async updateUserProfile(updatedUser) {
            try {
                await UserApiService.updateUser(this.user.user_id, updatedUser);
                this.user = { ...this.user, ...updatedUser };
            } catch (error) {
                console.error('Error updating user profile:', error);
            }
        },


        async fetchUser() {
        try {
            const response = await axios.get('http://localhost:3000/api/user');
            this.user = response.data;
        } catch (error) {
            console.error('Error fetching user:', error);
        }
        },

        initializeAuth() {
        const token = localStorage.getItem('token');
        if (token) {
            this.token = token;
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            this.fetchUser();
        }
        },
    },
});
