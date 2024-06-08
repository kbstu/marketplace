<template>
    <div class="container mt-4">
        <div class="row">
            <div class="col-12">
                <h1>Your Orders</h1>
                <div v-if="!orders.length">No orders found.</div>
                <div v-else class="orders-container">
                    <OrderItem
                        v-for="order in orders"
                        :key="order.order_id"
                        :order="order"
                        @order-cancelled="fetchOrders"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import OrderItem from '@/components/OrderItem.vue';
import OrderApiService from '@/services/OrderApiService';
import { useAuthStore } from '@/stores/AuthStore.js';

const authStore = useAuthStore();
const orders = ref([]);

const fetchOrders = async () => {
    try {
        const response = await OrderApiService.getOrdersByUserId(authStore.user.user_id);
        orders.value = response;
    } catch (error) {
        console.error('Error fetching orders:', error);
    }
};

onMounted(() => {
    fetchOrders();
});
</script>
