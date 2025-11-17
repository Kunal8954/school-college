// Signup page script

// Password toggle functionality
const togglePassword = document.getElementById('togglePassword');
const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');

togglePassword.addEventListener('click', () => {
    const type = passwordInput.type === 'password' ? 'text' : 'password';
    passwordInput.type = type;
    togglePassword.querySelector('.eye-icon').textContent = type === 'password' ? '👁️' : '🙈';
    togglePassword.classList.toggle('active');
});

toggleConfirmPassword.addEventListener('click', () => {
    const type = confirmPasswordInput.type === 'password' ? 'text' : 'password';
    confirmPasswordInput.type = type;
    toggleConfirmPassword.querySelector('.eye-icon').textContent = type === 'password' ? '👁️' : '🙈';
    toggleConfirmPassword.classList.toggle('active');
});

// Password strength indicator
passwordInput.addEventListener('input', function() {
    const password = this.value;
    const strength = calculatePasswordStrength(password);
    updatePasswordStrength(strength);
    
    // Clear password error on input
    document.getElementById('passwordError').textContent = '';
    this.classList.remove('input-error');
});

function calculatePasswordStrength(password) {
    let strength = 0;
    
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    return Math.min(strength, 4);
}

function updatePasswordStrength(strength) {
    const strengthFill = document.getElementById('strengthFill');
    const strengthText = document.getElementById('strengthText');
    const strengthBar = document.querySelector('.strength-bar');
    
    const levels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['', '#ef4444', '#f59e0b', '#3b82f6', '#10b981'];
    
    strengthFill.style.width = `${(strength / 4) * 100}%`;
    strengthFill.style.backgroundColor = colors[strength];
    strengthText.textContent = levels[strength];
    strengthText.style.color = colors[strength];
    
    if (strength > 0) {
        strengthBar.classList.add('visible');
    } else {
        strengthBar.classList.remove('visible');
    }
}

// Real-time validation
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');

nameInput.addEventListener('blur', function() {
    if (this.value.trim().length > 0 && this.value.trim().length < 2) {
        showError('nameError', 'Name must be at least 2 characters', 'name');
    } else {
        document.getElementById('nameError').textContent = '';
        this.classList.remove('input-error');
    }
});

emailInput.addEventListener('blur', function() {
    const email = this.value.trim();
    if (email && !/\S+@\S+\.\S+/.test(email)) {
        showError('emailError', 'Email is invalid', 'email');
    } else {
        document.getElementById('emailError').textContent = '';
        this.classList.remove('input-error');
    }
});

confirmPasswordInput.addEventListener('input', function() {
    if (this.value && this.value !== passwordInput.value) {
        document.getElementById('confirmPasswordError').textContent = 'Passwords do not match';
        this.classList.add('input-error');
    } else {
        document.getElementById('confirmPasswordError').textContent = '';
        this.classList.remove('input-error');
    }
});

// Add entrance animation
window.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.auth-card').classList.add('fade-in');
});

// Social signup handlers
document.querySelectorAll('.social-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const provider = this.classList.contains('google-btn') ? 'Google' : 'GitHub';
        showToast(`${provider} signup coming soon!`, 'info');
    });
});

// Terms link handler
document.querySelector('.terms-link')?.addEventListener('click', (e) => {
    e.preventDefault();
    showToast('Terms & Conditions coming soon!', 'info');
});

// Form submission with validation
document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    document.getElementById('nameError').textContent = '';
    document.getElementById('emailError').textContent = '';
    document.getElementById('passwordError').textContent = '';
    document.getElementById('confirmPasswordError').textContent = '';
    document.getElementById('termsError').textContent = '';
    
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const acceptTerms = document.getElementById('acceptTerms').checked;
    
    // Validation
    let hasErrors = false;
    
    if (!name) {
        showError('nameError', 'Name is required', 'name');
        hasErrors = true;
    } else if (name.length < 2) {
        showError('nameError', 'Name must be at least 2 characters', 'name');
        hasErrors = true;
    }
    
    if (!email) {
        showError('emailError', 'Email is required', 'email');
        hasErrors = true;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
        showError('emailError', 'Email is invalid', 'email');
        hasErrors = true;
    }
    
    if (!password) {
        showError('passwordError', 'Password is required', 'password');
        hasErrors = true;
    } else if (password.length < 6) {
        showError('passwordError', 'Password must be at least 6 characters', 'password');
        hasErrors = true;
    }
    
    if (!confirmPassword) {
        showError('confirmPasswordError', 'Please confirm your password', 'confirmPassword');
        hasErrors = true;
    } else if (password !== confirmPassword) {
        showError('confirmPasswordError', 'Passwords do not match', 'confirmPassword');
        hasErrors = true;
    }
    
    if (!acceptTerms) {
        showError('termsError', 'You must accept the terms & conditions', 'acceptTerms');
        hasErrors = true;
    }
    
    if (hasErrors) {
        shakeForm();
        return;
    }
    
    // Show loading state
    const signupBtn = document.getElementById('signupBtn');
    const btnText = signupBtn.querySelector('.btn-text');
    const btnLoader = signupBtn.querySelector('.btn-loader');
    
    signupBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoader.style.display = 'inline-block';
    
    // Check if email already exists
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    if (users.some(u => u.email === email)) {
        signupBtn.disabled = false;
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
        
        showToast('Email already exists', 'error');
        showError('emailError', 'This email is already registered', 'email');
        return;
    }
    
    // Reset button state
    signupBtn.disabled = false;
    btnText.style.display = 'inline';
    btnLoader.style.display = 'none';
    
    // Open email verification modal
    if (window.emailVerification) {
        emailVerification.open(email, name, () => {
            // This callback is called after successful verification
            completeSignup(name, email, password);
        });
    } else {
        // Fallback: complete signup without verification if server is not running
        showToast('Email server not running. Signing up without verification.', 'info');
        setTimeout(() => {
            completeSignup(name, email, password);
        }, 1000);
    }
});

async function completeSignup(name, email, password) {
    // Show loading
    const signupBtn = document.getElementById('signupBtn');
    const btnText = signupBtn.querySelector('.btn-text');
    const btnLoader = signupBtn.querySelector('.btn-loader');
    
    signupBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoader.style.display = 'inline-block';
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Get existing users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Add new user
    const newUser = { 
        name, 
        email, 
        password,
        username: email.split('@')[0],
        createdAt: new Date().toISOString()
    };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    
    // Store user data for profile system
    const userData = {
        name: name,
        email: email,
        username: email.split('@')[0],
        avatar: null,
        loginTime: new Date().toISOString()
    };
    localStorage.setItem('userData', JSON.stringify(userData));
    
    showToast('✅ Account created successfully! Welcome to College Finder', 'success');
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

function showError(elementId, message, inputId) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.classList.add('shake');
    
    const inputElement = document.getElementById(inputId);
    if (inputElement && inputElement.tagName === 'INPUT') {
        inputElement.classList.add('input-error');
    }
    
    setTimeout(() => {
        errorElement.classList.remove('shake');
    }, 500);
}

function shakeForm() {
    const authCard = document.querySelector('.auth-card');
    authCard.classList.add('shake');
    setTimeout(() => {
        authCard.classList.remove('shake');
    }, 500);
}

function showToast(message, type) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Input focus animations
document.querySelectorAll('.form-group input').forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.classList.add('focused');
        this.classList.remove('input-error');
    });
    
    input.addEventListener('blur', function() {
        this.parentElement.classList.remove('focused');
    });
});
