<script>
import { useUserStore } from "@/stores/user";
import nimbusLogo from "@/assets/icons/logo.svg";

export default {
  data() {
    return {
      nimbusLogo,
      selectedTab: 'introduction',
      selectedSubSection: 'missionAndVision',
      autoScrollEnabled: true,
      scrollInterval: null,
      scrollSpeed: 3, // Aumentei para 3 para ser mais visível
      cardWidth: 420,
      isScrolling: false,
      reachedEnd: false,
      scrollDirection: 'right',
      scrollTimer: null, // Estava faltando esta declaração
      tabContent: {
        introduction: 'Escolha uma categoria abaixo para saber mais sobre nós.',
        features: 'At the heart of Nimbus lies a comprehensive suite of features designed to elevate the user experience to new heights. Our dashboard is a testament to functionality and finesse, offering everything from customizable weather alerts that keep you ahead of the storm, to an interactive global weather map that brings the world\'s climate to your fingertips.\n\nDelve into the minutiae with our detailed forecasts, or capture the day\'s essence with our streamlined widget system. Whether you\'re a weather enthusiast seeking granularity or a busy individual needing a quick update, Nimbus caters to every preference with precision and flair.',
        team: 'At the heart of Nimbus are Paulo Graça and Victoria Martínez, two ambitious students from the "Web Information Systems and Technologies" degree. The Nimbus project began as a vision to simplify weather data comprehension. Through stages of meticulous development and user feedback, we have transformed that vision into a tangible, dynamic platform that serves a global community. Key milestones include our first prototype release, the integration of real-time data, and the adoption of gamification elements to engage users further.'
      },
      subSectionContent: {
        missionAndVision: 'At Nimbus, our mission is to redefine the way the world interacts with weather, and our vision is to become an indispensable part of daily life. We strive to empower our users with the tools to not only navigate but also to appreciate the beauty and intricacy of the Earth\'s atmosphere.',
        benefits: 'With Nimbus, every forecast is an opportunity to connect with your environment in a meaningful way. The benefits of using our dashboard include real-time weather updates, interactive data visualization, and a platform that learns and adapts to your preferences.',
        impact: 'The impact of Nimbus is seen in its adoption by diverse communities, its contribution to safer, more informed societies, and its role in nurturing a greater appreciation for our planet\'s dynamic climate.'
      },
      reviews: [
        {
          text: "Top-notch weather app! Nimbus keeps me informed with accurate forecasts and handy features. The attention to detail in both design and data sets it apart.",
          author: "Freya, Norway"
        },
        {
          text: "Five stars for Nimbus! The app delivers precise weather updates with an elegant interface. The interactive map is a great touch, providing a comprehensive view.",
          author: "Isabella, Sweden"
        },
        {
          text: "Nimbus is my weather go-to! Accurate forecasts, user-friendly interface, and an interactive radar map for a complete experience. Highly recommended!",
          author: "Alex, Canada"
        },
        {
          text: "Informative and customizable. Real-time notifications for severe weather are a plus. A reliable weather companion.",
          author: "Zoe, UK"
        },
        {
          text: "Outstanding! Nimbus provides precise forecasts with a sleek design. Love the real-time notifications for severe weather. A top-notch weather app!",
          author: "Aisha, UAE"
        },
        {
          text: "The weather alerts are incredibly accurate. I rely on Nimbus daily for my outdoor activities!",
          author: "Marcus, Germany"
        },
        {
          text: "Beautiful interface and spot-on forecasts. The radar feature is particularly impressive.",
          author: "Sophie, France"
        },
        {
          text: "As a professional photographer, accurate weather data is crucial. Nimbus never disappoints!",
          author: "James, Australia"
        }
      ],
      scrollPosition: 0,
      isHovered: false,
      animationFrame: null,
      lastTimestamp: null,
      scrollSpeed: 0.04, // Adjusted for smoother motion
      isDragging: false,
      startX: 0,
      currentX: 0,
      lastFrameTime: 0,
      smoothScrollPosition: 0, // For lerp smoothing
      lerpFactor: 0.1, // Controls smoothing amount
    };
  },
  computed: {
    store() {
      return useUserStore();
    },
    isUser() {
      return this.store.isUser;
    },
    getAuthenticatedUser() {
      return this.store.authenticatedUser;
    },
    userLocations() {
      return this.getAuthenticatedUser?.userLocations;
    },
    userLocation() {
      return this.getAuthenticatedUser?.userRegion;
    },
    displayReviews() {
      return [...this.reviews, ...this.reviews, ...this.reviews];
    }
  },
  mounted() {
    console.log('Component mounted');
    this.$nextTick(() => {
      console.log('Next tick - initializing carousel');
      this.initCarousel();
    });
  },
  beforeUnmount() {
    console.log('Component unmounting - cleaning up');
    this.cleanupCarousel();
  },
  methods: {
    navigateToDashboard() {
      if (this.isUser) {
        console.log(this.getAuthenticatedUser);
        console.log(this.userLocation);
        console.log(this.userLocations);
        if (this.userLocations && this.userLocations.length > 0) {
          this.userLocations.forEach((location) => {
            console.log(location);
          });
          console.log(`GOT THIS LOCATION: ${this.userLocations}`);
          this.$router.push({ name: 'basicModeDashboard' }); 
        } else {
          console.log('no locations');
          this.$router.push({ name: 'basicModeDashboard' }); 
        }
      }
    },
    
    selectTab(tabName) {
      this.selectedTab = tabName;
      if (tabName === 'introduction') {
        this.selectedSubSection = 'missionAndVision';
      }
    },
    
    selectSubSection(section) {
      this.selectedSubSection = section;
    },
    
    isActiveSubSection(section) {
      return this.selectedSubSection === section;
    },
    
    initCarousel() {
      console.log('Initializing carousel');
      const carousel = this.$refs.reviewsCarousel;
      if (!carousel) {
        console.error('Carousel element not found');
        return;
      }

      // Initialize at the middle set of reviews
      this.$nextTick(() => {
        const cardWidth = 350; // Width of each card
        const gap = 32; // Gap between cards (2rem)
        const totalWidth = (cardWidth + gap) * this.reviews.length;
        this.scrollPosition = totalWidth; // Start at second set
        this.smoothScrollPosition = this.scrollPosition;
        this.updateTransform(this.scrollPosition);
        
        // Add event listeners for drag functionality
        carousel.addEventListener('mousedown', this.startDrag);
        carousel.addEventListener('mousemove', this.drag);
        carousel.addEventListener('mouseup', this.endDrag);
        carousel.addEventListener('mouseleave', this.endDrag);
        carousel.addEventListener('touchstart', this.startDrag);
        carousel.addEventListener('touchmove', this.drag);
        carousel.addEventListener('touchend', this.endDrag);
        
        // Start animation
        this.startAnimation();
      });
    },

    updateTransform(position) {
      const carousel = this.$refs.reviewsCarousel;
      if (carousel) {
        // Use translateX for horizontal movement only - better performance than translate3d here
        carousel.style.transform = `translateX(${-position}px)`;
      }
    },

    startAnimation() {
      const animate = (currentTime) => {
        if (!this.lastFrameTime) this.lastFrameTime = currentTime;
        const deltaTime = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;

        if (!this.isHovered && !this.isDragging) {
          // Update scroll position
          this.scrollPosition += this.scrollSpeed * deltaTime;

          // Calculate boundaries
          const cardWidth = 350;
          const gap = 32;
          const itemWidth = cardWidth + gap;
          const setWidth = itemWidth * this.reviews.length;

          // Check if we need to loop
          if (this.scrollPosition >= setWidth * 2) {
            // Move back to middle set
            this.scrollPosition -= setWidth;
            this.smoothScrollPosition -= setWidth;
          }

          // Smooth the movement using lerp
          this.smoothScrollPosition += (this.scrollPosition - this.smoothScrollPosition) * this.lerpFactor;
          
          // Apply the transform with the smoothed position
          this.updateTransform(this.smoothScrollPosition);
        }

        this.animationFrame = requestAnimationFrame(animate);
      };

      this.animationFrame = requestAnimationFrame(animate);
    },

    startDrag(e) {
      this.isDragging = true;
      this.startX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
      this.currentX = this.smoothScrollPosition;
    },

    drag(e) {
      if (!this.isDragging) return;
      
      const x = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
      const diff = this.startX - x;
      
      this.scrollPosition = this.currentX + diff;
      this.smoothScrollPosition = this.scrollPosition;
      this.updateTransform(this.smoothScrollPosition);
    },

    endDrag() {
      this.isDragging = false;
    },

    handleMouseEnter() {
      this.isHovered = true;
    },

    handleMouseLeave() {
      this.isHovered = false;
      this.lastFrameTime = null;
    },

    cleanupCarousel() {
      if (this.animationFrame) {
        cancelAnimationFrame(this.animationFrame);
        this.animationFrame = null;
      }

      const carousel = this.$refs.reviewsCarousel;
      if (carousel) {
        carousel.removeEventListener('mousedown', this.startDrag);
        carousel.removeEventListener('mousemove', this.drag);
        carousel.removeEventListener('mouseup', this.endDrag);
        carousel.removeEventListener('mouseleave', this.endDrag);
        carousel.removeEventListener('touchstart', this.startDrag);
        carousel.removeEventListener('touchmove', this.drag);
        carousel.removeEventListener('touchend', this.endDrag);
      }
    }
  }
};
</script>
<template>
  
  <main class="landing-page">
    <div class="first-vp">
      <div id = 'introText' class = 'text'>
        Embrace the sky's narrative with Nimbus – your dedicated daily weather guide. Our cutting-edge platform merges precision forecasting with user-friendly design, ensuring you stay ahead of the weather, whatever your day holds. Whether you're a planner, an adventurer, or just looking for a sunny spot to relax, Nimbus brings you real-time weather updates with a touch of charm. <br><br> Join us on a journey where each cloud tells a story, and every raindrop is a beat in the rhythm of your day. With Nimbus, you're not just checking the weather; you're syncing your life with the pulse of the planet. So, why wait? Sign up today and transform how you interact with the world around you.
        <button v-if="isUser" class='accDashboardBtn' @click="navigateToDashboard">
        Access the Dashboard
      </button>
      </div>
      <div class="first-vp-bg">
        <img id = 'sunLandingPage' src = '../assets/img/sunLandingPage.svg'>
      <img id = 'cloud1LandingPage' src = '../assets/img/cloud1LandingPage.svg'>
      <img id = 'cloud2LandingPage' src = '../assets/img/cloud2LandingPage.svg'> 
      </div>
    </div>
<div class="second-vp">

      <div id = 'aboutTitle'>
        <h1 id = 'forecasting'>Forecasting</h1>
        <img id = 'logoImgAbout' :src = 'nimbusLogo'>
        <h1 id = 'reimagined'>REIMAGINED</h1>
        <h1 id = 'welcomeToNimbus'>Welcome to Nimbus.</h1>
      </div>
      <div id="aboutContent">
  <div class="aboutButtons">
    <button id="introductionBtn"
            :class="{ active: selectedTab === 'introduction' }"
            @click="selectTab('introduction')">01. INTRODUCTION</button>
    <button id="featuresBtn"
            :class="{ active: selectedTab === 'features' }"
            @click="selectTab('features')">02. FEATURES</button>
    <button id="teamBtn"
            :class="{ active: selectedTab === 'team' }"
            @click="selectTab('team')">03. TEAM</button>
  </div>

  <div class="aboutText">
    <div class="content-text" v-if="selectedTab === 'introduction'">
      {{ subSectionContent[selectedSubSection] }}
    </div>
    <div class="content-text" v-else>
      {{ tabContent[selectedTab] }}
    </div>
  </div>
</div>

<!-- Adicione os seletores de sub-seção após aboutContent (já existe no seu código) -->
<div class="about-sub-sec" v-if="selectedTab === 'introduction'">
  <div class="sub-sec-one"
       :class="{ 'active': isActiveSubSection('missionAndVision') }"
       @click="selectSubSection('missionAndVision')">
    mission and vision
  </div>
  <div class="sub-sec-two"
       :class="{ 'active': isActiveSubSection('benefits') }"
       @click="selectSubSection('benefits')">
    benefits
  </div>
  <div class="sub-sec-three"
       :class="{ 'active': isActiveSubSection('impact') }"
       @click="selectSubSection('impact')">
    impact
  </div>
</div>

      <button class = 'scrollTopBtn'>Scroll</button>

  </div>
  <div class="third-vp">
    <div class = 'nimbusAttributes'>
      <div id  = 'attTitle'>
        <h2 class = 'attributesTitleText'>From Clouds to Clarify: Your Weather Ally.</h2>
        <img id = 'underlineImg' src = '../assets/img/underline.svg'>
      </div>
      <div class = 'attributesContent'>
        <div class= 'containersAttributes' id = 'realTimeUpd'>
          <div class="icon-header">          
            <img class = 'attributesImg' src = '../assets/img/Attribute1Img.svg'>
        </div>
          <div class = 'header-text'>
            <h3 class = 'attributesHeader' id = 'realTimeUpdHeader'>Real-Time Updates</h3>
            Stay informed with real-time weather updates that ensure you're never caught off guard.</div>
        </div>
        <div class= 'containersAttributes' id = 'precisionForecast'>
          <div class="icon-header">  
          <img class = 'attributesImg' src = '../assets/img/Attribute2Img.svg'>
          </div>
          <div class = 'header-text'>
          <h3 class = 'attributesHeader' id = 'presicionForecastHeader'>Precision Forecasting</h3>
         Our state-of-the-art prediction algorithms mean you're always one step ahead of the weather.
          </div>
        </div>
        <div class= 'containersAttributes' id = 'presonalizedWeather'>
          <div class="icon-header"> 
          <img class = 'attributesImg' src = '../assets/img/Attribute3Img.svg'>
          </div>
          <div class = 'header-text'>
          <h3 class = 'attributesHeader'>Unique Experience</h3>
          <p class = 'attributesText'>Customize your alerts to receive the information that matters most to you.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
    <!-- Seção de reviews com o carrossel -->
    <div id="reviews">
      <div class="review-titles">
        <h3 id="subHeadingReviews">Beyond the forecast</h3>
        <h2 id="headingReviews">Nimbus awaits</h2>
      </div>

      <div class="containerReview">
        <!-- Indicadores de navegação -->
        <div class="carousel-indicators" v-if="reachedEnd">
          <span class="indicator">❮</span>
          <span class="indicator">❯</span>
        </div>
        
        <!-- Carrossel de depoimentos -->
        <div class="carousel-container">
          <div class="swipper-wrapper" ref="reviewsCarousel">
            <article v-for="(review, index) in displayReviews" 
                     :key="index" 
                     class="cardArticle">
              <div class="cardImage">
                <img src="../assets/img/quotationMarkReview.svg">
              </div>
              <div class="cardData">
                <p class="cardDescription">{{ review.text }}</p>
                <small class="cardName">{{ review.author }}</small>
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>

  
    <footer>
      <div id = 'legalRsrc'>
        <img id = 'lglRsrcImg' src = '../assets/img/EllipseLegalResources.svg'>
        <RouterLink :to="{ name: 'legalResources' }" id = 'legalResourcesBtn'>legal resources</RouterLink>
      </div>
      <div id = 'addInfo'>
        <img id = 'addInfoImg' src = '../assets/img/EllipseAdditionalInfo.svg'>
        <RouterLink :to="{ name: 'additionalInformation' }" id = 'additionalInfoBtn'>additional info</RouterLink>
      </div>
    </footer> 
  </main>

</template>
<style>
/* .v-main {
  position: absolute;
  top: 0;
} */

#realTimeUpd {
  margin-left:  5rem;
}
#presonalizedWeather {
  margin-right:  5rem;
}
.v-main {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
}
/* .landing-page{
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
} */
.first-vp{
  height: 65vh;
/*   background-color: aqua; */
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  z-index: -1;
}

.first-vp-bg{
  width: 100%;
  height: 100%;
}
body{
  animation: transitionIn 1.25s;
}
@keyframes transitionIn{
  from {
    opacity: 0;
    transform: rotateX('-10deg');
  }
  to{
    opacity: 1;
    transform: rotateX('0');
  }
}
html {
  scroll-behavior: smooth;
  overflow-x: hidden;
}
:root{
  background-color: #EDDED4;
}
button{
  cursor: pointer;
}
/*  #intro{
 width: 100%;
  height: 532px; 
  margin:0;
   position: absolute;
  top: 50%; 
  display: flex;
flex-direction: column;
}  */
#sunLandingPage{
  width: 25em;
  height: auto;
  z-index: 2;
  position: absolute;
  left: 5em;
  
}
@keyframes drift {
  from {
    transform: translateX(300px);
  }
  to {
    transform: translateX(-1350px);
  }
}

#cloud1LandingPage{
  width: 28em;
  height: auto;
  z-index: 2;
  position: absolute;
  right: 5em;
  animation: drift 50s ease infinite;
}
#cloud2LandingPage{
  width: 35em;
  height: auto;
  z-index:2;
  position: absolute;
  right: -7em;
  top: 25em;
  animation: drift 90s ease infinite;
}
#introText {
  max-width: 30vw;
    height: fit-content;
    z-index: 3;
    display: flex;
    flex-direction: column;
    position: absolute;
    top: 25%;
    left: 50%;
    transform: translate(-45%, 0%);
    align-items: center;
    justify-content: space-around;
}

.accDashboardBtn {
  border: 1px solid #303030;
  background-color: #D8C5B6;
  width: fit-content;
  height: fit-content;
  border-radius:30px;
  font-family: Recoleta;
font-size: 20px;
font-style: normal;
font-weight: 600;
line-height: normal;
padding: 1rem;
margin-top: 2rem;
}

.second-vp{
  height: 85vh;
/*   background-color: red; */
  /* width: 100vw; */
  display: flex;
  padding-left: 5rem;
  padding-right: 5rem;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}

.text{
  font-family: Asap;
  font-size:1.2vw;

}
#logoImgAbout{
  width: 8vw; 
  height: auto;
  margin: 0 2rem 0 0;
/*   position: relative;
  margin-top: -160vh;
  margin-right: 3vw;
  margin-left: 3vw;  */
}

#aboutTitle {
  display: flex;
    height: fit-content;
    /* width: 100%; */
    /* max-width: 80vw; */
    /* position: relative; */
    /* transform: translate(15%, 0); */
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    align-content: flex-start;
    justify-content: center;
    /* margin-left: 10%; */
    margin-top: 1rem;
    margin-bottom: 0;
}
#forecasting{
  font-family: 'Recoleta';
  color: #303030;
  font-size: 100px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  margin: 0 2rem 0 0;
  
  letter-spacing: 0.2rem;
}
#reimagined{
  font-family: asap;
  color: #303030;
  font-size: 60px;
  font-style: normal;
  font-weight: 600;
  margin: 0;
  
  letter-spacing: 0.2rem;
/*   position: relative;
  top: 9vh;
  line-height: normal;
  height: 0; */
}
#welcomeToNimbus{
  color: #303030;
    font-family: Recoleta;
    font-size: 112px;
    font-style: normal;
    font-weight: 700;
    line-height: normal;
    display: flex;
    justify-items: center;
    letter-spacing: 0.2rem;
    width: 100%;
    margin: 0;
    white-space: nowrap;
    justify-content: center;

}
.scrollTopBtn{
  z-index: 10;
  position: fixed;
  border: solid #303030 0.5;
  background-color: #FAF8ED;
  display: none;
  height: 8vh;
  position: fixed;
  right: 2em;
  border-radius: 20vh; 
  align-items: center;
  padding: 0 2vw;
  font-family: 'Recoleta';
  font-weight: bold;
  font-size: 1.3vw;
  bottom: 1.5em;
  max-width: 30vw;
  margin-left: auto;
  margin-right: auto;
  
}
#aboutContent{

    height: 40%;
    box-sizing: border-box;
    width: 100%;
    margin-left: 7%;
    margin-top: 1%;
    display: flex;

}
.aboutButtons {
  width: 50%;
  height: fit-content;
  display: flex;
  flex-direction: column;
}
#aboutContent button {
    border: 1px solid #303030;
    width: fit-content;
    padding: 1rem 1.2rem;
    font-family: 'Asap Regular' sans-serif;
    font-size: 1.2rem;
    border-radius: 30px;
    background: #E2D8D1;
    margin-bottom: 1.2rem;
    display: flex;
    justify-self: center;
}

#aboutContent button:hover {
    background-color: #F0E6D2; /* Change as per your color scheme */
    cursor: pointer;
}

#aboutContent button.active {
    background-color: #E2D8D1; /* Change as per your color scheme */
    border: 2px solid #303030;
}



.introductionText {
  text-align: right;
}

.containerReview {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  width: 90vw;
  margin: 0 auto 2rem auto;
  overflow: hidden;
}

.carousel-container {
  position: relative;
  width: 100%;
  overflow: hidden;
  margin: 0 auto;
  padding: 20px 0;
  -webkit-mask-image: -webkit-linear-gradient(left, transparent 0%, black 15%, black 85%, transparent 100%);
  mask-image: linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%);
}

/* Remove the pseudo-elements since we're using mask-image */
.carousel-container::before,
.carousel-container::after {
  display: none;
}

.swipper-wrapper {
  display: flex;
  position: relative;
  gap: 2rem;
  will-change: transform;
  backface-visibility: hidden;
  transform-style: preserve-3d;
  touch-action: pan-y pinch-zoom;
  user-select: none;
  cursor: grab;
}

.swipper-wrapper:active {
  cursor: grabbing;
}

.cardArticle {
  flex: 0 0 350px;
  border-radius: 20px;
  background: #F2E6DD;
  position: relative;
  margin: 0;
  padding: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  will-change: transform, opacity;
  backface-visibility: hidden;
  transform: translateZ(0);
  transition: transform 0.3s ease, opacity 0.3s ease, box-shadow 0.3s ease;
  opacity: 0.85;
}

.cardArticle:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
  opacity: 1;
  z-index: 3;
}

/* Optimize performance for animations */
* {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

@media (prefers-reduced-motion: no-preference) {
  .swipper-wrapper {
    -webkit-backface-visibility: hidden;
    -moz-backface-visibility: hidden;
    -webkit-perspective: 1000;
    -moz-perspective: 1000;
    -webkit-transform: translate3d(0, 0, 0);
    -moz-transform: translate3d(0, 0, 0);
    transform: translate3d(0, 0, 0);
  }
}

/* Add smooth snap points for touch devices */
@supports (scroll-snap-type: x mandatory) {
  .carousel-container {
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
  }

  .cardArticle {
    scroll-snap-align: center;
  }
}

.cardData {
  padding: 1rem;
}

.cardDescription {
  font-size: 1rem;
  line-height: 1.5;
  margin-bottom: 1rem;
  color: #303030;
}

.cardName {
  font-size: 0.9rem;
  color: #858585;
  font-weight: 600;
}

/* Indicadores de navegação */
.carousel-indicators {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  animation: pulseIndicator 2s infinite ease-in-out;
}

.indicator {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  margin: 0 10px;
  border-radius: 50%;
  background-color: #F2E6DD;
  border: 1px solid #303030;
  cursor: pointer;
  transition: all 0.3s ease;
}

.indicator:hover {
  background-color: #FAC54B;
}

/* Animação para indicar que o carrossel chegou ao fim */
@keyframes pulseIndicator {
  0% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.1); }
  100% { opacity: 0.7; transform: scale(1); }
}

/* Estilos para o conteúdo da landing page */
.aboutText {
  font-family: 'Asap Regular', sans-serif;
  font-size: 1.2rem;
  margin: 0 2rem 0 0;
  width: 39%;
  line-height: 1.5;
}

.content-text {
  text-align: right;
  white-space: pre-line; /* Preserva quebras de linha */
}

.sub-sec-one, .sub-sec-two, .sub-sec-three {
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  transition: all 0.3s ease;
}

.sub-sec-one:hover, .sub-sec-two:hover, .sub-sec-three:hover {
  text-decoration: underline;
}

.sub-sec-one.active, .sub-sec-two.active, .sub-sec-three.active {
  background-color: #FAC54B;
  border: 1px solid #303030;
  text-decoration: none;
}

.about-sub-sec {
  display: flex;
  width: 50%;
  justify-content: space-around;
  margin-top: 1%;
  color: #303030;
  font-family: Recoleta;
  font-size: 1.2rem;
  font-weight: 500;
}
.third-vp{
  height: fit-content;
/*   background-color: green; */
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding-bottom: 2rem;
  z-index: -1;
}
.nimbusAttributes {
   width: 100%;
 /* height: 800px;
  flex-shrink: 0; */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

#attTitle {
/*   top: 22em;
  position: relative; */
  color: #303030;
  height: 6rem;
  text-align: center;
  font-family: Recoleta;
  font-size: 1em;
  font-style: normal;
  display: flex;
  flex-direction: column;
  align-items: center;
    font-weight: 700;
  line-height: normal;
}
.attributesTitleText {
  z-index: 1;
}
#underlineImg {
/*   position: absolute;
  bottom: -1.8em;
  left: 50%;*/
  transform: translateY(-90%); 


}

.attributesContent{
  width: 90%;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    flex-wrap: wrap;
    height: 15vh;
}

.icon-header {
  display: flex;
    flex-direction: row;
    align-items: center;
    margin-right: 1rem;
}
.containersAttributes{
  display: flex;
  align-items: center;
  flex-direction: row;
}

.containersAttributes:nth-child(2) {
  transform: translateX(-3%);
}

.containersAttributes:nth-child(2) .icon-header {
  margin-right: 0.8rem;
}
.attributesHeader {
  color: #303030;
  font-family: Asap;
  font-size: 22px;
  font-style: normal;
  font-weight: 800;
  line-height: normal;
/*   position: relative; */
  white-space: normal;

  width: fit-content;
  margin-top: 0;
  margin-bottom: 0.5rem;
}
/*   left: 3em; */




.header-text {
  width: 13em;
  color: #303030;
  font-family: Asap;
  font-size: 1em;
  font-style: normal;
  font-weight: 400;
  line-height: normal;

}

hr.solid {
  border-top: 0.1em solid #303030;
  position: relative;
  top: 10em;
}

#reviews {
    width: 100%;
    display: flex;
    /* height: 25em; */
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    flex-direction: column;

}
.review-titles {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 3rem;
  margin-top: 5em;
}
#subHeadingReviews{
  color: #303030;
  text-align: center;
  font-family: Asap;
  font-size: 25px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  margin: 0;
/*   position: relative;
  top: -5em; */
}
#headingReviews{
  color: #303030;
  text-align: center;
  font-family: Recoleta;
  font-size: 60px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  margin: 0;
/*   position: relative;
  top: -3em; */
}





.cardContainer{
  margin-left:auto;
  margin-right:auto;
  position:relative;
  overflow:hidden;
  list-style:none;
  padding:0;
  z-index:1;
}

.cardContent{
  
  margin-inline-start: 2.5rem;
  border-radius: 1.25rem;
  overflow: hidden;
}



.cardImage{
  position: relative;
padding-top: 1rem;
padding-left: 1rem;
margin-bottom: -0.75rem;
}


.cardData{
  padding: 0rem 1.5rem 1.5rem 1.5rem;
  border-radius: 1rem;
  text-align: start;
  position: relative;
  color: #303030;
  font-family: Asap;
  font-size: 20px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
}

small{
  color: #858585;
  font-family: Asap;
  font-size: 15px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  display: flex;
  align-items: start;
}
#secondDivider{
  border-top: 0.1em solid #303030;
  position: relative;
  top: 20em;
}

footer{
  position: relative;
  z-index: 10;
  background: #EDDED4;
  width: 100%;
  color: #303030;
    display: flex;
    justify-content: flex-start;
    height: 4em;
    font-size: 25px;
    font-style: normal;
    font-weight: 700;
    line-height: normal;
    border-top: 1px solid #303030;
 
}

#legalRsrc,
#addInfo {
  font-weight: bold;
  font-size: 1.3vw;
  display: flex;
  align-items: center;
}

#lglRsrcImg,
#addInfoImg {
  height: auto;
  margin-right: 0.5em;
}

#legalResourcesBtn, #additionalInfoBtn{
  color: #303030;
text-align: center;
font-family: Recoleta;
font-size: 25px;
font-style: normal;
font-weight: 700;
line-height: normal;
margin-right: 4rem;
}

#legalRsrc {
  margin-left: 3rem;
}
</style>