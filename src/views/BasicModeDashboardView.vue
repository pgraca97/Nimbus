<script>
// Import watch from vue
import { watch } from 'vue';
import moment from 'moment';
import ArrowButton from '@/components/ArrowButton.vue';
import HeaderDashboard from "@/components/HeaderDashboard.vue";
import { useUserStore } from "@/stores/user";
// No fetching needed here anymore
import { useWeatherStore } from '@/stores/weather';

export default {
  name: 'basicMode',
  data() {
    return {
      // Initialize with a structure that hints at expected data
      // Add default values where possible to prevent template errors before load
      weather: {
          weather: [{ icon: '', description: '' }], // Placeholder for weather array
          main: { temp: null, feels_like: null, humidity: null, pressure: null, sea_level: null },
          sys: { sunrise: null, sunset: null },
          wind: { speed: null },
          name: '',
          timezone: null,
          visibility: null
       },
      five_day_forecast: { list: [] }, // Initialize with empty array
      air_quality: { list: [] }, // Initialize with empty array
      region: '', // Will be populated from userLocation
      currentNudgeIndex: 0,
      nudges: [],
      // isLoading flag to control the loading state display
      isLoading: true, // Start in loading state
    };
  },
  components: {
    ArrowButton,
    HeaderDashboard,
  },
  watch: {
     // Watchers for generating nudges based on LOCAL data changes
     // These trigger only after local data (weather, five_day_forecast) is populated
    weather: {
      handler(newVal, oldVal) {
        // Generate nudges only when valid weather data is present locally and loading is finished
        // Check specifically if essential parts exist
        if (!this.isLoading && newVal?.main && newVal?.weather?.[0]) {
           console.log("BasicMode Watcher: Local 'weather' data changed, regenerating nudges.");
           this.generateWeatherNudges();
        }
      },
      deep: true,
      immediate: false // Don't run immediately on component creation
    },
    five_day_forecast: {
      handler(newVal, oldVal) {
         // Generate nudges only when valid forecast data is present locally and loading is finished
         if (!this.isLoading && newVal?.list?.length > 0) {
            console.log("BasicMode Watcher: Local 'five_day_forecast' data changed, regenerating nudges.");
           this.generateWeatherNudges();
         }
      },
      deep: true,
      immediate: false
    }
  },
  created() {
    console.log("BasicModeDashboard created.");
    // Get region name early if possible from computed property
    if (this.userLocation?.region) {
        this.region = this.userLocation.region;
        console.log(`BasicMode: Region name set to '${this.region}' in created.`);
    } else {
        console.warn("BasicMode: User region not available in created.");
    }
    // Initial attempt to load data from store - may find null if fetch is ongoing
    this.loadDataFromStore();
  },
  mounted() {
    console.log("BasicModeDashboard mounted.");
    // Setup watchers for store changes AFTER component is mounted
    this.setupWatchers();
  },
  computed: {
    // --- Store Access ---
    userStore() {
       return useUserStore();
     },
     weatherStore() {
      return useWeatherStore()
     },
     // Computed property to safely get data from weather store
     regionWeatherDataFromStore(){
       return this.weatherStore.regionWeatherData;
     },
     // --- User Data Access ---
     getAuthenticatedUser() {
       // Ensure it returns an object even if user is null initially
       return this.userStore.authenticatedUser || {};
     },
     userLocation() { // This computed property gets the user's primary region object
       // Ensure it returns null if user or region is missing
       return this.getAuthenticatedUser.userRegion || null;
     },
     // --- Loading State ---
     // Computed property to determine if data is ready for display
     // Checks if loading is false and essential LOCAL data properties have been populated
     isDataReady() {
        const ready = !this.isLoading && // Use the isLoading flag managed by loadDataFromStore
               this.weather?.weather?.[0]?.icon && // Check deeper for essential display data
               this.air_quality?.list?.length > 0 &&
               this.five_day_forecast?.list?.length > 0;
        // console.log(`isDataReady computed: isLoading=${this.isLoading}, ready=${ready}`);
        return ready;
     },

     // --- Template Helpers ---
     // Other computed properties (getWeatherAltText, etc.) should use LOCAL data (this.weather)
     // and include safety checks.
     getWeatherAltText() {
        const weatherMain = this.weather?.weather?.[0]?.main?.toLowerCase();
        if (!weatherMain) return 'Loading...'; // Default text
        switch (weatherMain) {
            case 'clear': return 'Clear Sky';
            case 'clouds': return 'Cloudy';
            case 'rain': return 'Rainy';
            case 'thunderstorm': return 'Thunderstorm';
            case 'snow': return 'Snowy';
            case 'mist': return 'Misty';
            default: return 'Unknown Weather';
       }
     },
     // This computed property is likely NOT used for the main illustration anymore,
     // but we keep the mapWeatherToImage method which IS used by getWeatherWeeklyIllustration
     getWeatherTodayIllustration(){
        const weatherImg = this.weather?.weather?.[0]?.main?.toLowerCase();
        if (!weatherImg) return '../assets/img/sunnyImg.png'; // Default image path (won't work dynamically)
        // Ensure this mapping function exists and is correct
        return this.mapWeatherToImage(weatherImg); // This will now return a resolved URL
     }
     // ... other computed properties using this.weather, this.five_day_forecast etc.
  },
  methods: {
    // --- Data Loading and Watching ---
    loadDataFromStore() {
        console.log("BasicMode: Attempting to load data from store...");
        const regionData = this.regionWeatherDataFromStore; // Use the computed accessor

        // Check if the necessary data structure exists in the store
        if (regionData && regionData.currentWeather && regionData.fiveDayForecast && regionData.airQuality) {
            console.log("BasicMode: Found complete region data in store. Copying to local state.");

            // **Important**: Create deep copies to avoid modifying store state indirectly if needed,
            // or shallow copies if mutations aren't expected/problematic.
            // Using spread operator for shallow copy here.
            this.weather = { ...regionData.currentWeather };
            this.five_day_forecast = { ...regionData.fiveDayForecast };
            this.air_quality = { ...regionData.airQuality };

            // Ensure nested arrays/objects exist after copy for template safety
            if (!this.weather.weather) this.weather.weather = [{}];
            if (!this.weather.main) this.weather.main = {};
            if (!this.weather.sys) this.weather.sys = {};
            if (!this.weather.wind) this.weather.wind = {};
            if (!this.five_day_forecast.list) this.five_day_forecast.list = [];
            if (!this.air_quality.list) this.air_quality.list = [];

            // Only set isLoading to false AFTER successfully copying data
            this.isLoading = false;
            console.log("BasicMode: Data copied, isLoading set to false.");

            // Calculate sun position AFTER data is loaded and DOM potentially updated
            // Ensure this runs only when not loading anymore
            this.$nextTick(() => {
                if (!this.isLoading) { // Double check isLoading
                   this.calculateSunPosition();
                }
            });
            // Nudges will be generated by watchers on local data changes now

        } else {
            console.log("BasicMode: Region data not yet available or incomplete in store.");
            // Keep loading true if essential data is missing
            this.isLoading = true;
        }
    },

    setupWatchers() {
        console.log("BasicMode: Setting up watcher for store data.");
        // Watch the computed property that accesses the store state
        watch(() => this.regionWeatherDataFromStore, (newData, oldData) => {
            // Optional: Add more detailed logging
            // console.log("BasicMode Watcher: regionWeatherData changed in store.");
            // console.log("New Data:", JSON.parse(JSON.stringify(newData || null))); // Log deep copy if needed
            // console.log("Old Data:", JSON.parse(JSON.stringify(oldData || null)));

            // When the store data changes (i.e., fetch completes or data is cleared),
            // call loadDataFromStore to update the component's local state.
            this.loadDataFromStore();
        }, {
           deep: true, // Watch for nested changes within the store object
           immediate: false // Don't run immediately, created() already called loadDataFromStore
        });

         // Watch isLoading state (optional, for debugging or specific actions)
         watch(() => this.isLoading, (loading, prevLoading) => {
             // console.log(`BasicMode Watcher: isLoading changed from ${prevLoading} to ${loading}`);
             if (!loading && prevLoading) {
                 console.log("BasicMode: Loading finished (isLoading watcher triggered).");
                 // Actions to take once loading is complete, if needed beyond loadDataFromStore
                 // e.g., trigger animations, final checks
             }
         });
    },

    // --- Other Methods ---
    // Ensure all methods use local component data (this.weather, etc.)
    // and include safety checks (e.g., using ?. optional chaining)

    dateBuilder() {
      return moment().format('dddd, D MMMM');
    },

    warmOrCold(){
      const temperature = this.weather?.main?.temp; // Use local data safely
      if (temperature === undefined || temperature === null) return '';
      switch (true) {
        case temperature > 16 && temperature <= 25: return 'Warm';
        case temperature > 25: return 'Hot';
        default: return 'Cold';
      }
    },

    getDayOfWeek(index) {
        const weekdays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
        // Use local data with optional chaining
        const forecastItem = this.five_day_forecast?.list?.[index * 8];
        if (!forecastItem?.dt_txt) return '';
        try {
            const forecastDate = new Date(forecastItem.dt_txt);
            return weekdays[forecastDate.getDay()];
        } catch (e) {
            console.error("Error parsing forecast date:", forecastItem.dt_txt, e);
            return '';
        }
    },

    formatTime(timestamp, timezoneOffset) {
       // Use local data with checks
       const tz = this.weather?.timezone; // Get timezone from local state

       // Check if timestamp is valid; timezone check happens below
       if (typeof timestamp !== 'number') {
           return '--:--'; // Return placeholder if timestamp is invalid
       }
       // Check if timezone is valid *after* confirming timestamp is okay
       if (typeof tz !== 'number') {
            console.warn("formatTime: Timezone offset is invalid or missing.", tz);
            // Decide on fallback: return UTC? return placeholder?
            // Returning placeholder for now.
            return '--:--';
       }

       try {
           // Use the timezone offset from local weather data
           const date = new Date((timestamp + tz) * 1000); // Calculate time in city's timezone
           const hours = date.getUTCHours(); // Use UTC methods to avoid local browser timezone issues
           const minutes = date.getUTCMinutes();
           const ampm = hours >= 12 ? 'PM' : 'AM';
           const formattedHours = hours % 12 === 0 ? 12 : hours % 12; // Handle 12 AM/PM correctly
           const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
           return `${formattedHours}:${formattedMinutes} ${ampm}`;
       } catch(e) {
           console.error("Error formatting time:", e);
           return '--:--';
       }
    },

    calculateSunPosition() {
        // Use local data with checks
        if (!this.weather?.sys?.sunrise || !this.weather?.sys?.sunset || typeof this.weather?.timezone !== 'number') {
            // console.warn("BasicMode: Cannot calculate sun position, weather data incomplete.");
            // Set defaults silently if data isn't ready
            document.documentElement.style.setProperty('--progress-width', `0%`);
            document.documentElement.style.setProperty('--uv-progress', `0%`);
            return;
        }

        try {
            const currentTimeUTC = new Date();
            const cityTimeMilliseconds = currentTimeUTC.getTime() + (this.weather.timezone * 1000);
            const cityTime = new Date(cityTimeMilliseconds);
            const timeStampCurrentTime = Math.round(cityTimeMilliseconds / 1000);
            const sunriseTime = this.weather.sys.sunrise;
            const sunsetTime = this.weather.sys.sunset;
            const daylightDuration = sunsetTime - sunriseTime;
            const timeSinceSunrise = timeStampCurrentTime - sunriseTime;
            let percentageOfDaylight = daylightDuration > 0 ? (timeSinceSunrise / daylightDuration) * 100 : 0;
            percentageOfDaylight = Math.max(0, Math.min(100, percentageOfDaylight));
            document.documentElement.style.setProperty('--progress-width', `${percentageOfDaylight}%`);

            const hour = cityTime.getUTCHours(); // Use UTC hours of the calculated city time
            let uvProgress = 0;
            if (hour >= 6 && hour <= 18) { // Simplified UV calculation
                const peakHour = 12;
                const hoursFromPeak = Math.abs(hour - peakHour);
                uvProgress = Math.max(0, 100 - (hoursFromPeak / 6) * 100);
            }
            document.documentElement.style.setProperty('--uv-progress', `${uvProgress}%`);
        } catch (e) {
            console.error("Error calculating sun position:", e);
            document.documentElement.style.setProperty('--progress-width', `0%`);
            document.documentElement.style.setProperty('--uv-progress', `0%`);
        }
    },

    getMinAndMaxTemp(index, property){
        // Use local data with checks
        const list = this.five_day_forecast?.list;
        if (!list || list.length < (index * 8 + 8)) {
            return { min: '--', max: '--' };
        }

        try {
            const start = index * 8;
            const end = start + 8;
            const temps = list.slice(start, end)
                .filter(item => item?.main?.[property] !== undefined && item?.main?.[property] !== null) // Ensure property exists and is not null/undefined
                .map(item => item.main[property]);

            if (temps.length === 0) return { min: '--', max: '--' };

            const minTemp = Math.min(...temps);
            const maxTemp = Math.max(...temps);
            return { min: Math.round(minTemp), max: Math.round(maxTemp) };
        } catch(e) {
            console.error("Error calculating min/max temp:", e);
            return { min: '--', max: '--' };
        }
    },

    getWeatherWeeklyIllustration(i){
        // Use local data with checks
        const weatherMain = this.five_day_forecast?.list?.[i * 8]?.weather?.[0]?.main;
        if (!weatherMain) {
            // Return default image URL resolved correctly
             return new URL('../assets/img/sunnyImg.png', import.meta.url).href;
        }
        // Call the updated mapWeatherToImage method
        return this.mapWeatherToImage(weatherMain);
    },

    // *** THIS METHOD IS NOW CORRECTED TO HANDLE DYNAMIC ASSET URLS ***
    mapWeatherToImage(weatherMain) {
      // Ensure weatherMain is a string before toLowerCase
      const mainLower = typeof weatherMain === 'string' ? weatherMain.toLowerCase() : '';
      let imageFilename = 'sunnyImg.png'; // Default image

       switch (mainLower) {
         case 'clear':
             imageFilename = 'sunnyImg.png';
             break;
         case 'clouds':
             imageFilename = 'cloudyImg.png';
             break;
         case 'rain':
             imageFilename = 'rainImg.png';
             break;
         case 'thunderstorm':
             imageFilename = 'thunderImg.png';
             break;
         case 'snow':
             imageFilename = 'snowImg.png';
             break;
         case 'mist': case 'fog': case 'haze': // Group similar ones
             imageFilename = 'mistImg.png';
             break;
         // default case uses the initialized imageFilename
       }

       try {
           // Construct the URL relative to the current module's URL
           // IMPORTANT: Adjust the relative path ('../../assets/img/') if your
           // component file location relative to the assets folder is different.
           // This assumes:
           // - BasicModeDashboardView.vue is in src/views/ (or similar depth)
           // - Your images are in src/assets/img/
           const imageUrl = new URL(`../assets/img/${imageFilename}`, import.meta.url).href;
           // console.log(`Mapping '${mainLower}' to URL: ${imageUrl}`); // Optional logging
           return imageUrl;
       } catch (e) {
           console.error(`Error creating URL for ${imageFilename}:`, e);
           // Return a fallback or default image URL in case of error
           return new URL('../assets/img/sunnyImg.png', import.meta.url).href; // Fallback default
       }
    },
    // ******************************************************************

    refreshingOrDry(){
        // Use local data with checks
        const humidity = this.weather?.main?.humidity;
        if (humidity === undefined || humidity === null) return '';
        if(humidity < 30) return 'Dry';
        else if (humidity < 60) return 'Refreshing';
        else return 'Very Humid';
    },

    computeFontSize(letterCount) {
      // This utility function is fine
      if (typeof letterCount !== 'number') return "1.5rem"; // Default size
      if (letterCount <= 5) return "2.75rem";
      else if (letterCount <= 6) return "1.8rem";
      else return "1.5rem";
    },

    airQualityMeaning(){
        // Use local data with checks
        const airQuality = this.air_quality?.list?.[0]?.main?.aqi;
        if (airQuality === undefined || airQuality === null) return 'Loading...';
        switch (true){
            case airQuality == 1: return 'Good air quality, little or no risk';
            case airQuality == 2: return 'Acceptable air quality';
            case airQuality == 3: return 'Unhealthy for sensitive groups';
            case airQuality == 4: return 'Health effects possible for everyone';
            case airQuality == 5: return 'Health alert; serious effects possible for all';
            default: return 'Unknown Air Quality';
        }
    },

    windSpeed(){
        // Use local data with checks
        const speed = this.weather?.wind?.speed;
        if (speed === undefined || speed === null) return 'Loading...';
        // Use Beaufort scale approximations based on m/s
        const speedMs = speed;
        switch (true) {
            case speedMs < 0.3: return 'Calm';
            case speedMs <= 1.5: return 'Light Air';
            case speedMs <= 3.3: return 'Light Breeze';
            case speedMs <= 5.4: return 'Gentle Breeze';
            case speedMs <= 7.9: return 'Moderate Breeze';
            case speedMs <= 10.7: return 'Fresh Breeze';
            case speedMs <= 13.8: return 'Strong Breeze';
            case speedMs <= 17.1: return 'Near Gale';
            case speedMs <= 20.7: return 'Gale';
            case speedMs <= 24.4: return 'Severe Gale';
            case speedMs <= 28.4: return 'Storm';
            case speedMs <= 32.6: return 'Violent Storm';
            case speedMs > 32.6: return 'Hurricane Force';
            default: return 'Unknown Wind';
        }
    },

    capitalizeDescription(description) {
       if (!description || typeof description !== 'string') return '';
       return description
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    },

    // This method is for the main OWM icon, should be correct now
    getWeatherIcon(iconCode) {
      if (!iconCode) return '';
      const baseUrl = 'https://openweathermap.org/img/wn/';
      const iconUrl = `${baseUrl}${iconCode}@4x.png`;
      return iconUrl;
    },


    // --- Nudge Methods ---
    handleUpClick() {
      if (this.nudges.length > 0) {
        this.currentNudgeIndex = (this.currentNudgeIndex - 1 + this.nudges.length) % this.nudges.length;
      }
    },
    handleDownClick() {
      if (this.nudges.length > 0) {
        this.currentNudgeIndex = (this.currentNudgeIndex + 1) % this.nudges.length;
      }
    },
    handleAllClear() {
      this.nudges = [];
      this.currentNudgeIndex = 0;
    },
    handleQuietTheSkies() {
      this.nudges = this.nudges.map(nudge => ({
        ...nudge,
        action: nudge.action === 'unread' ? 'read' : nudge.action
      }));
    },
    // Generate nudges based on LOCAL data, called by watchers
    generateWeatherNudges() {
        // Ensure data is actually ready before generating
        if (this.isLoading) {
            // console.log("BasicMode: Skipping nudge generation, still loading.");
            return;
        }
        console.log('BasicMode: Generating weather nudges...');
        const newNudges = [];
        // Use local data (this.weather, this.five_day_forecast) safely
        const currentWindSpeed = this.weather?.wind?.speed;
        const forecastPop = this.five_day_forecast?.list?.[0]?.pop;
        const currentTemp = this.weather?.main?.temp;
        const forecastTemp = this.five_day_forecast?.list?.[0]?.main?.temp; // Already metric

        // Check wind conditions
        if (typeof currentWindSpeed === 'number' && currentWindSpeed > 5.4) { // Example threshold
            newNudges.push({
                id: 'wind-' + Date.now(), type: 'wind', title: 'Windy Conditions',
                message: `A wind speed of ${currentWindSpeed.toFixed(1)} m/s is expected. Consider securing loose items.`,
                severity: 'info', action: 'unread', timestamp: new Date()
            });
        }
        // Check rain probability
        if (typeof forecastPop === 'number' && forecastPop > 0.3) { // Example threshold
            newNudges.push({
                id: 'rain-' + Date.now(), type: 'rain', title: 'Rain Alert',
                message: `There's a ${Math.round(forecastPop * 100)}% chance of rain today.`,
                severity: 'warning', action: 'unread', timestamp: new Date()
            });
        }
        // Check temperature changes
        if (typeof currentTemp === 'number' && typeof forecastTemp === 'number') {
            const tempChange = forecastTemp - currentTemp;
            if (Math.abs(tempChange) > 5) { // Example threshold
                newNudges.push({
                    id: 'temp-' + Date.now(), type: 'temperature', title: 'Temperature Change',
                    message: `Temperature will ${tempChange > 0 ? 'rise' : 'drop'} by ${Math.abs(Math.round(tempChange))}°C today.`,
                    severity: 'info', action: 'unread', timestamp: new Date()
                });
            }
        }

        console.log('BasicMode: Generated nudges:', newNudges);
        this.nudges = newNudges;
        this.currentNudgeIndex = 0; // Reset index when nudges update
    },
  }
};

</script>

<template>
  <main class="dash-body">
    <div class="grid" v-if="isDataReady">
      <div class="div0 gridCell">
        <HeaderDashboard />
      </div>
      <div class="div1 gridCell">
        <div id="containerWeatherToday">
          <h3 id="date">{{ dateBuilder() }}</h3>
          <img
            v-if="weather.weather && weather.weather.length > 0"
            id="weatherTodayIllustration"
            :src="getWeatherIcon(weather.weather[0].icon)"
            :alt="getWeatherAltText"
          >
          <div id="location">
            <font-awesome-icon icon="location-dot" style="color: #303030;" />
            <span class="locationCity">{{ weather.name || region }}</span>
          </div>
        </div>
      </div>
      <div class="div2 gridCell">
        <div id="containerWeatherInfoToday">
          <div class="weather-info-row">
            <div id="feelsLikeContainer">
              <p id="feelsLikeTitle">Feels Like</p>
              <p id="feelsLikeData" v-if="weather.main">{{ `${Math.round(weather.main.feels_like)}°C ${warmOrCold()}` }}</p>
            </div>
            <div id="expectedContainer">
              <p id="expectedTitle">Expected</p>
              <p id="expectedData" v-if="weather.weather && weather.weather.length > 0">{{ capitalizeDescription(weather.weather[0].description) }}</p>
            </div>
          </div>

          <div class="weather-metrics-row">
            <div id="humidityContainer">
              <div class="humidityContainerHeader">
                <img src="../assets/img/humidityIconBasicMode.svg" class="humidityIcon">
                <p class="humidityTitleBasicMode">Humidity</p>
              </div>
              <div id="humidityData" v-if="weather.main">
                <p id="humidityPercentage">{{ weather.main.humidity }}%</p>
                <p id="refreshingOrDry">{{ refreshingOrDry() }}</p>
              </div>
            </div>

            <div id="rainContainer">
              <div class="rainContainerHeader">
                <img src="../assets/img/rainIconBasicMode.svg" class="rainIcon">
                <p class="rainTitleBasicMode">Rain</p>
              </div>
              <div id="rainData" v-if="five_day_forecast.list && five_day_forecast.list.length > 0">
                <p id="rainPercentage">
                  {{ Math.round(five_day_forecast.list[0].pop * 100) }}
                </p>
                <p id="chance">% Chance</p>
              </div>
            </div>

            <div id="windContainer">
              <div class="windContainerHeader">
                <img src="../assets/img/windIconBasicMode.svg" class="windIcon">
                <p class="windTitleBasicMode">Wind</p>
              </div>
              <p id="windData" v-if="weather.wind">{{ windSpeed() }}</p>
            </div>
          </div>

          <RouterLink :to="{ name: 'advancedModeDashboard', params: { city: weather.name || region }}" id="seeMoreBtn">
            See more
          </RouterLink>
        </div>
      </div>

      <div class="div3 gridCell">
         <div id="containerNimbusNudges">
           <div id="headerNimbusNudges">
             <h3 id="titleNimbusNudges">Nimbus Nudges</h3>
             <div id="buttonsHeaderNimbusNudges">
               <ArrowButton direction="left" button-class="personalization-arrow" @clickButton="handleUpClick" :disabled="nudges.length <= 1" />
               <span class="nudge-counter">
                 {{ nudges.filter(n => n.action === 'read').length }}/{{ nudges.length }} read
               </span>
               <ArrowButton direction="right" button-class="personalization-arrow" @clickButton="handleDownClick" :disabled="nudges.length <= 1" />
             </div>
           </div>
           <div id="nimbusNudgesContent">
             <div v-if="nudges.length === 0" class="empty-state">
               <h4>All Clear!</h4>
               <p>No weather alerts at the moment.</p>
             </div>
             <template v-else>
               <div v-if="nudges[currentNudgeIndex]" class="nudge-header" :class="{ 'nudge-read': nudges[currentNudgeIndex].action === 'read' }">
                 <h4>{{ nudges[currentNudgeIndex].title }}</h4>
               </div>
               <div v-if="nudges[currentNudgeIndex]" id="nimbusNudgesData" :class="{ 'nudge-read': nudges[currentNudgeIndex].action === 'read' }">
                 {{ nudges[currentNudgeIndex].message }}
               </div>
               <div id="buttonsOptionsNimbusNudges">
                 <button
                   id="allClearBtn"
                   @click="handleAllClear"
                   :disabled="nudges.length === 0"
                 >
                   ALL CLEAR!
                 </button>
                 <button
                   id="quietTheSkiesBtn"
                   @click="handleQuietTheSkies"
                   :disabled="nudges.length === 0 || nudges.every(n => n.action === 'read')"
                 >
                   QUIET THE SKIES
                 </button>
               </div>
             </template>
           </div>
         </div>
      </div>

      <div class="div4 gridCell">
        <div id = 'degreesContainer' v-if="weather.main">
            <h1 id = 'degreesValue'>{{Math.round(weather.main.temp)}}
              <div class="degress-sub-wrapper">
                <div id = 'degrees'>degrees</div>
                <div id = 'degreesType'>celsius</div>
              </div>
            </h1>
        </div>
      </div>
      <div class="div5 gridCell">
        <div id = 'temperatureGraphContainerBasicMode'>
          <img src="../assets/img/graphBasicMode.svg" id = 'imgGraphBasicMode'>
        </div>
      </div>
      <div class="div6 gridCell">
        <div id = 'airQualityContainer' v-if="air_quality.list && air_quality.list.length > 0">
          <div id = 'airQualityHeader'>Air Quality</div>
          <p id = 'airQualityMeaning'>{{ airQualityMeaning() }}</p>
          <div id = 'airQualityData'>
            <div id = 'circleAirQuality'>
            <h2 id = 'airQualityValue'>{{ air_quality.list[0].main.aqi }}</h2>
          </div>
          </div>
        </div>
      </div>
      <div class="div7 gridCell">
        <section id = 'thisWeekSection' v-if="five_day_forecast.list && five_day_forecast.list.length >= 40"> <div id = 'thisWeekContainer'><p>This Week</p></div>
          <div id = 'mondayContainer'>
            <h3 class = 'dayTitle'>{{ getDayOfWeek(0) }}</h3>
            <img id = 'mondayImg' :src="getWeatherWeeklyIllustration(0)"> <div id = 'mondayTemp'>
              <p id = 'minTempMonday'>{{getMinAndMaxTemp(0, 'temp_min').min}}°</p>
              <p id = 'maxTempMonday'>/{{getMinAndMaxTemp(0, 'temp_max').max}}°</p>
            </div>
          </div>
           <div id = 'tuesdayContainer'>
            <h3 class = 'dayTitle'>{{ getDayOfWeek(1) }}</h3>
            <img id = 'tuesdayImg' :src="getWeatherWeeklyIllustration(1)">
            <div id = 'tuesdayTemp'>
              <p id = 'minTempTuesday'>{{getMinAndMaxTemp(1, 'temp_min').min}}°</p>
              <p id = 'maxTempTuesday'>/{{getMinAndMaxTemp(1, 'temp_max').max}}°</p>
            </div>
          </div>
           <div id = 'wednesdayContainer'>
            <h3 class = 'dayTitle'>{{ getDayOfWeek(2) }}</h3>
            <img id = 'wednesdayImg' :src="getWeatherWeeklyIllustration(2)">
            <div id = 'wednesdayTemp'>
              <p id = 'minTempWednesday'>{{getMinAndMaxTemp(2, 'temp_min').min}}°</p>
              <p id = 'maxTempWednesday'>/{{getMinAndMaxTemp(2, 'temp_max').max}}°</p>
            </div>
          </div>
           <div id = 'thursdayContainer'>
            <h3 class = 'dayTitle'>{{ getDayOfWeek(3) }}</h3>
            <img id = 'thursdayImg' :src="getWeatherWeeklyIllustration(3)">
            <div id = 'thursdayTemp'>
              <p id = 'minTempThursday'>{{getMinAndMaxTemp(3, 'temp_min').min}}°</p>
              <p id = 'maxTempThursday'>/{{getMinAndMaxTemp(3, 'temp_max').max}}°</p>
            </div>
          </div>
           <div id="fridayContainer">
            <h3 class = 'dayTitle'>{{ getDayOfWeek(4) }}</h3>
            <img id="fridayImg" :src="getWeatherWeeklyIllustration(4)">
            <div id="fridayTemp">
              <p id="minTempFriday">{{getMinAndMaxTemp(4, 'temp_min').min}}°</p>
              <p id="maxTempFriday">/{{getMinAndMaxTemp(4, 'temp_max').max}}°</p>
            </div>
          </div>
        </section>
      </div>
      <div class="div8 gridCell">
         <div id = 'sunshineInfo' v-if="weather.sys">
          <div id="sunriseSunsetContainer">
            <div id="sunriseContainer">
              <p id="sunrise">Sunrise</p>
              <p id="sunriseTime">{{ formatTime(weather.sys.sunrise, weather.timezone) }}</p>
            </div>
            <div id="sunriseSunsetIllustration">
              <div id="sunriseSunsetBigLine"></div>
              <div id="ssSmallLine"></div>
              <div id="ssCircle"></div>
            </div>
            <div id="sunsetContainer">
              <p id="sunset">Sunset</p>
              <p id="sunsetTime">{{ formatTime(weather.sys.sunset, weather.timezone) }}</p>
            </div>
          </div>

          <div id="uvLightContainer">
            <div id="uvHeader">
              <p id="uv">UV</p>
              <p id="uvRec">Cover up, stay in shade.</p>
            </div>
            <div id="uvIllustration">
              <div id="uvBigLine"></div>
               <div id="uvSmallLine"></div>
              <div id="uvCircle"></div>
            </div>
          </div>
        </div>
      </div>

    </div>
    <div v-else class="loading-indicator">
        Loading weather data for {{ region || 'your location' }}...
        </div>
  </main>
</template>

<style>

.dash-body {
    width: 100vw;
    height: 100vh;
    margin: 0;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #49ABFB;
}
.grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  grid-template-rows: 50px 1fr 1fr;
  gap: clamp(1rem, 2vw, 2rem);
  height: min(90vh, 850px);
  width: min(95vw, 1260px);
  padding: 1rem;
}

.gridCell {
  background-color: #F2E6DD;
  border: 1px solid #303030;
  border-radius: clamp(0.75rem, 1.5vw, 1.25rem);
  position: relative;
  overflow: hidden;
  transition: transform 0.3s ease-in-out;
  display: flex;
  justify-content: center;
}

.div0 { grid-area: 1 / 1 / 2 / 5;
border-radius: 50px 50px 10px 10px ;}

.div1 { grid-area: 2 / 1 / 3 / 2;}

.div2 { grid-area: 2 / 2 / 3 / 4;}

.div3 { grid-area: 2 / 4 / 3 / 4;}

.div4 { grid-area: 3 / 1 / 4 / 2;}

.div5 { grid-area: 3 / 2 / 4 / 4;}

.div6 { grid-area: 3 / 4 / 4 / 4;}

.div7 { grid-area: 4/ 1/  4 / 4;}

.div8 { grid-area: 4 / 4/ 5 / 4;}
:root{
  background-color: #EDDED4;
}
#containerWeatherToday {
  width: 100%;
  border-radius: clamp(0.5rem, 1vw, 0.75rem);
  background: #C3C3C3;
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  align-items: center;
  padding: clamp(0.5rem, 1vw, 1rem);
  gap: 0.5rem;
}
#date {
  color: #F8FAFB;
  margin: 0;
  font-family: Asap;
  font-size: clamp(1rem, 2.5vw, 1.5625rem);
  font-style: normal;
  font-weight: 400;
  line-height: normal;
}

#weatherTodayIllustration {
  width: clamp(6rem, 12vw, 8em);
  height: auto;
  object-fit: contain;
  margin-top: -0.5rem;
  margin-bottom: -0.5rem;
}

#location {
  width: 90%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #303030;
  gap: 0.5rem;
  padding: 0;
  margin-top: -0.5rem;
}

.locationCity {
  font-family: 'Asap', sans-serif;
  font-weight: bold;
  font-size: clamp(1rem, 1.8vw, 1.5rem);
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 80%;
}

#containerWeatherInfoToday {
  width: 100%;
  height: 100%;
  border-radius: clamp(0.5rem, 1vw, 0.75rem);
  background: #B7AFE2;
  padding: clamp(0.5rem, 1.5vw, 1rem);
  display: flex;
  flex-direction: column;
  gap: clamp(0.5rem, 1vw, 0.75rem);
  position: relative;
}

.weather-info-row {
  display: flex;
  gap: clamp(0.5rem, 1vw, 0.75rem);
  width: 100%;
}

#feelsLikeContainer, #expectedContainer {
  flex: 1;
  height: clamp(2.25rem, 4vw, 2.75rem);
  border-radius: 3.125rem;
  border: 1px solid #303030;
  background: #D9D5EE;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  gap: 0.5rem;
}

.weather-metrics-row {
  display: flex;
  gap: clamp(0.25rem, 0.5vw, 0.5rem);
  width: 100%;
  margin-bottom: 2rem; /* Add space for the See more button */
}

#humidityContainer, #rainContainer, #windContainer {
  flex: 1;
  height: clamp(4rem, 8vw, 5rem);
  border-radius: clamp(0.75rem, 1.5vw, 1.25rem);
  border: 1px solid #303030;
  background: #D9D5EE;
  display: flex;
  flex-direction: column;
  padding: 0.75rem;
}

.humidityContainerHeader, .rainContainerHeader, .windContainerHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

#feelsLikeTitle, #expectedTitle, .humidityTitleBasicMode, .rainTitleBasicMode, .windTitleBasicMode {
  color: #303030;
  font-family: Asap;
  font-size: clamp(0.875rem, 1.2vw, 1rem);
  font-weight: 700;
  white-space: nowrap;
}

#feelsLikeData, #expectedData, #humidityData, #rainData, #windData {
  color: var(--Textual-Elements-Stormcloud-Grey, #858585);
  font-family: Asap;
  font-size: clamp(0.875rem, 1.2vw, 1rem);
  font-weight: 400;
  white-space: nowrap;
}

#seeMoreBtn {
  position: absolute;
  bottom: 2.3rem;
  right: 1rem;
  color: #303030;
  font-family: Asap;
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  background-color: rgba(255, 255, 255, 0.3);
  transition: all 0.2s ease-in-out;
}

#seeMoreBtn:hover {
  background-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-1px);
}

#containerNimbusNudges {
  width: 100%;
  height: 100%;
  border-radius: 1.25rem;
  background: var(--Secondary-Color-Palette-Sky-Wash, #ADD8FB);
  display: flex;
  flex-direction: column;
  padding: 1rem;
  box-sizing: border-box;
}
#headerNimbusNudges {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
#titleNimbusNudges {
  color: #303030;
  font-family: Asap;
  font-size: 1.125rem;
  font-style: normal;
  font-weight: 800;
  margin: 0;
}
#buttonsHeaderNimbusNudges {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.nudge-counter {
  color: #303030;
  font-family: Asap;
  font-size: 0.875rem;
  font-weight: 600;
  min-width: 5rem;
  text-align: center;
}
#nimbusNudgesContent {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.nudge-header {
  background: rgba(255, 255, 255, 0.3);
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  margin-bottom: 0.75rem;
}
.nudge-header h4 {
  margin: 0;
  font-family: Asap;
  font-size: 1rem;
  font-weight: 700;
  color: #303030;
}
#nimbusNudgesData {
  flex: 1;
  margin: 0 0 1rem 0;
  font-family: Asap;
  font-size: 0.875rem;
  line-height: 1.4;
  color: #303030;
  padding: 0 0.5rem;
  min-height: 3rem;
}
#buttonsOptionsNimbusNudges {
  display: flex;
  gap: 0.75rem;
  margin-top: auto;
}
#allClearBtn, #quietTheSkiesBtn {
  flex: 1;
  padding: 0.5rem;
  border-radius: 1.25rem;
  border: 1px solid #303030;
  font-family: Asap;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  text-align: center;
}
#allClearBtn {
  background: #DFE287;
  color: #303030;
}
#quietTheSkiesBtn {
  background: #E18AD1;
  color: #303030;
}
#allClearBtn:disabled, #quietTheSkiesBtn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
#allClearBtn.cleared {
  background: #90EE90;
}
#quietTheSkiesBtn.quieted {
  background: #FFB6C1;
}
.arrow-button.personalization-arrow {
  background-color: transparent;
  width: 24px;
  height: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  padding: 0;
}
#buttonsHeaderNimbusNudges .personalization-arrow {
  transform: none !important;
}
#buttonsHeaderNimbusNudges .personalization-arrow[direction="left"] {
  transform: rotate(180deg) !important;
}
#buttonsHeaderNimbusNudges .personalization-arrow[direction="right"] {
  transform: none !important;
}
#feelsLikeTitle, #expectedTitle, .humidityTitleBasicMode, .rainTitleBasicMode, .windTitleBasicMode{
  color: #303030;
  text-align: right;
  font-family: Asap;
  font-size: 1rem;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
}
#feelsLikeData, #ColdOrWarm, #expectedData{
  color: var(--Textual-Elements-Stormcloud-Grey, #858585);
  font-family: Asap;
  font-size: 1rem;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
}
/* #ColdOrWarm{
  transform: translateX(-32%);
}
 */
.humidityIcon, .rainIcon, .windIcon{
margin-left: 0.8rem;
margin-top: 0.8rem; 
}

#humidityPercentage, #rainPercentage, #windData{
margin-left: 0.8rem;

}

#rainPercentage, #chance, #windData {
  margin-top: 0.8rem;
}

#refreshingOrDry, #chance{
  margin-right: 0.8rem;
}

.humidityTitleBasicMode, .rainTitleBasicMode, .windTitleBasicMode{
  margin-right: 0.8rem;
  margin-top: 0.8rem;
  margin-bottom: 0;
}

.rainTitleBasicMode {
  transform: translateY(-15%);
}


#rainData, #humidityData, #windData{
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--Textual-Elements-Stormcloud-Grey, #858585);
  text-align: right;
  font-family: Asap;
  font-size: 1rem;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  width: 100%;
}

#degreesContainer{
  width: 100%;
  height: 100%;
  border-radius: clamp(0.75rem, 1.5vw, 1.25rem);
  background: rgba(156, 200, 161, 0.80);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(1rem, 2vw, 2rem);
}
#degreesValue{
  color: #303030;
  margin: 0;
  font-family: Recoleta;
  font-size: clamp(4rem, 8vw, 11rem);
  font-style: normal;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.degress-sub-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: clamp(0.75rem, 1.5vw, 1rem);
}
#degreesType, #degrees{
  color: var(--textual-elements-20-saturation-midnight-onyx-20-sat, #302727);
  font-family: Asap;
  font-size: 1.0rem;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  margin: 0;
  transform: translateY(-200%);
  display: flex;
}

#temperatureGraphContainerBasicMode{
  width: 100%;
  flex-shrink: 0;
  border-radius: 1.25rem;
  background: #F2E6DD;

  display: flex;
  align-items: center;
  justify-content: center;
}
/* #imgGraphBasicMode{
  margin-top: 0.5em;
} */

#airQualityContainer{
  width: 100%;
  height: 100%;
  border-radius: clamp(0.75rem, 1.5vw, 1.25rem);
  background: #FF87AB;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  gap: 0.5rem;
}
#airQualityHeader{
  color: #49ABFB;
  font-family: Asap;
  font-size: clamp(1.25rem, 2vw, 1.5rem);
  font-weight: 700;
  margin: 0;
}

#airQualityData{
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

#circleAirQuality{
  width: min(6rem, 70%);
  height: min(6rem, 70%);
  background-color: #FFECA7;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

#airQualityValue{
  color: #303030;
  font-family: Recoleta;
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 600;
  margin: 0;
}

#airQualityMeaning {
  color: #F8FAFB;
  font-family: Asap;
  font-size: clamp(0.875rem, 1.5vw, 1rem);
  font-weight: 400;
  margin: 0;
}

#thisWeekSection{
  display: flex;
  width: 100%;
  justify-content: space-around;
  align-items: center;
}
#thisWeekContainer{
  width: 2.3125rem;
  height: 8.3125rem;
  flex-shrink: 0;
  border-radius: 1.25rem 0.3125rem 0.3125rem 1.25rem;
  border: 1px solid #000;
  background: #E18AD1;
  display: flex;
  align-items: center;
}

#thisWeekContainer p{
  color: #01542C;
  font-family: Recoleta;
  font-size: 1.25rem;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  transform-origin: bottom left;
  white-space: nowrap; 
  transform:  translate(38%, 125%) rotate(-90deg);
}

#mondayContainer, #tuesdayContainer, #wednesdayContainer, #thursdayContainer, #fridayContainer{
  width: 5.9375rem;
  height: 8.3125rem;
  flex-shrink: 0;
  border-radius: 1.25rem;
  border: 1px solid #000;
  background: #F2E6DD;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0.5rem;

}
.dayTitle{
  color: #303030;
  font-family: Recoleta;
  font-size: 1.5625rem;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  margin: 0;
}
#mondayContainer h3, #tuesdayContainer h3, #wednesdayContainer h3, #thursdayContainer h3, #fridayContainer h3{
  margin-top: 0.5em;
}

#mondayTemp, #tuesdayTemp, #thursdayTemp,  #wednesdayTemp, #fridayTemp{
  margin-top: auto; 
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
}

#mondayTemp p,
#tuesdayTemp p,
#thursdayTemp p,
#wednesdayTemp p,
#fridayTemp p {
  margin: 0; 
  margin-bottom: 0.5em;
}

#minTempMonday, #minTempTuesday, #minTempWednesday, #minTempThursday, #minTempFriday{
  color: #303030;
text-align: right;
font-family: Asap;
font-size: 1.125rem;
font-style: normal;
font-weight: 700;
line-height: normal;
}

#date{
  margin: 0;
}

#maxTempMonday, #maxTempTuesday, #maxTempWednesday, #maxTempThursday, #maxTempFriday{
  
  color: #303030;
text-align: right;
font-family: Asap;
font-size: 0.75rem;
font-style: normal;
font-weight: 400;
line-height: normal;
}

#sunshineInfo {
  width: 100%;
  height: 100%;
  flex-shrink: 0;
  border-radius: 1.25rem;
  background: var(--primary-color-palette-40-saturation-sunbeam-gold-40-sat, #FAE3AF);
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  flex-direction: column;
  padding: 1rem;
  box-sizing: border-box;
}

#sunriseSunsetContainer {
  width: 90%;
  height: 4.5rem;
  flex-shrink: 0;
  border-radius: 1.875rem;
  border: 1px solid #303030;
  background: #F2E6DD;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.25rem;
  margin-bottom: 1rem;
}

#sunriseContainer, #sunsetContainer {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
}

#sunrise, #sunset {
  color: #303030;
  font-family: Asap;
  font-size: 1rem;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  margin: 0;
}

#sunriseTime, #sunsetTime {
  color: var(--Textual-Elements-Stormcloud-Grey, #858585);
  font-family: Asap;
  font-size: 0.875rem;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  margin: 0;
}

#sunriseSunsetIllustration {
  width: 6rem;
  height: 2rem;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

#sunriseSunsetBigLine {
  width: 100%;
  height: 0.25rem;
  border-radius: 0.625rem;
  background: #D9D9D9;
  position: absolute;
}

#ssSmallLine {
  height: 0.25rem;
  border-radius: 0.625rem;
  background: var(--secondary-color-palette-40-saturation-sky-wash-40-sat, #49ABFB);
  position: absolute;
  left: 0;
  width: var(--progress-width, 50%);
}

#ssCircle {
  width: 0.875rem;
  height: 0.875rem;
  border-radius: 50%;
  background-color: #FABE32;
  position: absolute;
  left: var(--progress-width, 50%);
  transform: translate(-50%, -50%);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  top: 50%;
}

#uvLightContainer {
  width: 90%;
  height: 4.5rem;
  flex-shrink: 0;
  border-radius: 1.875rem;
  border: 1px solid #303030;
  background: #F2E6DD;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0.75rem 1.25rem;
}

#uvHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

#uv {
  color: #303030;
  font-family: Recoleta;
  font-size: 1rem;
  font-style: normal;
  font-weight: 900;
  line-height: normal;
  margin: 0;
}

#uvRec {
  color: var(--Textual-Elements-Stormcloud-Grey, #858585);
  font-family: Asap;
  font-size: 0.875rem;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  margin: 0;
}

#uvIllustration {
  width: 100%;
  height: 1rem;
  position: relative;
  display: flex;
  align-items: center;
}

#uvBigLine {
  width: 100%;
  height: 0.25rem;
  border-radius: 0.625rem;
  background: #D9D9D9;
  position: absolute;
}

#uvSmallLine {
  width: var(--uv-progress, 30%);
  height: 0.25rem;
  border-radius: 0.625rem;
  background: var(--secondary-color-palette-20-saturation-autumn-blaze-20-sat, #E64000);
  position: absolute;
  left: 0;
}

#uvCircle {
  width: 0.875rem;
  height: 0.875rem;
  border-radius: 50%;
  background-color: #FABE32;
  position: absolute;
  left: var(--uv-progress, 30%);
  transform: translate(-50%, -50%);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  top: 50%;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;

}

.empty-state h4 {
  color: #303030;
  font-family: Asap;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #858585;
  font-family: Asap;
  font-size: 1rem;
}
#thisWeekSection > div img {
  width: 46px;
  height: auto; /* Optional: Keeps the image aspect ratio */
  display: block; /* Optional: Can help prevent extra space below image */
  margin: 5px auto; /* Optional: Adds some vertical space and centers if needed */
}

.nudge-read {
  opacity: 0.7;
  background: rgba(255, 255, 255, 0.2);
}

.nudge-header.nudge-read {
  background: rgba(255, 255, 255, 0.2);
}

#nimbusNudgesData.nudge-read {
  color: #858585;
}

/* Media queries for responsive design */
@media screen and (max-width: 1024px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: auto;
  }
  
  .div0 { grid-area: 1 / 1 / 2 / 3; }
  .div1 { grid-area: 2 / 1 / 3 / 2; }
  .div2 { grid-area: 2 / 2 / 3 / 3; }
  .div3 { grid-area: 3 / 1 / 4 / 3; }
  .div4 { grid-area: 4 / 1 / 5 / 2; }
  .div5 { grid-area: 4 / 2 / 5 / 3; }
  .div6 { grid-area: 5 / 1 / 6 / 3; }
  .div7 { grid-area: 6 / 1 / 7 / 3; }
  .div8 { grid-area: 7 / 1 / 8 / 3; }
}

@media screen and (max-width: 640px) {
  .grid {
    grid-template-columns: 1fr;
  }
  
  .div0 { grid-area: 1 / 1 / 2 / 2; }
  .div1 { grid-area: 2 / 1 / 3 / 2; }
  .div2 { grid-area: 3 / 1 / 4 / 2; }
  .div3 { grid-area: 4 / 1 / 5 / 2; }
  .div4 { grid-area: 5 / 1 / 6 / 2; }
  .div5 { grid-area: 6 / 1 / 7 / 2; }
  .div6 { grid-area: 7 / 1 / 8 / 2; }
  .div7 { grid-area: 8 / 1 / 9 / 2; }
  .div8 { grid-area: 9 / 1 / 10 / 2; }
  
  #containerWeatherInfoToday {
    flex-direction: column;
  }
  
  #thisWeekSection {
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: auto auto;
  }
}
</style>