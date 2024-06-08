<template>
    <div class="card product-item h-100">
        <div class="row g-0 h-100 cursor-pointer" @click="navigateToProductDetails">
            <div class="col-md-4 d-flex justify-content-center align-items-center">
                <img
                    :src="props.productData.cover_image_url"
                    class="img-fluid rounded book-image"
                    alt="Book cover"
                />
            </div>
            <div class="col-md-8 d-flex flex-column">
                <div class="card-body flex-grow-1 d-flex flex-column justify-content-between">
                    <div>
                        <h5 class="card-title">{{ props.productData.title }}</h5>
                        <p class="card-text">Author: {{ authorName }}</p>
                        <p class="card-text">Category: {{ categoryName }}</p>
                        <p class="card-text description">{{ props.productData.description }}</p>
                        <p class="card-text">Stock Quantity: {{ props.productData.stock_quantity }}</p>
                    </div>
                </div>
            </div>
        </div>
        <div class="row g-0">
            <div class="card-footer d-flex flex-column justify-content-between actions cursor-default">
                <p class="card-text mb-0"><strong>${{ props.productData.price }}</strong></p>
                <div class="d-flex align-items-center mb-2">
                    <input
                        type="number"
                        class="form-control quantity me-2"
                        v-model="orderQuantity"
                        :min="1"
                        :max="props.productData.stock_quantity"
                        @blur="validateQuantity"
                        @click.stop
                        :disabled="props.productData.stock_quantity === 0"
                        placeholder="Quantity"
                    />
                    <button
                        @click.stop="addToCart"
                        class="btn btn-primary add-btn"
                        :disabled="props.productData.stock_quantity === 0"
                    >
                        {{ props.productData.stock_quantity === 0 ? 'Out of Stock' : 'Add to cart' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { defineProps, ref, onMounted } from "vue";
import { productsStore } from "@/stores/products";
import { useRouter } from "vue-router";
import AuthorApiService from "@/services/AuthorApiService";
import CategoryApiService from "@/services/CategoryApiService";

const router = useRouter();

const props = defineProps({
    productData: {
        type: Object,
        required: true,
    }
});

const store = productsStore();
const orderQuantity = ref(1);
const authorName = ref('');
const categoryName = ref('');

const fetchAuthorNameFromId = async (authorId) => {
    try {
        const author = await AuthorApiService.getAuthorById(authorId);
        return author.name;
    } catch (error) {
        console.error('Error fetching author name:', error);
        return 'Unknown Author';
    }
};

const fetchCategoryNameFromId = async (categoryId) => {
    try {
        const category = await CategoryApiService.getCategoryById(categoryId);
        return category.name;
    } catch (error) {
        console.error('Error fetching category name:', error);
        return 'Unknown Category';
    }
};

const loadAuthorAndCategoryNames = async () => {
    authorName.value = await fetchAuthorNameFromId(props.productData.author_id);
    categoryName.value = await fetchCategoryNameFromId(props.productData.category_id);
};

const addToCart = () => {
    const productWithQuantity = {
        ...props.productData,
        quantity: orderQuantity.value,
    };
    store.addToCart(productWithQuantity);
    router.push({ name: 'CartView' });
};

const validateQuantity = () => {
    if (orderQuantity.value < 1) {
        orderQuantity.value = 1;
    } else if (orderQuantity.value > props.productData.stock_quantity) {
        orderQuantity.value = props.productData.stock_quantity;
    }
};

const navigateToProductDetails = () => {
    router.push({ name: 'ProductDetail', params: { book_id: props.productData.book_id } });
};

onMounted(() => {
    loadAuthorAndCategoryNames();
});
</script>

<style>
.product-item {
    height: 500px;
}

.book-image {
    max-height: 200px;
}

.card-footer {
    flex-shrink: 0;
    padding: 8px 16px;
    height: 100px;
}

.actions {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.quantity {
    max-width: 80px;
}

@media (max-width: 600px) {
    .description {
        display: none;
    }
}
</style>
