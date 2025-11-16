// Main page script - handles search and filtering
let currentFilters = {
    search: '',
    fees: 'all',
    state: 'all',
    course: 'all',
    rank: 'all'
};

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    displayColleges(colleges);
});

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
        noResults.style.display = 'block';
        return;
    }

    grid.style.display = 'grid';
    noResults.style.display = 'none';

    grid.innerHTML = collegesArray.map(college => createCollegeCard(college)).join('');
}

// Create college card HTML
function createCollegeCard(college) {
    const displayCourses = college.courses.slice(0, 3);
    const moreCourses = college.courses.length - 3;

    return `
        <div class="college-card">
            <div class="college-image">
                <img src="${college.image}" alt="${college.name}">
                <div class="rank-badge">Rank #${college.ranking}</div>
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
