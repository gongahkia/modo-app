<template>
  <div class="user-profile-page">
    <Navbar v-if="isAuthenticated" />
    <div v-else class="login-button-container">
      <button class="login-button" @click="goToLogin">Login / Register</button>
    </div>
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
        <div class="stat-item">
          <span class="stat-value">{{ postCount }}</span>
          <span class="stat-label">Posts</span>
        </div>
      </div>

      <!-- User's posts section -->
      <div class="user-posts" v-if="userPosts.length > 0">
        <h3 class="section-title">Recent Posts</h3>
        <div class="posts-grid">
          <div v-for="post in userPosts" :key="post.id" class="post-thumbnail">
            <img :src="post.imageUrl" alt="Post" class="post-image" />
          </div>
        </div>
      </div>
      <div v-else-if="!loading" class="no-posts">
        <p>No posts yet</p>
      </div>
    </div>
  </div>
</template>

<script>
import { auth, db } from "@/firebase";
import { ref, update, get, query, orderByChild, equalTo } from "firebase/database";
import Navbar from "@/components/NavBar.vue";
import QrcodeVue from 'qrcode.vue';

export default {
  name: "UserProfilePage",
  components: {
    QrcodeVue,
    Navbar
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
      loading: true,
      userPosts: [],
      postCount: 0,
      isAuthenticated: false,
    };
  },
  created() {
    this.isAuthenticated = !!auth.currentUser;
    this.fetchUserData();
    this.fetchUserPosts();
    if (!this.isOwnProfile) {
      this.checkRelationshipStatus();
    }
  },
  methods: {
    async fetchUserData() {
      if (!this.userid) return;
      
      this.loading = true;
      const userRef = ref(db, `users/${this.userid}`);
      try {
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          this.userData = snapshot.val();
          this.userData.uid = this.userid; // Ensure UID is set for QR code
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
    async fetchUserPosts() {
      if (!this.userid) return;
      
      try {
        // Create a query to find posts by this user
        const postsRef = ref(db, 'posts');
        const userPostsQuery = query(postsRef, orderByChild('authorId'), equalTo(this.userid));
        
        const snapshot = await get(userPostsQuery);
        
        if (snapshot.exists()) {
          const posts = [];
          snapshot.forEach((childSnapshot) => {
            const post = childSnapshot.val();
            post.id = childSnapshot.key;
            posts.push(post);
          });
          
          // Sort posts by timestamp (newest first)
          this.userPosts = posts.sort((a, b) => {
            return new Date(b.timestamp) - new Date(a.timestamp);
          });
          
          this.postCount = posts.length;
        } else {
          this.userPosts = [];
          this.postCount = 0;
        }
      } catch (error) {
        console.error("Error fetching user posts:", error);
        this.userPosts = [];
        this.postCount = 0;
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
    goToLogin() {
      this.$router.push('/');
    },
  },
  computed: {
    isOwnProfile() {
      return auth.currentUser && auth.currentUser.uid === this.userid;
    }
  },
  mounted() {
    if (auth.currentUser) {
      console.log(`User found with ID: ${this.userid}`);
      this.isAuthenticated = true;
    } else {
      console.log("User not authenticated. Requesting login or registration.");
    }
  },
};
</script>

<style scoped>
.user-profile-page {
  display: flex;
  flex-direction: column;
  align-items: center;
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
  margin-top: 1rem;
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

.section-title {
  font-size: 1.2rem;
  color: #333;
  margin: 2rem 0 1rem;
  text-align: center;
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  margin-top: 1rem;
}

.post-thumbnail {
  aspect-ratio: 1/1;
  overflow: hidden;
  border-radius: 0.5rem;
}

.post-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-posts {
  text-align: center;
  color: #888;
  margin-top: 2rem;
  padding: 1rem;
  border-top: 1px solid #eee;
}

.login-button-container {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 1rem;
  background-color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.login-button {
  background-color: #a3d2ca;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.login-button:hover {
  background-color: #71c0b2;
}
</style>