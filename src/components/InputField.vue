<template>
  <div class="input-container">
    <input
    :id="id"
    :ref="inputRef"
    :type="computedInputType"
    :placeholder="placeholder"
    :required="required"
    :value="modelValue"
    @input="updateValue($event.target.value)"
    @focus="handleInputFocus"
    @blur="handleInputBlur"
    button-type="primary"
    />
    <!-- Conditionally render the add button if type is 'search' -->
    <button 
    v-if="type === 'search'"
    type ="button"
    ref="addButton"
    @click="emitAddEvent"
    class="search-add-button"
    >Add</button>
    <!-- Conditionally render the password toggle if type is 'password' -->
    <img
    v-if="type === 'password'"
    :src="isPasswordVisible ? eyeOpenIcon : eyeClosedIcon"
    @click="togglePasswordVisibility"
    class="password-toggle"
    />
  </div>
</template>

<script>
import eyeOpenIcon from '@/assets/icons/eye-open.svg';
import eyeClosedIcon from '@/assets/icons/eye-closed.svg';

export default {
  props: {
    id: String,
    type: {
      type: String,
      default: 'text'
    },
    modelValue: String,
    placeholder: String,
    required: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isPasswordVisible: false, // Local state to track password visibility
      eyeOpenIcon, // Eye open icon for password visibility
      eyeClosedIcon // Eye closed icon for password visibility
    };
  },
  computed: {
    computedInputType() {
      // Using 'text' type when password visibility is toggled, else use provided type
      return this.type === 'password' && this.isPasswordVisible ? 'text' : this.type;
    },
    inputRef() {
      // Return the id if it's provided, otherwise return null
      return this.id ? this.id : null;
    }
  },
  methods: {
    togglePasswordVisibility() {
      this.isPasswordVisible = !this.isPasswordVisible;
      this.$nextTick(() => {
        if (this.inputRef && this.$refs[this.inputRef]) {
          this.$refs[this.inputRef].focus();
        }
      });
    },
    handleInputFocus(event) {
      if (this.type === 'search') {
        this.$refs.addButton.style = 'border: 1px solid #303030;';
        this.$emit('focus', event.target);
      }
    },
    handleInputBlur() {
      if (this.type ==='search') {
        this.$refs.addButton.style = '';
      }
    },
    updateValue(value) {
      this.$emit('update:modelValue', value); // Emit event for v-model binding to parent component
    },
    emitAddEvent() {
      this.$emit('add'); // Emit an 'add' event when the Add button is clicked
    },
  },
};
</script>
<style scoped>
.input-container {
  position: relative;
  width: 100%;
  margin-bottom: 1rem;
}

input {
  width: 100%;
  box-sizing: border-box;
  font-family: 'Asap Regular', sans-serif;
  font-size: 1.1rem;
  color: #303030;
  padding: 0.875rem 1rem;
  background-color: white;
  border: 1px solid #303030;
  border-radius: 10px;
  outline: none;
  transition: all 0.2s ease-in-out;
}

input:focus {
  border-color: #FAC54B;
  box-shadow: 0 0 0 2px rgba(250, 197, 75, 0.2);
}

input::placeholder {
  color: #858585;
  opacity: 1;
}

.password-toggle {
  cursor: pointer;
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.password-toggle:hover {
  opacity: 1;
}

.search-add-button {
  position: absolute; 
  right: 0; 
  top: 0; 
  cursor: pointer;
  font-size: 1.2rem;
  width: 79px; 
  height: 50.59px; 
  border: 1px solid #49ABFB;
  border-radius: 10px;
  background-color: #49ABFB;
  color: white;
}

</style>
