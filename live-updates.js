// Live Updates Portal - Real API Integration

// Configuration
const CONFIG = {
    AUTO_REFRESH_INTERVAL: 30000, // 30 seconds
    UPDATES_PER_PAGE: 15,
    PARTICLE_COUNT: 20,
    TOAST_DURATION: 5000,
    USE_REAL_API: true, // Set to true when API is ready
    WEBSOCKET_URL: 'wss://api.collegefinder.com/ws/updates'
};

// State Management
let state = {
    allUpdates: [],
    filteredUpdates: [],
    currentFilters: {
        category: 'all',
        exam: 'all',
        urgency: 'all',
        sort: 'newest',
        search: '',
        quick: null
    },
    currentPage: 1,
    currentView: 'timeline',
    savedUpdates: new Set(),
    lastUpdateTime: new Date(),
    autoRefreshEnabled: true,
    autoRefreshTimer: null,
    websocket: null,
    isOnline: true
};

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', async () => {
    await initializeApp();
});

async function initializeApp() {
    createEnergyParticles();
    loadSavedUpdates();
    showLoading(true);
    
    try {
        if (CONFIG.USE_REAL_API && typeof LiveUpdatesAPI !== 'undefined') {
            await initializeRealAPI();
        } else {
            await initializeMockData();
        }
    } catch (error) {
        console.error('Initialization error:', error);
        showToast('Failed to load updates. Using offline mode.', '', 'error');
        await initializeMockData(); // Fallback to mock data
    }
    
    showLoading(false);
    setupEventListeners();
    startAutoRefresh();
    renderAll();
    
    const mode = CONFIG.USE_REAL_API ? 'Live Mode' : 'Demo Mode';
    showToast(`Welcome to Live Updates Portal`, `${mode} - Monitoring real-time changes`, 'success');
}

// Initialize with real API
async function initializeRealAPI() {
    try {
        // Get initial updates from API
        const response = await LiveUpdatesAPI.getUpdates(state.currentFilters, 1, 50);
        state.allUpdates = response.data || [];
        state.lastUpdateTime = new Date();
        
        // Apply initial filters
        applyFilters();
        
        // Initialize WebSocket for real-time updates
        if (CONFIG.WEBSOCKET_URL && window.LiveUpdatesWebSocket) {
            initializeWebSocket();
        }
        
        state.isOnline = true;
    } catch (error) {
        console.error('API initialization failed:', error);
        throw error; // Will trigger fallback
    }
}

// Initialize WebSocket connection
function initializeWebSocket() {
    if (!CONFIG.WEBSOCKET_URL || !window.LiveUpdatesWebSocket) return;
    
    state.websocket = new LiveUpdatesWebSocket(CONFIG.WEBSOCKET_URL);
    
    state.websocket.on('update', (data) => {
        handleNewUpdate(data);
    });
    
    state.websocket.on('delete', (data) => {
        handleDeleteUpdate(data.id);
    });
    
    state.websocket.on('modify', (data) => {
        handleModifyUpdate(data);
    });
    
    state.websocket.connect();
}

// Handle new update from WebSocket
function handleNewUpdate(update) {
    // Add to beginning of array
    state.allUpdates.unshift(update);
    
    // Update UI if matches current filters
    if (matchesFilters(update)) {
        state.filteredUpdates.unshift(update);
        
        // If on first page, re-render to show new update
        if (state.currentPage === 1) {
            renderTimeline();
        }
        
        showToast(`New Update`, update.title, 'info');
    }
}

// Handle update deletion
function handleDeleteUpdate(updateId) {
    state.allUpdates = state.allUpdates.filter(u => u.id !== updateId);
    state.filteredUpdates = state.filteredUpdates.filter(u => u.id !== updateId);
    renderTimeline();
}

// Handle update modification
function handleModifyUpdate(updatedUpdate) {
    // Update in allUpdates
    const allIndex = state.allUpdates.findIndex(u => u.id === updatedUpdate.id);
    if (allIndex !== -1) {
        state.allUpdates[allIndex] = updatedUpdate;
    }
    
    // Update in filteredUpdates if present
    const filteredIndex = state.filteredUpdates.findIndex(u => u.id === updatedUpdate.id);
    if (filteredIndex !== -1) {
        state.filteredUpdates[filteredIndex] = updatedUpdate;
        renderTimeline();
    }
}

// Check if update matches current filters
function matchesFilters(update) {
    const filters = state.currentFilters;
    
    // Category filter
    if (filters.category !== 'all' && update.category !== filters.category) {
        return false;
    }
    
    // Exam filter
    if (filters.exam !== 'all' && !update.tags.includes(filters.exam)) {
        return false;
    }
    
    // Urgency filter
    if (filters.urgency !== 'all' && update.urgency !== filters.urgency) {
        return false;
    }
    
    // Search filter
    if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesTitle = update.title.toLowerCase().includes(searchLower);
        const matchesDescription = update.description.toLowerCase().includes(searchLower);
        const matchesTags = update.tags.some(tag => tag.toLowerCase().includes(searchLower));
        
        if (!matchesTitle && !matchesDescription && !matchesTags) {
            return false;
        }
    }
    
    return true;
}

// Initialize with mock data
async function initializeMockData() {
    generateUpdatesData();
    state.lastUpdateTime = new Date();
    applyFilters();
    state.isOnline = false;
}

// Generate Energy Particles for Lightning Icon
function createEnergyParticles() {
    const container = document.getElementById('energyParticles');
    if (!container) return;
    
    for (let i = 0; i < CONFIG.PARTICLE_COUNT; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.animationDelay = `${Math.random() * 3}s`;
        particle.style.animationDuration = `${2 + Math.random() * 2}s`;
        container.appendChild(particle);
    }
}

// Data Generation - Simulates Backend API
function generateUpdatesData() {
    const categories = ['admission', 'cutoff', 'deadline', 'result', 'exam'];
    const exams = ['JEE Main', 'JEE Advanced', 'NEET', 'CAT', 'GATE', 'CUET', 'BITSAT', 'VITEEE'];
    const urgencies = ['urgent', 'important', 'normal'];
    
    const templates = [
        {
            category: 'admission',
            titles: [
                '{exam} Registration Extended - New Deadline Announced',
                '{exam} Admission Portal Reopened for Special Category',
                '{exam} Counselling Round {round} Schedule Released',
                'Spot Admission for {exam} - Limited Seats Available'
            ]
        },
        {
            category: 'cutoff',
            titles: [
                '{exam} Expected Cutoff 2024 - Category Wise Analysis',
                '{exam} Previous Year Cutoff Trends Released',
                '{exam} Opening and Closing Ranks Announced',
                'College-wise {exam} Cutoff Marks Published'
            ]
        },
        {
            category: 'deadline',
            titles: [
                '{exam} Application Deadline - Last Date Extended',
                '{exam} Fee Payment Deadline Approaching Fast',
                'Important: {exam} Document Verification Deadline',
                '{exam} Seat Acceptance Deadline - Don\'t Miss!'
            ]
        },
        {
            category: 'result',
            titles: [
                '{exam} Result 2024 Declared - Check Your Score',
                '{exam} Final Answer Key Released with Results',
                '{exam} Rank List Published - Download PDF',
                '{exam} Score Card Available for Download'
            ]
        },
        {
            category: 'exam',
            titles: [
                '{exam} Exam Date 2024 Announced - Check Schedule',
                '{exam} Admit Card Released - Download Now',
                '{exam} Exam Pattern Changed - Important Update',
                '{exam} Mock Test Series Available Online'
            ]
        }
    ];
    
    state.allUpdates = [];
    const now = Date.now();
    
    for (let i = 0; i < 50; i++) {
        const category = categories[Math.floor(Math.random() * categories.length)];
        const exam = exams[Math.floor(Math.random() * exams.length)];
        const urgency = urgencies[Math.floor(Math.random() * urgencies.length)];
        const template = templates.find(t => t.category === category);
        const titleTemplate = template.titles[Math.floor(Math.random() * template.titles.length)];
        const round = Math.ceil(Math.random() * 5);
        
        const hoursAgo = Math.random() * 72;
        const timestamp = new Date(now - hoursAgo * 60 * 60 * 1000);
        
        // Generate realistic deadline
        const daysFromNow = 1 + Math.floor(Math.random() * 30);
        const deadline = new Date(now + daysFromNow * 24 * 60 * 60 * 1000);
        
        const update = {
            id: `update-${i + 1}`,
            category,
            exam,
            urgency,
            title: titleTemplate.replace('{exam}', exam).replace('{round}', round),
            description: generateDescription(category, exam),
            timestamp,
            deadline: category === 'deadline' || category === 'admission' ? deadline : null,
            details: generateDetails(category, exam),
            link: '#',
            isNew: hoursAgo < 24,
            views: Math.floor(Math.random() * 10000) + 100
        };
        
        state.allUpdates.push(update);
    }
    
    // Sort by newest first
    state.allUpdates.sort((a, b) => b.timestamp - a.timestamp);
}

function generateDescription(category, exam) {
    const descriptions = {
        admission: `The ${exam} admission process has been updated. Candidates are advised to check the official portal for detailed information and complete the required formalities within the stipulated time.`,
        cutoff: `${exam} cutoff analysis based on previous trends and current competition levels. Detailed category-wise and college-wise cutoff information available.`,
        deadline: `Important deadline approaching for ${exam}. Ensure all documents and fees are submitted before the due date to avoid last-minute issues.`,
        result: `${exam} results have been officially declared. Candidates can check their scores using registration number and date of birth on the official website.`,
        exam: `${exam} examination schedule and important instructions released. Download admit card and review exam pattern carefully before the test date.`
    };
    return descriptions[category] || 'Important update regarding the examination process.';
}

function generateDetails(category, exam) {
    const details = {
        'Official Source': `${exam} Official Website`,
        'Published On': formatDate(new Date()),
        'Applicable For': 'All Candidates',
        'Status': 'Active'
    };
    
    if (category === 'cutoff') {
        details['Expected Range'] = `${Math.floor(Math.random() * 50) + 150}-${Math.floor(Math.random() * 50) + 200}`;
        details['Category'] = 'General/OBC/SC/ST';
    }
    
    if (category === 'deadline') {
        details['Time Remaining'] = 'Check Timer';
        details['Extension'] = Math.random() > 0.7 ? 'Possible' : 'Not Expected';
    }
    
    return details;
}

// Event Listeners Setup
function setupEventListeners() {
    // Search
    const searchInput = document.getElementById('searchInput');
    const clearSearch = document.getElementById('clearSearch');
    
    searchInput?.addEventListener('input', (e) => {
        state.currentFilters.search = e.target.value;
        clearSearch.style.display = e.target.value ? 'block' : 'none';
        applyFilters();
    });
    
    clearSearch?.addEventListener('click', () => {
        searchInput.value = '';
        state.currentFilters.search = '';
        clearSearch.style.display = 'none';
        applyFilters();
    });
    
    // Category Pills
    document.querySelectorAll('.pill-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.currentFilters.category = btn.dataset.category;
            applyFilters();
        });
    });
    
    // Filter Selects
    document.getElementById('examFilter')?.addEventListener('change', (e) => {
        state.currentFilters.exam = e.target.value;
        applyFilters();
    });
    
    document.getElementById('urgencyFilter')?.addEventListener('change', (e) => {
        state.currentFilters.urgency = e.target.value;
        applyFilters();
    });
    
    document.getElementById('sortFilter')?.addEventListener('change', (e) => {
        state.currentFilters.sort = e.target.value;
        applyFilters();
    });
    
    // Quick Filters
    document.querySelectorAll('.quick-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const isActive = btn.classList.contains('active');
            document.querySelectorAll('.quick-filter-btn').forEach(b => b.classList.remove('active'));
            
            if (!isActive) {
                btn.classList.add('active');
                state.currentFilters.quick = btn.dataset.quick;
            } else {
                state.currentFilters.quick = null;
            }
            applyFilters();
        });
    });
    
    // View Toggle
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.currentView = btn.dataset.view;
            renderTimeline();
        });
    });
    
    // Manual Refresh
    document.getElementById('manualRefresh')?.addEventListener('click', () => {
        refreshUpdates();
    });
    
    // Load More
    document.getElementById('loadMoreBtn')?.addEventListener('click', () => {
        state.currentPage++;
        renderTimeline(true);
    });
    
    // FAB
    const fabMain = document.getElementById('fabMain');
    const fabMenu = document.getElementById('fabMenu');
    
    fabMain?.addEventListener('click', () => {
        fabMenu.classList.toggle('active');
    });
    
    document.querySelectorAll('.fab-item').forEach(item => {
        item.addEventListener('click', () => {
            const action = item.dataset.action;
            handleFabAction(action);
            fabMenu.classList.remove('active');
        });
    });
    
    // Close FAB menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.fab-container')) {
            fabMenu?.classList.remove('active');
        }
    });
}

// Apply Filters
function applyFilters() {
    let filtered = [...state.allUpdates];
    
    // Category filter
    if (state.currentFilters.category !== 'all') {
        filtered = filtered.filter(u => u.category === state.currentFilters.category);
    }
    
    // Exam filter
    if (state.currentFilters.exam !== 'all') {
        filtered = filtered.filter(u => u.exam === state.currentFilters.exam);
    }
    
    // Urgency filter
    if (state.currentFilters.urgency !== 'all') {
        filtered = filtered.filter(u => u.urgency === state.currentFilters.urgency);
    }
    
    // Search filter
    if (state.currentFilters.search) {
        const search = state.currentFilters.search.toLowerCase();
        filtered = filtered.filter(u =>
            u.title.toLowerCase().includes(search) ||
            u.description.toLowerCase().includes(search) ||
            u.exam.toLowerCase().includes(search)
        );
    }
    
    // Quick filters
    if (state.currentFilters.quick) {
        const now = Date.now();
        switch (state.currentFilters.quick) {
            case 'today':
                filtered = filtered.filter(u => {
                    const hoursDiff = (now - u.timestamp.getTime()) / (1000 * 60 * 60);
                    return hoursDiff < 24;
                });
                break;
            case 'week':
                filtered = filtered.filter(u => {
                    const daysDiff = (now - u.timestamp.getTime()) / (1000 * 60 * 60 * 24);
                    return daysDiff < 7;
                });
                break;
            case 'new':
                filtered = filtered.filter(u => u.isNew);
                break;
            case 'saved':
                filtered = filtered.filter(u => state.savedUpdates.has(u.id));
                break;
        }
    }
    
    // Sort
    switch (state.currentFilters.sort) {
        case 'newest':
            filtered.sort((a, b) => b.timestamp - a.timestamp);
            break;
        case 'oldest':
            filtered.sort((a, b) => a.timestamp - b.timestamp);
            break;
        case 'deadline':
            filtered.sort((a, b) => {
                if (!a.deadline) return 1;
                if (!b.deadline) return -1;
                return a.deadline - b.deadline;
            });
            break;
        case 'priority':
            const priorityOrder = { urgent: 0, important: 1, normal: 2 };
            filtered.sort((a, b) => priorityOrder[a.urgency] - priorityOrder[b.urgency]);
            break;
    }
    
    state.filteredUpdates = filtered;
    state.currentPage = 1;
    renderAll();
}

// Render Functions
function renderAll() {
    updateStats();
    updateCategoryCounts();
    renderTimeline();
    renderDeadlineTimers();
    renderTrending();
    renderPinned();
}

function updateStats() {
    const now = Date.now();
    const today = state.allUpdates.filter(u => {
        const hoursDiff = (now - u.timestamp.getTime()) / (1000 * 60 * 60);
        return hoursDiff < 24;
    });
    
    const deadlines = state.allUpdates.filter(u => u.deadline && u.deadline > now);
    const newCutoffs = state.allUpdates.filter(u => u.category === 'cutoff' && u.isNew);
    const urgent = state.allUpdates.filter(u => u.urgency === 'urgent');
    
    animateValue('totalUpdates', today.length);
    animateValue('activeDeadlines', deadlines.length);
    animateValue('newCutoffs', newCutoffs.length);
    animateValue('urgentAlerts', urgent.length);
}

function updateCategoryCounts() {
    const counts = {
        all: state.allUpdates.length,
        admission: 0,
        cutoff: 0,
        deadline: 0,
        result: 0,
        exam: 0
    };
    
    state.allUpdates.forEach(u => {
        if (counts[u.category] !== undefined) {
            counts[u.category]++;
        }
    });
    
    Object.keys(counts).forEach(category => {
        const element = document.getElementById(`count${category.charAt(0).toUpperCase() + category.slice(1)}`);
        if (element) {
            element.textContent = counts[category];
        }
    });
}

function renderTimeline(append = false) {
    const container = document.getElementById('timelineContainer');
    const loadingState = document.getElementById('loadingState');
    const noResults = document.getElementById('noResults');
    const loadMoreSection = document.getElementById('loadMoreSection');
    
    if (!container) return;
    
    // Show loading briefly
    if (!append) {
        loadingState.style.display = 'block';
        noResults.style.display = 'none';
        container.innerHTML = '';
    }
    
    setTimeout(() => {
        loadingState.style.display = 'none';
        
        if (state.filteredUpdates.length === 0) {
            noResults.style.display = 'block';
            loadMoreSection.style.display = 'none';
            return;
        }
        
        noResults.style.display = 'none';
        
        const startIndex = append ? (state.currentPage - 1) * CONFIG.UPDATES_PER_PAGE : 0;
        const endIndex = state.currentPage * CONFIG.UPDATES_PER_PAGE;
        const updates = state.filteredUpdates.slice(startIndex, endIndex);
        
        // Apply view mode
        if (state.currentView === 'cards') {
            container.classList.add('cards-view');
        } else {
            container.classList.remove('cards-view');
        }
        
        updates.forEach((update, index) => {
            const updateElement = createUpdateElement(update);
            container.appendChild(updateElement);
            
            // Stagger animations
            setTimeout(() => {
                updateElement.style.opacity = '1';
            }, index * 50);
        });
        
        // Show/hide load more button
        if (endIndex < state.filteredUpdates.length) {
            loadMoreSection.style.display = 'block';
        } else {
            loadMoreSection.style.display = 'none';
        }
    }, append ? 0 : 500);
}

function createUpdateElement(update) {
    const item = document.createElement('div');
    item.className = `timeline-item ${update.urgency}`;
    item.style.opacity = '0';
    item.style.transition = 'opacity 0.3s ease';
    
    if (update.isNew) {
        item.classList.add('new-update');
    }
    
    const timeAgo = getTimeAgo(update.timestamp);
    
    item.innerHTML = `
        ${state.currentView === 'timeline' ? `
            <div class="timeline-dot"></div>
            <div class="timeline-time">${timeAgo}</div>
        ` : ''}
        <div class="update-card ${update.urgency}">
            <div class="update-header">
                <div class="update-badges">
                    <span class="update-badge badge-category">${getCategoryIcon(update.category)} ${update.category}</span>
                    ${update.isNew ? '<span class="update-badge badge-new">NEW</span>' : ''}
                    <span class="update-badge badge-exam">${update.exam}</span>
                </div>
                <div class="update-actions">
                    <button class="action-btn ${state.savedUpdates.has(update.id) ? 'saved' : ''}" 
                            onclick="toggleSave('${update.id}')" title="Save">
                        ${state.savedUpdates.has(update.id) ? '⭐' : '☆'}
                    </button>
                    <button class="action-btn" onclick="shareUpdate('${update.id}')" title="Share">🔗</button>
                </div>
            </div>
            <h3 class="update-title">${update.title}</h3>
            <p class="update-description">${update.description}</p>
            <div class="update-details">
                ${Object.entries(update.details).map(([key, value]) => `
                    <div class="detail-item">
                        <span class="detail-label">${key}</span>
                        <span class="detail-value">${value}</span>
                    </div>
                `).join('')}
            </div>
            ${update.deadline ? `
                <div class="update-details">
                    <div class="detail-item">
                        <span class="detail-label">⏰ Deadline</span>
                        <span class="detail-value">${formatDate(update.deadline)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Time Left</span>
                        <span class="detail-value" id="countdown-${update.id}">Calculating...</span>
                    </div>
                </div>
            ` : ''}
            <div class="update-footer">
                <span class="update-timestamp">📅 ${formatDateTime(update.timestamp)} • 👁️ ${update.views.toLocaleString()} views</span>
                <a href="${update.link}" class="update-link">View Details →</a>
            </div>
        </div>
    `;
    
    return item;
}

function renderDeadlineTimers() {
    const container = document.getElementById('deadlineTimers');
    if (!container) return;
    
    const now = Date.now();
    const deadlineUpdates = state.allUpdates
        .filter(u => u.deadline && u.deadline > now)
        .sort((a, b) => a.deadline - b.deadline)
        .slice(0, 5);
    
    if (deadlineUpdates.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--live-text-secondary);">No upcoming deadlines</p>';
        return;
    }
    
    container.innerHTML = deadlineUpdates.map(update => {
        const timeLeft = update.deadline - now;
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const urgencyClass = days < 3 ? 'urgent' : days < 7 ? 'important' : 'normal';
        const progress = Math.max(0, 100 - (days / 30 * 100));
        
        return `
            <div class="deadline-timer ${urgencyClass}" data-deadline="${update.deadline.getTime()}" data-id="${update.id}">
                <div class="timer-exam">${update.exam}</div>
                <div class="timer-title">${update.title.substring(0, 50)}...</div>
                <div class="timer-countdown" id="timer-${update.id}">
                    <div class="timer-unit">
                        <span class="timer-value">--</span>
                        <span class="timer-label">Days</span>
                    </div>
                    <div class="timer-unit">
                        <span class="timer-value">--</span>
                        <span class="timer-label">Hrs</span>
                    </div>
                    <div class="timer-unit">
                        <span class="timer-value">--</span>
                        <span class="timer-label">Min</span>
                    </div>
                    <div class="timer-unit">
                        <span class="timer-value">--</span>
                        <span class="timer-label">Sec</span>
                    </div>
                </div>
                <div class="timer-progress">
                    <div class="timer-progress-bar" style="width: ${progress}%"></div>
                </div>
            </div>
        `;
    }).join('');
    
    // Start countdown timers
    updateCountdowns();
    setInterval(updateCountdowns, 1000);
}

function updateCountdowns() {
    const now = Date.now();
    
    // Update deadline timers
    document.querySelectorAll('.deadline-timer').forEach(timer => {
        const deadline = parseInt(timer.dataset.deadline);
        const id = timer.dataset.id;
        const countdown = document.getElementById(`timer-${id}`);
        
        if (!countdown) return;
        
        const timeLeft = deadline - now;
        
        if (timeLeft <= 0) {
            timer.remove();
            return;
        }
        
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        
        const values = countdown.querySelectorAll('.timer-value');
        values[0].textContent = days.toString().padStart(2, '0');
        values[1].textContent = hours.toString().padStart(2, '0');
        values[2].textContent = minutes.toString().padStart(2, '0');
        values[3].textContent = seconds.toString().padStart(2, '0');
    });
    
    // Update inline countdowns in updates
    state.filteredUpdates.forEach(update => {
        if (!update.deadline) return;
        
        const element = document.getElementById(`countdown-${update.id}`);
        if (!element) return;
        
        const timeLeft = update.deadline - now;
        if (timeLeft <= 0) {
            element.textContent = 'Expired';
            element.style.color = 'var(--live-urgent)';
            return;
        }
        
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        if (days > 0) {
            element.textContent = `${days} day${days > 1 ? 's' : ''} ${hours} hr${hours > 1 ? 's' : ''}`;
        } else {
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            element.textContent = `${hours} hr${hours > 1 ? 's' : ''} ${minutes} min`;
        }
        
        if (days < 2) {
            element.style.color = 'var(--live-urgent)';
            element.style.fontWeight = '800';
        }
    });
}

function renderTrending() {
    const container = document.getElementById('trendingUpdates');
    if (!container) return;
    
    const trending = [...state.allUpdates]
        .sort((a, b) => b.views - a.views)
        .slice(0, 5);
    
    container.innerHTML = trending.map((update, index) => `
        <div class="trending-item" onclick="scrollToUpdate('${update.id}')">
            <span class="trending-rank">${index + 1}</span>
            <div>
                <div class="trending-title">${update.title.substring(0, 60)}...</div>
                <div class="trending-meta">${update.exam} • ${update.views.toLocaleString()} views</div>
            </div>
        </div>
    `).join('');
}

function renderPinned() {
    const container = document.getElementById('pinnedUpdates');
    if (!container) return;
    
    const pinned = state.allUpdates.filter(u => u.urgency === 'urgent').slice(0, 3);
    
    if (pinned.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--live-text-secondary); font-size: 0.85rem;">No pinned updates</p>';
        return;
    }
    
    container.innerHTML = pinned.map(update => `
        <div class="pinned-item" onclick="scrollToUpdate('${update.id}')">
            <div class="pinned-title">🔴 ${update.title.substring(0, 50)}...</div>
            <div class="pinned-meta">${update.exam} • ${getTimeAgo(update.timestamp)}</div>
        </div>
    `).join('');
}

// Auto Refresh
function startAutoRefresh() {
    if (state.autoRefreshTimer) {
        clearInterval(state.autoRefreshTimer);
    }
    
    state.autoRefreshTimer = setInterval(() => {
        if (state.autoRefreshEnabled) {
            refreshUpdates();
        }
    }, CONFIG.AUTO_REFRESH_INTERVAL);
}

async function refreshUpdates() {
    const btn = document.getElementById('manualRefresh');
    if (btn) {
        btn.classList.add('refreshing');
    }
    
    try {
        if (CONFIG.USE_REAL_API && typeof LiveUpdatesAPI !== 'undefined') {
            await refreshFromAPI();
        } else {
            await refreshFromMock();
        }
    } catch (error) {
        console.error('Refresh failed:', error);
        showToast('Refresh Failed', 'Could not fetch new updates', 'error');
    } finally {
        if (btn) {
            btn.classList.remove('refreshing');
        }
    }
}

// Refresh from real API
async function refreshFromAPI() {
    try {
        // Get updates since last refresh
        const response = await LiveUpdatesAPI.getLatestUpdates(state.lastUpdateTime.toISOString());
        const newUpdates = response.data || [];
        
        if (newUpdates.length > 0) {
            // Add new updates to the beginning
            state.allUpdates.unshift(...newUpdates);
            applyFilters();
            updateLastUpdateTime();
            showToast('Updates Refreshed', `${newUpdates.length} new update${newUpdates.length > 1 ? 's' : ''} added`, 'success');
        } else {
            showToast('No New Updates', 'All updates are current', 'info');
        }
    } catch (error) {
        console.error('API refresh failed:', error);
        throw error;
    }
}

// Refresh from mock data
async function refreshFromMock() {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Add 1-3 new updates randomly
            const newCount = Math.floor(Math.random() * 3) + 1;
            for (let i = 0; i < newCount; i++) {
                const randomUpdate = state.allUpdates[Math.floor(Math.random() * state.allUpdates.length)];
                const newUpdate = {
                    ...randomUpdate,
                    id: `update-new-${Date.now()}-${i}`,
                    timestamp: new Date(),
                    isNew: true
                };
                state.allUpdates.unshift(newUpdate);
            }
            
            applyFilters();
            updateLastUpdateTime();
            showToast('Updates Refreshed', `${newCount} new update${newCount > 1 ? 's' : ''} added`, 'success');
            resolve();
        }, 1000);
    });
}

function updateLastUpdateTime() {
    state.lastUpdateTime = new Date();
    const element = document.getElementById('lastUpdateTime');
    if (element) {
        element.textContent = 'Just now';
    }
    
    // Update time display every minute
    setInterval(() => {
        if (element) {
            element.textContent = getTimeAgo(state.lastUpdateTime);
        }
    }, 60000);
}

// Interaction Handlers
function toggleSave(updateId) {
    if (state.savedUpdates.has(updateId)) {
        state.savedUpdates.delete(updateId);
        showToast('Removed from Saved', 'Update removed from your saved items', 'info');
    } else {
        state.savedUpdates.add(updateId);
        showToast('Saved Successfully', 'Update added to your saved items', 'success');
    }
    
    saveSavedUpdates();
    renderTimeline();
}

function shareUpdate(updateId) {
    const update = state.allUpdates.find(u => u.id === updateId);
    if (!update) return;
    
    const text = `${update.title}\n\nCheck out this update on CollegeFinder Live Updates Portal`;
    
    if (navigator.share) {
        navigator.share({
            title: update.title,
            text: text,
            url: window.location.href
        }).then(() => {
            showToast('Shared Successfully', 'Update shared via your device', 'success');
        }).catch(() => {
            copyToClipboard(text);
        });
    } else {
        copyToClipboard(text);
    }
}

function scrollToUpdate(updateId) {
    // Implement smooth scroll to update
    showToast('Feature Coming Soon', 'Quick navigation will be available soon', 'info');
}

function handleFabAction(action) {
    switch (action) {
        case 'subscribe':
            showToast('Subscribe to Alerts', 'Email notification feature coming soon', 'info');
            break;
        case 'export':
            exportUpdates();
            break;
        case 'settings':
            showToast('Settings', 'Notification preferences coming soon', 'info');
            break;
    }
}

function exportUpdates() {
    const data = state.filteredUpdates.map(u => ({
        Title: u.title,
        Category: u.category,
        Exam: u.exam,
        Urgency: u.urgency,
        Date: formatDateTime(u.timestamp),
        Deadline: u.deadline ? formatDate(u.deadline) : 'N/A'
    }));
    
    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `live-updates-${formatDate(new Date())}.csv`;
    a.click();
    
    showToast('Export Successful', 'Updates exported to CSV file', 'success');
}

// Utility Functions
function animateValue(elementId, target) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const duration = 1500;
    const start = 0;
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const current = Math.floor(start + (target - start) * easeOutCubic(progress));
        
        element.textContent = current;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

function getTimeAgo(date) {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    
    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60
    };
    
    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit);
        if (interval >= 1) {
            return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
        }
    }
    
    return 'Just now';
}

function formatDate(date) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
}

function formatDateTime(date) {
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(date).toLocaleDateString('en-US', options);
}

function getCategoryIcon(category) {
    const icons = {
        admission: '🎓',
        cutoff: '📊',
        deadline: '⏰',
        result: '🏆',
        exam: '📝'
    };
    return icons[category] || '📌';
}

function showToast(title, message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <div class="toast-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</div>
            <div class="toast-message">
                <div class="toast-title">${title}</div>
                <div class="toast-text">${message}</div>
            </div>
        </div>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slide-out-right 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, CONFIG.TOAST_DURATION);
}

function showLoading(show) {
    const timeline = document.getElementById('updatesTimeline');
    if (!timeline) return;
    
    if (show) {
        timeline.innerHTML = `
            <div class="loading-state">
                <div class="spinner"></div>
                <p>Loading updates...</p>
            </div>
        `;
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('Copied!', 'Link copied to clipboard', 'success');
    }).catch(() => {
        showToast('Copy Failed', 'Please copy manually', 'error');
    });
}

function convertToCSV(data) {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const rows = data.map(row => 
        headers.map(header => {
            const value = row[header];
            return `"${value}"`;
        }).join(',')
    );
    
    return [headers.join(','), ...rows].join('\n');
}

function saveSavedUpdates() {
    localStorage.setItem('savedUpdates', JSON.stringify([...state.savedUpdates]));
}

function loadSavedUpdates() {
    const saved = localStorage.getItem('savedUpdates');
    if (saved) {
        state.savedUpdates = new Set(JSON.parse(saved));
    }
}

// Make functions globally accessible
window.toggleSave = toggleSave;
window.shareUpdate = shareUpdate;
window.scrollToUpdate = scrollToUpdate;
