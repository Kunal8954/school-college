// Email Verification Server
// Run with: node server/email-server.js

const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Store verification codes temporarily (in production, use Redis or database)
const verificationCodes = new Map();

// Configure email transporter (Gmail)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Your Gmail address
        pass: process.env.EMAIL_PASSWORD // Your Gmail App Password
    }
});

// Generate 6-digit verification code
function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send verification email
app.post('/api/send-verification', async (req, res) => {
    try {
        const { email, name } = req.body;

        if (!email) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email is required' 
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid email format' 
            });
        }

        // Generate verification code
        const code = generateVerificationCode();
        
        // Store code with expiration (5 minutes)
        verificationCodes.set(email, {
            code: code,
            expiresAt: Date.now() + 5 * 60 * 1000,
            attempts: 0
        });

        // Email HTML template
        const emailHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    .container {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        border-radius: 12px;
                        padding: 40px;
                        text-align: center;
                    }
                    .content {
                        background: white;
                        border-radius: 8px;
                        padding: 30px;
                        margin-top: 20px;
                    }
                    .logo {
                        font-size: 48px;
                        margin-bottom: 10px;
                    }
                    h1 {
                        color: white;
                        margin: 0;
                        font-size: 28px;
                    }
                    .code {
                        font-size: 36px;
                        font-weight: bold;
                        letter-spacing: 8px;
                        color: #667eea;
                        background: #f3f4f6;
                        padding: 20px;
                        border-radius: 8px;
                        margin: 20px 0;
                        font-family: 'Courier New', monospace;
                    }
                    .info {
                        color: #6b7280;
                        font-size: 14px;
                        margin-top: 20px;
                    }
                    .footer {
                        color: rgba(255,255,255,0.8);
                        font-size: 12px;
                        margin-top: 20px;
                    }
                    .warning {
                        background: #fef3c7;
                        color: #92400e;
                        padding: 10px;
                        border-radius: 6px;
                        margin-top: 15px;
                        font-size: 13px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="logo">🎓</div>
                    <h1>Email Verification</h1>
                    
                    <div class="content">
                        <p>Hello ${name || 'there'}!</p>
                        <p>Thank you for signing up with <strong>College Finder</strong>. To complete your registration, please use the verification code below:</p>
                        
                        <div class="code">${code}</div>
                        
                        <p class="info">This code will expire in <strong>5 minutes</strong>.</p>
                        
                        <div class="warning">
                            ⚠️ If you didn't request this code, please ignore this email.
                        </div>
                    </div>
                    
                    <div class="footer">
                        <p>This is an automated message from College Finder.</p>
                        <p>&copy; ${new Date().getFullYear()} College Finder. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        // Send email
        await transporter.sendMail({
            from: `"College Finder" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Verify Your Email - College Finder',
            html: emailHTML
        });

        console.log(`Verification code sent to ${email}: ${code}`);

        res.json({ 
            success: true, 
            message: 'Verification code sent successfully',
            expiresIn: 300 // 5 minutes in seconds
        });

    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to send verification email. Please try again.' 
        });
    }
});

// Verify code
app.post('/api/verify-code', (req, res) => {
    try {
        const { email, code } = req.body;

        if (!email || !code) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email and code are required' 
            });
        }

        const storedData = verificationCodes.get(email);

        if (!storedData) {
            return res.status(400).json({ 
                success: false, 
                message: 'No verification code found. Please request a new one.' 
            });
        }

        // Check if code expired
        if (Date.now() > storedData.expiresAt) {
            verificationCodes.delete(email);
            return res.status(400).json({ 
                success: false, 
                message: 'Verification code expired. Please request a new one.' 
            });
        }

        // Check attempts (max 3)
        if (storedData.attempts >= 3) {
            verificationCodes.delete(email);
            return res.status(400).json({ 
                success: false, 
                message: 'Too many failed attempts. Please request a new code.' 
            });
        }

        // Verify code
        if (storedData.code === code.toString()) {
            verificationCodes.delete(email);
            return res.json({ 
                success: true, 
                message: 'Email verified successfully!' 
            });
        } else {
            storedData.attempts++;
            return res.status(400).json({ 
                success: false, 
                message: `Invalid code. ${3 - storedData.attempts} attempts remaining.` 
            });
        }

    } catch (error) {
        console.error('Error verifying code:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Verification failed. Please try again.' 
        });
    }
});

// Resend verification code
app.post('/api/resend-code', async (req, res) => {
    try {
        const { email, name } = req.body;

        // Delete old code
        verificationCodes.delete(email);

        // Use the same logic as send-verification
        const code = generateVerificationCode();
        verificationCodes.set(email, {
            code: code,
            expiresAt: Date.now() + 5 * 60 * 1000,
            attempts: 0
        });

        const emailHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    .container {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        border-radius: 12px;
                        padding: 40px;
                        text-align: center;
                    }
                    .content {
                        background: white;
                        border-radius: 8px;
                        padding: 30px;
                        margin-top: 20px;
                    }
                    .logo {
                        font-size: 48px;
                        margin-bottom: 10px;
                    }
                    h1 {
                        color: white;
                        margin: 0;
                        font-size: 28px;
                    }
                    .code {
                        font-size: 36px;
                        font-weight: bold;
                        letter-spacing: 8px;
                        color: #667eea;
                        background: #f3f4f6;
                        padding: 20px;
                        border-radius: 8px;
                        margin: 20px 0;
                        font-family: 'Courier New', monospace;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="logo">🎓</div>
                    <h1>New Verification Code</h1>
                    <div class="content">
                        <p>Hello ${name || 'there'}!</p>
                        <p>Here is your new verification code:</p>
                        <div class="code">${code}</div>
                        <p style="color: #6b7280; font-size: 14px;">This code will expire in <strong>5 minutes</strong>.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        await transporter.sendMail({
            from: `"College Finder" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'New Verification Code - College Finder',
            html: emailHTML
        });

        console.log(`New verification code sent to ${email}: ${code}`);

        res.json({ 
            success: true, 
            message: 'New verification code sent successfully' 
        });

    } catch (error) {
        console.error('Error resending code:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to resend code. Please try again.' 
        });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Email verification server is running' });
});

// Start server
app.listen(PORT, () => {
    console.log(`✅ Email verification server running on http://localhost:${PORT}`);
    console.log(`📧 Email configured: ${process.env.EMAIL_USER || 'Not configured'}`);
    console.log('\n📝 Available endpoints:');
    console.log(`   POST http://localhost:${PORT}/api/send-verification`);
    console.log(`   POST http://localhost:${PORT}/api/verify-code`);
    console.log(`   POST http://localhost:${PORT}/api/resend-code`);
    console.log(`   GET  http://localhost:${PORT}/api/health`);
});

module.exports = app;
