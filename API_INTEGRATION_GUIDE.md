# API Integration Guide for Live Updates Portal

## Overview
The Live Updates Portal now supports both **mock data mode** (for development/demo) and **real API mode** (for production). This guide explains how to switch between modes and configure the API.

## Quick Start

### Demo Mode (Default)
The portal is currently configured to use mock data. This is perfect for:
- Testing the UI/UX
- Development without a backend
- Demos and presentations

**No configuration needed** - just open `live-updates.html` and it works!

### Live API Mode
To enable real-time API integration:

1. **Set API URL** in `live-updates.js`:
```javascript
const CONFIG = {
    AUTO_REFRESH_INTERVAL: 30000,
    UPDATES_PER_PAGE: 15,
    PARTICLE_COUNT: 20,
    TOAST_DURATION: 5000,
    USE_REAL_API: true,  // Change this to true
    WEBSOCKET_URL: 'wss://your-api-domain.com/ws/updates'  // Your WebSocket URL
};
```

2. **Configure API endpoint** in `live-updates-api.js`:
```javascript
const API_CONFIG = {
    BASE_URL: 'https://your-api-domain.com',  // Change this to your API URL
    ENDPOINTS: {
        UPDATES: '/api/v1/updates',
        // ... other endpoints
    },
    // ... other settings
};
```

3. **Test the connection**:
   - Open browser console
   - Look for "Connected to live updates" toast notification
   - If connection fails, portal automatically falls back to mock data

## API Requirements

### REST API Endpoints

Your backend must implement these endpoints:

#### 1. Get Updates (Paginated)
```
GET /api/v1/updates?category=all&exam=all&urgency=all&page=1&limit=15
```

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "id": "unique-id",
            "title": "JEE Main Registration Extended",
            "description": "The registration deadline has been extended...",
            "category": "admission",
            "urgency": "urgent",
            "timestamp": "2024-01-15T10:30:00Z",
            "deadline": "2024-02-01T23:59:59Z",
            "source": "NTA Official",
            "link": "https://jeemain.nta.nic.in",
            "tags": ["JEE Main", "Registration"],
            "views": 1250,
            "isPinned": false
        }
        // ... more updates
    ],
    "pagination": {
        "page": 1,
        "limit": 15,
        "total": 150,
        "totalPages": 10
    }
}
```

#### 2. Get Latest Updates (For Auto-Refresh)
```
GET /api/v1/updates/latest?since=2024-01-15T10:00:00Z
```

**Response:** Same format as Get Updates

#### 3. Get Trending Updates
```
GET /api/v1/updates/trending?limit=5
```

**Response:** Array of update objects sorted by views

#### 4. Search Updates
```
POST /api/v1/updates/search
Content-Type: application/json

{
    "query": "JEE",
    "category": "admission",
    "exam": "JEE Main"
}
```

**Response:** Same format as Get Updates

#### 5. Get Single Update
```
GET /api/v1/updates/:id
```

**Response:**
```json
{
    "success": true,
    "data": { /* update object */ }
}
```

#### 6. Subscribe to Notifications
```
POST /api/v1/updates/subscribe
Content-Type: application/json

{
    "email": "user@example.com",
    "preferences": {
        "categories": ["admission", "deadline"],
        "exams": ["JEE Main", "NEET"]
    }
}
```

**Response:**
```json
{
    "success": true,
    "message": "Subscribed successfully"
}
```

### WebSocket API (Optional but Recommended)

For real-time updates without polling:

#### Connection
```
WebSocket URL: wss://your-api-domain.com/ws/updates
```

#### Message Types

**Server → Client (New Update):**
```json
{
    "type": "update",
    "data": {
        "id": "unique-id",
        "title": "New Update",
        // ... full update object
    }
}
```

**Server → Client (Update Modified):**
```json
{
    "type": "modify",
    "data": {
        "id": "update-id",
        // ... modified update object
    }
}
```

**Server → Client (Update Deleted):**
```json
{
    "type": "delete",
    "data": {
        "id": "update-id"
    }
}
```

**Client → Server (Ping/Keepalive):**
```json
{
    "type": "ping"
}
```

**Server → Client (Pong):**
```json
{
    "type": "pong",
    "timestamp": "2024-01-15T10:30:00Z"
}
```

## Features Enabled by API Integration

### ✅ With API Connected:
- **Real-time updates** via WebSocket
- **Live data** from your database
- **User analytics** (view counts, trending)
- **Email subscriptions** for notifications
- **Automatic sync** across multiple devices
- **Data persistence** in backend
- **Advanced search** with database queries

### ⚡ With Mock Data (Current):
- **Instant demo** without backend setup
- **50+ sample updates** for realistic UI
- **All UI features** working perfectly
- **Countdown timers** and animations
- **Search and filtering** (client-side)
- **Local storage** for saved items
- **Perfect for development**

## Testing the Integration

### Step 1: Enable API Mode
Set `USE_REAL_API: true` in `live-updates.js`

### Step 2: Check Browser Console
Look for these messages:
- ✅ "API initialized successfully"
- ✅ "WebSocket connected"
- ❌ "API initialization failed" → Falls back to mock data

### Step 3: Monitor Network Tab
- Watch for GET requests to `/api/v1/updates`
- Verify response format matches specification
- Check for WebSocket connection upgrade

### Step 4: Test Features
1. **Initial Load**: Should fetch updates from API
2. **Filtering**: Should send new API requests with query params
3. **Search**: Should POST to search endpoint
4. **Auto-Refresh**: Should call `/latest` endpoint every 30 seconds
5. **WebSocket**: New updates should appear instantly without refresh

## Troubleshooting

### Portal shows "Demo Mode"
- Check `USE_REAL_API` is set to `true`
- Verify API URL is correct
- Check CORS headers on backend
- Open browser console for error messages

### WebSocket not connecting
- Verify WebSocket URL uses `wss://` protocol
- Check firewall/proxy settings
- Ensure backend supports WebSocket upgrades
- Monitor console for connection errors

### API requests failing
- Check API endpoint URLs match backend
- Verify CORS is configured on backend
- Check authentication if required
- Review API response format

### Automatic fallback to mock data
This is **by design**! If API fails:
1. Portal shows error toast
2. Switches to mock data automatically
3. User can still use all features
4. No disruption to UX

## Security Considerations

### HTTPS/WSS Required in Production
```javascript
// Development (HTTP OK)
BASE_URL: 'http://localhost:3000'
WEBSOCKET_URL: 'ws://localhost:3000/ws'

// Production (HTTPS Required)
BASE_URL: 'https://api.yourdomain.com'
WEBSOCKET_URL: 'wss://api.yourdomain.com/ws'
```

### API Authentication (If Needed)
Modify `request()` method in `live-updates-api.js`:

```javascript
async request(endpoint, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${YOUR_API_TOKEN}`,  // Add auth header
        ...options.headers
    };
    
    // ... rest of code
}
```

### Rate Limiting
API client includes automatic retry with exponential backoff:
- 3 retry attempts
- 1 second initial delay
- Prevents overwhelming backend

### Caching
Responses are cached for 60 seconds to reduce API calls:
```javascript
CACHE: {
    DURATION: 60000  // Adjust as needed
}
```

## Need Help?

### Backend Examples
See `backend-integration-example.js` for:
- Express.js server setup
- PostgreSQL database schema
- WebSocket implementation
- Complete API routes

### Mock to Real Migration
The portal seamlessly handles both modes:
1. Develop with mock data (no backend needed)
2. Build your backend API
3. Switch `USE_REAL_API: true`
4. Test with real data
5. Deploy to production

### Support
- Check browser console for detailed error messages
- Review Network tab for API request/response
- Test API endpoints with Postman/curl first
- Verify data format matches specifications

---

## Summary

| Feature | Mock Mode | API Mode |
|---------|-----------|----------|
| Setup Required | None | Backend API |
| Real-time Updates | Auto-refresh (30s) | WebSocket (instant) |
| Data Persistence | LocalStorage | Database |
| Search | Client-side | Server-side |
| Analytics | Mock data | Real metrics |
| Subscriptions | UI only | Email enabled |
| **Best For** | **Development/Demo** | **Production** |

**Current Status:** ✅ Portal ready for both modes!

Set `USE_REAL_API: true` when your backend is ready. Until then, enjoy the fully-functional demo mode! 🚀
