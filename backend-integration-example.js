// Backend Integration Example for Live Updates Portal
// This file demonstrates how to connect the frontend to a real backend API

/**
 * API ENDPOINTS STRUCTURE
 * 
 * GET  /api/updates              - Fetch all updates with pagination
 * GET  /api/updates/:id          - Fetch single update details
 * GET  /api/updates/latest       - Fetch latest updates (auto-refresh)
 * GET  /api/updates/trending     - Fetch trending updates
 * POST /api/updates/subscribe    - Subscribe to notifications
 * POST /api/updates/search       - Search updates
 * GET  /api/exams                - Fetch all exams list
 * GET  /api/categories           - Fetch all categories
 */

// API Configuration
const API_CONFIG = {
    BASE_URL: 'https://api.collegefinder.com', // Replace with actual API
    ENDPOINTS: {
        UPDATES: '/api/updates',
        LATEST: '/api/updates/latest',
        TRENDING: '/api/updates/trending',
        SEARCH: '/api/updates/search',
        SUBSCRIBE: '/api/updates/subscribe',
        EXAMS: '/api/exams',
        CATEGORIES: '/api/categories'
    },
    TIMEOUT: 10000,
    RETRY_ATTEMPTS: 3
};

// API Client Class
class LiveUpdatesAPI {
    constructor(config) {
        this.baseURL = config.BASE_URL;
        this.endpoints = config.ENDPOINTS;
        this.timeout = config.TIMEOUT;
    }

    // Generic fetch wrapper with error handling
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        };

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);

            const response = await fetch(url, {
                ...config,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    }

    // Fetch all updates with filters
    async getUpdates(filters = {}, page = 1, limit = 15) {
        const params = new URLSearchParams({
            page,
            limit,
            ...filters
        });

        return this.request(`${this.endpoints.UPDATES}?${params}`);
    }

    // Fetch single update
    async getUpdate(id) {
        return this.request(`${this.endpoints.UPDATES}/${id}`);
    }

    // Fetch latest updates (for auto-refresh)
    async getLatestUpdates(since) {
        const params = new URLSearchParams({ since: since.toISOString() });
        return this.request(`${this.endpoints.LATEST}?${params}`);
    }

    // Fetch trending updates
    async getTrendingUpdates(limit = 5) {
        const params = new URLSearchParams({ limit });
        return this.request(`${this.endpoints.TRENDING}?${params}`);
    }

    // Search updates
    async searchUpdates(query, filters = {}) {
        return this.request(this.endpoints.SEARCH, {
            method: 'POST',
            body: JSON.stringify({ query, filters })
        });
    }

    // Subscribe to notifications
    async subscribe(email, preferences) {
        return this.request(this.endpoints.SUBSCRIBE, {
            method: 'POST',
            body: JSON.stringify({ email, preferences })
        });
    }

    // Fetch exams list
    async getExams() {
        return this.request(this.endpoints.EXAMS);
    }

    // Fetch categories list
    async getCategories() {
        return this.request(this.endpoints.CATEGORIES);
    }
}

// Initialize API client
const api = new LiveUpdatesAPI(API_CONFIG);

// Replace the generateUpdatesData function with real API call
async function loadUpdatesFromBackend() {
    try {
        showLoadingState();
        
        const response = await api.getUpdates(state.currentFilters, state.currentPage, CONFIG.UPDATES_PER_PAGE);
        
        state.allUpdates = response.data.map(update => ({
            id: update.id,
            category: update.category,
            exam: update.exam_name,
            urgency: update.priority_level,
            title: update.title,
            description: update.description,
            timestamp: new Date(update.published_at),
            deadline: update.deadline_date ? new Date(update.deadline_date) : null,
            details: update.metadata || {},
            link: update.source_url || '#',
            isNew: isWithin24Hours(update.published_at),
            views: update.view_count || 0
        }));
        
        hideLoadingState();
        applyFilters();
        
    } catch (error) {
        console.error('Failed to load updates:', error);
        showToast('Error Loading Updates', 'Please try again later', 'error');
        // Fallback to mock data
        generateUpdatesData();
    }
}

// Auto-refresh with backend
async function refreshFromBackend() {
    try {
        const response = await api.getLatestUpdates(state.lastUpdateTime);
        
        if (response.data && response.data.length > 0) {
            // Prepend new updates
            const newUpdates = response.data.map(update => ({
                id: update.id,
                category: update.category,
                exam: update.exam_name,
                urgency: update.priority_level,
                title: update.title,
                description: update.description,
                timestamp: new Date(update.published_at),
                deadline: update.deadline_date ? new Date(update.deadline_date) : null,
                details: update.metadata || {},
                link: update.source_url || '#',
                isNew: true,
                views: update.view_count || 0
            }));
            
            state.allUpdates = [...newUpdates, ...state.allUpdates];
            state.lastUpdateTime = new Date();
            applyFilters();
            
            showToast('New Updates Available', `${newUpdates.length} update(s) added`, 'success');
        }
        
    } catch (error) {
        console.error('Auto-refresh failed:', error);
    }
}

// Search with backend
async function searchWithBackend(query) {
    try {
        const response = await api.searchUpdates(query, state.currentFilters);
        
        state.filteredUpdates = response.data.map(update => ({
            id: update.id,
            category: update.category,
            exam: update.exam_name,
            urgency: update.priority_level,
            title: update.title,
            description: update.description,
            timestamp: new Date(update.published_at),
            deadline: update.deadline_date ? new Date(update.deadline_date) : null,
            details: update.metadata || {},
            link: update.source_url || '#',
            isNew: isWithin24Hours(update.published_at),
            views: update.view_count || 0
        }));
        
        renderTimeline();
        
    } catch (error) {
        console.error('Search failed:', error);
        showToast('Search Error', 'Please try again', 'error');
    }
}

// Subscribe to email notifications
async function subscribeToNotifications(email, categories, exams) {
    try {
        const response = await api.subscribe(email, {
            categories,
            exams,
            urgency_levels: ['urgent', 'important']
        });
        
        if (response.success) {
            showToast('Subscribed!', 'You will receive notifications via email', 'success');
            return true;
        }
        
    } catch (error) {
        console.error('Subscription failed:', error);
        showToast('Subscription Failed', 'Please try again later', 'error');
        return false;
    }
}

// WebSocket Integration for Real-Time Updates
class LiveUpdatesWebSocket {
    constructor(url) {
        this.url = url;
        this.socket = null;
        this.reconnectInterval = 5000;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 10;
    }

    connect() {
        this.socket = new WebSocket(this.url);

        this.socket.onopen = () => {
            console.log('WebSocket connected');
            this.reconnectAttempts = 0;
            showToast('Connected', 'Real-time updates active', 'success');
        };

        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
        };

        this.socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        this.socket.onclose = () => {
            console.log('WebSocket disconnected');
            this.attemptReconnect();
        };
    }

    handleMessage(data) {
        switch (data.type) {
            case 'new_update':
                this.addNewUpdate(data.update);
                break;
            case 'update_modified':
                this.updateExisting(data.update);
                break;
            case 'deadline_alert':
                this.showDeadlineAlert(data.update);
                break;
            case 'cutoff_released':
                this.showCutoffAlert(data.update);
                break;
        }
    }

    addNewUpdate(update) {
        const newUpdate = {
            id: update.id,
            category: update.category,
            exam: update.exam_name,
            urgency: update.priority_level,
            title: update.title,
            description: update.description,
            timestamp: new Date(update.published_at),
            deadline: update.deadline_date ? new Date(update.deadline_date) : null,
            details: update.metadata || {},
            link: update.source_url || '#',
            isNew: true,
            views: 0
        };

        state.allUpdates.unshift(newUpdate);
        applyFilters();
        
        // Show notification toast
        showToast(
            '🔥 New Update!',
            update.title.substring(0, 60) + '...',
            'success'
        );

        // Play notification sound (optional)
        playNotificationSound();

        // Flash the stat card
        animateStatCard('totalUpdates');
    }

    updateExisting(update) {
        const index = state.allUpdates.findIndex(u => u.id === update.id);
        if (index !== -1) {
            state.allUpdates[index] = {
                ...state.allUpdates[index],
                ...update
            };
            applyFilters();
        }
    }

    showDeadlineAlert(update) {
        showToast(
            '⏰ Deadline Alert!',
            `${update.title} - Deadline approaching`,
            'warning'
        );
    }

    showCutoffAlert(update) {
        showToast(
            '📊 Cutoff Released!',
            update.title,
            'success'
        );
    }

    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            setTimeout(() => {
                console.log('Attempting to reconnect...');
                this.reconnectAttempts++;
                this.connect();
            }, this.reconnectInterval);
        } else {
            showToast('Connection Lost', 'Please refresh the page', 'error');
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.close();
        }
    }
}

// Initialize WebSocket (if available)
let websocket = null;

function initializeWebSocket() {
    const wsURL = 'wss://api.collegefinder.com/ws/updates';
    websocket = new LiveUpdatesWebSocket(wsURL);
    websocket.connect();
}

// Notification Sound
function playNotificationSound() {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBzSO1fbTgTMGHmq88+eVTg0PUa');
    audio.volume = 0.3;
    audio.play().catch(() => {
        // Silently fail if autoplay is blocked
    });
}

// Stat Card Flash Animation
function animateStatCard(statId) {
    const card = document.querySelector(`#${statId}`).closest('.stat-box');
    if (card) {
        card.style.animation = 'flash-stat 0.5s ease';
        setTimeout(() => {
            card.style.animation = '';
        }, 500);
    }
}

// Helper function
function isWithin24Hours(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const hoursDiff = (now - date) / (1000 * 60 * 60);
    return hoursDiff < 24;
}

// Database Schema Example (for reference)
/*
CREATE TABLE updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    exam_name VARCHAR(100) NOT NULL,
    priority_level VARCHAR(20) NOT NULL,
    published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deadline_date TIMESTAMP,
    source_url TEXT,
    metadata JSONB,
    view_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_updates_category ON updates(category);
CREATE INDEX idx_updates_exam ON updates(exam_name);
CREATE INDEX idx_updates_published ON updates(published_at DESC);
CREATE INDEX idx_updates_deadline ON updates(deadline_date);

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    categories TEXT[],
    exams TEXT[],
    urgency_levels TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_subscriptions_email ON subscriptions(email);
*/

// Express.js Backend Example
/*
const express = require('express');
const app = express();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

// Get all updates with filters
app.get('/api/updates', async (req, res) => {
    try {
        const { category, exam, urgency, page = 1, limit = 15 } = req.query;
        const offset = (page - 1) * limit;
        
        let query = 'SELECT * FROM updates WHERE is_active = true';
        const params = [];
        let paramCount = 1;
        
        if (category && category !== 'all') {
            query += ` AND category = $${paramCount++}`;
            params.push(category);
        }
        
        if (exam && exam !== 'all') {
            query += ` AND exam_name = $${paramCount++}`;
            params.push(exam);
        }
        
        if (urgency && urgency !== 'all') {
            query += ` AND priority_level = $${paramCount++}`;
            params.push(urgency);
        }
        
        query += ` ORDER BY published_at DESC LIMIT $${paramCount++} OFFSET $${paramCount}`;
        params.push(limit, offset);
        
        const result = await pool.query(query, params);
        
        res.json({
            success: true,
            data: result.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: result.rowCount
            }
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// Get latest updates
app.get('/api/updates/latest', async (req, res) => {
    try {
        const { since } = req.query;
        
        const result = await pool.query(
            'SELECT * FROM updates WHERE published_at > $1 AND is_active = true ORDER BY published_at DESC',
            [since]
        );
        
        res.json({
            success: true,
            data: result.rows
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// Search updates
app.post('/api/updates/search', async (req, res) => {
    try {
        const { query, filters } = req.body;
        
        const result = await pool.query(
            `SELECT * FROM updates 
             WHERE (title ILIKE $1 OR description ILIKE $1)
             AND is_active = true
             ORDER BY published_at DESC
             LIMIT 50`,
            [`%${query}%`]
        );
        
        res.json({
            success: true,
            data: result.rows
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

app.listen(3000, () => {
    console.log('API server running on port 3000');
});
*/

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        LiveUpdatesAPI,
        LiveUpdatesWebSocket,
        API_CONFIG
    };
}
