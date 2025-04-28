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
    container.innerHTML = '';

    // Get multi-month data
    const multiMonthData = JSON.parse(localStorage.getItem('multiMonthData')) || {};
    
    // Get all month keys and sort them
    const monthKeys = Object.keys(multiMonthData);
    
    // If no months, show a message and an "Add Month" button
    if (monthKeys.length === 0) {
        const noDataMessage = document.createElement('div');
        noDataMessage.className = 'text-center text-gray-500 py-2';
        noDataMessage.innerHTML = '<i class="fas fa-info-circle mr-2"></i>No monthly data available.';
        container.appendChild(noDataMessage);
        
        // Add "Add Month" button
        const addMonthButton = createAddMonthButton(onMonthSelected);
        container.appendChild(addMonthButton);
        return;
    }

    // Create a button container
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'flex flex-wrap gap-2 items-center';
    
    // Process month keys to extract month and year
    const processedMonths = monthKeys.map(key => {
        const [month, year] = key.split('-');
        return {
            key,
            month: parseInt(month),
            year: parseInt(year),
            // Use stored month name if available, otherwise generate from month number
            displayName: multiMonthData[key].month 
                ? `${multiMonthData[key].month} ${multiMonthData[key].year || year}`
                : `${getMonthName(parseInt(month))} ${year}`
        };
    });
    
    // Sort by year (descending) and then by month (descending)
    processedMonths.sort((a, b) => {
        if (a.year !== b.year) {
            return b.year - a.year; // Descending by year
        }
        return b.month - a.month; // Descending by month
    });
    
    // Create buttons for each month
    processedMonths.forEach(monthData => {
        const isSelected = monthData.key === selectedMonthKey;
        
        const monthButton = document.createElement('button');
        monthButton.className = `px-4 py-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            isSelected 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`;
        monthButton.innerHTML = `<i class="fas fa-calendar-day mr-2"></i>${monthData.displayName}`;
        
        // Add click event listener
        monthButton.addEventListener('click', () => {
            if (onMonthSelected) {
                onMonthSelected(monthData.key);
            }
        });
        
        buttonContainer.appendChild(monthButton);
    });
    
    // Add "Add Month" button
    const addMonthButton = createAddMonthButton(onMonthSelected);
    buttonContainer.appendChild(addMonthButton);
    
    container.appendChild(buttonContainer);
}

/**
 * Creates an "Add Month" button
 * @param {function} onMonthSelected - Callback function called when a month is selected
 * @returns {HTMLElement} The button element
 */
function createAddMonthButton(onMonthSelected) {
    const addMonthButton = document.createElement('button');
    addMonthButton.className = 'px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500';
    addMonthButton.innerHTML = '<i class="fas fa-plus mr-2"></i>Add Month';
    
    // Add click event listener
    addMonthButton.addEventListener('click', () => {
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
    const modalContainer = document.createElement('div');
    modalContainer.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    
    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'bg-white rounded-lg shadow-xl p-6 w-96 max-w-full';
    
    // Create modal header
    const modalHeader = document.createElement('div');
    modalHeader.className = 'flex justify-between items-center mb-4';
    
    const modalTitle = document.createElement('h3');
    modalTitle.className = 'text-lg font-medium text-gray-900';
    modalTitle.textContent = 'Select Month';
    
    const closeButton = document.createElement('button');
    closeButton.className = 'text-gray-400 hover:text-gray-500 focus:outline-none';
    closeButton.innerHTML = '<i class="fas fa-times"></i>';
    closeButton.addEventListener('click', () => {
        document.body.removeChild(modalContainer);
    });
    
    modalHeader.appendChild(modalTitle);
    modalHeader.appendChild(closeButton);
    
    // Create month and year selectors
    const selectorsContainer = document.createElement('div');
    selectorsContainer.className = 'grid grid-cols-2 gap-4 mb-6';
    
    // Month selector
    const monthSelectContainer = document.createElement('div');
    monthSelectContainer.className = 'flex flex-col';
    
    const monthLabel = document.createElement('label');
    monthLabel.className = 'text-sm font-medium text-gray-700 mb-1';
    monthLabel.textContent = 'Month';
    
    const monthSelect = document.createElement('select');
    monthSelect.className = 'border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500';
    
    const months = [
        { value: 1, name: 'January' },
        { value: 2, name: 'February' },
        { value: 3, name: 'March' },
        { value: 4, name: 'April' },
        { value: 5, name: 'May' },
        { value: 6, name: 'June' },
        { value: 7, name: 'July' },
        { value: 8, name: 'August' },
        { value: 9, name: 'September' },
        { value: 10, name: 'October' },
        { value: 11, name: 'November' },
        { value: 12, name: 'December' }
    ];
    
    // Set current month as default
    const currentMonth = new Date().getMonth() + 1; // JavaScript months are 0-indexed
    
    months.forEach(month => {
        const option = document.createElement('option');
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
    const yearSelectContainer = document.createElement('div');
    yearSelectContainer.className = 'flex flex-col';
    
    const yearLabel = document.createElement('label');
    yearLabel.className = 'text-sm font-medium text-gray-700 mb-1';
    yearLabel.textContent = 'Year';
    
    const yearSelect = document.createElement('select');
    yearSelect.className = 'border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500';
    
    // Generate years (current year and 5 years before and after)
    const currentYear = new Date().getFullYear();
    for (let year = currentYear - 5; year <= currentYear + 5; year++) {
        const option = document.createElement('option');
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
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'flex justify-end space-x-3';
    
    const cancelButton = document.createElement('button');
    cancelButton.className = 'px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500';
    cancelButton.textContent = 'Cancel';
    cancelButton.addEventListener('click', () => {
        document.body.removeChild(modalContainer);
    });
    
    const confirmButton = document.createElement('button');
    confirmButton.className = 'px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500';
    confirmButton.textContent = 'Confirm';
    confirmButton.addEventListener('click', () => {
        const selectedMonth = parseInt(monthSelect.value);
        const selectedYear = parseInt(yearSelect.value);
        const monthKey = `${selectedMonth}-${selectedYear}`;
        
        // Check if this month already exists
        const multiMonthData = JSON.parse(localStorage.getItem('multiMonthData')) || {};
        if (multiMonthData[monthKey]) {
            // Show error message
            alert(`Data for ${getMonthName(selectedMonth)} ${selectedYear} already exists. Please select a different month.`);
            return;
        }
        
        // Create new month entry
        multiMonthData[monthKey] = {
            month: getMonthName(selectedMonth),
            year: selectedYear,
            flights: [],
            calculationResults: {}
        };
        
        // Save to localStorage
        localStorage.setItem('multiMonthData', JSON.stringify(multiMonthData));
        
        // Call callback function
        if (onMonthSelected) {
            onMonthSelected(monthKey);
        }
        
        // Close modal
        document.body.removeChild(modalContainer);
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
 * Gets the month name from the month number
 * @param {number} monthNumber - The month number (1-12)
 * @returns {string} The month name
 */
function getMonthName(monthNumber) {
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    return monthNames[monthNumber - 1] || 'Unknown';
}

// Export functions
window.monthSelector = {
    renderMonthSelector,
    showMonthSelectionModal
};
