<template>

  <div class="min-h-screen flex items-center justify-center relative">
    <DynamicBackground />

    <div class="auth-container z-10 relative">
      <img src="@/assets/modo.png" alt="Modo Logo" class="logo" />
      <h1 class="text-2xl font-bold mb-4">Welcome to Modo</h1>
      
      <!-- Error/Status Message -->
      <div v-if="statusMessage" class="status-message" :class="{ success: isSuccess, error: !isSuccess }">
        {{ statusMessage }}
      </div>
      
      <div class="cards-container">
        <!-- Login Card -->
        <div class="auth-card">
          <h2 class="card-title">Login</h2>
          <form @submit.prevent="handleLogin">
            <input v-model="loginForm.email" type="email" placeholder="Email" class="input" required />
            <input v-model="loginForm.password" type="password" placeholder="Password" class="input" required />
            <button type="submit" class="btn">Login</button>
          </form>
        </div>
        
        <!-- Registration Card -->
        <div class="auth-card">
          <h2 class="card-title">Register</h2>
          <form @submit.prevent="handleRegister">
            <input v-model="registerForm.email" type="email" placeholder="Email" class="input" required />
            <input v-model="registerForm.password" type="password" placeholder="Password" class="input" required />
            <input v-model="registerForm.confirmPassword" type="password" placeholder="Confirm Password" class="input" required />
            <input v-model="registerForm.name" type="text" placeholder="Your Name" class="input" required />
            <input v-model="registerForm.profilePicUrl" type="url" placeholder="Profile Picture URL" class="input" />
            <select v-model="registerForm.themePreference" class="input">
              <option value="light">Light Theme</option>
              <option value="dark">Dark Theme</option>
            </select>
            <label class="block mt-2">
              <input type="checkbox" v-model="registerForm.notificationsEnabled" /> Enable Notifications
            </label>
            <button type="submit" class="btn">Register</button>
          </form>
        </div>
      </div>
    </div>
    
    <!-- Terms and Conditions Modal -->
    <div v-if="showTermsModal" class="terms-modal-overlay z-20" @click.self="closeTermsModal">
      <div class="terms-modal" ref="termsModal">
        <h2 class="text-xl font-bold mb-4">Terms and Conditions</h2>
        <div class="terms-content" ref="termsContent" @scroll="checkScroll">
          <h3 class="font-bold">1. Introduction</h3>
          <p>Welcome to Modo. By using our application, you agree to these terms and conditions.</p>
          
          <h3 class="font-bold mt-4">2. User Accounts</h3>
          <p>You are responsible for maintaining the confidentiality of your account information.</p>
          
          <h3 class="font-bold mt-4">3. Privacy Policy</h3>
          <p>Our privacy policy describes how we handle your personal data and protect your privacy.</p>
          
          <!-- Add more terms sections to make it scrollable -->
          <h3 class="font-bold mt-4">4. Content Guidelines</h3>
          <p>Users are responsible for the content they share on the platform.</p>
          
          <h3 class="font-bold mt-4">5. Intellectual Property</h3>
          <p>All content and materials available on Modo are protected by intellectual property laws.</p>
          
          <h3 class="font-bold mt-4">6. Limitation of Liability</h3>
          <p>Modo is not liable for any damages arising from the use of our services.</p>
          
          <h3 class="font-bold mt-4">7. Termination</h3>
          <p>We reserve the right to terminate accounts that violate our terms.</p>
          
          <h3 class="font-bold mt-4">8. Changes to Terms</h3>
          <p>We may update these terms from time to time. Continued use of Modo after changes constitutes acceptance.</p>
          
          <h3 class="font-bold mt-4">9. Governing Law</h3>
          <p>These terms are governed by applicable laws.</p>
          
          <h3 class="font-bold mt-4">10. Contact Information</h3>
          <p>For questions about these terms, please contact us.</p>
        </div>
        <div class="terms-actions">
          <button 
            class="btn" 
            :disabled="!hasScrolledToBottom" 
            @click="acceptTermsAndRegister"
          >
            I Accept
          </button>
          <button class="btn btn-secondary" @click="closeTermsModal">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { auth, db } from "@/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set } from "firebase/database";
import DynamicBackground from "@/components/DynamicBackground.vue"; 

export default {
  name: "AuthPage",
  components: {
    DynamicBackground
  }
  data() {
    return {
      isRegistering: false,
      statusMessage: "",
      isSuccess: false,
      
      // Separate form data for login and registration
      loginForm: {
        email: "",
        password: ""
      },
      
      registerForm: {
        email: "",
        password: "",
        confirmPassword: "",
        name: "",
        profilePicUrl: "",
        themePreference: "light",
        notificationsEnabled: true
      },
      
      // Terms and conditions modal
      showTermsModal: false,
      hasScrolledToBottom: false
    };
  },
  methods: {
    async handleLogin() {
      try {
        const userCredential = await signInWithEmailAndPassword(
          auth, 
          this.loginForm.email, 
          this.loginForm.password
        );
        console.log("User logged in:", userCredential.user);
        this.showStatusMessage("Login successful! Redirecting...", true);
        this.$router.push("/dashboard");
      } catch (error) {
        this.showStatusMessage(`Login failed: ${error.message}`, false);
      }
    },
    
    handleRegister() {
      // Validate passwords match
      if (this.registerForm.password !== this.registerForm.confirmPassword) {
        this.showStatusMessage("Passwords do not match. Please try again.", false);
        return;
      }
      
      // Show terms and conditions modal
      this.showTermsModal = true;
    },
    
    async completeRegistration() {
      try {
        // Register a new user
        const userCredential = await createUserWithEmailAndPassword(
          auth, 
          this.registerForm.email, 
          this.registerForm.password
        );
        const user = userCredential.user;

        const uniqueId = Math.floor(100000 + Math.random() * 900000).toString();

        // Initialize the user object in Firebase Realtime Database
        const userRef = ref(db, `users/${user.uid}`);
        await set(userRef, {
          name: this.registerForm.name || "",
          email: user.email,
          profilePic: this.registerForm.profilePicUrl || "",
          uniqueCode: uniqueId,
          following: {},
          blacklist: {},
          settings: {
            appearance: { theme: this.registerForm.themePreference },
            notificationsEnabled: this.registerForm.notificationsEnabled,
          },
          createdAt: new Date().toISOString(),
        });

        this.showStatusMessage("Registration successful! Redirecting to the dashboard...", true);
        this.$router.push("/dashboard");
      } catch (error) {
        this.showStatusMessage(`Registration failed: ${error.message}`, false);
      }
    },
    
    checkScroll(event) {
      const element = event.target;
      // Check if user has scrolled to the bottom
      const isAtBottom = Math.abs(
        (element.scrollHeight - element.scrollTop) - element.clientHeight
      ) < 1;
      
      if (isAtBottom) {
        this.hasScrolledToBottom = true;
      }
    },
    
    acceptTermsAndRegister() {
      if (this.hasScrolledToBottom) {
        this.closeTermsModal();
        this.completeRegistration();
      }
    },
    
    closeTermsModal() {
      this.showTermsModal = false;
      this.hasScrolledToBottom = false;
    },
    
    showStatusMessage(message, isSuccess) {
      this.statusMessage = message;
      this.isSuccess = isSuccess;

      // Automatically hide the message after 3 seconds
      setTimeout(() => {
        this.statusMessage = "";
      }, 3000);
    }
  }
};
</script>
<style scoped>

.logo {
  width: 10%;
  height: auto;
  margin: 0 auto 1rem;
  display: block;
}

.cards-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

@media (min-width: 768px) {
  .cards-container {
    flex-direction: row;
  }
}

.auth-card {
  flex: 1;
  padding: 1.5rem;
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
  opacity: 0.7;
}

.card-title {
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 1rem;
  text-align: center;
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
  display: block;
  width: 100%;
  background-color: #a3d2ca;
  color: #fff;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  margin-top: 1rem;
  cursor: pointer;
}

.btn:hover {
  background-color: #71c0b2;
}

.btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #f8f9fa;
  color: #333;
  border: 1px solid #ddd;
}

.btn-secondary:hover {
  background-color: #e9ecef;
}

.status-message {
  margin-bottom: 1rem;
  padding: 0.75rem;
  border-radius: 0.25rem;
}

.status-message.success {
  background-color: #d4edda;
  color: #155724;
}

.status-message.error {
  background-color: #f8d7da;
  color: #721c24;
}

/* Terms and Conditions Modal */
.terms-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 20;
}

.terms-modal {
  background-color: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.terms-content {
  flex-grow: 1;
  overflow-y: auto;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 0.25rem;
  margin: 1rem 0;
  max-height: 50vh;
}

.terms-actions {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.min-h-screen {
  min-height: 100vh;
  display: flex;
  position: relative;
  align-items: center;
  justify-content: center;
  overflow: hidden; /* Prevents any overflow from the background */
}

.auth-container {
  max-width: 800px;
  width: 90%;
  padding: 2rem;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin: 0 auto;
  position: relative;
  z-index: 10; 
}

</style>