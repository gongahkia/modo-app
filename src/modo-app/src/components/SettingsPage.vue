<template>
  <div class="min-h-screen bg-pastel">
    <NavBar />
    <!-- Unique Code & QR Code -->
    <section class="p-4">
      <h2 class="text-xl font-bold">Your Unique Code:</h2>
      <p>{{ uniqueCode }}</p>
      <section class="p-4">
        <h2 class="text-xl font-bold">Your Unique Code:</h2>
        <p>{{ uniqueCode }}</p>
        <div id="qrcode" class="mt-4"></div>
      </section>
    </section>

    <!-- Blacklist Users -->
    <section class="p-4">
      <h2 class="text-xl font-bold">Blacklisted Users:</h2>
      <p v-if="blacklistedUsers.length === 0">No users are currently blacklisted.</p>
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
      <!-- Status Message -->
      <div v-if="statusMessage" class="status-message" :class="{ success: isSuccess, error: !isSuccess }">
        {{ statusMessage }}
      </div>
      <form @submit.prevent="updateSettings">
        <!-- Placeholder reflects current value from Firebase -->
        <div class="mb-4">
          <label class="block mb-2">Display Name</label>
          <input v-model="displayName" type="text" :placeholder="currentDisplayName" class="input" />
        </div>
        
        <!-- Profile Picture Upload -->
        <div class="mb-4">
          <div class="flex items-center">
            <div v-if="currentPhotoURL || profileImagePreview" class="mr-4">
              <img 
                :src="profileImagePreview || currentPhotoURL" 
                alt="Profile" 
                class="w-16 h-16 rounded-full object-cover"
              >
            </div>
            <input 
              type="file" 
              @change="handleProfileImageUpload" 
              accept="image/*" 
              class="mb-2"
            >
          </div>
          <div v-if="isUploading" class="text-sm text-gray-500 mt-1">
            Uploading image...
          </div>
        </div>
        
        <div class="mb-4">
          <label class="block mb-2">Theme</label>
          <select v-model="theme" class="input">
            <option value="light">Light Theme</option>
            <option value="dark">Dark Theme</option>
          </select>
        </div>
        
        <label class="block mt-2 mb-4">
          <input type="checkbox" v-model="notificationsEnabled" /> Enable Notifications
        </label>
        
        <button type="submit" class="btn" :disabled="isUploading">
          {{ isUploading ? 'Uploading...' : 'Save Changes' }}
        </button>
      </form>
    </section>
  </div>
</template>

<script>
/* global QRCode */
import { auth, db } from "@/firebase";
import { ref, onValue, update, remove } from "firebase/database";
import NavBar from "@/components/NavBar.vue";

export default {
  name: "SettingsPage",
  components: {
    NavBar,
  },
  data() {
    return {
      uniqueCode: "",
      blacklistedUsers: [],
      displayName: "",
      profileImageFile: null,
      profileImagePreview: null,
      photoURL: "",
      theme: "light", // Default theme
      notificationsEnabled: true, // Default notifications setting
      statusMessage: "", // Holds the status/error message
      isSuccess: false, // Tracks whether the message indicates success or error
      currentDisplayName: "", // Current display name from Firebase
      currentPhotoURL: "", // Current photo URL from Firebase
      isUploading: false, // Track if image is uploading
    };
  },
  methods: {
    fetchUniqueCode() {
      const userUid = auth.currentUser.uid;
      const userRef = ref(db, `users/${userUid}/uniqueCode`);
      onValue(userRef, (snapshot) => {
        this.uniqueCode = snapshot.val();
        this.$nextTick(() => {
          this.generateQRCode();
        });
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
    fetchSettings() {
      const userUid = auth.currentUser.uid;
      const settingsRef = ref(db, `users/${userUid}`);
      
      onValue(settingsRef, (snapshot) => {
        const data = snapshot.val() || {};
        
        // Retrieve settings and current values
        this.theme = data.settings?.appearance?.theme || "light";
        this.notificationsEnabled = data.settings?.notificationsEnabled ?? true;
        this.currentDisplayName = data.name || "Anonymous";
        this.currentPhotoURL = data.profilePic || "";
      });
    },
    handleProfileImageUpload(event) {
      this.profileImageFile = event.target.files[0];
      if (this.profileImageFile) {
        // Check file size (e.g., 2MB limit)
        const maxSize = 2 * 1024 * 1024; // 2MB
        if (this.profileImageFile.size > maxSize) {
          this.showStatusMessage("File is too large. Maximum size is 2MB.", false);
          this.profileImageFile = null;
          return;
        }
        
        const reader = new FileReader();
        reader.onload = e => {
          this.profileImagePreview = e.target.result;
        };
        reader.readAsDataURL(this.profileImageFile);
      }
    },
    async uploadProfileImage() {
      if (!this.profileImageFile) return null;
      
      try {
        const imgbbApiKey = process.env.VUE_APP_IMGBB_API_KEY;
        if (!imgbbApiKey) {
          throw new Error("ImgBB API Key not configured");
        }
        
        // Convert file to base64
        const reader = new FileReader();
        const base64Image = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result.split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(this.profileImageFile);
        });
        
        // Prepare form data for ImgBB
        const formData = new FormData();
        formData.append('key', imgbbApiKey);
        formData.append('image', base64Image);
        formData.append('name', `profile_${auth.currentUser.uid}`);
        
        const response = await fetch('https://api.imgbb.com/1/upload', {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) {
          throw new Error(`ImgBB API error: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
          return result.data.url;
        } else {
          throw new Error("Failed to upload image to ImgBB");
        }
      } catch (error) {
        console.error("Error uploading profile image:", error);
        this.showStatusMessage("Failed to upload profile image. Please try again.", false);
        return null;
      }
    },
    removeFromBlacklist(blacklistedUid) {
      const userUid = auth.currentUser.uid;
      const blacklistRef = ref(db, `users/${userUid}/blacklist/${blacklistedUid}`);
      
      remove(blacklistRef)
        .then(() => {
          this.fetchBlacklistedUsers(); // Refresh the list
          this.showStatusMessage("User removed from blacklist successfully!", true);
        })
        .catch(() => {
          this.showStatusMessage("Failed to remove user from blacklist.", false);
        });
    },
    async updateSettings() {
      if (!auth.currentUser) {
        this.showStatusMessage("You must be logged in to update settings.", false);
        return;
      }
      
      this.isUploading = true;
      
      try {
        const userUid = auth.currentUser.uid;
        const updates = {};

        // Upload profile image if a new one is selected
        let profileImageUrl = null;
        if (this.profileImageFile) {
          profileImageUrl = await this.uploadProfileImage();
        }

        if (this.displayName) updates[`users/${userUid}/name`] = this.displayName;
        if (profileImageUrl) updates[`users/${userUid}/profilePic`] = profileImageUrl;

        updates[`users/${userUid}/settings`] = {
          appearance: { theme: this.theme },
          notificationsEnabled: this.notificationsEnabled,
        };

        await update(ref(db), updates);
        
        this.showStatusMessage("Settings updated successfully!", true);
        this.displayName = "";
        this.profileImageFile = null;
        this.profileImagePreview = null;
      } catch (error) {
        console.error("Error updating settings:", error);
        this.showStatusMessage("Failed to update settings. Please try again.", false);
      } finally {
        this.isUploading = false;
      }
    },
    showStatusMessage(message, isSuccess) {
      this.statusMessage = message;
      this.isSuccess = isSuccess;

      setTimeout(() => {
        this.statusMessage = "";
      }, 3000);
    },

    generateQRCode() {
      if (!this.uniqueCode) return;
      const qrcodeContainer = document.getElementById("qrcode");
      qrcodeContainer.innerHTML = "";
      new QRCode(qrcodeContainer, {
        text: this.uniqueCode,
        width: 180,
        height: 180,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
      });
    },

  },
  mounted() {
    if (auth.currentUser) {
      this.fetchUniqueCode();
      this.fetchBlacklistedUsers();
      this.fetchSettings();
    } else {
      this.$router.push('/login');
    }
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
.btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
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

#qrcode {
  display: inline-block;
  background-color: white;
  padding: 10px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>