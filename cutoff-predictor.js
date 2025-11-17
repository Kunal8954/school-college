// ===========================
// Configuration & State
// ===========================
const CONFIG = {
    USE_MOCK_DATA: true, // Set to false when real API is available
    ANIMATION_DELAY: 100,
    RESULTS_PER_PAGE: 12,
    API_ENDPOINT: '/api/cutoff-predictor'
};

const state = {
    formData: {},
    predictions: [],
    displayedResults: 0,
    filters: {
        branches: ['cse', 'ece', 'mechanical', 'civil', 'it'],
        collegeTypes: ['government', 'private', 'deemed']
    }
};

// ===========================
// Profile Manager
// ===========================
class ProfileManager {
    constructor() {
        this.profileContainer = document.getElementById('profileContainer');
        this.navAuth = document.getElementById('navAuth');
        this.profileTrigger = document.getElementById('profileTrigger');
        this.profileDropdown = document.getElementById('profileDropdown');
        this.logoutBtn = document.getElementById('logoutBtn');
        
        this.init();
        this.checkLoginStatus();
    }
    
    init() {
        // Profile dropdown toggle
        this.profileTrigger?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDropdown();
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.profileContainer?.contains(e.target)) {
                this.closeDropdown();
            }
        });
        
        // Logout handler
        this.logoutBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
        });
        
        // Add click ripple to dropdown items
        document.querySelectorAll('.dropdown-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!item.classList.contains('logout-btn')) {
                    this.createItemRipple(e, item);
                }
            });
        });
    }
    
    checkLoginStatus() {
        // Check if user is logged in (from localStorage or session)
        const user = this.getUserData();
        
        if (user) {
            this.showProfile(user);
        } else {
            this.showAuthButtons();
        }
    }
    
    getUserData() {
        // Check localStorage for logged-in user
        const userData = localStorage.getItem('userData');
        if (userData) {
            try {
                return JSON.parse(userData);
            } catch (e) {
                console.error('Error parsing user data:', e);
                return null;
            }
        }
        return null;
    }
    
    showProfile(user) {
        // Hide auth buttons
        if (this.navAuth) this.navAuth.style.display = 'none';
        
        // Show profile container
        if (this.profileContainer) {
            this.profileContainer.style.display = 'block';
            
            // Set user data
            const name = user.name || user.username || 'User';
            const email = user.email || 'user@example.com';
            const initials = this.getInitials(name);
            
            // Update profile trigger
            document.getElementById('profileName').textContent = name.split(' ')[0];
            document.getElementById('avatarInitials').textContent = initials;
            document.getElementById('avatarInitialsLarge').textContent = initials;
            
            // Update dropdown header
            document.getElementById('dropdownName').textContent = name;
            document.getElementById('dropdownEmail').textContent = email;
            
            // If user has avatar image
            if (user.avatar) {
                document.getElementById('profileAvatar').src = user.avatar;
                document.getElementById('profileAvatar').style.display = 'block';
                document.getElementById('avatarPlaceholder').style.display = 'none';
                
                document.getElementById('dropdownAvatar').src = user.avatar;
                document.getElementById('dropdownAvatar').style.display = 'block';
                document.getElementById('avatarPlaceholderLarge').style.display = 'none';
            }
            
            // Trigger entrance animation
            setTimeout(() => {
                this.profileContainer.classList.add('profile-enter');
            }, 100);
        }
    }
    
    showAuthButtons() {
        // Show auth buttons
        if (this.navAuth) this.navAuth.style.display = 'flex';
        
        // Hide profile container
        if (this.profileContainer) this.profileContainer.style.display = 'none';
    }
    
    getInitials(name) {
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }
    
    toggleDropdown() {
        const isOpen = this.profileDropdown.classList.contains('show');
        
        if (isOpen) {
            this.closeDropdown();
        } else {
            this.openDropdown();
        }
    }
    
    openDropdown() {
        this.profileDropdown.classList.add('show');
        this.profileTrigger.classList.add('active');
    }
    
    closeDropdown() {
        this.profileDropdown.classList.remove('show');
        this.profileTrigger.classList.remove('active');
    }
    
    createItemRipple(e, item) {
        const ripple = document.createElement('span');
        const rect = item.getBoundingClientRect();
        
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        item.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    }
    
    logout() {
        // Create logout animation
        this.profileContainer.classList.add('profile-exit');
        
        setTimeout(() => {
            // Clear user data
            localStorage.removeItem('userData');
            
            // Show auth buttons
            this.showAuthButtons();
            
            // Optional: Redirect to home or show notification
            console.log('👋 Logged out successfully');
            
            // Show a subtle notification
            this.showLogoutNotification();
        }, 300);
    }
    
    showLogoutNotification() {
        const notification = document.createElement('div');
        notification.className = 'logout-notification';
        notification.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#10b981" stroke-width="2"/>
            </svg>
            <span>Logged out successfully</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// ===========================
// Particle System
// ===========================
class ParticleCanvas {
    constructor(selector) {
        this.container = document.querySelector(selector);
        if (!this.container) return;
        
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.container.appendChild(this.canvas);
        
        this.particles = [];
        this.mouse = { x: 0, y: 0 };
        
        this.resize();
        this.init();
        this.animate();
        
        window.addEventListener('resize', () => this.resize());
        this.container.addEventListener('mousemove', (e) => {
            const rect = this.container.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });
    }
    
    resize() {
        this.canvas.width = this.container.offsetWidth;
        this.canvas.height = this.container.offsetHeight;
    }
    
    init() {
        const particleCount = Math.floor((this.canvas.width * this.canvas.height) / 15000);
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: Math.random() * 2 + 1
            });
        }
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach((particle, i) => {
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Mouse interaction
            const dx = this.mouse.x - particle.x;
            const dy = this.mouse.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 100) {
                const force = (100 - distance) / 100;
                particle.vx -= (dx / distance) * force * 0.2;
                particle.vy -= (dy / distance) * force * 0.2;
            }
            
            // Boundary check
            if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;
            
            // Velocity damping
            particle.vx *= 0.99;
            particle.vy *= 0.99;
            
            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(59, 130, 246, 0.6)';
            this.ctx.fill();
            
            // Draw connections
            for (let j = i + 1; j < this.particles.length; j++) {
                const other = this.particles[j];
                const dx2 = particle.x - other.x;
                const dy2 = particle.y - other.y;
                const dist = Math.sqrt(dx2 * dx2 + dy2 * dy2);
                
                if (dist < 120) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(particle.x, particle.y);
                    this.ctx.lineTo(other.x, other.y);
                    this.ctx.strokeStyle = `rgba(59, 130, 246, ${0.2 * (1 - dist / 120)})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.stroke();
                }
            }
        });
        
        requestAnimationFrame(() => this.animate());
    }
}

// ===========================
// Scroll Animations
// ===========================
class ScrollAnimations {
    constructor() {
        this.observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };
        
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    this.observer.unobserve(entry.target);
                }
            });
        }, this.observerOptions);
        
        this.observe();
    }
    
    observe() {
        const elements = document.querySelectorAll('.form-group, .info-card, .college-card');
        elements.forEach(el => this.observer.observe(el));
    }
}

// ===========================
// Tooltip System
// ===========================
class TooltipManager {
    constructor() {
        this.tooltip = document.getElementById('tooltip');
        this.init();
    }
    
    init() {
        document.querySelectorAll('[data-tooltip]').forEach(trigger => {
            trigger.addEventListener('mouseenter', (e) => this.show(e));
            trigger.addEventListener('mouseleave', () => this.hide());
            trigger.addEventListener('mousemove', (e) => this.position(e));
        });
    }
    
    show(e) {
        const text = e.currentTarget.getAttribute('data-tooltip');
        this.tooltip.textContent = text;
        this.tooltip.classList.add('show');
        this.position(e);
    }
    
    hide() {
        this.tooltip.classList.remove('show');
    }
    
    position(e) {
        const offset = 10;
        this.tooltip.style.left = e.clientX + offset + 'px';
        this.tooltip.style.top = e.clientY + offset + 'px';
    }
}

// ===========================
// Ripple Effect
// ===========================
function createRipple(e) {
    const button = e.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.classList.add('ripple');
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    
    button.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
}

// ===========================
// Form Handling
// ===========================
class PredictionForm {
    constructor() {
        this.form = document.getElementById('predictionForm');
        this.examCards = document.querySelectorAll('.exam-card');
        this.examTypeInput = document.getElementById('examType');
        this.predictBtn = document.getElementById('predictBtn');
        
        this.init();
    }
    
    init() {
        // Exam card selection
        this.examCards.forEach(card => {
            card.addEventListener('click', () => this.selectExam(card));
        });
        
        // Form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Reset button
        document.querySelector('.btn-reset').addEventListener('click', () => this.resetForm());
        
        // Input validation
        this.addInputValidation();
    }
    
    selectExam(card) {
        this.examCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        this.examTypeInput.value = card.getAttribute('data-exam');
        
        // Update score max based on exam
        const scoreInput = document.getElementById('score');
        const examType = card.getAttribute('data-exam');
        const maxScores = {
            'jee-main': 300,
            'jee-advanced': 360,
            'neet': 720,
            'cuet': 1000,
            'cat': 300,
            'gate': 100
        };
        scoreInput.setAttribute('max', maxScores[examType] || 720);
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        if (!this.validateForm()) {
            this.form.classList.add('shake');
            setTimeout(() => this.form.classList.remove('shake'), 500);
            return;
        }
        
        this.collectFormData();
        await this.predict();
    }
    
    validateForm() {
        const examType = this.examTypeInput.value;
        const score = document.getElementById('score').value;
        const category = document.getElementById('category').value;
        const state = document.getElementById('state').value;
        
        if (!examType) {
            alert('Please select an exam type');
            return false;
        }
        
        if (!score || !category || !state) {
            alert('Please fill all required fields');
            return false;
        }
        
        return true;
    }
    
    collectFormData() {
        const formData = new FormData(this.form);
        state.formData = {
            examType: formData.get('examType'),
            score: parseInt(formData.get('score')),
            rank: formData.get('rank') ? parseInt(formData.get('rank')) : null,
            category: formData.get('category'),
            state: formData.get('state'),
            gender: formData.get('gender') || null
        };
    }
    
    async predict() {
        // Show loading state
        this.predictBtn.classList.add('loading');
        this.predictBtn.disabled = true;
        
        try {
            // Simulate API call or use real API
            const predictions = CONFIG.USE_MOCK_DATA 
                ? await this.getMockPredictions()
                : await this.getAPIPredictions();
            
            state.predictions = predictions;
            state.displayedResults = 0;
            
            // Show results
            setTimeout(() => {
                this.showResults();
                this.scrollToResults();
            }, 1500);
            
        } catch (error) {
            console.error('Prediction error:', error);
            alert('Failed to get predictions. Please try again.');
        } finally {
            this.predictBtn.classList.remove('loading');
            this.predictBtn.disabled = false;
        }
    }
    
    async getMockPredictions() {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const { examType, score, rank, category } = state.formData;
        
        // Generate mock data based on exam type
        const colleges = this.generateMockColleges(examType);
        
        // Calculate probability for each college
        return colleges.map(college => {
            const probability = this.calculateProbability(
                score, 
                college.cutoff, 
                category,
                rank,
                college.rankRange
            );
            
            return {
                ...college,
                probability,
                probabilityLevel: probability >= 70 ? 'high' : probability >= 45 ? 'moderate' : 'low'
            };
        })
        .filter(college => {
            // Filter colleges based on rank if provided
            if (rank && college.rankRange) {
                // Show colleges where user rank is within 2x of max rank range
                return rank <= college.rankRange.max * 2;
            }
            // Show colleges where probability is at least 5%
            return college.probability >= 5;
        })
        .sort((a, b) => {
            // Sort by probability first, then by tier
            if (b.probability !== a.probability) {
                return b.probability - a.probability;
            }
            return a.tier - b.tier;
        })
        .slice(0, 60); // Limit to top 60 results
    }
    
    generateMockColleges(examType) {
        // Get exam-specific college database
        const collegeDatabase = this.getCollegesByExam(examType);
        
        const colleges = [];
        collegeDatabase.forEach(college => {
            const branches = college.branches || this.getBranchesByExam(examType);
            
            branches.forEach(branch => {
                colleges.push({
                    name: college.name,
                    location: college.location,
                    branch: branch,
                    type: college.type,
                    tier: college.tier,
                    rankRange: college.rankRange,
                    cutoff: this.generateCutoff(examType, college.tier, branch, college.rankRange),
                    lastYearCutoff: this.generateLastYearCutoff(examType, college.tier, branch, college.rankRange),
                    seats: college.seats || Math.floor(Math.random() * 50) + 30,
                    fees: this.generateFees(college.type, college.tier),
                    examType: examType
                });
            });
        });
        
        return colleges;
    }
    
    getCollegesByExam(examType) {
        const databases = {
            'jee-main': [
                // IITs (JEE Advanced qualified students)
                { name: 'IIT Bombay', location: 'Mumbai', type: 'government', tier: 1, rankRange: { min: 1, max: 500 }, seats: 120 },
                { name: 'IIT Delhi', location: 'New Delhi', type: 'government', tier: 1, rankRange: { min: 1, max: 600 }, seats: 120 },
                { name: 'IIT Madras', location: 'Chennai', type: 'government', tier: 1, rankRange: { min: 1, max: 700 }, seats: 115 },
                { name: 'IIT Kanpur', location: 'Kanpur', type: 'government', tier: 1, rankRange: { min: 500, max: 1200 }, seats: 110 },
                { name: 'IIT Kharagpur', location: 'Kharagpur', type: 'government', tier: 1, rankRange: { min: 600, max: 1500 }, seats: 130 },
                { name: 'IIT Roorkee', location: 'Roorkee', type: 'government', tier: 1, rankRange: { min: 700, max: 1800 }, seats: 115 },
                { name: 'IIT Guwahati', location: 'Guwahati', type: 'government', tier: 1, rankRange: { min: 1000, max: 2500 }, seats: 105 },
                { name: 'IIT Hyderabad', location: 'Hyderabad', type: 'government', tier: 1, rankRange: { min: 1500, max: 3000 }, seats: 95 },
                
                // NITs (Top Tier)
                { name: 'NIT Trichy', location: 'Tiruchirappalli', type: 'government', tier: 2, rankRange: { min: 3000, max: 12000 }, seats: 100 },
                { name: 'NIT Warangal', location: 'Warangal', type: 'government', tier: 2, rankRange: { min: 3500, max: 13000 }, seats: 95 },
                { name: 'NIT Surathkal', location: 'Mangalore', type: 'government', tier: 2, rankRange: { min: 4000, max: 14000 }, seats: 90 },
                { name: 'NIT Rourkela', location: 'Rourkela', type: 'government', tier: 2, rankRange: { min: 5000, max: 18000 }, seats: 90 },
                { name: 'NIT Karnataka', location: 'Surathkal', type: 'government', tier: 2, rankRange: { min: 5500, max: 19000 }, seats: 85 },
                { name: 'MNNIT Allahabad', location: 'Allahabad', type: 'government', tier: 2, rankRange: { min: 6000, max: 20000 }, seats: 85 },
                { name: 'NIT Calicut', location: 'Calicut', type: 'government', tier: 2, rankRange: { min: 6500, max: 22000 }, seats: 80 },
                { name: 'NIT Delhi', location: 'New Delhi', type: 'government', tier: 2, rankRange: { min: 7000, max: 25000 }, seats: 75 },
                { name: 'NIT Jaipur', location: 'Jaipur', type: 'government', tier: 2, rankRange: { min: 10000, max: 35000 }, seats: 80 },
                { name: 'NIT Bhopal', location: 'Bhopal', type: 'government', tier: 2, rankRange: { min: 12000, max: 40000 }, seats: 75 },
                
                // IIITs
                { name: 'IIIT Hyderabad', location: 'Hyderabad', type: 'government', tier: 2, rankRange: { min: 2500, max: 10000 }, seats: 70 },
                { name: 'IIIT Bangalore', location: 'Bangalore', type: 'government', tier: 2, rankRange: { min: 3000, max: 12000 }, seats: 65 },
                { name: 'IIIT Delhi', location: 'New Delhi', type: 'government', tier: 2, rankRange: { min: 4000, max: 15000 }, seats: 60 },
                { name: 'IIIT Allahabad', location: 'Allahabad', type: 'government', tier: 2, rankRange: { min: 8000, max: 25000 }, seats: 55 },
                
                // State Government Colleges
                { name: 'DTU (Delhi Technological University)', location: 'New Delhi', type: 'government', tier: 2, rankRange: { min: 5000, max: 20000 }, seats: 90 },
                { name: 'NSUT (Netaji Subhas University)', location: 'New Delhi', type: 'government', tier: 2, rankRange: { min: 6000, max: 22000 }, seats: 85 },
                { name: 'BITS Pilani', location: 'Pilani', type: 'deemed', tier: 2, rankRange: { min: 8000, max: 30000 }, seats: 100 },
                { name: 'BITS Goa', location: 'Goa', type: 'deemed', tier: 2, rankRange: { min: 10000, max: 35000 }, seats: 80 },
                { name: 'Jadavpur University', location: 'Kolkata', type: 'government', tier: 2, rankRange: { min: 10000, max: 35000 }, seats: 75 },
                { name: 'Anna University', location: 'Chennai', type: 'government', tier: 2, rankRange: { min: 12000, max: 40000 }, seats: 100 },
                { name: 'COEP Pune', location: 'Pune', type: 'government', tier: 2, rankRange: { min: 15000, max: 45000 }, seats: 70 },
                
                // Private Universities
                { name: 'VIT Vellore', location: 'Vellore', type: 'private', tier: 3, rankRange: { min: 20000, max: 80000 }, seats: 150 },
                { name: 'VIT Chennai', location: 'Chennai', type: 'private', tier: 3, rankRange: { min: 25000, max: 90000 }, seats: 130 },
                { name: 'Manipal Institute of Technology', location: 'Manipal', type: 'private', tier: 3, rankRange: { min: 25000, max: 85000 }, seats: 140 },
                { name: 'SRM University', location: 'Chennai', type: 'private', tier: 3, rankRange: { min: 30000, max: 100000 }, seats: 180 },
                { name: 'Thapar University', location: 'Patiala', type: 'deemed', tier: 3, rankRange: { min: 28000, max: 90000 }, seats: 120 },
                { name: 'Amity University', location: 'Noida', type: 'private', tier: 3, rankRange: { min: 40000, max: 120000 }, seats: 200 },
                { name: 'LPU (Lovely Professional University)', location: 'Jalandhar', type: 'private', tier: 3, rankRange: { min: 50000, max: 150000 }, seats: 250 },
                { name: 'PES University', location: 'Bangalore', type: 'private', tier: 3, rankRange: { min: 35000, max: 100000 }, seats: 130 },
                { name: 'BMS College of Engineering', location: 'Bangalore', type: 'private', tier: 3, rankRange: { min: 30000, max: 95000 }, seats: 110 }
            ],
            
            'jee-advanced': [
                { name: 'IIT Bombay', location: 'Mumbai', type: 'government', tier: 1, rankRange: { min: 1, max: 200 }, seats: 120 },
                { name: 'IIT Delhi', location: 'New Delhi', type: 'government', tier: 1, rankRange: { min: 1, max: 300 }, seats: 120 },
                { name: 'IIT Madras', location: 'Chennai', type: 'government', tier: 1, rankRange: { min: 1, max: 400 }, seats: 115 },
                { name: 'IIT Kanpur', location: 'Kanpur', type: 'government', tier: 1, rankRange: { min: 200, max: 800 }, seats: 110 },
                { name: 'IIT Kharagpur', location: 'Kharagpur', type: 'government', tier: 1, rankRange: { min: 300, max: 1000 }, seats: 130 },
                { name: 'IIT Roorkee', location: 'Roorkee', type: 'government', tier: 1, rankRange: { min: 400, max: 1200 }, seats: 115 },
                { name: 'IIT Guwahati', location: 'Guwahati', type: 'government', tier: 1, rankRange: { min: 600, max: 1500 }, seats: 105 },
                { name: 'IIT Hyderabad', location: 'Hyderabad', type: 'government', tier: 1, rankRange: { min: 800, max: 2000 }, seats: 95 },
                { name: 'IIT Indore', location: 'Indore', type: 'government', tier: 1, rankRange: { min: 1000, max: 2500 }, seats: 90 },
                { name: 'IIT BHU', location: 'Varanasi', type: 'government', tier: 1, rankRange: { min: 1200, max: 3000 }, seats: 110 },
                { name: 'IIT Ropar', location: 'Rupnagar', type: 'government', tier: 1, rankRange: { min: 2000, max: 4500 }, seats: 80 },
                { name: 'IIT Bhubaneswar', location: 'Bhubaneswar', type: 'government', tier: 1, rankRange: { min: 2500, max: 5000 }, seats: 75 },
                { name: 'IIT Gandhinagar', location: 'Gandhinagar', type: 'government', tier: 1, rankRange: { min: 2500, max: 5500 }, seats: 80 },
                { name: 'IIT Patna', location: 'Patna', type: 'government', tier: 1, rankRange: { min: 3000, max: 6000 }, seats: 75 },
                { name: 'IIT Jodhpur', location: 'Jodhpur', type: 'government', tier: 1, rankRange: { min: 3500, max: 6500 }, seats: 70 },
                { name: 'IIT Mandi', location: 'Mandi', type: 'government', tier: 1, rankRange: { min: 4000, max: 7000 }, seats: 65 },
                { name: 'IIT (ISM) Dhanbad', location: 'Dhanbad', type: 'government', tier: 1, rankRange: { min: 4500, max: 8000 }, seats: 100 },
                { name: 'IIT Bhilai', location: 'Bhilai', type: 'government', tier: 1, rankRange: { min: 5000, max: 9000 }, seats: 60 },
                { name: 'IIT Tirupati', location: 'Tirupati', type: 'government', tier: 1, rankRange: { min: 5500, max: 10000 }, seats: 55 }
            ],
            
            'neet': [
                // AIIMS
                { name: 'AIIMS Delhi', location: 'New Delhi', type: 'government', tier: 1, rankRange: { min: 1, max: 50 }, seats: 100, branches: ['MBBS'] },
                { name: 'AIIMS Jodhpur', location: 'Jodhpur', type: 'government', tier: 1, rankRange: { min: 50, max: 200 }, seats: 80, branches: ['MBBS'] },
                { name: 'AIIMS Bhopal', location: 'Bhopal', type: 'government', tier: 1, rankRange: { min: 100, max: 300 }, seats: 75, branches: ['MBBS'] },
                { name: 'AIIMS Patna', location: 'Patna', type: 'government', tier: 1, rankRange: { min: 150, max: 400 }, seats: 70, branches: ['MBBS'] },
                { name: 'AIIMS Rishikesh', location: 'Rishikesh', type: 'government', tier: 1, rankRange: { min: 200, max: 500 }, seats: 70, branches: ['MBBS'] },
                
                // Top Medical Colleges
                { name: 'Maulana Azad Medical College', location: 'New Delhi', type: 'government', tier: 1, rankRange: { min: 100, max: 800 }, seats: 250, branches: ['MBBS'] },
                { name: 'Armed Forces Medical College', location: 'Pune', type: 'government', tier: 1, rankRange: { min: 150, max: 1000 }, seats: 130, branches: ['MBBS'] },
                { name: 'King George Medical University', location: 'Lucknow', type: 'government', tier: 2, rankRange: { min: 500, max: 2000 }, seats: 200, branches: ['MBBS'] },
                { name: 'Grant Medical College', location: 'Mumbai', type: 'government', tier: 2, rankRange: { min: 600, max: 2500 }, seats: 180, branches: ['MBBS'] },
                { name: 'Madras Medical College', location: 'Chennai', type: 'government', tier: 2, rankRange: { min: 700, max: 3000 }, seats: 250, branches: ['MBBS'] },
                { name: 'BJ Medical College', location: 'Pune', type: 'government', tier: 2, rankRange: { min: 800, max: 3500 }, seats: 160, branches: ['MBBS'] },
                { name: 'Seth GS Medical College', location: 'Mumbai', type: 'government', tier: 2, rankRange: { min: 1000, max: 4000 }, seats: 180, branches: ['MBBS'] },
                { name: 'Lady Hardinge Medical College', location: 'New Delhi', type: 'government', tier: 2, rankRange: { min: 1200, max: 4500 }, seats: 140, branches: ['MBBS'] },
                { name: 'JIPMER Puducherry', location: 'Puducherry', type: 'government', tier: 2, rankRange: { min: 500, max: 2000 }, seats: 200, branches: ['MBBS'] },
                { name: 'CMC Vellore', location: 'Vellore', type: 'deemed', tier: 2, rankRange: { min: 1000, max: 5000 }, seats: 100, branches: ['MBBS'] },
                { name: 'St. Johns Medical College', location: 'Bangalore', type: 'private', tier: 2, rankRange: { min: 2000, max: 8000 }, seats: 150, branches: ['MBBS'] },
                
                // State Government Medical Colleges
                { name: 'GMCH Chandigarh', location: 'Chandigarh', type: 'government', tier: 2, rankRange: { min: 2000, max: 10000 }, seats: 150, branches: ['MBBS'] },
                { name: 'SMS Medical College', location: 'Jaipur', type: 'government', tier: 2, rankRange: { min: 3000, max: 12000 }, seats: 250, branches: ['MBBS'] },
                { name: 'KGMU', location: 'Lucknow', type: 'government', tier: 2, rankRange: { min: 3500, max: 15000 }, seats: 200, branches: ['MBBS'] },
                
                // Private Medical Colleges
                { name: 'Kasturba Medical College', location: 'Manipal', type: 'private', tier: 3, rankRange: { min: 10000, max: 50000 }, seats: 250, branches: ['MBBS'] },
                { name: 'JSS Medical College', location: 'Mysore', type: 'private', tier: 3, rankRange: { min: 15000, max: 60000 }, seats: 200, branches: ['MBBS'] },
                { name: 'Amrita Institute of Medical Sciences', location: 'Kochi', type: 'private', tier: 3, rankRange: { min: 20000, max: 80000 }, seats: 150, branches: ['MBBS'] },
                { name: 'SRM Medical College', location: 'Chennai', type: 'private', tier: 3, rankRange: { min: 25000, max: 100000 }, seats: 200, branches: ['MBBS'] }
            ],
            
            'cuet': [
                { name: 'Delhi University - St. Stephens', location: 'New Delhi', type: 'government', tier: 1, rankRange: { min: 1, max: 100 }, seats: 400, branches: ['B.A. Economics', 'B.Sc. Physics', 'B.Com'] },
                { name: 'Delhi University - Hindu College', location: 'New Delhi', type: 'government', tier: 1, rankRange: { min: 50, max: 300 }, seats: 500, branches: ['B.A. English', 'B.Sc. Chemistry', 'B.Com Hons'] },
                { name: 'Delhi University - Miranda House', location: 'New Delhi', type: 'government', tier: 1, rankRange: { min: 50, max: 250 }, seats: 450, branches: ['B.A. Political Science', 'B.Sc. Mathematics'] },
                { name: 'JNU (Jawaharlal Nehru University)', location: 'New Delhi', type: 'government', tier: 1, rankRange: { min: 100, max: 500 }, seats: 600, branches: ['B.A. History', 'B.Sc. Life Sciences'] },
                { name: 'Jamia Millia Islamia', location: 'New Delhi', type: 'government', tier: 2, rankRange: { min: 500, max: 2000 }, seats: 800, branches: ['B.A. Mass Communication', 'B.Tech'] },
                { name: 'Aligarh Muslim University', location: 'Aligarh', type: 'government', tier: 2, rankRange: { min: 1000, max: 3000 }, seats: 1000, branches: ['B.A. Law', 'B.Sc.'] },
                { name: 'BHU (Banaras Hindu University)', location: 'Varanasi', type: 'government', tier: 2, rankRange: { min: 1000, max: 3500 }, seats: 1200, branches: ['B.A. Arts', 'B.Sc. Science'] },
                { name: 'Allahabad University', location: 'Allahabad', type: 'government', tier: 2, rankRange: { min: 2000, max: 5000 }, seats: 900, branches: ['B.A.', 'B.Sc.', 'B.Com'] }
            ],
            
            'cat': [
                { name: 'IIM Ahmedabad', location: 'Ahmedabad', type: 'government', tier: 1, rankRange: { min: 1, max: 100 }, seats: 395, branches: ['MBA', 'PGPX'] },
                { name: 'IIM Bangalore', location: 'Bangalore', type: 'government', tier: 1, rankRange: { min: 1, max: 150 }, seats: 480, branches: ['MBA', 'EPGP'] },
                { name: 'IIM Calcutta', location: 'Kolkata', type: 'government', tier: 1, rankRange: { min: 1, max: 200 }, seats: 460, branches: ['MBA'] },
                { name: 'IIM Lucknow', location: 'Lucknow', type: 'government', tier: 1, rankRange: { min: 150, max: 500 }, seats: 436, branches: ['MBA'] },
                { name: 'IIM Kozhikode', location: 'Kozhikode', type: 'government', tier: 1, rankRange: { min: 200, max: 600 }, seats: 390, branches: ['MBA'] },
                { name: 'IIM Indore', location: 'Indore', type: 'government', tier: 1, rankRange: { min: 250, max: 700 }, seats: 520, branches: ['MBA', 'IPM'] },
                { name: 'FMS Delhi', location: 'New Delhi', type: 'government', tier: 1, rankRange: { min: 100, max: 400 }, seats: 230, branches: ['MBA'] },
                { name: 'XLRI Jamshedpur', location: 'Jamshedpur', type: 'private', tier: 1, rankRange: { min: 200, max: 800 }, seats: 360, branches: ['MBA-BM', 'MBA-HRM'] },
                { name: 'SP Jain Mumbai', location: 'Mumbai', type: 'private', tier: 2, rankRange: { min: 500, max: 1500 }, seats: 300, branches: ['MBA'] },
                { name: 'MDI Gurgaon', location: 'Gurgaon', type: 'government', tier: 2, rankRange: { min: 800, max: 2000 }, seats: 360, branches: ['MBA'] },
                { name: 'IIM Shillong', location: 'Shillong', type: 'government', tier: 2, rankRange: { min: 1000, max: 2500 }, seats: 180, branches: ['MBA'] },
                { name: 'NMIMS Mumbai', location: 'Mumbai', type: 'private', tier: 2, rankRange: { min: 1500, max: 4000 }, seats: 540, branches: ['MBA'] },
                { name: 'SIBM Pune', location: 'Pune', type: 'private', tier: 2, rankRange: { min: 2000, max: 5000 }, seats: 280, branches: ['MBA'] }
            ],
            
            'gate': [
                { name: 'IIT Bombay - M.Tech CSE', location: 'Mumbai', type: 'government', tier: 1, rankRange: { min: 1, max: 200 }, seats: 50, branches: ['M.Tech Computer Science'] },
                { name: 'IIT Delhi - M.Tech', location: 'New Delhi', type: 'government', tier: 1, rankRange: { min: 1, max: 300 }, seats: 60, branches: ['M.Tech CSE', 'M.Tech ECE'] },
                { name: 'IIT Madras - M.Tech', location: 'Chennai', type: 'government', tier: 1, rankRange: { min: 1, max: 400 }, seats: 55, branches: ['M.Tech'] },
                { name: 'IIT Kanpur - M.Tech', location: 'Kanpur', type: 'government', tier: 1, rankRange: { min: 200, max: 800 }, seats: 50, branches: ['M.Tech'] },
                { name: 'IISc Bangalore', location: 'Bangalore', type: 'government', tier: 1, rankRange: { min: 1, max: 150 }, seats: 40, branches: ['M.Tech', 'M.E.'] },
                { name: 'NIT Trichy - M.Tech', location: 'Tiruchirappalli', type: 'government', tier: 2, rankRange: { min: 500, max: 2000 }, seats: 45, branches: ['M.Tech'] },
                { name: 'NIT Warangal - M.Tech', location: 'Warangal', type: 'government', tier: 2, rankRange: { min: 600, max: 2500 }, seats: 40, branches: ['M.Tech'] },
                { name: 'IIIT Hyderabad - M.Tech', location: 'Hyderabad', type: 'government', tier: 2, rankRange: { min: 300, max: 1500 }, seats: 35, branches: ['M.Tech CSE'] },
                { name: 'DTU - M.Tech', location: 'New Delhi', type: 'government', tier: 2, rankRange: { min: 1000, max: 4000 }, seats: 50, branches: ['M.Tech'] }
            ]
        };
        
        return databases[examType] || databases['jee-main'];
    }
    
    getBranchesByExam(examType) {
        const branches = {
            'jee-main': ['Computer Science', 'Electronics & Communication', 'Mechanical', 'Civil', 'Information Technology', 'Electrical'],
            'jee-advanced': ['Computer Science', 'Electronics & Communication', 'Mechanical', 'Civil', 'Chemical', 'Aerospace'],
            'neet': ['MBBS', 'BDS', 'BAMS', 'BHMS'],
            'cuet': ['B.A. Economics', 'B.Sc. Physics', 'B.Com', 'B.A. English', 'B.Sc. Mathematics'],
            'cat': ['MBA', 'PGDM', 'Executive MBA'],
            'gate': ['M.Tech Computer Science', 'M.Tech Electronics', 'M.Tech Mechanical', 'M.E.']
        };
        
        return branches[examType] || branches['jee-main'];
    }
    
    generateCutoff(examType, tier, branch, rankRange) {
        // Base cutoff varies by exam type
        const examScores = {
            'jee-main': { max: 300, multiplier: 1 },
            'jee-advanced': { max: 360, multiplier: 1.2 },
            'neet': { max: 720, multiplier: 2.4 },
            'cuet': { max: 1000, multiplier: 3.3 },
            'cat': { max: 100, multiplier: 0.33 },
            'gate': { max: 100, multiplier: 0.33 }
        };
        
        const config = examScores[examType] || examScores['jee-main'];
        
        // Calculate base cutoff from rank range
        let baseCutoff;
        if (rankRange.max <= 500) {
            baseCutoff = config.max * 0.95; // Top 500 need 95%+
        } else if (rankRange.max <= 2000) {
            baseCutoff = config.max * 0.85; // Top 2000 need 85%+
        } else if (rankRange.max <= 5000) {
            baseCutoff = config.max * 0.75; // Top 5000 need 75%+
        } else if (rankRange.max <= 10000) {
            baseCutoff = config.max * 0.65; // Top 10k need 65%+
        } else if (rankRange.max <= 25000) {
            baseCutoff = config.max * 0.55; // Top 25k need 55%+
        } else if (rankRange.max <= 50000) {
            baseCutoff = config.max * 0.45; // Top 50k need 45%+
        } else {
            baseCutoff = config.max * 0.35; // Others need 35%+
        }
        
        // Adjust for tier
        const tierAdjustment = {
            1: 1.0,    // Top tier - no reduction
            2: 0.92,   // Mid tier - 8% reduction
            3: 0.80    // Lower tier - 20% reduction
        };
        
        baseCutoff *= tierAdjustment[tier] || 1;
        
        // Adjust for branch popularity (only for engineering)
        if (['jee-main', 'jee-advanced', 'gate'].includes(examType)) {
            const branchMultiplier = {
                'Computer Science': 1.0,
                'M.Tech Computer Science': 1.0,
                'M.Tech CSE': 1.0,
                'Information Technology': 0.98,
                'Electronics & Communication': 0.95,
                'M.Tech Electronics': 0.95,
                'M.Tech ECE': 0.95,
                'Electrical': 0.92,
                'Chemical': 0.90,
                'Mechanical': 0.88,
                'M.Tech Mechanical': 0.88,
                'Civil': 0.83,
                'Aerospace': 0.94,
                'M.Tech': 0.93,
                'M.E.': 0.93
            };
            
            baseCutoff *= branchMultiplier[branch] || 0.90;
        }
        
        // Add small random variation
        const variation = (Math.random() - 0.5) * 10;
        
        return Math.round(baseCutoff + variation);
    }
    
    generateLastYearCutoff(examType, tier, branch, rankRange) {
        const currentCutoff = this.generateCutoff(examType, tier, branch, rankRange);
        
        // Last year cutoff typically 2-5% lower (competition increased)
        const decrease = Math.floor(Math.random() * 3) + 2; // 2-4%
        const lastYearCutoff = currentCutoff - Math.floor(currentCutoff * (decrease / 100));
        
        return Math.max(lastYearCutoff, 0);
    }
    
    generateFees(type, tier) {
        const feeStructures = {
            'government': {
                1: '₹2-2.5 Lakhs/year',
                2: '₹1.5-2 Lakhs/year',
                3: '₹1-1.5 Lakhs/year'
            },
            'deemed': {
                1: '₹10-15 Lakhs/year',
                2: '₹8-12 Lakhs/year',
                3: '₹6-10 Lakhs/year'
            },
            'private': {
                1: '₹12-18 Lakhs/year',
                2: '₹10-15 Lakhs/year',
                3: '₹8-12 Lakhs/year'
            }
        };
        
        return feeStructures[type]?.[tier] || '₹5-8 Lakhs/year';
    }
    
    calculateProbability(userScore, cutoff, category, userRank = null, collegeRankRange = null) {
        // Category-based bonus points
        const categoryBonus = {
            'general': 0,
            'ews': 5,
            'obc': 10,
            'sc': 15,
            'st': 20,
            'pwd': 15
        };
        
        const adjustedScore = userScore + (categoryBonus[category] || 0);
        
        // If rank is provided, use rank-based probability
        if (userRank && collegeRankRange) {
            if (userRank <= collegeRankRange.min) {
                return 98; // Almost certain
            } else if (userRank <= collegeRankRange.max * 0.7) {
                return 85; // High chance
            } else if (userRank <= collegeRankRange.max) {
                return 65; // Moderate chance
            } else if (userRank <= collegeRankRange.max * 1.3) {
                return 40; // Low-moderate chance
            } else if (userRank <= collegeRankRange.max * 1.5) {
                return 20; // Low chance
            } else {
                return 8; // Very low chance
            }
        }
        
        // Score-based probability (when rank not available)
        const difference = adjustedScore - cutoff;
        
        if (difference >= 50) return 95;
        if (difference >= 30) return 88;
        if (difference >= 20) return 78;
        if (difference >= 10) return 68;
        if (difference >= 0) return 55;
        if (difference >= -10) return 40;
        if (difference >= -20) return 25;
        if (difference >= -30) return 15;
        return 8;
    }
    
    async getAPIPredictions() {
        const response = await fetch(CONFIG.API_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(state.formData)
        });
        
        if (!response.ok) throw new Error('API request failed');
        return await response.json();
    }
    
    showResults() {
        const resultsSection = document.getElementById('results-section');
        const analyticsSection = document.getElementById('analytics-section');
        
        resultsSection.style.display = 'block';
        analyticsSection.style.display = 'block';
        
        this.updateSummary();
        this.displayUserStats();
        this.renderResults(CONFIG.RESULTS_PER_PAGE);
        this.renderCharts();
    }
    
    displayUserStats() {
        const { examType, score, rank, category } = state.formData;
        
        // Create a user stats banner if it doesn't exist
        let statsBanner = document.querySelector('.user-stats-banner');
        if (!statsBanner) {
            statsBanner = document.createElement('div');
            statsBanner.className = 'user-stats-banner';
            
            const resultsHeader = document.querySelector('.results-header');
            resultsHeader.insertAdjacentElement('afterend', statsBanner);
        }
        
        const examNames = {
            'jee-main': 'JEE Main',
            'jee-advanced': 'JEE Advanced',
            'neet': 'NEET',
            'cuet': 'CUET',
            'cat': 'CAT',
            'gate': 'GATE'
        };
        
        const categoryNames = {
            'general': 'General',
            'ews': 'EWS',
            'obc': 'OBC-NCL',
            'sc': 'SC',
            'st': 'ST',
            'pwd': 'PwD'
        };
        
        let rankInfo = rank ? `<div class="stat-pill">🏅 Rank: <strong>${rank.toLocaleString()}</strong></div>` : '';
        
        statsBanner.innerHTML = `
            <div class="stats-content">
                <div class="stat-pill">📝 ${examNames[examType] || examType}</div>
                <div class="stat-pill">📊 Score: <strong>${score}</strong></div>
                ${rankInfo}
                <div class="stat-pill">👤 ${categoryNames[category] || category}</div>
                <div class="stat-pill success">✅ ${state.predictions.length} Colleges Found</div>
            </div>
        `;
    }
    
    updateSummary() {
        const high = state.predictions.filter(p => p.probabilityLevel === 'high').length;
        const moderate = state.predictions.filter(p => p.probabilityLevel === 'moderate').length;
        const low = state.predictions.filter(p => p.probabilityLevel === 'low').length;
        
        document.getElementById('highChanceCount').textContent = high;
        document.getElementById('moderateChanceCount').textContent = moderate;
        document.getElementById('lowChanceCount').textContent = low;
    }
    
    renderResults(count) {
        const grid = document.getElementById('resultsGrid');
        const start = state.displayedResults;
        const end = Math.min(start + count, state.predictions.length);
        
        if (start === 0) grid.innerHTML = '';
        
        for (let i = start; i < end; i++) {
            const college = state.predictions[i];
            const card = this.createCollegeCard(college, i);
            grid.appendChild(card);
        }
        
        state.displayedResults = end;
        
        // Hide load more if all results shown
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (end >= state.predictions.length) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'inline-flex';
        }
    }
    
    createCollegeCard(college, index) {
        const card = document.createElement('div');
        card.className = `college-card ${college.probabilityLevel}-chance`;
        card.style.animationDelay = `${(index % CONFIG.RESULTS_PER_PAGE) * 50}ms`;
        
        // Determine rank display
        let rankDisplay = '';
        if (college.rankRange) {
            if (college.rankRange.min === college.rankRange.max) {
                rankDisplay = `<div class="cutoff-item">
                    <span class="cutoff-label">Required Rank</span>
                    <span class="cutoff-value">${college.rankRange.max}</span>
                </div>`;
            } else {
                rankDisplay = `<div class="cutoff-item">
                    <span class="cutoff-label">Rank Range</span>
                    <span class="cutoff-value">${college.rankRange.min}-${college.rankRange.max}</span>
                </div>`;
            }
        }
        
        // College type badge
        const typeBadge = college.type === 'government' ? '🏛️ Govt' : college.type === 'deemed' ? '🎓 Deemed' : '🏢 Private';
        
        card.innerHTML = `
            <div class="college-header">
                <div>
                    <div class="college-name">${college.name}</div>
                    <div class="college-location">📍 ${college.location} • ${typeBadge}</div>
                </div>
                <div class="probability-badge ${college.probabilityLevel}">
                    ${college.probability}%
                </div>
            </div>
            <div class="college-branch">${college.branch}</div>
            <div class="cutoff-info">
                <div class="cutoff-item">
                    <span class="cutoff-label">Expected Cutoff</span>
                    <span class="cutoff-value">${college.cutoff}</span>
                </div>
                <div class="cutoff-item">
                    <span class="cutoff-label">Last Year</span>
                    <span class="cutoff-value">${college.lastYearCutoff}</span>
                </div>
                ${rankDisplay}
                <div class="cutoff-item">
                    <span class="cutoff-label">Available Seats</span>
                    <span class="cutoff-value">${college.seats}</span>
                </div>
                <div class="cutoff-item">
                    <span class="cutoff-label">Annual Fees</span>
                    <span class="cutoff-value">${college.fees}</span>
                </div>
            </div>
            <div class="college-actions">
                <button class="btn-details" onclick="viewDetails('${college.name.replace(/'/g, "\\'")}')">View Details</button>
                <button class="btn-compare" onclick="addToCompare('${college.name.replace(/'/g, "\\'")}')">Compare</button>
            </div>
        `;
        
        return card;
    }
    
    renderCharts() {
        this.renderTrendChart();
        this.renderCategoryChart();
        this.updateInsights();
    }
    
    updateInsights() {
        const insightsList = document.getElementById('insightsList');
        if (!insightsList) return;
        
        const { examType, score, rank, category } = state.formData;
        const high = state.predictions.filter(p => p.probabilityLevel === 'high').length;
        const moderate = state.predictions.filter(p => p.probabilityLevel === 'moderate').length;
        
        const insights = this.generateExamSpecificInsights(examType, score, rank, category, high, moderate);
        
        insightsList.innerHTML = insights.map(insight => `<li>${insight}</li>`).join('');
    }
    
    generateExamSpecificInsights(examType, score, rank, category, highCount, moderateCount) {
        const insights = [];
        
        // Exam-specific insights
        switch(examType) {
            case 'jee-main':
                if (rank && rank <= 10000) {
                    insights.push(`🎉 Excellent rank! You have <strong>strong chances</strong> for top NITs and IIITs.`);
                } else if (rank && rank <= 50000) {
                    insights.push(`👍 Good rank! Consider <strong>mid-tier NITs and state government colleges</strong>.`);
                }
                insights.push(`📊 JEE Main cut-offs have <strong>increased by 2-3%</strong> compared to last year due to higher competition.`);
                if (category !== 'general') {
                    insights.push(`✅ Your category reservation gives you <strong>additional opportunities</strong> in reserved seats.`);
                }
                break;
                
            case 'jee-advanced':
                if (rank && rank <= 1000) {
                    insights.push(`🏆 Outstanding rank! <strong>Top IITs</strong> including IIT Bombay, Delhi, Madras are highly probable.`);
                } else if (rank && rank <= 5000) {
                    insights.push(`🎯 Strong rank! You can target <strong>all IITs</strong> with preferred branch choices.`);
                }
                insights.push(`💡 Consider branch preference carefully - newer IITs offer excellent opportunities with lower cutoffs.`);
                break;
                
            case 'neet':
                if (rank && rank <= 1000) {
                    insights.push(`🏥 Exceptional rank! <strong>AIIMS and top government medical colleges</strong> are within reach.`);
                } else if (rank && rank <= 10000) {
                    insights.push(`⚕️ Great rank! Focus on <strong>state government medical colleges</strong> for best value.`);
                }
                insights.push(`📈 Medical college cut-offs are highly competitive. Consider <strong>state quota</strong> for better chances.`);
                if (category !== 'general') {
                    insights.push(`🎓 Reserved category seats provide <strong>significant advantages</strong> in government colleges.`);
                }
                break;
                
            case 'cuet':
                insights.push(`📚 Delhi University colleges have <strong>diverse cut-off ranges</strong> based on course popularity.`);
                insights.push(`💡 Consider applying to <strong>multiple colleges and courses</strong> to maximize admission chances.`);
                if (score >= 650) {
                    insights.push(`🌟 Your score qualifies you for <strong>top DU colleges</strong> like St. Stephen's, Hindu, Miranda House.`);
                }
                break;
                
            case 'cat':
                if (rank && rank <= 500) {
                    insights.push(`💼 Elite rank! <strong>IIM ABC (Ahmedabad, Bangalore, Calcutta)</strong> are highly probable.`);
                } else if (rank && rank <= 2000) {
                    insights.push(`📊 Strong rank! Target <strong>top IIMs and FMS Delhi</strong> for best ROI.`);
                }
                insights.push(`💰 Consider <strong>fee structure and placement records</strong> when choosing between IIMs and private B-schools.`);
                break;
                
            case 'gate':
                if (rank && rank <= 500) {
                    insights.push(`🔬 Excellent rank! <strong>IITs and IISc</strong> for M.Tech are highly achievable.`);
                }
                insights.push(`🎯 M.Tech admissions also consider <strong>interview performance</strong> in final selection.`);
                insights.push(`💡 Research the <strong>specialization and faculty</strong> at each institute before applying.`);
                break;
        }
        
        // General insights based on results
        if (highCount >= 10) {
            insights.push(`🎊 You have <strong>${highCount} high-probability colleges</strong>! Excellent options available.`);
        } else if (highCount >= 5) {
            insights.push(`✨ You have <strong>${highCount} colleges</strong> with high admission chances.`);
        }
        
        if (moderateCount >= 15) {
            insights.push(`📌 Consider <strong>moderate-chance colleges</strong> as safe backup options.`);
        }
        
        // Add general advice
        insights.push(`🔔 <strong>Subscribe to live updates</strong> to track changing cut-offs and admission deadlines.`);
        
        return insights.slice(0, 5); // Limit to 5 insights
    }
    
    renderTrendChart() {
        const canvas = document.getElementById('trendChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['2020', '2021', '2022', '2023', '2024'],
                datasets: [{
                    label: 'Average Cut-Off',
                    data: [180, 185, 190, 195, 200],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: true }
                },
                scales: {
                    y: { beginAtZero: false }
                }
            }
        });
    }
    
    renderCategoryChart() {
        const canvas = document.getElementById('categoryChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        const high = state.predictions.filter(p => p.probabilityLevel === 'high').length;
        const moderate = state.predictions.filter(p => p.probabilityLevel === 'moderate').length;
        const low = state.predictions.filter(p => p.probabilityLevel === 'low').length;
        
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['High Chance', 'Moderate Chance', 'Low Chance'],
                datasets: [{
                    data: [high, moderate, low],
                    backgroundColor: ['#10b981', '#fbbf24', '#f59e0b'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    }
    
    scrollToResults() {
        const resultsSection = document.getElementById('results-section');
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    resetForm() {
        this.form.reset();
        this.examCards.forEach(card => card.classList.remove('selected'));
        this.examTypeInput.value = '';
    }
    
    addInputValidation() {
        const inputs = this.form.querySelectorAll('input[required], select[required]');
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                if (input.value) {
                    input.style.borderColor = '#10b981';
                } else {
                    input.style.borderColor = '';
                }
            });
        });
    }
}

// ===========================
// Filter System
// ===========================
class FilterManager {
    constructor() {
        this.filterBtn = document.getElementById('filterBtn');
        this.filterPanel = document.getElementById('filterPanel');
        this.filterClose = document.getElementById('filterClose');
        this.applyBtn = document.getElementById('applyFilterBtn');
        
        this.init();
    }
    
    init() {
        this.filterBtn?.addEventListener('click', () => this.togglePanel());
        this.filterClose?.addEventListener('click', () => this.togglePanel());
        this.applyBtn?.addEventListener('click', () => this.applyFilters());
    }
    
    togglePanel() {
        const isVisible = this.filterPanel.style.display === 'block';
        this.filterPanel.style.display = isVisible ? 'none' : 'block';
    }
    
    applyFilters() {
        // Collect filter values
        const branchCheckboxes = document.querySelectorAll('.filter-group input[value^="cse"], input[value^="ece"]');
        const typeCheckboxes = document.querySelectorAll('.filter-group input[value="government"], input[value="private"]');
        
        state.filters.branches = Array.from(branchCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value);
        
        state.filters.collegeTypes = Array.from(typeCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value);
        
        // Re-render results
        this.filterResults();
        this.togglePanel();
    }
    
    filterResults() {
        const filtered = state.predictions.filter(college => {
            const branchMatch = state.filters.branches.length === 0 || 
                state.filters.branches.some(b => college.branch.toLowerCase().includes(b));
            const typeMatch = state.filters.collegeTypes.length === 0 || 
                state.filters.collegeTypes.includes(college.type);
            return branchMatch && typeMatch;
        });
        
        // Update display
        const grid = document.getElementById('resultsGrid');
        grid.innerHTML = '';
        state.displayedResults = 0;
        
        const tempPredictions = state.predictions;
        state.predictions = filtered;
        
        const form = new PredictionForm();
        form.renderResults(CONFIG.RESULTS_PER_PAGE);
        form.updateSummary();
        
        state.predictions = tempPredictions;
    }
}

// ===========================
// Modal Manager
// ===========================
class ModalManager {
    constructor() {
        this.modal = document.getElementById('infoModal');
        this.closeBtn = document.getElementById('modalClose');
        this.gotItBtn = document.getElementById('modalGotIt');
        
        this.init();
    }
    
    init() {
        this.closeBtn?.addEventListener('click', () => this.close());
        this.gotItBtn?.addEventListener('click', () => this.close());
        
        this.modal?.addEventListener('click', (e) => {
            if (e.target === this.modal) this.close();
        });
        
        // Auto-show on first visit
        if (!localStorage.getItem('cutoff-predictor-info-seen')) {
            setTimeout(() => this.show(), 2000);
            localStorage.setItem('cutoff-predictor-info-seen', 'true');
        }
    }
    
    show() {
        this.modal?.classList.add('show');
    }
    
    close() {
        this.modal?.classList.remove('show');
    }
}

// ===========================
// Export & Utility Functions
// ===========================
// ===========================
// Utility Functions
// ===========================

// Simulate login (for testing) - Call this from console: simulateLogin()
window.simulateLogin = function(name = 'Kunal Kumar', email = 'kunal@example.com') {
    const userData = {
        name: name,
        email: email,
        username: name.toLowerCase().replace(/\s+/g, ''),
        avatar: null, // Set to image URL if available
        loginTime: new Date().toISOString()
    };
    
    localStorage.setItem('userData', JSON.stringify(userData));
    window.location.reload();
};

// Simulate logout
window.simulateLogout = function() {
    localStorage.removeItem('userData');
    window.location.reload();
};

function exportResults() {
    const data = state.predictions.map(p => ({
        College: p.name,
        Branch: p.branch,
        Location: p.location,
        'Admission Probability': p.probability + '%',
        'Expected Cutoff': p.cutoff,
        'Last Year Cutoff': p.lastYearCutoff
    }));
    
    const csv = [
        Object.keys(data[0]).join(','),
        ...data.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cutoff-predictions.csv';
    a.click();
    URL.revokeObjectURL(url);
}

function viewDetails(collegeName) {
    alert(`Viewing details for ${collegeName}\n\nThis will redirect to the college details page.`);
    // window.location.href = `details.html?college=${encodeURIComponent(collegeName)}`;
}

function addToCompare(collegeName) {
    alert(`Added ${collegeName} to comparison list!\n\nYou can compare up to 3 colleges.`);
    // Implementation for comparison feature
}

function newPrediction() {
    const formSection = document.getElementById('predictor-form');
    formSection.scrollIntoView({ behavior: 'smooth' });
    
    const resultsSection = document.getElementById('results-section');
    const analyticsSection = document.getElementById('analytics-section');
    
    setTimeout(() => {
        resultsSection.style.display = 'none';
        analyticsSection.style.display = 'none';
    }, 500);
}

// ===========================
// Smooth Scroll
// ===========================
class SmoothScroll {
    constructor() {
        this.init();
    }
    
    init() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                if (href === '#') return;
                
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
        
        // Scroll indicator
        const scrollIndicator = document.querySelector('.scroll-indicator');
        scrollIndicator?.addEventListener('click', () => {
            const formSection = document.getElementById('predictor-form');
            formSection?.scrollIntoView({ behavior: 'smooth' });
        });
    }
}

// ===========================
// Load More Handler
// ===========================
function loadMoreResults() {
    const form = new PredictionForm();
    form.renderResults(CONFIG.RESULTS_PER_PAGE);
}

// ===========================
// Initialization
// ===========================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎓 Cut-Off Predictor Initialized');
    console.log('📊 AI-powered predictions ready');
    
    // Initialize components
    new ProfileManager(); // Initialize profile first
    new ParticleCanvas('.animated-particles');
    new ScrollAnimations();
    new TooltipManager();
    new PredictionForm();
    new FilterManager();
    new ModalManager();
    new SmoothScroll();
    
    // Event listeners
    const predictBtn = document.getElementById('predictBtn');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const exportBtn = document.getElementById('exportBtn');
    const newPredictionBtn = document.getElementById('newPredictionBtn');
    
    predictBtn?.addEventListener('click', (e) => createRipple(e));
    loadMoreBtn?.addEventListener('click', () => loadMoreResults());
    exportBtn?.addEventListener('click', () => exportResults());
    newPredictionBtn?.addEventListener('click', () => newPrediction());
    
    // Add ripple to all buttons
    document.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', (e) => createRipple(e));
    });
});

// ===========================
// Performance Monitoring
// ===========================
if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
            if (entry.duration > 50) {
                console.warn(`Slow operation detected: ${entry.name} took ${entry.duration}ms`);
            }
        }
    });
    
    observer.observe({ entryTypes: ['measure'] });
}
