// Retrieve API keys from environment variables
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// --- Google Maps API Functions ---

// Promise to track Google Maps API loading status
let googleMapsApiPromise = null;

// Variable to hold the session token for Autocomplete
let autocompleteSessionToken = null;

/**
 * Loads the Google Maps JavaScript API using the modern async bootstrap method.
 * Returns a promise that resolves when the API's importLibrary function is ready.
 * @returns {Promise<void>}
 */
export function loadGoogleMapsAPI() {
    // If already loading or loaded, return the existing promise
    if (googleMapsApiPromise) {
        return googleMapsApiPromise;
    }

    googleMapsApiPromise = new Promise((resolve, reject) => {
        // Check if the core API with importLibrary is already available
        if (window.google && window.google.maps && typeof window.google.maps.importLibrary === 'function') {
            console.log('Google Maps API (with importLibrary) is already loaded.');
            resolve();
            return;
        }

        delete window.initMap; // Clean up any old callback

        const existingScript = document.querySelector(`script[src*="maps.googleapis.com/maps/api/js"]`);
        if (existingScript) {
            console.warn('Google Maps API script tag already exists. Waiting for it to initialize...');
            const checkInterval = setInterval(() => {
                if (window.google && window.google.maps && typeof window.google.maps.importLibrary === 'function') {
                    clearInterval(checkInterval);
                    console.log('Google Maps API ready after finding existing script.');
                    resolve();
                }
            }, 100);
             setTimeout(() => {
                 clearInterval(checkInterval);
                 if (!(window.google && window.google.maps && typeof window.google.maps.importLibrary === 'function')) {
                    console.error('Timeout waiting for existing Google Maps script to initialize.');
                     reject(new Error('Timeout waiting for existing Google Maps script.'));
                 }
             }, 10000);
            return;
        }

        console.log('Loading Google Maps API script via new bootstrap...');
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&loading=async&v=beta`;
        script.async = true;
        script.defer = true;
        script.onerror = (error) => {
            console.error('Failed to load Google Maps API script tag.', error);
            reject(new Error('Failed to load Google Maps API script tag.'));
        };

        let loadCheckInterval;
        loadCheckInterval = setInterval(() => {
             if (window.google && window.google.maps && typeof window.google.maps.importLibrary === 'function') {
                 clearInterval(loadCheckInterval);
                 console.log('Google Maps API ready (detected importLibrary).');
                 resolve();
             }
        }, 100);

         setTimeout(() => {
             clearInterval(loadCheckInterval);
             if (!(window.google && window.google.maps && typeof window.google.maps.importLibrary === 'function')) {
                 console.error('Timeout waiting for Google Maps API to initialize after adding script.');
                 reject(new Error('Timeout waiting for Google Maps API.'));
             }
         }, 15000);

        document.head.appendChild(script);
    });

    return googleMapsApiPromise;
}


/**
 * Fetches place autocomplete suggestions using AutocompleteService
 * (Reverted to this method as fetchAutocompleteSuggestions was unavailable).
 * @param {string} input - The user's input string.
 * @returns {Promise<Array<object>>} A promise resolving to an array of formatted prediction objects.
 */
export const getAutocompletePredictions = async (input) => {
    if (!input || input.trim() === '') {
        return Promise.resolve([]);
    }

    try {
        // Ensure the core API is loaded
        await loadGoogleMapsAPI();

        // Import the places library
        const placesLib = await google.maps.importLibrary("places");
        const AutocompleteSessionToken = placesLib.AutocompleteSessionToken;
        const AutocompleteService = placesLib.AutocompleteService; // Get service from library
        const PlacesServiceStatus = placesLib.PlacesServiceStatus || google.maps.places.PlacesServiceStatus || {}; // Get status enum safely

        // Check if AutocompleteService is available (it should be based on console log)
        if (typeof AutocompleteService !== 'function') {
             console.error('AutocompleteService class is not available in the imported places library.', placesLib);
             throw new Error('AutocompleteService class is not available.');
        }

        // --- Session Token Management ---
        // Create a token ONLY if a session isn't already active
        if (!autocompleteSessionToken) {
            console.log("Creating new Autocomplete Session Token for predictions");
            autocompleteSessionToken = new AutocompleteSessionToken();
        } else {
            console.log("Reusing existing Autocomplete Session Token for predictions");
        }
        // -----------------------------

        // Instantiate the service
        const autocompleteServiceInstance = new AutocompleteService();

        const request = {
            input: input,
            sessionToken: autocompleteSessionToken, // Pass the token
            types: ['(cities)'],
        };

        // Use getPlacePredictions (requires a Promise wrapper for async/await)
        return new Promise((resolve, reject) => {
            autocompleteServiceInstance.getPlacePredictions(request, (predictions, status) => {
                if (status === (PlacesServiceStatus.OK || 'OK') && predictions) {
                    // Format predictions
                    const formattedPredictions = predictions.map(p => ({
                        description: p.description,
                        place_id: p.place_id, // Use place_id from prediction
                        structured_formatting: {
                            main_text: p.structured_formatting.main_text,
                            secondary_text: p.structured_formatting.secondary_text
                        }
                    }));
                    resolve(formattedPredictions);
                } else if (status === (PlacesServiceStatus.ZERO_RESULTS || 'ZERO_RESULTS')) {
                    resolve([]); // No results found
                } else {
                    console.error('AutocompleteService.getPlacePredictions failed:', status);
                    // Consider clearing token only on specific errors? For now, don't clear here.
                    reject(`Error fetching predictions via AutocompleteService: ${status}`);
                }
            });
        });

    } catch (error) {
        console.error('Error setting up autocomplete:', error);
        // Clear token if setup fails completely
        autocompleteSessionToken = null;
        return Promise.reject(`Error setting up predictions: ${error.message || error}`);
    }
};

/**
 * Fetches detailed information for a place using its Place ID.
 * Uses the newer Place class and fetchFields method.
 * @param {string} placeId - The Place ID of the location.
 * @param {Array<string>} [fields=['location', 'displayName', 'formattedAddress']] - Array of fields to fetch (using NEW Place class field names).
 * @returns {Promise<object>} A promise resolving to the Place object with fetched details.
 */
export const fetchPlaceDetails = async (placeId, fields = ['location', 'displayName', 'formattedAddress']) => {
    // Store the token that *this specific call* intends to use
    const currentToken = autocompleteSessionToken;
    if (!placeId || typeof placeId !== 'string') {
        console.error("Invalid placeId provided to fetchPlaceDetails:", placeId);
        return Promise.reject('Valid Place ID string is required for fetchPlaceDetails');
    }

    try {
        // Ensure the core API is loaded
        await loadGoogleMapsAPI();

        // Import the 'places' library - we need the Place class here
        const { Place } = await google.maps.importLibrary("places");

        // --- Session Token Management ---
        if (!currentToken) {
            console.warn("Autocomplete session token missing for fetchPlaceDetails. Billing might be affected.");
        } else {
            console.log("Using session token for fetchPlaceDetails:", currentToken);
        }
        // -----------------------------

        // Instantiate Place with ONLY the ID
        const place = new Place({ id: placeId });

        // Prepare request for fetchFields with CORRECTED field names
        const fetchFieldsRequest = {
            fields: fields, // Use the corrected field names
            // Conditionally add token if it existed when the function was called
            ...(currentToken && { sessionToken: currentToken })
        };
        console.log("Requesting fields:", fields); // Log requested fields

        // Fetch the specified fields using the instance
        await place.fetchFields(fetchFieldsRequest);

        console.log("Fetched Place Details:", place); // Log the result
        // The 'place' object now contains the fetched details like place.location, place.displayName etc.
        return place;

    } catch (error) {
        console.error('Error during place.fetchFields:', error);
        // Re-throw the error after logging
        throw new Error(`Error fetching place details: ${error.message || error}`);
    } finally {
        // --- Session Token Management ---
        // Clear the global token ONLY IF it's the same one this function call was using.
        // This prevents a slow fetch from clearing a token needed by a faster subsequent prediction request.
        if (currentToken && autocompleteSessionToken === currentToken) {
             console.log("Discarding Autocomplete Session Token after fetchPlaceDetails attempt:", currentToken);
             autocompleteSessionToken = null;
        } else if (currentToken) {
             console.log("Autocomplete Session Token changed since fetchPlaceDetails started, not clearing.");
        }
        // -----------------------------
    }
};


/**
 * Performs reverse geocoding using Google's Geocoder.
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<string>} A promise resolving to the formatted address string.
 */
export const reverseGeocodeGoogle = async (latitude, longitude) => {
     try {
        // Ensure the core API is loaded
        await loadGoogleMapsAPI();

        // Import the 'geocoding' library
        const geocodingLib = await google.maps.importLibrary("geocoding");
        const Geocoder = geocodingLib.Geocoder;

        if (!Geocoder) {
             throw new Error('Google Maps Geocoder class not available after importing library.');
        }

        // Proceed with geocoding
        return new Promise((resolve, reject) => {
            const geocoder = new Geocoder();
            const latlng = { lat: parseFloat(latitude), lng: parseFloat(longitude) };

            geocoder.geocode({ location: latlng }, (results, status) => {
                console.log("Google Geocoder Results:", results);
                console.log("Google Geocoder Status:", status);
                const GeocoderStatus = geocodingLib.GeocoderStatus || google.maps.GeocoderStatus || {};
                if (status === (GeocoderStatus.OK || 'OK')) {
                    if (results && results[0]) {
                        resolve(results[0].formatted_address);
                    } else {
                        reject('No results found by Google Geocoder');
                    }
                } else {
                    reject(`Google Geocoder failed due to: ${status}`);
                }
            });
        });
     } catch(error) {
         console.error('Error during Google reverse geocoding setup:', error);
         return Promise.reject(`Google reverse geocoding failed: ${error.message || error}`);
     }
};


// --- OpenWeatherMap API Functions ---
// (Remain unchanged)

export const reverseGeocodeOpenWeather = async (latitude, longitude, limit = 1) => {
    if (!API_KEY) return Promise.reject("OpenWeather API Key is missing.");
    const apiUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=${limit}&appid=${API_KEY}`;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`Network response was not ok (${response.status})`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error in OpenWeather reverse geocoding:', error);
        throw error;
    }
};

export const fetchWeatherDataByCoordinates = async (latitude, longitude) => {
    if (!API_KEY) return Promise.reject("OpenWeather API Key is missing.");
    try {
        const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`);
        if (!weatherResponse.ok) {
            throw new Error(`Could not fetch weather data (${weatherResponse.status})`);
        }
        const data = await weatherResponse.json();
        return data;
    } catch (error) {
        console.error("Error fetching weather data by coords:", error);
        throw error;
    }
};

export const fetchFiveDayForecastByCoordinates = async (latitude, longitude) => {
    if (!API_KEY) return Promise.reject("OpenWeather API Key is missing.");
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`);
        if (!response.ok) {
            throw new Error(`Error fetching 5-day weather forecast (${response.status})`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching 5-day forecast by coords:", error);
        throw error;
    }
};

export const fetchAirQualityByCoordinates = async (latitude, longitude) => {
    if (!API_KEY) return Promise.reject("OpenWeather API Key is missing.");
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`);
        if (!response.ok) {
            throw new Error(`Error fetching air pollution data (${response.status})`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching air quality by coords:", error);
        throw error;
    }
};

export const fetchDataByCityName = async (cityName) => {
    if (!API_KEY) return Promise.reject("OpenWeather API Key is missing.");
    if (!cityName) return Promise.reject("City name is required.");
    try {
        const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&units=metric&appid=${API_KEY}`);
        if (!weatherResponse.ok) {
             if (weatherResponse.status === 404) {
                 throw new Error(`Could not find the city: "${cityName}"`);
             } else {
                 throw new Error(`Could not fetch weather data for city (${weatherResponse.status})`);
             }
        }
        const data = await weatherResponse.json();
        return data;
    } catch (error) {
        console.error("Error fetching weather data by city:", error);
        throw error;
    }
};

export const fetchFiveDayForecast = async (cityName) => {
    if (!API_KEY) return Promise.reject("OpenWeather API Key is missing.");
    try {
        const weatherData = await fetchDataByCityName(cityName);
        const { lat, lon } = weatherData.coord;
        const forecastData = await fetchFiveDayForecastByCoordinates(lat, lon);
        console.log('5 day forecast data for', cityName, forecastData);
        return forecastData;
    } catch (error) {
        console.error("Error fetching 5-day forecast for city:", error);
        throw error;
    }
};

export const fetchAirQuality = async (cityName) => {
     if (!API_KEY) return Promise.reject("OpenWeather API Key is missing.");
    try {
        const weatherData = await fetchDataByCityName(cityName);
        const { lat, lon } = weatherData.coord;
        const airQualityData = await fetchAirQualityByCoordinates(lat, lon);
        console.log('Air quality data for', cityName, airQualityData);
        return airQualityData;
    } catch (error) {
        console.error("Error fetching air quality for city:", error);
        throw error;
    }
};
