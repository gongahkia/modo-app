<template>
  <div class="min-h-screen flex items-center justify-center bg-pastel">
    <img src="@/assets/modo.png" alt="Modo Logo" style="width: 10%; height: auto;" />
    <h1 class="text-2xl font-bold mb-4">Welcome to Modo</h1>
    <p>Sign up or log in to continue</p>
    <form @submit.prevent="handleAuth">
      <input v-model="email" type="email" placeholder="Email" class="input" />
      <input v-model="password" type="password" placeholder="Password" class="input" />
      <input
        v-if="isRegistering"
        v-model="confirmPassword"
        type="password"
        placeholder="Confirm Password"
        class="input"
      />
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
      isRegistering: false, 
    };
  },
  methods: {
    async handleAuth() {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, this.email, this.password);
        console.log(userCredential);
        this.$router.push("/dashboard");
      } catch (loginError) {
        this.isRegistering = true;
        if (this.isRegistering && this.password !== this.confirmPassword) {
          console.log("Passwords do not match. Please try again.");
          return;
        }

        try {
          const userCredential = await createUserWithEmailAndPassword(auth, this.email, this.password);
          console.log(userCredential);
          const user = userCredential.user;
          const uniqueId = Math.floor(100000 + Math.random() * 900000).toString();
          const defaultSettings = {
            appearance: {
              theme: "light", 
            },
            notificationsEnabled: true, 
          };
          const userRef = ref(db, `users/${user.uid}`);
          await set(userRef, {
            name: "", 
            email: user.email,
            profilePic: "", 
            uniqueCode: uniqueId,
            following: {}, 
            blacklist: {}, 
            settings: defaultSettings,
            createdAt: new Date().toISOString(), 
          });
          alert("Registration successful! Redirecting to the dashboard...");
          this.$router.push("/dashboard");
        } catch (registerError) {
          console.error("Registration failed:", registerError.message);
          alert("Registration failed. Please try again.");
        }
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