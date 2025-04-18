// Flight details cards component

// Generate and render the flight details as cards
function renderFlightDetailsCards(parsedFlights, editingFlightIndex, editedDebriefTime) {
    const cardsContainer = document.getElementById('flight-details-table-container');
    cardsContainer.innerHTML = '';
    cardsContainer.className = 'p-4 bg-white rounded-lg shadow-md border border-gray-200';

    // Create cards container with grid layout
    const cardsGrid = document.createElement('div');
    cardsGrid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4';

    // Add flight count
    const flightCountDiv = document.createElement('div');
    flightCountDiv.className = 'col-span-full mb-4 flex items-center';
    flightCountDiv.innerHTML = `
        <div class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span class="text-lg font-medium text-gray-700" id="flight-count">${parsedFlights.length} flights</span>
        </div>
    `;
    cardsGrid.appendChild(flightCountDiv);

    // Add flight cards
    parsedFlights.forEach((flight, index) => {
        // Create card element
        const card = document.createElement('div');
        card.className = 'bg-white rounded-lg shadow border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg flight-card';

        // Add special styling based on flight type
        if (flight.isLayover) {
            card.classList.add('border-l-4', 'border-l-indigo-500');
        } else if (flight.isTurnaround) {
            card.classList.add('border-l-4', 'border-l-teal-500');
        } else if (flight.isAsby) {
            card.classList.add('border-l-4', 'border-l-yellow-500');
        }

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

        // Card header with date and flight number
        const cardHeader = document.createElement('div');
        cardHeader.className = 'bg-gray-50 px-4 py-3 border-b border-gray-200';

        // Flight number display
        let flightDisplay = flight.flight;
        if (flight.isAsby) {
            flightDisplay = `<span class="text-yellow-800 font-medium">${flight.flight}</span>`;
        }

        cardHeader.innerHTML = `
            <div class="flex justify-between items-center">
                <h3 class="text-md font-medium text-gray-700">${formattedDate}</h3>
                <span class="text-md font-medium">${flightDisplay}</span>
            </div>
        `;
        card.appendChild(cardHeader);

        // Card body with flight details
        const cardBody = document.createElement('div');
        cardBody.className = 'px-4 py-3';

        // Sector display
        let sectorDisplay = flight.sector;

        // Define standard arrow SVG
        const standardArrowSvg = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mx-1 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
        `;

        // Format sector display based on flight type
        if (flight.isLayover) {
            const sectorParts = flight.sector.split(' - ');
            if (sectorParts.length === 2) {
                sectorDisplay = `
                    <span>${sectorParts[0]}</span>
                    <span class="text-indigo-500">${standardArrowSvg}</span>
                    <span>${sectorParts[1]}</span>
                `;
            }
        } else if (flight.isTurnaround) {
            // For turnaround flights, simplify the display
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
                sectorDisplay = `
                    <span>${origin}</span>
                    <span class="text-teal-500">${standardArrowSvg}</span>
                    <span>${destination}</span>
                    <span class="text-teal-500">${standardArrowSvg}</span>
                    <span>${origin}</span>
                `;
            }
        } else {
            // For regular flights, check if there's a sector with a dash
            if (flight.sector && flight.sector.includes(' - ')) {
                const sectorParts = flight.sector.split(' - ');
                if (sectorParts.length === 2) {
                    sectorDisplay = `
                        <span>${sectorParts[0]}</span>
                        <span class="text-gray-500">${standardArrowSvg}</span>
                        <span>${sectorParts[1]}</span>
                    `;
                }
            }
        }

        // Debriefing time display - with edit functionality
        let debriefingDisplay = '';
        if (editingFlightIndex === index) {
            // Show edit form if this is the card being edited
            debriefingDisplay = `
                <div class="flex items-center space-x-2 mt-1">
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
            debriefingDisplay = `
                <div class="flex items-center space-x-2 mt-1">
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

        // Add flight details to card body
        cardBody.innerHTML = `
            <div class="grid grid-cols-1 gap-2">
                <div class="flex items-center">
                    <div class="text-gray-700">${sectorDisplay}</div>
                </div>
                <div class="grid grid-cols-2 gap-2">
                    <div>
                        <div class="text-xs text-gray-500">Reporting</div>
                        <div class="text-gray-700">${flight.reporting}</div>
                    </div>
                    <div>
                        <div class="text-xs text-gray-500">Debriefing</div>
                        ${debriefingDisplay}
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-2 mt-2">
                    <div>
                        <div class="text-xs text-gray-500">Hours</div>
                        <div class="text-gray-700 font-medium">${formatHoursMinutes(flight.hours)}</div>
                    </div>
                    <div>
                        <div class="text-xs text-gray-500">Flight Pay</div>
                        <div class="text-indigo-700 font-medium">AED ${flight.pay.toFixed(2)}</div>
                    </div>
                </div>
            </div>
        `;
        card.appendChild(cardBody);

        // Card footer with actions
        const cardFooter = document.createElement('div');
        cardFooter.className = 'px-4 py-3 bg-gray-50 border-t border-gray-200';

        // Only show delete button for non-layover flights or outbound layover flights
        if (!flight.isLayover || (flight.isLayover && flight.isOutbound)) {
            cardFooter.innerHTML = `
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
        card.appendChild(cardFooter);

        // Add the card to the grid
        cardsGrid.appendChild(card);
    });

    cardsContainer.appendChild(cardsGrid);

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
