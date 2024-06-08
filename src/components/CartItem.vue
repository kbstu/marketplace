<template>
    <div class="container mt-2 mb-2 p-2 border rounded">
        <div class="row align-items-center">
            <div class="col-2 col-xs-2 col-sm-2 col-md-2 mb-2 mb-sm-0">
                <img :src="localItem.cover_image_url" class="img-fluid rounded" />
            </div>
            <div class="col-10 col-xs-10 col-sm-10 col-md-10">
                <div class="row mb-2">
                    <div class="col-12 col-md-6">
                        <h5>{{ localItem.title }}</h5>
                        <p>Author: {{ authorName }}</p>
                        <p>Category: {{ categoryName }}</p>
                    </div>
                    <div class="col-12 col-md-6 text-md-right">
                        <p>Price: ${{ localItem.price }}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <input
                                type="number"
                                v-model="localItem.quantity"
                                min="1"
                                :max="localItem.stock_quantity"
                                class="form-control w-50"
                                @change="updateCartItem"
                                @blur="validateQuantity"
                            />
                            <button @click="removeFromCart" class="btn btn-danger ml-2">
                                Remove
                            </button>
                        </div>
                        <p class="mt-2">Subtotal: ${{ localItem.price * localItem.quantity }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { defineComponent, ref, watch, onMounted } from 'vue';
import AuthorApiService from "@/services/AuthorApiService";
import CategoryApiService from "@/services/CategoryApiService";

export default defineComponent({
    name: 'CartItem',
    props: {
        item: {
            type: Object,
            required: true,
        }
    },
    emits: ['remove', 'update'],
    setup(props, { emit }) {
        const localItem = ref({ ...props.item });
        const authorName = ref('');
        const categoryName = ref('');

        watch(() => props.item, (newVal) => {
            localItem.value = { ...newVal };
            fetchAuthorAndCategory();
        });

        const fetchAuthorAndCategory = async () => {
            try {
                const authorResponse = await AuthorApiService.getAuthorById(localItem.value.author_id);
                authorName.value = authorResponse.name;

                const categoryResponse = await CategoryApiService.getCategoryById(localItem.value.category_id);
                categoryName.value = categoryResponse.name;
            } catch (error) {
                console.error('Error fetching author or category:', error);
            }
        };

        const removeFromCart = () => {
            emit('remove', localItem.value.book_id);
        };

        const updateCartItem = () => {
            emit('update', localItem.value);
        };

        const validateQuantity = () => {
            if (localItem.value.quantity < 1) {
                localItem.value.quantity = 1;
            } else if (localItem.value.quantity > localItem.value.stock_quantity) {
                localItem.value.quantity = localItem.value.stock_quantity;
            }
            updateCartItem();
        };

        onMounted(() => {
            fetchAuthorAndCategory();
        });

        return {
            localItem,
            authorName,
            categoryName,
            removeFromCart,
            updateCartItem,
            validateQuantity
        };
    }
});
</script>
