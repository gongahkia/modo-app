<template>
  <div class="min-h-screen flex items-center justify-center bg-pastel">
    <div class="auth-container">
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
            <label class="block mt-2">
              <input type="checkbox" v-model="registerForm.notificationsEnabled" /> Enable Notifications
            </label>
            <button type="submit" class="btn">Register</button>
          </form>
        </div>
      </div>
    </div>
    
    <!-- Terms and Conditions Modal -->
    <div v-if="showTermsModal" class="terms-modal-overlay" @click.self="closeTermsModal">

      <div class="terms-modal" ref="termsModal">

        <h2 class="text-xl font-bold mb-4">Terms and Conditions</h2>

        <div class="terms-content" ref="termsContent" @scroll="checkScroll">

          <h3 class="font-bold">1. Introduction</h3>
          <p>Welcome to Modo. By using our application, you agree to these terms and conditions. These Terms and Conditions ("Terms") constitute a legally binding agreement between you ("User," "you," or "your") and Modo ("we," "us," or "our") governing your access to and use of the Modo application, including any associated services, features, content, and functionality (collectively, the "Application"). By downloading, accessing, or using our Application, you acknowledge that you have read, understood, and agree to be bound by these Terms. If you do not agree to these Terms, please do not access or use the Application.</p>
          <p>These Terms may be updated from time to time at our sole discretion. It is your responsibility to review these Terms periodically for changes. Your continued use of the Application following the posting of revised Terms means that you accept and agree to the changes.</p>
          
          <h3 class="font-bold mt-4">2. User Accounts</h3>

          <h4 class="font-bold">2.1 Registration Requirements</h4>
          <p>To access certain features of the Application, you may be required to register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.</p>

          <h4 class="font-bold">2.2 Account Security</h4> 
          <p>You are responsible for maintaining the confidentiality of your account information, including your username and password. You agree to accept responsibility for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account or any other breach of security.</p>

          <h4 class="font-bold">2.3 Age Restrictions</h4> 
          <p>You must be at least 13 years of age to create an account and use the Application. If you are under 18 years of age, you represent that you have your parent or guardian's permission to use the Application. Please have them read these Terms with you.</p>

          <h4 class="font-bold">2.4 Account Termination</h4>
          <p>We reserve the right to suspend or terminate your account and access to the Application at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users of the Application, us, or third parties, or for any other reason.</p>

          <h3 class="font-bold mt-4">3. Privacy Policy</h3>
          <p>Our Privacy Policy describes how we collect, use, store, and share your personal information when you use our Application. By using Modo, you consent to the data practices described in our Privacy Policy, which is incorporated by reference into these Terms.</p>

          <h4 class="font-bold">3.1 Data Collection</h4>
          <p>We collect personal information as described in our Privacy Policy. This may include information you provide directly, information collected automatically, and information from third-party sources.</p>

          <h4 class="font-bold">3.2 Data Security</h4>
          <p>We implement reasonable security measures to protect your personal information from unauthorized access, disclosure, alteration, and destruction. However, no internet or electronic transmission is ever fully secure or error-free.</p>

          <h4 class="font-bold">3.3 Third-Party Services</h4>
          <p>The Application may integrate with or contain links to third-party services. We are not responsible for the privacy practices or content of these third-party services.</p>
          
          <h3 class="font-bold mt-4">4. Content Guidelines</h3>
          
          <h4 class="font-bold">4.1 User Content</h4> 
          <p>Users may have the ability to create, post, share, or store content on the Application ("User Content"). You retain ownership rights in your User Content, but you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, adapt, publish, translate, and distribute your User Content in connection with the Application.</p>

          <h4 class="font-bold">4.2 Prohibited Content</h4> 
          <p>You agree not to post, upload, or share any User Content that:</p>

          <ul>
              <li>
                Is illegal, fraudulent, deceptive, or misleading
              </li>
              <li>
                Infringes on intellectual property rights of others
              </li>
              <li>
                Contains viruses, malware, or other harmful code
              </li>
              <li>
                  Constitutes hate speech, harassment, or threats
              </li>
              <li>
                  Is obscene, pornographic, or sexually explicit
              </li>
              <li>
                  Invades another's privacy
              </li>
              <li>
                  Promotes violence or discrimination
              </li>
              <li>
                  Is spam or commercial solicitation without our prior approval
              </li>
            </ul>

          <h4 class="font-bold">4.3  Content Monitoring</h4>
          <p>We reserve the right, but have no obligation, to monitor, edit, or remove any User Content that we determine, in our sole discretion, violates these Terms or is otherwise objectionable.</p>

          <h3 class="font-bold mt-4">5. Intellectual Property</h3>
          <p>All content and materials available on Modo, including but not limited to text, graphics, logos, icons, images, audio clips, digital downloads, data compilations, and software, are the property of Modo or its content suppliers and are protected by intellectual property laws. The compilation of all content on the Application is the exclusive property of Modo and is protected by intellectual property laws.</p>
          
          <h3 class="font-bold mt-4">6. Limitation of Liability</h3>

          <h4 class="font-bold">6.1 Disclaimer of Warranties</h4>
          <p>THE APPLICATION IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, OR COURSE OF PERFORMANCE.</p>

          <h4 class="font-bold">6.2 Limitation of Liability</h4>
          <p>TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL MODO, ITS AFFILIATES, OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, SUPPLIERS, OR LICENSORS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM:</p>

          <ul>
              <li>
                YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE APPLICATION
              </li>
              <li>
                ANY CONDUCT OR CONTENT OF ANY THIRD PARTY ON THE APPLICATION
              </li>
              <li>
                ANY CONTENT OBTAINED FROM THE APPLICATION
              </li>
              <li>
                UNAUTHORIZED ACCESS, USE, OR ALTERATION OF YOUR TRANSMISSIONS OR CONTENT
              </li>
              <li>
                WHETHER BASED ON WARRANTY, CONTRACT, TORT (INCLUDING NEGLIGENCE), OR ANY OTHER LEGAL THEORY, WHETHER OR NOT WE HAVE BEEN INFORMED OF THE POSSIBILITY OF SUCH DAMAGE
              </li>
          </ul>

          <h4 class="font-bold">6.3 Indemnification</h4>
          <p>You agree to defend, indemnify, and hold harmless Modo and its affiliates, officers, directors, employees, and agents from and against any and all claims, damages, obligations, losses, liabilities, costs, or debt, and expenses (including but not limited to attorney's fees) arising from:</p>

          <ul>
              <li>
                Your use of and access to the Application
              </li>
              <li>
                Your violation of any term of these Terms
              </li>
              <li>
                Your violation of any third-party right, including without limitation any copyright, property, or privacy right
              </li>
              <li>
                Any claim that your User Content caused damage to a third party
              </li>
          </ul>

          <h3 class="font-bold mt-4">7. Termination</h3>
          <p>We may terminate or suspend your account and access to the Application immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach these Terms.</p>
          <p>You may terminate your account at any time by following the instructions in the Application or by contacting us.</p>
          <p>Upon termination, your right to use the Application will immediately cease. All provisions of these Terms which by their nature should survive termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity, and limitations of liability.</p>
          <p>We may retain certain information as required by law or as necessary for our legitimate business purposes. All retained information will continue to be subject to these Terms and our Privacy Policy.</p>
          
          <h3 class="font-bold mt-4">8. Changes to Terms</h3>
          <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of any changes by posting the new Terms on the Application. What constitutes a material change will be determined at our sole discretion.</p>
          <p>By continuing to access or use our Application after those revisions become effective, you agree to be bound by the revised Terms. If you do not agree to the new Terms, please stop using the Application.</p>
          
          <h3 class="font-bold mt-4">9. Governing Law</h3>
          <p>These Terms shall be governed and construed in accordance with the laws of the jurisdiction in which Modo is established, without regard to its conflict of law provisions.</p>

          <h4 class="font-bold">9.1 Dispute Resolution</h4>
          <p>Any dispute arising out of or relating to these Terms, or the breach thereof, shall be settled by arbitration administered by a recognized arbitration authority under its applicable rules, and judgment on the award rendered by the arbitrator(s) may be entered in any court having jurisdiction thereof.</p>

          <h4 class="font-bold">9.2 Class Action Waiver</h4>
          <p>Any proceedings to resolve or litigate any dispute in any forum will be conducted solely on an individual basis. Neither you nor we will seek to have any dispute heard as a class action or in any other proceeding in which either party acts or proposes to act in a representative capacity.</p>

          <h4 class="font-bold">9.3 Severability</h4>
          <p>If any provision of these Terms is held to be unenforceable or invalid, such provision will be changed and interpreted to accomplish the objectives of such provision to the greatest extent possible under applicable law and the remaining provisions will continue in full force and effect.</p>

          <h3 class="font-bold mt-4">10. Contact Information</h3>
          <p>For questions about these Terms, please contact us at:</p>

          <ul>
            <li>By opening an issue at the GitHub repository: <a href="https://github.com/gongahkia/modo-app">github.com/gongahkia/modo-app</a></li>
            <li>By contacting the GitHub account: <a href="https://github.com/gongahkia">gongahkia</a></li>
          </ul>

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

export default {
  name: "AuthPage",
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
          profilePic: "",
          uniqueCode: uniqueId,
          following: {},
          blacklist: {},
          settings: {
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
.auth-container {
  max-width: 800px;
  width: 90%;
  padding: 2rem;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin: 0 auto; 
}

.logo {
  width: 30%;
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
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
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
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
}
</style>