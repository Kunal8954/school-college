// Compare page script - Enhanced with animations
let selectedColleges = [null, null, null];

document.addEventListener('DOMContentLoaded', () => {
    // Check for preselected college from URL
    const urlParams = new URLSearchParams(window.location.search);
    const preselectedId = urlParams.get('college');
    
    populateSelects();
    
    if (preselectedId) {
        const college = colleges.find(c => c.id === preselectedId);
        if (college) {
            selectedColleges[0] = college;
            document.getElementById('college1').value = preselectedId;
            document.getElementById('remove1').style.display = 'block';
        }
    }
    
    setupEventListeners();
    updateComparison();
    initScrollAnimations();
});

// Scroll-triggered animations
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('[data-animate]').forEach(el => {
        observer.observe(el);
    });
}

function populateSelects() {
    const selects = ['college1', 'college2', 'college3'];
    selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        colleges.forEach(college => {
            const option = document.createElement('option');
            option.value = college.id;
            option.textContent = college.name;
            select.appendChild(option);
        });
    });
}

function setupEventListeners() {
    document.getElementById('college1').addEventListener('change', (e) => handleCollegeSelect(0, e.target.value));
    document.getElementById('college2').addEventListener('change', (e) => handleCollegeSelect(1, e.target.value));
    document.getElementById('college3').addEventListener('change', (e) => handleCollegeSelect(2, e.target.value));
    
    document.getElementById('remove1').addEventListener('click', () => removeCollege(0));
    document.getElementById('remove2').addEventListener('click', () => removeCollege(1));
    document.getElementById('remove3').addEventListener('click', () => removeCollege(2));
}

function handleCollegeSelect(index, collegeId) {
    const selectElement = document.getElementById(`college${index + 1}`);
    const removeBtn = document.getElementById(`remove${index + 1}`);
    
    if (!collegeId) {
        selectedColleges[index] = null;
        removeBtn.style.display = 'none';
    } else {
        const college = colleges.find(c => c.id === collegeId);
        selectedColleges[index] = college;
        removeBtn.style.display = 'block';
        
        // Add selection animation
        selectElement.style.transform = 'scale(1.05)';
        setTimeout(() => {
            selectElement.style.transform = 'scale(1)';
        }, 200);
    }
    updateComparison();
}

function removeCollege(index) {
    selectedColleges[index] = null;
    const select = document.getElementById(`college${index + 1}`);
    select.value = '';
    document.getElementById(`remove${index + 1}`).style.display = 'none';
    
    // Add removal animation
    select.style.transform = 'scale(0.95)';
    setTimeout(() => {
        select.style.transform = 'scale(1)';
    }, 200);
    
    updateComparison();
}

function updateComparison() {
    const selectedCount = selectedColleges.filter(c => c !== null).length;
    const table = document.getElementById('comparisonTable');
    const noComparison = document.getElementById('noComparison');
    
    if (selectedCount < 2) {
        table.style.display = 'none';
        noComparison.style.display = 'block';
        return;
    }
    
    // Fade out then fade in
    table.style.opacity = '0';
    table.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        table.style.display = 'block';
        noComparison.style.display = 'none';
        
        // Update headers with animation
        selectedColleges.forEach((college, index) => {
            const header = document.getElementById(`header${index + 1}`);
            if (college) {
                header.textContent = college.name;
                header.style.display = 'table-cell';
            } else {
                header.style.display = 'none';
            }
        });
        
        // Create comparison rows with enhanced data
        createComparisonRows();
        
        // Calculate winner and generate insights
        calculateWinner();
        generateAIInsights();
        generateSimilarColleges();
        
        // Fade in
        setTimeout(() => {
            table.style.opacity = '1';
            table.style.transform = 'translateY(0)';
        }, 50);
    }, 300);
}

function createComparisonRows() {
    const comparisonRows = [
        { 
            label: '🏆 Ranking', 
            getValue: (c) => `#${c.ranking}`,
            compare: true,
            lower: true
        },
        { 
            label: '📍 Location', 
            getValue: (c) => c.location,
            compare: false
        },
        { 
            label: '🏛️ Type', 
            getValue: (c) => c.type,
            compare: false
        },
        { 
            label: '📅 Established', 
            getValue: (c) => c.established,
            compare: false
        },
        { 
            label: '💰 Annual Fees', 
            getValue: (c) => `₹${(c.fees / 100000).toFixed(2)}L`,
            getNumeric: (c) => c.fees,
            compare: true,
            lower: true
        },
        { 
            label: '⭐ Rating', 
            getValue: (c) => `${c.rating}/5`,
            getNumeric: (c) => c.rating,
            compare: true
        },
        { 
            label: '📚 Courses', 
            getValue: (c) => c.courses.join(', '),
            compare: false
        },
        { 
            label: '🏢 Facilities', 
            getValue: (c) => c.facilities.join(', '),
            compare: false
        },
        { 
            label: '💼 Avg. Placement', 
            getValue: (c) => `₹${(c.placement.average / 100000).toFixed(1)}L`,
            getNumeric: (c) => c.placement.average,
            compare: true
        },
        { 
            label: '🚀 Highest Placement', 
            getValue: (c) => `₹${(c.placement.highest / 100000).toFixed(1)}L`,
            getNumeric: (c) => c.placement.highest,
            compare: true
        },
        { 
            label: '📊 Placement Rate', 
            getValue: (c) => `${c.placement.percentage}%`,
            getNumeric: (c) => c.placement.percentage,
            compare: true
        },
        { 
            label: '🏠 Hostel Available', 
            getValue: (c) => c.hostel.available ? '✅ Yes' : '❌ No',
            compare: false
        },
        { 
            label: '💵 Hostel Fees', 
            getValue: (c) => c.hostel.available ? `₹${(c.hostel.fees / 1000).toFixed(0)}K` : 'N/A',
            getNumeric: (c) => c.hostel.available ? c.hostel.fees : null,
            compare: true,
            lower: true
        },
    ];
    
    const tbody = document.getElementById('comparisonBody');
    tbody.innerHTML = '';
    
    comparisonRows.forEach((row, rowIndex) => {
        const tr = document.createElement('tr');
        tr.style.animationDelay = `${rowIndex * 0.05}s`;
        
        // Add parameter label
        const labelTd = document.createElement('td');
        labelTd.innerHTML = `<strong>${row.label}</strong>`;
        tr.appendChild(labelTd);
        
        // Find best value if comparable
        let bestIndex = -1;
        if (row.compare && row.getNumeric) {
            const validColleges = selectedColleges
                .map((c, i) => ({ college: c, index: i }))
                .filter(item => item.college !== null);
            
            if (validColleges.length > 0) {
                const values = validColleges.map(item => ({
                    index: item.index,
                    value: row.getNumeric(item.college)
                })).filter(v => v.value !== null);
                
                if (values.length > 0) {
                    if (row.lower) {
                        bestIndex = values.reduce((min, curr) => 
                            curr.value < min.value ? curr : min
                        ).index;
                    } else {
                        bestIndex = values.reduce((max, curr) => 
                            curr.value > max.value ? curr : max
                        ).index;
                    }
                }
            }
        }
        
        // Add college values
        selectedColleges.forEach((college, index) => {
            const td = document.createElement('td');
            if (college) {
                td.textContent = row.getValue(college);
                if (index === bestIndex) {
                    td.setAttribute('data-best', 'true');
                }
                td.style.display = 'table-cell';
            } else {
                td.style.display = 'none';
            }
            tr.appendChild(td);
        });
        
        tbody.appendChild(tr);
    });
}

// Add smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Calculate winner and scores
function calculateWinner() {
    const validColleges = selectedColleges.filter(c => c !== null);
    if (validColleges.length < 2) return;

    const scores = validColleges.map(() => ({ total: 0, wins: 0 }));
    
    // Scoring criteria
    const criteria = [
        { key: 'ranking', weight: 3, lower: true },
        { key: 'rating', weight: 3, lower: false },
        { key: 'fees', weight: 2, lower: true },
        { getValue: (c) => c.placement.average, weight: 3, lower: false },
        { getValue: (c) => c.placement.highest, weight: 2, lower: false },
        { getValue: (c) => c.placement.percentage, weight: 3, lower: false },
    ];

    criteria.forEach(criterion => {
        const values = validColleges.map((c, i) => ({
            index: i,
            value: criterion.getValue ? criterion.getValue(c) : c[criterion.key]
        }));

        const bestIndex = criterion.lower
            ? values.reduce((min, curr) => curr.value < min.value ? curr : min).index
            : values.reduce((max, curr) => curr.value > max.value ? curr : max).index;

        scores[bestIndex].total += criterion.weight * 10;
        scores[bestIndex].wins += 1;
    });

    const winnerIndex = scores.reduce((max, curr, idx) => 
        curr.total > scores[max].total ? idx : max, 0
    );

    displayWinner(validColleges[winnerIndex], scores[winnerIndex]);
}

function displayWinner(college, score) {
    const winnerSummary = document.getElementById('winnerSummary');
    const winnerName = document.getElementById('winnerName');
    const winnerScore = document.getElementById('winnerScore');
    const winnerWins = document.getElementById('winnerWins');

    winnerName.textContent = college.name;
    winnerScore.textContent = score.total;
    winnerWins.textContent = score.wins;
    winnerSummary.style.display = 'block';
}

// Generate AI Insights
function generateAIInsights() {
    const validColleges = selectedColleges.filter(c => c !== null);
    if (validColleges.length < 2) return;

    const insights = [];

    // Best Value for Money
    const feeRatios = validColleges.map(c => ({
        college: c,
        ratio: c.placement.average / c.fees
    }));
    const bestValue = feeRatios.reduce((max, curr) => 
        curr.ratio > max.ratio ? curr : max
    );
    insights.push({
        icon: '💰',
        title: 'Best Value for Money',
        text: `<span class="insight-highlight">${bestValue.college.name}</span> offers the best ROI with ${(bestValue.ratio * 100).toFixed(1)}x return on fees through placements.`
    });

    // Highest Placement Success
    const bestPlacement = validColleges.reduce((max, curr) => 
        curr.placement.percentage > max.placement.percentage ? curr : max
    );
    insights.push({
        icon: '📈',
        title: 'Placement Champion',
        text: `<span class="insight-highlight">${bestPlacement.name}</span> leads with ${bestPlacement.placement.percentage}% placement rate and ₹${(bestPlacement.placement.highest/100000).toFixed(1)}L highest package.`
    });

    // Most Affordable
    const cheapest = validColleges.reduce((min, curr) => 
        curr.fees < min.fees ? curr : min
    );
    insights.push({
        icon: '🎓',
        title: 'Most Affordable',
        text: `<span class="insight-highlight">${cheapest.name}</span> is the most budget-friendly option at ₹${(cheapest.fees/100000).toFixed(2)}L annually.`
    });

    // Best Rated
    const bestRated = validColleges.reduce((max, curr) => 
        curr.rating > max.rating ? curr : max
    );
    insights.push({
        icon: '⭐',
        title: 'Top Rated',
        text: `<span class="insight-highlight">${bestRated.name}</span> has the highest rating of ${bestRated.rating}/5 from students and alumni.`
    });

    displayInsights(insights);
}

function displayInsights(insights) {
    const insightsGrid = document.getElementById('insightsGrid');
    insightsGrid.innerHTML = insights.map(insight => `
        <div class="insight-card">
            <span class="insight-icon">${insight.icon}</span>
            <h4 class="insight-title">${insight.title}</h4>
            <p class="insight-text">${insight.text}</p>
        </div>
    `).join('');
}

// Generate Similar Colleges Suggestions
function generateSimilarColleges() {
    const validColleges = selectedColleges.filter(c => c !== null);
    if (validColleges.length === 0) return;

    const avgFees = validColleges.reduce((sum, c) => sum + c.fees, 0) / validColleges.length;
    const avgRating = validColleges.reduce((sum, c) => sum + c.rating, 0) / validColleges.length;

    const selectedIds = validColleges.map(c => c.id);
    const similar = colleges
        .filter(c => !selectedIds.includes(c.id))
        .map(c => ({
            college: c,
            score: calculateSimilarityScore(c, avgFees, avgRating)
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 6);

    displaySimilarColleges(similar);
}

function calculateSimilarityScore(college, avgFees, avgRating) {
    const feeDiff = Math.abs(college.fees - avgFees) / avgFees;
    const ratingDiff = Math.abs(college.rating - avgRating) / 5;
    const score = (1 - (feeDiff + ratingDiff) / 2) * 100;
    return Math.max(0, Math.min(100, score));
}

function displaySimilarColleges(similar) {
    const similarGrid = document.getElementById('similarGrid');
    similarGrid.innerHTML = similar.map(item => `
        <div class="similar-card" onclick="addSimilarCollege('${item.college.id}')">
            <div class="similar-card-header">
                <div class="college-name">${item.college.name}</div>
                <div class="match-score">${Math.round(item.score)}% Match</div>
            </div>
            <div class="college-details">
                <div class="detail-row">
                    <span class="detail-icon">📍</span>
                    <span>${item.college.location}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-icon">💰</span>
                    <span>₹${(item.college.fees/100000).toFixed(2)}L/year</span>
                </div>
                <div class="detail-row">
                    <span class="detail-icon">⭐</span>
                    <span>${item.college.rating}/5 Rating</span>
                </div>
                <div class="detail-row">
                    <span class="detail-icon">💼</span>
                    <span>₹${(item.college.placement.average/100000).toFixed(1)}L avg package</span>
                </div>
            </div>
            <button class="btn-add-compare" onclick="event.stopPropagation(); addSimilarCollege('${item.college.id}')">
                + Add to Compare
            </button>
        </div>
    `).join('');
}

function addSimilarCollege(collegeId) {
    const emptySlot = selectedColleges.findIndex(c => c === null);
    if (emptySlot !== -1) {
        const college = colleges.find(c => c.id === collegeId);
        const select = document.getElementById(`college${emptySlot + 1}`);
        select.value = collegeId;
        handleCollegeSelect(emptySlot, collegeId);
        showToast('College added to comparison! 🎉');
    } else {
        showToast('All slots are full. Remove a college first.', 'warning');
    }
}

// Export Comparison as PDF
function exportComparison() {
    showToast('PDF export feature coming soon! 📄');
    // In production, integrate with jsPDF or similar library
}

// Share Comparison
function shareComparison() {
    const shareModal = document.createElement('div');
    shareModal.className = 'share-modal';
    shareModal.innerHTML = `
        <div class="share-content">
            <h3 class="share-header">Share Comparison</h3>
            <div class="share-options">
                <div class="share-option" onclick="shareVia('whatsapp')">
                    <span class="share-option-icon">💬</span>
                    <span class="share-option-label">WhatsApp</span>
                </div>
                <div class="share-option" onclick="shareVia('twitter')">
                    <span class="share-option-icon">🐦</span>
                    <span class="share-option-label">Twitter</span>
                </div>
                <div class="share-option" onclick="shareVia('facebook')">
                    <span class="share-option-icon">📘</span>
                    <span class="share-option-label">Facebook</span>
                </div>
                <div class="share-option" onclick="shareVia('linkedin')">
                    <span class="share-option-icon">💼</span>
                    <span class="share-option-label">LinkedIn</span>
                </div>
                <div class="share-option" onclick="shareVia('email')">
                    <span class="share-option-icon">📧</span>
                    <span class="share-option-label">Email</span>
                </div>
                <div class="share-option" onclick="copyLink()">
                    <span class="share-option-icon">🔗</span>
                    <span class="share-option-label">Copy Link</span>
                </div>
            </div>
            <div class="share-link">
                <input type="text" value="${window.location.href}" readonly id="shareLink">
                <button class="btn-copy" onclick="copyLink()">Copy</button>
            </div>
            <button class="btn-close-modal" onclick="closeShareModal()">Close</button>
        </div>
    `;
    document.body.appendChild(shareModal);
    setTimeout(() => shareModal.classList.add('active'), 10);
}

function shareVia(platform) {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent('Check out this college comparison!');
    const urls = {
        whatsapp: `https://wa.me/?text=${text}%20${url}`,
        twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
        email: `mailto:?subject=College Comparison&body=${text}%20${url}`
    };
    if (urls[platform]) {
        window.open(urls[platform], '_blank');
    }
}

function copyLink() {
    const input = document.getElementById('shareLink');
    input.select();
    document.execCommand('copy');
    showToast('Link copied to clipboard! 📋');
}

function closeShareModal() {
    const modal = document.querySelector('.share-modal');
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
}

// Reset Comparison
function resetComparison() {
    if (confirm('Are you sure you want to reset all selections?')) {
        selectedColleges = [null, null, null];
        document.getElementById('college1').value = '';
        document.getElementById('college2').value = '';
        document.getElementById('college3').value = '';
        document.getElementById('remove1').style.display = 'none';
        document.getElementById('remove2').style.display = 'none';
        document.getElementById('remove3').style.display = 'none';
        updateComparison();
        showToast('Comparison reset successfully! 🔄');
    }
}

// View Details
function viewDetails() {
    const validColleges = selectedColleges.filter(c => c !== null);
    if (validColleges.length > 0) {
        document.getElementById('comparisonTable').scrollIntoView({ 
            behavior: 'smooth',
            block: 'center'
        });
    }
}

// Toast Notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = 'message-toast';
    toast.textContent = message;
    if (type === 'warning') {
        toast.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
    }
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'slideInRight 0.5s ease-out reverse';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}
