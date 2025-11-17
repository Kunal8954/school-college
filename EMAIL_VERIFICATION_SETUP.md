# Email Verification Setup Guide

This guide will help you set up email verification for your College Finder application.

## 📋 Prerequisites

- Node.js installed (v14 or higher)
- Gmail account
- npm or yarn package manager

## 🚀 Quick Start

### Step 1: Install Dependencies

Navigate to the server directory and install required packages:

```bash
cd server
npm install
```

This will install:
- `express` - Web server framework
- `cors` - Enable cross-origin requests
- `nodemailer` - Send emails
- `dotenv` - Environment variables

### Step 2: Configure Gmail App Password

**Important:** You need a Gmail App Password (not your regular password)

1. Go to your Google Account: https://myaccount.google.com/
2. Navigate to **Security**
3. Enable **2-Step Verification** (if not already enabled)
4. Go to **App Passwords**: https://myaccount.google.com/apppasswords
5. Select app: **Mail**
6. Select device: **Other (Custom name)** → Enter "College Finder"
7. Click **Generate**
8. **Copy the 16-character password** (you won't see it again!)

### Step 3: Create .env File

Create a `.env` file in the `server` directory:

```bash
# In the server directory
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
PORT=3000
```

**Example:**
```env
EMAIL_USER=john.doe@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
PORT=3000
```

### Step 4: Start the Email Server

```bash
# From the server directory
npm start

# Or for development (auto-restart on changes)
npm run dev
```

You should see:
```
✅ Email verification server running on http://localhost:3000
📧 Email configured: your-email@gmail.com
```

### Step 5: Test the Application

1. Open `signup.html` in your browser
2. Fill in the signup form
3. Click "Create Account"
4. Check your email for the verification code
5. Enter the 6-digit code in the modal
6. Complete signup!

## 🔧 API Endpoints

### 1. Send Verification Email
```http
POST http://localhost:3000/api/send-verification
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Verification code sent successfully",
  "expiresIn": 300
}
```

### 2. Verify Code
```http
POST http://localhost:3000/api/verify-code
Content-Type: application/json

{
  "email": "user@example.com",
  "code": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully!"
}
```

### 3. Resend Code
```http
POST http://localhost:3000/api/resend-code
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe"
}
```

### 4. Health Check
```http
GET http://localhost:3000/api/health
```

## 🎨 Features

✅ **6-digit verification codes**
- Auto-generated random codes
- 5-minute expiration
- Max 3 verification attempts

✅ **Beautiful email template**
- Responsive HTML design
- Branded with College Finder theme
- Clear expiration warnings

✅ **Smart frontend UX**
- Auto-focus on next input
- Paste support for full code
- Real-time countdown timer
- Auto-submit when complete
- Error animations

✅ **Security features**
- Rate limiting (attempt tracking)
- Code expiration
- Secure code storage
- Input validation

## 🔒 Security Best Practices

### Never Commit .env Files
Add to `.gitignore`:
```
.env
.env.local
server/.env
```

### Use Environment Variables
Never hardcode credentials in your code!

### Gmail Security Tips
- Use App Passwords (not regular password)
- Enable 2-Step Verification
- Monitor login activity
- Revoke unused app passwords

## 🐛 Troubleshooting

### "Failed to send verification email"

**Cause:** Gmail authentication failed

**Solutions:**
1. Check EMAIL_USER is correct Gmail address
2. Verify EMAIL_PASSWORD is the App Password (16 chars)
3. Ensure 2-Step Verification is enabled
4. Try regenerating App Password

### "Connection refused" or "ECONNREFUSED"

**Cause:** Email server not running

**Solution:**
```bash
cd server
npm start
```

### "Invalid code" even with correct code

**Cause:** Code expired or too many attempts

**Solution:**
- Click "Resend Code" button
- Verify within 5 minutes
- Don't exceed 3 attempts

### Email not received

**Check:**
1. Spam/Junk folder
2. Gmail blocked the email
3. Server console for errors
4. EMAIL_USER has sufficient sending quota

### CORS errors in browser

**Cause:** Frontend and backend on different origins

**Solution:**
- Server already has CORS enabled
- Ensure API_BASE_URL in `email-verification.js` matches server URL

## 🌐 Production Deployment

### Option 1: Deploy to Heroku

```bash
# Install Heroku CLI
# Login to Heroku
heroku login

# Create app
cd server
heroku create college-finder-email

# Set environment variables
heroku config:set EMAIL_USER=your-email@gmail.com
heroku config:set EMAIL_PASSWORD=your-app-password

# Deploy
git push heroku main
```

Update `email-verification.js`:
```javascript
const API_BASE_URL = 'https://college-finder-email.herokuapp.com/api';
```

### Option 2: Deploy to Vercel/Netlify Functions

Convert to serverless functions (requires code refactoring)

### Option 3: Self-hosted VPS

Use PM2 for process management:
```bash
npm install -g pm2
pm2 start server/email-server.js --name college-email
pm2 save
pm2 startup
```

## 📊 Monitoring

Add logging for production:

```javascript
// Add to email-server.js
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});
```

## 🔄 Alternative Email Services

### SendGrid
```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
```

### Mailgun
```javascript
const mailgun = require('mailgun-js')({
    apiKey: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN
});
```

### AWS SES
```javascript
const AWS = require('aws-sdk');
const ses = new AWS.SES({ region: 'us-east-1' });
```

## 📝 Testing

Test with curl:

```bash
# Send verification
curl -X POST http://localhost:3000/api/send-verification \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User"}'

# Verify code
curl -X POST http://localhost:3000/api/verify-code \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","code":"123456"}'
```

## 💡 Tips

- **Development:** Use `npm run dev` for auto-restart
- **Testing:** Send emails to yourself first
- **Spam:** Avoid sending too many emails quickly
- **Limits:** Gmail has sending limits (~500/day for free accounts)

## 📞 Support

If you encounter issues:
1. Check server console logs
2. Verify .env configuration
3. Test with curl commands
4. Check Gmail security settings

---

**Created for College Finder** 🎓
Last updated: November 2025
