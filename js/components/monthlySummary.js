// Monthly Summary Component

// Generate and render the monthly summary card
function renderMonthlySummary(selectedRole, rosterMonth, rosterYear, calculationResults, monthlySummaryExpanded) {
    // Get the container element
    const summaryContainer = document.getElementById('summary-sections');

    // Create the monthly summary element
    const monthlySummary = document.createElement('div');
    monthlySummary.className = 'bg-indigo-50 rounded-lg p-6 shadow-md card-hover';
    monthlySummary.id = 'monthly-summary';

    // Create the header with toggle functionality
    const header = document.createElement('div');
    header.className = 'flex justify-between items-center cursor-pointer mb-4';
    header.id = 'monthly-summary-header';
    header.setAttribute('role', 'button');
    header.setAttribute('aria-expanded', monthlySummaryExpanded ? 'true' : 'false');
    header.setAttribute('aria-controls', 'monthly-summary-content');
    header.setAttribute('tabindex', '0');
    header.innerHTML = `
        <h3 class="text-lg font-medium text-indigo-700 flex items-center">
            <i class="fas fa-calendar-alt text-indigo-500 mr-2"></i>
            Monthly Summary
        </h3>
        <i class="fas fa-chevron-down text-indigo-500 transition-transform duration-200 ${monthlySummaryExpanded ? 'transform rotate-180' : ''}"></i>
    `;
    monthlySummary.appendChild(header);

    // Create the content section (always create it, but hide if not expanded)
    const content = document.createElement('div');
    content.className = `space-y-3 transition-all duration-300 ${monthlySummaryExpanded ? 'opacity-100' : 'opacity-0 hidden'}`;
    content.id = 'monthly-summary-content';

    // Create an array to hold the HTML content
    let contentSections = [
        `<div class="flex justify-between py-2 border-b border-indigo-200">
            <span class="text-indigo-700"><i class="fas fa-user-tie mr-2"></i>Selected Role:</span>
            <span class="font-medium text-gray-800">${selectedRole === 'CCM' ? 'Cabin Crew Member' : 'Senior Cabin Crew Member'}</span>
        </div>`,
        `<div class="flex justify-between py-2 border-b border-indigo-200">
            <span class="text-indigo-700"><i class="fas fa-calendar mr-2"></i>Roster Month:</span>
            <span class="font-medium text-gray-800">${rosterMonth} ${rosterYear}</span>
        </div>`,
        `<div class="flex justify-between py-2 border-b border-indigo-200">
            <span class="text-indigo-700"><i class="fas fa-credit-card mr-2"></i>Payment Month:</span>
            <span class="font-medium text-gray-800">${getNextMonth(rosterMonth)} ${getNextMonthYear(rosterMonth, rosterYear)}</span>
        </div>`
    ];

    // Only add Flight Hours if greater than 0
    if (calculationResults.totalFlightHours > 0) {
        contentSections.push(`<div class="flex justify-between py-2 border-b border-indigo-200">
            <span class="text-indigo-700"><i class="fas fa-plane mr-2"></i>Flight Hours:</span>
            <span class="font-medium text-gray-800">${formatHoursMinutes(calculationResults.totalFlightHours)} hours</span>
        </div>`);
    }

    // Layover Hours are not displayed as per user request

    // Only add Standby Hours if greater than 0
    if (calculationResults.totalAsbyHours > 0) {
        contentSections.push(`<div class="flex justify-between py-2 border-b border-indigo-200">
            <span class="text-indigo-700"><i class="fas fa-hourglass-half mr-2"></i>Standby Hours:</span>
            <span class="font-medium text-gray-800">${formatHoursMinutes(calculationResults.totalAsbyHours)} hours</span>
        </div>`);
    }

    // Add Total Salary section
    contentSections.push(`<div class="flex justify-between py-3 mt-3 border-t-2 border-indigo-300 font-bold text-lg">
        <span class="text-indigo-800"><i class="fas fa-money-bill-wave mr-2"></i>Total Salary:</span>
        <span class="text-indigo-600 bg-indigo-100 px-3 py-1 rounded-lg">AED ${(calculationResults.totalSalary || 0).toFixed(2)}</span>
    </div>`);

    // Join all sections and set as innerHTML
    content.innerHTML = contentSections.join('');

    // Always add the content to the summary
    monthlySummary.appendChild(content);

    // Add the monthly summary to the container
    summaryContainer.innerHTML = ''; // Clear existing content
    summaryContainer.appendChild(monthlySummary);

    // Add event listeners for toggling (click and keyboard)
    const headerElement = document.getElementById('monthly-summary-header');
    headerElement.addEventListener('click', toggleMonthlySummary);
    headerElement.addEventListener('keydown', function(e) {
        // Toggle on Enter or Space
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleMonthlySummary();
        }
    });
}

// Toggle the monthly summary expanded state
function toggleMonthlySummary() {
    monthlySummaryExpanded = !monthlySummaryExpanded;
    renderResults();
}

