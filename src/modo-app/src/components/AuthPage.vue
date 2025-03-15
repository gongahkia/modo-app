<template>
  <div class="min-h-screen flex items-center justify-center bg-pastel">
    <img src="@/assets/modo.png" alt="Modo Logo" style="width: 10%; height: auto;" />
    <h1 class="text-2xl font-bold mb-4">Welcome to Modo</h1>
    <p>Sign up or log in to continue</p>
    <form @submit.prevent="handleAuth">
      <input v-model="email" type="email" placeholder="Email" class="input" />
      <input v-model="password" type="password" placeholder="Password" class="input" />
      <button type="submit" class="btn">Login / Register</button>
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
    };
  },
  methods: {
    async handleAuth() {
      try {
        // Attempt to log in
        await signInWithEmailAndPassword(auth, this.email, this.password);
        this.$router.push("/dashboard");
      } catch (error) {
        // If login fails, register a new user
        const userCredential = await createUserWithEmailAndPassword(auth, this.email, this.password);
        const user = userCredential.user;

        // Generate a random 6-digit ID
        const uniqueId = Math.floor(100000 + Math.random() * 900000).toString();

        // Default settings for new users
        const defaultSettings = {
          appearance: {
            theme: "light", // Default theme
          },
          notificationsEnabled: true, // Enable notifications by default
        };

        // Initialize the user object in Firebase Realtime Database
        const userRef = ref(db, `users/${user.uid}`);
        await set(userRef, {
          name: "", // Placeholder for name (can be updated later in settings)
          email: user.email,
          profilePic: "", // Placeholder for profile picture URL
          uniqueCode: uniqueId,
          following: {}, // Empty following list
          blacklist: {}, // Empty blacklist
          settings: defaultSettings,
          createdAt: new Date().toISOString(), // Store creation timestamp in ISO8601 format
        });

        this.$router.push("/dashboard");
      }
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
</style>