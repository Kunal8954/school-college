# Email Verification System - Quick Start

## ⚡ Quick Setup (5 minutes)

### 1. Install Dependencies
Already done! ✅

### 2. Configure Gmail

1. **Get your Gmail App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Click "Generate"
   - Copy the 16-character password

2. **Edit `server/.env` file:**
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-16-char-password
   PORT=3000
   ```

### 3. Start the Server

**Option A: Start in new terminal**
```bash
cd server
node email-server.js
```

**Option B: Background mode**
```bash
cd server
start node email-server.js
```

You should see:
```
✅ Email verification server running on http://localhost:3000
📧 Email configured: your-email@gmail.com
```

### 4. Test It!

1. Open `signup.html` in browser
2. Fill the form and submit
3. Check your email for 6-digit code
4. Enter the code and verify!

## 📋 Files Created

```
server/
├── email-server.js          ← Main server file
├── package.json            ← Dependencies
├── .env                    ← Your credentials (FILL THIS!)
└── .env.example           ← Template

email-verification.css      ← Modal styles
email-verification.js       ← Frontend logic
signup.html                ← Updated with modal
signup.js                  ← Updated with verification
EMAIL_VERIFICATION_SETUP.md ← Full documentation
```

## 🎯 How It Works

1. **User fills signup form** → Clicks "Create Account"
2. **Email validation** → Checks format and duplicates
3. **Modal opens** → Shows 6-digit code input
4. **Server sends email** → Beautiful email with code
5. **User enters code** → Auto-submits when complete
6. **Server verifies** → Checks code and expiration
7. **Success!** → User account created

## 🔥 Features

- ✅ 6-digit verification codes
- ✅ 5-minute expiration with countdown
- ✅ Resend code functionality
- ✅ Auto-paste support
- ✅ Beautiful email template
- ✅ Real-time validation
- ✅ Mobile-responsive
- ✅ Smooth animations

## 🐛 Troubleshooting

**Server won't start?**
→ Make sure you're in the `server` directory

**Email not sending?**
→ Check your `.env` file has correct credentials

**"Invalid password" error?**
→ Use Gmail App Password, not regular password
→ Generate at: https://myaccount.google.com/apppasswords

**Email goes to spam?**
→ Normal for first few emails, check spam folder

**Code expired?**
→ Click "Resend Code" button

## 📞 Need Help?

1. Check `EMAIL_VERIFICATION_SETUP.md` for detailed docs
2. Verify `.env` configuration
3. Check server console for errors
4. Make sure port 3000 is not in use

---

**Ready to go! 🚀**

Start the server and test your email verification!
