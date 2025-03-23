<template>
  <div class="user-profile-page">
    <div class="profile-container">
      <div class="profile-header">
        <div class="profile-image-container">
          <img :src="userData.profilePic || defaultProfileImage" alt="Profile picture" class="profile-image" />
        </div>
        <div class="profile-info">
          <h2 class="username">{{ userData.name || 'Anonymous' }}</h2>
          <p class="user-id">ID: {{ userData.uniqueCode || 'Unknown ID' }}</p>
          <p class="join-date">Joined Modo on {{ formatJoinDate(userData.createdAt) }}</p>
          <p v-if="followsCurrentUser" class="follows-you">Follows you</p>
        </div>
        <button class="back-button" @click="goBack">← Back</button>
      </div>
      
      <div class="qr-code-container">
        <qrcode-vue :value="userData.uid" :size="150" level="H" alt="User QR Code" />
      </div>
      
      <div class="action-buttons" v-if="!isOwnProfile">
        <button 
          class="action-btn follow-btn" 
          :class="{ 'following': isFollowing }"
          @click="toggleFollow"
        >
          {{ isFollowing ? 'Following' : 'Follow' }}
        </button>
      </div>
      
      <div class="user-stats">
        <div class="stat-item">
          <span class="stat-value">{{ userData.followers ? Object.keys(userData.followers).length : 0 }}</span>
          <span class="stat-label">Followers</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ userData.following ? Object.keys(userData.following).length : 0 }}</span>
          <span class="stat-label">Following</span>
        </div>
      </div>

      <!-- You could add more sections here like user's posts/artwork -->
    </div>
  </div>
</template>

<script>
import { ref, update, get } from "firebase/database";
import { auth, db } from "@/firebase";
import QrcodeVue from 'qrcode.vue';

export default {
  name: "UserProfilePage",
  components: {
    QrcodeVue,
  },
  props: {
    userid: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      userData: {},
      isFollowing: false,
      defaultProfileImage: "https://via.placeholder.com/150?text=User",
      followsCurrentUser: false,
      loading: true
    };
  },
  created() {
    this.fetchUserData();
    if (!this.isOwnProfile) {
      this.checkRelationshipStatus();
    }
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },
    async fetchUserData() {
      if (!this.userid) return;
      
      this.loading = true;
      const userRef = ref(db, `users/${this.userid}`);
      try {
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          this.userData = snapshot.val();
        } else {
          console.log("No user data available");
          this.userData = { uid: this.userid };
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        this.loading = false;
      }
    },
    async checkRelationshipStatus() {
      if (!auth.currentUser || auth.currentUser.uid === this.userid) return;
      
      await Promise.all([
        this.checkIfFollowsCurrentUser(),
        (async () => {
          const followingRef = ref(db, `users/${auth.currentUser.uid}/following/${this.userid}`);
          try {
            const snapshot = await get(followingRef);
            this.isFollowing = snapshot.exists();
          } catch (error) {
            console.error("Error checking following status:", error);
          }
        })()
      ]);
    },
    async toggleFollow() {
      if (!auth.currentUser || auth.currentUser.uid === this.userid) return;
      
      const currentUserUid = auth.currentUser.uid;
      const updates = {};
      
      if (this.isFollowing) {
        // Unfollow
        updates[`users/${currentUserUid}/following/${this.userid}`] = null;
        updates[`users/${this.userid}/followers/${currentUserUid}`] = null;
      } else {
        // Follow
        updates[`users/${currentUserUid}/following/${this.userid}`] = true;
        updates[`users/${this.userid}/followers/${currentUserUid}`] = true;
      }
      
      try {
        await update(ref(db), updates);
        this.isFollowing = !this.isFollowing;
      } catch (error) {
        console.error("Error updating follow status:", error);
      }
    },
    formatJoinDate(timestamp) {
      if (!timestamp) return 'Unknown date';
      
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return 'Unknown date';
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },
    async checkIfFollowsCurrentUser() {
      if (!auth.currentUser || auth.currentUser.uid === this.userid) return;
      const followerRef = ref(db, `users/${auth.currentUser.uid}/followers/${this.userid}`);
      try {
        const snapshot = await get(followerRef);
        this.followsCurrentUser = snapshot.exists();
      } catch (error) {
        console.error("Error checking if user follows current user:", error);
      }
    },
  },
  computed: {
    isOwnProfile() {
      return auth.currentUser && auth.currentUser.uid === this.userid;
    }
  },
};
</script>

<style scoped>
.user-profile-page {
  display: flex;
  justify-content: center;
  padding: 2rem 1rem;
  background-color: #f8f8f8;
  min-height: 100vh;
}

.profile-container {
  background-color: white;
  border-radius: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 480px;
  padding: 1.5rem;
  position: relative;
}

.profile-header {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  position: relative;
}

.profile-image-container {
  margin-right: 1rem;
}

.profile-image {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #a3d2ca;
}

.profile-info {
  flex: 1;
}

.username {
  font-size: 1.5rem;
  margin: 0 0 0.25rem 0;
  color: #333;
}

.user-id {
  font-size: 0.85rem;
  color: #666;
  margin: 0 0 0.5rem 0;
}

.join-date {
  font-size: 0.85rem;
  color: #888;
  margin: 0;
}

.back-button {
  position: absolute;
  top: -10px;
  right: -10px;
  background: #f0f0f0;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  font-size: 1.25rem;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-button:hover {
  background: #e0e0e0;
}

.qr-code-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 1rem 0;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  margin: 1.5rem 0;
}

.action-btn {
  flex: 1;
  padding: 0.75rem 0;
  border-radius: 0.5rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.follow-btn {
  background-color: #a3d2ca;
  color: white;
}

.follow-btn:hover {
  background-color: #71c0b2;
}

.follow-btn.following {
  background-color: #e0e0e0;
  color: #333;
}

.user-stats {
  display: flex;
  justify-content: space-around;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: bold;
  color: #333;
}

.stat-label {
  font-size: 0.85rem;
  color: #666;
  margin-top: 0.25rem;
}

.follows-you {
  font-size: 0.85rem;
  color: #a3d2ca;
  margin: 0.25rem 0 0 0;
  font-weight: 500;
}
</style>