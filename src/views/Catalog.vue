<template>
    <div class="products-list container">
        <div class="row justify-content-end align-items-center mb-2">
            <div class="col-auto d-flex justify-end" style="flex: 1;">
                <div class="input-group">
                    <span class="input-group-text"><i class="mdi mdi-magnify"></i></span>
                    <input
                        type="text"
                        class="form-control"
                        v-model="search"
                        placeholder="Search"
                        style="max-width: 300px;"
                    />
                </div>
            </div>
            <div class="col-auto d-flex align-items-center">
                <div v-if="selectedAuthor || selectedCategory || selectedSort" class="selected-filters d-flex align-items-center">
                    <template v-if="selectedAuthor">
                        <div class="badge bg-secondary me-2">
                            Author: {{ getAuthorName(selectedAuthor) }}
                            <button type="button" class="btn-close btn-sm ms-1" aria-label="Close" @click="clearFilter('author')"></button>
                        </div>
                    </template>
                    <template v-if="selectedCategory">
                        <div class="badge bg-secondary me-2">
                            Category: {{ getCategoryName(selectedCategory) }}
                            <button type="button" class="btn-close btn-sm ms-1" aria-label="Close" @click="clearFilter('category')"></button>
                        </div>
                    </template>
                    <template v-if="selectedSort">
                        <div class="badge bg-secondary me-2">
                            Sort: {{ getSortName(selectedSort) }}
                            <button type="button" class="btn-close btn-sm ms-1" aria-label="Close" @click="clearFilter('sort')"></button>
                        </div>
                    </template>
                </div>
                <button
                    class="btn btn-secondary mr-2"
                    @click="showFilterDialog = true"
                    style="height: 55px;"
                >
                    Filter
                </button>
            </div>
        </div>
        <div class="row">
            <div v-if="filteredProducts.length === 0" class="text-center">
                <p>No products found.</p>
            </div>
            <div v-else
                v-for="product in filteredProducts"
                :key="product.book_id"
                class="col-12 col-md-6 col-lg-4 mb-3"
            >
                <product-item
                    :product-data="product"
                    @item-clicked="goToProductPage"
                />
            </div>
        </div>

        <!-- Filter Dialog -->
        <v-dialog v-model="showFilterDialog" max-width="600px">
            <v-card>
                <v-card-title>Filter Products</v-card-title>
                <v-card-text>
                    <v-container>
                        <v-row>
                            <v-col>
                                <v-autocomplete
                                    v-model="tempSelectedAuthor"
                                    :items="authorOptions"
                                    label="Author"
                                    item-text="title"
                                    item-value="value"
                                    clearable
                                    solo
                                ></v-autocomplete>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col>
                                <v-select
                                    v-model="tempSelectedCategory"
                                    :items="categoryOptions"
                                    label="Category"
                                    item-text="title"
                                    item-value="value"
                                    clearable
                                    solo
                                ></v-select>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col>
                                <v-select
                                    v-model="tempSelectedSort"
                                    :items="sortOptions"
                                    label="Sort By"
                                    item-text="text"
                                    item-value="value"
                                    clearable
                                ></v-select>
                            </v-col>
                        </v-row>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" @click="applyFilters" variant="elevated">Apply</v-btn>
                    <v-btn @click="showFilterDialog = false" variant="elevated">Cancel</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>


<script>
import { defineComponent, ref, computed, onMounted } from "vue";
import { productsStore } from "@/stores/products";
import { useRouter } from "vue-router";
import ProductItem from "@/components/ProductItem.vue";
import AuthorApiService from "@/services/AuthorApiService";
import CategoryApiService from "@/services/CategoryApiService";

export default defineComponent({
    name: 'CatalogView',
    components: {
        ProductItem
    },
    setup() {
        const store = productsStore();
        const router = useRouter();
        const search = ref('');
        const showFilterDialog = ref(false);
        const selectedAuthor = ref(null);
        const selectedCategory = ref(null);
        const selectedSort = ref(null);
        const tempSelectedAuthor = ref(null);
        const tempSelectedCategory = ref(null);
        const tempSelectedSort = ref(null);
        const authorOptions = ref([]);
        const categoryOptions = ref([]);
        const sortOptions = [
            { title: 'Price Ascending', value: 'priceAsc' },
            { title: 'Price Descending', value: 'priceDesc' },
            { title: 'Name Ascending', value: 'nameAsc' },
            { title: 'Name Descending', value: 'nameDesc' }
        ];

        const filteredProducts = computed(() => {
            let filtered = store.products;

            if (search.value) {
                filtered = filtered.filter(product => 
                    (product.title?.toLowerCase().includes(search.value.toLowerCase()) || '') ||
                    (product.description?.toLowerCase().includes(search.value.toLowerCase()) || '')
                );
            }

            if (selectedAuthor.value) {
                filtered = filtered.filter(product => product.author_id === selectedAuthor.value);
            }

            if (selectedCategory.value) {
                filtered = filtered.filter(product => product.category_id === selectedCategory.value);
            }

            switch (selectedSort.value) {
                case 'priceAsc':
                    filtered = filtered.sort((a, b) => a.price - b.price);
                    break;
                case 'priceDesc':
                    filtered = filtered.sort((a, b) => b.price - a.price);
                    break;
                case 'nameAsc':
                    filtered = filtered.sort((a, b) => a.title.localeCompare(b.title));
                    break;
                case 'nameDesc':
                    filtered = filtered.sort((a, b) => b.title.localeCompare(a.title));
                    break;
            }

            return filtered;
        });

        const goToProductPage = (book_id) => {
            router.push({ name: 'ProductDetail', params: { book_id } });
        };

        const applyFilters = () => {
            selectedAuthor.value = tempSelectedAuthor.value;
            selectedCategory.value = tempSelectedCategory.value;
            selectedSort.value = tempSelectedSort.value;
            showFilterDialog.value = false;
        };

        const clearFilter = (filterType) => {
            if (filterType === 'author') {
                selectedAuthor.value = null;
                tempSelectedAuthor.value = null;
            } else if (filterType === 'category') {
                selectedCategory.value = null;
                tempSelectedCategory.value = null;
            } else if (filterType === 'sort') {
                selectedSort.value = null;
                tempSelectedSort.value = null;
            }
        };

        const fetchAuthorOptions = async () => {
            try {
                const response = await AuthorApiService.getAuthors();
                authorOptions.value = response.map(author => ({ title: author.name, value: author.author_id }));
            } catch (error) {
                console.error('Error fetching author options:', error);
            }
        };

        const fetchCategoryOptions = async () => {
            try {
                const response = await CategoryApiService.getCategories();
                categoryOptions.value = response.map(category => ({ title: category.name, value: category.category_id }));
            } catch (error) {
                console.error('Error fetching category options:', error);
            }
        };

        const getAuthorName = (authorId) => {
            const author = authorOptions.value.find(author => author.value === authorId);
            return author ? author.title : 'Unknown Author';
        };

        const getCategoryName = (categoryId) => {
            const category = categoryOptions.value.find(category => category.value === categoryId);
            return category ? category.title : 'Unknown Category';
        };

        const getSortName = (sortValue) => {
            const sortOption = sortOptions.find(option => option.value === sortValue);
            return sortOption ? sortOption.title : 'Unknown Sort';
        };

        onMounted(async () => {
            await store.fetchProductsFromDB();
            await fetchAuthorOptions();
            await fetchCategoryOptions();
        });

        return {
            store,
            router,
            search,
            showFilterDialog,
            selectedAuthor,
            selectedCategory,
            selectedSort,
            tempSelectedAuthor,
            tempSelectedCategory,
            tempSelectedSort,
            authorOptions,
            categoryOptions,
            sortOptions,
            filteredProducts,
            goToProductPage,
            applyFilters,
            clearFilter,
            getAuthorName,
            getCategoryName,
            getSortName
        };
    }
});
</script>


<style scoped>
.products-list {
    padding: 16px;
}

.selected-filters {
    flex: 1;
}

.selected-filters .badge {
    display: flex;
    align-items: center;
    margin-right: 8px;
}

.selected-filters .btn-close {
    margin-left: 4px;
}
</style>
