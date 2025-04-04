<template>
    <div class="profile-card-overlay" v-if="isVisible" @click.self="closeProfile">
      <div class="profile-card">
        <div class="profile-header">
          <div class="profile-image-container">
            <img :src="userData.profilePic || defaultProfileImage" alt="Profile picture" class="profile-image" />
          </div>
          <div class="profile-info">
            <div class="username-container">
              <h2 class="username">{{ userData.name || 'Anonymous' }}</h2>
              <router-link :to="`/dashboard/user/${userData.uid || userId}`" class="expand-icon">
                <i class="fas fa-external-link-alt"></i>
              </router-link>
            </div>
            <p class="user-id">ID: {{ userData.uniqueCode || 'Unknown ID' }}</p>
            <p class="join-date">Joined Modo on {{ formatJoinDate(userData.createdAt) }}</p>
            <p v-if="followsCurrentUser" class="follows-you">Follows you</p>
          </div>
          <button class="close-button" @click="closeProfile">×</button>
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
      </div>
    </div>
  </template>
  
  <script>
  import { ref, update, get } from "firebase/database";
  import { auth, db } from "@/firebase";
  
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
        defaultProfileImage: "https://via.placeholder.com/150?text=User",
        followsCurrentUser: true,
      };
    },
    watch: {
      userId: {
        immediate: true,
        handler(newUserId) {
          if (newUserId && this.isVisible) {
            this.fetchUserData();
            if (!this.isOwnProfile){
              this.checkRelationshipStatus();
            }
          }
        }
      },
      isVisible(newValue) {
        if (newValue && this.userId) {
          this.fetchUserData();
          if (!this.isOwnProfile){
            this.checkRelationshipStatus();
          }
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
            this.userData.uid = this.userId;
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
        await Promise.all([
          this.checkIfFollowsCurrentUser(),
          (async () => {
            const followingRef = ref(db, `users/${auth.currentUser.uid}/following/${this.userId}`);
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
        if (!auth.currentUser || auth.currentUser.uid === this.userId) return;
        const followerRef = ref(db, `users/${auth.currentUser.uid}/followers/${this.userId}`);
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
        return auth.currentUser && auth.currentUser.uid === this.userId;
      }
    },
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

  .username-container {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .expand-icon {
    color: #a3d2ca;
    font-size: 0.9rem;
    transition: all 0.2s;
  }

  .expand-icon:hover {
    color: #71c0b2;
    transform: scale(1.1);
  }
  </style>