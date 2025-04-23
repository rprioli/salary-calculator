// Multi-month visualization components

// Function to render the month selector
function renderMonthSelector(selectedMonthKey = null) {
    const monthSelector = document.getElementById('month-selector');
    if (!monthSelector) return;

    // Clear existing content
    monthSelector.innerHTML = '';

    // Get sorted months
    const sortedMonths = getSortedMonths();

    // If no months, show a message
    if (sortedMonths.length === 0) {
        const noDataMessage = createElement('div', 'text-center text-gray-500 py-4',
            '<i class="fas fa-info-circle mr-2"></i>No monthly data available. Upload a roster to get started.');
        monthSelector.appendChild(noDataMessage);
        return;
    }

    // Create month selector tabs
    const tabContainer = createElement('div', 'flex overflow-x-auto pb-2 mb-4 border-b border-gray-200');

    // Add "All Months" option for year-to-date view
    const allMonthsTab = createElement('button',
        `px-4 py-2 text-sm font-medium rounded-t-lg mr-2 focus:outline-none ${!selectedMonthKey ? 'bg-indigo-100 text-indigo-700 border-b-2 border-indigo-500' : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'}`,
        '<i class="fas fa-calendar-alt mr-2"></i>All Months'
    );

    allMonthsTab.addEventListener('click', () => {
        // Show year-to-date view
        switchToYearToDateView();
    });

    tabContainer.appendChild(allMonthsTab);

    // Add tabs for each month
    sortedMonths.forEach(monthData => {
        const monthKey = `${monthData.month}-${monthData.year}`;
        const isSelected = monthKey === selectedMonthKey;

        const monthTab = createElement('button',
            `px-4 py-2 text-sm font-medium rounded-t-lg mr-2 focus:outline-none ${isSelected ? 'bg-indigo-100 text-indigo-700 border-b-2 border-indigo-500' : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'}`,
            `<i class="fas fa-calendar-day mr-2"></i>${monthData.month} ${monthData.year}`
        );

        monthTab.addEventListener('click', () => {
            // Switch to this month's data
            switchToMonth(monthData.month, monthData.year);
        });

        tabContainer.appendChild(monthTab);
    });

    monthSelector.appendChild(tabContainer);
}

// Function to switch to a specific month's data
function switchToMonth(month, year) {
    const monthKey = `${month}-${year}`;
    const monthData = getMonthData(month, year);

    if (!monthData) return;

    // Update application state with this month's data
    parsedFlights = [...monthData.flights];
    calculationResults = { ...monthData.calculationResults };
    rosterMonth = month;
    rosterYear = year;

    // Update UI
    renderMonthSelector(monthKey);
    renderResults();

    // Hide multi-month visualizations and show single month view
    hideElement('multi-month-visualizations');
    showElement('results-container');

    // Update page title with month
    document.getElementById('current-month-display').textContent = `${month} ${year}`;
}

// Function to switch to year-to-date view
function switchToYearToDateView() {
    // Get all available years
    const years = [...new Set(Object.values(monthlyData).map(data => data.year))];

    // Sort years in descending order
    years.sort((a, b) => parseInt(b) - parseInt(a));

    // If no years, return
    if (years.length === 0) return;

    // Use the most recent year
    const currentYear = years[0];

    // Calculate year-to-date earnings
    const ytdEarnings = calculateYearToDateEarnings(currentYear);

    // Update UI
    renderMonthSelector();
    renderYearToDateSummary(ytdEarnings, currentYear);
    renderMonthlyComparisonCharts(currentYear);

    // Hide single month view and show multi-month visualizations
    hideElement('results-container');
    showElement('multi-month-visualizations');

    // Update page title with year
    document.getElementById('current-month-display').textContent = `Year ${currentYear}`;
}

// Function to render year-to-date summary
function renderYearToDateSummary(ytdEarnings, year) {
    const ytdSummaryContainer = document.getElementById('ytd-summary');
    if (!ytdSummaryContainer) return;

    // Clear existing content
    ytdSummaryContainer.innerHTML = '';

    // Create summary card
    const summaryCard = createElement('div', 'bg-white rounded-lg shadow-md p-6');

    // Create header
    const header = createElement('div', 'flex justify-between items-center mb-4');
    header.innerHTML = `
        <h3 class="text-lg font-medium text-gray-700">
            <i class="fas fa-calendar-check text-indigo-500 mr-2"></i>
            Year-to-Date Summary (${year})
        </h3>
        <span class="text-sm bg-indigo-100 text-indigo-800 py-1 px-3 rounded-full font-medium">
            ${ytdEarnings.monthsIncluded.length} months
        </span>
    `;

    // Create content
    const content = createElement('div', 'mt-4');

    // Add months included
    const monthsList = createElement('div', 'mb-4 text-sm text-gray-600');
    monthsList.innerHTML = `
        <span class="font-medium">Months included:</span>
        ${ytdEarnings.monthsIncluded.join(', ') || 'None'}
    `;

    // Create stats grid
    const statsGrid = createElement('div', 'grid grid-cols-2 md:grid-cols-4 gap-4 mb-6');

    // Add stats
    statsGrid.innerHTML = `
        <div class="bg-indigo-50 p-4 rounded-lg">
            <div class="text-xs text-indigo-600 uppercase font-medium">Total Flight Hours</div>
            <div class="text-2xl font-bold text-indigo-700">${ytdEarnings.totalFlightHours.toFixed(2)}</div>
        </div>
        <div class="bg-green-50 p-4 rounded-lg">
            <div class="text-xs text-green-600 uppercase font-medium">Total Layover Hours</div>
            <div class="text-2xl font-bold text-green-700">${ytdEarnings.totalLayoverHours.toFixed(2)}</div>
        </div>
        <div class="bg-blue-50 p-4 rounded-lg">
            <div class="text-xs text-blue-600 uppercase font-medium">Total ASBY Hours</div>
            <div class="text-2xl font-bold text-blue-700">${ytdEarnings.totalAsbyHours.toFixed(2)}</div>
        </div>
        <div class="bg-purple-50 p-4 rounded-lg">
            <div class="text-xs text-purple-600 uppercase font-medium">Total Earnings</div>
            <div class="text-2xl font-bold text-purple-700">AED ${ytdEarnings.totalSalary.toFixed(2)}</div>
        </div>
    `;

    // Create earnings breakdown
    const earningsBreakdown = createElement('div', 'mt-6');
    earningsBreakdown.innerHTML = `
        <h4 class="text-md font-medium text-gray-700 mb-3">Earnings Breakdown</h4>
        <div class="bg-gray-50 p-4 rounded-lg">
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <div class="text-sm text-gray-600">Basic Salary</div>
                    <div class="text-lg font-medium">AED ${ytdEarnings.basicSalary.toFixed(2)}</div>
                </div>
                <div>
                    <div class="text-sm text-gray-600">Housing Allowance</div>
                    <div class="text-lg font-medium">AED ${ytdEarnings.housingAllowance.toFixed(2)}</div>
                </div>
                <div>
                    <div class="text-sm text-gray-600">Transportation</div>
                    <div class="text-lg font-medium">AED ${ytdEarnings.transportationAllowance.toFixed(2)}</div>
                </div>
                <div>
                    <div class="text-sm text-gray-600">Flight Pay</div>
                    <div class="text-lg font-medium">AED ${ytdEarnings.flightPay.toFixed(2)}</div>
                </div>
                <div>
                    <div class="text-sm text-gray-600">Per Diem</div>
                    <div class="text-lg font-medium">AED ${ytdEarnings.perDiem.toFixed(2)}</div>
                </div>
                <div>
                    <div class="text-sm text-gray-600">Standby Pay</div>
                    <div class="text-lg font-medium">AED ${ytdEarnings.asbyPay.toFixed(2)}</div>
                </div>
            </div>
            <div class="mt-4 pt-4 border-t border-gray-200">
                <div class="flex justify-between items-center">
                    <div class="text-sm font-medium text-gray-700">Total Year-to-Date</div>
                    <div class="text-xl font-bold text-indigo-700">AED ${ytdEarnings.totalSalary.toFixed(2)}</div>
                </div>
            </div>
        </div>
    `;

    // Assemble the card
    content.appendChild(monthsList);
    content.appendChild(statsGrid);
    content.appendChild(earningsBreakdown);

    summaryCard.appendChild(header);
    summaryCard.appendChild(content);

    ytdSummaryContainer.appendChild(summaryCard);
}

// Function to render monthly comparison charts
function renderMonthlyComparisonCharts(year) {
    const chartsContainer = document.getElementById('monthly-comparison-charts');
    if (!chartsContainer) return;

    // Clear existing content
    chartsContainer.innerHTML = '';

    // Get all months for the specified year
    const monthsInYear = Object.values(monthlyData).filter(data => data.year === year);

    // If no months, show a message
    if (monthsInYear.length === 0) {
        const noDataMessage = createElement('div', 'text-center text-gray-500 py-4',
            '<i class="fas fa-info-circle mr-2"></i>No monthly data available for this year. Upload more rosters to see comparisons.');
        chartsContainer.appendChild(noDataMessage);
        return;
    }

    // Sort months by their natural order
    const monthOrder = {
        'January': 1, 'February': 2, 'March': 3, 'April': 4,
        'May': 5, 'June': 6, 'July': 7, 'August': 8,
        'September': 9, 'October': 10, 'November': 11, 'December': 12
    };

    const sortedMonths = monthsInYear.sort((a, b) => monthOrder[a.month] - monthOrder[b.month]);

    // Create charts card
    const chartsCard = createElement('div', 'bg-white rounded-lg shadow-md p-6');

    // Create header
    const header = createElement('h3', 'text-lg font-medium text-gray-700 mb-6',
        '<i class="fas fa-chart-bar text-indigo-500 mr-2"></i>Monthly Comparison');

    // Create charts container
    const chartsGrid = createElement('div', 'grid grid-cols-1 md:grid-cols-2 gap-6');

    // Prepare data for charts
    const months = sortedMonths.map(data => data.month);
    const flightHours = sortedMonths.map(data => data.calculationResults.totalFlightHours || 0);
    const totalSalaries = sortedMonths.map(data => data.calculationResults.totalSalary || 0);
    const flightPay = sortedMonths.map(data => data.calculationResults.flightPay || 0);
    const perDiem = sortedMonths.map(data => data.calculationResults.perDiem || 0);
    const asbyPay = sortedMonths.map(data => data.calculationResults.asbyPay || 0);

    // Check if we have valid data to display
    const hasValidData = flightHours.some(hours => hours > 0) || totalSalaries.some(salary => salary > 0);

    // Debug information
    console.log('Chart data:', {
        months,
        flightHours,
        totalSalaries,
        hasValidData
    });

    // Create flight hours chart
    const flightHoursChart = createElement('div', 'bg-gray-50 p-4 rounded-lg');

    // Create a simple table-based chart instead of bars
    let chartHtml = `
        <h4 class="text-md font-medium text-gray-700 mb-3">Flight Hours by Month</h4>
    `;

    if (!hasValidData) {
        chartHtml += `
            <div class="h-64 flex items-center justify-center">
                <div class="text-gray-500 text-center">
                    <i class="fas fa-chart-bar text-gray-400 text-4xl mb-3"></i>
                    <p>No flight hour data available for this period</p>
                </div>
            </div>
        `;
    } else {
        // Create a table-based chart
        chartHtml += `
            <table class="w-full border-collapse">
                <tr class="h-64 align-bottom">
        `;

        // Generate each bar as a table cell
        for (let i = 0; i < months.length; i++) {
            const hours = flightHours[i];
            const maxHours = Math.max(...flightHours) || 1;
            const heightPx = Math.max(20, Math.round((hours / maxHours) * 200)); // Max height 200px
            const month = months[i].substring(0, 3);

            chartHtml += `
                <td class="text-center align-bottom pb-2">
                    <div class="mx-auto" style="width: 40px; height: ${heightPx}px; background-color: #6366f1; border-top-left-radius: 4px; border-top-right-radius: 4px;"></div>
                    <div class="text-xs mt-2 font-medium">${month}</div>
                    <div class="text-xs text-gray-600">${hours.toFixed(1)}h</div>
                </td>
            `;
        }

        chartHtml += `
                </tr>
            </table>
        `;
    }

    flightHoursChart.innerHTML = chartHtml;

    // Create total salary chart
    const salaryChart = createElement('div', 'bg-gray-50 p-4 rounded-lg');

    // Create a simple table-based chart instead of bars
    let salaryChartHtml = `
        <h4 class="text-md font-medium text-gray-700 mb-3">Total Salary by Month</h4>
    `;

    if (!hasValidData) {
        salaryChartHtml += `
            <div class="h-64 flex items-center justify-center">
                <div class="text-gray-500 text-center">
                    <i class="fas fa-money-bill-wave text-gray-400 text-4xl mb-3"></i>
                    <p>No salary data available for this period</p>
                </div>
            </div>
        `;
    } else {
        // Create a table-based chart
        salaryChartHtml += `
            <table class="w-full border-collapse">
                <tr class="h-64 align-bottom">
        `;

        // Generate each bar as a table cell
        for (let i = 0; i < months.length; i++) {
            const salary = totalSalaries[i];
            const maxSalary = Math.max(...totalSalaries) || 1;
            const heightPx = Math.max(20, Math.round((salary / maxSalary) * 200)); // Max height 200px
            const month = months[i].substring(0, 3);

            salaryChartHtml += `
                <td class="text-center align-bottom pb-2">
                    <div class="mx-auto" style="width: 40px; height: ${heightPx}px; background-color: #10b981; border-top-left-radius: 4px; border-top-right-radius: 4px;"></div>
                    <div class="text-xs mt-2 font-medium">${month}</div>
                    <div class="text-xs text-gray-600">${Math.round(salary)} AED</div>
                </td>
            `;
        }

        salaryChartHtml += `
                </tr>
            </table>
        `;
    }

    salaryChart.innerHTML = salaryChartHtml;



    // Assemble the card
    chartsGrid.appendChild(flightHoursChart);
    chartsGrid.appendChild(salaryChart);

    chartsCard.appendChild(header);
    chartsCard.appendChild(chartsGrid);

    chartsContainer.appendChild(chartsCard);
}


