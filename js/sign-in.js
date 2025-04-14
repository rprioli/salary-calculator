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
    
    // Simulate API call delay
    setTimeout(function() {
        // For demo purposes, any credentials will work
        // In a real app, this would validate against a backend
        
        // Store authentication state
        sessionStorage.setItem('isAuthenticated', 'true');
        sessionStorage.setItem('userEmail', email);
        
        // Redirect to the main application
        window.location.href = 'index.html';
    }, 1500); // 1.5 second delay to simulate network request
}
