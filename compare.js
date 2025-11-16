// Compare page script
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
});

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
    if (!collegeId) {
        selectedColleges[index] = null;
        document.getElementById(`remove${index + 1}`).style.display = 'none';
    } else {
        const college = colleges.find(c => c.id === collegeId);
        selectedColleges[index] = college;
        document.getElementById(`remove${index + 1}`).style.display = 'block';
    }
    updateComparison();
}

function removeCollege(index) {
    selectedColleges[index] = null;
    document.getElementById(`college${index + 1}`).value = '';
    document.getElementById(`remove${index + 1}`).style.display = 'none';
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
    
    table.style.display = 'block';
    noComparison.style.display = 'none';
    
    // Update headers
    selectedColleges.forEach((college, index) => {
        const header = document.getElementById(`header${index + 1}`);
        if (college) {
            header.textContent = college.name;
            header.style.display = 'table-cell';
        } else {
            header.style.display = 'none';
        }
    });
    
    // Create comparison rows
    const comparisonRows = [
        { label: 'Ranking', getValue: (c) => `#${c.ranking}` },
        { label: 'Location', getValue: (c) => c.location },
        { label: 'Type', getValue: (c) => c.type },
        { label: 'Established', getValue: (c) => c.established },
        { label: 'Annual Fees', getValue: (c) => `₹${(c.fees / 100000).toFixed(2)}L` },
        { label: 'Rating', getValue: (c) => `${c.rating}/5` },
        { label: 'Courses', getValue: (c) => c.courses.join(', ') },
        { label: 'Facilities', getValue: (c) => c.facilities.join(', ') },
        { label: 'Avg. Placement', getValue: (c) => `₹${(c.placement.average / 100000).toFixed(1)}L` },
        { label: 'Highest Placement', getValue: (c) => `₹${(c.placement.highest / 100000).toFixed(1)}L` },
        { label: 'Placement Rate', getValue: (c) => `${c.placement.percentage}%` },
        { label: 'Hostel Available', getValue: (c) => c.hostel.available ? 'Yes' : 'No' },
        { label: 'Hostel Fees', getValue: (c) => c.hostel.available ? `₹${(c.hostel.fees / 1000).toFixed(0)}K` : 'N/A' },
    ];
    
    const tbody = document.getElementById('comparisonBody');
    tbody.innerHTML = comparisonRows.map(row => {
        let cells = `<td><strong>${row.label}</strong></td>`;
        selectedColleges.forEach(college => {
            if (college) {
                cells += `<td>${row.getValue(college)}</td>`;
            } else {
                cells += `<td style="display: none;"></td>`;
            }
        });
        return `<tr>${cells}</tr>`;
    }).join('');
}
