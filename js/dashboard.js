/**
 * Dashboard functionality for Skywage
 */

document.addEventListener('DOMContentLoaded', function() {
    // Load multi-month data
    const multiMonthData = JSON.parse(localStorage.getItem('multiMonthData')) || {};
    
    // Get current month data
    const currentDate = new Date();
    const currentMonthKey = `${currentDate.getMonth() + 1}-${currentDate.getFullYear()}`;
    const currentMonthData = multiMonthData[currentMonthKey] || { calculationResults: {} };
    
    // Update dashboard cards
    updateDashboardCards(currentMonthData, multiMonthData);
    
    // Set up event listeners
    setupDashboardEventListeners();
});

/**
 * Updates the dashboard cards with the current data
 * @param {Object} currentMonthData - Data for the current month
 * @param {Object} multiMonthData - Data for all months
 */
function updateDashboardCards(currentMonthData, multiMonthData) {
    // Update basic salary
    const basicSalary = currentMonthData.calculationResults?.basicSalary || 8500;
    const basicSalaryElement = document.getElementById('basic-salary');
    if (basicSalaryElement) {
        basicSalaryElement.textContent = Math.round(basicSalary).toLocaleString();
        
        // Update circle progress
        const basicSalaryCircle = basicSalaryElement.closest('.stat-card').querySelector('.circle-progress-value');
        if (basicSalaryCircle) {
            // Set progress to 85% (fixed for basic salary)
            basicSalaryCircle.setAttribute('stroke-dasharray', '85, 100');
        }
    }
    
    // Update flight pay
    const flightPay = currentMonthData.calculationResults?.flightPay || 2845;
    const flightPayElement = document.getElementById('flight-pay');
    if (flightPayElement) {
        flightPayElement.textContent = Math.round(flightPay).toLocaleString();
        
        // Update circle progress
        const flightPayCircle = flightPayElement.closest('.stat-card').querySelector('.circle-progress-value');
        if (flightPayCircle) {
            // Calculate percentage of flight pay compared to basic salary (max 100%)
            const percentage = Math.min(Math.round((flightPay / basicSalary) * 100), 100);
            flightPayCircle.setAttribute('stroke-dasharray', `${percentage}, 100`);
        }
    }
    
    // Update flight hours
    const flightHours = currentMonthData.calculationResults?.totalFlightHours || 85.5;
    const flightHoursElement = document.getElementById('flight-hours');
    if (flightHoursElement) {
        flightHoursElement.textContent = flightHours.toFixed(1);
        
        // Update circle progress
        const flightHoursCircle = flightHoursElement.closest('.stat-card').querySelector('.circle-progress-value');
        if (flightHoursCircle) {
            // Calculate percentage of flight hours compared to max hours (100 hours)
            const percentage = Math.min(Math.round((flightHours / 100) * 100), 100);
            flightHoursCircle.setAttribute('stroke-dasharray', `${percentage}, 100`);
        }
    }
    
    // Update total salary
    const totalSalary = currentMonthData.calculationResults?.totalSalary || 12345;
    const totalSalaryElement = document.getElementById('total-salary');
    if (totalSalaryElement) {
        totalSalaryElement.textContent = Math.round(totalSalary).toLocaleString();
        
        // Update circle progress
        const totalSalaryCircle = totalSalaryElement.closest('.stat-card').querySelector('.circle-progress-value');
        if (totalSalaryCircle) {
            // Calculate percentage of total salary compared to target (15000)
            const percentage = Math.min(Math.round((totalSalary / 15000) * 100), 100);
            totalSalaryCircle.setAttribute('stroke-dasharray', `${percentage}, 100`);
        }
    }
    
    // Update recent flights table
    updateRecentFlightsTable(currentMonthData.flights || []);
}

/**
 * Updates the recent flights table with the provided flights
 * @param {Array} flights - Array of flight objects
 */
function updateRecentFlightsTable(flights) {
    const recentFlightsTable = document.getElementById('recent-flights-table');
    if (!recentFlightsTable || flights.length === 0) return;
    
    // Sort flights by date (most recent first)
    const sortedFlights = [...flights].sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    });
    
    // Get the 5 most recent flights
    const recentFlights = sortedFlights.slice(0, 5);
    
    // Render flights
    recentFlightsTable.innerHTML = recentFlights.map(flight => `
        <tr>
            <td>${formatDate(flight.date)}</td>
            <td>${flight.flightNumber || flight.flight}</td>
            <td>${flight.departure} - ${flight.destination}</td>
            <td>${flight.flightHours?.toFixed(1) || flight.hours?.toFixed(1)}h</td>
            <td>${Math.round(flight.flightPay || flight.pay)} AED</td>
        </tr>
    `).join('');
}

/**
 * Formats a date string to a more readable format
 * @param {string} dateString - Date string to format
 * @returns {string} Formatted date string
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

/**
 * Sets up event listeners for the dashboard
 */
function setupDashboardEventListeners() {
    // Sign out button
    const signOutButton = document.getElementById('sign-out-button');
    if (signOutButton) {
        signOutButton.addEventListener('click', function(e) {
            e.preventDefault();
            sessionStorage.removeItem('isAuthenticated');
            sessionStorage.removeItem('userPosition');
            sessionStorage.removeItem('userEmail');
            window.location.href = 'sign-in.html';
        });
    }
    
    // Set user email
    const userEmail = sessionStorage.getItem('userEmail');
    const userEmailElement = document.getElementById('user-email');
    if (userEmailElement && userEmail) {
        userEmailElement.textContent = userEmail;
    }
}
