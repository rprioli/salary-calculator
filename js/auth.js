// Authentication and user menu functionality

document.addEventListener('DOMContentLoaded', function() {
    // Initialize user menu
    initUserMenu();
    
    // Update user email display
    updateUserDisplay();
    
    // Add event listener for sign out button
    const signOutButton = document.getElementById('sign-out-button');
    if (signOutButton) {
        signOutButton.addEventListener('click', function(event) {
            event.preventDefault();
            signOut();
        });
    }
});

// Initialize user menu dropdown
function initUserMenu() {
    const userMenuButton = document.getElementById('user-menu-button');
    const userDropdown = document.getElementById('user-dropdown');
    
    if (userMenuButton && userDropdown) {
        // Toggle dropdown when clicking the user menu button
        userMenuButton.addEventListener('click', function() {
            userDropdown.classList.toggle('hidden');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(event) {
            if (!userMenuButton.contains(event.target) && !userDropdown.contains(event.target)) {
                userDropdown.classList.add('hidden');
            }
        });
    }
}

// Update user email display
function updateUserDisplay() {
    const userEmailElement = document.getElementById('user-email');
    if (userEmailElement) {
        // Get user email from session storage
        const userEmail = sessionStorage.getItem('userEmail');
        
        if (userEmail) {
            userEmailElement.textContent = userEmail;
        } else {
            userEmailElement.textContent = 'Guest User';
        }
    }
}

// Sign out function
function signOut() {
    // Clear authentication data
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('userEmail');
    
    // Redirect to sign-in page
    window.location.href = 'sign-in.html';
}
