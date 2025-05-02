// Month Selector Component
// Displays buttons for each month with roster data and allows selecting a month

/**
 * Renders a month selector component
 * @param {string} selectedMonthKey - The currently selected month key (format: "month-year")
 * @param {string} containerId - The ID of the container element
 * @param {function} onMonthSelected - Callback function called when a month is selected
 */
function renderMonthSelector(selectedMonthKey, containerId, onMonthSelected) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Clear existing content
  container.innerHTML = "";

  // Get multi-month data
  const multiMonthData =
    JSON.parse(localStorage.getItem("multiMonthData")) || {};

  // Get all month keys and sort them
  const monthKeys = Object.keys(multiMonthData);

  // If no months, show only the "Upload Roster" button
  if (monthKeys.length === 0) {
    // Create a container for the content
    const contentContainer = document.createElement("div");
    contentContainer.className = "month-selector-container";

    // Create the button container
    const buttonContainer = document.createElement("div");
    buttonContainer.className = "month-selector-buttons";

    // Create the "Upload Roster" button
    const addMonthButton = document.createElement("button");
    addMonthButton.className = "upload-roster-button";
    addMonthButton.innerHTML =
      '<i class="fas fa-upload mr-2"></i>Upload Roster';

    // Add click event listener
    addMonthButton.addEventListener("click", () => {
      showMonthSelectionModal(onMonthSelected);
    });

    // Add the button to the container
    buttonContainer.appendChild(addMonthButton);

    // Add the button container to the content container
    contentContainer.appendChild(buttonContainer);

    // Clear existing content and add the content container
    container.innerHTML = "";
    container.appendChild(contentContainer);

    // Clear the selected month key since there's no data
    if (onMonthSelected) {
      onMonthSelected("");
    }

    return;
  }

  // Create a container for the content
  const contentContainer = document.createElement("div");
  contentContainer.className = "month-selector-container";

  // Create a button container
  const buttonContainer = document.createElement("div");
  buttonContainer.className = "month-selector-buttons";

  // Add "Upload Roster" button first
  const addMonthButton = createAddMonthButton(onMonthSelected);
  buttonContainer.appendChild(addMonthButton);

  // Process month keys to extract month and year
  const processedMonths = monthKeys.map((key) => {
    const [month, year] = key.split("-");
    return {
      key,
      month: parseInt(month),
      year: parseInt(year),
      // Use stored month name if available, otherwise generate from month number
      displayName: multiMonthData[key].month
        ? `${multiMonthData[key].month} ${multiMonthData[key].year || year}`
        : `${getMonthName(parseInt(month))} ${year}`,
    };
  });

  // Sort by year (ascending) and then by month (ascending)
  processedMonths.sort((a, b) => {
    if (a.year !== b.year) {
      return a.year - b.year; // Ascending by year
    }
    return a.month - b.month; // Ascending by month
  });

  // Create buttons for each month
  processedMonths.forEach((monthData) => {
    const isSelected = monthData.key === selectedMonthKey;

    const monthButton = document.createElement("button");
    monthButton.className = `month-button ${isSelected ? "selected" : ""}`;
    monthButton.innerHTML = `<i class="fas fa-calendar-day"></i>${monthData.displayName}`;

    // Add click event listener
    monthButton.addEventListener("click", () => {
      if (onMonthSelected) {
        onMonthSelected(monthData.key);
      }
    });

    buttonContainer.appendChild(monthButton);
  });

  // Add the button container to the content container
  contentContainer.appendChild(buttonContainer);

  // Add the content container to the main container
  container.appendChild(contentContainer);
}

/**
 * Creates an "Upload Roster" button
 * @param {function} onMonthSelected - Callback function called when a month is selected
 * @returns {HTMLElement} The button element
 */
function createAddMonthButton(onMonthSelected) {
  const addMonthButton = document.createElement("button");
  addMonthButton.className = "upload-roster-button";
  addMonthButton.innerHTML = '<i class="fas fa-upload"></i>Upload Roster';

  // Add click event listener
  addMonthButton.addEventListener("click", () => {
    showMonthSelectionModal(onMonthSelected);
  });

  return addMonthButton;
}

/**
 * Shows a modal dialog for selecting a new month
 * @param {function} onMonthSelected - Callback function called when a month is selected
 */
function showMonthSelectionModal(onMonthSelected) {
  // Create modal container
  const modalContainer = document.createElement("div");
  modalContainer.className =
    "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";

  // Create modal content
  const modalContent = document.createElement("div");
  modalContent.className = "bg-white rounded-lg shadow-xl p-6 w-96 max-w-full";

  // Create modal header
  const modalHeader = document.createElement("div");
  modalHeader.className = "flex justify-between items-center mb-4";

  const modalTitle = document.createElement("h3");
  modalTitle.className = "text-lg font-medium text-gray-900";
  modalTitle.textContent = "Select Month";

  const closeButton = document.createElement("button");
  closeButton.className =
    "text-gray-400 hover:text-gray-500 focus:outline-none";
  closeButton.innerHTML = '<i class="fas fa-times"></i>';
  closeButton.addEventListener("click", () => {
    document.body.removeChild(modalContainer);
  });

  modalHeader.appendChild(modalTitle);
  modalHeader.appendChild(closeButton);

  // Create month and year selectors
  const selectorsContainer = document.createElement("div");
  selectorsContainer.className = "grid grid-cols-2 gap-4 mb-6";

  // Month selector
  const monthSelectContainer = document.createElement("div");
  monthSelectContainer.className = "flex flex-col";

  const monthLabel = document.createElement("label");
  monthLabel.className = "text-sm font-medium text-gray-700 mb-1";
  monthLabel.textContent = "Month";

  const monthSelect = document.createElement("select");
  monthSelect.className =
    "border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500";

  const months = [
    { value: 1, name: "January" },
    { value: 2, name: "February" },
    { value: 3, name: "March" },
    { value: 4, name: "April" },
    { value: 5, name: "May" },
    { value: 6, name: "June" },
    { value: 7, name: "July" },
    { value: 8, name: "August" },
    { value: 9, name: "September" },
    { value: 10, name: "October" },
    { value: 11, name: "November" },
    { value: 12, name: "December" },
  ];

  // Set current month as default
  const currentMonth = new Date().getMonth() + 1; // JavaScript months are 0-indexed

  months.forEach((month) => {
    const option = document.createElement("option");
    option.value = month.value;
    option.textContent = month.name;
    if (month.value === currentMonth) {
      option.selected = true;
    }
    monthSelect.appendChild(option);
  });

  monthSelectContainer.appendChild(monthLabel);
  monthSelectContainer.appendChild(monthSelect);

  // Year selector
  const yearSelectContainer = document.createElement("div");
  yearSelectContainer.className = "flex flex-col";

  const yearLabel = document.createElement("label");
  yearLabel.className = "text-sm font-medium text-gray-700 mb-1";
  yearLabel.textContent = "Year";

  const yearSelect = document.createElement("select");
  yearSelect.className =
    "border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500";

  // Generate years (current year and 5 years before and after)
  const currentYear = new Date().getFullYear();
  for (let year = currentYear - 5; year <= currentYear + 5; year++) {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year;
    if (year === currentYear) {
      option.selected = true;
    }
    yearSelect.appendChild(option);
  }

  yearSelectContainer.appendChild(yearLabel);
  yearSelectContainer.appendChild(yearSelect);

  selectorsContainer.appendChild(monthSelectContainer);
  selectorsContainer.appendChild(yearSelectContainer);

  // Create buttons
  const buttonsContainer = document.createElement("div");
  buttonsContainer.className = "flex justify-end space-x-3";

  const cancelButton = document.createElement("button");
  cancelButton.className =
    "px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500";
  cancelButton.textContent = "Cancel";
  cancelButton.addEventListener("click", () => {
    document.body.removeChild(modalContainer);
  });

  const confirmButton = document.createElement("button");
  confirmButton.className =
    "px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500";
  confirmButton.textContent = "Continue";
  confirmButton.addEventListener("click", () => {
    const selectedMonth = parseInt(monthSelect.value);
    const selectedYear = parseInt(yearSelect.value);
    const monthKey = `${selectedMonth}-${selectedYear}`;

    // Check if this month already exists
    const multiMonthData =
      JSON.parse(localStorage.getItem("multiMonthData")) || {};
    if (multiMonthData[monthKey]) {
      // Show error message
      alert(
        `Data for ${getMonthName(
          selectedMonth
        )} ${selectedYear} already exists. Please select a different month.`
      );
      return;
    }

    // Create new month entry
    multiMonthData[monthKey] = {
      month: getMonthName(selectedMonth),
      year: selectedYear,
      flights: [],
      calculationResults: {},
    };

    // Save to localStorage
    localStorage.setItem("multiMonthData", JSON.stringify(multiMonthData));

    // Close modal
    document.body.removeChild(modalContainer);

    // Trigger the file upload dialog
    triggerFileUpload(monthKey, onMonthSelected);
  });

  buttonsContainer.appendChild(cancelButton);
  buttonsContainer.appendChild(confirmButton);

  // Assemble modal content
  modalContent.appendChild(modalHeader);
  modalContent.appendChild(selectorsContainer);
  modalContent.appendChild(buttonsContainer);

  modalContainer.appendChild(modalContent);

  // Add modal to body
  document.body.appendChild(modalContainer);
}

/**
 * Triggers the file upload dialog for the selected month
 * @param {string} monthKey - The selected month key
 * @param {function} onMonthSelected - Callback function called when a month is selected
 */
function triggerFileUpload(monthKey, onMonthSelected) {
  // Create a hidden file input element
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = ".csv";
  fileInput.style.display = "none";
  document.body.appendChild(fileInput);

  // Trigger the file dialog
  fileInput.click();

  // Handle file selection
  fileInput.addEventListener("change", (event) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];

      // Show a loading notification
      const loadingNotification = document.createElement("div");
      loadingNotification.className =
        "fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-md shadow-lg";
      loadingNotification.textContent = "Processing roster file...";
      document.body.appendChild(loadingNotification);

      // Read the file
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const csvData = e.target.result;

          // Process the CSV data
          if (typeof window.processRosterData === "function") {
            // Use the existing processRosterData function with the selected month key
            window.processRosterDataForMonth(csvData, monthKey);

            // Call the callback function to update the UI
            if (onMonthSelected) {
              onMonthSelected(monthKey);
            }
          } else {
            console.error("processRosterData function not found");
            showErrorNotification(
              "Error processing roster data: Processing function not found"
            );
          }
        } catch (error) {
          console.error("Error processing CSV file:", error);
          showErrorNotification(
            "Error processing roster data: " + error.message
          );
        } finally {
          // Remove the loading notification
          loadingNotification.remove();

          // Remove the file input
          document.body.removeChild(fileInput);
        }
      };

      reader.onerror = () => {
        console.error("Error reading file");
        loadingNotification.remove();
        showErrorNotification("Error reading file");
        document.body.removeChild(fileInput);
      };

      // Read the file as text
      reader.readAsText(file);
    } else {
      // No file selected, remove the file input
      document.body.removeChild(fileInput);
    }
  });
}

/**
 * Shows an error notification
 * @param {string} message - The error message to display
 */
function showErrorNotification(message) {
  // Use ui-utils if available
  if (window.ui && window.ui.showNotification) {
    window.ui.showNotification("error", message, 5000);
  } else {
    // Fallback to old method
    const notification = document.createElement("div");
    notification.className =
      "fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-md shadow-lg";
    notification.textContent = message;
    document.body.appendChild(notification);

    // Remove the notification after 5 seconds
    setTimeout(() => {
      notification.remove();
    }, 5000);
  }
}

/**
 * Gets the month name from the month number
 * @param {number} monthNumber - The month number (1-12)
 * @returns {string} The month name
 */
function getMonthName(monthNumber) {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return monthNames[monthNumber - 1] || "Unknown";
}

// Export functions
window.monthSelector = {
  renderMonthSelector,
  showMonthSelectionModal,
};
