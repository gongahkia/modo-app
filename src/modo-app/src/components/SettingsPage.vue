<template>
  <div class="min-h-screen bg-pastel">

    <NavBar />

    <!-- Unique Code & QR Code -->
    <section class="p-4">
      <h2 class="text-xl font-bold">Your Unique Code:</h2>
      <p>{{ uniqueCode }}</p>
      <div class="mt-4" v-if="uniqueCode">
        <qrcode-vue :value="uniqueCode" :size="180" level="H" />
      </div>
    </section>

    <!-- Join Date -->
    <section class="p-4">
      <h2 class="text-xl font-bold">Account Info:</h2>
      <p>Joined in {{ joinDate }}</p>
    </section>

    <!-- Followed Users -->

    <section class="p-4">
      <h2 class="text-xl font-bold">Following:</h2>
      <p v-if="followedUsers.length === 0">No users are currently followed.</p>
      <ul>
        <li v-for="user in followedUsers" :key="user.uid">
          {{ userNames[user.uid] || user.uid }}
          <button @click="removeFromFollowing(user.uid)" class="btn-red">Unfollow</button>
        </li>
      </ul>
    </section>

    <!-- Followers -->

    <section class="p-4">
      <h2 class="text-xl font-bold">Followers:</h2>
      <p v-if="followers.length === 0">No followers found.</p>
      <ul>
        <li v-for="follower in followers" :key="follower.uid">
          {{ userNames[follower.uid] || follower.uid }}
          <button @click="removeFromFollowers(follower.uid)" class="btn-red">Remove</button>
        </li>
      </ul>
    </section>

    <!-- Blacklist Users -->
    <section class="p-4">
      <h2 class="text-xl font-bold">Blacklisted Users:</h2>
      <p v-if="blacklistedUsers.length === 0">No users are currently blacklisted.</p>
      <ul>
        <li v-for="user in blacklistedUsers" :key="user.uid">
          {{ userNames[user.uid] || user.uid }}
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
import { auth, db } from "@/firebase";
import { ref, onValue, update, remove, get, getDatabase } from "firebase/database";
import NavBar from "@/components/NavBar.vue";
import QrcodeVue from 'qrcode.vue';

export default {
  name: "SettingsPage",
  components: {
    NavBar,
    QrcodeVue,
  },
  data() {
    return {
      uniqueCode: "",
      followedUsers: [],
      followers: [],
      blacklistedUsers: [],
      displayName: "",
      profileImageFile: null,
      profileImagePreview: null,
      photoURL: "",
      notificationsEnabled: true, // Default notifications setting
      statusMessage: "", // Holds the status/error message
      isSuccess: false, // Tracks whether the message indicates success or error
      currentDisplayName: "", // Current display name from Firebase
      currentPhotoURL: "", // Current photo URL from Firebase
      isUploading: false, // Track if image is uploading
      joinDate: "Loading...", // Join date display
      userNames: {} // Cache for user names to avoid repeated lookups
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
    fetchFollowedUsers() {
      const userUid = auth.currentUser.uid;
      const followedRef = ref(db, `users/${userUid}/following`);
      onValue(followedRef, (snapshot) => {        
        const data = snapshot.val() || {};
        this.followedUsers = Object.keys(data).map((key) => ({
          uid: key,
          ...data[key],
        }));
        this.fetchUserNames();
      });
    },
    fetchFollowers() {
      const userUid = auth.currentUser.uid;
      const followersRef = ref(db, `users/${userUid}/followers`);
      onValue(followersRef, (snapshot) => {
        const data = snapshot.val() || {};
        this.followers = Object.keys(data).map((key) => ({
          uid: key,
          ...data[key],
        }));
        this.fetchUserNames();
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
        this.fetchUserNames();
      });
    },
    fetchSettings() {
      const userUid = auth.currentUser.uid;
      const settingsRef = ref(db, `users/${userUid}`);
      onValue(settingsRef, (snapshot) => {
        const data = snapshot.val() || {};
        this.notificationsEnabled = data.settings?.notificationsEnabled ?? true;
        this.currentDisplayName = data.name || "Anonymous";
        this.currentPhotoURL = data.profilePic || "";
        if (data.createdAt) {
          this.formatJoinDate(data.createdAt);
        } else {
          this.joinDate = "Unknown";
        }
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
    removeFromFollowing(followedUid) {
      const userUid = auth.currentUser.uid;
      const followingRef = ref(db, `users/${userUid}/following/${followedUid}`);
      
      remove(followingRef)
        .then(() => {
          this.fetchFollowedUsers(); // Refresh the list
          this.showStatusMessage("User removed from following successfully!", true);
        })
        .catch(() => {
          this.showStatusMessage("Failed to remove user from following.", false);
        });
    },
    removeFromFollowers(followerUid) {
      const userUid = auth.currentUser.uid;
      const followersRef = ref(db, `users/${userUid}/followers/${followerUid}`);
      
      remove(followersRef)
        .then(() => {
          this.fetchFollowers(); // Refresh the list
          this.showStatusMessage("User removed from followers successfully!", true);
        })
        .catch(() => {
          this.showStatusMessage("Failed to remove user from followers.", false);
        });
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
    formatJoinDate(createdAtIso) {
      try {
        const date = new Date(createdAtIso);
        this.joinDate = date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
      } catch (error) {
        console.error("Error formatting join date:", error);
        this.joinDate = "Unknown";
      }
    },
    async getUserName(uid) {
      if (this.userNames[uid]) {
        return this.userNames[uid];
      }
      try {
        const db = getDatabase();
        const userRef = ref(db, `users/${uid}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          const userData = snapshot.val();
          this.userNames[uid] = userData.name;
          return userData.name;
        } else {
          console.log(`No user found with ID: ${uid}`);
          return uid; 
        }
      } catch (error) {
        console.error("Error fetching user name:", error);
        return uid; 
      }
    },
    async fetchUserNames() {
      for (const user of this.followedUsers) {
        await this.getUserName(user.uid);
      }
      for (const follower of this.followers) {
        await this.getUserName(follower.uid);
      }
      for (const user of this.blacklistedUsers) {
        await this.getUserName(user.uid);
      }
    },
  },
  mounted() {
    if (auth.currentUser) {
      this.fetchUniqueCode();
      this.fetchBlacklistedUsers();
      this.fetchFollowedUsers();
      this.fetchFollowers();
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
</style>