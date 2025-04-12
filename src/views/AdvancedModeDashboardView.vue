<script>
import { useUserStore } from "@/stores/user";
import { useWeatherStore } from '@/stores/weather'; // Corrected import path if needed
// Removed weatherService imports as fetching is handled centrally now
import HeaderDashboard from "@/components/HeaderDashboard.vue";
import ArrowButton from "@/components/ArrowButton.vue";
import { watch } from 'vue'; // Import watch

export default {
  name: 'advancedMode',
  data() {
    return {
      isWeatherLoaded: false, // Controls loading state display
      currentTime: '',
      currentDay: new Date().getDate(),
      currentDate: "",
      currentMonth: this.getMonthName(new Date().getMonth()), // Initialize month correctly
      daysOfWeek: ["M", "T", "W", "T", "F", "S", "S"], // For calendar display
      currentYear: new Date().getFullYear(),
      currentDayOfWeek: "",
      // Local component state to hold data copied from the store
      weather: { // For the primary region
        main: {},
        weather: [{}], // Initialize with placeholder to avoid template errors initially
        wind: {},
        sys: {},
        name: ''
      },
      five_day_forecast: { list: [] }, // Add local state for forecast
      air_quality: { list: [] }, // Add local state for air quality
      weatherCity: [], // For favorite locations
      countryMapping: {},
      currentNudgeIndex: 0,
      nudges: [], // Local nudges based on primary region weather
    };
  },
  components: {
    HeaderDashboard,
    ArrowButton
  },
  created() {
    // Don't fetch weather here anymore - App.vue handles it
    // Start time updates and fetch country mapping
    this.startUpdatingTime();
    this.fetchCountries(); // Fetch country names
    console.log("AdvancedModeDashboard created.");

    // Initial attempt to load data from store - might be null if fetch isn't complete
    this.loadDataFromStore();
  },
  mounted() {
    console.log("AdvancedModeDashboard mounted.");
    // Setup watchers here AFTER the store instances are available
    this.setupWatchers();
  },
  computed: {
    // Keep store accessors
    userStore() {
       return useUserStore();
     },
     weatherStore() {
      return useWeatherStore()
     },
     // Computed properties accessing user store are fine
     getAuthenticatedUser() {
       return this.userStore.authenticatedUser || {};
     },
     userLocations() {
       return this.getAuthenticatedUser.userLocations || [];
     },
     userLocation() {
       return this.getAuthenticatedUser.userRegion || null;
     },
     // Calendar computed properties seem okay, ensure monthIndex is correct
     monthIndex(){
       return new Date().getMonth(); // Correctly gets current month index (0-11)
     },
     firstDayOfMonth(){
       // Calculate the day of the week for the 1st of the month (0=Sun, 1=Mon...)
       const firstDay = new Date(this.currentYear, this.monthIndex, 1).getDay();
       // Adjust so Monday is 0, Sunday is 6 for easier grid layout
       return firstDay === 0 ? 6 : firstDay - 1;
     },
     daysInMonth(){
       return new Date(this.currentYear, this.monthIndex + 1, 0).getDate();
     },
  },
  methods: {
    // --- Data Loading and Watching ---
    loadDataFromStore() {
        console.log("AdvancedMode: Attempting to load data from store...");
        const regionData = this.weatherStore.regionWeatherData;
        const locationsData = this.weatherStore.weatherData;

        let regionDataFound = false;
        let locationsDataFound = false; // Flag to track if we found valid location data

        if (regionData && regionData.currentWeather && regionData.fiveDayForecast && regionData.airQuality) {
            console.log("AdvancedMode: Found region data in store. Copying to local state.");
            this.weather = { ...regionData.currentWeather }; // Copy data
            this.five_day_forecast = { ...regionData.fiveDayForecast };
            this.air_quality = { ...regionData.airQuality };
            // Ensure nested arrays exist after copy
            if (!this.weather.weather) this.weather.weather = [{}];
            if (!this.five_day_forecast.list) this.five_day_forecast.list = [];
            if (!this.air_quality.list) this.air_quality.list = [];
            this.generateWeatherNudges(); // Generate nudges once primary data is loaded
            regionDataFound = true;
        } else {
            console.log("AdvancedMode: Region data not yet available in store.");
        }

        // Check locationsData AFTER checking regionData
        if (locationsData && Object.keys(locationsData).length > 0) {
            console.log("AdvancedMode: Found favorite locations data in store. Processing...");
            // Correctly iterate over the OBJECT values
            this.weatherCity = Object.values(locationsData)
                .filter(locData => locData && locData.currentWeather && !locData.error) // Filter out errors or incomplete data
                .map(locData => locData.currentWeather); // Extract currentWeather
            console.log("AdvancedMode: Populated weatherCity:", this.weatherCity);
            if (this.weatherCity.length > 0) {
                locationsDataFound = true; // Set flag if we processed locations
            }
        } else {
            console.log("AdvancedMode: Favorite locations data not yet available or empty in store.");
            this.weatherCity = []; // Ensure it's empty if no data
        }

        // Update loading state ONLY if region data is found
        // The display of cities is handled separately in the template
        if (regionDataFound) {
            this.isWeatherLoaded = true;
            console.log("AdvancedMode: isWeatherLoaded set to true (based on region data).");
        } else {
             this.isWeatherLoaded = false; // Keep false if main data is missing
        }
    },

    setupWatchers() {
        console.log("AdvancedMode: Setting up watchers for store data.");
        // Watch for changes in the store's region weather data
        watch(() => this.weatherStore.regionWeatherData, (newData) => {
            console.log("AdvancedMode Watcher: regionWeatherData changed:", newData);
            this.loadDataFromStore(); // Reload component data when store updates
        }, { deep: true });

        // Watch for changes in the store's favorite locations data
        watch(() => this.weatherStore.weatherData, (newData) => {
            console.log("AdvancedMode Watcher: weatherData changed:", newData);
             // Only reload data, don't change isWeatherLoaded based on this
             this.loadDataFromStore();
        }, { deep: true });
    },

    // --- Other Methods ---
    async fetchCountries() {
      console.log("AdvancedMode: Fetching countries...");
      try {
        // *** CORRECTED URL HERE ***
        const fetchUrl = "[https://restcountries.com/v3.1/all](https://restcountries.com/v3.1/all)";
        console.log("Fetching countries from:", fetchUrl); // Log the URL
        const response = await fetch(fetchUrl);
        // **************************
        if (!response.ok) {
           // Try to get error message from response body if available
           let errorMsg = `Failed to fetch countries (${response.status})`;
           try {
               const errorBody = await response.json(); // Or .text()
               errorMsg += `: ${errorBody.message || JSON.stringify(errorBody)}`;
           } catch (e) { /* Ignore parsing error */ }
           throw new Error(errorMsg);
        }
        // Check content type before parsing as JSON
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
             throw new Error(`Expected JSON response but got ${contentType}`);
        }

        const countries = await response.json();
        this.countryMapping = countries.reduce((acc, country) => {
           if (country.cca2 && country.name?.common) { // Add checks for needed properties
              acc[country.cca2] = country.name.common;
           }
          return acc;
        }, {});
        console.log("AdvancedMode: Country mapping loaded:", this.countryMapping);
      } catch (error) {
        console.error('Error fetching country data:', error);
        // Handle error appropriately, maybe set a flag or default mapping
        this.countryMapping = {}; // Reset or set default on error
      }
    },

    updateCurrentTime() {
      // This method seems okay
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes.toString();
      this.currentTime = `${hours}:${formattedMinutes}`;
      const date = now.getDate();
      this.currentDate = date < 10 ? `0${date}` : date.toString();
      const daysOfWeek = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
      const dayIndex = now.getDay();
      this.currentDayOfWeek = daysOfWeek[dayIndex];
      const monthIndex = now.getMonth();
      const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
      this.currentMonth = months[monthIndex]; // Update month here as well
    },
    startUpdatingTime() {
      // This method seems okay
      this.updateCurrentTime();
      setInterval(() => {
        this.updateCurrentTime();
      }, 1000); // Update every second
    },
    getMonthName(index) {
      // This method seems okay
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      // Add safety check for index
      return months[index] || '';
    },

    // getWeatherIcon(iconCode) - Use the version taking iconCode
    getWeatherIcon(iconCode) {
      if (!iconCode) return ''; // Handle missing icon code
      const baseUrl = 'https://openweathermap.org/img/wn/';
      return `${baseUrl}${iconCode}@2x.png`; // Using 2x size
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
    // Regenerate nudges based on local component data
    generateWeatherNudges() {
        // Check if primary region weather data is loaded
        if (!this.weather?.main || !this.five_day_forecast?.list) {
            // console.log("AdvancedMode: Skipping nudge generation, primary data not ready.");
            return;
        }
        console.log('AdvancedMode: Generating weather nudges...');
        const newNudges = [];

        // Use local component data (this.weather, this.five_day_forecast)
        const currentWindSpeed = this.weather?.wind?.speed;
        const forecastPop = this.five_day_forecast?.list?.[0]?.pop;
        const currentTemp = this.weather?.main?.temp;
        const forecastTemp = this.five_day_forecast?.list?.[0]?.main?.temp;

        // Check wind conditions
        if (typeof currentWindSpeed === 'number' && currentWindSpeed > 5.4) { // Example threshold
            newNudges.push({
                id: 'wind-' + Date.now(), type: 'wind', title: 'Windy Conditions',
                // Assuming windSpeed method exists and works with local this.weather
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

        console.log('AdvancedMode: Generated nudges:', newNudges);
        this.nudges = newNudges;
        this.currentNudgeIndex = 0; // Reset index when nudges update
    },
  }
}

</script>

<template>
   <RouterLink :to="{ name: 'basicModeDashboard' }" id = 'backBtn'><font-awesome-icon icon="fa-solid fa-chevron-left" id = 'backIcon'/></RouterLink>
  <main class = 'dash-body2'>

    <div class = 'gridAM '>
    <div class="div0AM gridCellAM">
      <HeaderDashboard />
    </div>

    <section v-if="isWeatherLoaded" id='basicInfoToday' class="div1AM gridCellAM" >
      <div id = 'containerBasicWeatherInfo'>
        <img v-if="weather.weather && weather.weather[0]" :src="getWeatherIcon(weather.weather[0].icon)" id='todaysWeatherIconAdvacedMode' alt="Weather Icon">
        <div id = 'headerBasicWeatherInfo'>
           <h1 id = 'currentTemperatureHeader'>{{Math.round(weather.main.temp)}}°</h1>
          <h2 id = 'degreeTypeHeader'>C</h2>
          <div id = 'locationAdvancedMode'>
            <div class="locationAdvancedMode-row">
              <font-awesome-icon icon="location-dot" style="color: #303030;" id ='locationIconAdvancedMode' />
               <h2 id = 'locationCityAdvancedMode'>{{ weather.name }}</h2>
            </div>
             <p id='time'>{{ currentTime }}</p>
          </div>
        </div>
      </div>
      <div id = 'containerTodayCalendar'>
         <div id = 'month'>{{ currentMonth }}</div>
        <div id = 'dateAndDayAdvancedMode'>
           <h2 id = 'dateAdvancedMode'>{{ currentDate }}</h2>
          <h3 id = 'dayAdvancedMode'>{{ currentDayOfWeek }}</h3>
        </div>
      </div>
    </section>
    <section v-else class="div1AM gridCellAM loading-placeholder">
      <div class="loading-state">
        <p>Loading weather data...</p>
      </div>
    </section>

    <section id='citiesContainer' class="div2AM gridCellAM">
       <div v-if="!isWeatherLoaded" class="cities-state-wrapper">
        <div class="loading-state">
          <p>Loading cities data...</p>
        </div>
      </div>
      <template v-else-if="weatherCity.length > 0">
        <div v-for="(city, index) in weatherCity" :key="city.id || index" class='cityContainer'> <div class='cityContainerHeader'>
            <div class='cityName'>{{ city.name }}</div>
            <div class='countryName' v-if="city.sys && countryMapping[city.sys.country]">{{ countryMapping[city.sys.country] }}</div>
          </div>
          <img v-if="city.weather && city.weather[0]" class='cityWeatherIcon' :src="getWeatherIcon(city.weather[0].icon)" alt="Weather Icon">
          <div class='cityContainerTemperature'>
            <h2 class='currentTempCityContainer'>{{ Math.round(city.main.temp) }}° </h2>
            <h3 class='maxTempCityContainer'> / {{ Math.round(city.main.temp_max) }}°</h3>
          </div>
        </div>
      </template>
      <div v-else class="cities-state-wrapper empty-cities-state">
        <font-awesome-icon icon="city" class="empty-state-icon" />
        <h3>No Cities Added</h3>
        <p>Add more cities to track their weather conditions</p>
        <button class="add-city-btn">
          <font-awesome-icon icon="plus" /> Add City
        </button>
      </div>
    </section>

    <div class="div3AM gridCellAM" v-if="isWeatherLoaded">
       <section id='containerNimbusNudges'>
         <div id='headerNimbusNudges'>
           <h3 id='titleNimbusNudges'>Nimbus Nudges</h3>
           <div id='buttonsHeaderNimbusNudges'>
             <ArrowButton direction="left" button-class="personalization-arrow" @clickButton="handleUpClick" :disabled="nudges.length <= 1"/>
             <span class="nudge-counter">
               {{ nudges.filter(n => n.action === 'read').length }}/{{ nudges.length }} read
             </span>
             <ArrowButton direction="right" button-class="personalization-arrow" @clickButton="handleDownClick" :disabled="nudges.length <= 1"/>
           </div>
         </div>
         <div id='nimbusNudgesContent'>
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
               <button id="allClearBtn" @click="handleAllClear" :disabled="nudges.length === 0">
                 ALL CLEAR!
               </button>
               <button id="quietTheSkiesBtn" @click="handleQuietTheSkies" :disabled="nudges.length === 0 || nudges.every(n => n.action === 'read')">
                 QUIET THE SKIES
               </button>
             </div>
           </template>
         </div>
       </section>
    </div>
     <div v-else class="div3AM gridCellAM loading-placeholder"></div>


    <section id = 'temperatureGraphContainerAdvancedMode' class="div4AM gridCellAM">
      <img src = '../assets/img/graphAdvancedMode.svg' id ='imgGraphAdvancedMode'>
    </section>

    <section id = 'weatherInfoAdvancedModeContainer' class="div5AM gridCellAM" v-if="isWeatherLoaded">
      <div id = 'windContainerAdvancedMode'>
        <div class = 'headerContainers'>
          <h2 class = 'weatherInfoContainerHeader' id = 'windTitle' >Wind</h2>
          <img class = 'weatherInfoIllustrations' alt = 'Wind' src = '../assets/img/windIcon.svg'>
        </div>
         <h3 class = 'dataContainers'>{{ weather.wind.speed }} m/s</h3>
      </div>
      <div id = 'rainContainerAdvancedMode'>
        <div class = 'headerContainers'>
          <h2 class = 'weatherInfoContainerHeader' id = 'rainTitle'>Rain</h2>
          <img class = 'weatherInfoIllustrations' alt = 'Rain' src = '../assets/img/rainIcon.svg'>
        </div>
         <h3 class = 'dataContainers'> {{ five_day_forecast.list && five_day_forecast.list.length > 0 ? Math.round(five_day_forecast.list[0].pop * 100) : 'N/A' }} %</h3>
      </div>
      <div id = 'humidityContainerAdvancedMode'>
        <div class = 'headerContainers'>
          <h2 class = 'weatherInfoContainerHeader' id = 'humidityTitle'>Humidity</h2>
          <img class = 'weatherInfoIllustrations' alt = 'Humidity' src = '../assets/img/humidityIcon.svg'>
        </div>
         <h3 class = 'dataContainers'>{{ weather.main.humidity }} %</h3>
      </div>
      <div id = 'wavesContainerAdvancedMode'>
        <div class = 'headerContainers'>
          <h2 class = 'weatherInfoContainerHeader' id = 'wavesTitle'>Sea Level</h2> <img class = 'weatherInfoIllustrations' alt = 'Sea Level' src = '../assets/img/wavesIcon.png'> </div>
         <h3 class='dataContainers' v-if="weather.main && typeof weather.main.sea_level === 'number'">{{ weather.main.sea_level }} hPa</h3>
        <h3 class='dataContainers' v-else>N/A</h3>
      </div>
      <div id = 'visibilityContainerAdvancedMode'>
        <div class = 'headerContainers'>
          <h2 class = 'weatherInfoContainerHeader' id = 'visibilityTitle'>Visibility</h2>
          <img class = 'weatherInfoIllustrations' alt = 'Visibility' src = '../assets/img/visibilityIcon.png'>
        </div>
         <h3 class = 'dataContainers' v-if="typeof weather.visibility === 'number'">{{ weather.visibility / 1000 }} km</h3>
         <h3 class = 'dataContainers' v-else>N/A</h3>
      </div>
      <div id = 'pressureContainerAdvancedMode'>
        <div class = 'headerContainers'>
          <h2 class = 'weatherInfoContainerHeader' id ='pressureTitle'>Pressure</h2>
          <img class = 'weatherInfoIllustrations' alt = 'Pressure' src = '../assets/img/pressureIcon.svg'>
        </div>
         <h3 class = 'dataContainers'>{{weather.main.pressure}} hPa</h3>
      </div>
    </section>
     <div v-else class="div5AM gridCellAM loading-placeholder"></div>

    <section id = 'calendarAdvancedMode' class="div6AM gridCellAM" >
      <div class="calendarHeaderAdvancedMode">
        <span id="monthCalendar">{{ currentMonth }}</span>
        <span id="yearCalendar">{{ currentYear }}</span>
      </div>
      <div class="calendar-days">
        <div v-for="day in daysOfWeek" :key="'header-' + day" class="day-header">{{ day }}</div> <div v-for="blank in firstDayOfMonth" :key="'blank-' + blank" class="blank"></div>
        <div v-for="date in daysInMonth" :key="'date-' + date" :class="{ 'today': date === currentDay }" class="date">{{ date }}</div>
      </div>
    </section>
    </div>
  </main>
</template>

<style>
.v-main {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  min-height: 100vh;
  padding: 0;
  margin: 0;
}

.dash-body2 {
  min-height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  box-sizing: border-box;
  background-color: #EDDED4;
  margin: 0;
  transform: none;
}

.gridAM {
  display: grid;
  grid-template-columns: 1fr 3rem 11.25rem 18rem;
  grid-template-rows: 50px 300px 300.34px;
  grid-column-gap: 32px;
  grid-row-gap: 32px;
  max-width: 1260px;
  width: 100%;
  height: auto;
  min-height: 860px;
  margin: 0 auto;
}

.gridCellAM {
  background-color: #EDDED4;
  border: 1px solid #303030;
  border-radius: 20px;
/*   padding: 13px 13px; */
  position: relative;
  overflow: hidden;
  transition: transform 0.3s ease-in-out; 
  display: flex;
  justify-content: center;
}
.div0AM { grid-area: 1 / 1 / 2 / 5;
border-radius: 50px 50px 10px 10px ;}

.div1AM { /* grid-area: 2 / 1 / 3 / 2; */
  
  grid-column-start: 1;
  grid-column-end: 2;
  grid-row-start: 2;
  grid-row-end: 3;}

.div2AM { 
  grid-column-start: 2;
  grid-column-end: 4;
  grid-row-start: 2;
  grid-row-end: 3;}

.div3AM {

  grid-column-start: 4;
  grid-column-end: 5;
  grid-row-start: 2;
  grid-row-end: 3;}

.div4AM { 
  grid-column-start: 1;
  grid-column-end: 3;
  grid-row-start: 3;
  grid-row-end: 3;
}

.div5AM {
    grid-column-start: 3;
    grid-column-end: 3;
    grid-row-start: 3;
    grid-row-end: 4;
}
  .div5AM.gridCellAM { justify-content: flex-start;
   overflow: visible;
   border: 0;
}



.div6AM { /* grid-area: 3 / 4 / 4 / 4; */

  grid-column-start: 4;
  grid-column-end: 5;
  grid-row-start: 3;
  grid-row-end: 4;}

#backBtn{
  position: fixed;
  top: 2rem;
  left: 2rem;
  z-index: 1000;
  background-color: #EDDED4;
  width: 3.125rem;
  height: 3.125rem;
  border-radius: 100px;
  border: 0.1em solid #303030;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
}
#backIcon{
  font-size: 1.5em;
}
#containerTodayCalendar {
    width: 7.875rem;
    height: 9.625rem;
    flex-shrink: 0;
    border-radius: 1.25rem;
    border: 1px solid var(--Textual-Elements-Midnight-Onyx, #303030);
    background: #F2E6DD;
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow: hidden;
}
#containerBasicWeatherInfo {
    width: 60%;
    padding: 1rem;
    /* height: 10.0625rem; */
    flex-shrink: 0;
    border-radius: 1.25rem;
    border: 1px solid var(--Textual-Elements-Midnight-Onyx, #303030);
    background: var(--secondary-color-palette-20-saturation-sky-wash-20-sat, #DFEFFB);
    display: flex;
    justify-content: space-around;
    align-items: center;
}
/* #todaysWeatherIconAdvacedMode{
  width: 8rem;
  height: auto;
  z-index: 2;
} */
#locationIconAdvancedMode {
  transform: translateY(-4px);
}
#currentTemperatureHeader{
  color: #303030;
  font-family: Recoleta;
  font-size: 6rem;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  margin: 0;
}
#degreeTypeHeader{
  color: #303030;
  font-family: Recoleta;
  font-size:3rem;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  position:absolute;
  /* left:6em; */
  transform: translateY(4%);
  margin: 0;
}
#headerBasicWeatherInfo {
    z-index: 3;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: flex-end;
}
#locationAdvancedMode {
    /* height: 3em; */
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
}
.locationAdvancedMode-row {
  display: flex;
  align-items: flex-end;
}


#locationAdvancedMode p {
  margin-top: 0;
  margin-bottom: 0;
  transform: translateY(1px);
}

#locationAdvancedMode h2 {
  margin-left: 0.3rem;
  margin-bottom: 0;
  margin-top: 0;
}
#locationCityAdvancedMode, #locationIconAdvancedMode{
  align-items: center;
  color: #303030;
  font-family: Asap;
  font-size: 1.25rem;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
}
#locationCity{
  margin-right: 2em;
}
#time{
  color: #303030;
  font-family: Recoleta;
  font-size: 1.25rem;
  font-style: normal;
  font-weight: 300;
  line-height: normal;
  margin-left:0.5em;
}
#containerTodayCalendar{
  width: 7.875rem;
  height: 9.625rem;
  flex-shrink: 0;
  border-radius: 1.25rem;
  border: 1px solid var(--Textual-Elements-Midnight-Onyx, #303030);
  background: #F2E6DD;
/*   position: absolute;
  top:2.37em;
  right:2.19em; */
  display: flex;
  flex-direction: column;
  align-items: center;
}
#month {
    width: 7.875rem;
    height: 2.75rem;
    flex-shrink: 0;
    border-radius: 1.0rem 1.0rem 0rem 0rem;
    /* border: 1px solid #000; */
    background: #E74727;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #303030;
    font-family: Asap;
    font-size: 1.25rem;
    font-style: normal;
    font-weight: 800;
    line-height: normal;
}
#dateAndDayAdvancedMode{
  width: 7.875em;
  height: 7em;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0;
  z-index: 1;
}
#dateAdvancedMode{
  color: #303030;
  font-family: Recoleta;
  font-size: 3.75rem;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  margin: 0;
}
#dayAdvancedMode{
  color: #303030;
  font-family: Asap;
  font-size: 1.25rem;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  margin: 0;  
}
#basicInfoToday{
/*   width: 35.4375rem;
  height: 14.312rem;
  flex-shrink: 0; */
  border-radius: 1.25rem;
  border: 1px solid var(--Textual-Elements-Midnight-Onyx, #303030);
  background: var(--Primary-Color-Palette-Sunbeam-Gold, #FAC54B);
  display: flex;
  align-items: center;
  justify-content: space-around;
  /*
  position: absolute;
  left: 8.44em;
  top:7em;
  */
}
#citiesContainer {
  background: var(--secondary-color-palette-20-saturation-orchid-flush-20-sat, #E15CC9);
  display: flex; /* Using Flexbox */
  align-items: center; /* Vertically centers items */
  justify-content: center; /* Horizontally centers items */
  flex-wrap: wrap; /* Allows wrapping */
/*   padding: 1rem; */
  gap: 1rem;
  position: relative;
}
cityContainer 
.cities-state-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(242, 230, 221, 0.9);
  border-radius: 1.25rem;
  padding: 1rem;
}

.empty-cities-state {
  text-align: center;
}

.empty-cities-state h3 {
  font-family: Asap;
  font-size: 1.25rem;
  font-weight: 700;
  margin: 1rem 0 0.5rem;
  color: #303030;
}

.empty-cities-state p {
  font-family: Asap;
  font-size: 0.875rem;
  color: #858585;
  margin: 0 0 1.5rem;
}

.empty-state-icon {
  font-size: 2rem;
  color: #858585;
  opacity: 0.6;
}

.add-city-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: #E18AD1;
  color: #303030;
  border: 1px solid #303030;
  border-radius: 1.25rem;
  font-family: Asap;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.add-city-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.loading-state {
  color: #303030;
  font-family: Asap;
  font-size: 1rem;
}

.cityContainer {
/*     width: 7rem;
    height: 7rem; */
    /* flex-shrink: 0; */
    border-radius: 1.25rem;
    border: 1px solid var(--Textual-Elements-Midnight-Onyx, #303030);
    background: #F2E6DD;
    width: 5rem;
    display: flex;
    align-items: center;
    flex-direction: column;
    padding: 0.8rem;
}
.cityContainerHeader{
  width: 100%;
 /*  margin-top: 0.5em; */
  justify-self: flex-start;
  height: 1.55625rem;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  z-index: 5;
}

#headerNimbusNudges{
  padding-top: 0;
}
.cityName {
  color: #E65E2A;
  font-family: Asap;
  font-size: 0.875rem;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  white-space: nowrap;       
  overflow: hidden;          
  text-overflow: ellipsis;   
  width: 100%;              
  text-align: center;     
}

.countryName{
  color: #303030;
  font-family: Asap;
  font-size: 0.625rem;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
}
.cityWeatherIcon{
  max-width: 4em;
  height: auto;
  z-index: 2;
}
.cityContainerTemperature{
  display: flex;
  flex-direction: row ;
  align-items: center;
  height: 1em;
}
.currentTempCityContainer{
  color: #303030;
text-align: right;
font-family: Asap;
font-size: 1.5625rem;
font-style: normal;
font-weight: 700;
line-height: normal;
margin-right: 0.3rem;
}

.maxTempCityContainer{
  color: #303030;
text-align: right;
font-family: Asap;
font-size: 0.9rem;
font-style: normal;
font-weight: 400;
line-height: normal;
margin: 0;
margin-left: -0.5em;
margin-bottom: -0.5em;
}
#temperatureGraphContainerAdvancedMode{
/*   width: 34.125rem;
  height: 17.9375rem; */
 /*  flex-shrink: 0; */
  border-radius: 1.25rem;
  border: 1px solid var(--Textual-Elements-Midnight-Onyx, #303030);
  background: #F2E6DD;
  /*
  position: absolute;
  left: 8.44em;
  top:23.62em;
  */
  display: flex;
  justify-content: center;
  align-items: center;
}

#imgGraphAdvancedMode{
  margin-right: 1em;
}

#weatherInfoAdvancedModeContainer{
  display: flex;
/*   width: 11.25rem;
  height: 19.6875rem;
  flex-shrink: 0; */
  /*
  position: absolute;
  left: 45.75em;
  top:23.62em;
  */
  flex-direction: column;
}


/* #weatherInfoAdvancedModeContainer > div:not(#pressureContainerAdvancedMode):hover {
  transform: translateY(-1.5em); 
  transition: transform 0.3s ease-in-out;
} */

#windContainerAdvancedMode:hover {
  transform: translateY(-1.5em);
}

#rainContainerAdvancedMode:hover {
  transform: translateY(-4em); /* Different translate value */
}

#humidityContainerAdvancedMode:hover {
  transform: translateY(-6.6em); /* Different translate value */
}

#wavesContainerAdvancedMode:hover {
  transform: translateY(-9.2em); /* Different translate value */
}

#visibilityContainerAdvancedMode:hover {
  transform: translateY(-11.6em); /* Different translate value */
}

/* Apply the transition to all divs */
#weatherInfoAdvancedModeContainer > div {
  transition: transform 0.3s ease-in-out;
}


#weatherInfoAdvancedModeContainer #pressureContainerAdvancedMode {
  border-radius: 1.25rem;
}


#windContainerAdvancedMode, #rainContainerAdvancedMode, #humidityContainerAdvancedMode,#wavesContainerAdvancedMode, #visibilityContainerAdvancedMode, #pressureContainerAdvancedMode{
  width: 11.25rem;
  height: fit-content;
  padding-bottom: 1rem;
  flex-shrink: 0;
  border-radius: 1.25rem 1.25rem 0rem 0rem;
  border: 1px solid var(--Textual-Elements-Midnight-Onyx, #303030);
  display: flex;
  align-items: flex-start;
  flex-direction: column;
}
#windContainerAdvancedMode{
  background: #C8BDFF;
/*   position: absolute;
  top:1.5em; */
}
#rainContainerAdvancedMode{
  background: #43AA8B;
  transform: translateY(-40px);
/*   position: absolute;
  top:4em; */
}
#humidityContainerAdvancedMode{
  background: #FFEA8A;
  transform: translateY(-80px);
/*   position: absolute;
  top:6.5em; */
}
#wavesContainerAdvancedMode{
  background: #F4F4F4;
  transform: translateY(-120px);
/*   position: absolute;
  top:9em; */
}
#visibilityContainerAdvancedMode{
  background: #FFA646;
  transform: translateY(-160px);
/*   position: absolute;
  top:11.5em; */
}

#pressureContainerAdvancedMode{
  background: #FFBEED;
  transform: translateY(-200px);
/*   position: absolute;
  top:14em;
  height: 8rem; */
}

.headerContainers{
  display: flex;
  width: 80%;
  justify-content: space-between;
  height: 2em;
  align-items: center;
  padding-left: 1.13em;
  padding-right: 0.81em;
  color: #303030;
  font-family: Asap;
  font-size: 1rem;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  padding-top: 0.40em;
  flex-direction: row;
}
#pressureTitle{
  color: #B21C29;
}
#windTitle{
  color: #685E9A;
}
#rainTitle{
  color: #185850;
}
#humidityTitle{
  color: #826022;
}
#wavesTitle{
  color: #303030;
  font-size: 1.4rem;
}
#visibilityTitle{
  color: #9B4F19;
}

.dataContainers{
  width: auto;
  height: auto;
  flex-shrink: 0;
    color: #484848;
  font-family: Asap;
  font-size: 1.25rem;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  display: flex;
  justify-content: center;
  margin: 0;
  margin-top: 0.2em;
  margin-left: 1.13em;
}

#calendarAdvancedMode{

  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 1.25rem;
  border: 1px solid var(--Textual-Elements-Midnight-Onyx, #303030);
  background: var(--secondary-color-palette-30-saturation-spring-bud-30-sat, #E1E2CB);
}

.calendarHeaderAdvancedMode {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: #303030;
    font-family: Asap;
    font-size: 1rem;
    font-style: normal;
    font-weight: 800;
    line-height: normal;
    margin: 0;
    /* width: 5em; */
    margin-top: 1em;
    margin-left: 1.3rem;
    /* padding-left: 2em; */
    display: flex;

    align-items: flex-start;
    justify-content: flex-start;
}

.calendarHeaderAdvancedMode #monthCalendar {
  margin-right: 1rem;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  align-self: center;
  gap: 0.3rem;
  color: #000;
  font-family: Asap;
  font-size: 0.9rem;
  font-style: normal;
  font-weight: 250;
  line-height: normal;
  margin: 0;
  margin-top: 1.3rem;
  margin-bottom: 1.3rem;
  padding-left: 1rem;
    padding-right: 1rem;
}

.day,
.blank,
.date {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.blank {
  visibility: hidden;
}

.today {
  background-color: #E18AD1; /* Pink background */
  border: 1px solid #303030; /* Solid border */
  color: #303030; /* Text color for better contrast */
  width: 2.0625rem;
  height: 2.0625rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #303030;
  font-family: Asap;
  font-size: 1.25rem;
}

.empty-cities-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  color: #303030;
}

.empty-cities-state h3 {
  font-family: Asap;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 1rem 0 0.5rem;
}

.empty-cities-state p {
  font-family: Asap;
  font-size: 1rem;
  color: #858585;
  margin: 0 0 1.5rem;
}

.empty-state-icon {
  width: 64px;
  height: 64px;
  opacity: 0.6;
}

.add-city-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: #E18AD1;
  color: #303030;
  border: 1px solid #303030;
  border-radius: 1.25rem;
  font-family: Asap;
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease-in-out;
}

.add-city-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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

.nudge-read {
  opacity: 0.7;
  background: rgba(255, 255, 255, 0.2);
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

</style>