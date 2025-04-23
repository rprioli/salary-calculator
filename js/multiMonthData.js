// Multi-month data management

// Structure to store multiple months of data
let monthlyData = {};

// Function to add a new month's data
function addMonthData(month, year, flights, calculationResults) {
    const monthKey = `${month}-${year}`;
    
    // Store the month's data
    monthlyData[monthKey] = {
        month: month,
        year: year,
        flights: [...flights], // Create a copy of the flights array
        calculationResults: { ...calculationResults }, // Create a copy of the calculation results
        timestamp: new Date().toISOString() // Add timestamp for sorting
    };
    
    // Save to localStorage
    saveMonthlyDataToStorage();
    
    return monthlyData;
}

// Function to get a specific month's data
function getMonthData(month, year) {
    const monthKey = `${month}-${year}`;
    return monthlyData[monthKey] || null;
}

// Function to get all months' data
function getAllMonthsData() {
    return monthlyData;
}

// Function to delete a month's data
function deleteMonthData(month, year) {
    const monthKey = `${month}-${year}`;
    
    if (monthlyData[monthKey]) {
        delete monthlyData[monthKey];
        saveMonthlyDataToStorage();
        return true;
    }
    
    return false;
}

// Function to save monthly data to localStorage
function saveMonthlyDataToStorage() {
    // Get user email to use as part of the storage key
    const userEmail = sessionStorage.getItem('userEmail');
    if (!userEmail) return;
    
    // Create a storage key specific to this user
    const storageKey = `skywage_monthly_data_${userEmail}`;
    
    // Save to localStorage
    localStorage.setItem(storageKey, JSON.stringify(monthlyData));
}

// Function to load monthly data from localStorage
function loadMonthlyDataFromStorage() {
    // Get user email to use as part of the storage key
    const userEmail = sessionStorage.getItem('userEmail');
    if (!userEmail) return;
    
    // Create a storage key specific to this user
    const storageKey = `skywage_monthly_data_${userEmail}`;
    
    // Load from localStorage
    const storedData = localStorage.getItem(storageKey);
    
    if (storedData) {
        monthlyData = JSON.parse(storedData);
        return true;
    }
    
    return false;
}

// Function to clear all monthly data
function clearAllMonthlyData() {
    monthlyData = {};
    
    // Get user email to use as part of the storage key
    const userEmail = sessionStorage.getItem('userEmail');
    if (!userEmail) return;
    
    // Create a storage key specific to this user
    const storageKey = `skywage_monthly_data_${userEmail}`;
    
    // Remove from localStorage
    localStorage.removeItem(storageKey);
    
    return true;
}

// Function to get sorted months (newest first)
function getSortedMonths() {
    return Object.values(monthlyData)
        .sort((a, b) => {
            // Sort by year (descending)
            if (b.year !== a.year) {
                return parseInt(b.year) - parseInt(a.year);
            }
            
            // If same year, sort by month (descending)
            const monthOrder = {
                'January': 1, 'February': 2, 'March': 3, 'April': 4,
                'May': 5, 'June': 6, 'July': 7, 'August': 8,
                'September': 9, 'October': 10, 'November': 11, 'December': 12
            };
            
            return monthOrder[b.month] - monthOrder[a.month];
        });
}

// Function to calculate year-to-date earnings
function calculateYearToDateEarnings(year) {
    let ytdEarnings = {
        totalFlightHours: 0,
        totalLayoverHours: 0,
        totalAsbyHours: 0,
        flightPay: 0,
        perDiem: 0,
        asbyPay: 0,
        totalSalary: 0,
        basicSalary: 0,
        housingAllowance: 0,
        transportationAllowance: 0,
        monthsIncluded: []
    };
    
    // Get all months for the specified year
    const monthsInYear = Object.values(monthlyData).filter(data => data.year === year);
    
    // Sort months by their natural order
    const monthOrder = {
        'January': 1, 'February': 2, 'March': 3, 'April': 4,
        'May': 5, 'June': 6, 'July': 7, 'August': 8,
        'September': 9, 'October': 10, 'November': 11, 'December': 12
    };
    
    const sortedMonths = monthsInYear.sort((a, b) => monthOrder[a.month] - monthOrder[b.month]);
    
    // Calculate totals
    for (const monthData of sortedMonths) {
        const results = monthData.calculationResults;
        
        ytdEarnings.totalFlightHours += results.totalFlightHours;
        ytdEarnings.totalLayoverHours += results.totalLayoverHours;
        ytdEarnings.totalAsbyHours += results.totalAsbyHours;
        ytdEarnings.flightPay += results.flightPay;
        ytdEarnings.perDiem += results.perDiem;
        ytdEarnings.asbyPay += results.asbyPay;
        
        // Add fixed components for each month
        const selectedRole = sessionStorage.getItem('userPosition') === 'sccm' ? 'SCCM' : 'CCM';
        ytdEarnings.basicSalary += SALARY_DATA[selectedRole].basicSalary;
        ytdEarnings.housingAllowance += SALARY_DATA[selectedRole].housingAllowance;
        ytdEarnings.transportationAllowance += SALARY_DATA[selectedRole].transportationAllowance;
        
        ytdEarnings.monthsIncluded.push(monthData.month);
    }
    
    // Calculate total salary
    ytdEarnings.totalSalary = 
        ytdEarnings.basicSalary + 
        ytdEarnings.housingAllowance + 
        ytdEarnings.transportationAllowance + 
        ytdEarnings.flightPay + 
        ytdEarnings.perDiem + 
        ytdEarnings.asbyPay;
    
    return ytdEarnings;
}
