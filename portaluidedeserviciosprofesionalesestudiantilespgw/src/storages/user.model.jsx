/**
 * User storage utilities for localStorage management
 */

const USER_STORAGE_KEY = 'app_user_data';

/**
 * Store user data in localStorage
 * @param {Object} userData - User data object to store
 */
export const setDataUser = (userData) => {
    try {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
    } catch (error) {
        console.error('Error saving user data to localStorage:', error);
    }
};

/**
 * Retrieve user data from localStorage
 * @returns {Object|null} User data object or null if not found
 */
export const getDataUser = () => {
    try {
        const data = localStorage.getItem(USER_STORAGE_KEY);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error reading user data from localStorage:', error);
        return null;
    }
};

/**
 * Remove user data from localStorage
 */
export const rmDataUser = () => {
    try {
        localStorage.removeItem(USER_STORAGE_KEY);
    } catch (error) {
        console.error('Error removing user data from localStorage:', error);
    }
};
