<template>
  <div class="min-h-screen bg-pastel">
    <Navbar />
    <!-- Unique Code & QR Code -->
    <section class="p-4">
      <h2 class="text-xl font-bold">Your Unique Code:</h2>
      <p>{{ uniqueCode }}</p>
      <!-- QR Code generation can be added here -->
    </section>

    <!-- Blacklist Users -->
    <section class="p-4">
      <h2 class="text-xl font-bold">Blacklisted Users:</h2>
      <ul>
        <li v-for="user in blacklistedUsers" :key="user.uid">
          {{ user.name }} ({{ user.email }})
          <button @click="removeFromBlacklist(user.uid)" class="btn-red">Remove</button>
        </li>
      </ul>
    </section>

    <!-- Update User Settings -->
    <section class="p-4">
      <h2 class="text-xl font-bold">Update Settings:</h2>
      <form @submit.prevent="updateSettings">
        <input v-model="displayName" type="text" placeholder="Display Name" class="input" />
        <input v-model="photoURL" type="url" placeholder="Profile Picture URL" class="input" />
        <select v-model="theme" class="input">
          <option value="light">Light Theme</option>
          <option value="dark">Dark Theme</option>
        </select>
        <label class="block mt-2">
          <input type="checkbox" v-model="notificationsEnabled" /> Enable Notifications
        </label>
        <button type="submit" class="btn">Save Changes</button>
      </form>
    </section>
  </div>
</template>

<script>
import { auth, db } from "@/firebase";
import { ref, onValue, update, remove } from "firebase/database";
import Navbar from "@/components/Navbar.vue";

export default {
  name: "SettingsPage", 
  components: {
    Navbar,
  },
  data() {
    return {
      uniqueCode: "",
      blacklistedUsers: [],
      displayName: "",
      photoURL: "",
      theme: "light", // Default theme
      notificationsEnabled: true, // Default notifications setting
    };
  },
  methods: {
    fetchUniqueCode() {
      const userUid = auth.currentUser.uid;
      const userRef = ref(db, `users/${userUid}/uniqueCode`);
      onValue(userRef, (snapshot) => {
        this.uniqueCode = snapshot.val();
      });
    },
    fetchBlacklistedUsers() {
      const userUid = auth.currentUser.uid;
      const blacklistRef = ref(db, `users/${userUid}/blacklist`);
      onValue(blacklistRef, (snapshot) => {
        const data = snapshot.val() || {};
        this.blacklistedUsers = Object.keys(data).map((key) => ({
          uid: key,
          ...data[key],
        }));
      });
    },
    removeFromBlacklist(blacklistedUid) {
      const userUid = auth.currentUser.uid;
      const blacklistRef = ref(db, `users/${userUid}/blacklist/${blacklistedUid}`);
      remove(blacklistRef).then(() => {
        this.fetchBlacklistedUsers(); // Refresh the list
      });
    },
    fetchSettings() {
      const userUid = auth.currentUser.uid;
      const settingsRef = ref(db, `users/${userUid}/settings`);
      onValue(settingsRef, (snapshot) => {
        const data = snapshot.val() || {};
        this.theme = data.appearance?.theme || "light";
        this.notificationsEnabled = data.notificationsEnabled ?? true;
      });
    },
    updateSettings() {
      const userUid = auth.currentUser.uid;
      const updates = {};

      if (this.displayName) updates[`users/${userUid}/name`] = this.displayName;
      if (this.photoURL) updates[`users/${userUid}/profilePic`] = this.photoURL;

      updates[`users/${userUid}/settings`] = {
        appearance: { theme: this.theme },
        notificationsEnabled: this.notificationsEnabled,
      };

      update(ref(db), updates).then(() => {
        alert("Settings updated successfully!");
        this.displayName = "";
        this.photoURL = "";
      });
    },
  },
  mounted() {
    this.fetchUniqueCode();
    this.fetchBlacklistedUsers();
    this.fetchSettings();
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
.btn-red {
  background-color: #e57373; /* Pastel red */
  color: #fff;
  padding: 0.5rem;
  border-radius: 0.25rem;
}
.btn-red:hover {
  background-color: #d32f2f; /* Darker red */
}
</style>