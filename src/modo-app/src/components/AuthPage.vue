<template>
  <div class="min-h-screen flex items-center justify-center bg-pastel">
    <img src="@/assets/modo.png" alt="Modo Logo" style="width: 10%; height: auto;" />
    <h1 class="text-2xl font-bold mb-4">Welcome to Modo</h1>
    <p>Sign up or log in to continue</p>

    <!-- Error/Status Message -->
    <div v-if="statusMessage" class="status-message" :class="{ success: isSuccess, error: !isSuccess }">
      {{ statusMessage }}
    </div>

    <form @submit.prevent="handleAuth">
      <!-- Login/Registration Fields -->
      <input v-model="email" type="email" placeholder="Email" class="input" />
      <input v-model="password" type="password" placeholder="Password" class="input" />
      <input
        v-if="isRegistering"
        v-model="confirmPassword"
        type="password"
        placeholder="Confirm Password"
        class="input"
      />

      <!-- Additional Registration Fields -->
      <div v-if="isRegistering">
        <input v-model="name" type="text" placeholder="Your Name" class="input" />
        <input v-model="profilePicUrl" type="url" placeholder="Profile Picture URL" class="input" />
        <select v-model="themePreference" class="input">
          <option value="light">Light Theme</option>
          <option value="dark">Dark Theme</option>
        </select>
        <label class="block mt-2">
          <input type="checkbox" v-model="notificationsEnabled" /> Enable Notifications
        </label>
      </div>

      <!-- Submit Button -->
      <button type="submit" class="btn">{{ isRegistering ? "Register" : "Login / Register" }}</button>
    </form>

    <p class="text-xs mt-4 text-center">
      By signing up, you agree to our <a href="#" class="underline">Terms & Conditions</a>.
    </p>
  </div>
</template>

<script>
import { auth, db } from "@/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set } from "firebase/database";

export default {
  name: "AuthPage",
  data() {
    return {
      email: "",
      password: "",
      confirmPassword: "",
      name: "", // New field for user name
      profilePicUrl: "", // New field for profile picture URL
      themePreference: "light", // New field for appearance preference (default: light)
      notificationsEnabled: true, // New field for notifications preference (default: enabled)
      isRegistering: false,
      statusMessage: "", // Holds the status/error message
      isSuccess: false, // Tracks whether the message indicates success or error
    };
  },
  methods: {
    async handleAuth() {
      try {
        // Attempt to log in
        const userCredential = await signInWithEmailAndPassword(auth, this.email, this.password);
        console.log("User logged in:", userCredential.user);
        this.showStatusMessage("Login successful! Redirecting...", true);
        this.$router.push("/dashboard");
      } catch (loginError) {
        this.isRegistering = true;

        // Ensure passwords match during registration
        if (this.isRegistering && this.password !== this.confirmPassword) {
          this.showStatusMessage("Passwords do not match. Please try again.", false);
          return;
        }

        try {
          // Register a new user
          const userCredential = await createUserWithEmailAndPassword(auth, this.email, this.password);
          const user = userCredential.user;

          const uniqueId = Math.floor(100000 + Math.random() * 900000).toString();

          // Initialize the user object in Firebase Realtime Database
          const userRef = ref(db, `users/${user.uid}`);
          await set(userRef, {
            name: this.name || "", // User's name from input
            email: user.email,
            profilePic: this.profilePicUrl || "", // User's profile picture URL from input
            uniqueCode: uniqueId,
            following: {}, // Empty following list
            blacklist: {}, // Empty blacklist
            settings: {
              appearance: { theme: this.themePreference }, // User's theme preference
              notificationsEnabled: this.notificationsEnabled, // User's notification preference
            },
            createdAt: new Date().toISOString(),
          });

          this.showStatusMessage("Registration successful! Redirecting to the dashboard...", true);
          this.$router.push("/dashboard");
        } catch (registerError) {
          this.showStatusMessage(`Registration failed: ${registerError.message}`, false);
        }
      }
    },
    showStatusMessage(message, isSuccess) {
      this.statusMessage = message;
      this.isSuccess = isSuccess;

      // Automatically hide the message after 3 seconds
      setTimeout(() => {
        this.statusMessage = "";
      }, 3000);
    },
  },
};
</script>

<style scoped>
.input {
  display: block;
  width: 100%;
  padding: 0.5rem;
  margin-top: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 0.25rem;
}
.btn {
  background-color: #a3d2ca; /* Pastel green */
  color: #fff;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
}
.btn:hover {
  background-color: #71c0b2; /* Slightly darker green */
}
.status-message {
  margin-bottom: 1rem;
  padding: 0.75rem;
  border-radius: 0.25rem;
}
.status-message.success {
  background-color: #d4edda; /* Light green for success */
  color: #155724; /* Dark green text */
}
.status-message.error {
  background-color: #f8d7da; /* Light red for error */
  color: #721c24; /* Dark red text */
}
</style>