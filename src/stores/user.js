import { defineStore } from "pinia";
// Removed weather store import from here, actions shouldn't call each other directly like that typically.
// Components should coordinate actions based on state changes.
// import { useWeatherStore } from "@/stores/weather";

export const useUserStore = defineStore("user", {
    state: () => ({
        // Tracks if a user is authenticated
        isUserAuthenticated: false,
        // Stores the *currently* authenticated user's data object
        user: null,
        // Array of all user objects (replace with actual backend/API later)
        users: [
            { username: "maria", password: "54321", email: "maria@example.com", nimbusCoins: 50, userRegion: null, userLocations: [] }, // Example structure
            { username: "john", password: "12345", email: "john@example.com", nimbusCoins: 50, userRegion: null, userLocations: [] },
        ],
    }),
    getters: {
        // Getter to access the current user's data object
        // Renamed getUser to authenticatedUser for clarity, matching existing use
        authenticatedUser: (state) => state.user,
        // Getter to check if a user is authenticated
        isUser: (state) => state.isUserAuthenticated,
        // getUser: (state) => state.user, // Keep if used elsewhere, but authenticatedUser is clearer
    },
    actions: {
        // Action to authenticate a user
        login(identifier, password) {
            // Find the user by username or email
            const foundUser = this.users.find(
                (u) => (u.username === identifier || u.email === identifier) && u.password === password
            );
            if (foundUser) {
                this.isUserAuthenticated = true;
                // *** Set this.user to the full user object found ***
                // This ensures persisted preferences (like userRegion) are loaded on login
                this.user = { ...foundUser };
                console.log("User logged in:", this.user);

                // *** REMOVED weather store call from login ***
                // The component that navigates after login should trigger weather fetches
                // based on the now available this.user.userRegion / this.user.userLocations
                // const weatherStore = useWeatherStore();
                // weatherStore.updateUserWeather(this.user.userRegion, this.user.userLocations); // No longer exists

            } else {
                this.isUserAuthenticated = false;
                this.user = null;
                throw Error("Invalid credentials!");
            }
        },

        // Action to register a new user
        register(email, username, password) {
            const emailExists = this.users.some(user => user.email === email);
            if (emailExists) {
                throw Error("Email already exists!");
            }
            const usernameExists = this.users.some(user => user.username === username);
            if (usernameExists) {
                throw Error("Username already exists!");
            }

            // Create new user with default preferences
            const newUser = {
                username: username,
                email: email,
                password: password, // Remember to hash passwords in a real app!
                nimbusCoins: 50,
                userRegion: null,    // Default value
                userLocations: [],   // Default value
                // Add other preference defaults if needed (userLang, etc.)
                userPreferences: [],
                allowGamification: false,
                selectedAvatar: null,
                userLang: null,
            };
            this.users.push(newUser);
            console.log("User registered:", newUser);
            // Do NOT automatically log in the user here unless intended.
            // this.isUserAuthenticated = true;
            // this.user = { ...newUser };
        },

        /**
         * Saves user preferences. Updates both the main user list (for persistence)
         * and the currently active user state object.
         * @param {string} username - The username of the user whose preferences are being saved.
         * @param {object} preferences - The preferences object (e.g., { userRegion, userLocations, userLang, ... }).
         */
        savePreferences(username, preferences) {
            console.log(`Saving preferences for ${username}:`, preferences);
            const userIndex = this.users.findIndex((user) => user.username === username);

            if (userIndex !== -1) {
                // Update the user object in the main users array
                // Ensure nested objects like userRegion are merged correctly if needed
                this.users[userIndex] = {
                    ...this.users[userIndex], // Keep existing user data
                    ...preferences          // Overwrite with new preferences
                 };
                 console.log(`User updated in users array at index ${userIndex}:`, this.users[userIndex]);

                // *** IMPORTANT: Update the currently logged-in user state as well ***
                if (this.user && this.user.username === username) {
                    this.user = {
                        ...this.user,       // Keep existing active user data
                        ...preferences      // Overwrite with new preferences
                    };
                    console.log("Active user state updated:", this.user);
                } else {
                     console.warn("savePreferences called for a user who is not currently logged in, or mismatch.");
                }
            } else {
                console.error(`User not found for saving preferences: ${username}`);
                throw Error("User not found!");
            }
        },

        // Action to log out the current user
        logout() {
            console.log('Logging out user:', this.user?.username);
            this.isUserAuthenticated = false;
            this.user = null;
            // Optionally clear weather store data on logout
            // const weatherStore = useWeatherStore();
            // weatherStore.regionWeatherData = null;
            // weatherStore.weatherData = {};
        },

        // Action to update general user data (might not be needed if savePreferences covers it)
        // updateUser(username, newUserData) { ... } // Keep if needed for other profile updates
    },
    persist: true, // Enables data persistence for the user store
});
