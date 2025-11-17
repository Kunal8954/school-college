// Analytics Dashboard JavaScript

let charts = {};
let currentFilters = {
    year: '2024',
    program: 'all',
    region: 'all'
};

// Filtered data storage
let filteredColleges = [];
let analyticsData = {};

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    showLoadingOverlay();
    
    setTimeout(() => {
        initializeDashboard();
        hideLoadingOverlay();
    }, 1500);
});

function showLoadingOverlay() {
    document.getElementById('loadingOverlay').classList.remove('hidden');
}

function hideLoadingOverlay() {
    document.getElementById('loadingOverlay').classList.add('hidden');
}

function initializeDashboard() {
    generateAnalyticsData();
    filterData();
    animateStatCards();
    initializeCharts();
    populateTables();
    setupFilterListeners();
}

// Generate comprehensive analytics data
function generateAnalyticsData() {
    const years = ['2020', '2021', '2022', '2023', '2024'];
    const programs = ['Engineering', 'Management', 'Medicine', 'Arts & Sciences', 'Law'];
    const regions = ['North', 'South', 'East', 'West', 'Central'];
    
    analyticsData = {
        placementTrends: {},
        programData: {},
        regionalData: {},
        salaryData: {},
        companiesData: {},
        satisfactionData: {}
    };
    
    // Generate data for each year
    years.forEach(year => {
        const yearMultiplier = (parseInt(year) - 2019) * 0.15;
        
        analyticsData.placementTrends[year] = {
            studentsPlaced: Math.floor(35000 + yearMultiplier * 35000),
            avgPackage: 8.5 + yearMultiplier * 4,
            companies: Math.floor(150 + yearMultiplier * 50)
        };
        
        // Program-wise data
        programs.forEach(program => {
            const key = `${year}_${program}`;
            const baseMultiplier = {
                'Engineering': 1.2,
                'Management': 0.9,
                'Medicine': 0.7,
                'Arts & Sciences': 0.6,
                'Law': 0.4
            }[program];
            
            analyticsData.programData[key] = {
                students: Math.floor(8000 * baseMultiplier + yearMultiplier * 2000),
                avgSalary: (7 + yearMultiplier * 3) * baseMultiplier,
                placementRate: 75 + yearMultiplier * 5 + (program === 'Engineering' ? 15 : 0)
            };
        });
        
        // Regional data
        regions.forEach(region => {
            const key = `${year}_${region}`;
            const regionMultiplier = {
                'North': 1.1,
                'South': 1.3,
                'East': 0.7,
                'West': 1.0,
                'Central': 0.6
            }[region];
            
            analyticsData.regionalData[key] = {
                placements: (12 + yearMultiplier * 3) * regionMultiplier,
                avgSalary: (10 + yearMultiplier * 2.5) * regionMultiplier,
                colleges: Math.floor(50 * regionMultiplier)
            };
        });
    });
}

// Filter data based on current filters
function filterData() {
    filteredColleges = colleges.filter(college => {
        let matches = true;
        
        // Filter by region
        if (currentFilters.region !== 'all') {
            const regionMap = {
                'North': ['Delhi', 'Punjab', 'Haryana', 'Uttar Pradesh', 'Rajasthan'],
                'South': ['Tamil Nadu', 'Karnataka', 'Kerala', 'Andhra Pradesh', 'Telangana'],
                'East': ['West Bengal', 'Odisha', 'Bihar', 'Jharkhand'],
                'West': ['Maharashtra', 'Gujarat', 'Goa'],
                'Central': ['Madhya Pradesh', 'Chhattisgarh']
            };
            
            matches = matches && regionMap[currentFilters.region]?.includes(college.state);
        }
        
        // Filter by program
        if (currentFilters.program !== 'all') {
            const programMap = {
                'Engineering': ['B.Tech', 'M.Tech', 'B.E.', 'M.E.'],
                'Management': ['MBA', 'BBA'],
                'Medicine': ['MBBS', 'MD'],
                'Arts & Sciences': ['BA', 'BSc', 'MA', 'MSc'],
                'Law': ['LLB', 'LLM']
            };
            
            const requiredCourses = programMap[currentFilters.program] || [];
            matches = matches && college.courses.some(course => 
                requiredCourses.some(req => course.includes(req))
            );
        }
        
        return matches;
    });
    
    return filteredColleges;
}

// Animate stat cards
function animateStatCards() {
    const statCards = document.querySelectorAll('.stat-card');
    
    // Calculate stats from filtered data
    const stats = calculateStats();
    
    statCards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.remove('loading');
            const valueElement = card.querySelector('.stat-value [data-target]') || 
                                card.querySelector('.stat-value');
            
            let target;
            if (index === 0) target = stats.totalStudents;
            else if (index === 1) target = stats.avgPackage;
            else if (index === 2) target = stats.placementRate;
            else if (index === 3) target = stats.topCompanies;
            
            if (target !== undefined) {
                valueElement.setAttribute('data-target', target);
                animateValue(valueElement, 0, target, 2000);
            }
        }, index * 200);
    });
}

function calculateStats() {
    const year = currentFilters.year;
    const yearData = analyticsData.placementTrends[year] || analyticsData.placementTrends['2024'];
    
    let totalStudents = yearData.studentsPlaced;
    let avgPackage = yearData.avgPackage;
    let placementRate = 85;
    let topCompanies = yearData.companies;
    
    // Adjust based on program filter
    if (currentFilters.program !== 'all') {
        const programKey = `${year}_${currentFilters.program}`;
        const programData = analyticsData.programData[programKey];
        if (programData) {
            totalStudents = programData.students;
            avgPackage = programData.avgSalary;
            placementRate = programData.placementRate;
        }
    }
    
    // Adjust based on region filter
    if (currentFilters.region !== 'all') {
        const regionKey = `${year}_${currentFilters.region}`;
        const regionData = analyticsData.regionalData[regionKey];
        if (regionData) {
            totalStudents = Math.floor(regionData.placements * 1000);
            avgPackage = regionData.avgSalary;
        }
    }
    
    return {
        totalStudents,
        avgPackage: parseFloat(avgPackage.toFixed(1)),
        placementRate: Math.round(placementRate),
        topCompanies
    };
}

function animateValue(element, start, end, duration) {
    const startTime = performance.now();
    const isDecimal = end % 1 !== 0;
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const current = start + (end - start) * easeOutCubic(progress);
        
        if (isDecimal) {
            element.textContent = current.toFixed(1);
        } else {
            element.textContent = Math.floor(current).toLocaleString();
        }
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

// Initialize all charts
function initializeCharts() {
    createPlacementTrendChart();
    createTopCompaniesChart();
    createCollegeRankingsChart();
    createProgramDistributionChart();
    createSalaryDistributionChart();
    createRegionalAnalysisChart();
    createSatisfactionChart();
}

// Placement Trend Chart (Line)
function createPlacementTrendChart() {
    const ctx = document.getElementById('placementTrendChart').getContext('2d');
    
    const years = ['2020', '2021', '2022', '2023', '2024'];
    const chartData = getPlacementTrendData(years);
    
    if (charts.placementTrend) {
        charts.placementTrend.destroy();
    }
    
    charts.placementTrend = new Chart(ctx, {
        type: 'line',
        data: {
            labels: years,
            datasets: [{
                label: 'Students Placed',
                data: chartData.studentsPlaced,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                yAxisID: 'y'
            }, {
                label: 'Avg Package (₹L)',
                data: chartData.avgPackages,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                yAxisID: 'y1'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: { size: 14, weight: 'bold' },
                    bodyFont: { size: 13 }
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    grid: {
                        drawOnChartArea: false,
                    }
                }
            }
        }
    });
}

function getPlacementTrendData(years) {
    const studentsPlaced = [];
    const avgPackages = [];
    
    years.forEach(year => {
        let yearData = analyticsData.placementTrends[year];
        
        if (currentFilters.program !== 'all') {
            const programKey = `${year}_${currentFilters.program}`;
            const programData = analyticsData.programData[programKey];
            if (programData) {
                studentsPlaced.push(programData.students);
                avgPackages.push(parseFloat(programData.avgSalary.toFixed(1)));
                return;
            }
        }
        
        if (currentFilters.region !== 'all') {
            const regionKey = `${year}_${currentFilters.region}`;
            const regionData = analyticsData.regionalData[regionKey];
            if (regionData) {
                studentsPlaced.push(Math.floor(regionData.placements * 1000));
                avgPackages.push(parseFloat(regionData.avgSalary.toFixed(1)));
                return;
            }
        }
        
        studentsPlaced.push(yearData.studentsPlaced);
        avgPackages.push(parseFloat(yearData.avgPackage.toFixed(1)));
    });
    
    return { studentsPlaced, avgPackages };
}

// Top Companies Chart (Horizontal Bar)
function createTopCompaniesChart() {
    const ctx = document.getElementById('topCompaniesChart').getContext('2d');
    
    const companiesData = getTopCompaniesData();
    
    if (charts.topCompanies) {
        charts.topCompanies.destroy();
    }
    
    charts.topCompanies = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: companiesData.companies,
            datasets: [{
                label: 'Number of Placements',
                data: companiesData.placements,
                backgroundColor: [
                    '#667eea',
                    '#764ba2',
                    '#f093fb',
                    '#10b981',
                    '#06b6d4',
                    '#f59e0b',
                    '#8b5cf6',
                    '#ec4899'
                ],
                borderRadius: 8
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                y: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

function getTopCompaniesData() {
    const year = currentFilters.year;
    const baseMultiplier = (parseInt(year) - 2019) * 0.2;
    
    let programMultiplier = 1.0;
    if (currentFilters.program === 'Engineering') programMultiplier = 1.5;
    else if (currentFilters.program === 'Management') programMultiplier = 1.2;
    else if (currentFilters.program !== 'all') programMultiplier = 0.7;
    
    let regionMultiplier = 1.0;
    if (currentFilters.region === 'South') regionMultiplier = 1.3;
    else if (currentFilters.region === 'North') regionMultiplier = 1.1;
    else if (currentFilters.region === 'West') regionMultiplier = 1.0;
    else if (currentFilters.region !== 'all') regionMultiplier = 0.7;
    
    const totalMultiplier = (1 + baseMultiplier) * programMultiplier * regionMultiplier;
    
    return {
        companies: ['Google', 'Microsoft', 'Amazon', 'TCS', 'Infosys', 'Wipro', 'Deloitte', 'Accenture'],
        placements: [
            Math.floor(1250 * totalMultiplier),
            Math.floor(1180 * totalMultiplier),
            Math.floor(980 * totalMultiplier),
            Math.floor(2450 * totalMultiplier),
            Math.floor(2200 * totalMultiplier),
            Math.floor(1850 * totalMultiplier),
            Math.floor(980 * totalMultiplier),
            Math.floor(1100 * totalMultiplier)
        ]
    };
}

// College Rankings Chart (Bar)
function createCollegeRankingsChart() {
    const ctx = document.getElementById('collegeRankingsChart').getContext('2d');
    
    const topColleges = filteredColleges.length > 0 
        ? filteredColleges.slice(0, 10) 
        : colleges.slice(0, 10);
    
    if (charts.collegeRankings) {
        charts.collegeRankings.destroy();
    }
    
    charts.collegeRankings = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: topColleges.map(c => c.name.split(' ').slice(0, 3).join(' ')),
            datasets: [{
                label: 'Ranking Score',
                data: topColleges.map(c => (100 - c.ranking * 2)),
                backgroundColor: 'rgba(102, 126, 234, 0.8)',
                borderColor: '#667eea',
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            return 'Rank: #' + topColleges[context.dataIndex].ranking;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            }
        }
    });
}

// Program Distribution Chart (Doughnut)
function createProgramDistributionChart() {
    const ctx = document.getElementById('programDistributionChart').getContext('2d');
    
    const distributionData = getProgramDistributionData();
    
    if (charts.programDistribution) {
        charts.programDistribution.destroy();
    }
    
    charts.programDistribution = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: distributionData.labels,
            datasets: [{
                data: distributionData.percentages,
                backgroundColor: [
                    '#667eea',
                    '#10b981',
                    '#f59e0b',
                    '#06b6d4',
                    '#8b5cf6',
                    '#ec4899'
                ],
                borderWidth: 3,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: {
                            size: 12,
                            weight: '600'
                        },
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.parsed + '%';
                        }
                    }
                }
            }
        }
    });
}

function getProgramDistributionData() {
    if (currentFilters.program !== 'all') {
        // Show breakdown of specializations within the program
        const specializations = {
            'Engineering': ['Computer Science', 'Mechanical', 'Electrical', 'Civil', 'Electronics', 'Others'],
            'Management': ['Finance', 'Marketing', 'HR', 'Operations', 'Strategy', 'Others'],
            'Medicine': ['General Medicine', 'Surgery', 'Pediatrics', 'Cardiology', 'Orthopedics', 'Others'],
            'Arts & Sciences': ['Physics', 'Chemistry', 'Mathematics', 'Economics', 'English', 'Others'],
            'Law': ['Corporate Law', 'Criminal Law', 'Civil Law', 'IPR', 'Constitutional Law', 'Others']
        };
        
        const percentages = {
            'Engineering': [35, 20, 15, 12, 10, 8],
            'Management': [28, 25, 18, 15, 10, 4],
            'Medicine': [30, 25, 15, 12, 10, 8],
            'Arts & Sciences': [22, 20, 18, 16, 14, 10],
            'Law': [32, 22, 18, 14, 10, 4]
        };
        
        return {
            labels: specializations[currentFilters.program] || specializations['Engineering'],
            percentages: percentages[currentFilters.program] || percentages['Engineering']
        };
    }
    
    if (currentFilters.region !== 'all') {
        const regionDistributions = {
            'North': [38, 25, 12, 15, 6, 4],
            'South': [45, 20, 18, 10, 4, 3],
            'East': [35, 18, 15, 20, 7, 5],
            'West': [40, 24, 14, 12, 6, 4],
            'Central': [36, 22, 10, 18, 8, 6]
        };
        
        return {
            labels: ['Engineering', 'Management', 'Medicine', 'Arts & Sciences', 'Law', 'Others'],
            percentages: regionDistributions[currentFilters.region] || [42, 22, 15, 12, 5, 4]
        };
    }
    
    return {
        labels: ['Engineering', 'Management', 'Medicine', 'Arts & Sciences', 'Law', 'Others'],
        percentages: [42, 22, 15, 12, 5, 4]
    };
}

// Salary Distribution Chart (Bar)
function createSalaryDistributionChart() {
    const ctx = document.getElementById('salaryDistributionChart').getContext('2d');
    
    const salaryData = getSalaryDistributionData();
    
    if (charts.salaryDistribution) {
        charts.salaryDistribution.destroy();
    }
    
    charts.salaryDistribution = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['0-3L', '3-6L', '6-10L', '10-15L', '15-20L', '20L+'],
            datasets: [{
                label: 'Number of Students',
                data: salaryData,
                backgroundColor: [
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(234, 179, 8, 0.8)',
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(5, 150, 105, 0.8)'
                ],
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

function getSalaryDistributionData() {
    const year = currentFilters.year;
    const baseMultiplier = (parseInt(year) - 2019) * 0.15;
    
    let baseDist = [3200, 8500, 15600, 12400, 7800, 4500];
    
    if (currentFilters.program === 'Engineering') {
        baseDist = [2000, 6500, 14000, 15000, 10000, 6500];
    } else if (currentFilters.program === 'Management') {
        baseDist = [1500, 5000, 12000, 14000, 11000, 8500];
    } else if (currentFilters.program === 'Medicine') {
        baseDist = [500, 3000, 8000, 12000, 14000, 10500];
    } else if (currentFilters.program === 'Arts & Sciences') {
        baseDist = [5000, 12000, 10000, 6000, 3000, 1000];
    } else if (currentFilters.program === 'Law') {
        baseDist = [3000, 8000, 11000, 9000, 6000, 3000];
    }
    
    return baseDist.map(val => Math.floor(val * (1 + baseMultiplier)));
}

// Regional Analysis Chart (Grouped Bar)
function createRegionalAnalysisChart() {
    const ctx = document.getElementById('regionalAnalysisChart').getContext('2d');
    
    const regionalData = getRegionalAnalysisData();
    
    if (charts.regionalAnalysis) {
        charts.regionalAnalysis.destroy();
    }
    
    charts.regionalAnalysis = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: regionalData.labels,
            datasets: [{
                label: 'Placements (in thousands)',
                data: regionalData.placements,
                backgroundColor: 'rgba(102, 126, 234, 0.8)',
                borderRadius: 6
            }, {
                label: 'Avg Salary (₹L)',
                data: regionalData.salaries,
                backgroundColor: 'rgba(16, 185, 129, 0.8)',
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

function getRegionalAnalysisData() {
    const year = currentFilters.year;
    const regions = ['North', 'South', 'East', 'West', 'Central'];
    
    if (currentFilters.region !== 'all') {
        // Show city-wise breakdown for the selected region
        const cityBreakdown = {
            'North': {
                labels: ['Delhi', 'Chandigarh', 'Jaipur', 'Lucknow', 'Dehradun'],
                placements: [8.5, 3.2, 2.8, 1.5, 1.2],
                salaries: [13.5, 11.8, 10.5, 9.8, 10.2]
            },
            'South': {
                labels: ['Chennai', 'Bangalore', 'Hyderabad', 'Trivandrum', 'Coimbatore'],
                placements: [6.5, 7.8, 5.2, 2.1, 1.9],
                salaries: [14.2, 15.5, 14.8, 12.5, 11.8]
            },
            'East': {
                labels: ['Kolkata', 'Bhubaneswar', 'Patna', 'Ranchi', 'Guwahati'],
                placements: [4.5, 2.1, 1.2, 0.8, 0.7],
                salaries: [11.5, 10.2, 9.5, 9.8, 10.1]
            },
            'West': {
                labels: ['Mumbai', 'Pune', 'Ahmedabad', 'Surat', 'Goa'],
                placements: [6.8, 4.2, 2.5, 1.1, 0.9],
                salaries: [14.5, 12.8, 11.5, 10.8, 11.2]
            },
            'Central': {
                labels: ['Indore', 'Bhopal', 'Raipur', 'Jabalpur', 'Gwalior'],
                placements: [3.2, 2.5, 1.8, 0.9, 0.6],
                salaries: [10.8, 10.2, 9.5, 9.2, 9.0]
            }
        };
        
        return cityBreakdown[currentFilters.region] || cityBreakdown['North'];
    }
    
    const placements = [];
    const salaries = [];
    
    regions.forEach(region => {
        const regionKey = `${year}_${region}`;
        const data = analyticsData.regionalData[regionKey];
        if (data) {
            placements.push(parseFloat(data.placements.toFixed(1)));
            salaries.push(parseFloat(data.avgSalary.toFixed(1)));
        }
    });
    
    return {
        labels: regions,
        placements,
        salaries
    };
}

// Satisfaction Chart (Radar)
function createSatisfactionChart() {
    const ctx = document.getElementById('satisfactionChart').getContext('2d');
    
    const satisfactionData = getSatisfactionData();
    
    if (charts.satisfaction) {
        charts.satisfaction.destroy();
    }
    
    charts.satisfaction = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Faculty', 'Infrastructure', 'Placement', 'Research', 'Campus Life', 'Industry Connect'],
            datasets: satisfactionData.datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        padding: 20,
                        font: {
                            size: 13,
                            weight: '600'
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12
                }
            },
            scales: {
                r: {
                    angleLines: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    pointLabels: {
                        font: {
                            size: 12,
                            weight: '600'
                        }
                    },
                    ticks: {
                        beginAtZero: true,
                        max: 5,
                        stepSize: 1
                    }
                }
            }
        }
    });
}

function getSatisfactionData() {
    const year = currentFilters.year;
    const currentYear = parseInt(year);
    const previousYear = currentYear - 1;
    
    let currentScores = [4.6, 4.5, 4.7, 4.3, 4.8, 4.4];
    let previousScores = [4.4, 4.2, 4.5, 4.1, 4.5, 4.2];
    
    // Adjust based on program
    if (currentFilters.program === 'Engineering') {
        currentScores = [4.5, 4.7, 4.8, 4.6, 4.5, 4.7];
        previousScores = [4.3, 4.5, 4.6, 4.4, 4.3, 4.5];
    } else if (currentFilters.program === 'Management') {
        currentScores = [4.7, 4.6, 4.5, 4.2, 4.9, 4.8];
        previousScores = [4.5, 4.4, 4.3, 4.0, 4.7, 4.6];
    } else if (currentFilters.program === 'Medicine') {
        currentScores = [4.8, 4.9, 4.4, 4.7, 4.3, 4.5];
        previousScores = [4.6, 4.7, 4.2, 4.5, 4.1, 4.3];
    }
    
    // Adjust based on region
    if (currentFilters.region === 'South') {
        currentScores = currentScores.map(s => Math.min(5, s + 0.2));
        previousScores = previousScores.map(s => Math.min(5, s + 0.2));
    } else if (currentFilters.region === 'East') {
        currentScores = currentScores.map(s => Math.max(3.5, s - 0.2));
        previousScores = previousScores.map(s => Math.max(3.3, s - 0.2));
    }
    
    return {
        datasets: [{
            label: year,
            data: currentScores,
            backgroundColor: 'rgba(102, 126, 234, 0.2)',
            borderColor: '#667eea',
            borderWidth: 3,
            pointBackgroundColor: '#667eea',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: '#667eea',
            pointRadius: 5,
            pointHoverRadius: 7
        }, {
            label: previousYear.toString(),
            data: previousScores,
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
            borderColor: '#10b981',
            borderWidth: 3,
            pointBackgroundColor: '#10b981',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: '#10b981',
            pointRadius: 5,
            pointHoverRadius: 7
        }]
    };
}

// Populate tables
function populateTables() {
    populateTopPerformersTable();
    populateReviewsTable();
}

function populateTopPerformersTable() {
    const tbody = document.querySelector('#topPerformersTable tbody');
    const topColleges = (filteredColleges.length > 0 ? filteredColleges : colleges)
        .sort((a, b) => b.placement.percentage - a.placement.percentage)
        .slice(0, 10);
    
    tbody.innerHTML = topColleges.map((college, index) => `
        <tr>
            <td><span class="rank-badge">${index + 1}</span></td>
            <td>${college.name}</td>
            <td>
                <div class="percentage-bar">
                    <div class="bar-fill">
                        <div class="bar-fill-inner" style="width: ${college.placement.percentage}%"></div>
                    </div>
                    <span>${college.placement.percentage}%</span>
                </div>
            </td>
            <td>₹${(college.placement.average / 100000).toFixed(1)}L</td>
            <td>
                <span class="rating-stars">${'⭐'.repeat(Math.round(college.rating))}</span>
                ${college.rating}/5
            </td>
        </tr>
    `).join('');
}

function populateReviewsTable() {
    const tbody = document.querySelector('#reviewsTable tbody');
    
    const reviews = [
        { student: 'Rahul Kumar', college: 'IIT Delhi', rating: 5, review: 'Excellent faculty and world-class infrastructure', date: '2024-03-15' },
        { student: 'Priya Sharma', college: 'IIT Bombay', rating: 5, review: 'Great placement opportunities and industry exposure', date: '2024-03-14' },
        { student: 'Amit Patel', college: 'BITS Pilani', rating: 4, review: 'Good campus culture and research facilities', date: '2024-03-13' },
        { student: 'Sneha Reddy', college: 'NIT Trichy', rating: 4, review: 'Strong technical programs with dedicated professors', date: '2024-03-12' },
        { student: 'Vikram Singh', college: 'IIT Madras', rating: 5, review: 'Outstanding placement record and alumni network', date: '2024-03-11' },
        { student: 'Anjali Gupta', college: 'DTU Delhi', rating: 4, review: 'Affordable fees with good placement support', date: '2024-03-10' },
        { student: 'Karthik Nair', college: 'VIT Vellore', rating: 4, review: 'Modern campus with diverse student community', date: '2024-03-09' },
        { student: 'Neha Joshi', college: 'Manipal University', rating: 4, review: 'Well-rounded education with focus on practical skills', date: '2024-03-08' }
    ];
    
    tbody.innerHTML = reviews.map(review => `
        <tr>
            <td>${review.student}</td>
            <td>${review.college}</td>
            <td><span class="rating-stars">${'⭐'.repeat(review.rating)}</span></td>
            <td><span class="review-text" title="${review.review}">${review.review}</span></td>
            <td>${new Date(review.date).toLocaleDateString()}</td>
        </tr>
    `).join('');
}

// Filter functionality
function setupFilterListeners() {
    // Add event listeners to filter dropdowns
    document.getElementById('yearFilter').addEventListener('change', applyFilters);
    document.getElementById('programFilter').addEventListener('change', applyFilters);
    document.getElementById('regionFilter').addEventListener('change', applyFilters);
    
    document.querySelectorAll('.toggle-small').forEach(btn => {
        btn.addEventListener('click', function() {
            this.parentElement.querySelectorAll('.toggle-small').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    document.querySelectorAll('.metric-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            this.parentElement.querySelectorAll('.metric-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

function applyFilters() {
    currentFilters.year = document.getElementById('yearFilter').value;
    currentFilters.program = document.getElementById('programFilter').value;
    currentFilters.region = document.getElementById('regionFilter').value;
    
    showLoadingOverlay();
    
    setTimeout(() => {
        // Filter the data
        filterData();
        
        // Update stat cards
        const statCards = document.querySelectorAll('.stat-card');
        statCards.forEach(card => card.classList.add('loading'));
        animateStatCards();
        
        // Update all charts with filtered data
        updateChartsWithFilters();
        
        // Update tables
        populateTables();
        
        hideLoadingOverlay();
        showNotification(`Filters applied: ${currentFilters.year} | ${currentFilters.program} | ${currentFilters.region}`, 'success');
    }, 800);
}

function resetFilters() {
    document.getElementById('yearFilter').value = '2024';
    document.getElementById('programFilter').value = 'all';
    document.getElementById('regionFilter').value = 'all';
    
    currentFilters = {
        year: '2024',
        program: 'all',
        region: 'all'
    };
    
    showLoadingOverlay();
    
    setTimeout(() => {
        // Reset data
        filterData();
        
        // Update stat cards
        const statCards = document.querySelectorAll('.stat-card');
        statCards.forEach(card => card.classList.add('loading'));
        animateStatCards();
        
        // Update all charts
        updateChartsWithFilters();
        
        // Update tables
        populateTables();
        
        hideLoadingOverlay();
        showNotification('Filters reset to default', 'info');
    }, 800);
}

function updateChartsWithFilters() {
    // Recreate all charts with new filtered data
    createPlacementTrendChart();
    createTopCompaniesChart();
    createCollegeRankingsChart();
    createProgramDistributionChart();
    createSalaryDistributionChart();
    createRegionalAnalysisChart();
    createSatisfactionChart();
}

function exportTable(type) {
    showNotification(`Exporting ${type} data...`, 'info');
    
    setTimeout(() => {
        showNotification(`${type} exported successfully!`, 'success');
    }, 1000);
}

function showNotification(message, type) {
    const toast = document.createElement('div');
    toast.className = 'toast show';
    toast.style.cssText = `
        position: fixed;
        top: 2rem;
        right: 2rem;
        padding: 1rem 1.5rem;
        background: var(--card);
        border-radius: 0.5rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        max-width: 300px;
        animation: slideIn 0.3s ease;
    `;
    
    if (type === 'success') {
        toast.style.borderLeft = '4px solid #10b981';
    } else if (type === 'error') {
        toast.style.borderLeft = '4px solid #ef4444';
    } else {
        toast.style.borderLeft = '4px solid #667eea';
    }
    
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}
