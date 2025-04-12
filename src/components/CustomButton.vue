<template>
      <button :type="buttonType" :class="buttonClass">
        <img v-if="iconSrc" :src="computedIconSrc" class="icon" />
        <span v-if="buttonText">{{ buttonText }}</span>
      </button>
  </template>
  
  <script>

  
  export default {
    props: {
      buttonText: String,
      buttonType: {
        type: String,
        default: 'button' // 'submit', 'button', etc.
      },
      buttonClass: {
        type: String,
        default: 'button-class'
      },
      iconSrc: String // Passing a keyword to perform the correct local path
    },
    computed: {
      computedIconSrc() {
        console.log(this.iconSrc);
        return new URL(`/src/assets/icons/${this.iconSrc}.svg`, import.meta.url).href
      }
    }
  };
  </script>
  <style scoped>
  /* Styles for your submit button */

button {
  border: 1px solid #303030;
  border-radius: 10px;
  cursor: pointer;
  font-family: 'Asap ExtraBold', sans-serif;
  font-size: 1.1rem;
  transition: all 0.2s ease-in-out;
}

button:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.button-class {
  width: 100%;
  padding: 1rem;
  background-color: #FAC54B;
  color: #303030;
}

.button-class:hover {
  background-color: #fbd06a;
}

.social {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.8rem 1.2rem;
  background-color: white;
  color: #303030;
  gap: 0.8rem;
  width: 100%;
  font-size: 1rem;
}

.social:hover {
  background-color: #f8f8f8;
}

.social .icon {
  width: 20px;
  height: 20px;
}

.social-sign-up {
  width: 48px;
  height: 48px;
  padding: 0.8rem;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.social-sign-up .icon {
  width: 24px;
  height: 24px;
}

/* Style for the icons inside the buttons */
.icon {
  width: 24px; /* Example size, adjust as needed */
  height: auto;
}

  </style>
  