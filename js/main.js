// Main Application Logic

// Application state
let selectedRole = null;
let parsedFlights = [];
let editingFlightIndex = null;
let editedDebriefTime = '';
let excludedFlights = 0;
let deleteConfirmation = {
    show: false,
    flightIndex: null
};
let monthlySummaryExpanded = true;
let salaryBreakdownExpanded = true; // Always show salary breakdown by default
let calculationResults = {
    totalFlightHours: 0,
    totalLayoverHours: 0,
    totalAsbyHours: 0,
    flightPay: 0,
    perDiem: 0,
    asbyPay: 0,
    totalSalary: 0
};
let rosterMonth = '';
let rosterYear = '';

// Function to sort flights - ensures outbound flights always come first
function sortFlights() {
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

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Add event listeners to role selection buttons
    document.getElementById('ccm-button').addEventListener('click', () => handleRoleSelect('CCM'));
    document.getElementById('sccm-button').addEventListener('click', () => handleRoleSelect('SCCM'));

    // Add event listener to file upload
    document.getElementById('csv-upload').addEventListener('change', handleFileUpload);

    // Add event listener to the Add Flight button
    document.getElementById('add-flight-btn').addEventListener('click', handleAddFlightClick);

    // Add accessibility support for keyboard users on the file upload label
    const uploadLabel = document.querySelector('label[for="csv-upload"]');
    if (uploadLabel) {
        uploadLabel.addEventListener('keydown', function(e) {
            // Trigger click on Enter or Space
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                document.getElementById('csv-upload').click();
            }
        });
    }

    // Setup drag and drop for file upload
    const dropArea = document.querySelector('label[for="csv-upload"]');

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });

    function highlight() {
        dropArea.classList.add('drag-over');
        dropArea.setAttribute('aria-live', 'polite');
        dropArea.setAttribute('aria-label', 'Drop your file to upload');
    }

    function unhighlight() {
        dropArea.classList.remove('drag-over');
        dropArea.setAttribute('aria-label', 'Upload CSV file');
    }

    dropArea.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;

        if (files.length > 0) {
            document.getElementById('csv-upload').files = files;
            handleFileUpload({ target: { files: files } });
        }
    }
});

// Handle role selection
function handleRoleSelect(role) {
    selectedRole = role;

    // Update UI - highlight selected button
    const ccmButton = document.getElementById('ccm-button');
    const sccmButton = document.getElementById('sccm-button');

    if (role === 'CCM') {
        ccmButton.classList.add('bg-indigo-500', 'text-white', 'shadow-md');
        ccmButton.classList.remove('bg-gray-50', 'text-gray-700', 'border', 'border-gray-200', 'hover:bg-gray-100');
        ccmButton.setAttribute('aria-pressed', 'true');

        sccmButton.classList.remove('bg-indigo-500', 'text-white', 'shadow-md');
        sccmButton.classList.add('bg-gray-50', 'text-gray-700', 'border', 'border-gray-200', 'hover:bg-gray-100');
        sccmButton.setAttribute('aria-pressed', 'false');
    } else {
        sccmButton.classList.add('bg-indigo-500', 'text-white', 'shadow-md');
        sccmButton.classList.remove('bg-gray-50', 'text-gray-700', 'border', 'border-gray-200', 'hover:bg-gray-100');
        sccmButton.setAttribute('aria-pressed', 'true');

        ccmButton.classList.remove('bg-indigo-500', 'text-white', 'shadow-md');
        ccmButton.classList.add('bg-gray-50', 'text-gray-700', 'border', 'border-gray-200', 'hover:bg-gray-100');
        ccmButton.setAttribute('aria-pressed', 'false');
    }

    // Show file upload section with animation
    document.getElementById('role-selector').classList.remove('border-t-4', 'border-indigo-500');
    const fileUpload = document.getElementById('file-upload');
    fileUpload.classList.remove('hidden');

    // Hide results if showing
    hideElement('results-container');

    // Clear any error or success messages
    hideElement('error-container');
    hideElement('success-container');
}

// Handle file upload
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        // Show loading indicator
        showElement('loading-indicator');

        // Hide error container if visible
        hideElement('error-container');

        // Hide results if showing
        hideElement('results-container');

        Papa.parse(file, {
            header: false,
            skipEmptyLines: true,
            encoding: "UTF-8",
            complete: function(results) {
                try {
                    // Hide loading indicator
                    hideElement('loading-indicator');

                    // Check if we have valid data
                    if (!results.data || results.data.length === 0) {
                        showError('No data found in the CSV file. Please check the file format.');
                        return;
                    }

                    // Clean special characters from parsed data
                    const cleanData = cleanSpecialCharacters(results.data);

                    // Process the roster data
                    const {
                        newParsedFlights,
                        newCalculationResults,
                        newRosterMonth,
                        newRosterYear,
                        excludedFlightsCount
                    } = processRosterData(cleanData, selectedRole);

                    // Check if we have any flights parsed
                    if (newParsedFlights.length === 0) {
                        showError('No flight duties found in the roster. Please check that the file contains valid flight data.');
                        return;
                    }

                    // Check for conflicts with existing manually added flights
                    let existingFlights = [...parsedFlights];
                    let conflictFound = false;
                    let mergedFlights = [];

                    // If we already have flights, check for conflicts
                    if (existingFlights.length > 0) {
                        // Check each new flight against existing flights for conflicts
                        for (const newFlight of newParsedFlights) {
                            let hasConflict = false;

                            // A conflict is defined as the same date with overlapping times
                            for (const existingFlight of existingFlights) {
                                if (newFlight.date === existingFlight.date) {
                                    // Check if reporting times overlap
                                    const newReportTime = parseTime(newFlight.reporting);
                                    const newDebriefTime = parseTime(newFlight.debriefing);
                                    const existingReportTime = parseTime(existingFlight.reporting);
                                    const existingDebriefTime = parseTime(existingFlight.debriefing);

                                    // If any of the times overlap, we have a conflict
                                    if (newReportTime && newDebriefTime && existingReportTime && existingDebriefTime) {
                                        if ((newReportTime <= existingDebriefTime && newDebriefTime >= existingReportTime)) {
                                            hasConflict = true;
                                            conflictFound = true;
                                            break;
                                        }
                                    }
                                }
                            }

                            // If no conflict, add to merged flights
                            if (!hasConflict) {
                                mergedFlights.push(newFlight);
                            }
                        }

                        // Add all existing flights to merged flights
                        mergedFlights = [...mergedFlights, ...existingFlights];

                        // If conflicts were found, show a warning
                        if (conflictFound) {
                            showSuccess('Roster uploaded successfully, but some flights were skipped due to conflicts with manually added flights.');
                        } else {
                            showSuccess('Roster uploaded successfully and merged with existing flights.');
                        }
                    } else {
                        // No existing flights, just use the new flights
                        mergedFlights = newParsedFlights;
                        showSuccess('Roster data processed successfully!');
                    }

                    // Update application state
                    parsedFlights = mergedFlights;

                    // Recalculate totals
                    let newTotalCalculationResults = {
                        totalFlightHours: 0,
                        totalLayoverHours: 0,
                        totalAsbyHours: 0,
                        flightPay: 0,
                        perDiem: 0,
                        asbyPay: 0,
                        totalSalary: 0
                    };

                    // First calculate basic flight and standby hours
                    parsedFlights.forEach(f => {
                        if (f.isAsby) {
                            newTotalCalculationResults.totalAsbyHours += f.hours;
                            newTotalCalculationResults.asbyPay += f.pay;
                        } else {
                            newTotalCalculationResults.totalFlightHours += f.hours;
                            newTotalCalculationResults.flightPay += f.pay;
                        }
                    });

                    // Then recalculate all layovers
                    for (let i = 0; i < parsedFlights.length; i++) {
                        const outboundFlight = parsedFlights[i];

                        // Skip if this is not an outbound layover
                        if (!outboundFlight.isLayover || !outboundFlight.isOutbound) continue;

                        // Extract the destination
                        const destination = outboundFlight.sector.split(' - ')[1];

                        // Look for the corresponding inbound flight
                        for (let j = i + 1; j < parsedFlights.length; j++) {
                            const returnFlight = parsedFlights[j];

                            // Skip if this is not an inbound layover
                            if (!returnFlight.isLayover || returnFlight.isOutbound) continue;

                            // Check if this is the matching return flight
                            const expectedReturnSector = `${destination} - DXB`;
                            if (returnFlight.sector === expectedReturnSector) {
                                // We've found a layover pair - calculate per diem
                                const restHours = calculateLayoverHours(
                                    outboundFlight.date,
                                    outboundFlight.debriefing,
                                    returnFlight.date,
                                    returnFlight.reporting
                                );

                                newTotalCalculationResults.totalLayoverHours += restHours;
                                newTotalCalculationResults.perDiem += restHours * SALARY_DATA[selectedRole].perDiemRate;

                                break;
                            }
                        }
                    }

                    // Calculate total salary
                    newTotalCalculationResults.totalSalary =
                        SALARY_DATA[selectedRole].basicSalary +
                        SALARY_DATA[selectedRole].housingAllowance +
                        SALARY_DATA[selectedRole].transportationAllowance +
                        newTotalCalculationResults.flightPay +
                        newTotalCalculationResults.perDiem +
                        newTotalCalculationResults.asbyPay;

                    // Update calculation results
                    calculationResults = newTotalCalculationResults;

                    // Update roster month and year if not already set
                    if (!rosterMonth || !rosterYear) {
                        rosterMonth = newRosterMonth;
                        rosterYear = newRosterYear;
                    }

                    excludedFlights = excludedFlightsCount;

                    // Ensure dropdowns are in correct state
                    monthlySummaryExpanded = true;
                    salaryBreakdownExpanded = true; // Always show salary breakdown

                    // Show success message
                    showSuccess('Roster data processed successfully!');

                    // Show results
                    renderResults();
                    showElement('results-container');

                    // Scroll to results
                    document.getElementById('results-container').scrollIntoView({ behavior: 'smooth' });

                } catch (err) {
                    console.error('Error processing CSV data:', err);
                    showError('Error processing roster data: ' + err.message);
                }
            },
            error: function(error) {
                // Hide loading indicator
                hideElement('loading-indicator');

                console.error('Error parsing CSV:', error);
                showError('Error parsing CSV file: ' + error.message);
            }
        });
    }
}

// Handle edit debriefing time
function handleEditDebriefTime(index) {
    editingFlightIndex = index;
    editedDebriefTime = parsedFlights[index].debriefing;
    renderFlightDetailsTable(parsedFlights, editingFlightIndex, editedDebriefTime);
}

// Save edited debriefing time
function handleSaveDebriefTime() {
    if (editingFlightIndex === null) return;

    // Get the input value from the DOM
    const inputValue = document.getElementById('edit-debrief-input').value;

    // Create a copy of the flights array
    const updatedFlights = [...parsedFlights];
    const flight = updatedFlights[editingFlightIndex];

    // Update the debriefing time
    flight.debriefing = inputValue;

    // Recalculate flight hours and pay
    const startTime = parseTime(flight.reporting);
    const endTime = parseTime(inputValue);

    if (startTime && endTime) {
        // Calculate flight hours (minus 30 minutes for debriefing)
        let hours = calculateHoursBetween(startTime, endTime) - 0.5;

        // Update the flight
        flight.hours = hours;
        flight.pay = hours * SALARY_DATA[selectedRole].flightPayRate;

        // Update the flights array
        updatedFlights[editingFlightIndex] = flight;
        parsedFlights = updatedFlights;

        // Recalculate totals
        let totalFlightHours = 0;
        let totalFlightPay = 0;

        updatedFlights.forEach(f => {
            totalFlightHours += f.hours;
            totalFlightPay += f.pay;
        });

        // Update calculation results
        calculationResults = {
            ...calculationResults,
            totalFlightHours: totalFlightHours,
            flightPay: totalFlightPay,
            totalSalary: SALARY_DATA[selectedRole].basicSalary +
                        SALARY_DATA[selectedRole].housingAllowance +
                        SALARY_DATA[selectedRole].transportationAllowance +
                        totalFlightPay +
                        calculationResults.perDiem +
                        calculationResults.asbyPay
        };
    }

    // Reset editing state
    editingFlightIndex = null;
    editedDebriefTime = '';

    // Re-render the results
    renderResults();
}

// Cancel editing
function handleCancelEdit() {
    editingFlightIndex = null;
    editedDebriefTime = '';
    renderFlightDetailsTable(parsedFlights, editingFlightIndex, editedDebriefTime);
}

// Show delete confirmation dialog
function handleShowDeleteConfirmation(index) {
    deleteConfirmation = {
        show: true,
        flightIndex: index
    };
    renderDeleteConfirmation(deleteConfirmation, parsedFlights);
}

// Cancel deletion
function handleCancelDelete() {
    deleteConfirmation = {
        show: false,
        flightIndex: null
    };
    renderDeleteConfirmation(deleteConfirmation, parsedFlights);
}

// Confirm and perform deletion
function handleConfirmDelete() {
    if (deleteConfirmation.flightIndex === null) return;

    // Get the flight being deleted
    const flightToDelete = parsedFlights[deleteConfirmation.flightIndex];

    // Create a copy of the flights array
    let updatedFlights = [...parsedFlights];
    let indicesToRemove = [deleteConfirmation.flightIndex];

    // If this is an outbound layover flight, find and remove its inbound pair
    if (flightToDelete.isLayover && flightToDelete.isOutbound) {
        // Extract the destination from the outbound flight sector
        const outboundSector = flightToDelete.sector || '';
        let destination = '';
        if (outboundSector.startsWith('DXB - ')) {
            destination = outboundSector.split(' - ')[1];
        }

        // Find the corresponding inbound flight
        if (destination) {
            const expectedReturnSector = `${destination} - DXB`;

            // Find the index of the matching inbound flight
            const inboundIndex = updatedFlights.findIndex((flight, index) =>
                index !== deleteConfirmation.flightIndex && // Not the same flight
                flight.isLayover && // Is a layover
                !flight.isOutbound && // Is inbound
                flight.sector === expectedReturnSector // Matches the expected return sector
            );

            // If found, add to list of flights to remove
            if (inboundIndex !== -1) {
                indicesToRemove.push(inboundIndex);
            }
        }
    }

    // Remove all flights in indices to remove
    updatedFlights = updatedFlights.filter((_, index) => !indicesToRemove.includes(index));

    // Update state
    parsedFlights = updatedFlights;

    // Recalculate totals
    let totalFlightHours = 0;
    let totalFlightPay = 0;
    let totalAsbyHours = 0;
    let totalAsbyPay = 0;

    // For layovers, we need to completely recalculate
    let newCalculationResults = {
        totalFlightHours: 0,
        totalLayoverHours: 0,
        totalAsbyHours: 0,
        flightPay: 0,
        perDiem: 0,
        asbyPay: 0
    };

    // First calculate basic flight and standby hours
    updatedFlights.forEach(f => {
        if (f.isAsby) {
            newCalculationResults.totalAsbyHours += f.hours;
            newCalculationResults.asbyPay += f.pay;
        } else {
            newCalculationResults.totalFlightHours += f.hours;
            newCalculationResults.flightPay += f.pay;
        }
    });

    // Then recalculate all layovers
    for (let i = 0; i < updatedFlights.length; i++) {
        const outboundFlight = updatedFlights[i];

        // Skip if this is not an outbound layover
        if (!outboundFlight.isLayover || !outboundFlight.isOutbound) continue;

        // Extract the destination
        const destination = outboundFlight.sector.split(' - ')[1];

        // Look for the corresponding inbound flight
        for (let j = i + 1; j < updatedFlights.length; j++) {
            const returnFlight = updatedFlights[j];

            // Skip if this is not an inbound layover
            if (!returnFlight.isLayover || returnFlight.isOutbound) continue;

            // Check if this is the matching return flight
            const expectedReturnSector = `${destination} - DXB`;
            if (returnFlight.sector === expectedReturnSector) {
                // We've found a layover pair - calculate per diem
                const restHours = calculateLayoverHours(
                    outboundFlight.date,
                    outboundFlight.debriefing,
                    returnFlight.date,
                    returnFlight.reporting
                );

                newCalculationResults.totalLayoverHours += restHours;
                newCalculationResults.perDiem += restHours * SALARY_DATA[selectedRole].perDiemRate;

                break;
            }
        }
    }

    // Calculate total salary
    newCalculationResults.totalSalary = SALARY_DATA[selectedRole].basicSalary +
                                       SALARY_DATA[selectedRole].housingAllowance +
                                       SALARY_DATA[selectedRole].transportationAllowance +
                                       newCalculationResults.flightPay +
                                       newCalculationResults.perDiem +
                                       newCalculationResults.asbyPay;

    // Update calculation results
    calculationResults = newCalculationResults;

    // Reset confirmation dialog
    deleteConfirmation = {
        show: false,
        flightIndex: null
    };

    // Re-render the results
    renderResults();
    renderDeleteConfirmation(deleteConfirmation, parsedFlights);
}

// Show error message
function showError(message) {
    // Hide success message if visible
    hideElement('success-container');

    const errorContainer = document.getElementById('error-container');
    const errorMessage = document.getElementById('error-message');

    errorMessage.textContent = message;
    errorContainer.classList.remove('hidden');
    errorContainer.classList.add('message-animation');

    // Set focus to the error message for screen readers
    errorContainer.setAttribute('tabindex', '-1');
    errorContainer.focus();

    // Remove animation class after animation completes
    setTimeout(() => {
        errorContainer.classList.remove('message-animation');
    }, 500);
}

// Show success message
function showSuccess(message) {
    // Hide error message if visible
    hideElement('error-container');

    const successContainer = document.getElementById('success-container');
    const successMessage = document.getElementById('success-message');

    successMessage.textContent = message;
    successContainer.classList.remove('hidden');
    successContainer.classList.add('message-animation');

    // Set focus to the success message for screen readers
    successContainer.setAttribute('tabindex', '-1');
    successContainer.focus();

    // Remove animation class after animation completes
    setTimeout(() => {
        successContainer.classList.remove('message-animation');
    }, 500);

    // Hide success message after 5 seconds
    setTimeout(() => {
        hideElement('success-container');
    }, 5000);
}

// Render all results
function renderResults() {
    // Sort flights to ensure correct order (outbound flights first)
    sortFlights();

    // Render monthly summary
    renderMonthlySummary(selectedRole, rosterMonth, rosterYear, calculationResults, monthlySummaryExpanded);

    // Render salary breakdown
    renderSalaryBreakdown(selectedRole, calculationResults, salaryBreakdownExpanded);

    // Render flight details table
    renderFlightDetailsTable(parsedFlights, editingFlightIndex, editedDebriefTime);

    // Update flight count
    document.getElementById('flight-count').textContent = `${parsedFlights.length} flights`;
}

// Handle Add Flight button click
function handleAddFlightClick() {
    // Check if a role is selected
    if (!selectedRole) {
        showError('Please select a role (CCM or SCCM) first');
        return;
    }

    // Hide any error or success messages
    hideElement('error-container');
    hideElement('success-container');

    // Initialize month and year if not set
    if (!rosterMonth || !rosterYear) {
        const today = new Date();
        rosterMonth = MONTHS[today.getMonth()];
        rosterYear = today.getFullYear().toString();
    }

    // Show the manual flight entry form
    renderManualFlightEntryForm(true, selectedRole);

    // Scroll to the form
    document.getElementById('manual-flight-form-container').scrollIntoView({ behavior: 'smooth' });
}
