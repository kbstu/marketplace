<template>
    <div class="container mt-4">
        <div class="row mb-4">
            <div class="col">
                <button class="btn btn-primary" @click="router.push({ name: 'Catalog' })" style="width: 175px">
                    Back to catalog
                </button>
            </div>
        </div>
        <div v-if="!store.cart.length" class="text-center">
            <h1>Cart is empty.</h1>
        </div>
        <div v-else>
            <div class="cart-items">
                <CartItem
                    v-for="item in store.cart"
                    :key="item.book_id"
                    :item="item"
                    @remove="removeFromCart"
                    @update="updateCartItem"
                />
                <div class="order-total d-flex justify-content-end align-items-center mt-4">
                    <h4 class="me-4">Order Total: ${{ orderTotal }}</h4>
                    <button class="btn btn-primary" @click="handleCartCheckout">Checkout</button>
                </div>
            </div>
        </div>

        <v-dialog v-model="showCheckoutDialog" max-width="500px">
            <v-card>
                <v-card-title>Checkout</v-card-title>
                <v-card-text>
                    <v-form @submit.prevent="submitOrder">
                        <v-container>
                            <v-row>
                                <v-col>
                                    <v-text-field
                                        v-model="shippingAddress"
                                        label="Shipping Address"
                                        :rules="[rules.required, rules.maxLength(40)]"
                                        required
                                    ></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col>
                                    <v-text-field
                                        v-model="billingAddress"
                                        label="Billing Address"
                                        :rules="[rules.required, rules.maxLength(40)]"
                                        required
                                    ></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col>
                                    <v-text-field
                                        v-model="paymentMethod"
                                        label="Payment Method"
                                        :rules="[rules.required, rules.maxLength(10)]"
                                        required
                                    ></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col>
                                    <v-card-subtitle>Total Amount: ${{ orderTotal }}</v-card-subtitle>
                                </v-col>
                            </v-row>
                        </v-container>
                    </v-form>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" @click="submitOrder">Submit Order</v-btn>
                    <v-btn @click="showCheckoutDialog = false">Cancel</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-snackbar v-model="showSnackbar" :timeout="snackbarTimeout" :color="snackbarColor">
            {{ snackbarMessage }}
        </v-snackbar>
        
        <v-snackbar v-model="showLoginSnackbar" :timeout="snackbarTimeout" color="red">
            Please log in or sign up to checkout.
            <v-btn color="white" text @click="showLoginSnackbar = false">Close</v-btn>
        </v-snackbar>
    </div>
</template>

<script>
import { defineComponent, ref, computed } from "vue";
import { productsStore } from "@/stores/products";
import { useAuthStore } from '@/stores/AuthStore';
import { useRouter } from 'vue-router';
import CartItem from '@/components/CartItem.vue';

export default defineComponent({
    name: 'CartView',
    components: {
        CartItem
    },
    setup() {
        const store = productsStore();
        const auth = useAuthStore();
        const router = useRouter();
        const showCheckoutDialog = ref(false);
        const showSnackbar = ref(false);
        const snackbarMessage = ref('');
        const snackbarTimeout = ref(3000);
        const snackbarColor = ref('success');
        const showLoginSnackbar = ref(false);
        const shippingAddress = ref('');
        const billingAddress = ref('');
        const paymentMethod = ref('');

        const removeFromCart = (book_id) => {
            store.removeFromCart(book_id);
        }

        const updateCartItem = (item) => {
            store.updateCart(item);
        }

        const handleCartCheckout = () => {
            if (!auth.user) {
                showLoginSnackbar.value = true;
            } else {
                showCheckoutDialog.value = true;
            }
        }

        const submitOrder = async () => {
            const newOrder = {
                user_id: auth.user.user_id,
                order_date: new Date().toLocaleDateString('en-GB'),
                total_amount: orderTotal.value,
                status: 'pending',
                shipping_address: shippingAddress.value,
                billing_address: billingAddress.value,
                payment_method: paymentMethod.value,
            };

            console.log("Creating new Order: ", newOrder, "for user: ", auth.user);

            const success = await store.handleCheckout(newOrder);
            showCheckoutDialog.value = false;

            if (success) {
                snackbarMessage.value = 'Order created successfully!';
                snackbarColor.value = 'success';
            } else {
                snackbarMessage.value = 'Failed to create order. Please try again.';
                snackbarColor.value = 'error';
            }
            showSnackbar.value = true;
        }

        const orderTotal = computed(() => {
            return store.cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
        });

        // Validation rules
        const rules = {
            required: value => !!value || 'Required.',
            maxLength: length => value => (value && value.length <= length) || `Max ${length} characters.`,
        };

        return {
            store,
            router,
            showCheckoutDialog,
            showSnackbar,
            snackbarMessage,
            snackbarTimeout,
            snackbarColor,
            showLoginSnackbar,
            shippingAddress,
            billingAddress,
            paymentMethod,
            removeFromCart,
            updateCartItem,
            orderTotal,
            handleCartCheckout,
            submitOrder,
            rules
        }
    }
});
</script>

<style>
.cart-items {
    margin-inline: auto;
    width: 70%;
}

.order-total {
    width: 95%;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin: 8px;
    padding: 8px;
}

@media (max-width: 600px) {
    .cart-items {
        width: 90%;
    }
}
</style>
