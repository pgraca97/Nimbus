<script setup>
import { computed, watch, onMounted } from 'vue';
import { RouterLink, RouterView, useRoute } from 'vue-router';
import Header from '@/components/Header.vue';
import { useUserStore } from '@/stores/user';
import { useWeatherStore } from '@/stores/weather';

// --- Store Instances ---
const userStore = useUserStore();
const weatherStore = useWeatherStore();
const route = useRoute(); // Get access to the current route object

// --- Computed Property for Header Visibility ---
const showHeader = computed(() => {
  const headerRoutes = ['landingPage', 'login', 'signUp', 'legalResources', 'additionalInformation'];
  return route.name ? headerRoutes.includes(route.name) : false;
});

// --- Weather Fetching Logic ---

// Function to trigger the initial weather fetch for the user's region AND locations
const triggerInitialFetch = async () => {
  // Only proceed if the user is authenticated
  if (userStore.isUserAuthenticated) {
    console.log('App.vue: User authenticated, checking for region and locations...');

    // --- Fetch Region Weather ---
    const userRegion = userStore.authenticatedUser?.userRegion;
    if (userRegion && typeof userRegion.latitude === 'number' && typeof userRegion.longitude === 'number') {
      if (!weatherStore.isLoadingRegion && !weatherStore.regionWeatherData) {
         console.log('App.vue: Fetching initial region weather data for:', userRegion.region);
         try {
            // Dispatch the action - no need to await unless needed for sequential logic
            weatherStore.fetchRegionWeather(userRegion);
            console.log('App.vue: fetchRegionWeather action dispatched.');
         } catch (error) {
            console.error('App.vue: Failed to dispatch fetchRegionWeather:', error);
         }
      } else {
         console.log('App.vue: Region weather fetch already in progress or data exists in store.');
      }
    } else {
      console.warn('App.vue: User authenticated but region data is missing or invalid in userStore.');
    }

    // --- Fetch Favorite Locations Weather ---
    const userLocations = userStore.authenticatedUser?.userLocations;
    // Check if it's an array and has items
    if (Array.isArray(userLocations) && userLocations.length > 0) {
        // Check if locations aren't already loading and data isn't already present (optional check)
        if (!weatherStore.isLoadingLocations /* && Object.keys(weatherStore.weatherData).length === 0 */) { // Check loading flag
             console.log('App.vue: Fetching weather for favorite locations:', userLocations);
             try {
                 // *** ADD THIS CALL ***
                 weatherStore.fetchWeatherForAllLocations(userLocations);
                 console.log('App.vue: fetchWeatherForAllLocations action dispatched.');
             } catch (error) {
                  console.error('App.vue: Failed to dispatch fetchWeatherForAllLocations:', error);
             }
        } else {
             console.log('App.vue: Favorite locations fetch already in progress or data might exist.');
        }
    } else {
         console.log('App.vue: No favorite locations found in userStore to fetch weather for.');
         // Ensure the store state is empty if the user has no locations
         weatherStore.weatherData = {};
    }

  } else {
     console.log('App.vue: User not authenticated, skipping initial weather fetch.');
  }
};

// Watch for changes in the user's authentication status
watch(() => userStore.isUserAuthenticated, (isAuthenticated, wasAuthenticated) => {
  console.log(`App.vue: Authentication status changed: ${wasAuthenticated} -> ${isAuthenticated}`);
  // Trigger fetch when user logs IN
  if (isAuthenticated) {
    triggerInitialFetch();
  } else {
    // Optional: Clear weather data when user logs OUT
    console.log('App.vue: User logged out, clearing weather store data.');
    weatherStore.regionWeatherData = null;
    weatherStore.weatherData = {}; // Clear favorite locations too
    weatherStore.errorRegion = null;
    weatherStore.errorLocations = null;
    // Reset loading flags as well
    weatherStore.isLoadingRegion = false;
    weatherStore.isLoadingLocations = false;
  }
});

// Run the check when the App component is first mounted
onMounted(() => {
    console.log('App.vue: Component mounted, running initial fetch check.');
    triggerInitialFetch();
});

</script>

<template>
  <div id="app">
    <Header v-if="showHeader" />
    <main>
      <RouterView />
    </main>
  </div>
</template>

<style>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
}
</style>
