<template>
    <div class="card mb-3" @click="navigateToBookDetails()">
        <div class="card-body d-flex align-items-center">
            <img :src="book.cover_image_url" class="img-thumbnail" style="width: 80px; height: 120px;" alt="Book cover">
            <div class="ml-3">
                <p class="mb-1"><strong>Title:</strong> {{ book.title }}</p>
                <p class="mb-1"><strong>Author:</strong> {{ book.author_name }}</p>
                <p class="mb-1"><strong>Unit Price:</strong> ${{ item.unit_price }}</p>
                <p class="mb-1"><strong>Quantity:</strong> {{ item.quantity }}</p>
                <p class="mb-1"><strong>Total Price:</strong> ${{ item.total_price }}</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { defineProps } from 'vue';
import BookApiService from '@/services/BookApiService';
import AuthorApiService from '@/services/AuthorApiService';
import { useRouter } from 'vue-router';

const props = defineProps({
    item: {
        type: Object,
        required: true,
    }
});

const router = useRouter();

const book = ref({});

const fetchBook = async () => {
    try {
        const response = await BookApiService.getBook(props.item.book_id);
        book.value = response;
    } catch (error) {
        console.error('Error fetching book:', error);
    }
};

const fetchAuthor = async () => {
    try {
        const response = await AuthorApiService.getAuthorById(book.value.author_id);
        book.value.author_name = response.name;
    } catch (error) {
        console.error('Error fetching author:', error);
    }
}

const navigateToBookDetails = () => {
    const book_id = book.value.book_id;
    router.push({ name: 'ProductDetail', params: { book_id } });
}

onMounted( async () => {
    await fetchBook();
    await fetchAuthor();
});
</script>
