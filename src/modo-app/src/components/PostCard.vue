<template>
    <div class="post-container">
      <div class="image-wrapper">
        <img class="post-image" :src="post.imageUrl" alt="" @click="togglePostDetails" />
      </div>
      <p class="caption">{{ post.caption }}</p> 
    
      <div v-if="isSelected" class="post-details">
        <textarea v-model="newComment" placeholder="Add a comment..." class="input"></textarea>
        <button @click="addComment" class="btn">Add Comment</button>
  
        <div class="emoji-section">
          <span v-for="emoji in emojis" :key="emoji" @click="addEmoji(emoji)" class="emoji">{{ emoji }}</span>
        </div>
  
        <div class="emoji-container">
          <div v-for="(users, emoji) in post.emojis || {}" :key="emoji" class="emoji-item">
            <span class="emoji">{{ emoji }}</span>
            <span class="emoji-count">{{ users.length }}</span>
          </div>
        </div>
  
        <p v-if="Object.keys(post.comments || {}).length === 0" class="no-comments">It's quiet here. Leave a comment!</p>
        <ul class="comments-list">
          <li v-for="comment in Object.values(post.comments || {})" :key="comment.timestamp" class="comment-item">
            <div class="comment-header">
              <span class="comment-author">{{ comment.authorName || comment.authorId || 'Anonymous' }}</span>
              <span class="comment-time">{{ formatTimestamp(comment.timestamp) }}</span>
            </div>
            <p class="comment-text">{{ comment.text }}</p>
          </li>
        </ul>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, update, push } from "firebase/database";
  import { onValue } from "firebase/database";
  import { auth, db } from "@/firebase";
  
  export default {
    name: "PostCard",
    props: {
      post: {
        type: Object,
        required: true
      },
      isSelected: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        newComment: "",
        emojis: ["👍", "❤️", "😂", "🔥", "🎨"], // Available emojis
      };
    },
    methods: {
      togglePostDetails() {
        this.$emit('toggle-details', this.post.id);
      },
      addComment() {
        if (this.newComment === "") {
          return; // ignore the empty comment 
        }
        
        const commentsRef = ref(db, `posts/${this.post.id}/comments`);
        const newCommentKey = push(commentsRef).key;
        const updates = {};
        
        updates[`posts/${this.post.id}/comments/${newCommentKey}`] = {
          authorId: auth.currentUser.uid,
          text: this.newComment,
          timestamp: new Date().toISOString(),
        };
        
        update(ref(db), updates).then(() => {
          this.newComment = ""; // Clear the input field after adding the comment
        });
      },
      addEmoji(emoji) {
        const emojiRef = ref(db, `posts/${this.post.id}/emojis/${emoji}`);
        onValue(emojiRef, (snapshot) => {
          const currentUsers = snapshot.val() || [];
          if (!currentUsers.includes(auth.currentUser.uid)) {
            currentUsers.push(auth.currentUser.uid); // Add the current user's ID to the list
            update(ref(db), { [`posts/${this.post.id}/emojis/${emoji}`]: currentUsers });
          }
        }, { onlyOnce: true }); // Added onlyOnce to prevent multiple listeners
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
    }
  };
  </script>
  
  <style scoped>
  .post-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: white;
    border-radius: 0.75rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    padding: 1rem;
    width: 100%;
  }
  
  .image-wrapper {
    width: 100%;
    display: flex;
    justify-content: center;
    margin-bottom: 0.75rem;
  }
  
  .post-image {
    max-width: 100%;
    max-height: 70vh;
    width: auto;
    height: auto;
    object-fit: contain;
    cursor: pointer;
    border-radius: 0.5rem;
  }
  
  .caption {
    margin: 0.5rem 0 1rem;
    font-size: 1rem;
    text-align: center;
    color: #555;
    width: 100%;
  }
  
  .post-details {
    width: 100%;
    border-top: 1px solid #eee;
    padding-top: 1rem;
    margin-top: 0.5rem;
  }
  
  .input {
    display: block;
    width: 100%;
    padding: 0.75rem;
    margin: 0.75rem 0;
    border: 1px solid #ddd;
    border-radius: 0.25rem;
    font-size: 0.95rem;
    resize: vertical;
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
    margin-bottom: 1rem;
  }
  
  .btn:hover {
    background-color: #71c0b2;
  }
  
  .emoji-section {
    display: flex;
    gap: 0.75rem;
    margin: 1rem 0;
    flex-wrap: wrap;
  }
  
  .emoji {
    cursor: pointer;
    font-size: 1.25rem;
    transition: transform 0.2s;
  }
  
  .emoji:hover {
    transform: scale(1.2);
  }
  
  .emoji-container {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 1rem;
  }
  
  .emoji-item {
    display: flex;
    align-items: center;
    background-color: #f0f0f0;
    border-radius: 16px;
    padding: 4px 10px;
  }
  
  .emoji-count {
    font-size: 0.8rem;
    color: #666;
    margin-left: 4px;
  }
  
  .no-comments {
    color: #888;
    font-style: italic;
    margin: 1rem 0;
  }
  
  .comments-list {
    list-style-type: none;
    padding: 0;
    margin: 0;
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
  </style>