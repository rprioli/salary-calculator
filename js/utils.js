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

// Get the month number from a date string (supports multiple formats)
function getMonthNumberFromDate(dateStr) {
    console.log('getMonthNumberFromDate called with:', dateStr);

    if (!dateStr || typeof dateStr !== 'string') {
        console.error('Invalid date string:', dateStr);
        return null;
    }

    // Clean the date string
    const cleanDateStr = dateStr.trim();
    console.log('Cleaned date string:', cleanDateStr);

    // Try DD/MM/YYYY format (standard flydubai format)
    const ddmmyyyyRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+\w+)?$/;
    const ddmmyyyyMatch = cleanDateStr.match(ddmmyyyyRegex);

    if (ddmmyyyyMatch) {
        const monthNumber = parseInt(ddmmyyyyMatch[2], 10);
        console.log('Extracted month number from DD/MM/YYYY format:', monthNumber);
        return monthNumber;
    }

    // Try MM/DD/YYYY format - we need to be smarter about distinguishing between DD/MM and MM/DD
    // If we get here, we didn't match DD/MM/YYYY, so let's try to determine if it's MM/DD/YYYY
    // by checking if the first number is a valid month (1-12) and the second number is a valid day (1-31)
    const dateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+\w+)?$/;
    const dateMatch = cleanDateStr.match(dateRegex);

    if (dateMatch) {
        const firstNumber = parseInt(dateMatch[1], 10);
        const secondNumber = parseInt(dateMatch[2], 10);

        // If the first number is a valid month (1-12) and the second number is > 12,
        // it's likely MM/DD/YYYY format
        if (firstNumber >= 1 && firstNumber <= 12 && secondNumber > 12 && secondNumber <= 31) {
            console.log('Detected MM/DD/YYYY format based on values');
            console.log('Extracted month number from MM/DD/YYYY format:', firstNumber);
            return firstNumber;
        }

        // If we can't determine for sure, assume DD/MM/YYYY as that's more common internationally
        if (secondNumber >= 1 && secondNumber <= 12) {
            console.log('Assuming DD/MM/YYYY format as fallback');
            console.log('Extracted month number from assumed DD/MM/YYYY format:', secondNumber);
            return secondNumber;
        }
    }

    // Try YYYY-MM-DD format
    const yyyymmddRegex = /^(\d{4})-(\d{1,2})-(\d{1,2})(?:\s+\w+)?$/;
    const yyyymmddMatch = cleanDateStr.match(yyyymmddRegex);

    if (yyyymmddMatch) {
        const monthNumber = parseInt(yyyymmddMatch[2], 10);
        console.log('Extracted month number from YYYY-MM-DD format:', monthNumber);
        return monthNumber;
    }

    // Try to extract date from a string that might contain a date
    // This is a more aggressive approach for when the format is unknown
    const anyDateRegex = /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/;
    const anyDateMatch = cleanDateStr.match(anyDateRegex);

    if (anyDateMatch) {
        // Assume the second group is the month (most common in DD/MM/YYYY and YYYY-MM-DD)
        // If the third group is a 4-digit year, then the second group is likely the month
        // If the third group is a 2-digit year, we need to check the values to make a best guess

        const firstNumber = parseInt(anyDateMatch[1], 10);
        const secondNumber = parseInt(anyDateMatch[2], 10);
        const thirdNumber = parseInt(anyDateMatch[3], 10);

        // If the third number is a 4-digit year
        if (thirdNumber > 1000) {
            // Assume DD/MM/YYYY format
            if (secondNumber >= 1 && secondNumber <= 12) {
                console.log('Extracted month number from generic date format (assuming DD/MM/YYYY):', secondNumber);
                return secondNumber;
            }
        }

        // If the first number could be a month (1-12)
        if (firstNumber >= 1 && firstNumber <= 12) {
            console.log('Extracted month number from generic date format (assuming MM/DD/YYYY):', firstNumber);
            return firstNumber;
        }

        // If the second number could be a month (1-12)
        if (secondNumber >= 1 && secondNumber <= 12) {
            console.log('Extracted month number from generic date format (assuming DD/MM/YYYY):', secondNumber);
            return secondNumber;
        }
    }

    // If we get here, we couldn't extract a month
    console.error('Could not extract month from date string:', dateStr);

    // As a last resort, use the current month
    const currentMonth = new Date().getMonth() + 1; // JavaScript months are 0-indexed
    console.log('Using current month as fallback:', currentMonth);
    return currentMonth;
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
