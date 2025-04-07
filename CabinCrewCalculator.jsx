import React, { useState } from 'react';
import Papa from 'papaparse';

// Salary Constants
const SALARY_DATA = {
  CCM: {
    basicSalary: 3275,
    housingAllowance: 4000,
    transportationAllowance: 1000,
    flightPayRate: 50,
    perDiemRate: 8.82,
    asbyRate: 50
  },
  SCCM: {
    basicSalary: 4275,
    housingAllowance: 5000,
    transportationAllowance: 1000,
    flightPayRate: 62,
    perDiemRate: 8.82,
    asbyRate: 62
  }
};

const CabinCrewCalculator = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [parsedFlights, setParsedFlights] = useState([]);
  const [editingFlightIndex, setEditingFlightIndex] = useState(null);
  const [editedDebriefTime, setEditedDebriefTime] = useState('');
  // State for tracking excluded flights
  const [excludedFlights, setExcludedFlights] = useState(0);
  // State for delete confirmation
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    show: false,
    flightIndex: null
  });
  // State for dropdowns
  const [monthlySummaryExpanded, setMonthlySummaryExpanded] = useState(true);
  const [salaryBreakdownExpanded, setSalaryBreakdownExpanded] = useState(false);
  const [calculationResults, setCalculationResults] = useState({
    totalFlightHours: 0,
    totalLayoverHours: 0,
    totalAsbyHours: 0,
    flightPay: 0,
    perDiem: 0,
    asbyPay: 0,
    totalSalary: 0
  });
  const [rosterMonth, setRosterMonth] = useState('');
  const [rosterYear, setRosterYear] = useState('');

  // Helper Functions
  const parseTime = (timeStr) => {
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
  };

  // Handle debriefing time edit
  const handleEditDebriefTime = (index) => {
    setEditingFlightIndex(index);
    setEditedDebriefTime(parsedFlights[index].debriefing);
  };

  // Save edited debriefing time
  const handleSaveDebriefTime = () => {
    if (editingFlightIndex === null) return;
    
    // Create a copy of the flights array
    const updatedFlights = [...parsedFlights];
    const flight = updatedFlights[editingFlightIndex];
    
    // Update the debriefing time
    flight.debriefing = editedDebriefTime;
    
    // Recalculate flight hours and pay
    const startTime = parseTime(flight.reporting);
    const endTime = parseTime(editedDebriefTime);
    
    if (startTime && endTime) {
      // Calculate flight hours (minus 30 minutes for debriefing)
      let hours = calculateHoursBetween(startTime, endTime) - 0.5;
      
      // Update the flight
      flight.hours = hours;
      flight.pay = hours * SALARY_DATA[selectedRole].flightPayRate;
      
      // Update the flights array
      updatedFlights[editingFlightIndex] = flight;
      setParsedFlights(updatedFlights);
      
      // Recalculate totals
      let totalFlightHours = 0;
      let totalFlightPay = 0;
      
      updatedFlights.forEach(f => {
        totalFlightHours += f.hours;
        totalFlightPay += f.pay;
      });
      
      // Update calculation results
      setCalculationResults({
        ...calculationResults,
        totalFlightHours: totalFlightHours,
        flightPay: totalFlightPay,
        totalSalary: SALARY_DATA[selectedRole].basicSalary + 
                    SALARY_DATA[selectedRole].housingAllowance + 
                    SALARY_DATA[selectedRole].transportationAllowance + 
                    totalFlightPay + 
                    calculationResults.perDiem + 
                    calculationResults.asbyPay
      });
    }
    
    // Reset editing state
    setEditingFlightIndex(null);
    setEditedDebriefTime('');
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingFlightIndex(null);
    setEditedDebriefTime('');
  };
  
  // Show delete confirmation dialog
  const handleShowDeleteConfirmation = (index) => {
    setDeleteConfirmation({
      show: true,
      flightIndex: index
    });
  };

  // Cancel deletion
  const handleCancelDelete = () => {
    setDeleteConfirmation({
      show: false,
      flightIndex: null
    });
  };

  // Confirm and perform deletion
  const handleConfirmDelete = () => {
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
    setParsedFlights(updatedFlights);
    
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
    setCalculationResults(newCalculationResults);
    
    // Reset confirmation dialog
    setDeleteConfirmation({
      show: false,
      flightIndex: null
    });
  };

  const calculateHoursBetween = (startTime, endTime) => {
    if (endTime < startTime) {
      // Handle times that cross midnight
      return (24 - startTime) + endTime;
    } else {
      return endTime - startTime;
    }
  };
  
  // Function to calculate layover hours between two date-time points
  const calculateLayoverHours = (outboundDate, outboundDebriefTime, returnDate, returnReportTime) => {
    // Extract date components (format: DD/MM/YYYY)
    const outboundDateParts = outboundDate.split('/');
    const returnDateParts = returnDate.split('/');
    
    if (outboundDateParts.length !== 3 || returnDateParts.length !== 3) return 0;
    
    // Parse date components
    const outboundDay = parseInt(outboundDateParts[0], 10);
    const outboundMonth = parseInt(outboundDateParts[1], 10) - 1; // JS months are 0-indexed
    const outboundYear = parseInt(outboundDateParts[2], 10);
    
    const returnDay = parseInt(returnDateParts[0], 10);
    const returnMonth = parseInt(returnDateParts[1], 10) - 1;
    const returnYear = parseInt(returnDateParts[2], 10);
    
    // Parse times
    const outboundTime = parseTime(outboundDebriefTime);
    const returnTime = parseTime(returnReportTime);
    
    if (!outboundTime || !returnTime) return 0;
    
    // Create Date objects for outbound date
    let outboundDateTime = new Date(outboundYear, outboundMonth, outboundDay);
    const returnDateTime = new Date(returnYear, returnMonth, returnDay);
    
    // Adjust outbound date if debriefing is after midnight
    // If debriefing time is between 00:00 and 12:00, it's likely the next day
    if (outboundTime < 12) {
      outboundDateTime.setDate(outboundDateTime.getDate() + 1);
    }
    
    // Set hours and minutes
    outboundDateTime.setHours(Math.floor(outboundTime));
    outboundDateTime.setMinutes(Math.round((outboundTime - Math.floor(outboundTime)) * 60));
    
    returnDateTime.setHours(Math.floor(returnTime));
    returnDateTime.setMinutes(Math.round((returnTime - Math.floor(returnTime)) * 60));
    
    // Calculate difference in milliseconds and convert to hours
    const diffInMilliseconds = returnDateTime - outboundDateTime;
    return Math.max(0, diffInMilliseconds / (1000 * 60 * 60));
  };

  // Function to calculate per diem specifically for layover duties
  const calculatePerDiem = (outboundFlight, returnFlight, newCalculationResults) => {
    if (!outboundFlight || !returnFlight) return newCalculationResults;
    if (!outboundFlight.date || !outboundFlight.debriefing || !returnFlight.date || !returnFlight.reporting) 
      return newCalculationResults;
    
    // Calculate rest hours using the new function that accounts for multiple days
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
  };
  
  // Get the month number from a date string (format: DD/MM/YYYY)
  const getMonthNumberFromDate = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string') return null;
    
    // Try to extract the month from the date string
    const dateParts = dateStr.split('/');
    if (dateParts.length === 3) {
      return parseInt(dateParts[1], 10); // Month is the second part in DD/MM/YYYY
    }
    return null;
  };

  const getMonthName = (monthNumber) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthNumber - 1] || '';
  };

  const getNextMonth = (currentMonth) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const currentIndex = months.indexOf(currentMonth);
    if (currentIndex === -1) return '';
    
    // Return the next month, wrapping around to January if needed
    return months[(currentIndex + 1) % 12];
  };

  const getNextMonthYear = (currentMonth, currentYear) => {
    // Convert year to number if it's a string
    currentYear = parseInt(currentYear, 10);
    
    // If December, the next month is in the next year
    if (currentMonth === 'December') {
      return (currentYear + 1).toString();
    }
    
    return currentYear.toString();
  };
  
  // Helper function to convert decimal hours to HH:MM format
  const formatHoursMinutes = (decimalHours) => {
    const hours = Math.floor(decimalHours);
    const minutes = Math.round((decimalHours - hours) * 60);
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  };

  const cleanSpecialCharacters = (data) => {
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
  };

  const processAirportStandby = (date, actualTimes, newCalculationResults, newParsedFlights) => {
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
  };

  const processFlightDuty = (date, duties, details, reportTime, actualTimes, debriefTime, newCalculationResults, newParsedFlights) => {
    // Handle multi-flight duties (separated by newlines)
    // Clean any special characters and ensure consistent newline format
    const cleanDuties = duties.replace(/\r\n/g, '\n').replace(/[��?�]/g, '');
    const cleanDetails = details.replace(/\r\n/g, '\n').replace(/[��?�]/g, '');
    
    const flightNumbers = cleanDuties.split('\n');
    const sectors = cleanDetails.split('\n');
    
    // Identify if this is a Turnaround duty (multiple flights on same day)
    const isTurnaround = flightNumbers.length > 1;
    
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
            isOutbound: true // Mark as potential outbound flight for layover detection
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
  };

  const processRosterData = (rosterData) => {
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
    for (let i = 0; i < rosterData.length; i++) {
      if (rosterData[i][0] === 'Schedule Details') {
        scheduleStartIndex = i + 1; // Start from the next row (header)
        break;
      }
    }
    
    // If Schedule Details not found, try to find the header row directly
    if (scheduleStartIndex === 0) {
      for (let i = 0; i < rosterData.length; i++) {
        if (rosterData[i][0] === 'Date' && 
            rosterData[i][1] === 'Duties' && 
            rosterData[i][2] === 'Details') {
          scheduleStartIndex = i + 1; // Start from the next row after header
          break;
        }
      }
    }
    
    // Find the end of the schedule section
    let scheduleEndIndex = rosterData.length;
    for (let i = scheduleStartIndex; i < rosterData.length; i++) {
      if (rosterData[i][0] === 'Total Hours and Statistics') {
        scheduleEndIndex = i;
        break;
      }
    }
    
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
    for (let i = scheduleStartIndex; i < scheduleEndIndex; i++) {
      const row = rosterData[i];
      
      // Skip header row if present
      if (row[0] === 'Date') continue;
      
      // Check if this is a valid row with date and duties
      if (row[0] && row[1]) {
        // Process the row based on duty type
        const date = row[0] ? row[0].trim() : '';
        const duties = row[1] ? row[1].trim() : '';
        const details = row[2] ? row[2].trim() : '';
        const reportTime = row[3] ? row[3].trim() : '';
        const actualTimes = row[4] ? row[4].trim() : '';
        const debriefTime = row[5] ? row[5].trim() : '';
        
        // Check if this flight belongs to the primary month
        const flightMonthNumber = getMonthNumberFromDate(date);
        if (flightMonthNumber !== primaryMonthNumber) {
          // Skip this flight as it belongs to a different month
          excludedFlightsCount++;
          continue;
        }
        
        // Skip OFF days and REST days
        if (duties === 'OFF' || duties === '*OFF' || duties === 'X') continue;
        
        // Handle different duty types
        if (duties === 'SBY') {
          // Home standby - no pay for this
          continue;
        } else if (duties === 'ASBY') {
          // Airport standby
          const result = processAirportStandby(date, actualTimes, newCalculationResults, newParsedFlights);
          newCalculationResults = result.newCalculationResults;
          newParsedFlights = result.newParsedFlights;
        } else if (duties.includes('FZ')) {
          // Flight duty
          const result = processFlightDuty(date, duties, details, reportTime, actualTimes, debriefTime, newCalculationResults, newParsedFlights);
          newCalculationResults = result.newCalculationResults;
          newParsedFlights = result.newParsedFlights;
        }
      }
    }
    
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
            newCalculationResults = calculatePerDiem(outboundFlight, returnFlight, newCalculationResults);
            
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
    
    // Update the excluded flights count
    setExcludedFlights(excludedFlightsCount);
    
    return { newParsedFlights, newCalculationResults, newRosterMonth, newRosterYear };
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setShowUpload(true);
    setShowResults(false);
    setError('');
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setLoading(true);
      setError('');
      setShowResults(false);
      
      Papa.parse(file, {
        header: false,
        skipEmptyLines: true,
        encoding: "UTF-8",
        complete: function(results) {
          try {
            setLoading(false);
            
            // Check if we have valid data
            if (!results.data || results.data.length === 0) {
              setError('No data found in the CSV file. Please check the file format.');
              return;
            }
            
            // Clean special characters from parsed data
            const cleanData = cleanSpecialCharacters(results.data);
            
            // Process the roster data
            const { newParsedFlights, newCalculationResults, newRosterMonth, newRosterYear } = processRosterData(cleanData);
            
            // Check if we have any flights parsed
            if (newParsedFlights.length === 0) {
              setError('No flight duties found in the roster. Please check that the file contains valid flight data.');
              return;
            }
            
            // Update state with results
            setParsedFlights(newParsedFlights);
            setCalculationResults(newCalculationResults);
            setRosterMonth(newRosterMonth);
            setRosterYear(newRosterYear);
            
            // Ensure dropdowns are in correct state
            setMonthlySummaryExpanded(true);
            setSalaryBreakdownExpanded(false);
            
            setShowResults(true);
          } catch (err) {
            console.error('Error processing CSV data:', err);
            setError('Error processing roster data: ' + err.message);
            setLoading(false);
          }
        },
        error: function(error) {
          console.error('Error parsing CSV:', error);
          setError('Error parsing CSV file: ' + error.message);
          setLoading(false);
        }
      });
    }
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-sm p-4 max-w-6xl mx-auto">
      <div className="text-center pb-6 mb-6">
        <h1 className="text-3xl font-light text-gray-800">Cabin Crew Salary Calculator</h1>
      </div>
      
      <div className={`bg-white rounded-lg shadow-sm p-6 mb-6 ${!selectedRole ? 'border-t-4 border-indigo-500' : ''}`}>
        <h2 className="text-xl font-light text-gray-700 mb-6">Select Your Role</h2>
        <div className="flex flex-col md:flex-row justify-around gap-4 mb-6">
          <button 
            onClick={() => handleRoleSelect('CCM')} 
            className={`py-4 px-6 text-lg rounded-md transition-all ${
              selectedRole === 'CCM' 
                ? 'bg-indigo-500 text-white shadow-md' 
                : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            Cabin Crew Member (CCM)
          </button>
          <button 
            onClick={() => handleRoleSelect('SCCM')} 
            className={`py-4 px-6 text-lg rounded-md transition-all ${
              selectedRole === 'SCCM' 
                ? 'bg-indigo-500 text-white shadow-md' 
                : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            Senior Cabin Crew Member (SCCM)
          </button>
        </div>
        
        {showUpload && (
          <div className="mt-6">
            <h2 className="text-xl font-light text-gray-700 mb-4">Upload Your Roster</h2>
            <p className="mb-4 text-gray-600">Upload your roster CSV file to calculate your salary</p>
            <div className="flex flex-col items-center gap-4">
              <label className="w-full max-w-md p-6 border border-dashed border-gray-300 rounded-lg bg-gray-50 cursor-pointer flex flex-col items-center justify-center hover:bg-gray-100 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="text-gray-600 mb-1">Click to upload CSV</span>
                <span className="text-xs text-gray-500">or drag and drop</span>
                <input 
                  type="file" 
                  accept=".csv" 
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              
              {loading && (
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="mt-2 text-gray-600">Processing roster data...</p>
                </div>
              )}
              
              {error && (
                <div className="w-full max-w-md p-4 bg-red-50 rounded-lg text-red-600 flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 text-red-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {showResults && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-light text-gray-700 mb-8">Salary Calculation Results</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
              <div 
                className="flex justify-between items-center cursor-pointer mb-4"
                onClick={() => setMonthlySummaryExpanded(!monthlySummaryExpanded)}
              >
                <h3 className="text-lg font-medium text-gray-700">Monthly Summary</h3>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${monthlySummaryExpanded ? 'transform rotate-180' : ''}`} 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              {monthlySummaryExpanded && (
                <div className="space-y-3 transition-all duration-200">
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Selected Role:</span>
                    <span className="font-medium text-gray-800">{selectedRole === 'CCM' ? 'Cabin Crew Member' : 'Senior Cabin Crew Member'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Roster Month:</span>
                    <span className="font-medium text-gray-800">{rosterMonth} {rosterYear}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Payment Month:</span>
                    <span className="font-medium text-gray-800">{getNextMonth(rosterMonth)} {getNextMonthYear(rosterMonth, rosterYear)}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Total FDP:</span>
                    <span className="font-medium text-gray-800">{formatHoursMinutes(calculationResults.totalFlightHours + calculationResults.totalAsbyHours)} hours</span>
                  </div>
                  <div className="flex justify-between py-3 mt-3 border-t border-indigo-100 font-bold text-lg">
                    <span className="text-gray-800">Total Salary:</span>
                    <span className="text-indigo-600">AED {(calculationResults.totalSalary || 0).toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6 shadow-sm md:col-span-2">
              <div 
                className="flex justify-between items-center cursor-pointer mb-4"
                onClick={() => setSalaryBreakdownExpanded(!salaryBreakdownExpanded)}
              >
                <h3 className="text-lg font-medium text-gray-700">Salary Breakdown</h3>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${salaryBreakdownExpanded ? 'transform rotate-180' : ''}`} 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              
              {salaryBreakdownExpanded && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-3">Fixed Components</h4>
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between py-2 border-b border-gray-200">
                          <span className="text-gray-600">Basic Salary:</span>
                          <span className="text-gray-800">AED {SALARY_DATA[selectedRole]?.basicSalary?.toFixed(2) || 0}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-200">
                          <span className="text-gray-600">Housing Allowance:</span>
                          <span className="text-gray-800">AED {SALARY_DATA[selectedRole]?.housingAllowance?.toFixed(2) || 0}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-200">
                          <span className="text-gray-600">Transportation:</span>
                          <span className="text-gray-800">AED {SALARY_DATA[selectedRole]?.transportationAllowance?.toFixed(2) || 0}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-700 mb-3">Variable Components</h4>
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between py-2 border-b border-gray-200">
                          <span className="text-gray-600">Flight Pay:</span>
                          <span className="text-gray-800">AED {((calculationResults.flightPay || 0) + (calculationResults.asbyPay || 0)).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-200">
                          <span className="text-gray-600">Crew Per Diem:</span>
                          <span className="text-gray-800">AED {(calculationResults.perDiem || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-200 invisible">
                          <span>Placeholder</span>
                          <span>Placeholder</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className="mt-10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-700">Flight Details</h3>
              <span className="text-sm text-gray-500">{parsedFlights.length} flights</span>
            </div>
            <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-sm uppercase">
                    <th className="p-4 text-left font-medium">Date</th>
                    <th className="p-4 text-left font-medium">Flight</th>
                    <th className="p-4 text-left font-medium">Sector</th>
                    <th className="p-4 text-left font-medium">Reporting</th>
                    <th className="p-4 text-left font-medium">Debriefing</th>
                    <th className="p-4 text-left font-medium">FDP</th>
                    <th className="p-4 text-left font-medium">Flight Pay</th>
                    <th className="p-4 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedFlights.map((flight, index) => (
                  <tr key={index} className={`border-t border-gray-200 ${flight.isLayover ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}>
                      <td className="p-4 text-gray-700">{flight.date}</td>
                      <td className="p-4 text-gray-700 font-medium">{flight.flight}</td>
                      <td className="p-4 text-gray-700">{flight.sector}</td>
                      <td className="p-4 text-gray-700">{flight.reporting}</td>
                      <td className="p-4 text-gray-700">
                        {editingFlightIndex === index ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={editedDebriefTime}
                              onChange={(e) => setEditedDebriefTime(e.target.value)}
                              className="border border-gray-300 p-1 w-20 text-sm rounded"
                            />
                            <button 
                              onClick={handleSaveDebriefTime}
                              className="bg-green-500 text-white p-1 rounded text-xs hover:bg-green-600"
                            >
                              Save
                            </button>
                            <button 
                              onClick={handleCancelEdit}
                              className="bg-gray-500 text-white p-1 rounded text-xs hover:bg-gray-600"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span>{flight.debriefing}</span>
                            <button 
                              onClick={() => handleEditDebriefTime(index)}
                              className="text-indigo-500 hover:text-indigo-700 text-xs"
                            >
                              Edit
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-gray-700">{formatHoursMinutes(flight.hours)}</td>
                      <td className="p-4 text-gray-700">AED {flight.pay.toFixed(2)}</td>
                      <td className="p-4 text-gray-700">
                        {/* Only show delete button for non-layover flights or outbound layover flights */}
                        {(!flight.isLayover || (flight.isLayover && flight.isOutbound)) && (
                          <button 
                            onClick={() => handleShowDeleteConfirmation(index)}
                            className="text-red-500 hover:text-red-700 text-xs flex items-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete confirmation modal */}
      {deleteConfirmation.show && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
            <div className="flex items-center mb-4 text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-lg font-medium">Delete Flight</h3>
            </div>
            <p className="mb-6 text-gray-600">
              {parsedFlights[deleteConfirmation.flightIndex]?.isLayover && parsedFlights[deleteConfirmation.flightIndex]?.isOutbound
                ? "Are you sure you want to delete this layover? Both outbound and return flights will be deleted. This action cannot be undone."
                : "Are you sure you want to delete this flight? This action cannot be undone."}
            </p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={handleCancelDelete}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-500 rounded-md text-white hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="text-center text-gray-400 text-sm mt-10 pt-6 border-t border-gray-200">
        © 2025 Cabin Crew Salary Calculator
      </div>
    </div>
  );
};

export default CabinCrewCalculator;