// Main page script - handles search and filtering
let currentFilters = {
    search: '',
    fees: 'all',
    state: 'all',
    course: 'all',
    rank: 'all'
};

let currentView = 'grid';

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    initializeAnimations();
    initializeSlider();
    displayColleges(colleges);
    setupScrollEffects();
});

// Initialize background slider
function initializeSlider() {
    const slides = document.querySelectorAll('.slide');
    let currentSlide = 0;

    function nextSlide() {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }

    // Change slide every 5 seconds
    setInterval(nextSlide, 5000);
}

// Initialize animations
function initializeAnimations() {
    // Animate elements on load
    const animateElements = document.querySelectorAll('.animate-on-load');
    animateElements.forEach((el, index) => {
        setTimeout(() => {
            el.classList.add('active');
        }, index * 100);
    });

    // Animate counters
    const counters = document.querySelectorAll('.stat-number');
    counters.forEach(counter => {
        animateCounter(counter);
    });
}

// Animate counter numbers
function animateCounter(counter) {
    const target = parseInt(counter.getAttribute('data-target'));
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;

    const updateCounter = () => {
        current += increment;
        if (current < target) {
            counter.textContent = Math.floor(current).toLocaleString();
            requestAnimationFrame(updateCounter);
        } else {
            counter.textContent = target.toLocaleString();
        }
    };

    // Start animation after a delay
    setTimeout(() => {
        updateCounter();
    }, 500);
}

// Setup scroll effects
function setupScrollEffects() {
    // Scroll reveal animation
    const revealElements = document.querySelectorAll('.scroll-reveal');
    
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    });

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    // Back to top button
    const backToTop = document.getElementById('backToTop');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }

        // Parallax effect for hero
        const scrolled = window.scrollY;
        const hero = document.querySelector('.hero');
        if (hero) {
            hero.style.transform = `translateY(${scrolled * 0.3}px)`;
        }
    });

    backToTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Lazy load images
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                imageObserver.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('searchInput').addEventListener('input', (e) => {
        currentFilters.search = e.target.value;
        filterAndDisplay();
    });

    document.getElementById('feeFilter').addEventListener('change', (e) => {
        currentFilters.fees = e.target.value;
        filterAndDisplay();
    });

    document.getElementById('stateFilter').addEventListener('change', (e) => {
        currentFilters.state = e.target.value;
        filterAndDisplay();
    });

    document.getElementById('courseFilter').addEventListener('change', (e) => {
        currentFilters.course = e.target.value;
        filterAndDisplay();
    });

    document.getElementById('rankFilter').addEventListener('change', (e) => {
        currentFilters.rank = e.target.value;
        filterAndDisplay();
    });

    // View toggle buttons
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentView = this.dataset.view;
            const grid = document.getElementById('collegeGrid');
            grid.className = currentView === 'grid' ? 'college-grid' : 'college-list';
        });
    });
}

// Filter colleges based on current filters
function filterColleges(colleges) {
    return colleges.filter(college => {
        // Search filter
        const searchLower = currentFilters.search.toLowerCase();
        const matchesSearch = !currentFilters.search ||
            college.name.toLowerCase().includes(searchLower) ||
            college.location.toLowerCase().includes(searchLower) ||
            college.city.toLowerCase().includes(searchLower);

        // Fee filter
        let matchesFees = true;
        if (currentFilters.fees !== 'all') {
            const [min, max] = currentFilters.fees.split('-').map(f => parseInt(f.replace('+', '')));
            if (max) {
                matchesFees = college.fees >= min && college.fees <= max;
            } else {
                matchesFees = college.fees >= min;
            }
        }

        // State filter
        const matchesState = currentFilters.state === 'all' || college.state === currentFilters.state;

        // Course filter
        const matchesCourse = currentFilters.course === 'all' || 
            college.courses.includes(currentFilters.course);

        // Rank filter
        let matchesRank = true;
        if (currentFilters.rank !== 'all') {
            const [min, max] = currentFilters.rank.split('-').map(r => parseInt(r));
            matchesRank = college.ranking >= min && college.ranking <= max;
        }

        return matchesSearch && matchesFees && matchesState && matchesCourse && matchesRank;
    });
}

// Filter and display colleges
function filterAndDisplay() {
    const filtered = filterColleges(colleges);
    displayColleges(filtered);
}

// Display colleges in grid
function displayColleges(collegesArray) {
    const grid = document.getElementById('collegeGrid');
    const noResults = document.getElementById('noResults');
    const resultsCount = document.getElementById('resultsCount');

    // Update count
    resultsCount.textContent = `${collegesArray.length} College${collegesArray.length !== 1 ? 's' : ''} Found`;

    if (collegesArray.length === 0) {
        grid.style.display = 'none';
        noResults.style.display = 'flex';
        return;
    }

    grid.style.display = currentView === 'grid' ? 'grid' : 'block';
    grid.className = currentView === 'grid' ? 'college-grid' : 'college-list';
    noResults.style.display = 'none';

    grid.innerHTML = collegesArray.map((college, index) => createCollegeCard(college, index)).join('');
    
    // Add stagger animation to cards
    const cards = grid.querySelectorAll('.college-card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('card-visible');
        }, index * 50);
    });
}

// Create college card HTML
function createCollegeCard(college, index) {
    const displayCourses = college.courses.slice(0, 3);
    const moreCourses = college.courses.length - 3;

    return `
        <div class="college-card" style="animation-delay: ${index * 0.05}s">
            <div class="college-image">
                <img src="${college.image}" alt="${college.name}" loading="lazy">
                <div class="rank-badge">Rank #${college.ranking}</div>
                <div class="card-overlay">
                    <a href="details.html?id=${college.id}" class="quick-view-btn">Quick View →</a>
                </div>
            </div>
            <div class="college-content">
                <h3 class="college-name">${college.name}</h3>
                <div class="college-location">
                    📍 <span>${college.location}</span>
                </div>
                <div class="course-badges">
                    ${displayCourses.map(course => `<span class="course-badge">${course}</span>`).join('')}
                    ${moreCourses > 0 ? `<span class="course-badge">+${moreCourses} more</span>` : ''}
                </div>
                <div class="college-stats">
                    <div class="stat-box">
                        <div class="stat-label">Annual Fees</div>
                        <div class="stat-value">₹${(college.fees / 100000).toFixed(1)}L</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-label">Rating</div>
                        <div class="stat-value">⭐ ${college.rating}/5</div>
                    </div>
                </div>
                <div class="placement-info">
                    <div class="placement-stat">
                        <div class="stat-label">Avg. Placement</div>
                        <div class="stat-value">₹${(college.placement.average / 100000).toFixed(1)}L</div>
                    </div>
                    <div class="placement-stat">
                        <div class="stat-label">Placed</div>
                        <div class="stat-value">${college.placement.percentage}%</div>
                    </div>
                </div>
                <a href="details.html?id=${college.id}" class="view-details-btn">View Details</a>
            </div>
        </div>
    `;
}
