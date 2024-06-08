<template>
    <header>
        <nav class="navbar navbar-expand-lg navbar-light bg-light">
            <div class="container-fluid">
                <a class="navbar-brand" @click="navigateToHome" style="cursor:pointer">Marketplace</a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav gap-3 ms-auto mb-2 mb-lg-0">
                        <template v-if="!authStore.user">
                            <li class="nav-item">
                                <button class="btn btn-primary me-2" @click="showLoginDialog = true">Login</button>
                            </li>
                        </template>
                        <template v-else>
                            <li class="nav-item">
                                <button class="btn btn-outline-secondary me-2" @click="showAccountDialog = true">
                                    <i class="mdi mdi-account"></i>
									<span class="ms-2">Account</span>
                                </button>
                            </li>
                        </template>
                        <li class="nav-item">
                            <button class="btn btn-outline-secondary position-relative" @click="navigateToCart">
                                <i class="mdi mdi-cart"></i>
                                <span v-if="cartStore.cart.length" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                    {{ cartStore.cart.length }}
                                </span>
                                <span class="ms-2">Cart</span>
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>

        <v-dialog v-model="showLoginDialog" max-width="500">
            <v-card>
                <v-card-title>Login</v-card-title>
                <v-card-text>
                    <v-form @submit.prevent="login">
                        <v-text-field v-model="email" label="Email" required></v-text-field>
                        <v-text-field
                            v-model="password"
                            label="Password"
                            type="password"
                            required
                        ></v-text-field>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn @click="showSignupDialog = true" color="secondary" variant="elevated">
                                Sign Up
                            </v-btn>
                            <v-btn type="submit" color="primary" variant="elevated">Login</v-btn>
                        </v-card-actions>
                    </v-form>
                </v-card-text>
            </v-card>
        </v-dialog>

        <v-dialog v-model="showSignupDialog" max-width="500">
            <v-card>
                <v-card-title>Sign Up</v-card-title>
                <v-card-text>
                    <v-form ref="signupForm" @submit.prevent="validateAndProceedSignup">
                        <v-text-field
                            v-model="signupEmail"
                            label="Email"
                            required
                            :rules="[rules.required, rules.email]"
                        ></v-text-field>
                        <v-text-field
                            v-model="signupPassword"
                            label="Password"
                            type="password"
                            required
                            :rules="[rules.required, rules.password]"
                        ></v-text-field>
                        <v-text-field
                            v-model="signupConfirmPassword"
                            label="Confirm Password"
                            type="password"
                            required
                            :rules="[rules.required, rules.confirmPassword]"
                        ></v-text-field>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn type="submit" color="primary" variant="elevated">Next</v-btn>
                        </v-card-actions>
                    </v-form>
                </v-card-text>
            </v-card>
        </v-dialog>

        <v-dialog v-model="showAdditionalDetailsDialog" max-width="500">
            <v-card>
                <v-card-title>Additional Details</v-card-title>
                <v-card-text>
                    <v-form ref="additionalDetailsForm" @submit.prevent="signup">
                        <v-text-field
                            v-model="firstName"
                            label="First Name"
                            required
                            :rules="[rules.required, rules.maxLength(20)]"
                        ></v-text-field>
                        <v-text-field
                            v-model="lastName"
                            label="Last Name"
                            required
                            :rules="[rules.required, rules.maxLength(20)]"
                        ></v-text-field>
                        <v-text-field
                            v-model="dateOfBirth"
                            label="Date of Birth"
                            required
                            :rules="[rules.required, rules.date]"
                        ></v-text-field>
                        <v-text-field
                            v-model="address"
                            label="Address"
                            required
                            :rules="[rules.required]"
                        ></v-text-field>
                        <v-text-field
                            v-model="phoneNumber"
                            label="Phone Number"
                            required
                            :rules="[rules.required, rules.phoneNumber]"
                        ></v-text-field>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn type="submit" color="primary" variant="elevated">Submit</v-btn>
                        </v-card-actions>
                    </v-form>
                </v-card-text>
            </v-card>
        </v-dialog>

        <v-dialog v-model="showAccountDialog" max-width="500">
            <v-card>
                <v-card-title>Account</v-card-title>
                <v-card-text>
                    <v-list>
                        <v-list-item @click="navigateToProfile">
                            <v-list-item-title>Profile</v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="navigateToOrders">
                            <v-list-item-title>Orders</v-list-item-title>
                        </v-list-item>
                        <v-list-item v-if="authStore.user && authStore.user.role === 'admin'" @click="navigateToDashboard">
                            <v-list-item-title>Admin Dashboard</v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="logout">
                            <v-list-item-title>Logout</v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-card-text>
            </v-card>
        </v-dialog>
    </header>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/AuthStore.js';
import { productsStore } from '@/stores/products';

const router = useRouter();
const authStore = useAuthStore();
const cartStore = productsStore();

const showLoginDialog = ref(false);
const showSignupDialog = ref(false);
const showAdditionalDetailsDialog = ref(false);
const showAccountDialog = ref(false);

const email = ref('');
const password = ref('');

const signupEmail = ref('');
const signupPassword = ref('');
const signupConfirmPassword = ref('');

const firstName = ref('');
const lastName = ref('');
const dateOfBirth = ref('');
const address = ref('');
const phoneNumber = ref('');

const signupForm = ref(null);
const additionalDetailsForm = ref(null);

const rules = {
	// no special characters for non-email form input
	required: value => !!value || 'Required.',
	email: value => /.+@.+\..+/.test(value) || 'Invalid email.',
	password: value =>
		(value.length >= 8 && value.length <= 20 &&
		/[A-Z]/.test(value) &&
		/[0-9]/.test(value) &&
		/[!@#$]/.test(value)) || 'Password must be 8-20 characters, include at least one uppercase letter, one number, and one special character (!, @, #, $).',
	confirmPassword: value => value === signupPassword.value || 'Passwords do not match.',
	maxLength: max => value => (value && value.length <= max) || `Max ${max} characters.`,
	date: value => /^\d{2}\/\d{2}\/\d{4}$/.test(value) || 'Invalid date format (dd/MM/yyyy).',
	phoneNumber: value => /^04\d{8}$/.test(value) || 'Phone number must start with 04 and be 10 digits long.',
};

const login = async () => {
	await authStore.login(email.value, password.value);
	showLoginDialog.value = false;
};

const validateAndProceedSignup = () => {
	const valid = signupForm.value.validate();
	if (valid) {
		showSignupDialog.value = false;
		showAdditionalDetailsDialog.value = true;
	}
};

const signup = async () => {
	const valid = additionalDetailsForm.value.validate();
	if (valid) {
		await authStore.signup({
			email: signupEmail.value,
			password: signupPassword.value,
			firstName: firstName.value,
			lastName: lastName.value,
			dateOfBirth: dateOfBirth.value,
			address: address.value,
			phoneNumber: phoneNumber.value,
			role: 'user',
		});
		showAdditionalDetailsDialog.value = false;
	}
};

const navigateToHome = () => {
    router.push({ name: 'Catalog' });
}
const navigateToProfile = () => {
	router.push({ name: 'ProfileView' });
	showAccountDialog.value = false; // Close the dialog after navigation
};

const navigateToOrders = () => {
	router.push({ name: 'OrdersView'});
	showAccountDialog.value = false; // Close the dialog after navigation
}

const navigateToDashboard = () => {
	router.push({ name: 'AdminDashboard' });
	showAccountDialog.value = false; // Close the dialog after navigation
};

const logout = () => {
	authStore.logout();
	showAccountDialog.value = false; // Close the dialog after logout
	router.push({ name: 'Catalog' });
	// Clear Cart
	cartStore.cart = [];
};

const navigateToCart = () => {
    router.push({ name: 'CartView' });
}

watch(() => authStore.user, (newUser) => {
	if (newUser) {
		console.log('User logged in:', newUser.email);
	} else {
		console.log('User logged out');
	}
});

</script>

<style>
.cart-count {
    background-color: red;
    color: white;
    border-radius: 50%;
    padding: 1px 3px;
    font-size: 0.7rem;
    position: absolute;
    top: 8px;
    right: 8px;
}
</style>
