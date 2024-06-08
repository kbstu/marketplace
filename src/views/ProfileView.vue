<template>
	<div class="container mt-4">
		<div class="row justify-content-center">
			<div class="col-12 col-md-6">
				<!-- Email and Password Card -->
				<v-card class="mb-4">
					<v-card-title class="d-flex justify-space-between align-center">
						<span>Email & Password</span>
						<v-btn icon @click="toggleEmailPasswordEditMode">
							<v-icon>{{ emailPasswordEditMode ? 'mdi-close' : 'mdi-pencil' }}</v-icon>
						</v-btn>
					</v-card-title>
					<v-card-text>
						<v-form ref="emailPasswordForm" v-model="emailPasswordValid" @submit.prevent="saveEmailPassword">
							<v-text-field
								v-model="userProfile.email"
								label="Email"
								:disabled="true"
								:rules="[rules.required, rules.email]"
							></v-text-field>
							<v-text-field
								v-model="userProfile.password"
								label="Password"
								:type="showPassword ? 'text' : 'password'"
								:disabled="!emailPasswordEditMode"
								append-icon="mdi-eye"
								@click:append="toggleShowPassword"
								:rules="[rules.required, rules.password]"
							></v-text-field>
							<v-card-actions v-if="emailPasswordEditMode" class="d-flex justify-content-end">
								<v-btn type="submit" color="primary">Save</v-btn>
							</v-card-actions>
						</v-form>
					</v-card-text>
				</v-card>
				<!-- Personal Details Card -->
				<v-card class="mb-4">
					<v-card-title class="d-flex justify-space-between align-center">
						<span>User Profile</span>
						<v-btn icon @click="toggleEditMode">
							<v-icon>{{ editMode ? 'mdi-close' : 'mdi-pencil' }}</v-icon>
						</v-btn>
					</v-card-title>
					<v-card-text>
						<v-form ref="profileForm" v-model="profileValid" @submit.prevent="saveProfile">
							<v-text-field
								v-model="userProfile.first_name"
								label="First Name"
								:disabled="!editMode"
								:rules="[rules.required, rules.maxLength(20)]"
							></v-text-field>
							<v-text-field
								v-model="userProfile.last_name"
								label="Last Name"
								:disabled="!editMode"
								:rules="[rules.required, rules.maxLength(20)]"
							></v-text-field>
							<v-text-field
								v-model="userProfile.date_of_birth"
								label="Date of Birth"
								:disabled="!editMode"
								:rules="[rules.required, rules.date]"
							></v-text-field>
							<v-text-field
								v-model="userProfile.address"
								label="Address"
								:disabled="!editMode"
								:rules="[rules.required]"
							></v-text-field>
							<v-text-field
								v-model="userProfile.phone_number"
								label="Phone Number"
								:disabled="!editMode"
								:rules="[rules.required, rules.phoneNumber]"
							></v-text-field>
							<v-card-actions v-if="editMode" class="d-flex justify-content-end">
								<v-btn type="submit" color="primary">Save</v-btn>
							</v-card-actions>
						</v-form>
					</v-card-text>
				</v-card>
			</div>
		</div>
	</div>
	<v-snackbar v-model="showSnackbar" :timeout="snackbarTimeout" :color="snackbarColor">
		{{ snackbarMessage }}
	</v-snackbar>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/AuthStore.js';

const authStore = useAuthStore();

const userProfile = ref({ ...authStore.user });
const editMode = ref(false);
const emailPasswordEditMode = ref(false);
const profileForm = ref(null);
const emailPasswordForm = ref(null);
const showPassword = ref(false);

const showSnackbar = ref(false);
const snackbarMessage = ref('');
const snackbarTimeout = ref(3000);
const snackbarColor = ref('success');

const emailPasswordValid = ref(false);
const profileValid = ref(false);

const rules = {
	required: value => !!value || 'Required.',
	email: value => /.+@.+\..+/.test(value) || 'Invalid email.',
	maxLength: max => value => (value && value.length <= max) || `Max ${max} characters.`,
	date: value => /^\d{2}\/\d{2}\/\d{4}$/.test(value) || 'Invalid date format (dd/MM/yyyy).',
	phoneNumber: value => /^04\d{8}$/.test(value) || 'Phone number must start with 04 and be 10 digits long.',
	password: value =>
		(value.length >= 8 && value.length <= 20 &&
		/[A-Z]/.test(value) &&
		/[0-9]/.test(value) &&
		/[!@#$]/.test(value)) || 'Password must be 8-20 characters, include at least one uppercase letter, one number, and one special character (!, @, #, $).',
};

const toggleEditMode = () => {
	editMode.value = !editMode.value;
	if (!editMode.value) {
		userProfile.value = { ...authStore.user }; // Reset changes if canceling edit mode
	}
};

const toggleEmailPasswordEditMode = () => {
	emailPasswordEditMode.value = !emailPasswordEditMode.value;
	if (!emailPasswordEditMode.value) {
		userProfile.value = { ...authStore.user }; // Reset changes if canceling edit mode
        showPassword.value = false;
	}
};

const toggleShowPassword = () => {
	showPassword.value = !showPassword.value;
};

const saveProfile = async () => {
	const isValid = await profileForm.value.validate();
	if (isValid.valid) {
        console.log('Profile Valid:', isValid);
		await authStore.updateUserProfile(userProfile.value);
		toggleEditMode();
		snackbarMessage.value = 'Account details updated!';
		snackbarColor.value = 'success';
		showSnackbar.value = true;
	}
};

const saveEmailPassword = async () => {
	const isValid = await emailPasswordForm.value.validate();
	if (isValid.valid) {
        console.log('Email Password Valid:', isValid);
		await authStore.updateUserProfile({ ...userProfile.value, password: userProfile.value.password });
		toggleEmailPasswordEditMode();
		snackbarMessage.value = 'Account details updated!';
		snackbarColor.value = 'success';
		showSnackbar.value = true;
	}
};
</script>
