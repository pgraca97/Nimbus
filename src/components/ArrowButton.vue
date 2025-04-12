<template>
    <button type="button" :class="['arrow-button', buttonClass]" @click="onClick">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 14.73 21" class="arrow-icon" :style="iconStyle">
        <path d="M6.66,20.71c.39.39,1.02.39,1.41,0l6.36-6.36c.39-.39.39-1.02,0-1.41-.39-.39-1.02-.39-1.41,0l-5.66,5.66L1.71,12.93c-.39-.39-1.02-.39-1.41,0-.39.39-.39,1.02,0,1.41l6.36,6.36ZM6.36,1v18c0,.55.45,1,1,1h0c.55,0,1-.45,1-1V1C8.36.45,7.92,0,7.36,0h0c-.55,0-1,.45-1,1Z"/>
      </svg>
    </button>
  </template>
  
  
  <script>
  export default {
    props: {
      direction: {
        type: String,
        required: true,
        validator: value => ['up', 'down', 'left', 'right'].includes(value)
      },
      buttonClass: {
      type: String,
      default: '' // This allows us to pass an additional class for styling specific arrows
    },
      altText: {
        type: String,
        default: 'Arrow'
      }
    },
    computed: {
/*       computedArrowSrc() {
        return new URL(`/src/assets/icons/arrow.svg`, import.meta.url).href;
      }, */
      iconStyle() {
        // Determine the rotation based on the direction prop
        const rotations = {
          up: '180deg',
          down: '0deg',
          left: '90deg',
          right: '-90deg',
        };
        return {
          transform: `rotate(${rotations[this.direction]})`
        };
      }
    },
    methods: {
      onClick() {
        this.$emit('clickButton');
      }
    }
  };
  </script>
  
  
  <style scoped>
  .arrow-button {
    background: transparent;
    border-radius: 24px;
    border: none;
    cursor: pointer;
    padding: 8px;
    fill: #303030;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .arrow-icon {
    display: block;
    width: 16px;
    height: 16px;
    transition: transform 0.3s;
  }
  </style>