<script>
import { defineComponent } from 'vue';
// Assuming useUserStore and nimbusLogo are correctly imported elsewhere
// import { useUserStore } from "@/stores/user";
// import nimbusLogo from "@/assets/icons/logo.svg";

export default defineComponent({
  name: 'AdditionalInformationView',
  data() {
    return {
      // nimbusLogo, // Assuming this is used elsewhere or can be removed if not
      features: [
        {
          title: "Customizable Weather Alerts",
          tagline: "Stay One Step Ahead",
          description: "We empower you with customizable weather alerts that keep you ahead of the storm.",
          icon: "sun"
        },
        {
          title: "Interactive Global Weather Map",
          tagline: "Explore the World's Climate",
          description: "Embark on a journey around the globe with Nimbus's interactive weather map",
          icon: "map"
        },
        {
          title: "Streamlined Widget System",
          tagline: "Capture the Day at a Glance",
          description: "Access your essential weather information through our intuitive widget system.",
          icon: "moon" // This identifies the card we want to change
        }
      ]
    };
  },
  // computed: { // Assuming store is used elsewhere or can be removed if not
  //   store() {
  //     return useUserStore();
  //   }
  // }
});
</script>

<template>
  <main class="additional-info">
    <div class="wave-container">
       <svg class="wave" viewBox="0 -20 1280 615" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
         <mask id="mask0_466_1130" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="-40" y="-50" width="1348" height="595">
          <path d="M1308 -50V545L-40 545V-50L1308 -50Z" fill="white"/>
        </mask>
        <g mask="url(#mask0_466_1130)">
          <mask id="mask1_466_1130" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="-40" y="-50" width="1348" height="595">
            <path d="M1308 -50V545L-40 545V-50L1308 -50Z" fill="white"/>
          </mask>
          <g mask="url(#mask1_466_1130)">
            <path class="wave-path" d="M1290.79 396.911C1297.59 399.126 1304.95 395.739 1307.31 389.356C1307.86 387.923 1308 386.49 1308 385.057C1304.25 279.674 1303 173.119 1304.25 65.3914C1304.39 46.7638 1303.42 25.5309 1280.53 18.3664C1174.1 -14.7205 1082.11 -0.391541 998.855 59.9203C902.421 129.872 756.59 144.852 653.634 71.5138C558.032 3.51642 456.186 -25.2717 342.407 26.8335C303.417 44.6796 271.643 73.0769 233.485 90.6624C147.319 130.262 61.5684 130.262 -23.9044 90.5322C-29.4546 88.0572 -36.2537 90.2716 -38.8899 95.4822C-39.5837 96.9151 -40 98.4782 -40 100.041L-38.1962 438.856C-38.1962 453.445 -28.6221 466.602 -14.1917 472.333C60.4583 501.643 135.802 502.555 211.701 475.069C260.542 457.353 315.905 409.026 366.551 391.57C419.416 373.464 473.253 370.989 527.922 384.145C583.146 397.562 627.825 429.737 675.279 458.656C735.221 494.999 808.345 500.47 880.359 488.486C959.726 475.33 1015.78 409.807 1093.9 386.49C1150.1 369.686 1215.73 373.073 1290.79 396.911Z" fill="#F4AFBF"/>
          </g>
        </g>
      </svg>
    </div>

    <h1 class="page-title">Behind the Scenes: The Nimbus<br>Forecasting Journey</h1>

    <div class="features-grid">
      <div :class="['feature-card', 'feature-card-' + feature.icon]" v-for="feature in features" :key="feature.title">

        <template v-if="feature.icon === 'sun'">
          <div class="card-graphic-area">
             <svg class="lilac-cloud" width="221" height="177" viewBox="0 0 221 177" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M-179 181H221C215.223 115.23 179.12 64.5673 135.445 64.5673C134.902 64.5673 134.361 64.5751 133.82 64.5906C110.669 25.188 75.2919 0 35.6485 0C-16.3296 0 -60.973 43.3004 -80.3435 105.167C-86.9893 102.85 -93.977 101.614 -101.187 101.614C-138.917 101.614 -170.549 135.457 -179 181Z" fill="#E3BBF2"/> </svg>
             <svg class="pink-cloud" width="243" height="117" viewBox="0 0 243 117" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M0 121H290C285.811 77.0324 259.637 43.1637 227.972 43.1637C227.579 43.1637 227.186 43.169 226.795 43.1794C210.01 16.8384 184.362 0 155.62 0C117.936 0 85.5696 28.9467 71.5259 70.3053C66.7077 68.7561 61.6417 67.9298 56.4141 67.9298C29.0598 67.9298 6.1268 90.5539 0 121Z" fill="#F1B3C9"/> </svg>
             <svg class="card-sun" width="237" height="275" viewBox="0 0 237 275" fill="none" xmlns="http://www.w3.org/2000/svg"> <path class="sun-body" d="M279 139.5L259.856 158.573L272.21 182.618L248.085 194.821L252.359 221.506L225.657 225.657L221.506 252.359L194.821 248.085L182.618 272.21L158.573 259.856L139.5 279L120.427 259.856L96.382 272.21L84.1786 248.085L57.4936 252.359L53.3434 225.657L26.6408 221.506L30.9146 194.821L6.79045 182.618L19.1439 158.573L0 139.5L19.1439 120.427L6.79045 96.382L30.9146 84.1786L26.6408 57.4936L53.3434 53.3434L57.4936 26.6408L84.1786 30.9146L96.382 6.79045L120.427 19.1439L139.5 0L158.573 19.1439L182.618 6.79045L194.821 30.9146L221.506 26.6408L225.657 53.3434L252.359 57.4936L248.085 84.1786L272.21 96.382L259.856 120.427L279 139.5Z" fill="#FFCB65"/> <path class="sun-eye" d="M119.561 111.437C121.692 111.437 123.42 109.71 123.42 107.579C123.42 105.447 121.692 103.72 119.561 103.72C117.43 103.72 115.702 105.447 115.702 107.579C115.702 109.71 117.43 111.437 119.561 111.437Z" fill="#303031"/> <path class="sun-eye" d="M159.438 111.437C161.57 111.437 163.297 109.71 163.297 107.579C163.297 105.447 161.57 103.72 159.438 103.72C157.307 103.72 155.58 105.447 155.58 107.579C155.58 109.71 157.307 111.437 159.438 111.437Z" fill="#303031"/> <path class="sun-mouth" d="M137.54 113.38L134.317 127.853H144.683L139.5 141.425" stroke="#303031" stroke-miterlimit="10" fill="none"/> </svg>
          </div>
          <div class="card-text-content">
            <h3>{{ feature.title }}</h3> <h4>{{ feature.tagline }}</h4> <p>{{ feature.description }}</p>
          </div>
        </template>
        <template v-else-if="feature.icon === 'map'">
           <div class="map-bar map-bar-left"></div>
           <div class="map-bar map-bar-right"></div>
           <svg class="card-flower" xmlns="http://www.w3.org/2000/svg" width="103" height="150" viewBox="0 0 103 150" fill="none">
             <mask id="mask0_3594_55" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="0" y="0" width="103" height="231"> <path d="M103 0H0V231H103V0Z" fill="white"/> </mask>
             <g mask="url(#mask0_3594_55)">
               <mask id="mask1_3594_55" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="0" y="0" width="103" height="231"> <path d="M103 0H0V231H103V0Z" fill="white"/> </mask>
               <g mask="url(#mask1_3594_55)">
                 <path d="M45.4579 88.1534L43.348 83.8653C43.1083 83.3871 42.7407 83.0683 42.2292 82.9089C41.1902 82.5741 40.1353 82.9089 39.0963 83.9769C34.3811 87.197 29.4101 87.9781 24.1834 86.3202C16.7669 83.945 5.09866 75.4645 5.19456 66.2825C5.2585 59.8105 8.77495 55.1876 12.6271 50.2937C13.1545 49.6402 13.0426 49.1141 12.2914 48.7156C8.51921 46.6751 5.43432 44.1884 3.03674 41.2393C-4.85928 31.5472 4.15561 21.1697 13.1865 16.9931C19.2444 14.1875 25.3822 14.2035 31.6319 17.041C32.1114 17.2482 32.6708 17.041 32.8786 16.5787C32.9106 16.499 32.9425 16.4033 32.9585 16.3077C34.493 4.57516 44.6427 -2.00845 56.1351 0.542102C68.3628 3.23612 72.4387 17.3757 74.7084 27.8011C74.8522 28.4866 75.2838 28.8691 75.9871 28.9488C85.0819 29.985 94.8161 32.5037 100.842 39.0713C103.975 42.4827 103.399 48.6996 101.114 52.4776C96.2706 60.48 87.0319 63.1262 78.5285 65.6449C77.9691 65.8202 77.6654 66.3941 77.8252 66.952C77.8252 66.9998 77.8572 67.0317 77.8732 67.0795C81.4696 74.8906 80.7822 82.1915 75.8113 88.9664C68.139 99.4556 53.3699 97.8774 45.4579 88.1534ZM65.5017 55.0122C70.169 47.4881 66.2689 36.6324 56.7745 30.7661C47.2801 24.8998 35.8037 26.2389 31.1204 33.763C26.4531 41.2871 30.3532 52.1429 39.8316 58.0091C49.326 63.8754 60.8024 62.5364 65.4857 55.0122" fill="#E86060"/>
                 <path d="M56.7747 30.7661C66.2691 36.6324 70.1692 47.4881 65.4859 55.0122C60.8186 62.5364 49.3262 63.8754 39.8318 58.0091C30.3374 52.1429 26.4374 41.2871 31.1206 33.763C35.8039 26.2389 47.2803 24.8998 56.7747 30.7661Z" fill="#FDCB67"/>
                 <path d="M45.4581 88.1533L46.3852 131.975C46.4171 133.298 46.8327 133.426 47.6479 132.389C52.6349 125.933 58.7887 120.928 66.1093 117.405C69.4978 115.763 77.5537 112.878 79.4878 117.963C81.5177 123.335 81.0382 128.516 78.0332 133.505C71.9594 143.58 59.9075 151.343 47.568 149.574C47.2643 149.542 46.9926 149.749 46.9606 150.036C46.9606 150.068 46.9606 150.1 46.9606 150.116L48.6709 230.554C48.6709 230.729 48.591 230.809 48.4151 230.825L39.3683 231C39.1605 231 39.0486 230.888 39.0486 230.681L39.0965 83.9768C40.1355 82.9247 41.1904 82.574 42.2294 82.9088C42.7409 83.0682 43.1085 83.387 43.3482 83.8652L45.4581 88.1533ZM68.5548 125.981C68.395 125.806 68.1392 125.79 67.9634 125.949L49.4541 142.273C49.2783 142.432 49.2623 142.687 49.4221 142.863L49.486 142.942C49.6459 143.118 49.9016 143.134 50.0774 142.974L68.5868 126.651C68.7626 126.491 68.7786 126.236 68.6187 126.061L68.5548 125.981Z" fill="#47B063"/>
                 <path d="M49.454 142.289L67.9633 125.965C68.1392 125.822 68.3949 125.838 68.5547 125.997L68.6187 126.061C68.7625 126.236 68.7465 126.491 68.5867 126.651L50.0774 142.974C49.9016 143.134 49.6458 143.118 49.486 142.942L49.4221 142.863C49.2622 142.687 49.2782 142.432 49.454 142.273" fill="#76BE80"/>
               </g>
             </g>
           </svg>
           <div class="card-text-content">
             <h3>{{ feature.title }}</h3> <h4>{{ feature.tagline }}</h4> <p>{{ feature.description }}</p>
           </div>
        </template>
         <template v-else> <div class="card-graphic-area">
                <svg class="card-star star-1" viewBox="0 0 100 100" fill="#FFFDE7" xmlns="http://www.w3.org/2000/svg"> <path d="M50 0 L61.2 38.8 L100 50 L61.2 61.2 L50 100 L38.8 61.2 L0 50 L38.8 38.8 Z"/> </svg>
                <svg class="card-star star-2" viewBox="0 0 100 100" fill="#FFFDE7" xmlns="http://www.w3.org/2000/svg"> <path d="M50 0 L61.2 38.8 L100 50 L61.2 61.2 L50 100 L38.8 61.2 L0 50 L38.8 38.8 Z"/> </svg>
                <svg class="card-star star-3" viewBox="0 0 100 100" fill="#FFFDE7" xmlns="http://www.w3.org/2000/svg"> <path d="M50 0 L61.2 38.8 L100 50 L61.2 61.2 L50 100 L38.8 61.2 L0 50 L38.8 38.8 Z"/> </svg>
                <svg class="card-star star-4" viewBox="0 0 100 100" fill="#FFFDE7" xmlns="http://www.w3.org/2000/svg"> <path d="M50 0 L61.2 38.8 L100 50 L61.2 61.2 L50 100 L38.8 61.2 L0 50 L38.8 38.8 Z"/> </svg>

                <svg class="card-cloud-light" width="114" height="83" viewBox="0 0 114 83" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M43.8469 28.2168C43.9279 26.3433 43.9764 24.4697 43.9926 22.5799C44.0897 9.10675 52.8277 -2.68836 67.472 0.537373C83.2329 4.00748 90.3689 24.2091 91.8738 38.1221C91.8755 38.2303 91.9032 38.3366 91.9547 38.4316C92.0066 38.5398 92.0791 38.6367 92.1683 38.7166C92.2574 38.7965 92.3614 38.8579 92.4741 38.8973C92.5869 38.9367 92.7063 38.9532 92.8254 38.946C92.9445 38.9388 93.0611 38.9079 93.1683 38.8552C100.062 35.5969 105.704 37.4758 110.094 44.4921C117.069 55.5704 114.949 71.1614 101.745 76.4725C95.2828 79.0577 88.4984 80.7352 81.5824 81.4577C67.0684 82.9417 52.4661 83.3555 37.8921 82.6959C18.9274 81.9465 0.162125 81.3545 -18.4035 80.9201C-32.2873 80.5943 -46.3491 81.4089 -60.2814 81.7184C-65.9753 81.9572 -71.672 81.3199 -77.1749 79.8286C-77.5141 79.7353 -77.8289 79.5685 -78.0973 79.3398C-78.6117 78.903 -78.933 78.2786 -78.9907 77.6036C-79.0483 76.9286 -78.8376 76.2581 -78.4048 75.7394C-77.3799 74.4867 -75.9564 73.6292 -74.3755 73.3119C-65.5029 71.3691 -56.8337 68.5816 -48.485 64.9869C-44.9977 63.4139 -41.3363 62.2653 -37.5787 61.5657C-30.119 60.2787 -23.0153 58.7798 -18.1608 52.2795C-14.3258 47.1639 -11.6882 40.4518 -6.65569 36.5581C-1.62323 32.6644 3.49014 33.2998 8.40933 38.9041C8.56225 39.0805 8.75709 39.2151 8.97568 39.2951C9.30183 39.3889 9.65131 39.3533 9.95226 39.1958C10.2532 39.0382 10.4828 38.7706 10.5938 38.4479C14.1861 27.8584 22.8433 19.1424 34.7367 23.2641C37.7627 24.3231 40.0767 26.8809 42.6981 28.7055C43.4424 29.2269 43.7984 29.0477 43.8469 28.2168Z" fill="#DDF0FF"/> </svg>
                <svg class="card-cloud-lilac" width="239" height="100" viewBox="0 0 239 100" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M86.8735 33.9961C86.7733 31.7389 86.7132 29.4816 86.6931 27.2047C86.5729 10.972 75.7522 -3.23899 57.6175 0.647438C38.1002 4.82829 29.2633 29.1675 27.3998 45.9302C27.3977 46.0607 27.3634 46.1886 27.2996 46.3032C27.2354 46.4336 27.1455 46.5503 27.0351 46.6465C26.9248 46.7428 26.7961 46.8168 26.6564 46.8642C26.5168 46.9116 26.3689 46.9316 26.2214 46.9229C26.0739 46.9142 25.9296 46.877 25.7967 46.8135C17.2604 42.8878 10.2737 45.1516 4.83664 53.6049C-3.79987 66.9523 -1.17484 85.7367 15.1764 92.1355C23.1783 95.2502 31.5797 97.2713 40.1441 98.1418C58.1174 99.9298 76.2001 100.428 94.2476 99.6336C117.732 98.7307 140.97 98.0175 163.961 97.4941C181.154 97.1015 198.567 98.083 215.82 98.4559C222.871 98.7437 229.925 97.9758 236.74 96.179C237.16 96.0666 237.55 95.8656 237.882 95.5901C238.519 95.0639 238.917 94.3116 238.988 93.4983C239.06 92.6851 238.799 91.8773 238.263 91.2523C236.994 89.743 235.231 88.7098 233.273 88.3276C222.286 85.9869 211.551 82.6284 201.212 78.2975C196.893 76.4022 192.359 75.0185 187.706 74.1755C178.469 72.6249 169.672 70.8191 163.66 62.9873C158.911 56.824 155.645 48.7371 149.413 44.0459C143.181 39.3547 136.849 40.1202 130.757 46.8724C130.568 47.085 130.327 47.2471 130.056 47.3435C129.652 47.4565 129.219 47.4136 128.847 47.2238C128.474 47.034 128.19 46.7116 128.052 46.3228C123.604 33.5643 112.883 23.0631 98.155 28.0291C94.4079 29.3049 91.5424 32.3866 88.2962 34.585C87.3744 35.2131 86.9336 34.9972 86.8735 33.9961Z" fill="#8980BA"/> </svg>
                <svg class="card-moon" width="157" height="194" viewBox="0 0 157 194" fill="none" xmlns="http://www.w3.org/2000/svg"> <path fill-rule="evenodd" clip-rule="evenodd" d="M89.3864 0.752474C56.6867 26.414 43.1582 71.3804 59.1035 112.073C75.0502 152.768 115.532 176.574 156.964 173.183C118.721 203.252 63.1615 200.344 28.2985 164.817C-9.09737 126.708 -8.51971 65.4997 29.5887 28.1038C46.3756 11.6309 67.6447 2.52637 89.3864 0.752474Z" fill="#D9D9D9"/> </svg>
           </div>
           <div class="card-text-content">
             <h3>{{ feature.title }}</h3> <h4>{{ feature.tagline }}</h4> <p>{{ feature.description }}</p>
           </div>
        </template>
         </div>
    </div>
  </main>
</template>

<style scoped>
/* General Styles */
.additional-info {

  padding: 2rem 4rem;
  position: relative;
  overflow-x: hidden;
  box-sizing: border-box;
}

.wave-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 595px;
  z-index: 1;
  overflow: hidden;
}

.wave {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.wave-path {
  animation: waveFloat 8s ease-in-out infinite alternate;
  transform-origin: center;
}

.page-title {
  font-family: 'Recoleta', serif;
  font-size: 3rem;
  color: #303030;
  text-align: left;
  margin: 4rem 0;
  position: relative;
  z-index: 1;
  max-width: 800px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2.5rem;
  padding-bottom: 2rem;
  position: relative;
  z-index: 1;
}

/* Base styles for all cards */
.feature-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
   min-height: 300px;
   overflow: hidden;
}

.feature-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.12);
}

/* Default Card Content (for moon legacy icon) */
.card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2rem;
  width: 100%;
  box-sizing: border-box;
}

.icon-container {
  width: 100px;
  height: 100px;
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.icon {
  width: 100%;
  height: 100%;
}

/* --- START: Sun Card Specific Styles --- */

.feature-card-sun {
  background-color: #FF748D;
  transition: background-color 0.4s ease;
  display: block;
  padding: 0;
}

.feature-card-sun:hover {
   background-color: #FFECB3;
}

/* Graphic Area takes up full card space */
.card-graphic-area {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
}

/* Positioning the SVGs relative to card-graphic-area */
.card-sun, .pink-cloud, .lilac-cloud {
  position: absolute;
  transition: transform 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55), fill 0.4s ease;
  pointer-events: none;
}

/* Corrected SVG Positioning and Sizing */
.card-sun {
  width: 70%;
  height: auto;
  top: 5%;
  left: 70%;
  transform: translateX(-50%);
  z-index: 2;
}
.card-sun .sun-body,
.card-sun .sun-eye,
.card-sun .sun-mouth {
    transition: fill 0.4s ease, stroke 0.4s ease;
}

.pink-cloud { /* Left Cloud */
  width: 80%;
  height: auto;
  left: 0;
  bottom: 0;
  z-index: 1;
}
.pink-cloud path { transition: fill 0.4s ease; }

.lilac-cloud { /* Right Cloud */
   width: 50%;
   height: auto;
   right: -5%;
   bottom: 0%;
   z-index: 2;
}
.lilac-cloud path { transition: fill 0.4s ease; }


/* Sun/Map/Moon Card Text Content Box */
/* Shared styles for text box on sun, map, moon cards */
.card-text-content {
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  right: 1rem;
  height: auto;
  border-radius: 15px;
  z-index: 10;
  padding: 1rem;
  box-sizing: border-box;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

/* Sun Card Text Styling */
.feature-card-sun .card-text-content {
   background: #F2E6DD; /* Sun card specific background */
}
.feature-card-sun .card-text-content h3,
.feature-card-sun .card-text-content h4,
.feature-card-sun .card-text-content p {
    color: #303030; /* Sun card text color */
}

/* Base Text Styles (used by all text boxes unless overridden) */
.card-text-content h3 { font-size: 13px; font-family: 'Asap', sans-serif; font-weight: 700; word-wrap: break-word; margin-bottom: 2px; line-height: 1.3; }
.card-text-content h4 { font-size: 12px; font-family: 'Asap', sans-serif; font-style: italic; font-weight: 300; word-wrap: break-word; margin-bottom: 4px; line-height: 1.3; }
.card-text-content p { font-size: 11px; font-family: 'Asap', sans-serif; font-weight: 400; word-wrap: break-word; line-height: 1.35; }


/* Sun Card Hover Effects */
.feature-card-sun:hover .card-sun { transform: translate(-55%, -8%); }
.feature-card-sun:hover .pink-cloud path { fill: #A0D2DB; }
.feature-card-sun:hover .lilac-cloud path { fill: #A2D5C6; }

/* --- END: Sun Card Specific Styles --- */


/* --- START: Map Card Specific Styles --- */

.feature-card-map {
  background-color: #4A90E2; /* Blue background */
  display: block;
  padding: 0;
}

/* Style for the background bars */
.map-bar {
  position: absolute;
  background-color: #D1C4E9; /* Lighter Lilac/Lavender */
  border-radius: 8px;
  top: 0;
  height: 75%;
  width: 18%;
  z-index: 1; /* Behind flower */
}

.map-bar-left { left: 28%; transform: translateX(-50%); }
.map-bar-right { right: 28%; transform: translateX(50%); height: 55%; top: 15%; }

/* Style for the flower */
.card-flower {
  position: absolute;
  width: 33%;
  height: auto; /* Maintain aspect ratio */
  bottom: -2rem;
  left: 12%;
  z-index: 5;
  transition: transform 0.3s ease-out;
  pointer-events: none;
}

/* Hover effect for the flower */
.feature-card-map:hover .card-flower { transform: translateY(-12px); }

/* Text box for map card */
.feature-card-map .card-text-content {
  background-color: #F2E6DD; /* Semi-transparent white */
}
/* Text color for map card */
.feature-card-map .card-text-content h3,
.feature-card-map .card-text-content h4,
.feature-card-map .card-text-content p {
    color: #223344; /* Darker text for better contrast */
}

/* --- END: Map Card Specific Styles --- */


/* --- START: Moon Card Specific Styles --- */

.feature-card-moon {
    background-color: #303F9F; /* Dark blue background */
    display: block;
    padding: 0;
}

/* Positioning graphics relative to the graphic area */
.card-moon, .card-cloud-lilac, .card-cloud-light, .card-star {
    position: absolute;
    transition: transform 0.4s ease-out;
    pointer-events: none;
}

.card-moon {
    width: 75%; /* Adjust size */
    height: auto;
    top: -8%;
    left: -10%;
    transform: rotate(-15deg);
    z-index: 3; /* Moon above light cloud, below lilac cloud */
}

.card-cloud-lilac {
    width: 65%; /* Adjust size */
    height: auto;
    bottom: 20%; /* Position above text box */
    right: -15%; /* Off edge */
    z-index: 4; /* Above moon */
}

.card-cloud-light {
    width: 55%; /* Adjust size */
    height: auto;
    bottom: -10%; /* Partially hidden */
    left: -12%; /* Off edge */
    z-index: 2; /* Below moon */
    opacity: 0.9;
}

.card-star {
    width: 5%; /* Small stars */
    height: auto;
    z-index: 0; /* Behind everything */
    opacity: 0.8;
}
/* Position individual stars */
.star-1 { top: 15%; left: 60%; width: 6%; transform: rotate(15deg); }
.star-2 { top: 30%; left: 80%; width: 4%; transform: rotate(-10deg); }
.star-3 { top: 55%; left: 70%; width: 5%; transform: rotate(25deg); }
.star-4 { top: 5%; left: 30%; width: 3%; }


/* Text box for moon card */
.feature-card-moon .card-text-content {
  /* Inherits absolute positioning, padding, etc. */
  background: #F2E6DD; /* Same as sun card */
}
/* Text color for moon card */
.feature-card-moon .card-text-content h3,
.feature-card-moon .card-text-content h4,
.feature-card-moon .card-text-content p {
    color: #303030; /* Same as sun card */
}

/* Moon card hover effects */
.feature-card-moon:hover .card-moon {
    transform: translateY(-8px) rotate(-18deg); /* Lift and tilt moon */
}
.feature-card-moon:hover .card-star {
    animation: twinkle 1.5s infinite alternate ease-in-out;
}


/* --- END: Moon Card Specific Styles --- */


/* Default Text Styles (used by Moon Card's legacy .card-content if needed) */
/* These styles apply ONLY if using .card-content layout */
.card-content h3 { font-family: 'Asap', sans-serif; font-size: 1.3rem; color: #303030; margin-bottom: 0.3rem; font-weight: 600; }
.card-content h4 { font-family: 'Asap', sans-serif; font-size: 0.9rem; color: #555; font-style: normal; margin-bottom: 0.8rem; font-weight: 500; }
.card-content p { font-family: 'Asap', sans-serif; color: #444; line-height: 1.5; font-size: 0.95rem; }


/* Keyframe Animations */
@keyframes waveFloat { 0% { transform: translateY(0) scaleY(1.02); } 50% { transform: translateY(-10px) scaleY(1); } 100% { transform: translateY(0) scaleY(1.02); } }
@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
@keyframes drawPath { 0% { stroke-dashoffset: 100; } 100% { stroke-dashoffset: 0; } }
@keyframes glow { 0%, 100% { filter: brightness(1); } 50% { filter: brightness(1.2); } }
@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
@keyframes twinkle {
    0% { opacity: 0.5; transform: scale(0.9); }
    100% { opacity: 1; transform: scale(1.1); }
}


/* Responsive Design */
@media (max-width: 768px) {
  .additional-info { padding: 2rem 1rem; }
  .page-title { font-size: 2rem; margin: 2rem 0; text-align: center; }
  .features-grid { grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem; }
  .feature-card { min-height: 300px; }
  .wave-container { height: 400px; }
  /* Adjust text box for all cards on mobile */
  .card-text-content { bottom: 0.5rem; left: 0.5rem; right: 0.5rem; padding: 0.8rem; }
  .card-text-content p { font-size: 10px; }
  /* Adjust map card elements on mobile if needed */
  .map-bar { width: 18%; }
  .card-flower { width: 38%; bottom: 20%; left: 8%; }
  /* Adjust moon card elements on mobile if needed */
  .card-moon { width: 80%; top: -5%; left: -15%; }
  .card-cloud-lilac { width: 70%; bottom: 18%; right: -18%; }
  .card-cloud-light { width: 60%; bottom: -12%; left: -15%; }
}

@media (max-width: 480px) {
    .page-title { font-size: 1.8rem; }
    .wave-container { height: 300px; }
    .features-grid { grid-template-columns: 1fr; }
    .feature-card { min-height: 280px; }
}
</style>
