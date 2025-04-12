<template>
    <div class="error-container" v-if="message" :class="{ 'error-present': message }">
      <p class="error-message">{{ message }}</p>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      message: {
        type: String,
        default: ''
      }
    },
    data () {
      return {
        errorTimeout: null, // Keep track of the error timeout
      }
    },
    watch: {
      message(newValue) {
        if (newValue) {
            this.errorTimeout = setTimeout(() => {
            this.$emit('clear-error');
          }, 3000);
        }
      }
    },
    unmounted () {
        clearTimeout(this.errorTimeout); // Clear the timeout when component is destroyed
    }
  };
  </script>
  
  <style scoped>
  
  .error-container {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease-out;
    margin: 1rem 0;
    width: 100%;
  }

  .login .error-message{
    margin-bottom: 1rem;
  }
  

  /* When an error is present, increase the max-height */
  .error-container.error-present {
    max-height: 100px;
  }
  
  
  .error-message {
    color: #B21C29;
    font-family: 'Asap Regular', sans-serif;
    font-size: 0.9rem;
    margin: 0;
    padding: 0.75rem;
    background-color: rgba(178, 28, 41, 0.1);
    border-radius: 6px;
    text-align: center;
    line-height: 1.4;
    word-wrap: break-word;
  }
  
  </style>
  