/**
 * Components Module for Skywage
 * Provides reusable UI components and templates
 */

// Create a sidebar menu item
function createSidebarMenuItem(icon, text, href, isActive = false) {
    const menuItem = document.createElement('a');
    menuItem.href = href;
    menuItem.className = `flex items-center px-4 py-3 rounded-lg transition-colors ${
        isActive 
            ? 'bg-white bg-opacity-10 text-white' 
            : 'text-white text-opacity-70 hover:bg-white hover:bg-opacity-10 hover:text-white'
    }`;
    
    menuItem.innerHTML = `
        <i class="${icon} w-5 h-5 mr-3"></i>
        <span>${text}</span>
    `;
    
    return menuItem;
}

// Create a stat card
function createStatCard(title, value, icon, color, percentage = 0) {
    const card = document.createElement('div');
    card.className = 'stat-card bg-white rounded-lg shadow-md p-4 flex flex-col';
    
    card.innerHTML = `
        <div class="flex items-center justify-between mb-4">
            <h3 class="text-gray-500 text-sm font-medium">${title}</h3>
            <div class="w-8 h-8 rounded-full flex items-center justify-center ${color}">
                <i class="${icon} text-white text-sm"></i>
            </div>
        </div>
        <div class="stat-card-value text-2xl font-bold text-gray-800 mb-2">${value}</div>
        <div class="flex items-center">
            <svg class="w-10 h-10" viewBox="0 0 36 36">
                <path class="circle-bg" fill="none" stroke="#eee" stroke-width="3" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path class="circle-progress-value" fill="none" stroke="${color.replace('bg-', 'text-')}" stroke-width="3"
                    stroke-dasharray="${percentage}, 100"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <span class="text-xs text-gray-500 ml-2">${percentage}% of target</span>
        </div>
    `;
    
    return card;
}

// Create a flight card
function createFlightCard(flight) {
    const card = document.createElement('div');
    card.className = 'flight-card bg-white rounded-lg shadow-sm p-4 mb-3';
    
    // Format date
    const formattedDate = window.ui.formatDate(flight.date);
    
    // Determine if it's a layover or turnaround
    const isLayover = flight.route.includes(' - ') && !flight.route.includes('DXB');
    
    // Create icon based on flight type
    let flightTypeIcon = '';
    if (isLayover) {
        flightTypeIcon = '<i class="fas fa-bed text-blue-500 ml-2" title="Layover"></i>';
    } else if (flight.route.includes(' - ')) {
        flightTypeIcon = '<i class="fas fa-sync-alt text-green-500 ml-2" title="Turnaround"></i>';
    }
    
    card.innerHTML = `
        <div class="flex justify-between items-start">
            <div>
                <div class="text-sm text-gray-500">${formattedDate}</div>
                <div class="font-medium text-gray-800 mt-1">${flight.flightNumber} ${flightTypeIcon}</div>
            </div>
            <div class="text-right">
                <div class="text-sm text-gray-500">Flight Pay</div>
                <div class="font-medium text-gray-800 mt-1">${flight.flightPay} AED</div>
            </div>
        </div>
        <div class="flex justify-between items-center mt-3">
            <div class="text-sm text-gray-600">${flight.route}</div>
            <div class="text-sm text-gray-600">${flight.flightHours} hours</div>
        </div>
    `;
    
    return card;
}

// Create a salary breakdown card
function createSalaryBreakdownCard(calculationResults, position) {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-lg shadow-md p-5';
    
    // Get position display name
    const positionDisplay = position === 'sccm' ? 'SCCM' : 'CCM';
    
    card.innerHTML = `
        <h3 class="text-lg font-medium text-gray-800 mb-4">Salary Breakdown (${positionDisplay})</h3>
        <div class="space-y-3">
            <div class="flex justify-between items-center pb-2 border-b border-gray-100">
                <span class="text-gray-600">Basic Salary</span>
                <span class="font-medium">${calculationResults.basicSalary} AED</span>
            </div>
            <div class="flex justify-between items-center pb-2 border-b border-gray-100">
                <span class="text-gray-600">Housing Allowance</span>
                <span class="font-medium">${calculationResults.housingAllowance} AED</span>
            </div>
            <div class="flex justify-between items-center pb-2 border-b border-gray-100">
                <span class="text-gray-600">Transportation Allowance</span>
                <span class="font-medium">${calculationResults.transportationAllowance} AED</span>
            </div>
            <div class="flex justify-between items-center pb-2 border-b border-gray-100">
                <span class="text-gray-600">Flight Pay (${calculationResults.totalFlightHours} hours)</span>
                <span class="font-medium">${calculationResults.flightPay} AED</span>
            </div>
            <div class="flex justify-between items-center pt-2 font-bold">
                <span class="text-gray-800">Total Salary</span>
                <span class="text-gray-800">${calculationResults.totalSalary} AED</span>
            </div>
        </div>
    `;
    
    return card;
}

// Create a chart container
function createChartContainer(id, title) {
    const container = document.createElement('div');
    container.className = 'bg-white rounded-lg shadow-md p-5 mb-6';
    
    container.innerHTML = `
        <h3 class="text-lg font-medium text-gray-800 mb-4">${title}</h3>
        <div class="chart-container" style="position: relative; height: 300px;">
            <canvas id="${id}"></canvas>
        </div>
    `;
    
    return container;
}

// Create a sidebar
function createSidebar(currentPage) {
    const sidebar = document.createElement('div');
    sidebar.className = 'sidebar bg-indigo-900 text-white w-64 flex-shrink-0 h-screen fixed left-0 top-0 z-10';
    
    sidebar.innerHTML = `
        <div class="p-4">
            <div class="flex items-center justify-center mb-8 pt-4">
                <h1 class="text-xl font-bold text-white">Skywage</h1>
            </div>
            <nav class="space-y-1">
                <!-- Menu items will be added here -->
            </nav>
        </div>
    `;
    
    // Add menu items
    const nav = sidebar.querySelector('nav');
    
    // Dashboard
    nav.appendChild(createSidebarMenuItem(
        'fas fa-home',
        'Dashboard',
        'index.html',
        currentPage === 'dashboard'
    ));
    
    // Statistics
    nav.appendChild(createSidebarMenuItem(
        'fas fa-chart-bar',
        'Statistics',
        'statistics.html',
        currentPage === 'statistics'
    ));
    
    // Profile
    nav.appendChild(createSidebarMenuItem(
        'fas fa-user',
        'Profile',
        'profile.html',
        currentPage === 'profile'
    ));
    
    return sidebar;
}

// Create a header
function createHeader(title) {
    const header = document.createElement('header');
    header.className = 'bg-white shadow-sm py-4 px-6 flex justify-between items-center';
    
    header.innerHTML = `
        <h1 class="text-xl font-semibold text-gray-800">${title}</h1>
        <div class="flex items-center">
            <div class="relative">
                <button id="user-menu-button" class="flex items-center text-gray-700 focus:outline-none">
                    <span id="user-email" class="mr-2 text-sm">User</span>
                    <img class="h-8 w-8 rounded-full bg-gray-200" src="img/avatar.png" alt="User avatar">
                </button>
                <div id="user-dropdown" class="hidden absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                    <a href="profile.html" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</a>
                    <a href="#" id="sign-out-button" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Sign out</a>
                </div>
            </div>
        </div>
    `;
    
    return header;
}

// Create a main content container
function createMainContent() {
    const main = document.createElement('main');
    main.className = 'flex-grow p-6 ml-64 pt-4';
    
    return main;
}

// Create a page layout
function createPageLayout(title, currentPage) {
    const container = document.createElement('div');
    container.className = 'flex h-screen bg-gray-50';
    
    // Create sidebar
    const sidebar = createSidebar(currentPage);
    
    // Create main content area
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'flex-1 flex flex-col ml-64';
    
    // Create header
    const header = createHeader(title);
    
    // Create main content
    const main = createMainContent();
    
    // Assemble the layout
    contentWrapper.appendChild(header);
    contentWrapper.appendChild(main);
    
    container.appendChild(sidebar);
    container.appendChild(contentWrapper);
    
    return {
        container,
        sidebar,
        header,
        main
    };
}

// Export functions for use in other files
window.components = {
    createSidebarMenuItem,
    createStatCard,
    createFlightCard,
    createSalaryBreakdownCard,
    createChartContainer,
    createSidebar,
    createHeader,
    createMainContent,
    createPageLayout
};
