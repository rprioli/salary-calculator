/**
 * Data Management Module for Skywage
 * Handles data storage, retrieval, and manipulation
 */

// Storage keys
const STORAGE_KEYS = {
    MULTI_MONTH_DATA: 'multiMonthData',
    REGISTERED_USERS: 'registeredUsers',
    USER_SETTINGS: 'userSettings'
};

// Get multi-month data from localStorage
function getMultiMonthData() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.MULTI_MONTH_DATA)) || {};
    } catch (error) {
        console.error('Error parsing multi-month data:', error);
        return {};
    }
}

// Save multi-month data to localStorage
function saveMultiMonthData(data) {
    try {
        localStorage.setItem(STORAGE_KEYS.MULTI_MONTH_DATA, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Error saving multi-month data:', error);
        return false;
    }
}

// Get data for a specific month
function getMonthData(year, month) {
    const multiMonthData = getMultiMonthData();
    const monthKey = `${month}-${year}`;
    return multiMonthData[monthKey] || null;
}

// Save data for a specific month
function saveMonthData(year, month, data) {
    const multiMonthData = getMultiMonthData();
    const monthKey = `${month}-${year}`;
    multiMonthData[monthKey] = data;
    return saveMultiMonthData(multiMonthData);
}

// Get current month data
function getCurrentMonthData() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // JavaScript months are 0-indexed
    return getMonthData(currentYear, currentMonth);
}

// Clear all stored data
function clearAllData() {
    try {
        localStorage.removeItem(STORAGE_KEYS.MULTI_MONTH_DATA);
        console.log('All data cleared');
        return true;
    } catch (error) {
        console.error('Error clearing data:', error);
        return false;
    }
}

// Get user settings
function getUserSettings() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_SETTINGS)) || {};
    } catch (error) {
        console.error('Error parsing user settings:', error);
        return {};
    }
}

// Save user settings
function saveUserSettings(settings) {
    try {
        localStorage.setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify(settings));
        return true;
    } catch (error) {
        console.error('Error saving user settings:', error);
        return false;
    }
}

// Get registered users
function getRegisteredUsers() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.REGISTERED_USERS)) || [];
    } catch (error) {
        console.error('Error parsing registered users:', error);
        return [];
    }
}

// Save registered users
function saveRegisteredUsers(users) {
    try {
        localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(users));
        return true;
    } catch (error) {
        console.error('Error saving registered users:', error);
        return false;
    }
}

// Add a flight to the current month
function addFlight(flightData) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    // Get current month data or create new
    let monthData = getMonthData(currentYear, currentMonth);
    if (!monthData) {
        monthData = {
            month: currentMonth,
            year: currentYear,
            flights: [],
            calculationResults: {}
        };
    }
    
    // Add flight to flights array
    monthData.flights.push(flightData);
    
    // Save updated month data
    return saveMonthData(currentYear, currentMonth, monthData);
}

// Remove a flight from the current month
function removeFlight(flightId) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    // Get current month data
    let monthData = getMonthData(currentYear, currentMonth);
    if (!monthData || !monthData.flights) {
        return false;
    }
    
    // Find and remove the flight
    const index = monthData.flights.findIndex(flight => flight.id === flightId);
    if (index === -1) {
        return false;
    }
    
    // Remove the flight
    monthData.flights.splice(index, 1);
    
    // Save updated month data
    return saveMonthData(currentYear, currentMonth, monthData);
}

// Update calculation results for a month
function updateCalculationResults(year, month, results) {
    // Get month data
    let monthData = getMonthData(year, month);
    if (!monthData) {
        monthData = {
            month: month,
            year: year,
            flights: [],
            calculationResults: {}
        };
    }
    
    // Update calculation results
    monthData.calculationResults = results;
    
    // Save updated month data
    return saveMonthData(year, month, monthData);
}

// Export functions for use in other files
window.dataManager = {
    getMultiMonthData,
    saveMultiMonthData,
    getMonthData,
    saveMonthData,
    getCurrentMonthData,
    clearAllData,
    getUserSettings,
    saveUserSettings,
    getRegisteredUsers,
    saveRegisteredUsers,
    addFlight,
    removeFlight,
    updateCalculationResults,
    STORAGE_KEYS
};
