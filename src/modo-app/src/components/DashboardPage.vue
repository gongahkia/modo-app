<template>
  <div class="min-h-screen bg-pastel">
    <NavBar />
    <main>
      <!-- Carousel -->
      <div v-if="posts.length == 0" class="carousel">
        <p>No posts found. Follow someone to get started.</p>
      </div>  
      <div v-for="post in posts" :key="post.id" class="carousel-item">
        <div class="post-container">
          <img class="post-image" :src="post.imageUrl" alt="" @click="selectPost(post.id)" />
          <p class="caption">{{ post.caption }}</p> 
        </div>
        <div v-if="selectedPost === post.id">
          <textarea v-model="newComment" placeholder="Add a comment..." class="input"></textarea>
          <button @click="addComment(post.id)" class="btn">Add Comment</button>

          <div class="emoji-section">
            <span v-for="emoji in emojis" :key="emoji" @click="addEmoji(post.id, emoji)" class="emoji">{{ emoji }}</span>
          </div>

          <div class="emoji-container">
            <div v-for="(users, emoji) in post.emojis || {}" :key="emoji" class="emoji-item">
              <span class="emoji">{{ emoji }}</span>
              <span class="emoji-count">{{ users.length }}</span>
            </div>
          </div>

          <div class="comment-section">
            <ul v-if="hasComments" class="comments-list">
              <li v-for="comment in Object.values(post.comments || {})" :key="comment.timestamp" class="comment-item">
                <div class="comment-header">
                  <span class="comment-author">{{ comment.authorName || comment.authorId || 'Anonymous' }}</span>
                  <span class="comment-time">{{ formatTimestamp(comment.timestamp) }}</span>
                </div>
                <p class="comment-text">{{ comment.text }}</p>
              </li>
            </ul>
            <p v-else class="no-comments">No comments yet. Leave a comment!</p>
          </div>

        </div>
      </div>
    </main>
    <!-- Add Art -->
    <footer class="fixed bottom-0 w-full bg-white shadow p-4 flex justify-center">
      <button @click="$router.push('/add-art')" class="btn">Add Art</button>
    </footer>
  </div>
</template>

<script>
import { ref, onValue, update, push } from "firebase/database";
import { auth, db } from "@/firebase";
import NavBar from "@/components/NavBar.vue";

export default {
  name: "DashboardPage", 
  components: {
    NavBar,
  },
  data() {
    return {
      posts: [],
      selectedPost: null,
      newComment: "",
      emojis: ["👍", "❤️", "😂", "🔥", "🎨"], // Available emojis
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
    selectPost(postId) {
      this.selectedPost = postId;
    },
    addComment(postId) {
      const commentsRef = ref(db, `posts/${postId}/comments`);
      const newCommentKey = push(commentsRef).key;
      const updates = {};
      if this.newComment == "" {
        return // ignore the empty comment 
      }
      updates[`posts/${postId}/comments/${newCommentKey}`] = {
        authorId: auth.currentUser.uid, // Include the author ID as per the schema
        text: this.newComment,
        timestamp: new Date().toISOString(), // Use ISO8601 format
      };
      update(ref(db), updates).then(() => {
        this.newComment = ""; // Clear the input field after adding the comment
      });
    },
    addEmoji(postId, emoji) {
      const emojiRef = ref(db, `posts/${postId}/emojis/${emoji}`);
      onValue(emojiRef, (snapshot) => {
        const currentUsers = snapshot.val() || [];
        if (!currentUsers.includes(auth.currentUser.uid)) {
          currentUsers.push(auth.currentUser.uid); // Add the current user's ID to the list
          update(ref(db), { [`posts/${postId}/emojis/${emoji}`]: currentUsers });
        }
      });
    },

    formatTimestamp(timestamp) {
      if (!timestamp) return '';
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return timestamp;
      const now = new Date();
      const isCurrentYear = now.getFullYear() === date.getFullYear();
      const options = {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      };
      if (!isCurrentYear) {
        options.year = 'numeric';
      }
      return date.toLocaleString('en-US', options);
    }
  },
  computed: {
    hasComments() {
      return post.comments && Object.keys(post.comments).length > 0;
    }
  },
  mounted() {
    this.fetchPosts();
  },
};
</script>

<style scoped>
.carousel-item img {
  width: 100%;
  border-radius: 0.5rem;
}
.caption {
  margin-top: 0.5rem;
  font-size: 1rem;
  text-align: center;
  color: #555;
  max-width: 250px; 
}
.post-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1rem;
}
.post-image {
  width: 250px; /* Fixed width */
  height: 250px; /* Fixed height */
  object-fit: cover; /* Maintains aspect ratio */
  cursor: pointer;
}
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
.emoji-section span {
  cursor: pointer;
  margin-right: 0.5rem;
}

.emoji-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 12px;
}

.emoji-item {
  display: flex;
  align-items: center;
  background-color: #f0f0f0;
  border-radius: 16px;
  padding: 4px 10px;
}

.emoji {
  font-size: 1.2rem;
  margin-right: 4px;
}

.emoji-count {
  font-size: 0.8rem;
  color: #666;
}

.comments-list {
  list-style-type: none;
  padding: 0;
}

.comment-item {
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.comment-author {
  font-weight: bold;
  font-size: 0.9rem;
}

.comment-time {
  font-size: 0.8rem;
  color: #666;
}

.comment-text {
  font-size: 0.95rem;
  margin: 0;
}

.comments-section {
  margin-top: 12px;
}

.no-comments {
  text-align: center;
  color: #888;
  font-size: 0.9rem;
  font-style: italic;
  padding: 8px 0;
}
</style>