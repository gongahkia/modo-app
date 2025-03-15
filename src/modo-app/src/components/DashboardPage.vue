<template>
  <div class="min-h-screen bg-pastel">
    <header class="flex items-center justify-between p-4 bg-white shadow">
      <img src="@/assets/modo.png" alt="Modo Logo" class="w-12" />
      <button @click="$router.push('/settings')" class="btn">Settings</button>
    </header>
    <main>
      <!-- Carousel -->
      <div v-for="post in posts" :key="post.id" class="carousel-item">
        <img :src="post.imageUrl" alt="" @click="selectPost(post.id)" />
        <p class="caption">{{ post.caption }}</p> <!-- Display post caption -->
        <!-- Emoji and comments -->
        <div v-if="selectedPost === post.id">
          <textarea v-model="newComment" placeholder="Add a comment..." class="input"></textarea>
          <button @click="addComment(post.id)" class="btn">Add Comment</button>
          <div class="emoji-section">
            <span v-for="emoji in emojis" :key="emoji" @click="addEmoji(post.id, emoji)" class="emoji">{{ emoji }}</span>
          </div>
          <!-- Display emojis/comments -->
          <ul>
            <li v-for="comment in Object.values(post.comments || {})" :key="comment.timestamp">
              {{ comment.text }}
            </li>
          </ul>
          <ul>
            <li v-for="(users, emoji) in post.emojis || {}" :key="emoji">
              {{ emoji }}: {{ users.length }}
            </li>
          </ul>
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

export default {
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
  color: #555;
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
</style>