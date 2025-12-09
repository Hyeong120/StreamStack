// Shared validation functions for login and signup

function toggleLoginPassword() {
    const input = document.getElementById('loginPassword');
    input.type = input.type === 'password' ? 'text' : 'password';
}

function toggleSignupPassword() {
    const input = document.getElementById('signupPassword');
    input.type = input.type === 'password' ? 'text' : 'password';
}

function toggleConfirmPassword() {
    const input = document.getElementById('confirmSignupPassword');
    input.type = input.type === 'password' ? 'text' : 'password';
}

function checkSignupPassword() {
    const password = document.getElementById('signupPassword').value;
    const requirements = {
        length: document.getElementById('signupReqLength'),
        upper: document.getElementById('signupReqUpper'),
        lower: document.getElementById('signupReqLower'),
        number: document.getElementById('signupReqNumber')
    };
    
    const hasLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    
    // Update requirement indicators
    requirements.length.className = hasLength ? 'valid' : '';
    requirements.upper.className = hasUpper ? 'valid' : '';
    requirements.lower.className = hasLower ? 'valid' : '';
    requirements.number.className = hasNumber ? 'valid' : '';
    
    // Update strength bar
    const strengthBar = document.getElementById('signupPasswordStrength');
    const score = [hasLength, hasUpper, hasLower, hasNumber].filter(Boolean).length;
    
    strengthBar.className = 'password-strength';
    if (score === 0) {
        // No class
    } else if (score <= 2) {
        strengthBar.classList.add('weak');
    } else if (score === 3) {
        strengthBar.classList.add('fair');
    } else {
        strengthBar.classList.add('strong');
    }
    
    // Also check match if confirm field has value
    checkSignupPasswordMatch();
    
    return score >= 3; // At least 3 requirements
}

function checkSignupPasswordMatch() {
    const password = document.getElementById('signupPassword').value;
    const confirm = document.getElementById('confirmSignupPassword').value;
    const matchIndicator = document.getElementById('signupPasswordMatch');
    
    if (!confirm) {
        matchIndicator.textContent = '';
        matchIndicator.className = 'password-match';
        return false;
    }
    
    if (password === confirm) {
        matchIndicator.textContent = '✓ Passwords match';
        matchIndicator.className = 'password-match valid';
        return true;
    } else {
        matchIndicator.textContent = '✗ Passwords do not match';
        matchIndicator.className = 'password-match invalid';
        return false;
    }
}

// Phone number validation for signup
function validatePhoneNumber(phone) {
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '');
    
    // Check if it's a valid length (10 for US, 11 with country code)
    if (digits.length === 10 || digits.length === 11) {
        return true;
    }
    
    return false;
}

// Email validation
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Validate signup form before submission
function validateSignupForm() {
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirm = document.getElementById('confirmSignupPassword').value;
    const phone = document.getElementById('signupPhone')?.value || '';
    
    if (!validateEmail(email)) {
        alert('Please enter a valid email address');
        return false;
    }
    
    if (!checkSignupPassword()) {
        alert('Please choose a stronger password');
        return false;
    }
    
    if (!checkSignupPasswordMatch()) {
        alert('Passwords do not match');
        return false;
    }
    
    if (phone && !validatePhoneNumber(phone)) {
        alert('Please enter a valid phone number');
        return false;
    }
    
    return true;
}