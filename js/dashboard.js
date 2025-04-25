/**
 * Dashboard functionality for Skywage
 */

document.addEventListener("DOMContentLoaded", function () {
  // Load multi-month data
  const multiMonthData =
    JSON.parse(localStorage.getItem("multiMonthData")) || {};

  // Get current month data
  const currentDate = new Date();
  const currentMonthKey = `${
    currentDate.getMonth() + 1
  }-${currentDate.getFullYear()}`;
  const currentMonthData = multiMonthData[currentMonthKey] || {
    calculationResults: {},
  };

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
  const basicSalaryElement = document.getElementById("basic-salary");
  if (basicSalaryElement) {
    basicSalaryElement.textContent = Math.round(basicSalary).toLocaleString();
  }

  // Update flight pay and per diem
  const flightPay = currentMonthData.calculationResults?.flightPay || 0;
  const perDiem = currentMonthData.calculationResults?.perDiem || 0;
  const variablesTotal = flightPay + perDiem;

  // Update Flight Pay
  const flightPayElement = document.getElementById("flight-pay");
  if (flightPayElement) {
    flightPayElement.textContent = `${Math.round(
      flightPay
    ).toLocaleString()} AED`;
  }

  // Update Per Diem
  const perDiemElement = document.getElementById("per-diem");
  if (perDiemElement) {
    perDiemElement.textContent = `${Math.round(perDiem).toLocaleString()} AED`;
  }

  // Update Variables Total
  const variablesTotalElement = document.getElementById("variables-total");
  if (variablesTotalElement) {
    variablesTotalElement.textContent = `${Math.round(
      variablesTotal
    ).toLocaleString()} AED`;
  }

  // Update flight hours
  const flightHours =
    currentMonthData.calculationResults?.totalFlightHours || 0;
  const flightHoursElement = document.getElementById("flight-hours");
  if (flightHoursElement) {
    flightHoursElement.textContent = formatHoursMinutes(flightHours);
  }

  // Update total salary
  const totalSalary =
    currentMonthData.calculationResults?.totalSalary || basicSalary;
  const totalSalaryElement = document.getElementById("total-salary");
  if (totalSalaryElement) {
    totalSalaryElement.textContent = Math.round(totalSalary).toLocaleString();
  }

  // Update recent flights table
  updateRecentFlightsTable(currentMonthData.flights || []);
}

/**
 * Updates the recent flights table with the provided flights
 * @param {Array} flights - Array of flight objects
 */
function updateRecentFlightsTable(flights) {
  const recentFlightsTable = document.getElementById("recent-flights-table");
  if (!recentFlightsTable || flights.length === 0) return;

  // Sort flights by date (most recent first)
  const sortedFlights = [...flights].sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });

  // Get the 5 most recent flights
  const recentFlights = sortedFlights.slice(0, 5);

  // Render flights
  recentFlightsTable.innerHTML = recentFlights
    .map((flight) => {
      const hours = flight.flightHours || flight.hours || 0;
      const pay = flight.flightPay || flight.pay || 0;
      return `
        <tr>
            <td>${formatDate(flight.date)}</td>
            <td>${flight.flightNumber || flight.flight}</td>
            <td>${flight.departure} - ${flight.destination}</td>
            <td>${formatHoursMinutes(hours)}</td>
            <td>${Math.round(pay)} AED</td>
        </tr>
        `;
    })
    .join("");
}

/**
 * Formats a date string to a more readable format
 * @param {string} dateString - Date string to format
 * @returns {string} Formatted date string
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

/**
 * Sets up event listeners for the dashboard
 */
function setupDashboardEventListeners() {
  // Sign out button
  const signOutButton = document.getElementById("sign-out-button");
  if (signOutButton) {
    signOutButton.addEventListener("click", function (e) {
      e.preventDefault();
      sessionStorage.removeItem("isAuthenticated");
      sessionStorage.removeItem("userPosition");
      sessionStorage.removeItem("userEmail");
      window.location.href = "sign-in.html";
    });
  }

  // Set user email
  const userEmail = sessionStorage.getItem("userEmail");
  const userEmailElement = document.getElementById("user-email");
  if (userEmailElement && userEmail) {
    userEmailElement.textContent = userEmail;
  }
}
