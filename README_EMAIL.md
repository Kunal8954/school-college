# 📧 Email Verification System

Complete email verification system for College Finder with Gmail integration.

## 🎯 What You Get

- ✅ **6-digit verification codes** sent to user's email
- ✅ **Beautiful email templates** with College Finder branding
- ✅ **Smart verification modal** with countdown timer
- ✅ **Auto-paste support** for verification codes
- ✅ **Resend functionality** with new code generation
- ✅ **Security features**: expiration, attempt limits
- ✅ **Mobile-responsive** design
- ✅ **Real-time validation** and error handling

---

## ⚡ Quick Start (2 Steps!)

### Step 1: Configure Gmail

1. Open: https://myaccount.google.com/apppasswords
2. Generate a new App Password
3. Copy the 16-character password

### Step 2: Edit server/.env

Open `server/.env` and fill in:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
PORT=3000
```

**That's it!** Now just run:

```bash
# Double-click this file:
start-email-server.bat

# Or run manually:
cd server
node email-server.js
```

---

## 🎬 How to Use

### For Users (Frontend)

1. **Go to signup page** (`signup.html`)
2. **Fill in the form** with name, email, password
3. **Click "Create Account"**
4. **Verification modal opens** automatically
5. **Check your email** for the 6-digit code
6. **Enter the code** (auto-submits when complete!)
7. **Welcome!** Account created successfully

### Visual Flow

```
Signup Form → Email Validation → Modal Opens
     ↓              ↓                  ↓
Email Check    Server Sends      User Receives
     ↓           Email Code       Email (Gmail)
     ↓              ↓                  ↓
Modal Shows → User Enters → Server Verifies
     ↓           Code             ↓
     ↓              ↓          Success!
  Timer        Auto-Submit   → Complete Signup
```

---

## 📁 Files Overview

### Backend (Server)

| File | Purpose |
|------|---------|
| `server/email-server.js` | Main Express server, handles email sending & verification |
| `server/package.json` | Dependencies (express, nodemailer, cors, dotenv) |
| `server/.env` | **YOUR CREDENTIALS** (Gmail email & app password) |
| `server/.env.example` | Template for .env file |

### Frontend

| File | Purpose |
|------|---------|
| `email-verification.css` | Beautiful modal styles with animations |
| `email-verification.js` | Handles verification UI and API calls |
| `signup.html` | Updated with verification modal HTML |
| `signup.js` | Updated to trigger verification flow |

### Documentation

| File | Purpose |
|------|---------|
| `EMAIL_VERIFICATION_SETUP.md` | Complete setup guide with troubleshooting |
| `QUICK_START.md` | Fast 5-minute setup instructions |
| `README_EMAIL.md` | This file - overview and usage |
| `start-email-server.bat` | One-click server startup script |

---

## 🔧 API Endpoints

Your server runs on `http://localhost:3000` with these endpoints:

### 1. Send Verification Email
```http
POST /api/send-verification
{
  "email": "user@example.com",
  "name": "John Doe"
}
```
**Returns:** `{ success: true, message: "...", expiresIn: 300 }`

### 2. Verify Code
```http
POST /api/verify-code
{
  "email": "user@example.com",
  "code": "123456"
}
```
**Returns:** `{ success: true, message: "Email verified successfully!" }`

### 3. Resend Code
```http
POST /api/resend-code
{
  "email": "user@example.com",
  "name": "John Doe"
}
```

### 4. Health Check
```http
GET /api/health
```

---

## 🎨 Email Template Preview

Users receive a beautifully designed email:

```
┌─────────────────────────────────┐
│  🎓                             │
│  Email Verification             │
├─────────────────────────────────┤
│                                 │
│  Hello John!                    │
│                                 │
│  Your verification code:        │
│                                 │
│  ┌─────────────────────┐        │
│  │    1 2 3 4 5 6      │        │
│  └─────────────────────┘        │
│                                 │
│  Expires in 5 minutes           │
│                                 │
│  ⚠️ Ignore if you didn't       │
│     request this                │
│                                 │
└─────────────────────────────────┘
```

---

## 🔒 Security Features

✅ **Expiration**: Codes expire after 5 minutes
✅ **Attempt limiting**: Max 3 verification attempts per code
✅ **Rate limiting**: Prevents spam
✅ **Code storage**: In-memory storage (production: use Redis)
✅ **Input validation**: Email format, code format checks
✅ **CORS protection**: Configured for your domain

---

## 🐛 Common Issues & Solutions

### "Failed to send email"
**Problem:** Gmail authentication failed
**Solution:** 
- Verify EMAIL_USER is correct
- Check EMAIL_PASSWORD is App Password (not regular password)
- Enable 2-Step Verification in Gmail
- Regenerate App Password

### "Email not received"
**Check:**
- Spam/Junk folder
- Gmail inbox (search for "College Finder")
- Server console for errors

### "Server not starting"
**Solutions:**
- Run `cd server` first
- Check port 3000 is available
- Verify .env file exists
- Run `npm install` again

### "Invalid code"
**Causes:**
- Code expired (> 5 minutes)
- Too many attempts (> 3)
- Wrong code entered
**Solution:** Click "Resend Code"

---

## 💡 Customization

### Change Code Length
Edit `server/email-server.js`:
```javascript
function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
    // Change to 4 digits: Math.floor(1000 + Math.random() * 9000)
}
```

### Change Expiration Time
Edit `server/email-server.js`:
```javascript
expiresAt: Date.now() + 5 * 60 * 1000  // 5 minutes
// Change to 10 minutes: 10 * 60 * 1000
```

### Change Email Template
Edit the `emailHTML` variable in `server/email-server.js`

### Change Modal Design
Edit `email-verification.css`

---

## 🚀 Production Deployment

### Heroku
```bash
cd server
heroku create your-app-name
heroku config:set EMAIL_USER=your@gmail.com
heroku config:set EMAIL_PASSWORD=your-password
git push heroku main
```

Update `email-verification.js`:
```javascript
const API_BASE_URL = 'https://your-app.herokuapp.com/api';
```

### VPS (Self-hosted)
```bash
# Install PM2
npm install -g pm2

# Start server
pm2 start server/email-server.js --name email-service
pm2 save
pm2 startup
```

---

## 📊 Testing

### Manual Test
1. Start server: `node server/email-server.js`
2. Open signup page
3. Use your own email address
4. Check email and verify code

### API Test (curl)
```bash
# Send code
curl -X POST http://localhost:3000/api/send-verification \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"name\":\"Test\"}"

# Verify code (check email for actual code)
curl -X POST http://localhost:3000/api/verify-code \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"code\":\"123456\"}"
```

---

## 🎓 How It Works

### Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Browser    │────▶│ Email Server │────▶│    Gmail     │
│ (signup.html)│     │   (Node.js)  │     │   (SMTP)     │
└──────────────┘     └──────────────┘     └──────────────┘
       │                     │                     │
       │  1. Submit form     │                     │
       │─────────────────────▶                     │
       │                     │                     │
       │                     │  2. Send email      │
       │                     │─────────────────────▶
       │                     │                     │
       │                     │  3. Code in email   │
       │                     │◀─────────────────────
       │                     │                     │
       │  4. User enters code│                     │
       │─────────────────────▶                     │
       │                     │                     │
       │  5. Verification OK │                     │
       │◀─────────────────────                     │
       │                     │                     │
```

### Data Flow

1. **User submits signup form**
   - Frontend validates inputs
   - Checks email format
   - Checks password strength

2. **Frontend requests verification**
   - POST to `/api/send-verification`
   - Passes email and name

3. **Server generates code**
   - Creates 6-digit random code
   - Stores in memory with expiration
   - Sets 3 attempt limit

4. **Server sends email**
   - Uses Nodemailer + Gmail
   - Beautiful HTML template
   - Includes code and expiration

5. **User receives email**
   - Opens email in Gmail
   - Sees verification code
   - Copies or types code

6. **User enters code**
   - Types in modal inputs
   - Auto-submits when complete
   - Or clicks "Verify Email"

7. **Server verifies code**
   - POST to `/api/verify-code`
   - Checks code matches
   - Checks not expired
   - Checks attempts < 3

8. **Success!**
   - Account created
   - User logged in
   - Redirected to dashboard

---

## 📝 Notes

- **Gmail limits**: ~500 emails/day for free accounts
- **Security**: Never commit `.env` file to Git
- **Production**: Use proper database for code storage
- **Scaling**: Consider Redis for high-traffic apps
- **Alternatives**: SendGrid, Mailgun, AWS SES

---

## 🎉 Features Summary

| Feature | Status |
|---------|--------|
| Email sending | ✅ Working |
| Code generation | ✅ 6 digits |
| Code expiration | ✅ 5 minutes |
| Attempt limiting | ✅ Max 3 tries |
| Resend functionality | ✅ Working |
| Beautiful email template | ✅ Branded |
| Modal UI | ✅ Animated |
| Auto-paste | ✅ Supported |
| Countdown timer | ✅ Real-time |
| Mobile responsive | ✅ Works great |
| Error handling | ✅ User-friendly |
| Security | ✅ Multiple layers |

---

**Ready to use!** 🚀

Just configure your Gmail credentials and start the server!

For detailed setup, see `EMAIL_VERIFICATION_SETUP.md`
For quick start, see `QUICK_START.md`
