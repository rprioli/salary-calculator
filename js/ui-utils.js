/**
 * UI Utilities Module for Skywage
 * Provides common UI functionality like notifications, loading indicators, etc.
 */

// Show a notification message
function showNotification(type, message, duration = 3000) {
    // Remove any existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => {
        notification.remove();
    });
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification fixed bottom-4 right-4 px-4 py-2 rounded-md shadow-lg z-50';
    
    // Set style based on notification type
    switch (type) {
        case 'success':
            notification.className += ' bg-green-500 text-white';
            notification.innerHTML = `<i class="fas fa-check-circle mr-2"></i>${message}`;
            break;
        case 'error':
            notification.className += ' bg-red-500 text-white';
            notification.innerHTML = `<i class="fas fa-exclamation-circle mr-2"></i>${message}`;
            break;
        case 'info':
            notification.className += ' bg-blue-500 text-white';
            notification.innerHTML = `<i class="fas fa-info-circle mr-2"></i>${message}`;
            break;
        case 'warning':
            notification.className += ' bg-yellow-500 text-white';
            notification.innerHTML = `<i class="fas fa-exclamation-triangle mr-2"></i>${message}`;
            break;
        default:
            notification.className += ' bg-gray-700 text-white';
            notification.textContent = message;
    }
    
    // Add to document
    document.body.appendChild(notification);
    
    // Remove after duration
    setTimeout(() => {
        notification.classList.add('opacity-0');
        notification.style.transition = 'opacity 0.5s ease';
        
        // Remove from DOM after fade out
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, duration);
    
    return notification;
}

// Show a loading indicator
function showLoading(message = 'Loading...') {
    // Create loading overlay
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    
    // Create loading spinner
    const loadingSpinner = document.createElement('div');
    loadingSpinner.className = 'loading-spinner bg-white p-6 rounded-lg shadow-lg text-center';
    loadingSpinner.innerHTML = `
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p class="text-gray-700">${message}</p>
    `;
    
    // Add spinner to overlay
    loadingOverlay.appendChild(loadingSpinner);
    
    // Add to document
    document.body.appendChild(loadingOverlay);
    
    // Return the overlay element so it can be removed later
    return loadingOverlay;
}

// Hide loading indicator
function hideLoading(loadingElement) {
    if (loadingElement) {
        loadingElement.remove();
    } else {
        // If no specific element provided, remove all loading overlays
        const loadingOverlays = document.querySelectorAll('.loading-overlay');
        loadingOverlays.forEach(overlay => {
            overlay.remove();
        });
    }
}

// Show a confirmation dialog
function showConfirmDialog(title, message, confirmText = 'Confirm', cancelText = 'Cancel') {
    return new Promise((resolve) => {
        // Create dialog overlay
        const dialogOverlay = document.createElement('div');
        dialogOverlay.className = 'dialog-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        
        // Create dialog box
        const dialogBox = document.createElement('div');
        dialogBox.className = 'dialog-box bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto';
        dialogBox.innerHTML = `
            <h3 class="text-lg font-medium text-gray-900 mb-2">${title}</h3>
            <p class="text-gray-600 mb-6">${message}</p>
            <div class="flex justify-end space-x-3">
                <button class="cancel-button px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors">
                    ${cancelText}
                </button>
                <button class="confirm-button px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors">
                    ${confirmText}
                </button>
            </div>
        `;
        
        // Add dialog to overlay
        dialogOverlay.appendChild(dialogBox);
        
        // Add to document
        document.body.appendChild(dialogOverlay);
        
        // Add event listeners
        const confirmButton = dialogBox.querySelector('.confirm-button');
        const cancelButton = dialogBox.querySelector('.cancel-button');
        
        confirmButton.addEventListener('click', () => {
            dialogOverlay.remove();
            resolve(true);
        });
        
        cancelButton.addEventListener('click', () => {
            dialogOverlay.remove();
            resolve(false);
        });
        
        // Close on overlay click
        dialogOverlay.addEventListener('click', (event) => {
            if (event.target === dialogOverlay) {
                dialogOverlay.remove();
                resolve(false);
            }
        });
    });
}

// Format currency
function formatCurrency(amount, currency = 'AED') {
    return `${amount.toLocaleString()} ${currency}`;
}

// Format date
function formatDate(dateString, format = 'short') {
    try {
        const date = new Date(dateString);
        
        // Check if date is valid
        if (isNaN(date.getTime())) {
            console.warn('Invalid date in formatDate:', dateString);
            return 'Invalid date';
        }
        
        switch (format) {
            case 'full':
                // Format as "Monday, 15 April 2024"
                return date.toLocaleDateString('en-GB', {
                    weekday: 'long',
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                });
            case 'medium':
                // Format as "Mon, 15 Apr 2024"
                return date.toLocaleDateString('en-GB', {
                    weekday: 'short',
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                });
            case 'short':
            default:
                // Format as "15 Apr" with day of week
                return date.toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    weekday: 'short'
                });
        }
    } catch (e) {
        console.error('Error formatting date:', dateString, e);
        return 'Error';
    }
}

// Export functions for use in other files
window.ui = {
    showNotification,
    showLoading,
    hideLoading,
    showConfirmDialog,
    formatCurrency,
    formatDate
};
