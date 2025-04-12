import { defineStore } from 'pinia';
// Assuming weatherService functions correctly fetch data based on coordinates
import { fetchWeatherDataByCoordinates, fetchFiveDayForecastByCoordinates, fetchAirQualityByCoordinates } from '@/weatherService';

export const useWeatherStore = defineStore("weather", {
  state: () => ({
    // REMOVED userWeather state - This should live in useUserStore
    // userWeather: {
    //   region: null,
    //   locations: [],
    // },

    // State to hold fetched weather data for multiple favorite locations
    // Keyed by a unique identifier (e.g., place_id or lat,lng string)
    // Example: { 'place_id_1': { locationInfo, currentWeather, ... }, 'place_id_2': { ... } }
    weatherData: {},
    // State specifically for the user's primary region weather
    regionWeatherData: null, // Initialize as null or empty object { currentWeather: {}, fiveDayForecast: {}, airQuality: {} } ?
    // Add loading/error states for better UI feedback
    isLoadingRegion: false,
    isLoadingLocations: false,
    errorRegion: null,
    errorLocations: null,
  }),
  actions: {
    // REMOVED updateUserWeather - No longer needed here

    /**
     * Fetches weather for the primary user region.
     * @param {object} region - The userRegion object ({ region: 'Name', latitude, longitude, place_id? }) from useUserStore.
     */
    async fetchRegionWeather(region) { // Accept region as argument
        // Validate the input argument
        if (!region || typeof region.latitude !== 'number' || typeof region.longitude !== 'number') {
            console.error('fetchRegionWeather action requires a valid region object with latitude and longitude.');
            this.errorRegion = 'Invalid region data provided.';
            this.regionWeatherData = null; // Reset data
            this.isLoadingRegion = false;
            return; // Stop execution
        }
        console.log(`ACTION: Fetching weather for region: ${region.region || 'Unknown'} (${region.latitude}, ${region.longitude})`);
        this.isLoadingRegion = true;
        this.errorRegion = null; // Clear previous errors

        try {
            const { latitude, longitude } = region;
            // Fetch all data concurrently using Promise.all
            const [currentWeather, fiveDayForecast, airQuality] = await Promise.all([
                fetchWeatherDataByCoordinates(latitude, longitude),
                fetchFiveDayForecastByCoordinates(latitude, longitude),
                fetchAirQualityByCoordinates(latitude, longitude)
            ]);

            // Update regionWeatherData state with fetched data
            this.regionWeatherData = {
                 // Include region info for context if needed later
                 regionInfo: { name: region.region, lat: latitude, lon: longitude, place_id: region.place_id },
                 currentWeather,
                 fiveDayForecast,
                 airQuality
            };
            console.log("Region weather data updated in store:", this.regionWeatherData);

        } catch (error) {
             console.error(`Error fetching region weather for ${region.region || 'coordinates'}:`, error);
             this.regionWeatherData = null; // Reset data on failure
             this.errorRegion = `Failed to fetch weather for ${region.region || 'your region'}. ${error.message || ''}`;
             // Optionally re-throw or handle error appropriately
             // throw error;
        } finally {
            this.isLoadingRegion = false; // Ensure loading state is turned off
        }
    },

    /**
     * Fetches weather for all favorite locations.
     * @param {Array<object>} locations - The userLocations array ([{ description, lat, lng, place_id?, ... }]) from useUserStore.
     */
    async fetchWeatherForAllLocations(locations) { // Accept locations array as argument
        if (!Array.isArray(locations) || locations.length === 0) {
            console.log('No favorite locations provided to fetch weather for.');
            this.weatherData = {}; // Clear existing data
            this.isLoadingLocations = false;
            this.errorLocations = null;
            return;
        }
        console.log("ACTION: Fetching weather for favorite locations:", locations);
        this.isLoadingLocations = true;
        this.errorLocations = null;

        try {
            const newWeatherData = {};
            // Create an array of promises, one for each location
            const weatherPromises = locations.map(async (location) => {
                // Ensure location has valid lat/lng
                if (typeof location.lat !== 'number' || typeof location.lng !== 'number') {
                     console.warn(`Skipping location due to missing/invalid coordinates:`, location);
                     return; // Skip this iteration using return inside map's async callback
                }

                const { lat, lng } = location;
                // Use place_id if available, otherwise fallback to lat,lng string for unique key
                const locationId = location.place_id || `${lat},${lng}`;

                try {
                     // Fetch data for this specific location
                     const [currentWeather, fiveDayForecast, airQuality] = await Promise.all([
                         fetchWeatherDataByCoordinates(lat, lng),
                         fetchFiveDayForecastByCoordinates(lat, lng),
                         fetchAirQualityByCoordinates(lat, lng)
                     ]);
                     // Store fetched data under the location's unique ID
                     newWeatherData[locationId] = {
                         locationInfo: location, // Store original location info
                         currentWeather,
                         fiveDayForecast,
                         airQuality,
                         error: null // Mark as success
                        };
                } catch (locationError) {
                     console.error(`Error fetching weather for location ${location.description || locationId}:`, locationError);
                     // Store an error state for this specific location
                     newWeatherData[locationId] = {
                         locationInfo: location,
                         error: true,
                         errorMessage: locationError.message || 'Failed to fetch data'
                        };
                }
            });

            // Wait for all location fetches to complete
            await Promise.all(weatherPromises);

            // Update the main weatherData state object
            this.weatherData = newWeatherData;
            console.log("Favorite locations weather data updated in store:", this.weatherData);

        } catch (error) {
             // This catch block might not be reached if errors are handled per-location above,
             // but good for general setup errors.
             console.error(`General error during fetchWeatherForAllLocations:`, error);
             this.errorLocations = `Failed to fetch weather for all locations. ${error.message || ''}`;
             this.weatherData = {}; // Clear data on general error
        } finally {
             this.isLoadingLocations = false; // Ensure loading state is turned off
        }
    },
  },
  // persist: true, // Consider if persisting ALL fetched weather data is desired.
  // It might be better to only persist user preferences (in user store)
  // and fetch weather data fresh when the app loads or based on user actions.
  // If you keep persist: true here, it will save regionWeatherData and weatherData.
});
