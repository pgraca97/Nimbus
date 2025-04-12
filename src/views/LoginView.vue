<template>
  <!-- Main container for the forms -->
  <div class="page-wrapper">
    <!-- Background SVG -->
    <div class="background-svg">
      <svg width="1280" height="175" viewBox="0 0 1280 175" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M0 175H1279.6L1279.44 96.243C1279.44 93.8678 1274.03 91.9493 1267.3 91.8123C1169.44 90.1087 1119.23 69.0991 1067.42 47.417C1033.09 33.0556 998.068 18.3992 948.023 8.86243C888.258 -2.55688 801.843 -1.27795 741.682 12.2882C702.9 21.0566 672.126 33.7939 641.445 46.4924C603.242 62.3046 565.184 78.0568 511.99 86.0113C428.081 98.5726 327.549 91.858 266.465 67.6034C253.763 62.5709 241.644 57.449 229.67 52.388L229.668 52.3873C170.998 27.59 115.774 4.2497 12.2328 0.00104126H11.3092C6.03198 -0.044613 1.81018 1.41706 1.81018 3.19843L0 175Z" fill="#F8D581"/>
      </svg>
    </div>
    <div class="form-wrapper">
      <!-- Login form wrapper -->
      <main class="login form">
        <!-- Form element with submit event handler -->
        <form @submit.prevent="login">
          <!-- Title for the login form -->
          <h1>hello!</h1>
          <!-- Input container for username -->
          <InputField
            id="username"
            placeholder="username or email"
            v-model="identifier"
            required
          />
          <InputField
            id="passwordInput"
            type="password"
            placeholder="password"
            v-model="password"
            required
          />
          <!-- Link for password recovery -->
          <ActionLink text="Forgot your password?" class="left"/>
          
          <div class="buttons-row">
            <!-- Login submission button -->
            <CustomButton
              buttonType="submit"
              buttonText="Log In"
            />
            <!-- Social login options -->
            <CustomButton
              buttonClass="google social-sign-up"
              iconSrc="google"
            />
            <CustomButton
              buttonClass="apple social-sign-up"
              iconSrc="apple"
            />
          </div>

          <!-- Container for error messages -->
          <ErrorMessage :message="errorMessage" @clear-error="handleClearError" class="login"/>
          
          <!-- Link to sign-up page -->
          <ActionLink preText="New to Nimbus?" text="Sign Up" @handleClick="goToSignUp" />
        </form>
      </main>
    </div>
  </div>
</template>

<script>
import InputField from '@/components/InputField.vue';
import ActionLink from '@/components/ActionLink.vue';
import CustomButton from '@/components/CustomButton.vue';
import ErrorMessage from '@/components/ErrorMessage.vue';
// Import user store from Pinia
import { useUserStore } from '@/stores/user';


export default {
  data() {
    return {
      identifier: "", // Bound to username input
      password: "", // Bound to password input
      errorMessage: "", // Used to display login error messages
    };
  },
  components: {
    InputField,
    ActionLink,
    CustomButton,
    ErrorMessage,
  },
  computed: {
    // Access to Pinia user store
    store() {
      return useUserStore();
    }
  },
  watch: {
    identifier() {
      this.handleClearError(); // Clear error message when username changes
    },
    password() {
      this.handleClearError(); // Clear error message when password changes
    },
  },
  // Methods of the component
  methods: {
    // Function to handle login
    async login() {
      try {
        // Attempting to log in with provided credentials
        await this.store.login(this.identifier, this.password);
        // On successful login, redirect to the landing page
        this.$router.push({ name: "landingPage" });
      } catch (error) {
        // If login fails, set the error message
        this.errorMessage = error.message;
      }
    },
    handleClearError() {
      this.errorMessage = "";
    },
    goToSignUp(event) {
      // Redirect to the sign-up page
      if (event.target.classList.contains('main-text')) {
      this.$router.push({ name: 'signUp' });
      }
    },

  },
};
</script>


<style scoped>
.background-svg {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 1;
  margin-bottom: -1px; /* Remove the tiny gap */
}

.background-svg svg {
  width: 100%;
  height: auto;
  display: block; /* Remove any potential spacing */
}

.page-wrapper {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--background-color);
  overflow: hidden;
}

.form-wrapper {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 400px;
  margin: 2rem;
}

.form {
  background: #F2CAAC;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.buttons-row {
  display: flex;
  align-items: center;  
  gap: 0.5rem;
  margin: 1rem 0;
}

.social-sign-up {
  width: 48px;
  height: 48px;
  padding: 0.5rem;
  border-radius: 0.5rem;
}

h1 {
  margin-bottom: 2rem;
  font-size: 2rem;
  color: var(--text-color);
  font-family: 'Recoleta', serif;
}

.left {
  text-align: left;
  margin: 0.5rem 0;
}

form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>