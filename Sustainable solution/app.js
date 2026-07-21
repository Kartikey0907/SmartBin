// ===== SmartBin AI - Main Application =====

document.addEventListener('DOMContentLoaded', () => {

    // ===== Utility =====
    const formatTime = () => {
        const now = new Date();
        return now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    };

    const getRandom = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    const getRandomFloat = (min, max, decimals = 1) => {
        return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
    };

    const wasteTypes = [
        { name: 'Food scraps', category: 'wet', icon: '🍎' },
        { name: 'Vegetable peels', category: 'wet', icon: '🥬' },
        { name: 'Tea leaves', category: 'wet', icon: '🫖' },
        { name: 'Leftover rice', category: 'wet', icon: '🍚' },
        { name: 'Fruit waste', category: 'wet', icon: '🍌' },
        { name: 'Paper cup', category: 'dry', icon: '🥤' },
        { name: 'Cardboard box', category: 'dry', icon: '📦' },
        { name: 'Newspaper', category: 'dry', icon: '📰' },
        { name: 'Plastic bottle', category: 'plastic', icon: '🧴' },
        { name: 'Plastic wrapper', category: 'plastic', icon: '🛍️' },
        { name: 'PET bottle', category: 'plastic', icon: '🍾' },
        { name: 'Aluminum can', category: 'plastic', icon: '🥫' },
        { name: 'Plastic bag', category: 'plastic', icon: '🛒' },
        { name: 'Paper napkin', category: 'dry', icon: '🧻' },
        { name: 'Egg shells', category: 'wet', icon: '🥚' },
        { name: 'Glass bottle', category: 'plastic', icon: '🍶' },
    ];

    const binConfigs = {
        wet: {
            fillLevel: 62,
            deposits: 47,
            contamination: 12,
            complianceRate: 88,
            color: '#10b981'
        },
        dry: {
            fillLevel: 45,
            deposits: 38,
            contamination: 8,
            complianceRate: 92,
            color: '#f59e0b'
        },
        plastic: {
            fillLevel: 78,
            deposits: 53,
            contamination: 18,
            complianceRate: 82,
            color: '#06b6d4'
        }
    };

    const activityTypes = {
        compliant: {
            icon: 'fa-check-circle',
            class: 'compliant',
            prefix: '✅ Correct disposal:'
        },
        'non-compliant': {
            icon: 'fa-times-circle',
            class: 'non-compliant',
            prefix: '⚠️ Alert:'
        }
    };

    // ===== Chart.js Configuration =====
    Chart.defaults.color = '#94a3b8';
    Chart.defaults.borderColor = 'rgba(148, 163, 184, 0.1)';
    Chart.defaults.font.family = "'Inter', sans-serif";

    // --- Hourly Deposition Chart ---
    const hourlyCtx = document.getElementById('hourlyChart').getContext('2d');

    const hours = ['6AM', '7', '8', '9', '10', '11', '12PM', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'];
    const generateHourlyData = () => {
        // Generate realistic hourly data with peaks at meal times
        const baseData = [2, 5, 12, 8, 6, 10, 28, 22, 8, 5, 4, 6, 10, 32, 24, 14, 8, 3];
        return baseData.map(v => v + getRandom(-3, 3));
    };

    let hourlyData = generateHourlyData();

    const hourlyChart = new Chart(hourlyCtx, {
        type: 'bar',
        data: {
            labels: hours,
            datasets: [
                {
                    label: 'Wet Waste',
                    data: hourlyData.map(v => Math.round(v * 0.45)),
                    backgroundColor: 'rgba(16, 185, 129, 0.6)',
                    borderColor: 'rgba(16, 185, 129, 0.8)',
                    borderWidth: 1,
                    borderRadius: 4,
                },
                {
                    label: 'Dry Waste',
                    data: hourlyData.map(v => Math.round(v * 0.3)),
                    backgroundColor: 'rgba(245, 158, 11, 0.6)',
                    borderColor: 'rgba(245, 158, 11, 0.8)',
                    borderWidth: 1,
                    borderRadius: 4,
                },
                {
                    label: 'Plastic/Recyclable',
                    data: hourlyData.map(v => Math.round(v * 0.25)),
                    backgroundColor: 'rgba(6, 182, 212, 0.6)',
                    borderColor: 'rgba(6, 182, 212, 0.8)',
                    borderWidth: 1,
                    borderRadius: 4,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { padding: 16, usePointStyle: true }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { font: { size: 10 } }
                },
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(148, 163, 184, 0.05)' },
                    ticks: { font: { size: 10 } }
                }
            }
        }
    });

    // --- Composition Chart ---
    const compositionCtx = document.getElementById('compositionChart').getContext('2d');
    const compositionChart = new Chart(compositionCtx, {
        type: 'doughnut',
        data: {
            labels: ['Wet Waste (Compostable)', 'Dry Waste', 'Plastic/Recyclable', 'Contamination'],
            datasets: [{
                data: [42, 28, 22, 8],
                backgroundColor: [
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(6, 182, 212, 0.8)',
                    'rgba(239, 68, 68, 0.6)'
                ],
                borderColor: [
                    'rgba(16, 185, 129, 1)',
                    'rgba(245, 158, 11, 1)',
                    'rgba(6, 182, 212, 1)',
                    'rgba(239, 68, 68, 0.8)'
                ],
                borderWidth: 2,
                hoverOffset: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { padding: 12, usePointStyle: true, font: { size: 9 } }
                }
            }
        }
    });

    // --- Compliance Trend Chart ---
    const complianceCtx = document.getElementById('complianceChart').getContext('2d');
    const complianceLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    const complianceChart = new Chart(complianceCtx, {
        type: 'line',
        data: {
            labels: complianceLabels,
            datasets: [
                {
                    label: 'Compliance Rate %',
                    data: [72, 78, 85, 89],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#10b981',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { padding: 12, usePointStyle: true, font: { size: 10 } }
                }
            },
            scales: {
                y: {
                    min: 60,
                    max: 100,
                    grid: { color: 'rgba(148, 163, 184, 0.05)' },
                    ticks: { font: { size: 10 }, callback: v => v + '%' }
                },
                x: {
                    grid: { display: false },
                    ticks: { font: { size: 10 } }
                }
            }
        }
    });

    // ===== Chart Period Switching =====
    document.querySelectorAll('.chart-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            const period = this.dataset.period;
            if (period === 'day') {
                hourlyData = generateHourlyData();
            } else if (period === 'week') {
                hourlyData = Array.from({ length: 18 }, () => getRandom(5, 40));
            } else {
                hourlyData = Array.from({ length: 18 }, () => getRandom(3, 55));
            }

            hourlyChart.data.datasets[0].data = hourlyData.map(v => Math.round(v * 0.45));
            hourlyChart.data.datasets[1].data = hourlyData.map(v => Math.round(v * 0.3));
            hourlyChart.data.datasets[2].data = hourlyData.map(v => Math.round(v * 0.25));
            hourlyChart.update('none');
        });
    });

    // ===== Hero Stat Counters =====
    const animateCounter = (elementId, target, suffix = '') => {
        const el = document.getElementById(elementId);
        if (!el) return;
        const duration = 2000;
        const steps = 60;
        const increment = target / steps;
        let current = 0;
        let step = 0;

        const timer = setInterval(() => {
            step++;
            current = Math.min(increment * step, target);
            if (elementId === 'statCompliance') {
                el.innerHTML = Math.round(current) + '<span>%</span>';
            } else if (elementId === 'statCO2e') {
                el.innerHTML = current.toFixed(1) + '<span>t</span>';
            } else {
                el.textContent = Math.round(current) + suffix;
            }
            if (step >= steps) {
                clearInterval(timer);
                if (elementId === 'statCompliance') {
                    el.innerHTML = target + '<span>%</span>';
                } else if (elementId === 'statCO2e') {
                    el.innerHTML = target.toFixed(1) + '<span>t</span>';
                } else {
                    el.textContent = target + suffix;
                }
            }
        }, duration / steps);
    };

    setTimeout(() => {
        animateCounter('statDiverted', 1427, 'kg');
        animateCounter('statCompliance', 87);
        animateCounter('statInterventions', 312);
        animateCounter('statCO2e', 12.4);
    }, 500);

    // ===== Bin Simulation =====
    let eventCount = 0;
    const activityList = document.getElementById('activityList');
    const activityCount = document.getElementById('activityCount');

    const addActivity = (type, binName, wasteName, location) => {
        eventCount++;
        activityCount.textContent = `${eventCount} events today`;

        const activity = activityTypes[type];
        const time = formatTime();
        const item = document.createElement('div');
        item.className = `activity-item ${activity.class}`;
        item.innerHTML = `
            <i class="fas ${activity.icon}"></i>
            <span><strong>${activity.prefix}</strong> ${wasteName} → ${binName} at ${location}</span>
            <span class="activity-time">${time}</span>
        `;

        // Remove placeholder if exists
        const placeholder = activityList.querySelector('.placeholder');
        if (placeholder) placeholder.remove();

        // Add to top
        activityList.insertBefore(item, activityList.firstChild);

        // Limit items
        while (activityList.children.length > 50) {
            activityList.removeChild(activityList.lastChild);
        }
    };

    const updateBinStats = (binType) => {
        const config = binConfigs[binType];
        const depositsEl = document.getElementById(`deposits-${binType}`);
        const fillBar = document.getElementById(`fillLevel-${binType}`);
        const fillValue = document.getElementById(`fillValue-${binType}`);
        const contaminationEl = document.getElementById(`contamination-${binType}`);

        if (depositsEl) depositsEl.textContent = config.deposits;
        if (fillBar) fillBar.style.width = config.fillLevel + '%';
        if (fillValue) fillValue.textContent = config.fillLevel + '%';
        if (contaminationEl) contaminationEl.textContent = config.contamination + '%';
    };

    const triggerDetection = (binType, isCompliant) => {
        const detectionBox = document.getElementById(`detectionBox-${binType}`);
        const feedback = document.getElementById(`feedback-${binType}`);
        const binCard = document.querySelector(`.bin-card[data-bin="${binType}"]`);

        if (!detectionBox) return;

        // Random position for detection box
        const left = getRandom(15, 65);
        const top = getRandom(15, 55);
        const width = getRandom(20, 40);
        const height = getRandom(20, 40);

        detectionBox.style.left = left + '%';
        detectionBox.style.top = top + '%';
        detectionBox.style.width = width + '%';
        detectionBox.style.height = height + '%';
        detectionBox.classList.remove('active', 'danger');
        detectionBox.offsetHeight; // Trigger reflow
        detectionBox.classList.add('active');

        if (!isCompliant) {
            detectionBox.classList.add('danger');
            binCard.classList.add('alert-active');
            setTimeout(() => binCard.classList.remove('alert-active'), 3000);
        }

        // Update feedback
        if (isCompliant) {
            feedback.className = 'bin-feedback success';
            feedback.innerHTML = '<i class="fas fa-check-circle"></i><span>Correct disposal detected ✓</span>';
        } else {
            feedback.className = 'bin-feedback danger';
            feedback.innerHTML = '<i class="fas fa-exclamation-triangle"></i><span>⚠️ Incorrect disposal! Please use correct bin.</span>';
        }

        setTimeout(() => {
            detectionBox.classList.remove('active', 'danger');
        }, 1500);
    };

    const simulateDisposal = () => {
        const binTypes = ['wet', 'dry', 'plastic'];
        const binType = binTypes[getRandom(0, 2)];
        const config = binConfigs[binType];

        // Get a waste item (sometimes from wrong category to trigger alert)
        const isCompliant = Math.random() < (config.complianceRate / 100);
        let wasteItem;

        if (isCompliant) {
            // Pick from correct category
            const correctItems = wasteTypes.filter(w => w.category === binType);
            wasteItem = correctItems[getRandom(0, correctItems.length - 1)];
        } else {
            // Pick from wrong category
            const wrongItems = wasteTypes.filter(w => w.category !== binType);
            wasteItem = wrongItems[getRandom(0, wrongItems.length - 1)];
        }

        // Update stats
        config.deposits += 1;
        config.fillLevel = Math.min(100, config.fillLevel + getRandomFloat(0.5, 2.5));

        // Recalculate contamination
        const totalEvents = config.deposits;
        const badEvents = Math.round(totalEvents * (config.contamination / 100));
        if (!isCompliant) {
            config.contamination = parseFloat((((badEvents + 1) / totalEvents) * 100).toFixed(1));
        } else {
            config.contamination = parseFloat(((badEvents / totalEvents) * 100).toFixed(1));
        }
        config.contamination = Math.min(100, Math.max(0, config.contamination));
        config.complianceRate = Math.round(100 - config.contamination);

        const binNames = { wet: 'Wet Waste Bin', dry: 'Dry Waste Bin', plastic: 'Plastic/Recyclable Bin' };
        const locations = { wet: 'Hostel A - Mess', dry: 'Hostel B - Cafeteria', plastic: 'Main Cafeteria' };

        // Trigger visual feedback
        triggerDetection(binType, isCompliant);

        // Add activity
        addActivity(
            isCompliant ? 'compliant' : 'non-compliant',
            binNames[binType],
            `${wasteItem.icon} ${wasteItem.name}`,
            locations[binType]
        );

        // Update bin stats in UI
        updateBinStats(binType);

        // Update hero stats periodically
        if (eventCount % 3 === 0) {
            const totalDiverted = Object.values(binConfigs).reduce((sum, c) => sum + c.deposits * getRandomFloat(0.1, 0.3), 0);
            const statDiverted = document.getElementById('statDiverted');
            if (statDiverted) {
                const current = parseInt(statDiverted.textContent) || 1427;
                statDiverted.textContent = current + Math.round(totalDiverted * 0.1);
            }

            const statCompliance = document.getElementById('statCompliance');
            if (statCompliance) {
                const avgCompliance = Math.round(Object.values(binConfigs).reduce((sum, c) => sum + c.complianceRate, 0) / 3);
                statCompliance.innerHTML = avgCompliance + '<span>%</span>';
            }

            const statInterventions = document.getElementById('statInterventions');
            if (statInterventions) {
                const current = parseInt(statInterventions.textContent) || 312;
                statInterventions.textContent = current + 1;
            }
        }

        // Update impact counters
        if (eventCount % 5 === 0) {
            const landfillEl = document.getElementById('impactLandfill');
            const compostEl = document.getElementById('impactCompost');
            const methaneEl = document.getElementById('impactMethane');
            const costEl = document.getElementById('impactCost');

            if (landfillEl) {
                const val = parseInt(landfillEl.textContent.replace(/[^0-9]/g, '')) || 0;
                landfillEl.textContent = val + getRandom(1, 4);
            }
            if (compostEl) {
                const val = parseInt(compostEl.textContent.replace(/[^0-9]/g, '')) || 0;
                compostEl.textContent = val + getRandom(1, 3);
            }
            if (methaneEl) {
                const val = parseFloat(methaneEl.textContent) || 0;
                methaneEl.textContent = (val + getRandomFloat(0.1, 0.5)).toFixed(1);
            }
            if (costEl) {
                const val = parseInt(costEl.textContent.replace(/[^0-9]/g, '')) || 0;
                costEl.textContent = '₹' + (val + getRandom(50, 200)).toLocaleString();
            }
        }
    };

    // ===== Start Simulation =====
    let simulationInterval;

    const startSimulation = () => {
        // Generate initial activity
        for (let i = 0; i < 8; i++) {
            setTimeout(() => simulateDisposal(), i * 400);
        }
        // Continuous simulation
        simulationInterval = setInterval(simulateDisposal, getRandom(2000, 5000));
    };

    startSimulation();

    // ===== Navbar Scroll Effect =====
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // ===== Mobile Nav Toggle =====
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('open');
        const icon = navToggle.querySelector('i');
        if (navLinks.classList.contains('open')) {
            icon.className = 'fas fa-times';
        } else {
            icon.className = 'fas fa-bars';
        }
    });

    // Close nav on link click
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('open');
            const icon = navToggle.querySelector('i');
            icon.className = 'fas fa-bars';

            // Update active link
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });

    // ===== Active nav on scroll (Intersection Observer) =====
    const sections = document.querySelectorAll('section[id]');
    const observerOptions = {
        rootMargin: '-50% 0px -50% 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + id) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));

    // ===== Smooth scroll for anchor links (fallback) =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    console.log('🚀 SmartBin AI System Online');
    console.log('📡 Edge AI Vision Active');
    console.log('🌱 Making campuses smarter, one bin at a time.');
});