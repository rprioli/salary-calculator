// Salary Breakdown Component

// Generate and render the salary breakdown card
function renderSalaryBreakdown(selectedRole, calculationResults, salaryBreakdownExpanded) {
    // Get the container element
    const summaryContainer = document.getElementById('summary-sections');

    // Create the salary breakdown element
    const salaryBreakdown = document.createElement('div');
    salaryBreakdown.className = 'bg-white rounded-lg p-6 shadow-md md:col-span-2 card-hover border border-indigo-100';
    salaryBreakdown.id = 'salary-breakdown';

    // Create the header with toggle functionality
    const header = document.createElement('div');
    header.className = 'flex justify-between items-center cursor-pointer mb-4';
    header.id = 'salary-breakdown-header';
    header.setAttribute('role', 'button');
    header.setAttribute('aria-expanded', salaryBreakdownExpanded ? 'true' : 'false');
    header.setAttribute('aria-controls', 'salary-breakdown-content');
    header.setAttribute('tabindex', '0');
    header.innerHTML = `
        <h3 class="text-lg font-medium text-gray-700 flex items-center">
            <i class="fas fa-chart-pie text-indigo-500 mr-2"></i>
            Salary Breakdown
        </h3>
        <i class="fas fa-chevron-down text-indigo-500 transition-transform duration-200 ${salaryBreakdownExpanded ? 'transform rotate-180' : ''}"></i>
    `;
    salaryBreakdown.appendChild(header);

    // Create the content section (always create it, but hide if not expanded)
    const content = document.createElement('div');
    content.id = 'salary-breakdown-content';
    content.className = `transition-all duration-300 ${salaryBreakdownExpanded ? 'opacity-100' : 'opacity-0 hidden'}`;

    // Calculate the fixed and variable components totals
    const fixedTotal = SALARY_DATA[selectedRole]?.basicSalary +
                      SALARY_DATA[selectedRole]?.housingAllowance +
                      SALARY_DATA[selectedRole]?.transportationAllowance;

    const variableTotal = (calculationResults.flightPay || 0) +
                         (calculationResults.asbyPay || 0) +
                         (calculationResults.perDiem || 0);

    content.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-indigo-50 p-4 rounded-lg">
                <h4 class="font-medium text-indigo-700 mb-3 flex items-center">
                    <i class="fas fa-building text-indigo-500 mr-2"></i>
                    Fixed Components
                </h4>
                <div class="space-y-2 mb-4">
                    ${(SALARY_DATA[selectedRole]?.basicSalary > 0) ? `
                    <div class="flex justify-between py-2 border-b border-indigo-200">
                        <span class="text-indigo-700">Basic Salary:</span>
                        <span class="text-gray-800 font-medium">AED ${SALARY_DATA[selectedRole]?.basicSalary?.toFixed(2) || 0}</span>
                    </div>
                    ` : ''}
                    ${(SALARY_DATA[selectedRole]?.housingAllowance > 0) ? `
                    <div class="flex justify-between py-2 border-b border-indigo-200">
                        <span class="text-indigo-700">Housing Allowance:</span>
                        <span class="text-gray-800 font-medium">AED ${SALARY_DATA[selectedRole]?.housingAllowance?.toFixed(2) || 0}</span>
                    </div>
                    ` : ''}
                    ${(SALARY_DATA[selectedRole]?.transportationAllowance > 0) ? `
                    <div class="flex justify-between py-2 border-b border-indigo-200">
                        <span class="text-indigo-700">Transportation:</span>
                        <span class="text-gray-800 font-medium">AED ${SALARY_DATA[selectedRole]?.transportationAllowance?.toFixed(2) || 0}</span>
                    </div>
                    ` : ''}
                    ${(!SALARY_DATA[selectedRole]?.basicSalary && !SALARY_DATA[selectedRole]?.housingAllowance && !SALARY_DATA[selectedRole]?.transportationAllowance) ? `
                    <div class="flex justify-between py-2 border-b border-indigo-200">
                        <span class="text-indigo-700">No fixed components</span>
                        <span class="text-gray-800 font-medium">AED 0.00</span>
                    </div>
                    ` : ''}
                    <div class="flex justify-between py-2 mt-2 font-medium bg-indigo-100 p-2 rounded">
                        <span class="text-indigo-800">Fixed Total:</span>
                        <span class="text-indigo-800">AED ${fixedTotal.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <div class="bg-indigo-50 p-4 rounded-lg">
                <h4 class="font-medium text-indigo-700 mb-3 flex items-center">
                    <i class="fas fa-plane-departure text-indigo-500 mr-2"></i>
                    Variable Components
                </h4>
                <div class="space-y-2 mb-4">
                    ${(calculationResults.flightPay > 0) ? `
                    <div class="flex justify-between py-2 border-b border-indigo-200">
                        <span class="text-indigo-700">Flight Pay:</span>
                        <span class="text-gray-800 font-medium">AED ${(calculationResults.flightPay || 0).toFixed(2)}</span>
                    </div>
                    ` : ''}
                    ${(calculationResults.asbyPay > 0) ? `
                    <div class="flex justify-between py-2 border-b border-indigo-200">
                        <span class="text-indigo-700">Standby Pay:</span>
                        <span class="text-gray-800 font-medium">AED ${(calculationResults.asbyPay || 0).toFixed(2)}</span>
                    </div>
                    ` : ''}
                    ${(calculationResults.perDiem > 0) ? `
                    <div class="flex justify-between py-2 border-b border-indigo-200">
                        <span class="text-indigo-700">Crew Per Diem:</span>
                        <span class="text-gray-800 font-medium">AED ${(calculationResults.perDiem || 0).toFixed(2)}</span>
                    </div>
                    ` : ''}
                    ${(!calculationResults.flightPay && !calculationResults.asbyPay && !calculationResults.perDiem) ? `
                    <div class="flex justify-between py-2 border-b border-indigo-200">
                        <span class="text-indigo-700">No variable payments</span>
                        <span class="text-gray-800 font-medium">AED 0.00</span>
                    </div>
                    ` : ''}
                    <div class="flex justify-between py-2 mt-2 font-medium bg-indigo-100 p-2 rounded">
                        <span class="text-indigo-800">Variable Total:</span>
                        <span class="text-indigo-800">AED ${variableTotal.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="mt-6 p-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg text-white">
            <div class="flex justify-between items-center">
                <div>
                    <h4 class="font-bold text-lg mb-1">Grand Total</h4>
                    <p class="text-indigo-100 text-sm">Fixed + Variable Components</p>
                </div>
                <div class="text-2xl font-bold">AED ${(calculationResults.totalSalary || 0).toFixed(2)}</div>
            </div>
        </div>
    `;

    salaryBreakdown.appendChild(content);

    // Add the salary breakdown to the container (after monthly summary)
    const monthlySummary = document.getElementById('monthly-summary');
    if (monthlySummary) {
        monthlySummary.after(salaryBreakdown);
    } else {
        summaryContainer.appendChild(salaryBreakdown);
    }

    // Add event listeners for toggling (click and keyboard)
    const headerElement = document.getElementById('salary-breakdown-header');
    headerElement.addEventListener('click', toggleSalaryBreakdown);
    headerElement.addEventListener('keydown', function(e) {
        // Toggle on Enter or Space
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleSalaryBreakdown();
        }
    });
}

// Toggle the salary breakdown expanded state
function toggleSalaryBreakdown() {
    salaryBreakdownExpanded = !salaryBreakdownExpanded;
    renderResults();
}
