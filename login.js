// Login page script

// Password toggle functionality
const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');

togglePassword.addEventListener('click', () => {
    const type = passwordInput.type === 'password' ? 'text' : 'password';
    passwordInput.type = type;
    togglePassword.querySelector('.eye-icon').textContent = type === 'password' ? '👁️' : '🙈';
    togglePassword.classList.toggle('active');
});

// Load remembered email if exists
window.addEventListener('DOMContentLoaded', () => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    const rememberMe = document.getElementById('rememberMe');
    const emailInput = document.getElementById('email');
    
    if (rememberedEmail) {
        emailInput.value = rememberedEmail;
        rememberMe.checked = true;
    }
    
    // Add entrance animation
    document.querySelector('.auth-card').classList.add('fade-in');
});

// Social login handlers
document.querySelectorAll('.social-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const provider = this.classList.contains('google-btn') ? 'Google' : 'GitHub';
        showToast(`${provider} login coming soon!`, 'info');
    });
});

// Forgot password handler
document.querySelector('.forgot-password')?.addEventListener('click', (e) => {
    e.preventDefault();
    showToast('Password reset feature coming soon!', 'info');
});

// Form validation with animations
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    document.getElementById('emailError').textContent = '';
    document.getElementById('passwordError').textContent = '';
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Validation
    let hasErrors = false;
    
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
    
    if (hasErrors) return;
    
    // Show loading state
    const loginBtn = document.getElementById('loginBtn');
    const btnText = loginBtn.querySelector('.btn-text');
    const btnLoader = loginBtn.querySelector('.btn-loader');
    
    loginBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoader.style.display = 'inline-block';
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check localStorage for user
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        // Handle remember me
        if (rememberMe) {
            localStorage.setItem('rememberedEmail', email);
        } else {
            localStorage.removeItem('rememberedEmail');
        }
        
        // Store user data for profile system
        const userData = {
            name: user.name,
            email: user.email,
            username: user.username || user.email.split('@')[0],
            avatar: user.avatar || null,
            loginTime: new Date().toISOString()
        };
        
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('userData', JSON.stringify(userData));
        
        showToast(`Welcome back, ${user.name}!`, 'success');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    } else {
        loginBtn.disabled = false;
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
        
        showToast('Invalid email or password', 'error');
        shakeForm();
    }
});

function showError(elementId, message, inputId) {
    const errorElement = document.getElementById(elementId);
    const inputElement = document.getElementById(inputId);
    
    errorElement.textContent = message;
    errorElement.classList.add('shake');
    inputElement.classList.add('input-error');
    
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
