<template>
    <div class="profile-card-overlay" v-if="isVisible" @click.self="closeProfile">
      <div class="profile-card">
        <div class="profile-header">
          <div class="profile-image-container">
            <img :src="userData.profilePic || defaultProfileImage" alt="Profile picture" class="profile-image" />
          </div>
          <div class="profile-info">
            <h2 class="username">{{ userData.name || 'Anonymous' }}</h2>
            <p class="user-id">ID: {{ userData.uniqueCode || 'Unknown ID' }}</p>
            <p class="join-date">Joined modo on {{ formatJoinDate(userData.createdAt) }}</p>
          </div>
          <button class="close-button" @click="closeProfile">×</button>
        </div>
        
        <div class="qr-code-container">
          <img :src="generateQRCode(userData.uid)" alt="User QR Code" class="qr-code" />
          <p class="qr-label">Scan to connect</p>
        </div>
        
        <div class="action-buttons">
          <button 
            class="action-btn follow-btn" 
            :class="{ 'following': isFollowing }"
            @click="toggleFollow"
          >
            {{ isFollowing ? 'Following' : 'Follow' }}
          </button>
          <button 
            class="action-btn blacklist-btn" 
            :class="{ 'blacklisted': isBlacklisted }"
            @click="toggleBlacklist"
          >
            {{ isBlacklisted ? 'Blacklisted' : 'Blacklist' }}
          </button>
        </div>
        
        <div class="user-stats">
          <div class="stat-item">
            <span class="stat-value">{{ userData.postCount || 0 }}</span>
            <span class="stat-label">Posts</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ userData.followersCount || 0 }}</span>
            <span class="stat-label">Followers</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ userData.followingCount || 0 }}</span>
            <span class="stat-label">Following</span>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, update, get } from "firebase/database";
  import { auth, db } from "@/firebase";
  import QRCode from 'qrcode';
  
  export default {
    name: "ProfileCard",
    props: {
      userId: {
        type: String,
        required: true,
        default: null,
      },
      isVisible: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        userData: {},
        isFollowing: false,
        isBlacklisted: false,
        defaultProfileImage: "https://via.placeholder.com/150?text=User",
        qrCodeUrl: ""
      };
    },
    watch: {
      userId: {
        immediate: true,
        handler(newUserId) {
          if (newUserId && this.isVisible) {
            this.fetchUserData();
            this.checkRelationshipStatus();
          }
        }
      },
      isVisible(newValue) {
        if (newValue && this.userId) {
          this.fetchUserData();
          this.checkRelationshipStatus();
        }
      }
    },
    methods: {
      closeProfile() {
        this.$emit('close');
      },
      async fetchUserData() {
        if (!this.userId) return;
        
        const userRef = ref(db, `users/${this.userId}`);
        try {
          const snapshot = await get(userRef);
          if (snapshot.exists()) {
            this.userData = snapshot.val();
          } else {
            console.log("No user data available");
            this.userData = { uid: this.userId };
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      },
      async checkRelationshipStatus() {
        if (!auth.currentUser || auth.currentUser.uid === this.userId) return;
        
        // Check if current user is following the profile user
        const followingRef = ref(db, `users/${auth.currentUser.uid}/following/${this.userId}`);
        try {
          const snapshot = await get(followingRef);
          this.isFollowing = snapshot.exists();
        } catch (error) {
          console.error("Error checking following status:", error);
        }
        
        // Check if current user has blacklisted the profile user
        const blacklistRef = ref(db, `users/${auth.currentUser.uid}/blacklist/${this.userId}`);
        console.log(blacklistRef);
        try {
          const snapshot = await get(blacklistRef);
          this.isBlacklisted = snapshot.exists();
        } catch (error) {
          console.error("Error checking blacklist status:", error);
        }
      },
      async toggleFollow() {
        if (!auth.currentUser || auth.currentUser.uid === this.userId) return;
        
        const currentUserUid = auth.currentUser.uid;
        const updates = {};
        
        if (this.isFollowing) {
          // Unfollow
          updates[`users/${currentUserUid}/following/${this.userId}`] = null;
          updates[`users/${this.userId}/followers/${currentUserUid}`] = null;
        } else {
          // Follow
          updates[`users/${currentUserUid}/following/${this.userId}`] = true;
          updates[`users/${this.userId}/followers/${currentUserUid}`] = true;
        }
        
        try {
          await update(ref(db), updates);
          this.isFollowing = !this.isFollowing;
        } catch (error) {
          console.error("Error updating follow status:", error);
        }
      },
      async toggleBlacklist() {
        if (!auth.currentUser || auth.currentUser.uid === this.userId) return;
        
        const currentUserUid = auth.currentUser.uid;
        const blacklistRef = ref(db, `users/${currentUserUid}/blacklist/${this.userId}`);
        console.log(blacklistRef);
        
        try {
          if (this.isBlacklisted) {
            // Remove from blacklist
            await update(ref(db), {
              [`users/${currentUserUid}/blacklist/${this.userId}`]: null
            });
          } else {
            // Add to blacklist
            await update(ref(db), {
              [`users/${currentUserUid}/blacklist/${this.userId}`]: true
            });
          }
          this.isBlacklisted = !this.isBlacklisted;
        } catch (error) {
          console.error("Error updating blacklist status:", error);
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
      async generateQRCode(uid) {
        if (!uid) return '';
        try {
          const url = `modo://user/${uid}`;
          return await QRCode.toDataURL(url);
        } catch (error) {
          console.error("Error generating QR code:", error);
          return '';
        }
      }
    }
  };
  </script>
  
  <style scoped>
  .profile-card-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .profile-card {
    background-color: white;
    border-radius: 1rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    width: 90%;
    max-width: 480px;
    padding: 1.5rem;
    position: relative;
    overflow: hidden;
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
  
  .close-button {
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
  
  .close-button:hover {
    background: #e0e0e0;
  }
  
  .qr-code-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 1rem 0;
  }
  
  .qr-code {
    width: 150px;
    height: 150px;
    margin-bottom: 0.5rem;
  }
  
  .qr-label {
    font-size: 0.85rem;
    color: #666;
    margin: 0;
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
  
  .blacklist-btn {
    background-color: #f0f0f0;
    color: #333;
  }
  
  .blacklist-btn:hover {
    background-color: #ffcccb;
    color: #d32f2f;
  }
  
  .blacklist-btn.blacklisted {
    background-color: #ffcccb;
    color: #d32f2f;
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
  </style>