<template>
    <div class="post-container">

      <div class="image-wrapper">
        <img class="post-image" :src="post.imageUrl" alt="" @click="togglePostDetails" />
      </div>

      <p class="caption">{{ post.caption }}</p> 

      <span class="author-name" @click="showUserProfile(post.authorId)">
        {{ post.authorName || 'Anonymous User name' }}
        <br>
        <br>
        <span class="author-id">{{ post.authorId || 'Anonymous User ID' }}</span>
      </span>
    
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
  
        <div class="comments-container" ref="commentsContainer">
          <p v-if="Object.keys(post.comments || {}).length === 0" class="no-comments">It's quiet here. Leave a comment!</p>
          <ul class="comments-list">
            <li v-for="comment in Object.values(post.comments || {})" :key="comment.timestamp" class="comment-item">
              <div class="comment-header">
                <span class="comment-author-name" @click="showUserProfile(comment.authorId)">
                  {{ comment.authorName || 'Anonymous User name' }}
                    <span class="comment-author-id">
                      {{ comment.authorId || 'Anonymous User ID' }}
                    </span>
                </span>
                <span class="comment-time">{{ formatTimestamp(comment.timestamp) }}</span>
              </div>
              <p class="comment-text">{{ comment.text }}</p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, update, push, get } from "firebase/database";
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
          return; 
        }
        const userRef = ref(db, `users/${auth.currentUser.uid}`);
        get(userRef).then((snapshot) => {
          const userData = snapshot.val();
          const userName = userData.name; 
          const commentsRef = ref(db, `posts/${this.post.id}/comments`);
          const newCommentKey = push(commentsRef).key;
          const updates = {};
          updates[`posts/${this.post.id}/comments/${newCommentKey}`] = {
            authorId: auth.currentUser.uid,
            authorName: userName, 
            text: this.newComment,
            timestamp: new Date().toISOString(),
          };
          update(ref(db), updates).then(() => {
            this.newComment = ""; 
            this.$nextTick(() => {
              this.scrollToLatestComment();
            });
          });
        }).catch((error) => {
          console.error("Error fetching user data:", error);
        });
      }, 
      scrollToLatestComment() {
        if (this.$refs.commentsContainer) {
          this.$refs.commentsContainer.scrollTop = this.$refs.commentsContainer.scrollHeight;
        }
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
      },
      showUserProfile(userId) {
        if (userId) {
          console.log(`User found with ID: ${userId}`);
          this.$emit('show-profile', userId);
        }
      }
    },
    updated() {
      if (this.isSelected && Object.keys(this.post.comments || {}).length > 0) {
        this.scrollToLatestComment();
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

  .author-name {
    margin: 0.5rem 0 1rem;
    font-size: 1rem;
    text-align: center;
    color: #555;
    width: 100%;
    font-weight: bold;
  }

  .author-id {
    margin: 0.5rem 0 1rem;
    font-size: 1rem;
    font-style: italic;
    text-align: center;
    color: #555;
    width: 100%;
    font-weight: normal;
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
    padding: 0.5rem;
    margin: 0;
  }
  
  .comments-container {
      max-height: 300px; 
      overflow-y: auto; 
      margin-top: 1rem;
      padding-right: 0.5rem; 
      border: 1px solid #eee;
      border-radius: 0.25rem;
    }

    .comments-container::-webkit-scrollbar {
      width: 6px;
    }

    .comments-container::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 3px;
    }

    .comments-container::-webkit-scrollbar-thumb {
      background: #a3d2ca;
      border-radius: 3px;
    }

    .comments-container::-webkit-scrollbar-thumb:hover {
      background: #71c0b2;
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
  
  .comment-author-name {
    font-weight: bold;
    font-size: 0.9rem;
  }
  
  .comment-author-id {
    font-weight: normal;
    font-style: italic;
    font-size: 0.8rem;
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