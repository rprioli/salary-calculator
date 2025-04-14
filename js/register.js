// Registration functionality

document.addEventListener('DOMContentLoaded', function() {
    // Get the registration form
    const registerForm = document.getElementById('register-form');
    
    // Add event listener for form submission
    if (registerForm) {
        registerForm.addEventListener('submit', function(event) {
            // Prevent the default form submission
            event.preventDefault();
            
            // Validate the form
            if (validateForm()) {
                // Process the registration
                processRegistration();
            }
        });
    }
    
    // Add event listeners for real-time validation
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    
    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            validateEmail();
        });
    }
    
    if (passwordInput && confirmPasswordInput) {
        confirmPasswordInput.addEventListener('blur', function() {
            validatePasswordMatch();
        });
    }
});

// Validate the entire form
function validateForm() {
    const isEmailValid = validateEmail();
    const isPasswordMatch = validatePasswordMatch();
    
    return isEmailValid && isPasswordMatch;
}

// Validate email format
function validateEmail() {
    const email = document.getElementById('email').value;
    const emailError = document.getElementById('email-error');
    
    // Simple email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email)) {
        emailError.classList.remove('hidden');
        return false;
    } else {
        emailError.classList.add('hidden');
        return true;
    }
}

// Validate that passwords match
function validatePasswordMatch() {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const passwordMatchError = document.getElementById('password-match-error');
    
    if (password !== confirmPassword) {
        passwordMatchError.classList.remove('hidden');
        return false;
    } else {
        passwordMatchError.classList.add('hidden');
        return true;
    }
}

// Process the registration
function processRegistration() {
    // Get form values
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const airline = document.getElementById('airline').value;
    const position = document.getElementById('position').value;
    
    // Show loading state
    const registerButton = document.getElementById('register-button');
    const originalButtonText = registerButton.innerHTML;
    registerButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Creating account...';
    registerButton.disabled = true;
    
    // Hide any previous error messages
    const errorMessage = document.getElementById('error-message');
    errorMessage.classList.add('hidden');
    
    // Simulate API call delay
    setTimeout(function() {
        // For demo purposes, we'll just store the user data in localStorage
        // In a real app, this would send the data to a backend API
        
        // Check if email is already registered (for demo purposes)
        const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const isEmailTaken = existingUsers.some(user => user.email === email);
        
        if (isEmailTaken) {
            // Show error message
            const errorText = document.getElementById('error-text');
            errorText.textContent = 'This email is already registered. Please use a different email or sign in.';
            errorMessage.classList.remove('hidden');
            
            // Reset button
            registerButton.innerHTML = originalButtonText;
            registerButton.disabled = false;
            
            return;
        }
        
        // Add new user to the list
        existingUsers.push({
            email: email,
            password: password, // In a real app, this would be hashed
            airline: airline,
            position: position,
            createdAt: new Date().toISOString()
        });
        
        // Save updated user list
        localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));
        
        // Store authentication state
        sessionStorage.setItem('isAuthenticated', 'true');
        sessionStorage.setItem('userEmail', email);
        sessionStorage.setItem('userAirline', airline);
        sessionStorage.setItem('userPosition', position);
        
        // Redirect to the main application
        window.location.href = 'index.html';
    }, 1500); // 1.5 second delay to simulate network request
}
