// Data processing functions

// Process airport standby duties
function processAirportStandby(date, actualTimes, newCalculationResults, newParsedFlights, selectedRole) {
    if (!actualTimes) return { newCalculationResults, newParsedFlights };

    // Clean the time string
    const cleanActualTimes = actualTimes.replace(/[��?�]/g, '').trim();

    // Parse the standby times (format: "HH:MM - HH:MM")
    const timeRange = cleanActualTimes.split(' - ');
    if (timeRange.length !== 2) return { newCalculationResults, newParsedFlights };

    const startTime = parseTime(timeRange[0]);
    const endTime = parseTime(timeRange[1]);

    if (!startTime || !endTime) return { newCalculationResults, newParsedFlights };

    // Calculate standby hours
    let hours = calculateHoursBetween(startTime, endTime);

    // Update total ASBY hours
    newCalculationResults.totalAsbyHours += hours;

    // Calculate ASBY pay (no 30-minute deduction for ASBY)
    const asbyPay = hours * SALARY_DATA[selectedRole].asbyRate;
    newCalculationResults.asbyPay += asbyPay;

    // Add to parsed flights list to display in the table
    newParsedFlights.push({
        date: date,
        flight: 'ASBY',
        sector: 'Airport Standby',
        reporting: timeRange[0].trim(),
        debriefing: timeRange[1].trim(),
        hours: hours,
        pay: asbyPay,
        isAsby: true
    });

    return { newCalculationResults, newParsedFlights };
}

// Function to calculate per diem specifically for layover duties
function calculatePerDiem(outboundFlight, returnFlight, newCalculationResults, selectedRole) {
    if (!outboundFlight || !returnFlight) return newCalculationResults;
    if (!outboundFlight.date || !outboundFlight.debriefing || !returnFlight.date || !returnFlight.reporting)
        return newCalculationResults;

    // Calculate rest hours using the function that accounts for multiple days
    const restHours = calculateLayoverHours(
        outboundFlight.date,
        outboundFlight.debriefing,
        returnFlight.date,
        returnFlight.reporting
    );

    // Add to totals
    newCalculationResults.totalLayoverHours += restHours;
    newCalculationResults.perDiem += restHours * SALARY_DATA[selectedRole].perDiemRate;

    return newCalculationResults;
}

// Process flight duties
function processFlightDuty(date, duties, details, reportTime, actualTimes, debriefTime, newCalculationResults, newParsedFlights, selectedRole) {
    // Handle multi-flight duties (separated by newlines)
    // Clean any special characters and ensure consistent newline format
    const cleanDuties = duties.replace(/\r\n/g, '\n').replace(/[��?�]/g, '');
    const cleanDetails = details.replace(/\r\n/g, '\n').replace(/[��?�]/g, '');

    const flightNumbers = cleanDuties.split('\n');
    const sectors = cleanDetails.split('\n');

    // Identify if this is a Turnaround duty (multiple flights on same day)
    // or if the sector contains multiple segments (like DXB - IKA IKA - DXB)
    let isTurnaround = flightNumbers.length > 1;

    // Check if this is a turnaround with a complex sector string
    if (!isTurnaround && flightNumbers.length === 1 && sectors.length === 1) {
        const sectorStr = sectors[0];
        // Check for patterns like "DXB - IKA IKA - DXB" or multiple dashes
        if (sectorStr.split(' - ').length > 2 ||
            (sectorStr.includes(' - ') && sectorStr.includes(' ') &&
             sectorStr.split(' ').length > 3)) {
            isTurnaround = true;
        }
    }

    // For single flight sectors
    if (flightNumbers.length === 1) {
        // Single flight
        if (reportTime && debriefTime) {
            const startTime = parseTime(reportTime);
            const endTime = parseTime(debriefTime);

            if (startTime && endTime) {
                // Calculate flight hours (minus 30 minutes for debriefing)
                let hours = calculateHoursBetween(startTime, endTime) - 0.5;

                // Add flight to parsed list
                newParsedFlights.push({
                    date: date,
                    flight: duties,
                    sector: details,
                    reporting: reportTime,
                    debriefing: debriefTime,
                    hours: hours,
                    pay: hours * SALARY_DATA[selectedRole].flightPayRate,
                    isOutbound: true, // Mark as potential outbound flight for layover detection
                    isTurnaround: isTurnaround // Mark as turnaround if identified as such
                });

                // Update total flight hours
                newCalculationResults.totalFlightHours += hours;

                // Update flight pay
                newCalculationResults.flightPay += hours * SALARY_DATA[selectedRole].flightPayRate;
            }
        }
    } else {
        // Turnaround duty - multiple flights in a single day

        // Process each flight in the turnaround duty
        for (let i = 0; i < flightNumbers.length; i++) {
            // For turnarounds, we need to estimate intermediate report/debrief times
            // if they're not provided for each segment

            // First flight uses the report time from roster
            let flightReportTime = i === 0 ? reportTime : '';

            // Last flight uses the debrief time from roster
            let flightDebriefTime = i === flightNumbers.length - 1 ? debriefTime : '';

            // For intermediate flights, we need to estimate times
            // This is simplified for now - in a full implementation,
            // we'd estimate based on flight schedule data

            // Calculate flight hours only if we have both report and debrief times
            if (flightReportTime && flightDebriefTime) {
                const startTime = parseTime(flightReportTime);
                const endTime = parseTime(flightDebriefTime);

                if (startTime && endTime) {
                    // Calculate flight hours (minus 30 minutes for debriefing, but only for last segment)
                    let hours = calculateHoursBetween(startTime, endTime);
                    if (i === flightNumbers.length - 1) {
                        // Only subtract 30 minutes from the last flight's debrief time
                        hours -= 0.5;
                    }

                    // Add flight to parsed list
                    newParsedFlights.push({
                        date: date,
                        flight: flightNumbers[i],
                        sector: sectors[i] || '',
                        reporting: flightReportTime,
                        debriefing: flightDebriefTime,
                        hours: hours,
                        pay: hours * SALARY_DATA[selectedRole].flightPayRate,
                        isTurnaround: true
                    });

                    // Update total flight hours
                    newCalculationResults.totalFlightHours += hours;

                    // Update flight pay
                    newCalculationResults.flightPay += hours * SALARY_DATA[selectedRole].flightPayRate;
                }
            }
        }
    }

    return { newCalculationResults, newParsedFlights };
}

// Main function to process the entire roster data
function processRosterData(rosterData, selectedRole) {
    console.log('processRosterData called with:', {
        rosterDataType: typeof rosterData,
        isArray: Array.isArray(rosterData),
        rosterDataLength: rosterData ? rosterData.length : 0,
        selectedRole: selectedRole
    });

    // Check if rosterData is valid
    if (!rosterData) {
        console.error('Roster data is null or undefined');
        return null;
    }

    // Ensure rosterData is an array
    if (!Array.isArray(rosterData)) {
        console.error('Roster data is not an array:', typeof rosterData);

        // If it's a string (CSV data), try to parse it
        if (typeof rosterData === 'string') {
            console.log('Roster data is a string, attempting to parse as CSV');
            try {
                // Use Papa Parse to convert the string to an array
                const parseResult = Papa.parse(rosterData, {
                    header: false,
                    skipEmptyLines: true
                });

                if (parseResult.data && parseResult.data.length > 0) {
                    console.log('Successfully parsed string to array with', parseResult.data.length, 'rows');
                    rosterData = parseResult.data;
                } else {
                    console.error('Failed to parse string to valid array');
                    return null;
                }
            } catch (error) {
                console.error('Error parsing roster data string:', error);
                return null;
            }
        } else if (typeof rosterData === 'object' && !Array.isArray(rosterData)) {
            // If it's an object but not an array, it might be a Papa Parse result object
            if (rosterData.data && Array.isArray(rosterData.data)) {
                console.log('Roster data is a Papa Parse result object, extracting data array');
                rosterData = rosterData.data;
            } else {
                console.error('Roster data is an object but not in expected format');
                return null;
            }
        } else {
            console.error('Roster data is in an unsupported format');
            return null;
        }
    }

    // Log the first few rows of the roster data for debugging
    if (rosterData && rosterData.length > 0) {
        console.log('First 5 rows of roster data:', rosterData.slice(0, 5));
    } else {
        console.error('Roster data is empty or invalid after processing');
        return null;
    }

    // Reset parsed data
    let newParsedFlights = [];
    let excludedFlightsCount = 0;
    let newCalculationResults = {
        totalFlightHours: 0,
        totalLayoverHours: 0,
        totalAsbyHours: 0,
        flightPay: 0,
        perDiem: 0,
        asbyPay: 0,
        totalSalary: 0
    };

    // Find the start of the schedule section
    let scheduleStartIndex = 0;
    console.log('Searching for Schedule Details section...');
    for (let i = 0; i < rosterData.length; i++) {
        if (rosterData[i] && rosterData[i][0] === 'Schedule Details') {
            scheduleStartIndex = i + 1; // Start from the next row (header)
            console.log('Found Schedule Details at row', i, 'starting processing from row', scheduleStartIndex);
            break;
        }
    }

    // If Schedule Details not found, try to find the header row directly
    if (scheduleStartIndex === 0) {
        console.log('Schedule Details not found, looking for Date/Duties/Details header...');
        for (let i = 0; i < rosterData.length; i++) {
            if (rosterData[i] &&
                rosterData[i][0] === 'Date' &&
                rosterData[i][1] === 'Duties' &&
                rosterData[i][2] === 'Details') {
                scheduleStartIndex = i + 1; // Start from the next row after header
                console.log('Found Date/Duties/Details header at row', i, 'starting processing from row', scheduleStartIndex);
                break;
            }
        }
    }

    // If still not found, log the issue
    if (scheduleStartIndex === 0) {
        console.error('Could not find Schedule Details or Date/Duties/Details header in the roster data');
        console.log('First 10 rows for debugging:', rosterData.slice(0, 10));
    }

    // Find the end of the schedule section
    let scheduleEndIndex = rosterData.length;
    for (let i = scheduleStartIndex; i < rosterData.length; i++) {
        if (rosterData[i] && rosterData[i][0] === 'Total Hours and Statistics') {
            scheduleEndIndex = i;
            console.log('Found Total Hours and Statistics at row', i, 'ending processing at this row');
            break;
        }
    }

    console.log('Schedule section identified:', {
        startIndex: scheduleStartIndex,
        endIndex: scheduleEndIndex,
        numberOfRows: scheduleEndIndex - scheduleStartIndex
    });

    // Extract the roster month and year
    let newRosterMonth = '';
    let newRosterYear = '';
    let primaryMonthNumber = null;

    // First, try to find date range in the headers (typically row 2)
    for (let i = 0; i < Math.min(10, rosterData.length); i++) {
        for (let j = 0; j < rosterData[i].length; j++) {
            if (rosterData[i][j] && typeof rosterData[i][j] === 'string' &&
                rosterData[i][j].includes('/') && rosterData[i][j].includes(' - ')) {
                const dateRangeParts = rosterData[i][j].split(' - ');
                if (dateRangeParts.length === 2) {
                    const dateParts = dateRangeParts[0].trim().split('/');
                    if (dateParts.length === 3) {
                        primaryMonthNumber = parseInt(dateParts[1], 10);
                        newRosterMonth = getMonthName(primaryMonthNumber);
                        newRosterYear = dateParts[2];
                        break;
                    }
                }
            }
        }
        if (newRosterMonth) break;
    }

    // If not found, try to extract from the first flight date
    if (!newRosterMonth) {
        // Find the first valid date in the schedule
        for (let i = scheduleStartIndex; i < scheduleEndIndex; i++) {
            const row = rosterData[i];
            if (row[0] && row[0].includes('/')) {
                const dateParts = row[0].split('/');
                if (dateParts.length === 3) {
                    primaryMonthNumber = parseInt(dateParts[1], 10);
                    newRosterMonth = getMonthName(primaryMonthNumber);
                    newRosterYear = dateParts[2].split(' ')[0]; // Extract year, removing day of week
                    break;
                }
            }
        }
    }

    // If we still don't have a primary month, use the current month
    if (!primaryMonthNumber) {
        const today = new Date();
        primaryMonthNumber = today.getMonth() + 1; // JavaScript months are 0-indexed
        newRosterMonth = getMonthName(primaryMonthNumber);
        newRosterYear = today.getFullYear().toString();
    }

    // First pass: Process all flight entries, excluding flights not in the primary month
    console.log('Starting to process flight entries...');
    let processedRowCount = 0;
    let validRowCount = 0;
    let flightDutyCount = 0;

    for (let i = scheduleStartIndex; i < scheduleEndIndex; i++) {
        const row = rosterData[i];
        processedRowCount++;

        // Skip header row if present
        if (row[0] === 'Date') {
            console.log('Skipping header row at index', i);
            continue;
        }

        // Check if this is a valid row with date and duties
        if (row[0] && row[1]) {
            validRowCount++;

            // Process the row based on duty type
            const date = row[0] ? row[0].trim() : '';
            const duties = row[1] ? row[1].trim() : '';
            const details = row[2] ? row[2].trim() : '';
            const reportTime = row[3] ? row[3].trim() : '';
            const actualTimes = row[4] ? row[4].trim() : '';
            const debriefTime = row[5] ? row[5].trim() : '';

            console.log(`Processing row ${i}:`, { date, duties, details, reportTime, actualTimes, debriefTime });

            // Check if this flight belongs to the primary month
            const flightMonthNumber = getMonthNumberFromDate(date);
            console.log('Date parsing:', { date, flightMonthNumber, primaryMonthNumber });

            if (flightMonthNumber !== primaryMonthNumber) {
                // Skip this flight as it belongs to a different month
                excludedFlightsCount++;
                console.log(`Excluding flight at row ${i} - belongs to month ${flightMonthNumber}, not primary month ${primaryMonthNumber}`);
                continue;
            }

            // Skip OFF days and REST days
            if (duties === 'OFF' || duties === '*OFF' || duties === 'X') {
                console.log(`Skipping OFF/REST day at row ${i}`);
                continue;
            }

            // Handle different duty types
            if (duties === 'SBY') {
                // Home standby - no pay for this
                console.log(`Skipping home standby at row ${i}`);
                continue;
            } else if (duties === 'ASBY') {
                // Airport standby
                console.log(`Processing airport standby at row ${i}`);
                const result = processAirportStandby(date, actualTimes, newCalculationResults, newParsedFlights, selectedRole);
                newCalculationResults = result.newCalculationResults;
                newParsedFlights = result.newParsedFlights;
            } else if (duties.includes('FZ')) {
                // Flight duty
                console.log(`Processing flight duty at row ${i}: ${duties} - ${details}`);
                flightDutyCount++;
                const result = processFlightDuty(date, duties, details, reportTime, actualTimes, debriefTime, newCalculationResults, newParsedFlights, selectedRole);
                newCalculationResults = result.newCalculationResults;
                newParsedFlights = result.newParsedFlights;
                console.log(`After processing flight duty, newParsedFlights length: ${newParsedFlights.length}`);
            } else {
                console.log(`Unknown duty type at row ${i}: ${duties}`);
            }
        } else {
            console.log(`Skipping invalid row at index ${i}:`, row);
        }
    }

    console.log('Flight processing summary:', {
        processedRowCount,
        validRowCount,
        flightDutyCount,
        excludedFlightsCount,
        parsedFlightsCount: newParsedFlights.length
    });

    // Second pass: Process layovers by identifying pairs of flights
    // We'll look for flight pairs where:
    // 1. The first flight goes FROM base (e.g., DXB) TO somewhere
    // 2. A later flight goes FROM that somewhere BACK TO base
    // with different dates

    // This is a simplified approach that assumes:
    // - DXB is the base
    // - All layovers are simple out-and-back pairs

    // Find potential layover pairs
    for (let i = 0; i < newParsedFlights.length; i++) {
        const outboundFlight = newParsedFlights[i];

        // Skip if this is part of a turnaround
        if (outboundFlight.isTurnaround) continue;

        // Check if this flight departs from DXB (indicated by sector starting with DXB - )
        if (outboundFlight.sector && outboundFlight.sector.startsWith('DXB - ')) {
            // Extract the destination
            const destination = outboundFlight.sector.split(' - ')[1];

            // Look for a following flight that returns from this destination
            for (let j = i + 1; j < newParsedFlights.length; j++) {
                const returnFlight = newParsedFlights[j];

                // Skip if this is part of a turnaround
                if (returnFlight.isTurnaround) continue;

                // Check if this flight returns to DXB from our destination
                const expectedReturnSector = `${destination} - DXB`;
                if (returnFlight.sector === expectedReturnSector) {
                    // We've found a layover pair!
                    outboundFlight.isLayover = true;
                    outboundFlight.isOutbound = true;
                    returnFlight.isLayover = true;
                    returnFlight.isOutbound = false;

                    // Calculate per diem for this layover
                    newCalculationResults = calculatePerDiem(outboundFlight, returnFlight, newCalculationResults, selectedRole);

                    // We've processed this return flight, so move on
                    break;
                }
            }
        }
    }

    // Calculate salary components
    const basicSalary = SALARY_DATA[selectedRole].basicSalary;
    const housingAllowance = SALARY_DATA[selectedRole].housingAllowance;
    const transportationAllowance = SALARY_DATA[selectedRole].transportationAllowance;

    // Calculate total salary
    newCalculationResults.totalSalary =
        basicSalary +
        housingAllowance +
        transportationAllowance +
        newCalculationResults.flightPay +
        newCalculationResults.perDiem +
        newCalculationResults.asbyPay;

    // Add basic salary components to the calculation results
    newCalculationResults.basicSalary = basicSalary;
    newCalculationResults.housingAllowance = housingAllowance;
    newCalculationResults.transportationAllowance = transportationAllowance;

    console.log('Final calculation results:', newCalculationResults);
    console.log('Parsed flights count:', newParsedFlights.length);

    if (newParsedFlights.length === 0) {
        console.warn('No flights were parsed from the roster data');

        // Check if we have valid salary data even without flights
        if (basicSalary > 0) {
            console.log('Returning calculation results with fixed salary components only');
        } else {
            console.error('No valid salary data found');
        }
    }

    return {
        newParsedFlights,
        newCalculationResults,
        newRosterMonth,
        newRosterYear,
        excludedFlightsCount
    };
}
