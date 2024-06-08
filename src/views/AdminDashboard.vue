<template>
    <div>
        <v-app>
            <v-app-bar app>
                <v-toolbar-title>Admin Dashboard</v-toolbar-title>
                <v-spacer></v-spacer>
                <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
            </v-app-bar>
            <v-navigation-drawer v-model="drawer" app temporary>
                <v-list>
                    <v-list-item-group v-model="selectedTable" color="primary">
                        <v-list-item v-for="table in tables" :key="table" @click="selectTable(table)">
                            <v-list-item-content>
                                <v-list-item-title>{{ table }}</v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                    </v-list-item-group>
                </v-list>
            </v-navigation-drawer>
            <v-main>
                <div class="container-fluid">
                    <div class="row mb-2">
                        <div class="col-12 d-flex justify-content-end">
                            <button v-if="['Authors', 'Books', 'Categories'].includes(selectedTable)" class="btn btn-primary" @click="showCreateDialog = true">
                                Create {{ singularizeTable(selectedTable) }}
                            </button>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-12">
                            <v-data-table
                                :headers="headers"
                                :items="items"
                                item-key="id"
                                class="elevation-1"
                            >
                                <template v-slot:[`item.actions`]="{ item }">
                                    <v-icon small @click="editItem(item)">mdi-pencil</v-icon>
                                    <v-icon small @click="confirmDelete(item)">mdi-delete</v-icon>
                                </template>
                            </v-data-table>
                        </div>
                    </div>
                </div>

                <!-- Edit Dialog -->
                <v-dialog v-model="showEditDialog" max-width="500px">
                    <v-card>
                        <v-card-title>Edit {{ selectedTable.slice(0, -1) }}</v-card-title>
                        <v-card-text>
                            <v-form @submit.prevent="updateItem">
                                <v-container>
                                    <v-row v-for="(value, key) in editedItem" :key="key">
                                        <v-col>
                                            <v-text-field
                                                v-if="key !== primaryKey"
                                                v-model="editedItem[key]"
                                                :label="key"
                                                :disabled="key === primaryKey"
                                                required
                                            ></v-text-field>
                                            <v-text-field
                                                v-else
                                                v-model="editedItem[key]"
                                                :label="key"
                                                disabled
                                            ></v-text-field>
                                        </v-col>
                                    </v-row>
                                </v-container>
                            </v-form>
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="primary" @click="updateItem">Save</v-btn>
                            <v-btn @click="showEditDialog = false">Cancel</v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>

                <!-- Delete Dialog -->
                <v-dialog v-model="showDeleteDialog" max-width="500px">
                    <v-card>
                        <v-card-title>Confirm Delete</v-card-title>
                        <v-card-text>
                            Would you like to delete {{ selectedTable.slice(0, -1) }} with ID {{ itemToDelete.id }}?
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="primary" @click="deleteItem">Confirm</v-btn>
                            <v-btn @click="showDeleteDialog = false">Cancel</v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>

                <!-- Create Dialog -->
                <v-dialog v-model="showCreateDialog" max-width="500px">
                    <v-card>
                        <v-card-title>Create {{ singularizeTable(selectedTable) }}</v-card-title>
                        <v-card-text>
                            <v-form @submit.prevent="createItem">
                                <v-container>
                                    <v-row v-if="selectedTable === 'Authors'">
                                        <v-col>
                                            <v-text-field v-model="newItem.name" label="Name" :rules="[rules.required, rules.maxLength(30)]" required></v-text-field>
                                            <v-textarea v-model="newItem.biography" label="Biography" :rules="[rules.required, rules.maxLength(200)]" required></v-textarea>
                                            <v-text-field v-model="newItem.date_of_birth" label="Date of Birth" :rules="[rules.required, rules.dateFormat]" required></v-text-field>
                                            <v-text-field v-model="newItem.nationality" label="Nationality" :rules="[rules.required, rules.maxLength(30)]" required></v-text-field>
                                            <v-text-field v-model="newItem.photo_url" label="Photo URL" :rules="[rules.required, rules.url]" required></v-text-field>
                                        </v-col>
                                    </v-row>
                                    <v-row v-else-if="selectedTable === 'Categories'">
                                        <v-col>
                                            <v-text-field v-model="newItem.name" label="Name" :rules="[rules.required, rules.maxLength(20)]" required></v-text-field>
                                            <v-textarea v-model="newItem.description" label="Description" :rules="[rules.required, rules.maxLength(200)]" required></v-textarea>
                                        </v-col>
                                    </v-row>
                                    <v-row v-else-if="selectedTable === 'Books'">
                                        <v-col>
                                            <v-text-field v-model="newItem.title" label="Title" :rules="[rules.required, rules.maxLength(50)]" required></v-text-field>
                                            <v-text-field v-model="newItem.isbn" label="ISBN" :rules="[rules.required, rules.isbn]" required></v-text-field>
                                            <v-text-field v-model="newItem.publication_date" label="Publication Date" :rules="[rules.required, rules.dateFormat]" required></v-text-field>
                                            <v-text-field v-model="newItem.price" label="Price" :rules="[rules.required, rules.number]" required></v-text-field>
                                            <v-textarea v-model="newItem.description" label="Description" :rules="[rules.required, rules.maxLength(300)]" required></v-textarea>
                                            <v-text-field v-model="newItem.publisher" label="Publisher" :rules="[rules.required, rules.maxLength(30)]" required></v-text-field>
                                            <v-text-field v-model="newItem.page_count" label="Page Count" :rules="[rules.required, rules.pageCount]" required></v-text-field>
                                            <v-text-field v-model="newItem.language" label="Language" :rules="[rules.required, rules.maxLength(20)]" required></v-text-field>
                                            <v-select v-model="newItem.format" :items="['Hardcover', 'Paperback', 'E-book', 'Audiobook']" label="Format" :rules="[rules.required]" required></v-select>
                                            <v-text-field v-model="newItem.stock_quantity" label="Stock Quantity" :rules="[rules.required, rules.number]" required></v-text-field>
                                            <v-text-field v-model="newItem.cover_image_url" label="Cover Image URL" :rules="[rules.required, rules.url]" required></v-text-field>
                                            <v-text-field v-model="newItem.rating" label="Rating" :rules="[rules.required, rules.rating]" required></v-text-field>
                                            <v-autocomplete
                                                chips
                                                v-model="newItem.author_id"
                                                :items="authorOptions"
                                                item-text="title"
                                                item-value="id"
                                                label="Author"
                                                required
                                            ></v-autocomplete>
                                            <v-autocomplete
                                                chips
                                                v-model="newItem.category_id"
                                                :items="categoryOptions"
                                                item-text="title"
                                                item-value="id"
                                                label="Category"
                                                required
                                            ></v-autocomplete>
                                        </v-col>
                                    </v-row>
                                </v-container>
                            </v-form>
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="primary" @click="createItem">Create</v-btn>
                            <v-btn @click="showCreateDialog = false">Cancel</v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>
            </v-main>
        </v-app>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import BookApiService from '@/services/BookApiService';
import UserApiService from '@/services/UserApiService';
import AuthorApiService from '@/services/AuthorApiService';
import CategoryApiService from '@/services/CategoryApiService';
import OrderApiService from '@/services/OrderApiService';
import OrderItemApiService from '@/services/OrderItemApiService';

const drawer = ref(false);
const tables = ['Authors', 'Books', 'Categories', 'OrderItems', 'Orders', 'Users'];
const selectedTable = ref('Books');
const items = ref([]);
const headers = ref([]);
const showEditDialog = ref(false);
const showDeleteDialog = ref(false);
const showCreateDialog = ref(false);
const editedItem = ref({});
const itemToDelete = ref({});
const newItem = ref({});
const primaryKey = ref('');

const authorOptions = ref([]);
const categoryOptions = ref([]);

const singularizeTable = (table) => {
    if (table === 'Categories') {
        return 'Category';
    }
    return table.slice(0, -1);
};

const selectTable = async (table) => {
    selectedTable.value = table;
    await fetchTableData();
};

const fetchTableData = async () => {
    let response;
    try {
        switch (selectedTable.value) {
            case 'Books':
                response = await BookApiService.getBooks();
                break;
            case 'Users':
                response = await UserApiService.getUsers();
                break;
            case 'Authors':
                response = await AuthorApiService.getAuthors();
                break;
            case 'Categories':
                response = await CategoryApiService.getCategories();
                break;
            case 'Orders':
                response = await OrderApiService.getOrders();
                break;
            case 'OrderItems':
                response = await OrderItemApiService.getOrderItems();
                break;
        }

        if (response && response.length > 0) {
            headers.value = Object.keys(response[0]).map(key => ({ title: key, value: key }));
            headers.value.push({ title: 'Actions', value: 'actions', sortable: false });
            items.value = response;
            primaryKey.value = headers.value[0].value;
        } else {
            console.warn('No data returned from API for table:', selectedTable.value);
            items.value = [];
            headers.value = [];
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        items.value = [];
        headers.value = [];
    }
};

const editItem = (item) => {
    editedItem.value = { ...item };
    showEditDialog.value = true;
};

const updateItem = async () => {
    try {
        switch (selectedTable.value) {
            case 'Books':
                await BookApiService.updateBook(editedItem.value[primaryKey.value], editedItem.value);
                break;
            case 'Users':
                await UserApiService.updateUser(editedItem.value[primaryKey.value], editedItem.value);
                break;
            case 'Authors':
                await AuthorApiService.updateAuthor(editedItem.value[primaryKey.value], editedItem.value);
                break;
            case 'Categories':
                await CategoryApiService.updateCategory(editedItem.value[primaryKey.value], editedItem.value);
                break;
            case 'Orders':
                await OrderApiService.updateOrder(editedItem.value[primaryKey.value], editedItem.value);
                break;
            case 'OrderItems':
                await OrderItemApiService.updateOrderItem(editedItem.value[primaryKey.value], editedItem.value);
                break;
        }
        showEditDialog.value = false;
        await fetchTableData();
    } catch (error) {
        console.error('Error updating item:', error);
    }
};

const confirmDelete = (item) => {
    itemToDelete.value = item;
    showDeleteDialog.value = true;
};

const deleteItem = async () => {
    try {
        switch (selectedTable.value) {
            case 'Books':
                await BookApiService.deleteBook(itemToDelete.value[primaryKey.value]);
                break;
            case 'Users':
                await UserApiService.deleteUser(itemToDelete.value[primaryKey.value]);
                break;
            case 'Authors':
                await AuthorApiService.deleteAuthor(itemToDelete.value[primaryKey.value]);
                break;
            case 'Categories':
                await CategoryApiService.deleteCategory(itemToDelete.value[primaryKey.value]);
                break;
            case 'Orders':
                await OrderApiService.deleteOrder(itemToDelete.value[primaryKey.value]);
                break;
            case 'OrderItems':
                await OrderItemApiService.deleteOrderItem(itemToDelete.value[primaryKey.value]);
                break;
        }
        showDeleteDialog.value = false;
        await fetchTableData();
    } catch (error) {
        console.error('Error deleting item:', error);
    }
};

const createItem = async () => {
    try {
        switch (selectedTable.value) {
            case 'Books':
                await BookApiService.createBook(newItem.value);
                break;
            case 'Categories':
                await CategoryApiService.createCategory(newItem.value);
                break;
            case 'Authors':
                await AuthorApiService.createAuthor(newItem.value);
                break;
        }
        showCreateDialog.value = false;
        await fetchTableData();
    } catch (error) {
        console.error('Error creating item:', error);
    }
};

const fetchAuthorOptions = async () => {
    try {
        const response = await AuthorApiService.getAuthors();
        authorOptions.value = response.map(author => ({ title: author.name, id: author.author_id }));
    } catch (error) {
        console.error('Error fetching author options:', error);
    }
};

const fetchCategoryOptions = async () => {
    try {
        const response = await CategoryApiService.getCategories();
        categoryOptions.value = response.map(category => ({ title: category.name, id: category.category_id }));
    } catch (error) {
        console.error('Error fetching category options:', error);
    }
};

// Validation rules
const rules = {
    required: value => !!value || 'Required.',
    maxLength: length => value => (value && value.length <= length) || `Max ${length} characters.`,
    dateFormat: value => /^\d{2}\/\d{2}\/\d{4}$/.test(value) || 'Must be in dd/mm/yyyy format.',
    number: value => !isNaN(parseFloat(value)) && isFinite(value) || 'Must be a number.',
    pageCount: value => (value && value <= 10000) || 'Must be less than 10,000.',
    isbn: value => /^\d{13}$/.test(value) || 'Must be 13 digits.',
    rating: value => (value && value >= 0 && value <= 10) || 'Must be between 0 and 10.',
    url: value => /^(ftp|http|https):\/\/[^ "]+$/.test(value) || 'Must be a valid URL.'
};

// Fetch initial table data on mounted
onMounted(async () => {
    await fetchTableData();
    await fetchAuthorOptions();
    await fetchCategoryOptions();
});

watch(selectedTable, async () => {
    // Clear newItem when switching tables
    newItem.value = {};
});
</script>

<style>
.v-navigation-drawer {
    position: fixed;
    height: 100%;
}
</style>
