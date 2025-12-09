// auth-script.js - Fixed version
console.log('Auth script loaded');

// Toggle password visibility
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = event.target;
    
    if (!input) {
        console.error('Input not found:', inputId);
        return;
    }
    
    if (input.type === 'password') {
        input.type = 'text';
        button.textContent = 'Hide';
    } else {
        input.type = 'password';
        button.textContent = 'Show';
    }
}

// Handle login form submission
function handleLogin(event) {
    event.preventDefault(); // Prevent page reload
    
    const email = document.getElementById('email').value; // CHANGED FROM 'loginEmail'
    const password = document.getElementById('loginPassword').value;
    
    console.log('Login attempt for email:', email);
    
    // Simple validation
    if (!email || !password) {
        alert('Please fill in all fields');
        return;
    }
    
    // Check if user exists (from signup)
    const savedEmail = localStorage.getItem('userEmail');
    
    // For demo: Accept any password if email matches
    if (savedEmail && email === savedEmail) {
        // SUCCESS
        localStorage.setItem('isLoggedIn', 'true');
        
        // Show success message
        const button = document.querySelector('.auth-btn');
        const originalText = button.textContent;
        button.textContent = '✓ Success!';
        button.style.backgroundColor = '#4CAF50';
        button.disabled = true;
        
        // Redirect after 1 second
        setTimeout(() => {
            window.location.href = 'main-movie-page.html';
        }, 1000);
        
    } else {
        // FAILED
        alert('Invalid email or password. Please sign up first.');
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Login page loaded');
    
    // Check if already logged in
    if (localStorage.getItem('isLoggedIn') === 'true') {
        console.log('Already logged in, redirecting...');
        window.location.href = 'main-movie-page.html';
        return;
    }
    
    // Add form submit handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
        console.log('Form submit handler added');
    } else {
        console.error('Login form not found!');
    }
});

// Make togglePassword available globally
window.togglePassword = togglePassword;