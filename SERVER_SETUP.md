# SERVER_SETUP.md

## Setup the Backend Email Server

Since EmailJS is having template issues, here's how to set up the Express server for reliable email sending.

### Step 1: Install Server Dependencies

```powershell
cd server
npm install
```

### Step 2: Set Up Gmail App Password

1. Enable 2-Factor Authentication on your Google account (https://accounts.google.com/signin/v2/security)
2. Go to https://myaccount.google.com/apppasswords
3. Select "Mail" and "Windows Computer" (or your OS)
4. Google will generate a 16-character password — copy it

### Step 3: Create `.env` in the `server` folder

Create `server/.env`:

```
GMAIL_USER=your-gmail@gmail.com
GMAIL_PASSWORD=xxxx xxxx xxxx xxxx
PORT=3001
```

Replace:
- `your-gmail@gmail.com` with your actual Gmail address
- `xxxx xxxx xxxx xxxx` with the 16-char app password from step 2

### Step 4: Start the Server

```powershell
cd server
npm start
```

You should see:
```
🚀 CollegeFinder Auth Server running on http://localhost:3001
📧 Email sending configured: ✓
```

### Step 5: Update Frontend Env (Optional)

If your backend runs on a different port or machine, add to `.env` in the project root:

```
VITE_API_URL=http://localhost:3001
```

(Default is already `http://localhost:3001`)

### Step 6: Test the Flow

1. Keep the backend running on 3001
2. Keep the frontend running on 8081 (or 8080)
3. Go to Signup page
4. Enter email and click "Send code"
5. Check console for logs (F12 → Console)
6. Check your email inbox for the verification code
7. Enter the code and verify

### Troubleshooting

**"Server not configured for email sending"**
- Check `GMAIL_USER` and `GMAIL_PASSWORD` are set in `server/.env`
- Restart the server after updating `.env`

**"Failed to send email"**
- Verify the Gmail app password (should be 16 chars with spaces)
- Check that 2FA is enabled on your Google account
- Try creating a new app password

**Backend not responding**
- Make sure port 3001 is free: `netstat -ano | findstr :3001`
- If in use, change `PORT=3001` to another port in `server/.env`
- Update `VITE_API_URL` in the frontend `.env` if port changed

### Architecture

- **Frontend** (React, Vite) on http://localhost:8081
- **Backend** (Express + Nodemailer) on http://localhost:3001
- Code is stored **server-side** (safe) and validated on each attempt
- Max 5 attempts per code, then code expires
- 15-minute expiry on each code
