<template>
  <div class="min-h-screen bg-pastel">
    <NavBar />
    <main class="container mx-auto p-4">
      <h1 class="text-2xl font-bold mb-4">Add New Artwork</h1>
      
      <div class="mb-4">
        <label class="block mb-2">Upload Image</label>
        <input type="file" @change="handleFileUpload" accept="image/*" class="mb-2">
        <div v-if="imagePreview" class="mb-4">
          <img :src="imagePreview" alt="Preview" class="max-w-full h-auto max-h-64">
        </div>
      </div>
      
      <div class="mb-4">
        <label class="block mb-2">Caption</label>
        <textarea v-model="caption" placeholder="Write a caption..." class="input w-full"></textarea>
      </div>
      
      <button @click="uploadArt" class="btn" :disabled="isUploading">
        {{ isUploading ? 'Uploading...' : 'Share Artwork' }}
      </button>
    </main>
  </div>
</template>

<script>
import { ref, push, set } from "firebase/database";
import { auth, db } from "@/firebase";
import NavBar from "@/components/NavBar.vue";

export default {
  name: "AddArtPage",
  components: {
    NavBar
  },
  data() {
    return {
      selectedFile: null,
      imagePreview: null,
      caption: "",
      isUploading: false
    };
  },
  methods: {
    handleFileUpload(event) {
      this.selectedFile = event.target.files[0];
      if (this.selectedFile) {
        const reader = new FileReader();
        reader.onload = e => {
          this.imagePreview = e.target.result;
        };
        reader.readAsDataURL(this.selectedFile);
      }
    },

    async uploadArt() {
      if (!this.selectedFile) {
        alert("Please select an image to upload");
        return;
      }
      
      // Check user authentication
      if (!auth.currentUser) {
        alert("You must be logged in to upload artwork");
        this.$router.push('/login');
        return;
      }
      
      this.isUploading = true;
      try {
        const imgbbApiKey = process.env.VUE_APP_IMGBB_API_KEY;
        console.log("ImgBB API Key:", !!imgbbApiKey);
        
        if (!imgbbApiKey) {
          throw new Error("ImgBB API Key not configured");
        }
        
        // Convert file to base64
        const reader = new FileReader();
        const base64Image = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result.split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(this.selectedFile);
        });
        
        // Prepare form data for ImgBB
        const formData = new FormData();
        formData.append('key', imgbbApiKey);
        formData.append('image', base64Image);
        formData.append('name', this.selectedFile.name);
        
        // Optional: set expiration (in seconds, e.g., 600 for 10 minutes)
        // formData.append('expiration', '600');
        
        const response = await fetch('https://api.imgbb.com/1/upload', {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) {
          throw new Error(`ImgBB API error: ${response.status}`);
        }
        
        const result = await response.json();
        console.log("Response data:", result);
        
        if (result.success) {
          const postsRef = ref(db, "posts");
          const newPostRef = push(postsRef);
          await set(newPostRef, {
            authorId: auth.currentUser.uid,
            imageUrl: result.data.url, 
            caption: this.caption,
            timestamp: new Date().toISOString(),
            comments: {},
            emojis: {}
          });
          this.$router.push('/dashboard');
        } else {
          throw new Error("Failed to upload image to ImgBB");
        }
      } catch (error) {
        console.error("Error uploading artwork:", error);
        alert("Failed to upload artwork. Please try again.");
      } finally {
        this.isUploading = false;
      }
    }


  }
};
</script>

<style scoped>
.input {
  display: block;
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 0.25rem;
}
.btn {
  background-color: #a3d2ca;
  color: #fff;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
}
.btn:hover {
  background-color: #71c0b2;
}
.btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
</style>