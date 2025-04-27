// Flight details table component

// Generate and render the flight details table
function renderFlightDetailsTable(
  parsedFlights,
  editingFlightIndex,
  editedDebriefTime
) {
  const tableContainer = document.getElementById(
    "flight-details-table-container"
  );
  tableContainer.innerHTML = "";
  tableContainer.className =
    "overflow-x-auto bg-white rounded-lg shadow-md border border-gray-200 table-container";

  // Create table element
  const table = document.createElement("table");
  table.className = "w-full border-collapse mobile-table-view";
  table.setAttribute("aria-label", "Flight details and pay information");

  // Create table header
  const thead = document.createElement("thead");
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
  const tbody = document.createElement("tbody");

  // Add flight rows
  parsedFlights.forEach((flight, index) => {
    const tr = document.createElement("tr");
    // Apply consistent styling for all flight types with hover effect
    tr.className = "border-t border-gray-200 table-row-hover";

    // Set appropriate aria labels for accessibility
    if (flight.isLayover) {
      tr.setAttribute("aria-label", "Layover flight");
    } else if (flight.isTurnaround) {
      tr.setAttribute("aria-label", "Turnaround flight");
    } else if (flight.isAsby) {
      tr.setAttribute("aria-label", "Airport standby duty");
    }

    // Date column
    const tdDate = document.createElement("td");
    tdDate.className = "p-4 text-gray-700";

    // Format the date to include day of week
    let formattedDate = flight.date;
    if (flight.date.includes("-")) {
      // Convert YYYY-MM-DD to DD/MM/YYYY and add day of week
      const dateParts = flight.date.split("-");
      if (dateParts.length === 3) {
        const dateObj = new Date(
          dateParts[0],
          parseInt(dateParts[1]) - 1,
          dateParts[2]
        );
        const dayOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
          dateObj.getDay()
        ];
        formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]} ${dayOfWeek}`;
      }
    }

    tdDate.textContent = formattedDate;
    // Add data attributes for sorting/filtering (future enhancement)
    tdDate.setAttribute("data-date", flight.date);
    tr.appendChild(tdDate);

    // Flight column
    const tdFlight = document.createElement("td");
    tdFlight.className = "p-4 text-gray-700 font-medium";

    // Add special styling and icons for different flight types
    if (flight.isAsby) {
      // Airport standby - yellow with clock icon
      tdFlight.innerHTML = `
        <div class="flex items-center">
          <span class="text-yellow-800 font-medium">${flight.flight}</span>
          <span class="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs flex items-center">
            <i class="fas fa-clock mr-1"></i>ASBY
          </span>
        </div>`;
    } else if (flight.isLayover) {
      // Layover flight - purple with bed icon
      tdFlight.innerHTML = `
        <div class="flex items-center">
          <span>${flight.flight}</span>
          <span class="ml-2 px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs flex items-center">
            <i class="fas fa-bed mr-1"></i>Layover
          </span>
        </div>`;
    } else if (flight.isTurnaround) {
      // Turnaround flight - teal with sync icon
      tdFlight.innerHTML = `
        <div class="flex items-center">
          <span>${flight.flight}</span>
          <span class="ml-2 px-2 py-1 bg-teal-100 text-teal-800 rounded-full text-xs flex items-center">
            <i class="fas fa-sync-alt mr-1"></i>Turnaround
          </span>
        </div>`;
    } else {
      // Regular flight
      tdFlight.innerHTML = `
        <div class="flex items-center">
          <span>${flight.flight}</span>
          <span class="ml-2 px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs flex items-center">
            <i class="fas fa-plane mr-1"></i>Flight
          </span>
        </div>`;
    }
    tr.appendChild(tdFlight);

    // Sector column
    const tdSector = document.createElement("td");
    tdSector.className = "p-4 text-gray-700";

    // Define different arrow SVGs for different flight types
    const standardArrowSvg = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mx-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
        `;

    // Layover arrow - one-way arrow with plane icon
    const layoverArrowSvg = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mx-1" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
        `;

    // Turnaround arrow - circular arrow
    const turnaroundArrowSvg = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mx-1" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
            </svg>
        `;

    // Add special styling for layover flights
    if (flight.isLayover) {
      const sectorParts = flight.sector.split(" - ");
      if (sectorParts.length === 2) {
        tdSector.innerHTML = `
                    <div class="flex items-center">
                        <span class="font-medium">${sectorParts[0]}</span>
                        <span class="text-indigo-500">${layoverArrowSvg}</span>
                        <span class="font-medium">${sectorParts[1]}</span>
                        <span class="ml-2 text-xs text-indigo-600 bg-indigo-50 px-1 py-0.5 rounded">Layover</span>
                    </div>
                `;
      } else {
        tdSector.textContent = flight.sector;
      }
    }
    // Add special styling for turnaround flights
    else if (flight.isTurnaround) {
      // For turnaround flights, we need to simplify the display
      // Example: Convert "DXB - FRU FRU - DXB" to "DXB - FRU - DXB" format
      const sector = flight.sector;

      // Extract unique airport codes from the sector string
      let airports = [];

      // Check if the sector contains multiple segments (like "DXB - FRU FRU - DXB")
      if (sector.includes(" - ")) {
        // Split by " - " to get all segments
        const segments = sector.split(" - ");

        // Process each segment to extract airport codes
        segments.forEach((segment) => {
          // Clean up any extra text after the airport code
          const airportCode = segment.trim().split(" ")[0];

          // Only add unique airport codes
          if (airportCode && !airports.includes(airportCode)) {
            airports.push(airportCode);
          }
        });

        // If we have a complex pattern like "DXB - FRU FRU - DXB", ensure we have the return to origin
        if (
          airports.length >= 2 &&
          airports[0] !== airports[airports.length - 1]
        ) {
          airports.push(airports[0]); // Add the origin airport at the end for the return leg
        }
      }

      // If we couldn't extract airports properly, use default DXB - DEST - DXB format
      if (airports.length < 2) {
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

        airports = [origin, destination, origin];
      }

      // Create the simplified display format with arrows between each airport
      if (airports.length >= 2) {
        let sectorHtml = '<div class="flex items-center">';

        // For turnaround flights, we want to show the first airport, then the destination, then back to origin
        if (airports.length === 3 && airports[0] === airports[2]) {
          // This is a classic turnaround (e.g., DXB-FRU-DXB)
          sectorHtml += `
            <span class="font-medium">${airports[0]}</span>
            <span class="text-teal-500">${turnaroundArrowSvg}</span>
            <span class="font-medium">${airports[1]}</span>
            <span class="ml-2 text-xs text-teal-600 bg-teal-50 px-1 py-0.5 rounded">Turnaround</span>
          `;
        } else {
          // For more complex routes or fallback
          for (let i = 0; i < airports.length; i++) {
            // Add the airport code
            sectorHtml += `<span class="font-medium">${airports[i]}</span>`;

            // Add arrow between airports (but not after the last one)
            if (i < airports.length - 1) {
              sectorHtml += `<span class="text-teal-500">${standardArrowSvg}</span>`;
            }
          }

          // Add turnaround label
          sectorHtml += `<span class="ml-2 text-xs text-teal-600 bg-teal-50 px-1 py-0.5 rounded">Turnaround</span>`;
        }

        sectorHtml += "</div>";
        tdSector.innerHTML = sectorHtml;
      } else {
        tdSector.textContent = flight.sector;
      }
    } else {
      // For regular flights, check if there's a sector with a dash
      if (flight.sector && flight.sector.includes(" - ")) {
        const sectorParts = flight.sector.split(" - ");
        if (sectorParts.length === 2) {
          tdSector.innerHTML = `
                        <div class="flex items-center">
                            <span class="font-medium">${sectorParts[0]}</span>
                            <span class="text-gray-500">${standardArrowSvg}</span>
                            <span class="font-medium">${sectorParts[1]}</span>
                            <span class="ml-2 text-xs text-gray-600 bg-gray-50 px-1 py-0.5 rounded">Flight</span>
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
    const tdReporting = document.createElement("td");
    tdReporting.className = "p-4 text-gray-700";
    tdReporting.textContent = flight.reporting;
    tr.appendChild(tdReporting);

    // Debriefing column
    const tdDebriefing = document.createElement("td");
    tdDebriefing.className = "p-4 text-gray-700";

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
    const tdHours = document.createElement("td");
    tdHours.className = "p-4 text-gray-700 font-medium";
    tdHours.textContent = formatHoursMinutes(flight.hours);
    tr.appendChild(tdHours);

    // Pay column
    const tdPay = document.createElement("td");
    tdPay.className = "p-4 text-gray-700 font-medium";
    tdPay.innerHTML = `<span class="text-indigo-700">AED ${flight.pay.toFixed(
      2
    )}</span>`;
    tr.appendChild(tdPay);

    // Actions column
    const tdActions = document.createElement("td");
    tdActions.className = "p-4 text-gray-700";

    // Only show delete button for non-layover flights or outbound layover flights
    if (!flight.isLayover || (flight.isLayover && flight.isOutbound)) {
      tdActions.innerHTML = `
                <button
                    class="delete-flight-btn text-red-500 hover:text-red-700 text-xs flex items-center transition-colors p-1 rounded focus:outline-none focus:ring-2 focus:ring-red-500 btn-hover-effect"
                    data-index="${index}"
                    aria-label="Delete ${
                      flight.isLayover ? "layover" : ""
                    } flight ${flight.flight}"
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
  document.getElementById(
    "flight-count"
  ).textContent = `${parsedFlights.length} flights`;

  // Add event listeners to edit buttons
  document.querySelectorAll(".edit-debrief-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const index = parseInt(this.getAttribute("data-index"));
      handleEditDebriefTime(index);
    });
  });

  // Add event listeners to delete buttons
  document.querySelectorAll(".delete-flight-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const index = parseInt(this.getAttribute("data-index"));
      handleShowDeleteConfirmation(index);
    });
  });

  // Add event listeners to save and cancel buttons if in edit mode
  if (editingFlightIndex !== null) {
    document
      .getElementById("edit-debrief-input")
      .addEventListener("input", function (e) {
        editedDebriefTime = e.target.value;
      });

    document
      .getElementById("save-debrief-btn")
      .addEventListener("click", handleSaveDebriefTime);
    document
      .getElementById("cancel-edit-btn")
      .addEventListener("click", handleCancelEdit);
  }
}
