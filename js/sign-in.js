// Sign-in functionality

document.addEventListener('DOMContentLoaded', function() {
    // Get the sign-in form
    const signInForm = document.getElementById('sign-in-form');

    // Add event listener for form submission
    if (signInForm) {
        signInForm.addEventListener('submit', function(event) {
            // Prevent the default form submission
            event.preventDefault();

            // Get form values
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const rememberMe = document.getElementById('remember-me').checked;

            // For now, just log the values and redirect to the main app
            console.log('Sign-in attempt:', { email, password, rememberMe });

            // Store the email in localStorage if remember me is checked
            if (rememberMe) {
                localStorage.setItem('userEmail', email);
            } else {
                localStorage.removeItem('userEmail');
            }

            // Simulate authentication (will be replaced with actual backend later)
            simulateAuthentication(email, password);
        });
    }

    // Check if there's a stored email and populate the field
    const storedEmail = localStorage.getItem('userEmail');
    if (storedEmail) {
        const emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.value = storedEmail;
            document.getElementById('remember-me').checked = true;
        }
    }
});

// Function to simulate authentication (will be replaced with actual backend later)
function simulateAuthentication(email, password) {
    // Show loading state
    const signInButton = document.getElementById('sign-in-button');
    const originalButtonText = signInButton.innerHTML;
    signInButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Signing in...';
    signInButton.disabled = true;

    // Hide any previous error messages
    const errorMessage = document.getElementById('error-message');
    if (errorMessage) {
        errorMessage.classList.add('hidden');
    }

    // Show loading indicator if ui-utils is available
    let loadingIndicator;
    if (window.ui && window.ui.showLoading) {
        loadingIndicator = window.ui.showLoading('Signing in...');
    }

    // Simulate API call delay
    setTimeout(function() {
        // Check if the user exists in our "database" (localStorage)
        const registeredUsers = window.dataManager ?
            window.dataManager.getRegisteredUsers() :
            JSON.parse(localStorage.getItem('registeredUsers') || '[]');

        const user = registeredUsers.find(u => u.email === email && u.password === password);

        // Hide loading indicator if it was shown
        if (loadingIndicator && window.ui && window.ui.hideLoading) {
            window.ui.hideLoading(loadingIndicator);
        }

        if (user) {
            // Use auth module if available
            if (window.auth && window.auth.signIn) {
                window.auth.signIn(email, user.position, user.airline);
                window.location.href = 'index.html';
            } else {
                // Fallback to direct sessionStorage manipulation
                sessionStorage.setItem('isAuthenticated', 'true');
                sessionStorage.setItem('userEmail', email);
                sessionStorage.setItem('userAirline', user.airline);
                sessionStorage.setItem('userPosition', user.position);

                // Redirect to the main application
                window.location.href = 'index.html';
            }
        } else {
            // Show error message
            if (window.ui && window.ui.showNotification) {
                window.ui.showNotification('error', 'Invalid email or password. Please try again.');
            } else if (errorMessage) {
                const errorText = document.getElementById('error-text');
                if (errorText) {
                    errorText.textContent = 'Invalid email or password. Please try again.';
                }
                errorMessage.classList.remove('hidden');
            }

            // Reset button
            signInButton.innerHTML = originalButtonText;
            signInButton.disabled = false;
        }
    }, 1500); // 1.5 second delay to simulate network request
}
