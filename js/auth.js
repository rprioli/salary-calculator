/**
 * Authentication module for Skywage
 * Handles user authentication, sign-in, sign-out, and session management
 */

// Check if user is authenticated
function checkAuthentication() {
    const isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true';

    // If not authenticated, redirect to sign-in
    if (!isAuthenticated) {
        window.location.href = 'sign-in.html';
        return false;
    }

    return true;
}

// Sign in a user
function signIn(email, position = 'ccm', airline = 'flydubai') {
    // Store authentication data in session storage
    sessionStorage.setItem('isAuthenticated', 'true');
    sessionStorage.setItem('userEmail', email);
    sessionStorage.setItem('userPosition', position);
    sessionStorage.setItem('userAirline', airline);

    // Update user data in local storage (our "database")
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const userIndex = registeredUsers.findIndex(user => user.email === email);

    if (userIndex === -1) {
        // Add new user if not found
        registeredUsers.push({
            email: email,
            position: position,
            airline: airline
        });
    } else {
        // Update existing user
        registeredUsers[userIndex].position = position;
        registeredUsers[userIndex].airline = airline;
    }

    localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));

    return true;
}

// Sign out a user
function signOut() {
    // Clear authentication data
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('userEmail');
    sessionStorage.removeItem('userPosition');
    sessionStorage.removeItem('userAirline');

    // Redirect to sign-in page
    window.location.href = 'sign-in.html';
}

// Get current user data
function getCurrentUser() {
    return {
        email: sessionStorage.getItem('userEmail'),
        position: sessionStorage.getItem('userPosition'),
        airline: sessionStorage.getItem('userAirline'),
        isAuthenticated: sessionStorage.getItem('isAuthenticated') === 'true'
    };
}

// Update user position
function updateUserPosition(position) {
    const previousPosition = sessionStorage.getItem('userPosition');

    // Update session storage
    sessionStorage.setItem('userPosition', position);

    // Update user data in local storage
    const email = sessionStorage.getItem('userEmail');
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const userIndex = registeredUsers.findIndex(user => user.email === email);

    if (userIndex !== -1) {
        registeredUsers[userIndex].position = position;
        localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
    }

    return {
        changed: previousPosition !== position,
        previousPosition: previousPosition,
        newPosition: position
    };
}

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
    const userNameElement = document.getElementById('user-name');

    if (userEmailElement) {
        // Get user email from session storage
        const userEmail = sessionStorage.getItem('userEmail');

        if (userEmail) {
            userEmailElement.textContent = userEmail;
        } else {
            userEmailElement.textContent = 'Guest User';
        }
    }

    if (userNameElement) {
        userNameElement.textContent = 'Welcome back!';
    }
}

// Setup event listeners for auth-related elements
function setupAuthEventListeners() {
    // Add event listener for sign out button
    const signOutButton = document.getElementById('sign-out-button');
    if (signOutButton) {
        signOutButton.addEventListener('click', function(event) {
            event.preventDefault();
            signOut();
        });
    }
}

// Initialize auth module when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize user menu
    initUserMenu();

    // Update user email display
    updateUserDisplay();

    // Setup auth event listeners
    setupAuthEventListeners();
});

// Export functions for use in other files
window.auth = {
    checkAuthentication,
    signIn,
    signOut,
    getCurrentUser,
    updateUserPosition,
    updateUserDisplay,
    initUserMenu,
    setupAuthEventListeners
};
