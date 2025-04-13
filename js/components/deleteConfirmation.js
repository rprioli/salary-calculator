// Delete Confirmation Component

// Render the delete confirmation dialog
function renderDeleteConfirmation(deleteConfirmation, parsedFlights) {
    const container = document.getElementById('delete-confirmation');

    // Hide the dialog if not showing
    if (!deleteConfirmation.show) {
        container.classList.add('hidden');
        // Remove aria attributes when hidden
        container.setAttribute('aria-hidden', 'true');
        return;
    }

    // Get the flight being deleted
    const flight = parsedFlights[deleteConfirmation.flightIndex];

    // Show the dialog
    container.classList.remove('hidden');
    container.setAttribute('aria-hidden', 'false');
    container.setAttribute('role', 'dialog');
    container.setAttribute('aria-modal', 'true');
    container.setAttribute('aria-labelledby', 'delete-dialog-title');
    container.setAttribute('aria-describedby', 'delete-dialog-description');

    // Create the dialog content
    container.innerHTML = `
        <div class="bg-white p-8 rounded-lg shadow-lg max-w-md animate-fade-in">
            <div class="flex items-center mb-4 text-red-500">
                <i class="fas fa-exclamation-triangle h-6 w-6 mr-2"></i>
                <h3 class="text-lg font-medium" id="delete-dialog-title">Delete Flight</h3>
            </div>
            <p class="mb-6 text-gray-600" id="delete-dialog-description">
                ${flight?.isLayover && flight?.isOutbound
                    ? `Are you sure you want to delete the layover flight <span class="font-medium">${flight.flight}</span> to <span class="font-medium">${flight.sector.split(' - ')[1]}</span>? Both outbound and return flights will be deleted. This action cannot be undone.`
                    : `Are you sure you want to delete the flight <span class="font-medium">${flight.flight}</span>? This action cannot be undone.`}
            </p>
            <div class="flex justify-end space-x-3">
                <button
                    id="cancel-delete-btn"
                    class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors btn-hover-effect focus:outline-none focus:ring-2 focus:ring-gray-500"
                    aria-label="Cancel deletion"
                >
                    <i class="fas fa-times mr-1"></i> Cancel
                </button>
                <button
                    id="confirm-delete-btn"
                    class="px-4 py-2 bg-red-500 rounded-md text-white hover:bg-red-600 transition-colors btn-hover-effect focus:outline-none focus:ring-2 focus:ring-red-500"
                    aria-label="Confirm deletion"
                >
                    <i class="fas fa-trash-alt mr-1"></i> Delete
                </button>
            </div>
        </div>
    `;

    // Add event listeners
    document.getElementById('cancel-delete-btn').addEventListener('click', handleCancelDelete);
    document.getElementById('confirm-delete-btn').addEventListener('click', handleConfirmDelete);

    // Add keyboard event listener for Escape key
    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            handleCancelDelete();
        }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Focus the cancel button by default (safer option)
    setTimeout(() => {
        document.getElementById('cancel-delete-btn').focus();
    }, 100);

    // Clean up event listener when dialog is closed
    const cleanupListener = () => {
        if (container.classList.contains('hidden')) {
            document.removeEventListener('keydown', handleKeyDown);
            container.removeEventListener('transitionend', cleanupListener);
        }
    };

    container.addEventListener('transitionend', cleanupListener);
}
