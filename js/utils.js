// Utility functions

// Time parsing helper
function parseTime(timeStr) {
    if (!timeStr) return null;

    // Make a copy of the original time string
    let cleanTimeStr = String(timeStr);

    // Remove any leading 'A' character (indicating actual time)
    if (cleanTimeStr.charAt(0) === 'A') {
        cleanTimeStr = cleanTimeStr.substring(1);
    }

    // Remove any special characters that might appear in the time
    cleanTimeStr = cleanTimeStr.replace(/[^0-9:]/g, '');

    // Handle cases where the colon might be missing
    if (cleanTimeStr.length === 4 && !cleanTimeStr.includes(':')) {
        cleanTimeStr = cleanTimeStr.substring(0, 2) + ':' + cleanTimeStr.substring(2);
    }

    const parts = cleanTimeStr.split(':');
    if (parts.length !== 2) return null;

    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);

    if (isNaN(hours) || isNaN(minutes) || hours > 23 || minutes > 59) return null;

    return hours + (minutes / 60);
}

// Calculate hours between two time points
function calculateHoursBetween(startTime, endTime) {
    if (endTime < startTime) {
        // Handle times that cross midnight
        return (24 - startTime) + endTime;
    } else {
        return endTime - startTime;
    }
}

// Get the month number from a date string (format: DD/MM/YYYY)
function getMonthNumberFromDate(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') return null;

    // Try to extract the month from the date string
    const dateParts = dateStr.split('/');
    if (dateParts.length === 3) {
        return parseInt(dateParts[1], 10); // Month is the second part in DD/MM/YYYY
    }
    return null;
}

// Get month name from month number (1-based)
function getMonthName(monthNumber) {
    return MONTHS[monthNumber - 1] || '';
}

// Get the next month name
function getNextMonth(currentMonth) {
    const currentIndex = MONTHS.indexOf(currentMonth);
    if (currentIndex === -1) return '';

    // Return the next month, wrapping around to January if needed
    return MONTHS[(currentIndex + 1) % 12];
}

// Get the year for the next month (handles December -> January transition)
function getNextMonthYear(currentMonth, currentYear) {
    // Convert year to number if it's a string
    currentYear = parseInt(currentYear, 10);

    // If December, the next month is in the next year
    if (currentMonth === 'December') {
        return (currentYear + 1).toString();
    }

    return currentYear.toString();
}

// Helper function to convert decimal hours to HH:MM format
function formatHoursMinutes(decimalHours) {
    const hours = Math.floor(decimalHours);
    const minutes = Math.round((decimalHours - hours) * 60);
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
}

// Clean special characters from CSV data
function cleanSpecialCharacters(data) {
    // Create a new array to hold the cleaned data
    const cleanedData = [];

    // Process each row
    for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const cleanedRow = [];

        // Process each cell in the row
        for (let j = 0; j < row.length; j++) {
            if (row[j] === null || row[j] === undefined) {
                cleanedRow.push('');
                continue;
            }

            // Convert to string and clean special characters
            let cleanedCell = String(row[j])
                // Replace common problematic characters
                .replace(/[��?�]/g, '')
                // Replace multiple spaces with a single space
                .replace(/\s+/g, ' ')
                // Trim whitespace
                .trim();

            cleanedRow.push(cleanedCell);
        }

        cleanedData.push(cleanedRow);
    }

    return cleanedData;
}

// Function to calculate layover hours between two date-time points
function calculateLayoverHours(outboundDate, outboundDebriefTime, returnDate, returnReportTime) {
    // Convert dates to standard format for calculation
    let outboundDateTime, returnDateTime;

    // Parse outbound date
    try {
        if (outboundDate.includes('/')) {
            // Format: DD/MM/YYYY
            const parts = outboundDate.split('/');
            if (parts.length === 3) {
                const day = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10) - 1; // JS months are 0-indexed
                const year = parseInt(parts[2], 10);
                outboundDateTime = new Date(year, month, day);
            }
        } else if (outboundDate.includes('-')) {
            // Format: YYYY-MM-DD
            const parts = outboundDate.split('-');
            if (parts.length === 3) {
                const year = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10) - 1; // JS months are 0-indexed
                const day = parseInt(parts[2], 10);
                outboundDateTime = new Date(year, month, day);
            }
        }

        if (!outboundDateTime || isNaN(outboundDateTime.getTime())) {
            return 0;
        }
    } catch (e) {
        return 0;
    }

    // Parse return date
    try {
        if (returnDate.includes('/')) {
            // Format: DD/MM/YYYY
            const parts = returnDate.split('/');
            if (parts.length === 3) {
                const day = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10) - 1;
                const year = parseInt(parts[2], 10);
                returnDateTime = new Date(year, month, day);
            }
        } else if (returnDate.includes('-')) {
            // Format: YYYY-MM-DD
            const parts = returnDate.split('-');
            if (parts.length === 3) {
                const year = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10) - 1;
                const day = parseInt(parts[2], 10);
                returnDateTime = new Date(year, month, day);
            }
        }

        if (!returnDateTime || isNaN(returnDateTime.getTime())) {
            return 0;
        }
    } catch (e) {
        return 0;
    }

    // Parse times
    const outboundTime = parseTime(outboundDebriefTime);
    const returnTime = parseTime(returnReportTime);

    if (!outboundTime || !returnTime) {
        return 0;
    }

    // Adjust outbound date if debriefing is after midnight
    // If debriefing time is between 00:00 and 12:00, it's likely the next day
    if (outboundTime < 12) {
        outboundDateTime.setDate(outboundDateTime.getDate() + 1);
    }

    // Set hours and minutes for outbound date
    outboundDateTime.setHours(Math.floor(outboundTime));
    outboundDateTime.setMinutes(Math.round((outboundTime - Math.floor(outboundTime)) * 60));

    // Set hours and minutes for return date
    returnDateTime.setHours(Math.floor(returnTime));
    returnDateTime.setMinutes(Math.round((returnTime - Math.floor(returnTime)) * 60));

    // Calculate difference in milliseconds and convert to hours
    const diffInMilliseconds = returnDateTime - outboundDateTime;
    const hours = Math.max(0, diffInMilliseconds / (1000 * 60 * 60));

    return hours;
}

// Helper function to format currency
function formatCurrency(amount) {
    return 'AED ' + parseFloat(amount).toFixed(2);
}

// Helper function to show an element
function showElement(elementId) {
    document.getElementById(elementId).classList.remove('hidden');
}

// Helper function to hide an element
function hideElement(elementId) {
    document.getElementById(elementId).classList.add('hidden');
}

// Helper function to create an HTML element with classes
function createElement(tag, classNames = '', content = '') {
    const element = document.createElement(tag);
    if (classNames) {
        element.className = classNames;
    }
    if (content) {
        element.innerHTML = content;
    }
    return element;
}
