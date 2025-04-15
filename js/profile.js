// Profile page functionality

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is authenticated
    checkAuthentication();
    
    // Load user profile data
    loadUserProfile();
    
    // Add event listener for form submission
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', function(event) {
            event.preventDefault();
            saveUserProfile();
        });
    }
    
    // Add event listener for sign out link
    const signOutLink = document.getElementById('sign-out-link');
    if (signOutLink) {
        signOutLink.addEventListener('click', function(event) {
            event.preventDefault();
            signOut();
        });
    }
});

// Check if user is authenticated
function checkAuthentication() {
    const isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true';
    
    if (!isAuthenticated) {
        // Redirect to sign-in page if not authenticated
        window.location.href = 'sign-in.html';
    }
}

// Load user profile data
function loadUserProfile() {
    // Get user data from session storage
    const userEmail = sessionStorage.getItem('userEmail');
    const userAirline = sessionStorage.getItem('userAirline');
    const userPosition = sessionStorage.getItem('userPosition');
    
    // Update profile email display
    const profileEmail = document.getElementById('profile-email');
    if (profileEmail && userEmail) {
        profileEmail.textContent = userEmail;
    }
    
    // Fill form fields
    const emailInput = document.getElementById('email');
    const airlineSelect = document.getElementById('airline');
    const positionSelect = document.getElementById('position');
    
    if (emailInput && userEmail) {
        emailInput.value = userEmail;
    }
    
    if (airlineSelect && userAirline) {
        airlineSelect.value = userAirline;
    }
    
    if (positionSelect && userPosition) {
        positionSelect.value = userPosition;
    }
}

// Save user profile data
function saveUserProfile() {
    // Get form values
    const email = document.getElementById('email').value;
    const airline = document.getElementById('airline').value;
    const position = document.getElementById('position').value;
    
    // Show loading state
    const saveButton = document.getElementById('save-profile-button');
    const originalButtonText = saveButton.innerHTML;
    saveButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Saving...';
    saveButton.disabled = true;
    
    // Simulate API call delay
    setTimeout(function() {
        // Update user data in session storage
        sessionStorage.setItem('userAirline', airline);
        sessionStorage.setItem('userPosition', position);
        
        // Update user data in local storage (our "database")
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const userIndex = registeredUsers.findIndex(user => user.email === email);
        
        if (userIndex !== -1) {
            registeredUsers[userIndex].airline = airline;
            registeredUsers[userIndex].position = position;
            localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
        }
        
        // Show success message
        const successMessage = document.getElementById('success-message');
        successMessage.classList.remove('hidden');
        
        // Reset button
        saveButton.innerHTML = originalButtonText;
        saveButton.disabled = false;
        
        // Hide success message after 3 seconds
        setTimeout(function() {
            successMessage.classList.add('hidden');
        }, 3000);
    }, 1000); // 1 second delay to simulate network request
}

// Sign out function
function signOut() {
    // Clear authentication data
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('userEmail');
    sessionStorage.removeItem('userAirline');
    sessionStorage.removeItem('userPosition');
    
    // Redirect to sign-in page
    window.location.href = 'sign-in.html';
}
