<template>
  <nav class="bg-white shadow p-4 flex justify-between items-center">
    <!-- Navigation Links -->
    <div class="flex space-x-4">
      <button @click="$router.push('/dashboard')" class="btn">Dashboard</button>
      <button @click="$router.push('/settings')" class="btn">Settings</button>
    </div>

    <!-- Logout Button -->
    <div>
      <button @click="logout" class="btn-red">Logout</button>
    </div>

    <!-- Status Message -->
    <div v-if="statusMessage" class="status-message" :class="{ success: isSuccess, error: !isSuccess }">
      {{ statusMessage }}
    </div>
  </nav>
</template>

<script>
import { auth } from "@/firebase"; // Import Firebase auth

export default {
  name: "NavBar",
  data() {
    return {
      statusMessage: "", // Holds the status/error message
      isSuccess: false, // Tracks whether the message indicates success or error
    };
  },
  methods: {
    async logout() {
      try {
        await auth.signOut(); // Sign out the user using Firebase Authentication
        this.showStatusMessage("Logout successful! Redirecting...", true);
        this.$router.push("/"); // Redirect to the login page
      } catch (error) {
        console.error("Logout failed:", error.message);
        this.showStatusMessage("Failed to log out. Please try again.", false);
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
.btn {
  background-color: #a3d2ca; /* Pastel green */
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
}
.btn:hover {
  background-color: #71c0b2; /* Slightly darker green */
}
.btn-red {
  background-color: #e57373; /* Pastel red */
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
}
.btn-red:hover {
  background-color: #d32f2f; /* Darker red */
}
.status-message {
  margin-top: 1rem;
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