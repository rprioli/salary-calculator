// Manual Flight Entry Component

// Generate and render the manual flight entry form
function renderManualFlightEntryForm(isVisible, selectedRole) {
    // Create the form container
    const formContainer = document.getElementById('manual-flight-form-container');
    if (!formContainer) return;

    // Set visibility
    if (isVisible) {
        formContainer.classList.remove('hidden');
    } else {
        formContainer.classList.add('hidden');
        return;
    }

    // Create the form content
    formContainer.innerHTML = `
        <div class="bg-white rounded-lg p-6 shadow-md border border-indigo-200 animate-fade-in">
            <h3 class="text-lg font-medium text-gray-700 mb-4 flex items-center">
                <i class="fas fa-plus-circle text-indigo-500 mr-2"></i>
                Add Duty Manually
            </h3>

            <form id="manual-flight-form" class="space-y-4">
                <!-- Duty Type -->
                <div class="mb-6">
                    <label class="block text-sm font-medium text-gray-700 mb-3">Duty Type</label>
                    <div class="flex flex-col md:flex-row justify-start gap-4 mb-2">
                        <button type="button" id="turnaround-button" class="duty-type-btn py-3 px-5 text-base rounded-md transition-all bg-indigo-500 text-white shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50" data-duty-type="turnaround" aria-pressed="true">
                            <i class="fas fa-plane mr-2"></i> Turnaround
                        </button>
                        <button type="button" id="layover-button" class="duty-type-btn py-3 px-5 text-base rounded-md transition-all bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50" data-duty-type="layover" aria-pressed="false">
                            <i class="fas fa-bed mr-2"></i> Layover
                        </button>
                        <button type="button" id="asby-button" class="duty-type-btn py-3 px-5 text-base rounded-md transition-all bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50" data-duty-type="asby" aria-pressed="false">
                            <i class="fas fa-clock mr-2"></i> ASBY
                        </button>
                        <input type="hidden" id="selected-duty-type" value="turnaround">
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <!-- Date -->
                    <div>
                        <label for="flight-date" class="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input type="date" id="flight-date"
                            class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            required>
                    </div>

                    <!-- Flight Number -->
                    <div id="flight-number-container">
                        <label for="flight-number" class="block text-sm font-medium text-gray-700 mb-1">Flight Number</label>
                        <input type="text" id="flight-number" placeholder="FZ123"
                            class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                        <p class="text-xs text-gray-500 mt-1">Example: FZ123</p>
                    </div>

                    <!-- Sector -->
                    <div id="sector-container">
                        <label for="flight-sector" class="block text-sm font-medium text-gray-700 mb-1">Sector</label>
                        <input type="text" id="flight-sector" placeholder="DXB - BOM"
                            class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                        <p class="text-xs text-gray-500 mt-1">Example: DXB - BOM</p>
                    </div>

                    <!-- Reporting Time -->
                    <div>
                        <label for="reporting-time" class="block text-sm font-medium text-gray-700 mb-1">Reporting Time</label>
                        <input type="text" id="reporting-time" placeholder="HH:MM"
                            class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            required pattern="\\d{2}:\\d{2}">
                        <p class="text-xs text-gray-500 mt-1">Example: 14:30 (24-hour format)</p>
                    </div>

                    <!-- Debriefing Time -->
                    <div>
                        <label for="debriefing-time" class="block text-sm font-medium text-gray-700 mb-1">Debriefing Time</label>
                        <input type="text" id="debriefing-time" placeholder="HH:MM"
                            class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            required pattern="\\d{2}:\\d{2}">
                        <p class="text-xs text-gray-500 mt-1">Example: 22:45 (24-hour format)</p>
                    </div>

                    <!-- Layover Option -->
                    <div id="layover-container">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Layover</label>
                        <div class="flex items-center">
                            <input type="checkbox" id="is-layover" class="text-indigo-600 focus:ring-indigo-500 h-4 w-4">
                            <label for="is-layover" class="ml-2">This is an outbound layover flight</label>
                        </div>
                        <p class="text-xs text-gray-500 mt-1">Check if this flight has a layover at the destination</p>
                    </div>

                    <!-- Return Flight Date (only shown if layover is checked) -->
                    <div id="return-date-container" class="hidden">
                        <label for="return-date" class="block text-sm font-medium text-gray-700 mb-1">Return Flight Date</label>
                        <input type="date" id="return-date"
                            class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                    </div>

                    <!-- Return Flight Number (only shown if layover is checked) -->
                    <div id="return-flight-container" class="hidden">
                        <label for="return-flight" class="block text-sm font-medium text-gray-700 mb-1">Return Flight Number</label>
                        <input type="text" id="return-flight" placeholder="FZ124"
                            class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                        <p class="text-xs text-gray-500 mt-1">Example: FZ124</p>
                    </div>

                    <!-- Return Flight Reporting Time (only shown if layover is checked) -->
                    <div id="return-reporting-container" class="hidden">
                        <label for="return-reporting" class="block text-sm font-medium text-gray-700 mb-1">Return Flight Reporting</label>
                        <input type="text" id="return-reporting" placeholder="HH:MM"
                            class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            pattern="\\d{2}:\\d{2}">
                        <p class="text-xs text-gray-500 mt-1">Reporting time for return flight</p>
                    </div>

                    <!-- Return Flight Debriefing Time (only shown if layover is checked) -->
                    <div id="return-debriefing-container" class="hidden">
                        <label for="return-debriefing" class="block text-sm font-medium text-gray-700 mb-1">Return Flight Debriefing</label>
                        <input type="text" id="return-debriefing" placeholder="HH:MM"
                            class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            pattern="\\d{2}:\\d{2}">
                        <p class="text-xs text-gray-500 mt-1">Debriefing time for return flight</p>
                    </div>
                </div>

                <div class="flex justify-end space-x-3 mt-6">
                    <button type="button" id="cancel-manual-flight" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500">
                        Cancel
                    </button>
                    <button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        Add Duty
                    </button>
                </div>
            </form>
        </div>
    `;

    // Add event listeners
    document.getElementById('manual-flight-form').addEventListener('submit', (e) => {
        e.preventDefault();
        handleManualFlightSubmit(selectedRole);
    });

    document.getElementById('cancel-manual-flight').addEventListener('click', () => {
        hideElement('manual-flight-form-container');
    });

    // Add event listeners to duty type buttons
    const dutyTypeButtons = document.querySelectorAll('.duty-type-btn');
    dutyTypeButtons.forEach(button => {
        button.addEventListener('click', handleDutyTypeSelection);
    });

    // Hide layover checkbox since we now have a dedicated button
    const layoverContainer = document.getElementById('layover-container');
    if (layoverContainer) {
        layoverContainer.classList.add('hidden');
    }

    // Initial toggle based on default values
    toggleDutyTypeFields('turnaround');
}

// Handle duty type button selection
function handleDutyTypeSelection(event) {
    // Get the selected duty type from the button's data attribute
    const selectedDutyType = event.currentTarget.getAttribute('data-duty-type');

    // Update the hidden input with the selected value
    document.getElementById('selected-duty-type').value = selectedDutyType;

    // Update button styles
    const dutyTypeButtons = document.querySelectorAll('.duty-type-btn');
    dutyTypeButtons.forEach(button => {
        const dutyType = button.getAttribute('data-duty-type');

        if (dutyType === selectedDutyType) {
            // Selected button
            button.classList.add('bg-indigo-500', 'text-white', 'shadow-md');
            button.classList.remove('bg-gray-50', 'text-gray-700', 'border', 'border-gray-200', 'hover:bg-gray-100');
            button.setAttribute('aria-pressed', 'true');
        } else {
            // Unselected buttons
            button.classList.remove('bg-indigo-500', 'text-white', 'shadow-md');
            button.classList.add('bg-gray-50', 'text-gray-700', 'border', 'border-gray-200', 'hover:bg-gray-100');
            button.setAttribute('aria-pressed', 'false');
        }
    });

    // Toggle fields based on the selected duty type
    toggleDutyTypeFields(selectedDutyType);
}

// Toggle fields based on duty type selection
function toggleDutyTypeFields(dutyType) {
    const flightNumberContainer = document.getElementById('flight-number-container');
    const sectorContainer = document.getElementById('sector-container');
    const returnDateContainer = document.getElementById('return-date-container');
    const returnFlightContainer = document.getElementById('return-flight-container');
    const returnReportingContainer = document.getElementById('return-reporting-container');
    const returnDebriefingContainer = document.getElementById('return-debriefing-container');

    // Reset all fields first
    document.getElementById('is-layover').checked = false;

    if (dutyType === 'turnaround') {
        // Show flight number and sector fields
        flightNumberContainer.classList.remove('hidden');
        sectorContainer.classList.remove('hidden');

        // Hide layover fields
        returnDateContainer.classList.add('hidden');
        returnFlightContainer.classList.add('hidden');
        returnReportingContainer.classList.add('hidden');
        returnDebriefingContainer.classList.add('hidden');
    }
    else if (dutyType === 'layover') {
        // Show flight number and sector fields
        flightNumberContainer.classList.remove('hidden');
        sectorContainer.classList.remove('hidden');

        // Show layover fields
        returnDateContainer.classList.remove('hidden');
        returnFlightContainer.classList.remove('hidden');
        returnReportingContainer.classList.remove('hidden');
        returnDebriefingContainer.classList.remove('hidden');

        // Set layover checkbox to checked (hidden but used for processing)
        document.getElementById('is-layover').checked = true;
    }
    else if (dutyType === 'asby') {
        // Hide flight number and sector fields
        flightNumberContainer.classList.add('hidden');
        sectorContainer.classList.add('hidden');

        // Hide layover fields
        returnDateContainer.classList.add('hidden');
        returnFlightContainer.classList.add('hidden');
        returnReportingContainer.classList.add('hidden');
        returnDebriefingContainer.classList.add('hidden');
    }
}

// Toggle layover fields based on checkbox
function toggleLayoverFields() {
    const isLayover = document.getElementById('is-layover').checked;
    const returnDateContainer = document.getElementById('return-date-container');
    const returnFlightContainer = document.getElementById('return-flight-container');
    const returnReportingContainer = document.getElementById('return-reporting-container');
    const returnDebriefingContainer = document.getElementById('return-debriefing-container');

    if (isLayover) {
        returnDateContainer.classList.remove('hidden');
        returnFlightContainer.classList.remove('hidden');
        returnReportingContainer.classList.remove('hidden');
        returnDebriefingContainer.classList.remove('hidden');
    } else {
        returnDateContainer.classList.add('hidden');
        returnFlightContainer.classList.add('hidden');
        returnReportingContainer.classList.add('hidden');
        returnDebriefingContainer.classList.add('hidden');
    }
}

// Handle form submission
function handleManualFlightSubmit(selectedRole) {
    // Get form values
    const date = document.getElementById('flight-date').value;
    const dutyType = document.getElementById('selected-duty-type').value;
    const reportingTime = document.getElementById('reporting-time').value;
    const debriefingTime = document.getElementById('debriefing-time').value;

    // Validate date
    if (!date) {
        showError('Please select a date');
        return;
    }

    // Validate time format
    if (!isValidTimeFormat(reportingTime) || !isValidTimeFormat(debriefingTime)) {
        showError('Please enter valid times in HH:MM format');
        return;
    }

    // Create new calculation results object
    let newCalculationResults = {
        totalFlightHours: calculationResults.totalFlightHours,
        totalLayoverHours: calculationResults.totalLayoverHours,
        totalAsbyHours: calculationResults.totalAsbyHours,
        flightPay: calculationResults.flightPay,
        perDiem: calculationResults.perDiem,
        asbyPay: calculationResults.asbyPay,
        totalSalary: calculationResults.totalSalary
    };

    // Process based on duty type
    if (dutyType === 'asby') {
        // Process airport standby
        const startTime = parseTime(reportingTime);
        const endTime = parseTime(debriefingTime);

        if (!startTime || !endTime) {
            showError('Invalid time format');
            return;
        }

        // Calculate standby hours
        let hours = calculateHoursBetween(startTime, endTime);

        // Calculate ASBY pay
        const asbyPay = hours * SALARY_DATA[selectedRole].asbyRate;

        // Create the ASBY flight object
        const asbyFlight = {
            date: date,
            flight: 'ASBY',
            sector: 'Airport Standby',
            reporting: reportingTime,
            debriefing: debriefingTime,
            hours: hours,
            pay: asbyPay,
            isAsby: true
        };

        // Update calculation results
        newCalculationResults.totalAsbyHours += hours;
        newCalculationResults.asbyPay += asbyPay;

        // Add to flights array
        parsedFlights.push(asbyFlight);

    } else {
        // Process flight (turnaround or layover)
        const flightNumber = document.getElementById('flight-number').value;
        let sector = document.getElementById('flight-sector').value;
        const isLayover = dutyType === 'layover';

        // Ensure sector starts with DXB for outbound flights
        if (isLayover && !sector.startsWith('DXB')) {
            // Reverse the sector if it doesn't start with DXB
            const parts = sector.split(' - ');
            if (parts.length === 2) {
                sector = `DXB - ${parts[0]}`;
            }
        }

        // Validate flight number and sector
        if (!flightNumber) {
            showError('Please enter a flight number');
            return;
        }

        if (!sector) {
            showError('Please enter a sector');
            return;
        }

        // Calculate flight hours
        const startTime = parseTime(reportingTime);
        const endTime = parseTime(debriefingTime);

        if (!startTime || !endTime) {
            showError('Invalid time format');
            return;
        }

        // Calculate flight hours (minus 30 minutes for debriefing)
        let hours = calculateHoursBetween(startTime, endTime) - 0.5;

        // Calculate flight pay
        const flightPay = hours * SALARY_DATA[selectedRole].flightPayRate;

        // Create the flight object
        const flight = {
            date: date,
            flight: flightNumber,
            sector: sector,
            reporting: reportingTime,
            debriefing: debriefingTime,
            hours: hours,
            pay: flightPay,
            isOutbound: true
        };

        // Update calculation results
        newCalculationResults.totalFlightHours += hours;
        newCalculationResults.flightPay += flightPay;

        // Process layover if applicable
        if (isLayover) {
            const returnDate = document.getElementById('return-date').value;
            const returnFlight = document.getElementById('return-flight').value;
            const returnReporting = document.getElementById('return-reporting').value;
            const returnDebriefing = document.getElementById('return-debriefing').value;

            // Validate return flight details
            if (!returnDate || !returnFlight ||
                !isValidTimeFormat(returnReporting) || !isValidTimeFormat(returnDebriefing)) {
                showError('Please enter valid return flight details');
                return;
            }

            // Mark outbound flight as layover
            flight.isLayover = true;
            flight.isOutbound = true;

            // Extract destination from sector
            const destination = sector.split(' - ')[1];

            // Format the return date to match the outbound date format
            let formattedReturnDate = returnDate;
            if (returnDate.includes('-')) {
                // Keep the original format for internal processing
                formattedReturnDate = returnDate;
            }

            // Create return flight object
            const returnHours = calculateHoursBetween(parseTime(returnReporting), parseTime(returnDebriefing)) - 0.5;
            const returnPay = returnHours * SALARY_DATA[selectedRole].flightPayRate;

            const returnFlightObj = {
                date: formattedReturnDate,
                flight: returnFlight,
                sector: `${destination} - DXB`,
                reporting: returnReporting,
                debriefing: returnDebriefing,
                hours: returnHours,
                pay: returnPay,
                isLayover: true,
                isOutbound: false
            };

            // Calculate layover hours and per diem
            const restHours = calculateLayoverHours(
                flight.date,
                flight.debriefing,
                returnFlightObj.date,
                returnFlightObj.reporting
            );

            // Update calculation results for layover
            newCalculationResults.totalLayoverHours += restHours;
            newCalculationResults.perDiem += restHours * SALARY_DATA[selectedRole].perDiemRate;

            // Update calculation results for return flight
            newCalculationResults.totalFlightHours += returnFlightObj.hours;
            newCalculationResults.flightPay += returnFlightObj.pay;

            // Add flights to array - we'll sort them later
            parsedFlights.push(returnFlightObj);
        }

        // Add outbound flight to flights array
        parsedFlights.push(flight);

        // Sort the flights to ensure outbound flights always come first
        parsedFlights.sort((a, b) => {
            // First sort by date
            if (a.date !== b.date) {
                // Convert dates to comparable format
                const dateA = new Date(a.date.replace(/\//g, '-'));
                const dateB = new Date(b.date.replace(/\//g, '-'));
                return dateA - dateB;
            }

            // If both flights are part of a layover
            if (a.isLayover && b.isLayover) {
                // Outbound flights (DXB to destination) should come first
                if (a.sector.startsWith('DXB') && !b.sector.startsWith('DXB')) return -1;
                if (!a.sector.startsWith('DXB') && b.sector.startsWith('DXB')) return 1;
            }

            // If same date and not distinguished by layover status, sort by reporting time
            return parseTime(a.reporting) - parseTime(b.reporting);
        });
    }

    // Calculate total salary
    newCalculationResults.totalSalary =
        SALARY_DATA[selectedRole].basicSalary +
        SALARY_DATA[selectedRole].housingAllowance +
        SALARY_DATA[selectedRole].transportationAllowance +
        newCalculationResults.flightPay +
        newCalculationResults.perDiem +
        newCalculationResults.asbyPay;

    // Update current month key
    currentMonthKey = `${rosterMonth}-${rosterYear}`;

    // Save to multi-month data
    addMonthData(rosterMonth, rosterYear, parsedFlights, newCalculationResults);

    // Update global calculation results
    calculationResults = newCalculationResults;

    // Extract month and year from the date (format: YYYY-MM-DD)
    const dateParts = date.split('-');
    if (dateParts.length === 3) {
        const monthNumber = parseInt(dateParts[1], 10);
        rosterMonth = getMonthName(monthNumber);
        rosterYear = dateParts[0];

        // Also update the global date format for consistency
        const dateObj = new Date(dateParts[0], monthNumber-1, dateParts[2]);
        const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dateObj.getDay()];
        // This is just for display - we keep the original format for internal processing
    }

    // Hide the form
    hideElement('manual-flight-form-container');

    // Ensure salary breakdown is expanded
    salaryBreakdownExpanded = true;

    // Show success message
    showSuccess('Duty added successfully!');

    // Show results container if it's hidden
    showElement('results-container');

    // Re-render results
    renderResults();

    // Scroll to results
    document.getElementById('results-container').scrollIntoView({ behavior: 'smooth' });
}

// Validate date format (DD/MM/YYYY)
function isValidDateFormat(dateStr) {
    const regex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!regex.test(dateStr)) return false;

    const parts = dateStr.split('/');
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);

    // Check if date is valid
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    if ((month === 4 || month === 6 || month === 9 || month === 11) && day > 30) return false;
    if (month === 2) {
        const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
        if (day > (isLeapYear ? 29 : 28)) return false;
    }

    return true;
}

// Validate time format (HH:MM)
function isValidTimeFormat(timeStr) {
    const regex = /^\d{2}:\d{2}$/;
    if (!regex.test(timeStr)) return false;

    const parts = timeStr.split(':');
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);

    if (hours < 0 || hours > 23) return false;
    if (minutes < 0 || minutes > 59) return false;

    return true;
}
