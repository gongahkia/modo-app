<template>
  <div class="min-h-screen bg-pastel">
    <NavBar />
    <main class="pt-4 pb-20">
      <!-- Carousel -->
      <div v-if="posts.length == 0" class="empty-state">
        <p>No posts found. Follow someone to get started.</p>
      </div>  
      
      <div class="carousel-container">
        <div class="carousel-track">
          <div v-for="post in posts" :key="post.id" class="carousel-slide">
            <PostCard 
              :post="post" 
              :isSelected="selectedPost === post.id"
              @toggle-details="togglePostDetails"
              @show-profile="showUserProfile"
            />
          </div>
        </div>
        <ProfileCard 
          :userId="selectedUserId" 
          :isVisible="isProfileVisible"
          @close="closeUserProfile"
        />
      </div>
    </main>
    
    <!-- Add Art -->
    <footer class="fixed bottom-0 w-full bg-white shadow p-4 flex justify-center">
      <button @click="$router.push('/add-art')" class="btn">Add Art</button>
    </footer>
  </div>
</template>

<script>
import { ref, onValue } from "firebase/database";
import { db } from "@/firebase";
import NavBar from "@/components/NavBar.vue";
import PostCard from "@/components/PostCard.vue";
import ProfileCard from "./ProfileCard.vue";

export default {
  name: "DashboardPage", 
  components: {
    NavBar,
    PostCard,
    ProfileCard
  },
  data() {
    return {
      posts: [],
      selectedPost: null,
      selectedUserId: null,
      isProfileVisible: false
    };
  },
  methods: {
    fetchPosts() {
      const postsRef = ref(db, "posts");
      onValue(postsRef, (snapshot) => {
        const data = snapshot.val();
        this.posts = Object.keys(data || {}).map((key) => ({
          id: key,
          ...data[key],
        }));
      });
    },
    togglePostDetails(postId) {
      if (this.selectedPost === postId) {
        this.selectedPost = null;
      } else {
        this.selectedPost = postId;
      }
    },
    showUserProfile(userId) {
      this.selectedUserId = userId;
      this.isProfileVisible = true;
    },
    closeUserProfile() {
      this.isProfileVisible = false;
    }
  },
  mounted() {
    this.fetchPosts();
  },
};
</script>

<style scoped>
.empty-state {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.carousel-container {
  width: 100%;
  overflow-x: auto;
  padding: 1rem 0;
  -webkit-overflow-scrolling: touch; /* For smooth scrolling on iOS */
  scrollbar-width: thin;
}

.carousel-track {
  display: flex;
  gap: 1.5rem;
  padding: 0 1rem;
}

.carousel-slide {
  flex: 0 0 auto;
  max-width: 90vw;
}

.btn {
  background-color: #a3d2ca;
  color: #fff;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn:hover {
  background-color: #71c0b2;
}

/* For WebKit browsers (Chrome, Safari) */
.carousel-container::-webkit-scrollbar {
  height: 6px;
}

.carousel-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.carousel-container::-webkit-scrollbar-thumb {
  background: #a3d2ca;
  border-radius: 10px;
}

.carousel-container::-webkit-scrollbar-thumb:hover {
  background: #71c0b2;
}
</style>