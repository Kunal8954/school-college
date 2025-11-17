// Live Updates API Integration
// This file provides real API integration for the live updates portal

// API Configuration
const API_CONFIG = {
    // Change this to your actual API endpoint
    BASE_URL: 'https://your-api-url.com',  // Add your API
    BASE_URL: process.env.API_URL || 'https://api.collegefinder.com',
    
    // API Endpoints
    ENDPOINTS: {
        UPDATES: '/api/v1/updates',
        LATEST: '/api/v1/updates/latest',
        TRENDING: '/api/v1/updates/trending',
        SEARCH: '/api/v1/updates/search',
        SUBSCRIBE: '/api/v1/subscriptions',
        EXAMS: '/api/v1/exams',
        CATEGORIES: '/api/v1/categories',
        STATS: '/api/v1/stats'
    },
    
    // Request settings
    TIMEOUT: 10000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
    
    // Cache settings
    CACHE_DURATION: 60000, // 1 minute
    
    // Enable/disable features
    USE_CACHE: true,
    USE_MOCK_DATA: false // Set to true for development without backend
};

// Simple cache implementation
class APICache {
    constructor() {
        this.cache = new Map();
    }
    
    set(key, data, duration = API_CONFIG.CACHE_DURATION) {
        this.cache.set(key, {
            data,
            expires: Date.now() + duration
        });
    }
    
    get(key) {
        const item = this.cache.get(key);
        if (!item) return null;
        
        if (Date.now() > item.expires) {
            this.cache.delete(key);
            return null;
        }
        
        return item.data;
    }
    
    clear() {
        this.cache.clear();
    }
}

// API Client
class LiveUpdatesAPIClient {
    constructor(config) {
        this.config = config;
        this.cache = new APICache();
        this.baseURL = config.BASE_URL;
    }
    
    // Generic request handler with retry logic
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const cacheKey = `${endpoint}:${JSON.stringify(options)}`;
        
        // Check cache first
        if (this.config.USE_CACHE && options.method !== 'POST') {
            const cached = this.cache.get(cacheKey);
            if (cached) {
                console.log('Returning cached data for:', endpoint);
                return cached;
            }
        }
        
        const requestConfig = {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...options.headers
            },
            ...options
        };
        
        if (options.body && typeof options.body === 'object') {
            requestConfig.body = JSON.stringify(options.body);
        }
        
        let lastError;
        
        // Retry logic
        for (let attempt = 0; attempt < this.config.RETRY_ATTEMPTS; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.config.TIMEOUT);
                
                const response = await fetch(url, {
                    ...requestConfig,
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const data = await response.json();
                
                // Cache successful GET requests
                if (this.config.USE_CACHE && requestConfig.method === 'GET') {
                    this.cache.set(cacheKey, data);
                }
                
                return data;
                
            } catch (error) {
                lastError = error;
                console.warn(`API request failed (attempt ${attempt + 1}/${this.config.RETRY_ATTEMPTS}):`, error.message);
                
                if (attempt < this.config.RETRY_ATTEMPTS - 1) {
                    await this.delay(this.config.RETRY_DELAY * (attempt + 1));
                }
            }
        }
        
        throw lastError;
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // Get all updates with filters
    async getUpdates(filters = {}, page = 1, limit = 15) {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString()
        });
        
        // Add filters
        if (filters.category && filters.category !== 'all') {
            params.append('category', filters.category);
        }
        if (filters.exam && filters.exam !== 'all') {
            params.append('exam', filters.exam);
        }
        if (filters.urgency && filters.urgency !== 'all') {
            params.append('urgency', filters.urgency);
        }
        if (filters.search) {
            params.append('search', filters.search);
        }
        if (filters.sort) {
            params.append('sort', filters.sort);
        }
        
        return this.request(`${this.config.ENDPOINTS.UPDATES}?${params}`);
    }
    
    // Get single update by ID
    async getUpdate(id) {
        return this.request(`${this.config.ENDPOINTS.UPDATES}/${id}`);
    }
    
    // Get latest updates since timestamp (for auto-refresh)
    async getLatestUpdates(since) {
        const params = new URLSearchParams({
            since: since.toISOString()
        });
        
        return this.request(`${this.config.ENDPOINTS.LATEST}?${params}`);
    }
    
    // Get trending updates
    async getTrendingUpdates(limit = 5) {
        const params = new URLSearchParams({
            limit: limit.toString()
        });
        
        return this.request(`${this.config.ENDPOINTS.TRENDING}?${params}`);
    }
    
    // Search updates
    async searchUpdates(query, filters = {}) {
        return this.request(this.config.ENDPOINTS.SEARCH, {
            method: 'POST',
            body: {
                query,
                filters
            }
        });
    }
    
    // Get statistics
    async getStats() {
        return this.request(this.config.ENDPOINTS.STATS);
    }
    
    // Subscribe to notifications
    async subscribe(email, preferences) {
        return this.request(this.config.ENDPOINTS.SUBSCRIBE, {
            method: 'POST',
            body: {
                email,
                preferences
            }
        });
    }
    
    // Get available exams
    async getExams() {
        return this.request(this.config.ENDPOINTS.EXAMS);
    }
    
    // Get available categories
    async getCategories() {
        return this.request(this.config.ENDPOINTS.CATEGORIES);
    }
    
    // Increment view count
    async incrementViews(updateId) {
        return this.request(`${this.config.ENDPOINTS.UPDATES}/${updateId}/view`, {
            method: 'POST'
        });
    }
    
    // Clear cache
    clearCache() {
        this.cache.clear();
    }
}

// WebSocket client for real-time updates
class LiveUpdatesWebSocket {
    constructor(url, onMessage) {
        this.url = url;
        this.socket = null;
        this.onMessage = onMessage;
        this.reconnectInterval = 5000;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 10;
        this.isIntentionallyClosed = false;
    }
    
    connect() {
        try {
            this.isIntentionallyClosed = false;
            this.socket = new WebSocket(this.url);
            
            this.socket.onopen = () => {
                console.log('WebSocket connected');
                this.reconnectAttempts = 0;
                this.onConnectionChange(true);
            };
            
            this.socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.onMessage(data);
                } catch (error) {
                    console.error('Failed to parse WebSocket message:', error);
                }
            };
            
            this.socket.onerror = (error) => {
                console.error('WebSocket error:', error);
            };
            
            this.socket.onclose = () => {
                console.log('WebSocket disconnected');
                this.onConnectionChange(false);
                
                if (!this.isIntentionallyClosed) {
                    this.attemptReconnect();
                }
            };
            
        } catch (error) {
            console.error('Failed to create WebSocket:', error);
        }
    }
    
    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
            
            setTimeout(() => {
                this.connect();
            }, this.reconnectInterval);
        } else {
            console.error('Max reconnection attempts reached');
            this.onConnectionChange(false, true);
        }
    }
    
    disconnect() {
        this.isIntentionallyClosed = true;
        if (this.socket) {
            this.socket.close();
        }
    }
    
    send(data) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(data));
        } else {
            console.warn('WebSocket is not connected');
        }
    }
    
    onConnectionChange(connected, maxAttemptsReached = false) {
        // Override this method to handle connection changes
        console.log('Connection status:', connected ? 'connected' : 'disconnected');
    }
}

// Export API client instance
const apiClient = new LiveUpdatesAPIClient(API_CONFIG);

// Export for global access
if (typeof window !== 'undefined') {
    window.LiveUpdatesAPI = apiClient;
    window.LiveUpdatesWebSocket = LiveUpdatesWebSocket;
    window.API_CONFIG = API_CONFIG;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        LiveUpdatesAPIClient,
        LiveUpdatesWebSocket,
        API_CONFIG,
        apiClient
    };
}
