// Flight details table component

// Generate and render the flight details table
function renderFlightDetailsTable(parsedFlights, editingFlightIndex, editedDebriefTime) {
    const tableContainer = document.getElementById('flight-details-table-container');
    tableContainer.innerHTML = '';
    tableContainer.className = 'overflow-x-auto bg-white rounded-lg shadow-md border border-gray-200 table-container';

    // Create table element
    const table = document.createElement('table');
    table.className = 'w-full border-collapse mobile-table-view';
    table.setAttribute('aria-label', 'Flight details and pay information');

    // Create table header
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr class="bg-indigo-50 text-indigo-700 text-sm uppercase sticky top-0">
            <th class="p-4 text-left font-medium" scope="col">Date</th>
            <th class="p-4 text-left font-medium" scope="col">Flight</th>
            <th class="p-4 text-left font-medium" scope="col">Sector</th>
            <th class="p-4 text-left font-medium" scope="col">Reporting</th>
            <th class="p-4 text-left font-medium" scope="col">Debriefing</th>
            <th class="p-4 text-left font-medium" scope="col">Hours</th>
            <th class="p-4 text-left font-medium" scope="col">Flight Pay</th>
            <th class="p-4 text-left font-medium" scope="col">Actions</th>
        </tr>
    `;
    table.appendChild(thead);

    // Create table body
    const tbody = document.createElement('tbody');

    // Add flight rows
    parsedFlights.forEach((flight, index) => {
        const tr = document.createElement('tr');
        // Apply consistent styling for all flight types with hover effect
        tr.className = 'border-t border-gray-200 table-row-hover';

        // Set appropriate aria labels for accessibility
        if (flight.isLayover) {
            tr.setAttribute('aria-label', 'Layover flight');
        } else if (flight.isTurnaround) {
            tr.setAttribute('aria-label', 'Turnaround flight');
        } else if (flight.isAsby) {
            tr.setAttribute('aria-label', 'Airport standby duty');
        }

        // Date column
        const tdDate = document.createElement('td');
        tdDate.className = 'p-4 text-gray-700';

        // Format the date to include day of week
        let formattedDate = flight.date;
        if (flight.date.includes('-')) {
            // Convert YYYY-MM-DD to DD/MM/YYYY and add day of week
            const dateParts = flight.date.split('-');
            if (dateParts.length === 3) {
                const dateObj = new Date(dateParts[0], parseInt(dateParts[1])-1, dateParts[2]);
                const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dateObj.getDay()];
                formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]} ${dayOfWeek}`;
            }
        }

        tdDate.textContent = formattedDate;
        // Add data attributes for sorting/filtering (future enhancement)
        tdDate.setAttribute('data-date', flight.date);
        tr.appendChild(tdDate);

        // Flight column
        const tdFlight = document.createElement('td');
        tdFlight.className = 'p-4 text-gray-700 font-medium';

        // Add special styling for ASBY
        if (flight.isAsby) {
            tdFlight.innerHTML = `<span class="text-yellow-800 font-medium">${flight.flight}</span>`;
        }
        // Simple text for all flight types
        else {
            tdFlight.textContent = flight.flight;
        }
        tr.appendChild(tdFlight);

        // Sector column
        const tdSector = document.createElement('td');
        tdSector.className = 'p-4 text-gray-700';

        // Define standard arrow SVG for all flight types - smaller size
        const standardArrowSvg = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mx-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
        `;

        // Add special styling for layover flights
        if (flight.isLayover) {
            const sectorParts = flight.sector.split(' - ');
            if (sectorParts.length === 2) {
                tdSector.innerHTML = `
                    <div class="flex items-center">
                        <span>${sectorParts[0]}</span>
                        <span class="text-indigo-500">${standardArrowSvg}</span>
                        <span>${sectorParts[1]}</span>
                    </div>
                `;
            } else {
                tdSector.textContent = flight.sector;
            }
        }
        // Add special styling for turnaround flights
        else if (flight.isTurnaround) {
            // For turnaround flights, we need to simplify the display
            // Example: Convert "DXB - IKA" to "DXB - IKA - DXB" format
            const sector = flight.sector;

            // Get the first airport code (origin)
            let origin = "DXB"; // Default origin
            if (sector.startsWith("DXB")) {
                origin = "DXB";
            } else if (sector.includes(" - ")) {
                origin = sector.split(" - ")[0];
            }

            // Get the destination airport code
            let destination = "";
            if (sector.includes(" - ")) {
                destination = sector.split(" - ")[1];
                // Clean up any extra text after the airport code
                if (destination.includes(" ")) {
                    destination = destination.split(" ")[0];
                }
            }

            // Create the simplified display format
            if (destination) {
                tdSector.innerHTML = `
                    <div class="flex items-center">
                        <span>${origin}</span>
                        <span class="text-teal-500">${standardArrowSvg}</span>
                        <span>${destination}</span>
                        <span class="text-teal-500">${standardArrowSvg}</span>
                        <span>${origin}</span>
                    </div>
                `;
            } else {
                tdSector.textContent = flight.sector;
            }
        } else {
            // For regular flights, check if there's a sector with a dash
            if (flight.sector && flight.sector.includes(' - ')) {
                const sectorParts = flight.sector.split(' - ');
                if (sectorParts.length === 2) {
                    tdSector.innerHTML = `
                        <div class="flex items-center">
                            <span>${sectorParts[0]}</span>
                            <span class="text-gray-500">${standardArrowSvg}</span>
                            <span>${sectorParts[1]}</span>
                        </div>
                    `;
                } else {
                    tdSector.textContent = flight.sector;
                }
            } else {
                tdSector.textContent = flight.sector;
            }
        }
        tr.appendChild(tdSector);

        // Reporting column
        const tdReporting = document.createElement('td');
        tdReporting.className = 'p-4 text-gray-700';
        tdReporting.textContent = flight.reporting;
        tr.appendChild(tdReporting);

        // Debriefing column
        const tdDebriefing = document.createElement('td');
        tdDebriefing.className = 'p-4 text-gray-700';

        if (editingFlightIndex === index) {
            // Show edit form if this is the row being edited
            tdDebriefing.innerHTML = `
                <div class="flex items-center space-x-2">
                    <input
                        type="text"
                        id="edit-debrief-input"
                        value="${editedDebriefTime}"
                        class="border border-gray-300 p-1 w-20 text-sm rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        aria-label="Edit debriefing time"
                    />
                    <button
                        id="save-debrief-btn"
                        class="bg-green-500 text-white p-1 rounded text-xs hover:bg-green-600 transition-colors btn-hover-effect focus:outline-none focus:ring-2 focus:ring-green-500"
                        aria-label="Save debriefing time"
                    >
                        <i class="fas fa-check mr-1"></i> Save
                    </button>
                    <button
                        id="cancel-edit-btn"
                        class="bg-gray-500 text-white p-1 rounded text-xs hover:bg-gray-600 transition-colors btn-hover-effect focus:outline-none focus:ring-2 focus:ring-gray-500"
                        aria-label="Cancel editing"
                    >
                        <i class="fas fa-times mr-1"></i> Cancel
                    </button>
                </div>
            `;
        } else {
            // Show normal view with edit button
            tdDebriefing.innerHTML = `
                <div class="flex items-center space-x-2">
                    <span>${flight.debriefing}</span>
                    <button
                        class="edit-debrief-btn text-indigo-500 hover:text-indigo-700 text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded p-1"
                        data-index="${index}"
                        aria-label="Edit debriefing time for ${flight.flight}"
                    >
                        <i class="fas fa-edit mr-1"></i> Edit
                    </button>
                </div>
            `;
        }
        tr.appendChild(tdDebriefing);

        // Hours column
        const tdHours = document.createElement('td');
        tdHours.className = 'p-4 text-gray-700 font-medium';
        tdHours.textContent = formatHoursMinutes(flight.hours);
        tr.appendChild(tdHours);

        // Pay column
        const tdPay = document.createElement('td');
        tdPay.className = 'p-4 text-gray-700 font-medium';
        tdPay.innerHTML = `<span class="text-indigo-700">AED ${flight.pay.toFixed(2)}</span>`;
        tr.appendChild(tdPay);

        // Actions column
        const tdActions = document.createElement('td');
        tdActions.className = 'p-4 text-gray-700';

        // Only show delete button for non-layover flights or outbound layover flights
        if (!flight.isLayover || (flight.isLayover && flight.isOutbound)) {
            tdActions.innerHTML = `
                <button
                    class="delete-flight-btn text-red-500 hover:text-red-700 text-xs flex items-center transition-colors p-1 rounded focus:outline-none focus:ring-2 focus:ring-red-500 btn-hover-effect"
                    data-index="${index}"
                    aria-label="Delete ${flight.isLayover ? 'layover' : ''} flight ${flight.flight}"
                >
                    <i class="fas fa-trash-alt mr-1"></i>
                    Delete
                </button>
            `;
        }
        tr.appendChild(tdActions);

        // Add the row to the table body
        tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    tableContainer.appendChild(table);

    // Update the flight count
    document.getElementById('flight-count').textContent = `${parsedFlights.length} flights`;

    // Add event listeners to edit buttons
    document.querySelectorAll('.edit-debrief-btn').forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            handleEditDebriefTime(index);
        });
    });

    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-flight-btn').forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            handleShowDeleteConfirmation(index);
        });
    });

    // Add event listeners to save and cancel buttons if in edit mode
    if (editingFlightIndex !== null) {
        document.getElementById('edit-debrief-input').addEventListener('input', function(e) {
            editedDebriefTime = e.target.value;
        });

        document.getElementById('save-debrief-btn').addEventListener('click', handleSaveDebriefTime);
        document.getElementById('cancel-edit-btn').addEventListener('click', handleCancelEdit);
    }
}
