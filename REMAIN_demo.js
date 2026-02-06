// ===== CONSTANTS =====
const TOTAL_BUDGET = 1000000;
const STARTING_CAPITAL = 200000;
const SIMULATION_MONTHS = 120; // 10 years
const MAX_WASTE = 1000; // tons

// ===== SCENARIO DEFINITIONS =====
const SCENARIOS = [
    {
        id: 'optimistic',
        name: '🌈 Optimistic (Utopia)',
        description: 'Infinite cheap resources, no waste regulations, stable high demand. The traditional manufacturing dream.',
        materialCostMultiplier: 0.8,
        materialCostGrowth: 0.001, // 0.1% monthly growth
        wasteTaxPerTon: 0,
        wasteTaxGrowth: 0,
        demandBase: 120,
        demandVolatility: 0.02,
        circularDemandBonus: 0
    },
    {
        id: 'moderate',
        name: '📊 Business as Usual',
        description: 'Gradual resource inflation, emerging sustainability awareness, steady market growth.',
        materialCostMultiplier: 1.0,
        materialCostGrowth: 0.005, // 0.5% monthly
        wasteTaxPerTon: 500,
        wasteTaxGrowth: 0.01, // grows over time
        demandBase: 100,
        demandVolatility: 0.05,
        circularDemandBonus: 0.1
    },
    {
        id: 'transition',
        name: '🔄 Green Transition',
        description: 'Resource prices spike mid-simulation, moderate waste taxes, growing demand for sustainable products.',
        materialCostMultiplier: 1.0,
        materialCostGrowth: 0.01, // 1% monthly
        wasteTaxPerTon: 2000,
        wasteTaxGrowth: 0.02,
        demandBase: 100,
        demandVolatility: 0.08,
        circularDemandBonus: 0.25
    },
    {
        id: 'critical',
        name: '⚠️ Resource Crisis',
        description: 'Materials become scarce and expensive, strict waste laws enforced, supply chains disrupted. Circular strategies thrive.',
        materialCostMultiplier: 1.5,
        materialCostGrowth: 0.02, // 2% monthly
        wasteTaxPerTon: 5000,
        wasteTaxGrowth: 0.03,
        demandBase: 80,
        demandVolatility: 0.15,
        circularDemandBonus: 0.5
    }
];

// ===== DOM ELEMENTS =====
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
const initialMessage = document.getElementById('initialMessage');
const loadingSpinner = document.getElementById('loadingSpinner');
const scenarioResults = document.getElementById('scenarioResults');

// ===== BUDGET MANAGEMENT =====
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

Object.keys(sliders).forEach(key => {
    sliders[key].addEventListener('input', updateBudget);
});

// ===== SIMULATION ENGINE =====
function runScenario(investments, scenario) {
    let balance = STARTING_CAPITAL + (TOTAL_BUDGET - Object.values(investments).reduce((a, b) => a + b, 0));
    let waste = 0;
    let materialCost = scenario.materialCostMultiplier;
    let wasteTax = scenario.wasteTaxPerTon;
    let demand = scenario.demandBase;
    const balanceHistory = [balance];
    let bankruptMonth = null;
    let wasteShutdownMonth = null;

    for (let month = 1; month <= SIMULATION_MONTHS; month++) {
        // Update market conditions with randomness
        materialCost *= (1 + scenario.materialCostGrowth + (Math.random() - 0.5) * 0.01);
        wasteTax *= (1 + scenario.wasteTaxGrowth);
        demand = scenario.demandBase + (Math.random() - 0.5) * scenario.demandVolatility * 100;
        demand = Math.max(50, Math.min(150, demand)); // Clamp demand

        // Calculate monthly economics
        const monthlyFactor = 1 / 12;
        
        // Traditional manufacturing
        const traditionalCapacity = (investments.traditional / 10000) * monthlyFactor;
        const traditionalMaterialCost = traditionalCapacity * 150 * materialCost;
        const traditionalWaste = traditionalCapacity * 0.8; // High waste
        const traditionalRevenue = traditionalCapacity * 800 * (demand / 100);

        // Detection systems improve quality (reduce defects)
        const detectionLevel = investments.detection / TOTAL_BUDGET;
        const qualityMultiplier = 0.6 + (detectionLevel * 0.4); // 60% to 100% quality

        // Circular manufacturing (robotics + eco-design)
        const roboticsCapacity = (investments.robotics / 10000) * monthlyFactor;
        const ecodesignEfficiency = 0.3 + (investments.ecodesign / TOTAL_BUDGET) * 0.6; // 30% to 90% material recovery
        
        const circularMaterialCost = roboticsCapacity * 50 * materialCost * (1 - ecodesignEfficiency);
        const circularWaste = roboticsCapacity * 0.2 * (1 - ecodesignEfficiency); // Much lower waste
        const circularDemandMultiplier = 1 + scenario.circularDemandBonus; // Premium for sustainable products
        const circularRevenue = roboticsCapacity * 700 * (demand / 100) * circularDemandMultiplier;

        // Operating costs
        const operatingCosts = ((investments.traditional * 0.04) + (investments.robotics * 0.06)) * monthlyFactor;

        // Total calculations
        const totalRevenue = (traditionalRevenue + circularRevenue) * qualityMultiplier;
        const totalMaterialCost = traditionalMaterialCost + circularMaterialCost;
        const monthWaste = traditionalWaste + circularWaste;
        const wasteDisposalCost = monthWaste * wasteTax;
        const totalCosts = totalMaterialCost + operatingCosts + wasteDisposalCost;

        const netProfit = totalRevenue - totalCosts;
        balance += netProfit;
        waste += monthWaste;

        // Check failure conditions
        if (balance <= 0 && bankruptMonth === null) {
            bankruptMonth = month;
            balance = 0;
        }

        if (waste >= MAX_WASTE && wasteShutdownMonth === null) {
            wasteShutdownMonth = month;
        }

        balanceHistory.push(balance);
    }

    return {
        finalBalance: balance,
        totalWaste: waste,
        balanceHistory,
        bankruptMonth,
        wasteShutdownMonth,
        survived: bankruptMonth === null && wasteShutdownMonth === null,
        profit: balance - STARTING_CAPITAL
    };
}

function runAllScenarios() {
    const investments = {
        traditional: (sliders.traditional.value / 100) * TOTAL_BUDGET,
        detection: (sliders.detection.value / 100) * TOTAL_BUDGET,
        robotics: (sliders.robotics.value / 100) * TOTAL_BUDGET,
        ecodesign: (sliders.ecodesign.value / 100) * TOTAL_BUDGET
    };

    // Disable controls
    Object.values(sliders).forEach(s => s.disabled = true);
    startBtn.disabled = true;

    // Show loading
    initialMessage.style.display = 'none';
    loadingSpinner.style.display = 'block';
    scenarioResults.innerHTML = '';

    // Run scenarios with slight delay for visual effect
    setTimeout(() => {
        const results = SCENARIOS.map(scenario => ({
            scenario,
            result: runScenario(investments, scenario)
        }));

        displayResults(results, investments);
        loadingSpinner.style.display = 'none';
    }, 800);
}

// ===== DISPLAY RESULTS =====
function displayResults(results, investments) {
    scenarioResults.innerHTML = '';
    
    results.forEach(({ scenario, result }) => {
        const card = document.createElement('div');
        let cardClass = 'scenario-card';
        
        if (result.survived && result.profit > 100000) {
            cardClass += ' success';
        } else if (!result.survived) {
            cardClass += ' danger';
        } else if (result.profit < 0) {
            cardClass += ' warning';
        }
        
        card.className = cardClass;

        let verdictText = '';
        let verdictIcon = '';
        
        if (!result.survived) {
            if (result.bankruptMonth) {
                verdictIcon = '💀';
                verdictText = `Bankrupt at month ${result.bankruptMonth}`;
            } else {
                verdictIcon = '☠️';
                verdictText = `Shut down for waste at month ${result.wasteShutdownMonth}`;
            }
        } else if (result.profit > 200000) {
            verdictIcon = '🏆';
            verdictText = 'Excellent! Thriving business';
        } else if (result.profit > 50000) {
            verdictIcon = '✅';
            verdictText = 'Good! Profitable operation';
        } else if (result.profit > 0) {
            verdictIcon = '🔸';
            verdictText = 'Marginal profit, could do better';
        } else {
            verdictIcon = '⚠️';
            verdictText = 'Survived but lost money';
        }

        const profitClass = result.profit >= 0 ? 'positive' : 'negative';
        const wastePercent = Math.round((result.totalWaste / MAX_WASTE) * 100);

        card.innerHTML = `
            <div class="scenario-name">${scenario.name}</div>
            <div class="scenario-desc">${scenario.description}</div>
            <div class="scenario-stat">
                <span class="scenario-stat-label">Final Balance:</span>
                <span class="scenario-stat-value ${profitClass}">€${Math.round(result.finalBalance).toLocaleString()}</span>
            </div>
            <div class="scenario-stat">
                <span class="scenario-stat-label">10-Year Profit:</span>
                <span class="scenario-stat-value ${profitClass}">${result.profit >= 0 ? '+' : ''}€${Math.round(result.profit).toLocaleString()}</span>
            </div>
            <div class="scenario-stat">
                <span class="scenario-stat-label">Total Waste:</span>
                <span class="scenario-stat-value ${wastePercent > 80 ? 'negative' : ''}">${Math.round(result.totalWaste)} tons (${wastePercent}%)</span>
            </div>
            <div class="scenario-verdict" style="border-left-color: ${result.survived ? (result.profit > 0 ? '#00d084' : '#ffd700') : '#ff6b6b'}">
                ${verdictIcon} ${verdictText}
            </div>
        `;

        scenarioResults.appendChild(card);
    });

    // Add summary
    const successCount = results.filter(r => r.result.survived).length;
    const avgProfit = results.reduce((sum, r) => sum + r.result.profit, 0) / results.length;
    
    const summary = document.createElement('div');
    summary.style.cssText = 'margin-top: 20px; padding: 20px; background: rgba(100, 255, 218, 0.1); border-radius: 10px; border: 1px solid #64ffda;';
    
    let summaryText = '';
    if (successCount === 4 && avgProfit > 100000) {
        summaryText = '🌟 <strong>Outstanding!</strong> Your strategy is resilient across all scenarios with excellent returns.';
    } else if (successCount === 4) {
        summaryText = '✅ <strong>Robust strategy!</strong> Your business survives all scenarios. Consider optimizing for higher profits.';
    } else if (successCount >= 2) {
        summaryText = '⚠️ <strong>Vulnerable strategy.</strong> Your business fails in ' + (4 - successCount) + ' scenario(s). Consider more circular investments.';
    } else {
        summaryText = '❌ <strong>High-risk strategy!</strong> Traditional manufacturing alone is not resilient. Try investing in robotics and eco-design.';
    }
    
    summary.innerHTML = `
        <div style="margin-bottom: 10px; font-size: 1.1rem;">${summaryText}</div>
        <div style="color: #a0a0a0; font-size: 0.9rem;">
            Survived: ${successCount}/4 scenarios | Average Profit: €${Math.round(avgProfit).toLocaleString()}
        </div>
    `;
    
    scenarioResults.appendChild(summary);
}

// ===== RESET =====
function reset() {
    Object.values(sliders).forEach(s => {
        s.value = 0;
        s.disabled = false;
    });
    
    startBtn.disabled = false;
    updateBudget();
    
    initialMessage.style.display = 'block';
    loadingSpinner.style.display = 'none';
    scenarioResults.innerHTML = '';
}

// ===== EVENT LISTENERS =====
startBtn.addEventListener('click', runAllScenarios);
resetBtn.addEventListener('click', reset);

// ===== INITIALIZE =====
updateBudget();
