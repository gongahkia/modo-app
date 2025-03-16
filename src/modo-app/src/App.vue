<template>
  <div id="app" class="min-h-screen bg-pastel">
    <router-view />
  </div>
</template>

<script>
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getDatabase, ref, onValue } from 'firebase/database';

export default {
  name: "App",
  data() {
      return {
        auth: null,
        userId: null
      };
    },
    mounted() {
      // Initialize Firebase Auth
      this.auth = getAuth();
      
      // Listen for auth state changes
      onAuthStateChanged(this.auth, (user) => {
        if (user) {
          // User is signed in
          this.userId = user.uid;
          this.fetchThemePreference();
        } else {
          // User is signed out, use default theme
          document.documentElement.classList.remove('dark-theme');
        }
      });
    },
    methods: {
      fetchThemePreference() {
        const db = getDatabase();
        const themeRef = ref(db, `users/${this.userId}/settings/appearance/theme`);
        
        onValue(themeRef, (snapshot) => {
          const theme = snapshot.val();
          if (theme === 'dark') {
            document.documentElement.classList.add('dark-theme');
          } else {
            document.documentElement.classList.remove('dark-theme');
          }
      });
    }
  }
};
</script>

<style>
:root {
  /* Light theme variables (default) */
  --bg-color: #f8f4f9;
  --text-color: #333333;
  --input-border: #ddd;
  --btn-bg: #a3d2ca;
  --btn-hover: #71c0b2;
  --btn-text: #fff;
}

.dark-theme {
  /* Dark theme variables */
  --bg-color: #2d3748;
  --text-color: #f7fafc;
  --input-border: #4a5568;
  --btn-bg: #2c7a7b;
  --btn-hover: #285e61;
  --btn-text: #f7fafc;
}

/* TailwindCSS will handle most of the styling. Add custom styles here if needed. */
body {
  font-family: 'Inter', sans-serif;
}
.bg-pastel {
  background-color: #f8f4f9; /* A calm pastel color */
}
.input {
  display: block;
  width: 100%;
  padding: 0.5rem;
  margin: 0.5rem 0;
  border: 1px solid #ddd;
  border-radius: 0.25rem;
}
.btn {
  background-color: #a3d2ca; /* Pastel green */
  color: #fff;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  cursor: pointer;
}
.btn:hover {
  background-color: #71c0b2; /* Slightly darker green */
}
.carousel-item img {
  width: 100%;
  border-radius: 0.5rem;
}
</style>