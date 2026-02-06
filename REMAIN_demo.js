// Constants
const TOTAL_BUDGET = 1000000;
const STARTING_CAPITAL = 200000;
const MAX_WASTE = 1000;
const SIMULATION_MONTHS = 120;
const MONTHS_PER_ADVANCE = 4;

// State
let gameState = {
    month: 0,
    bankBalance: STARTING_CAPITAL,
    wasteAccumulated: 0,
    investments: {
        traditional: 0,
        detection: 0,
        robotics: 0,
        ecodesign: 0
    },
    history: {
        balance: [],
        waste: []
    },
    isRunning: false,
    simulationTimer: null
};

// Market conditions
let marketConditions = {
    rawMaterialCost: 1.0,
    wasteTax: 0,
    demand: 100
};

// DOM Elements
const sliders = {
    traditional: document.getElementById('traditionalSlider'),
    detection: document.getElementById('detectionSlider'),
    robotics: document.getElementById('roboticsSlider'),
    ecodesign: document.getElementById('ecodesignSlider')
};

const valueDisplays = {
    traditional: document.getElementById('traditionalValue'),
    detection: document.getElementById('detectionValue'),
    robotics: document.getElementById('roboticsValue'),
    ecodesign: document.getElementById('ecodesignValue')
};

const fundsRemaining = document.getElementById('fundsRemaining');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const advanceBtn = document.getElementById('advanceBtn');
const eventLog = document.getElementById('eventLog');
const currentMonthDisplay = document.getElementById('currentMonth');
const bankBalanceDisplay = document.getElementById('bankBalance');
const totalWasteDisplay = document.getElementById('totalWaste');
const wasteMeterFill = document.getElementById('wasteMeterFill');
const wasteMeterLabel = document.getElementById('wasteMeterLabel');
const profitCanvas = document.getElementById('profitChart');
const profitCtx = profitCanvas.getContext('2d');
const gameOverOverlay = document.getElementById('gameOverOverlay');
const gameOverPanel = document.getElementById('gameOverPanel');
const gameOverTitle = document.getElementById('gameOverTitle');
const gameOverMessage = document.getElementById('gameOverMessage');
const gameOverStats = document.getElementById('gameOverStats');
const tryAgainBtn = document.getElementById('tryAgainBtn');

// Initialize canvas size
function resizeCanvas() {
    const rect = profitCanvas.getBoundingClientRect();
    profitCanvas.width = rect.width;
    profitCanvas.height = rect.height;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Slider event listeners
Object.keys(sliders).forEach(key => {
    sliders[key].addEventListener('input', updateBudget);
});

function updateBudget() {
    const total = Object.keys(sliders).reduce((sum, key) => {
        return sum + (sliders[key].value / 100) * TOTAL_BUDGET;
    }, 0);

    const remaining = TOTAL_BUDGET - total;

    Object.keys(sliders).forEach(key => {
        const value = (sliders[key].value / 100) * TOTAL_BUDGET;
        valueDisplays[key].textContent = '€' + Math.round(value).toLocaleString();
    });

    fundsRemaining.textContent = 'Funds Remaining: €' + Math.round(remaining).toLocaleString();
    
    if (remaining < 0) {
        fundsRemaining.classList.add('negative');
        startBtn.disabled = true;
    } else {
        fundsRemaining.classList.remove('negative');
        startBtn.disabled = false;
    }
}

startBtn.addEventListener('click', startSimulation);

function startSimulation() {
    if (gameState.isRunning) return;

    Object.values(sliders).forEach(slider => slider.disabled = true);
    startBtn.disabled = true;

    Object.keys(sliders).forEach(key => {
        gameState.investments[key] = (sliders[key].value / 100) * TOTAL_BUDGET;
    });

    const totalInvested = Object.values(gameState.investments).reduce((a, b) => a + b, 0);
    const unusedBudget = TOTAL_BUDGET - totalInvested;
    gameState.bankBalance = STARTING_CAPITAL + unusedBudget;
    
    gameState.month = 0;
    gameState.wasteAccumulated = 0;
    gameState.history.balance = [gameState.bankBalance];
    gameState.history.waste = [0];
    gameState.isRunning = true;

    marketConditions = {
        rawMaterialCost: 1.0,
        wasteTax: 0,
        demand: 100
    };

    logEvent('Simulation started! Click "Advance +4 Months" to progress...', 'success');
    updateDisplay();
    drawChart();

    advanceBtn.disabled = false;
    advanceBtn.style.opacity = '1';
    advanceBtn.style.cursor = 'pointer';
}

advanceBtn.addEventListener('click', advanceTime);

function advanceTime() {
    if (!gameState.isRunning || gameState.month >= SIMULATION_MONTHS) return;

    for (let i = 0; i < MONTHS_PER_ADVANCE; i++) {
        if (gameState.month >= SIMULATION_MONTHS) break;
        
        gameState.month++;
        handleMonthEvents();

        const monthResults = calculateMonthEconomics();
        gameState.bankBalance += monthResults.netProfit;
        gameState.wasteAccumulated += monthResults.wasteGenerated;
        
        if (gameState.bankBalance <= 0) {
            endSimulation('bankrupt');
            return;
        }

        if (gameState.wasteAccumulated >= MAX_WASTE) {
            endSimulation('waste');
            return;
        }
    }

    gameState.history.balance.push(gameState.bankBalance);
    gameState.history.waste.push(gameState.wasteAccumulated);

    const year = Math.floor(gameState.month / 12);
    const month = gameState.month % 12;
    logEvent(`Month ${gameState.month} (Year ${year}, Month ${month}): Balance €${Math.round(gameState.bankBalance).toLocaleString()}`);

    updateDisplay();
    drawChart();

    if (gameState.month >= SIMULATION_MONTHS) {
        endSimulation('win');
    }
}

function handleMonthEvents() {
    if (gameState.month === 36) {
        marketConditions.rawMaterialCost = 2.0;
        logEvent('⚠ CRISIS: Raw material prices have DOUBLED!', 'warning');
    }

    if (gameState.month === 72) {
        marketConditions.wasteTax = 5000;
        logEvent('⚠ NEW REGULATIONS: Waste tax of €5,000/ton introduced!', 'danger');
    }

    if (gameState.month === 108) {
        marketConditions.rawMaterialCost = 3.0;
        logEvent('⚠ SUPPLY CHAIN COLLAPSE: Raw materials now 3x cost! Circular strategies thrive.', 'danger');
    }
}

function calculateMonthEconomics() {
    const inv = gameState.investments;
    const monthlyFactor = 1 / 12;
    
    const traditionalCapacity = (inv.traditional / 10000) * monthlyFactor;
    const traditionalMaterialCost = traditionalCapacity * 100 * marketConditions.rawMaterialCost;
    const traditionalWaste = traditionalCapacity * 0.5;
    
    const detectionLevel = inv.detection / TOTAL_BUDGET;
    const qualityMultiplier = 0.7 + (detectionLevel * 0.3);
    
    const roboticsCapacity = (inv.robotics / 10000) * monthlyFactor;
    const ecodesignYield = 0.3 + (inv.ecodesign / TOTAL_BUDGET) * 0.6;
    
    const circularMaterialCost = roboticsCapacity * 50 * (1 - ecodesignYield);
    const circularWaste = roboticsCapacity * 0.1 * (1 - ecodesignYield);
    
    const totalProduction = (traditionalCapacity + roboticsCapacity) * qualityMultiplier;
    const revenue = totalProduction * 1000 * (marketConditions.demand / 100);
    
    const materialCosts = traditionalMaterialCost + circularMaterialCost;
    const operatingCosts = ((inv.traditional + inv.robotics) * 0.05) * monthlyFactor;
    const wasteTax = (traditionalWaste + circularWaste) * marketConditions.wasteTax;
    const totalCosts = materialCosts + operatingCosts + wasteTax;
    
    const netProfit = revenue - totalCosts;
    const wasteGenerated = traditionalWaste + circularWaste;

    return {
        revenue,
        costs: totalCosts,
        netProfit,
        wasteGenerated,
        materialCosts,
        wasteTax
    };
}

function updateDisplay() {
    currentMonthDisplay.textContent = gameState.month;
    
    bankBalanceDisplay.textContent = '€' + Math.round(gameState.bankBalance).toLocaleString();
    bankBalanceDisplay.className = 'status-value';
    if (gameState.bankBalance > STARTING_CAPITAL) {
        bankBalanceDisplay.classList.add('positive');
    } else if (gameState.bankBalance < 0) {
        bankBalanceDisplay.classList.add('negative');
    }
    
    totalWasteDisplay.textContent = Math.round(gameState.wasteAccumulated) + ' tons';
    
    const wastePercent = (gameState.wasteAccumulated / MAX_WASTE) * 100;
    wasteMeterFill.style.height = Math.min(wastePercent, 100) + '%';
    wasteMeterLabel.textContent = Math.round(wastePercent) + '%';
}

function drawChart() {
    const ctx = profitCtx;
    const width = profitCanvas.width;
    const height = profitCanvas.height;
    const padding = 40;

    ctx.clearRect(0, 0, width, height);

    if (gameState.history.balance.length === 0) return;

    const maxBalance = Math.max(...gameState.history.balance, STARTING_CAPITAL * 1.5);
    const minBalance = Math.min(...gameState.history.balance, 0);
    const range = maxBalance - minBalance;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
        const y = padding + (height - 2 * padding) * (i / 5);
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    if (gameState.history.balance.length > 1) {
        ctx.strokeStyle = '#64ffda';
        ctx.lineWidth = 3;
        ctx.beginPath();

        const stepX = (width - 2 * padding) / (gameState.history.balance.length - 1);
        
        gameState.history.balance.forEach((balance, index) => {
            const x = padding + stepX * index;
            const normalizedValue = (balance - minBalance) / range;
            const y = height - padding - normalizedValue * (height - 2 * padding);

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();

        ctx.fillStyle = '#64ffda';
        gameState.history.balance.forEach((balance, index) => {
            const x = padding + stepX * index;
            const normalizedValue = (balance - minBalance) / range;
            const y = height - padding - normalizedValue * (height - 2 * padding);
            
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    ctx.fillStyle = '#a0a0a0';
    ctx.font = '12px system-ui';
    ctx.textAlign = 'right';
    
    for (let i = 0; i <= 5; i++) {
        const value = minBalance + (range * (5 - i) / 5);
        const y = padding + (height - 2 * padding) * (i / 5);
        ctx.fillText('€' + Math.round(value / 1000) + 'K', padding - 5, y + 4);
    }

    ctx.textAlign = 'center';
    const years = Math.floor(gameState.month / 12);
    ctx.fillText(`Month ${gameState.month} (Year ${years})`, width / 2, height - 10);
}

function logEvent(message, type = '') {
    const entry = document.createElement('div');
    entry.className = 'log-entry ' + type;
    entry.textContent = message;
    eventLog.appendChild(entry);
    eventLog.scrollTop = eventLog.scrollHeight;
}

function endSimulation(reason) {
    gameState.isRunning = false;
    clearTimeout(gameState.simulationTimer);

    const finalBalance = gameState.bankBalance;
    const finalWaste = gameState.wasteAccumulated;

    gameOverPanel.className = 'game-over-panel';
    
    if (reason === 'win') {
        gameOverPanel.classList.add('win');
        gameOverTitle.textContent = '🎉 SUCCESS!';
        gameOverMessage.textContent = 'Your factory survived 10 years! Smart circular investments paid off.';
        logEvent('✓ SIMULATION COMPLETE: Factory thrived!', 'success');
    } else if (reason === 'bankrupt') {
        gameOverPanel.classList.add('lose');
        gameOverTitle.textContent = '💀 BANKRUPT!';
        gameOverMessage.textContent = 'Your factory ran out of money. Better investment strategy needed.';
        logEvent('✗ BANKRUPTCY: Game Over', 'danger');
    } else if (reason === 'waste') {
        gameOverPanel.classList.add('lose');
        gameOverTitle.textContent = '☠️ SHUT DOWN!';
        gameOverMessage.textContent = 'Excessive waste violations! Factory closed by regulators.';
        logEvent('✗ ENVIRONMENTAL SHUTDOWN: Game Over', 'danger');
    }

    const finalYears = Math.floor(gameState.month / 12);
    const finalMonths = gameState.month % 12;
    gameOverStats.innerHTML = `
        <div><span>Duration:</span> <span>${gameState.month} months (${finalYears} years, ${finalMonths} months)</span></div>
        <div><span>Final Balance:</span> <span style="color: ${finalBalance > 0 ? '#00d084' : '#ff6b6b'}">€${Math.round(finalBalance).toLocaleString()}</span></div>
        <div><span>Total Waste:</span> <span style="color: ${finalWaste > MAX_WASTE * 0.8 ? '#ff6b6b' : '#00d084'}">${Math.round(finalWaste)} tons</span></div>
        <div><span>Traditional:</span> <span>€${Math.round(gameState.investments.traditional).toLocaleString()}</span></div>
        <div><span>Detection:</span> <span>€${Math.round(gameState.investments.detection).toLocaleString()}</span></div>
        <div><span>Robotics:</span> <span>€${Math.round(gameState.investments.robotics).toLocaleString()}</span></div>
        <div><span>Eco-Design:</span> <span>€${Math.round(gameState.investments.ecodesign).toLocaleString()}</span></div>
    `;

    gameOverOverlay.classList.add('active');
}

resetBtn.addEventListener('click', resetSimulation);
tryAgainBtn.addEventListener('click', () => {
    gameOverOverlay.classList.remove('active');
    resetSimulation();
});

function resetSimulation() {
    if (gameState.simulationTimer) {
        clearTimeout(gameState.simulationTimer);
    }

    gameState = {
        month: 0,
        bankBalance: STARTING_CAPITAL,
        wasteAccumulated: 0,
        investments: {
            traditional: 0,
            detection: 0,
            robotics: 0,
            ecodesign: 0
        },
        history: {
            balance: [],
            waste: []
        },
        isRunning: false,
        simulationTimer: null
    };

    Object.values(sliders).forEach(slider => {
        slider.value = 0;
        slider.disabled = false;
    });

    updateBudget();
    updateDisplay();
    
    eventLog.innerHTML = '<div class="log-entry">Configure your investments and click START SIMULATION to begin.</div>';

    profitCtx.clearRect(0, 0, profitCanvas.width, profitCanvas.height);
    
    wasteMeterFill.style.height = '0%';
    wasteMeterLabel.textContent = '0%';

    advanceBtn.disabled = true;
    advanceBtn.style.opacity = '0.5';
    advanceBtn.style.cursor = 'not-allowed';

    startBtn.disabled = false;
}

// Initialize
updateBudget();
updateDisplay();
