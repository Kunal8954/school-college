// Real Email Authentication using EmailJS
// No backend server required - works directly from browser

class RealEmailVerification {
    constructor() {
        // EmailJS Configuration
        // IMPORTANT: Make sure template 'template_tza81fc' exists in your EmailJS dashboard
        // Or change to your actual template ID
        this.serviceID = 'service_f91flwa';      // Your EmailJS Service ID
        this.templateID = 'template_tza81fc';    // Your EmailJS Template ID  
        this.publicKey = 'ptiMq5wJUlS6GWXxP';   // Your EmailJS Public Key
        
        // Development mode: set to true to skip email sending
        this.devMode = false; // Set to true if EmailJS template doesn't exist yet
        
        this.modal = document.getElementById('verificationModal');
        this.form = document.getElementById('verificationForm');
        this.codeInputs = document.querySelectorAll('.code-input');
        this.verifyBtn = document.getElementById('verifyBtn');
        this.resendBtn = document.getElementById('resendBtn');
        this.closeBtn = document.getElementById('closeVerification');
        this.timerDisplay = document.getElementById('timerCount');
        this.errorDisplay = document.getElementById('verificationError');
        this.successDisplay = document.getElementById('verificationSuccess');
        
        this.email = '';
        this.name = '';
        this.generatedCode = '';
        this.timeLeft = 300; // 5 minutes
        this.timerInterval = null;
        this.onSuccess = null;
        
        // Initialize EmailJS
        this.initEmailJS();
        this.init();
    }

    initEmailJS() {
        // Initialize EmailJS with your public key
        if (typeof emailjs !== 'undefined') {
            try {
                emailjs.init(this.publicKey);
                console.log('✅ EmailJS initialized successfully with key:', this.publicKey);
            } catch (error) {
                console.error('❌ EmailJS init error:', error);
            }
        } else {
            console.error('❌ EmailJS library not loaded. Make sure script is included in HTML.');
        }
    }

    init() {
        // Handle code input
        this.codeInputs.forEach((input, index) => {
            input.addEventListener('input', (e) => this.handleInput(e, index));
            input.addEventListener('keydown', (e) => this.handleKeydown(e, index));
            input.addEventListener('paste', (e) => this.handlePaste(e));
        });

        // Handle form submission
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.verifyCode();
        });

        // Handle resend button
        this.resendBtn.addEventListener('click', () => this.resendCode());

        // Handle close button
        this.closeBtn.addEventListener('click', () => this.close());

        // Close on outside click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });
    }

    generateVerificationCode() {
        // Generate 6-digit code
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    async open(email, name, onSuccess) {
        this.email = email;
        this.name = name;
        this.onSuccess = onSuccess;
        
        document.getElementById('verificationEmail').textContent = email;
        this.modal.classList.add('active');
        
        // Focus first input
        setTimeout(() => {
            this.codeInputs[0].focus();
        }, 300);

        // Send verification email
        await this.sendVerificationEmail();
        
        // Start timer
        this.startTimer();
    }

    close() {
        this.modal.classList.remove('active');
        this.clearInputs();
        this.clearTimer();
        this.hideError();
        this.hideSuccess();
    }

    async sendVerificationEmail() {
        try {
            this.hideError();
            
            // Generate verification code
            this.generatedCode = this.generateVerificationCode();
            
            // Store code with expiration in localStorage
            const verificationData = {
                email: this.email,
                code: this.generatedCode,
                expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
                attempts: 0
            };
            localStorage.setItem(`verification_${this.email}`, JSON.stringify(verificationData));
            
            // Check if EmailJS is configured
            if (!this.publicKey || this.publicKey === 'YOUR_EMAILJS_PUBLIC_KEY') {
                console.warn('⚠️ EmailJS not configured. Using development mode.');
                this.showSuccess('✅ Verification code generated!');
                console.log(`🔑 Development Mode - Your verification code: ${this.generatedCode}`);
                alert(`DEVELOPMENT MODE:\n\nYour verification code is: ${this.generatedCode}\n\nTo enable real emails:\n1. Sign up at https://www.emailjs.com/\n2. Configure service and template\n3. Update credentials in email-verification.js`);
                return;
            }
            
            // EmailJS template parameters
            const templateParams = {
                to_email: this.email,
                name: this.name || 'there',
                passcode: this.generatedCode,
                time: '15 minutes'
            };

            // Send email using EmailJS
            console.log('📧 Sending email via EmailJS...');
            console.log('Service ID:', this.serviceID);
            console.log('Template ID:', this.templateID);
            console.log('Public Key:', this.publicKey);
            console.log('To:', this.email);
            console.log('Template Params:', templateParams);
            
            const response = await emailjs.send(
                this.serviceID,
                this.templateID,
                templateParams
            );

            console.log('📧 EmailJS Response:', response);

            if (response.status === 200) {
                this.showSuccess('✅ Verification code sent to your email!');
                console.log('✅ Email sent successfully:', response);
                
                // For development - show code in console
                console.log(`🔑 Verification code: ${this.generatedCode}`);
                
                setTimeout(() => this.hideSuccess(), 3000);
            } else {
                throw new Error('Failed to send email');
            }

        } catch (error) {
            console.error('❌ Email send error:', error);
            console.error('Error type:', typeof error);
            console.error('Error details:', {
                message: error.message,
                text: error.text,
                status: error.status,
                name: error.name
            });
            console.error('Full error object:', JSON.stringify(error, null, 2));
            
            // Show friendly error message
            if (error.text && error.text.includes('Invalid')) {
                this.showError('EmailJS configuration error. Please check your Service ID, Template ID, and Public Key.');
            } else if (error.text && error.text.includes('quota')) {
                this.showError('Monthly email limit reached. Please try again later.');
            } else if (error.text && error.text.includes('Template')) {
                this.showError('Email template not found. Please create template_ncsqvet in EmailJS dashboard.');
            } else if (error.status === 400) {
                this.showError('Invalid request. Please check EmailJS configuration.');
            } else if (error.status === 401 || error.status === 403) {
                this.showError('Authentication failed. Please verify your Public Key.');
            } else if (error.status === 404) {
                this.showError('Template not found. Please verify template ID: template_ncsqvet');
            } else {
                this.showError('Failed to send email. Please check console for details.');
            }
            
            // Fallback: Show code in console and alert for development
            console.log(`🔑 Fallback - Verification code: ${this.generatedCode}`);
            alert(`❌ EMAIL SENDING FAILED\n\nError: ${error.message || error.text || 'Unknown error'}\n\nStatus: ${error.status || 'N/A'}\n\n⚠️ Using Development Code: ${this.generatedCode}\n\n👉 Open browser console (F12) for full error details.`);
        }
    }

    async verifyCode() {
        const enteredCode = this.getCode();
        
        if (enteredCode.length !== 6) {
            this.showError('Please enter the complete 6-digit code');
            this.shakeInputs();
            return;
        }

        try {
            this.hideError();

            // Get stored verification data
            const storedData = localStorage.getItem(`verification_${this.email}`);
            
            if (!storedData) {
                throw new Error('No verification code found. Please request a new one.');
            }

            const verificationData = JSON.parse(storedData);

            // Check if code expired
            if (Date.now() > verificationData.expiresAt) {
                localStorage.removeItem(`verification_${this.email}`);
                throw new Error('Verification code expired. Please request a new one.');
            }

            // Check attempts (max 3)
            if (verificationData.attempts >= 3) {
                localStorage.removeItem(`verification_${this.email}`);
                throw new Error('Too many failed attempts. Please request a new code.');
            }

            // Verify code
            if (verificationData.code === enteredCode) {
                // Success!
                localStorage.removeItem(`verification_${this.email}`);
                
                this.showSuccess('✅ Email verified successfully!');
                this.codeInputs.forEach(input => {
                    input.classList.add('filled');
                    input.classList.remove('error');
                });

                // Call success callback
                setTimeout(() => {
                    this.close();
                    if (this.onSuccess) {
                        this.onSuccess();
                    }
                }, 1500);

            } else {
                // Wrong code
                verificationData.attempts++;
                localStorage.setItem(`verification_${this.email}`, JSON.stringify(verificationData));
                
                const attemptsLeft = 3 - verificationData.attempts;
                throw new Error(`Invalid code. ${attemptsLeft} attempt${attemptsLeft !== 1 ? 's' : ''} remaining.`);
            }

        } catch (error) {
            console.error('❌ Verify code error:', error);
            this.showError(error.message || 'Invalid verification code. Please try again.');
            this.shakeInputs();
            this.clearInputs();
            this.codeInputs[0].focus();
            
            // Mark inputs as error
            this.codeInputs.forEach(input => {
                input.classList.add('error');
                setTimeout(() => input.classList.remove('error'), 400);
            });
        }
    }

    async resendCode() {
        try {
            this.hideError();
            this.showLoading(this.resendBtn);

            // Clear old code
            localStorage.removeItem(`verification_${this.email}`);

            // Generate new code
            this.generatedCode = this.generateVerificationCode();
            
            // Store new code
            const verificationData = {
                email: this.email,
                code: this.generatedCode,
                expiresAt: Date.now() + 5 * 60 * 1000,
                attempts: 0
            };
            localStorage.setItem(`verification_${this.email}`, JSON.stringify(verificationData));

            // Check if EmailJS is configured
            if (!this.publicKey || this.publicKey === 'YOUR_EMAILJS_PUBLIC_KEY') {
                this.showSuccess('✅ New verification code generated!');
                console.log(`🔑 Development Mode - New code: ${this.generatedCode}`);
                alert(`DEVELOPMENT MODE:\n\nYour new verification code is: ${this.generatedCode}`);
                
                // Reset timer
                this.clearTimer();
                this.timeLeft = 300;
                this.startTimer();
                this.clearInputs();
                this.codeInputs[0].focus();
                this.hideLoading(this.resendBtn);
                setTimeout(() => this.hideSuccess(), 3000);
                return;
            }

            // EmailJS template parameters
            const templateParams = {
                to_email: this.email,
                name: this.name || 'there',
                passcode: this.generatedCode,
                time: '15 minutes'
            };

            // Send new email
            const response = await emailjs.send(
                this.serviceID,
                this.templateID,
                templateParams
            );

            if (response.status === 200) {
                this.showSuccess('✅ New verification code sent!');
                console.log('✅ New email sent:', response);
                console.log(`🔑 New verification code: ${this.generatedCode}`);
                
                setTimeout(() => this.hideSuccess(), 3000);
                
                // Reset timer
                this.clearTimer();
                this.timeLeft = 300;
                this.startTimer();
                
                // Clear and focus first input
                this.clearInputs();
                this.codeInputs[0].focus();
            } else {
                throw new Error('Failed to resend code');
            }

        } catch (error) {
            console.error('❌ Resend error:', error);
            this.showError('Failed to resend. Using development mode.');
            
            // Fallback for development
            console.log(`🔑 Fallback - New code: ${this.generatedCode}`);
            alert(`DEVELOPMENT MODE:\n\nYour new verification code is: ${this.generatedCode}`);
            
            // Reset timer anyway
            this.clearTimer();
            this.timeLeft = 300;
            this.startTimer();
            this.clearInputs();
            this.codeInputs[0].focus();
        } finally {
            this.hideLoading(this.resendBtn);
        }
    }

    handleInput(e, index) {
        const input = e.target;
        const value = input.value;

        // Only allow numbers
        if (!/^\d*$/.test(value)) {
            input.value = '';
            return;
        }

        // Move to next input
        if (value && index < this.codeInputs.length - 1) {
            this.codeInputs[index + 1].focus();
        }

        // Mark as filled
        if (value) {
            input.classList.add('filled');
        } else {
            input.classList.remove('filled');
        }

        // Auto-submit when all filled
        if (index === this.codeInputs.length - 1 && value) {
            const code = this.getCode();
            if (code.length === 6) {
                setTimeout(() => this.verifyCode(), 300);
            }
        }
    }

    handleKeydown(e, index) {
        const input = e.target;

        // Handle backspace
        if (e.key === 'Backspace' && !input.value && index > 0) {
            this.codeInputs[index - 1].focus();
            this.codeInputs[index - 1].value = '';
            this.codeInputs[index - 1].classList.remove('filled');
        }

        // Handle arrow keys
        if (e.key === 'ArrowLeft' && index > 0) {
            this.codeInputs[index - 1].focus();
        }
        if (e.key === 'ArrowRight' && index < this.codeInputs.length - 1) {
            this.codeInputs[index + 1].focus();
        }
    }

    handlePaste(e) {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');
        
        if (pastedData.length === 6) {
            this.codeInputs.forEach((input, index) => {
                input.value = pastedData[index] || '';
                if (pastedData[index]) {
                    input.classList.add('filled');
                }
            });
            
            // Auto-verify
            setTimeout(() => this.verifyCode(), 300);
        }
    }

    getCode() {
        return Array.from(this.codeInputs).map(input => input.value).join('');
    }

    clearInputs() {
        this.codeInputs.forEach(input => {
            input.value = '';
            input.classList.remove('filled', 'error');
        });
    }

    shakeInputs() {
        this.codeInputs.forEach(input => {
            input.classList.add('error');
            setTimeout(() => input.classList.remove('error'), 400);
        });
    }

    startTimer() {
        this.updateTimerDisplay();
        
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();

            if (this.timeLeft <= 0) {
                this.clearTimer();
                this.showError('Verification code expired. Please request a new one.');
                this.verifyBtn.disabled = true;
            }
        }, 1000);
    }

    clearTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        this.verifyBtn.disabled = false;
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        this.timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        // Warning color when less than 1 minute
        if (this.timeLeft < 60) {
            this.timerDisplay.classList.add('warning');
        } else {
            this.timerDisplay.classList.remove('warning');
        }
    }

    showError(message) {
        this.errorDisplay.textContent = message;
        this.errorDisplay.classList.add('show');
    }

    hideError() {
        this.errorDisplay.classList.remove('show');
    }

    showSuccess(message) {
        this.successDisplay.textContent = message;
        this.successDisplay.classList.add('show');
    }

    hideSuccess() {
        this.successDisplay.classList.remove('show');
    }

    showLoading(button) {
        button.disabled = true;
        button.style.opacity = '0.6';
        button.style.cursor = 'not-allowed';
    }

    hideLoading(button) {
        button.disabled = false;
        button.style.opacity = '1';
        button.style.cursor = 'pointer';
    }
}

// Initialize when EmailJS is loaded
let emailVerification;

// Wait for DOM and EmailJS to load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEmailVerification);
} else {
    initEmailVerification();
}

function initEmailVerification() {
    // Initialize even if EmailJS is not loaded (development mode)
    emailVerification = new RealEmailVerification();
    window.emailVerification = emailVerification;
    
    if (typeof emailjs !== 'undefined') {
        console.log('✅ Real Email Verification initialized with EmailJS');
    } else {
        console.log('⚠️ Email Verification initialized in DEVELOPMENT MODE');
        console.log('📧 To enable real emails: https://www.emailjs.com/');
    }
}
