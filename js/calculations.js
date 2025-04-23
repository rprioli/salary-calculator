/**
 * Calculations Module for Skywage
 * Handles all salary and flight pay calculations
 */

// Calculate flight pay for a single flight
function calculateFlightPay(flightHours, position) {
    // Get the flight pay rate based on position
    const flightPayRate = position === 'sccm' ? 
        SALARY_DATA.SCCM.flightPayRate : 
        SALARY_DATA.CCM.flightPayRate;
    
    // Calculate flight pay
    return flightHours * flightPayRate;
}

// Calculate total flight pay for multiple flights
function calculateTotalFlightPay(flights, position) {
    // Sum up flight pay for all flights
    return flights.reduce((total, flight) => {
        // If flight has hours but no pay (or pay was calculated with old rate)
        if (flight.flightHours) {
            // Calculate flight pay with current position's rate
            const flightPay = calculateFlightPay(flight.flightHours, position);
            return total + flightPay;
        }
        return total;
    }, 0);
}

// Calculate total flight hours
function calculateTotalFlightHours(flights) {
    // Sum up flight hours for all flights
    return flights.reduce((total, flight) => {
        return total + (flight.flightHours || 0);
    }, 0);
}

// Calculate fixed salary components
function calculateFixedSalary(position) {
    // Get salary data based on position
    const salaryData = position === 'sccm' ? SALARY_DATA.SCCM : SALARY_DATA.CCM;
    
    // Return fixed components
    return {
        basicSalary: salaryData.basicSalary,
        housingAllowance: salaryData.housingAllowance,
        transportationAllowance: salaryData.transportationAllowance,
        total: salaryData.basicSalary + salaryData.housingAllowance + salaryData.transportationAllowance
    };
}

// Calculate total salary
function calculateTotalSalary(position, flights) {
    // Calculate fixed components
    const fixedSalary = calculateFixedSalary(position);
    
    // Calculate flight pay
    const flightPay = calculateTotalFlightPay(flights, position);
    
    // Calculate total
    const totalSalary = fixedSalary.total + flightPay;
    
    return {
        basicSalary: fixedSalary.basicSalary,
        housingAllowance: fixedSalary.housingAllowance,
        transportationAllowance: fixedSalary.transportationAllowance,
        flightPay: flightPay,
        totalSalary: totalSalary,
        totalFlightHours: calculateTotalFlightHours(flights)
    };
}

// Calculate year-to-date earnings
function calculateYearToDateEarnings(multiMonthData, position) {
    let totalEarnings = 0;
    let totalFlightHours = 0;
    let monthlyEarnings = [];
    
    // Get current year
    const currentYear = new Date().getFullYear();
    
    // Loop through all months
    for (const monthKey in multiMonthData) {
        if (multiMonthData.hasOwnProperty(monthKey)) {
            const monthData = multiMonthData[monthKey];
            
            // Skip if not current year
            if (monthData.year !== currentYear) {
                continue;
            }
            
            // If calculation results exist, use them
            if (monthData.calculationResults && monthData.calculationResults.totalSalary) {
                totalEarnings += monthData.calculationResults.totalSalary;
                totalFlightHours += monthData.calculationResults.totalFlightHours || 0;
                
                // Add to monthly earnings array
                monthlyEarnings.push({
                    month: monthData.month,
                    year: monthData.year,
                    earnings: monthData.calculationResults.totalSalary,
                    flightHours: monthData.calculationResults.totalFlightHours || 0
                });
            } 
            // Otherwise calculate from flights
            else if (monthData.flights && monthData.flights.length > 0) {
                const results = calculateTotalSalary(position, monthData.flights);
                totalEarnings += results.totalSalary;
                totalFlightHours += results.totalFlightHours;
                
                // Add to monthly earnings array
                monthlyEarnings.push({
                    month: monthData.month,
                    year: monthData.year,
                    earnings: results.totalSalary,
                    flightHours: results.totalFlightHours
                });
            }
        }
    }
    
    // Sort monthly earnings by month
    monthlyEarnings.sort((a, b) => a.month - b.month);
    
    return {
        totalEarnings,
        totalFlightHours,
        monthlyEarnings
    };
}

// Recalculate all data when position changes
function recalculateAllData(position) {
    // Get multi-month data
    const multiMonthData = window.dataManager.getMultiMonthData();
    
    // If there's existing data, recalculate based on new position
    if (Object.keys(multiMonthData).length > 0) {
        // Loop through each month's data
        for (const monthKey in multiMonthData) {
            if (multiMonthData.hasOwnProperty(monthKey)) {
                const monthData = multiMonthData[monthKey];
                
                // Skip if no flights data
                if (!monthData.flights || monthData.flights.length === 0) {
                    continue;
                }
                
                // Recalculate flight pay based on new position
                const flights = monthData.flights;
                
                // Get the flight pay rate based on position
                const flightPayRate = position === 'sccm' ? 
                    SALARY_DATA.SCCM.flightPayRate : 
                    SALARY_DATA.CCM.flightPayRate;
                
                // Recalculate flight pay for each flight
                flights.forEach(flight => {
                    // If flight has hours but no pay (or pay was calculated with old rate)
                    if (flight.flightHours) {
                        // Update flight pay with new rate
                        flight.flightPay = flight.flightHours * flightPayRate;
                    }
                });
                
                // Calculate new results
                const results = calculateTotalSalary(position, flights);
                
                // Update calculation results
                monthData.calculationResults = results;
            }
        }
        
        // Save updated data back to localStorage
        window.dataManager.saveMultiMonthData(multiMonthData);
        console.log('Calculations updated with new position:', position);
        
        return true;
    }
    
    return false;
}

// Export functions for use in other files
window.calculations = {
    calculateFlightPay,
    calculateTotalFlightPay,
    calculateTotalFlightHours,
    calculateFixedSalary,
    calculateTotalSalary,
    calculateYearToDateEarnings,
    recalculateAllData
};
