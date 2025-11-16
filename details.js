// Details page script
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const collegeId = urlParams.get('id');
    
    if (!collegeId) {
        displayNotFound();
        return;
    }
    
    const college = colleges.find(c => c.id === collegeId);
    
    if (!college) {
        displayNotFound();
        return;
    }
    
    displayCollegeDetail(college);
});

function displayNotFound() {
    document.getElementById('collegeDetail').innerHTML = `
        <div class="no-results">
            <h1>College Not Found</h1>
            <a href="index.html" class="btn btn-primary" style="max-width: 200px; margin: 1rem auto;">Back to Home</a>
        </div>
    `;
}

function displayCollegeDetail(college) {
    const detailHTML = `
        <div class="detail-hero">
            <img src="${college.image}" alt="${college.name}">
        </div>
        
        <div class="detail-header">
            <div style="display: flex; justify-content: space-between; align-items: start; flex-wrap: wrap; gap: 1rem;">
                <div>
                    <h1 class="detail-title">${college.name}</h1>
                    <div class="college-location" style="font-size: 1.125rem;">
                        📍 <span>${college.location}</span>
                    </div>
                </div>
                <div class="rank-badge" style="position: static; font-size: 1.125rem; padding: 0.5rem 1rem;">
                    Rank #${college.ranking}
                </div>
            </div>
            
            <div class="detail-badges">
                <div class="info-badge">
                    ⭐ ${college.rating}/5 Rating
                </div>
                <div class="info-badge">
                    🏛️ ${college.type}
                </div>
                <div class="info-badge">
                    📅 Est. ${college.established}
                </div>
            </div>
        </div>
        
        <div class="detail-content">
            <div class="main-content">
                <div class="detail-card">
                    <h2>About</h2>
                    <p>${college.description}</p>
                </div>
                
                <div class="detail-card">
                    <h2>Courses Offered</h2>
                    <div class="course-badges">
                        ${college.courses.map(course => `<span class="course-badge" style="font-size: 0.875rem; padding: 0.5rem 1rem;">${course}</span>`).join('')}
                    </div>
                </div>
                
                <div class="detail-card">
                    <h2>Facilities</h2>
                    <div class="facility-list">
                        ${college.facilities.map(facility => `
                            <div class="facility-item">
                                ✓ ${facility}
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="detail-card">
                    <h2>Placement Statistics</h2>
                    <div class="info-row">
                        <span class="info-label">Average Package</span>
                        <span class="info-value">₹${(college.placement.average / 100000).toFixed(2)} Lakhs</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Highest Package</span>
                        <span class="info-value">₹${(college.placement.highest / 100000).toFixed(2)} Lakhs</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Placement Rate</span>
                        <span class="info-value">${college.placement.percentage}%</span>
                    </div>
                </div>
            </div>
            
            <div class="sidebar-content">
                <div class="detail-card">
                    <h2>Quick Info</h2>
                    <div class="info-row">
                        <span class="info-label">Type</span>
                        <span class="info-value">${college.type}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Established</span>
                        <span class="info-value">${college.established}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Location</span>
                        <span class="info-value">${college.city}, ${college.state}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Rating</span>
                        <span class="info-value">${college.rating}/5</span>
                    </div>
                </div>
                
                <div class="detail-card">
                    <h2>Fees Structure</h2>
                    <div class="info-row">
                        <span class="info-label">Annual Tuition</span>
                        <span class="info-value">₹${(college.fees / 100000).toFixed(2)} Lakhs</span>
                    </div>
                    ${college.hostel.available ? `
                        <div class="info-row">
                            <span class="info-label">Hostel Fees</span>
                            <span class="info-value">₹${(college.hostel.fees / 1000).toFixed(0)}K/year</span>
                        </div>
                    ` : ''}
                </div>
                
                <div class="detail-card">
                    <h2>Hostel</h2>
                    <div class="info-row">
                        <span class="info-label">Available</span>
                        <span class="info-value">${college.hostel.available ? 'Yes' : 'No'}</span>
                    </div>
                    ${college.hostel.available ? `
                        <div class="info-row">
                            <span class="info-label">Type</span>
                            <span class="info-value">${college.hostel.type}</span>
                        </div>
                    ` : ''}
                </div>
                
                <div class="detail-card">
                    <h2>Admission</h2>
                    <p style="color: var(--muted-foreground); font-size: 0.875rem;">${college.admissionProcess}</p>
                </div>
                
                <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                    <a href="compare.html?college=${college.id}" class="btn btn-primary">
                        Compare This College
                    </a>
                    <a href="index.html" class="btn btn-outline">
                        Back to Search
                    </a>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('collegeDetail').innerHTML = detailHTML;
    
    // Update page title
    document.title = `${college.name} - CollegeFinder`;
}
