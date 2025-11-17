# 🚀 API Quick Start - 2 Minute Setup

## Current Status: Demo Mode ✅
Portal is running with **mock data** - fully functional, no backend needed!

## Switch to Live API Mode

### Step 1: Edit `live-updates.js` (Line 9)
```javascript
USE_REAL_API: true,  // Change false → true
```

### Step 2: Edit `live-updates-api.js` (Line 2)
```javascript
BASE_URL: 'https://your-api-url.com',  // Add your API URL
```

### Step 3: (Optional) Enable WebSocket
Edit `live-updates.js` (Line 10):
```javascript
WEBSOCKET_URL: 'wss://your-api-url.com/ws/updates'
```

### Step 4: Refresh Browser
- ✅ Green toast: "Connected to live updates" = Success!
- ❌ Red toast: "Failed to load" = Check API URL/CORS

## That's It! 🎉

Portal automatically:
- Fetches real data from your API
- Updates every 30 seconds
- Connects WebSocket for instant updates
- Falls back to mock data if API fails

## Need a Backend?

See `backend-integration-example.js` for complete server code.

Minimum required endpoints:
1. `GET /api/v1/updates` - Get all updates
2. `GET /api/v1/updates/latest?since={timestamp}` - Auto-refresh
3. `GET /api/v1/updates/trending` - Trending sidebar

Full API specs: `API_INTEGRATION_GUIDE.md`

---

**Demo Mode works perfectly for testing!** Switch to API mode when your backend is ready. 🚀
