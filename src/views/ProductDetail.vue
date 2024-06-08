<template>
    <div class="container mt-4">
        <button class="btn btn-secondary mb-4" @click="router.push({ name: 'Catalog' })">
            Back to catalog
        </button>
        <div class="row">
            <!-- Book Cover -->
            <div class="col-12 col-md-4 d-flex justify-content-center align-items-center mb-4 mb-md-0">
                <img
                    :src="selectedProduct.cover_image_url"
                    class="img-fluid rounded book-cover"
                    alt="Book cover"
                />
            </div>

            <!-- Book Details -->
            <div class="col-12 col-md-5">
                <h1>{{ selectedProduct.title }}</h1>
                <p><strong>Author:</strong> {{ authorName }}</p>
                <p><strong>Category:</strong> {{ categoryName }}</p>
                <p><strong>Rating:</strong> {{ selectedProduct.rating }}</p>
                <hr />
                <h3>Description</h3>
                <p>{{ selectedProduct.description }}</p>
                <hr />
                <p><strong>ISBN:</strong> {{ selectedProduct.isbn }}</p>
                <p><strong>Publisher:</strong> {{ selectedProduct.publisher }}</p>
                <p><strong>Publication Date:</strong> {{ selectedProduct.publication_date }}</p>
                <p><strong>Page Count:</strong> {{ selectedProduct.page_count }}</p>
                <p><strong>Language:</strong> {{ selectedProduct.language }}</p>
                <p><strong>Format:</strong> {{ selectedProduct.format }}</p>
            </div>

            <!-- Book Purchase -->
            <div class="col-12 col-md-3 d-flex flex-column justify-content-center align-items-center">
                <h2>Price: ${{ selectedProduct.price }}</h2>
                <p>Stock Quantity: {{ selectedProduct.stock_quantity }}</p>
                <div class="d-flex flex-column align-items-center">
                    <input
                        v-model="orderQuantity"
                        type="number"
                        class="form-control mb-2"
                        :min="1"
                        :max="selectedProduct.stock_quantity"
                        @blur="validateQuantity"
                        :disabled="selectedProduct.stock_quantity === 0"
                        style="width: 80px;"
                        placeholder="Quantity"
                    />
                    <button
                        class="btn btn-primary"
                        @click="addToCart"
                        :disabled="selectedProduct.stock_quantity === 0"
                    >
                        {{ selectedProduct.stock_quantity === 0 ? 'Out of Stock' : 'Add to cart' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, ref, onMounted } from "vue";
import { productsStore } from "@/stores/products";
import { useRoute, useRouter } from "vue-router";
import AuthorApiService from "@/services/AuthorApiService";
import CategoryApiService from "@/services/CategoryApiService";

const store = productsStore();
const orderQuantity = ref(1);
const router = useRouter();
const route = useRoute();

const selectedProduct = computed(() => {
    return store.products.find((item) => item.book_id === Number(route.params.book_id));
});

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
    authorName.value = await fetchAuthorNameFromId(selectedProduct.value.author_id);
    categoryName.value = await fetchCategoryNameFromId(selectedProduct.value.category_id);
};

const addToCart = () => {
    const productWithQuantity = {
        ...selectedProduct.value,
        quantity: orderQuantity.value,
    };
    store.addToCart(productWithQuantity);
    router.push({ name: 'CartView' });
};

const validateQuantity = () => {
    if (orderQuantity.value < 1) {
        orderQuantity.value = 1;
    } else if (orderQuantity.value > selectedProduct.value.stock_quantity) {
        orderQuantity.value = selectedProduct.value.stock_quantity;
    }
};

onMounted(() => {
    loadAuthorAndCategoryNames();
});
</script>

<style>
.book-cover {
    max-width: 100%;
    max-height: 400px;
    margin-bottom: 16px;
}
</style>
