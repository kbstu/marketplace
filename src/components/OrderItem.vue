<template>
    <div class="card mb-3">
        <div class="card-header d-flex justify-content-between align-items-center">
            <div>
                <p class="mb-0"><strong>Order Date:</strong> {{ order.order_date }}</p>
                <p class="mb-0"><strong>Status:</strong> {{ order.status }}</p>
            </div>
            <div>
                <p class="mb-0"><strong>Total Amount:</strong> ${{ order.total_amount }}</p>
                <p class="mb-0"><strong>Payment Method:</strong> {{ order.payment_method }}</p>
            </div>
            <div class="d-flex align-items-center">
                <button class="btn btn-outline-secondary btn-sm cursur-pointer" @click="toggleDetails">
                    <i :class="showDetails ? 'mdi mdi-chevron-up' : 'mdi mdi-chevron-down'"></i>
                </button>
                <button v-if="order.status === 'pending'" class="btn btn-outline-danger btn-sm ml-2 cursur-pointer" @click="cancelOrder">
                    <i class="mdi mdi-cancel"></i>
                </button>
            </div>
        </div>
        <Vue3SlideUpDown v-model="showDetails">
            <div v-if="showDetails" class="card-body">
                <p><strong>Order ID:</strong> {{ order.order_id }}</p>
                <p><strong>Shipping Address:</strong> {{ order.shipping_address }}</p>
                <p><strong>Billing Address:</strong> {{ order.billing_address }}</p>
                <div class="order-items">
                    <OrderItemDisplay
                        v-for="item in orderItems"
                        :key="item.order_item_id"
                        :item="item"
                    />
                </div>
            </div>
        </Vue3SlideUpDown>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { defineProps, defineEmits } from 'vue';
import OrderItemDisplay from '@/components/OrderItemDisplay.vue';
import OrderItemApiService from '@/services/OrderItemApiService';
import OrderApiService from '@/services/OrderApiService';
// VUE3 sliding up and down animation -- evomark.co.uk
import { Vue3SlideUpDown } from 'vue3-slide-up-down';

const props = defineProps({
    order: {
        type: Object,
        required: true,
    }
});

const emit = defineEmits(['order-cancelled']);

const showDetails = ref(false);
const orderItems = ref([]);

const toggleDetails = () => {
    showDetails.value = !showDetails.value;
    if (showDetails.value) {
        fetchOrderItems();
    }
};

const fetchOrderItems = async () => {
    try {
        const response = await OrderItemApiService.getOrderItemsByOrderId(props.order.order_id);
        orderItems.value = response;
    } catch (error) {
        console.error('Error fetching order items:', error);
    }
};

const cancelOrder = async () => {
    try {
        await OrderApiService.cancelOrder(props.order.order_id);
        emit('order-cancelled');
    } catch (error) {
        console.error('Error canceling order:', error);
    }
};

onMounted(() => {
    if (showDetails.value) {
        fetchOrderItems();
    }
});
</script>

<style scoped>
.order-items {
    display: flex;
    flex-direction: column;
    gap: 8px;
}
</style>
