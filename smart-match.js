// Smart Match JavaScript

let userPreferences = {
    fieldOfStudy: '',
    degreeLevel: '',
    interests: [],
    careerGoal: '',
    budget: '',
    priorities: {},
    preferredState: '',
    campusType: '',
    facilities: []
};

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    initializeForm();
    setupDragAndDrop();
});

// Initialize form interactions
function initializeForm() {
    // Interest tags
    const tagButtons = document.querySelectorAll('.tag-btn');
    tagButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            this.classList.toggle('active');
        });
    });

    // Form submission
    document.getElementById('matchForm').addEventListener('submit', handleFormSubmit);
}

// Step navigation
function nextStep(stepNumber) {
    const currentStep = document.querySelector('.form-step.active');
    const nextStep = document.querySelector(`[data-step="${stepNumber}"]`);
    
    // Validate current step
    if (!validateStep(currentStep)) {
        return;
    }
    
    currentStep.classList.remove('active');
    nextStep.classList.add('active');
    
    // Update progress indicator
    updateProgress(stepNumber);
    
    // Scroll to top of form
    document.querySelector('.match-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function prevStep(stepNumber) {
    const currentStep = document.querySelector('.form-step.active');
    const prevStep = document.querySelector(`[data-step="${stepNumber}"]`);
    
    currentStep.classList.remove('active');
    prevStep.classList.add('active');
    
    updateProgress(stepNumber);
    
    document.querySelector('.match-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function validateStep(step) {
    const requiredFields = step.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value) {
            field.style.borderColor = '#ef4444';
            isValid = false;
            
            setTimeout(() => {
                field.style.borderColor = '';
            }, 2000);
        }
    });
    
    if (!isValid) {
        showNotification('Please fill in all required fields', 'error');
    }
    
    return isValid;
}

function updateProgress(stepNumber) {
    const progressSteps = document.querySelectorAll('.progress-step');
    
    progressSteps.forEach((step, index) => {
        const stepNum = index + 1;
        if (stepNum < stepNumber) {
            step.classList.add('completed');
            step.classList.remove('active');
        } else if (stepNum === stepNumber) {
            step.classList.add('active');
            step.classList.remove('completed');
        } else {
            step.classList.remove('active', 'completed');
        }
    });
}

// Drag and drop for priorities
function setupDragAndDrop() {
    const priorityItems = document.querySelectorAll('.priority-item');
    let draggedItem = null;
    
    priorityItems.forEach(item => {
        item.addEventListener('dragstart', function(e) {
            draggedItem = this;
            this.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });
        
        item.addEventListener('dragend', function() {
            this.classList.remove('dragging');
            updatePriorityRanks();
        });
        
        item.addEventListener('dragover', function(e) {
            e.preventDefault();
            const afterElement = getDragAfterElement(this.parentElement, e.clientY);
            if (afterElement == null) {
                this.parentElement.appendChild(draggedItem);
            } else {
                this.parentElement.insertBefore(draggedItem, afterElement);
            }
        });
    });
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.priority-item:not(.dragging)')];
    
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function updatePriorityRanks() {
    const priorityItems = document.querySelectorAll('.priority-item');
    priorityItems.forEach((item, index) => {
        const rankElement = item.querySelector('.priority-rank');
        rankElement.textContent = index + 1;
    });
}

// Form submission
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const submitBtn = document.querySelector('.btn-submit');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    
    // Show loading state
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoader.style.display = 'inline-block';
    
    // Collect form data
    collectFormData();
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate matches
    const matches = generateMatches();
    
    // Hide form, show results
    document.querySelector('.preferences-section').style.display = 'none';
    const resultsSection = document.getElementById('resultsSection');
    resultsSection.style.display = 'block';
    displayResults(matches);
    
    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth' });
    
    // Reset button
    submitBtn.disabled = false;
    btnText.style.display = 'inline';
    btnLoader.style.display = 'none';
}

function collectFormData() {
    // Basic fields
    userPreferences.fieldOfStudy = document.getElementById('fieldOfStudy').value;
    userPreferences.degreeLevel = document.getElementById('degreeLevel').value;
    userPreferences.careerGoal = document.getElementById('careerGoal').value;
    userPreferences.budget = document.getElementById('budget').value;
    userPreferences.preferredState = document.getElementById('preferredState').value;
    userPreferences.campusType = document.getElementById('campusType').value;
    
    // Interests
    const activeInterests = document.querySelectorAll('.tag-btn.active');
    userPreferences.interests = Array.from(activeInterests).map(btn => btn.dataset.value);
    
    // Priorities
    const priorityItems = document.querySelectorAll('.priority-item');
    priorityItems.forEach((item, index) => {
        const priority = item.dataset.priority;
        userPreferences.priorities[priority] = index + 1;
    });
    
    // Facilities
    const checkedFacilities = document.querySelectorAll('input[name="facilities"]:checked');
    userPreferences.facilities = Array.from(checkedFacilities).map(cb => cb.value);
}

function generateMatches() {
    // Filter colleges based on preferences
    let matches = colleges.filter(college => {
        // State filter
        if (userPreferences.preferredState !== 'Any' && userPreferences.preferredState) {
            if (college.state !== userPreferences.preferredState) return false;
        }
        
        // Budget filter
        if (userPreferences.budget) {
            const [min, max] = userPreferences.budget.split('-').map(v => parseInt(v.replace('+', '')));
            if (max) {
                if (college.fees < min || college.fees > max) return false;
            } else {
                if (college.fees < min) return false;
            }
        }
        
        return true;
    });
    
    // Calculate match scores
    matches = matches.map(college => {
        const score = calculateMatchScore(college);
        return {
            ...college,
            matchScore: score,
            reasons: getMatchReasons(college, score)
        };
    });
    
    // Sort by match score
    matches.sort((a, b) => b.matchScore - a.matchScore);
    
    // Return top 6 matches
    return matches.slice(0, 6);
}

function calculateMatchScore(college) {
    let score = 50; // Base score
    
    // Budget match (20 points)
    if (userPreferences.budget) {
        const [min, max] = userPreferences.budget.split('-').map(v => parseInt(v.replace('+', '')));
        if (max) {
            if (college.fees >= min && college.fees <= max) {
                score += 20;
            } else if (college.fees <= max * 1.2) {
                score += 10;
            }
        } else {
            if (college.fees >= min) {
                score += 20;
            }
        }
    }
    
    // Ranking (15 points)
    if (college.ranking <= 5) score += 15;
    else if (college.ranking <= 10) score += 12;
    else if (college.ranking <= 20) score += 8;
    else score += 5;
    
    // Rating (10 points)
    score += college.rating * 2;
    
    // Placement (15 points)
    if (college.placement.percentage >= 90) score += 15;
    else if (college.placement.percentage >= 80) score += 12;
    else if (college.placement.percentage >= 70) score += 8;
    else score += 5;
    
    // Priority matches
    const priorities = userPreferences.priorities;
    if (priorities.placement === 1 && college.placement.percentage >= 85) score += 10;
    if (priorities.reputation === 1 && college.ranking <= 10) score += 10;
    if (priorities.fees === 1 && college.fees <= 300000) score += 10;
    
    return Math.min(Math.round(score), 99);
}

function getMatchReasons(college, score) {
    const reasons = [];
    
    if (college.ranking <= 10) {
        reasons.push(`Top ${college.ranking} ranked college`);
    }
    
    if (college.placement.percentage >= 85) {
        reasons.push(`${college.placement.percentage}% placement rate`);
    }
    
    if (college.rating >= 4.5) {
        reasons.push(`Excellent ${college.rating}/5 rating`);
    }
    
    if (userPreferences.budget) {
        const [min, max] = userPreferences.budget.split('-').map(v => parseInt(v.replace('+', '')));
        if (max && college.fees >= min && college.fees <= max) {
            reasons.push('Within your budget range');
        }
    }
    
    if (userPreferences.preferredState === college.state) {
        reasons.push('In your preferred state');
    }
    
    if (college.placement.average >= 800000) {
        reasons.push('High average salary packages');
    }
    
    return reasons.slice(0, 4);
}

function displayResults(matches) {
    const resultsContainer = document.getElementById('matchResults');
    
    resultsContainer.innerHTML = matches.map(match => `
        <div class="match-card">
            <div class="match-score">
                <div class="score-number">${match.matchScore}%</div>
                <div class="score-label">Match Score</div>
            </div>
            <div class="match-content">
                <h3 class="match-college-name">${match.name}</h3>
                <div class="match-location">📍 ${match.location}</div>
                
                <div class="match-reasons">
                    <h4>Why This Match?</h4>
                    <ul>
                        ${match.reasons.map(reason => `<li>${reason}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="match-stats-row">
                    <div class="match-stat">
                        <div class="match-stat-label">Fees</div>
                        <div class="match-stat-value">₹${(match.fees / 100000).toFixed(1)}L</div>
                    </div>
                    <div class="match-stat">
                        <div class="match-stat-label">Placement</div>
                        <div class="match-stat-value">${match.placement.percentage}%</div>
                    </div>
                </div>
                
                <div class="match-actions">
                    <button class="btn-details" onclick="window.location.href='details.html?id=${match.id}'">
                        View Details
                    </button>
                    <button class="btn-compare" onclick="addToCompare(${match.id})">
                        Add to Compare
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function addToCompare(collegeId) {
    // Add to comparison (stored in localStorage)
    let compareList = JSON.parse(localStorage.getItem('compareList') || '[]');
    
    if (compareList.includes(collegeId)) {
        showNotification('Already in comparison list', 'info');
        return;
    }
    
    if (compareList.length >= 4) {
        showNotification('Maximum 4 colleges can be compared', 'error');
        return;
    }
    
    compareList.push(collegeId);
    localStorage.setItem('compareList', JSON.stringify(compareList));
    showNotification('Added to comparison list', 'success');
}

function showNotification(message, type) {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = `toast ${type} show`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 2rem;
        right: 2rem;
        padding: 1rem 1.5rem;
        background: var(--card);
        border-radius: 0.5rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        z-index: 2000;
        max-width: 300px;
        animation: slideIn 0.3s ease;
    `;
    
    if (type === 'success') {
        toast.style.borderLeft = '4px solid #10b981';
    } else if (type === 'error') {
        toast.style.borderLeft = '4px solid #ef4444';
    } else {
        toast.style.borderLeft = '4px solid #06b6d4';
    }
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}
