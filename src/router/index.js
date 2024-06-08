import { createRouter, createWebHistory } from 'vue-router'
import Catalog from '@/views/Catalog.vue';
import ProductDetail from '@/views/ProductDetail.vue';
import Cart from '@/views/Cart.vue';
import AdminDashboard from '@/views/AdminDashboard.vue';
import ProfileView from '@/views/ProfileView.vue';
import OrdersView from '@/views/OrdersView.vue';
import { useAuthStore } from '@/stores/AuthStore.js';

// Define your routes
const routes = [
    {
        path: '/',
        name: 'Catalog',
        component: Catalog
    },
    {
        path: '/product/:book_id',
        name: 'ProductDetail',
        component: ProductDetail
    },
    {
        path: '/cart',
        name: 'CartView',
        component: Cart
    },
    {
        path: '/dashboard',
        name: 'AdminDashboard',
        component: AdminDashboard,
        meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
        path: '/profile',
        name: 'ProfileView', 
        component: ProfileView,
        meta: { requiresAuth: true },
    },
    {
        path: '/orders',
        name: 'OrdersView',
        component: OrdersView,
        meta: { requiresAuth: true },
    }
]

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes,
});
    
router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();

    if (to.meta.requiresAuth && !authStore.token) {
        next('/');
    } else if (to.meta.requiresAdmin && authStore.user?.role !== 'admin') {
        next('/');
    } else {
        next();
    }
});

export default router;
