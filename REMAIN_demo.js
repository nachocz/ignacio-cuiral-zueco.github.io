// ========================================
// REMAIN FACTORY RESILIENCE STRESS TEST
// Multi-Scenario Simulation Engine
// ========================================

// ===== CONSTANTS =====
const TOTAL_BUDGET = 1000000;
const STARTING_CAPITAL = 200000;
const SIMULATION_YEARS = 10;
const MONTHS_PER_YEAR = 12;
const TOTAL_MONTHS = SIMULATION_YEARS * MONTHS_PER_YEAR;

// ===== SCENARIO DEFINITIONS =====
const SCENARIOS = {
    cornucopia: {
        id: 'cornucopia',
        name: '🌈 Cornucopia',
        subtitle: 'Business as Usual',
        description: 'Resources are infinite, climate crisis ignored, consumption unchecked.',
        color: '#00d084',
        lineStyle: 'dashed',
        // Economic parameters
        baseMaterialCost: 1.0,           // €/kg - stays low
        materialGrowthRate: 0.001,       // 0.1% monthly
        wasteBaseTax: 0,                 // No waste tax
        wasteTaxGrowthRate: 0,
        energyCostBase: 0.10,            // €/kWh
        energyVolatility: 0.02,
        demandGrowth: 0.005,             // 0.5% monthly demand growth
        circularPremium: 0,              // No premium for sustainability
        // Event probabilities (monthly)
        supplyShockProb: 0.005,          // 0.5% chance
        regulationEventProb: 0,          // No regulation events
        marketCrashProb: 0.003           // 0.3% chance
    },
    transition: {
        id: 'transition',
        name: '⚖️ Transition',
        subtitle: 'EU Green Deal Path',
        description: 'Volatile markets, gradual green regulations. Current EU trajectory.',
        color: '#ffd700',
        lineStyle: 'solid',
        baseMaterialCost: 1.0,
        materialGrowthRate: 0.008,       // Grows to ~€4 by year 10
        wasteBaseTax: 0,                 // Starts at 0, introduced year 5
        wasteTaxIntroYear: 5,
        wasteTaxAfterIntro: 50,          // €50/ton after introduction
        wasteTaxGrowthRate: 0.02,        // 2% monthly after intro
        energyCostBase: 0.12,
        energyVolatility: 0.15,          // High volatility (geopolitics)
        demandGrowth: 0.003,
        circularPremium: 0.15,           // 15% premium for circular products
        supplyShockProb: 0.02,           // 2% chance
        regulationEventProb: 0.01,       // 1% chance
        marketCrashProb: 0.008
    },
    scarcity: {
        id: 'scarcity',
        name: '⚠️ Scarcity',
        subtitle: 'Resource Crisis',
        description: 'Depletion, aggressive carbon taxes, enforced circularity.',
        color: '#ff6b6b',
        lineStyle: 'solid',
        baseMaterialCost: 2.0,           // Starts higher
        materialGrowthRate: 0.02,        // Exponential growth to €15+
        wasteBaseTax: 200,               // €200/ton from start
        wasteTaxGrowthRate: 0.015,       // Grows to €1000+
        energyCostBase: 0.20,
        energyVolatility: 0.25,
        demandGrowth: -0.002,            // Demand contracts
        circularPremium: 0.40,           // 40% premium for circular
        supplyShockProb: 0.05,           // 5% chance
        regulationEventProb: 0.03,       // 3% new regulations
        marketCrashProb: 0.015
    }
};

// ===== EVENT DEFINITIONS =====
const EVENTS = {
    supplyShock: {
        name: 'Supply Chain Disruption',
        icon: '🚢',
        effect: (state) => { state.materialCostMultiplier *= 1.5; },
        duration: 6,
        message: 'Global supply chain disruption! Material costs +50% for 6 months.'
    },
    energySpike: {
        name: 'Energy Crisis',
        icon: '⚡',
        effect: (state) => { state.energyCostMultiplier *= 2; },
        duration: 4,
        message: 'Energy crisis! Energy costs doubled for 4 months.'
    },
    newRegulation: {
        name: 'Environmental Regulation',
        icon: '📜',
        effect: (state) => { state.wasteTax *= 1.25; },
        duration: -1, // Permanent
        message: 'New environmental law passed! Waste tax increased 25%.'
    },
    marketCrash: {
        name: 'Market Downturn',
        icon: '📉',
        effect: (state) => { state.demandMultiplier *= 0.7; },
        duration: 8,
        message: 'Market crash! Demand down 30% for 8 months.'
    },
    circularIncentive: {
        name: 'Circular Economy Subsidy',
        icon: '💰',
        effect: (state) => { state.circularBonus += 10000; },
        duration: 12,
        message: 'Government subsidy for circular manufacturing! +€10,000/month for 1 year.'
    },
    techBreakthrough: {
        name: 'Technology Breakthrough',
        icon: '🔬',
        effect: (state) => { state.circularEfficiency *= 1.2; },
        duration: -1,
        message: 'R&D breakthrough! Circular efficiency permanently +20%.'
    }
};

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
const loadingStatus = document.getElementById('loadingStatus');
const survivalMatrix = document.getElementById('survivalMatrix');
const scenarioCards = document.getElementById('scenarioCards');
const chartSection = document.getElementById('chartSection');
const eventLogSection = document.getElementById('eventLogSection');
const eventLog = document.getElementById('eventLog');
const verdictSection = document.getElementById('verdictSection');
const profitCanvas = document.getElementById('profitChart');
const investmentSummary = document.getElementById('investmentSummary');
const factoryProfile = document.getElementById('factoryProfile');

let simulationResults = null;
let selectedScenario = null;

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

// ===== FACTORY MODEL =====
class Factory {
    constructor(investments) {
        this.investments = investments;
        
        // Traditional line capacity (units/month)
        this.traditionalCapacity = investments.traditional / 5000;
        
        // Detection effectiveness (0-1)
        this.detectionLevel = investments.detection / TOTAL_BUDGET;
        this.qualityRate = 0.70 + (this.detectionLevel * 0.28); // 70% to 98%
        
        // Circular capacity
        this.circularCapacity = investments.robotics / 8000;
        
        // Material recovery rate (30% base, up to 85% with eco-design)
        this.recoveryRate = 0.30 + (investments.ecodesign / TOTAL_BUDGET) * 0.55;
        
        // Operating costs per month (as fraction of investment)
        this.traditionalOpex = investments.traditional * 0.003;
        this.circularOpex = investments.robotics * 0.004;
    }
    
    calculateMonth(marketState) {
        const results = {
            traditionalRevenue: 0,
            circularRevenue: 0,
            materialCosts: 0,
            energyCosts: 0,
            wasteCosts: 0,
            operatingCosts: 0,
            wasteGenerated: 0
        };
        
        // === TRADITIONAL MANUFACTURING ===
        const tradUnits = this.traditionalCapacity * marketState.demandMultiplier;
        const tradMaterialPerUnit = 10; // kg per unit
        const tradWastePerUnit = 3;     // kg waste per unit
        const tradEnergyPerUnit = 5;    // kWh per unit
        const baseUnitPrice = 150;      // € per unit
        
        results.traditionalRevenue = tradUnits * baseUnitPrice * this.qualityRate;
        results.materialCosts += tradUnits * tradMaterialPerUnit * marketState.materialCost;
        results.energyCosts += tradUnits * tradEnergyPerUnit * marketState.energyCost;
        results.wasteGenerated += tradUnits * tradWastePerUnit * (1 - this.detectionLevel * 0.3);
        
        // === CIRCULAR MANUFACTURING ===
        const circUnits = this.circularCapacity * marketState.demandMultiplier;
        const circMaterialPerUnit = 10 * (1 - this.recoveryRate); // Less virgin material needed
        const circWastePerUnit = 0.5 * (1 - this.recoveryRate);   // Much less waste
        const circEnergyPerUnit = 8;    // Higher energy (disassembly + remanufacturing)
        const circPriceMultiplier = 1 + marketState.circularPremium;
        
        results.circularRevenue = circUnits * baseUnitPrice * circPriceMultiplier * this.qualityRate;
        results.materialCosts += circUnits * circMaterialPerUnit * marketState.materialCost;
        results.energyCosts += circUnits * circEnergyPerUnit * marketState.energyCost;
        results.wasteGenerated += circUnits * circWastePerUnit;
        
        // Add circular bonus if applicable
        results.circularRevenue += marketState.circularBonus * (this.circularCapacity / 100);
        
        // === WASTE DISPOSAL ===
        results.wasteCosts = results.wasteGenerated * marketState.wasteTax;
        
        // === OPERATING COSTS ===
        results.operatingCosts = this.traditionalOpex + this.circularOpex;
        
        // === NET PROFIT ===
        results.totalRevenue = results.traditionalRevenue + results.circularRevenue;
        results.totalCosts = results.materialCosts + results.energyCosts + results.wasteCosts + results.operatingCosts;
        results.netProfit = results.totalRevenue - results.totalCosts;
        
        return results;
    }
}

// ===== SIMULATION ENGINE =====
function runScenario(factory, scenario, eventCallback) {
    const history = {
        months: [],
        balance: [STARTING_CAPITAL],
        profit: [0],
        waste: [0],
        events: []
    };
    
    let balance = STARTING_CAPITAL;
    let totalWaste = 0;
    let bankruptMonth = null;
    
    // Market state (modified by events)
    const state = {
        materialCost: scenario.baseMaterialCost,
        materialCostMultiplier: 1,
        wasteTax: scenario.wasteBaseTax,
        energyCost: scenario.energyCostBase,
        energyCostMultiplier: 1,
        demandMultiplier: 1,
        circularPremium: scenario.circularPremium,
        circularBonus: 0,
        circularEfficiency: 1
    };
    
    // Active effects (with remaining duration)
    const activeEffects = [];
    
    for (let month = 1; month <= TOTAL_MONTHS; month++) {
        const year = Math.ceil(month / 12);
        
        // === UPDATE MARKET CONDITIONS ===
        // Material cost growth
        state.materialCost *= (1 + scenario.materialGrowthRate);
        
        // Waste tax (with possible delayed introduction)
        if (scenario.wasteTaxIntroYear && year >= scenario.wasteTaxIntroYear) {
            if (state.wasteTax === 0) {
                state.wasteTax = scenario.wasteTaxAfterIntro;
                history.events.push({
                    month, scenario: scenario.id, icon: '📜',
                    message: `Year ${year}: Waste tax introduced at €${scenario.wasteTaxAfterIntro}/ton`
                });
            }
            state.wasteTax *= (1 + scenario.wasteTaxGrowthRate);
        } else if (!scenario.wasteTaxIntroYear) {
            state.wasteTax *= (1 + (scenario.wasteTaxGrowthRate || 0));
        }
        
        // Energy volatility
        const energyShock = 1 + (Math.random() - 0.5) * scenario.energyVolatility;
        state.energyCost = scenario.energyCostBase * energyShock * state.energyCostMultiplier;
        
        // Demand growth
        state.demandMultiplier *= (1 + scenario.demandGrowth);
        state.demandMultiplier = Math.max(0.3, Math.min(2, state.demandMultiplier));
        
        // === RANDOM EVENTS ===
        // Supply shock
        if (Math.random() < scenario.supplyShockProb && !activeEffects.find(e => e.type === 'supplyShock')) {
            activeEffects.push({ type: 'supplyShock', remaining: 6 });
            state.materialCostMultiplier *= 1.5;
            history.events.push({
                month, scenario: scenario.id, icon: '🚢',
                message: `Month ${month}: Supply chain disruption! Material costs +50%`
            });
        }
        
        // Regulation event
        if (Math.random() < (scenario.regulationEventProb || 0)) {
            state.wasteTax *= 1.25;
            history.events.push({
                month, scenario: scenario.id, icon: '📜',
                message: `Month ${month}: New environmental regulation. Waste tax +25%`
            });
        }
        
        // Market crash
        if (Math.random() < scenario.marketCrashProb && !activeEffects.find(e => e.type === 'marketCrash')) {
            activeEffects.push({ type: 'marketCrash', remaining: 8 });
            state.demandMultiplier *= 0.7;
            history.events.push({
                month, scenario: scenario.id, icon: '📉',
                message: `Month ${month}: Market downturn! Demand -30%`
            });
        }
        
        // Circular economy incentive (more likely in transition/scarcity)
        if (scenario.circularPremium > 0 && Math.random() < 0.008) {
            activeEffects.push({ type: 'circularIncentive', remaining: 12 });
            state.circularBonus += 5000;
            history.events.push({
                month, scenario: scenario.id, icon: '💰',
                message: `Month ${month}: Circular economy subsidy awarded!`
            });
        }
        
        // === PROCESS ACTIVE EFFECTS ===
        for (let i = activeEffects.length - 1; i >= 0; i--) {
            const effect = activeEffects[i];
            effect.remaining--;
            
            if (effect.remaining <= 0) {
                // Remove effect
                if (effect.type === 'supplyShock') {
                    state.materialCostMultiplier /= 1.5;
                } else if (effect.type === 'marketCrash') {
                    state.demandMultiplier /= 0.7;
                } else if (effect.type === 'circularIncentive') {
                    state.circularBonus -= 5000;
                }
                activeEffects.splice(i, 1);
            }
        }
        
        // === CALCULATE FACTORY OUTPUT ===
        const effectiveMaterialCost = state.materialCost * state.materialCostMultiplier;
        const monthResults = factory.calculateMonth({
            materialCost: effectiveMaterialCost,
            energyCost: state.energyCost,
            wasteTax: state.wasteTax,
            demandMultiplier: state.demandMultiplier,
            circularPremium: state.circularPremium,
            circularBonus: state.circularBonus
        });
        
        balance += monthResults.netProfit;
        totalWaste += monthResults.wasteGenerated;
        
        // Check bankruptcy
        if (balance <= 0 && bankruptMonth === null) {
            bankruptMonth = month;
            history.events.push({
                month, scenario: scenario.id, icon: '💀',
                message: `Month ${month}: BANKRUPTCY! Factory cannot continue operations.`
            });
        }
        
        history.months.push(month);
        history.balance.push(Math.max(0, balance));
        history.profit.push(monthResults.netProfit);
        history.waste.push(totalWaste);
        
        // Report progress
        if (eventCallback && month % 12 === 0) {
            eventCallback(`Year ${year} complete...`);
        }
    }
    
    return {
        scenario: scenario,
        history: history,
        finalBalance: Math.max(0, balance),
        totalWaste: totalWaste,
        bankruptMonth: bankruptMonth,
        survived: bankruptMonth === null,
        roi: ((balance - STARTING_CAPITAL) / STARTING_CAPITAL) * 100
    };
}

// ===== RUN ALL SCENARIOS =====
async function runStressTest() {
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
    survivalMatrix.style.display = 'none';
    chartSection.style.display = 'none';
    eventLogSection.style.display = 'none';
    verdictSection.style.display = 'none';
    
    // Show factory profile
    displayFactoryProfile(investments);
    
    const factory = new Factory(investments);
    const results = {};
    
    // Run each scenario with visual feedback
    for (const [key, scenario] of Object.entries(SCENARIOS)) {
        loadingStatus.textContent = `Running ${scenario.name}...`;
        await sleep(300);
        results[key] = runScenario(factory, scenario, (status) => {
            loadingStatus.textContent = `${scenario.name}: ${status}`;
        });
    }
    
    simulationResults = results;
    
    // Hide loading, show results
    loadingSpinner.style.display = 'none';
    displayResults(results, investments);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ===== DISPLAY FACTORY PROFILE =====
function displayFactoryProfile(investments) {
    const total = Object.values(investments).reduce((a, b) => a + b, 0);
    const traditionalPct = Math.round((investments.traditional / TOTAL_BUDGET) * 100);
    const circularPct = Math.round(((investments.robotics + investments.ecodesign) / TOTAL_BUDGET) * 100);
    
    let profileType = 'Balanced';
    let profileColor = '#64ffda';
    
    if (traditionalPct > 60 && circularPct < 20) {
        profileType = 'Traditional-Heavy';
        profileColor = '#ff6b6b';
    } else if (circularPct > 50) {
        profileType = 'Circular-Focused';
        profileColor = '#00d084';
    } else if (investments.detection > TOTAL_BUDGET * 0.3) {
        profileType = 'Quality-Focused';
        profileColor = '#ffd700';
    }
    
    factoryProfile.innerHTML = `
        <div style="color: ${profileColor}; font-weight: bold; margin-bottom: 8px;">${profileType}</div>
        <div style="font-size: 0.85rem; color: #a0a0a0;">
            Traditional: ${traditionalPct}% | Circular: ${circularPct}%
        </div>
    `;
    investmentSummary.style.display = 'block';
}

// ===== DISPLAY RESULTS =====
function displayResults(results, investments) {
    // Show all sections
    survivalMatrix.style.display = 'block';
    chartSection.style.display = 'block';
    eventLogSection.style.display = 'block';
    verdictSection.style.display = 'block';
    
    // === SURVIVAL MATRIX ===
    scenarioCards.innerHTML = '';
    
    Object.values(results).forEach(result => {
        const scenario = result.scenario;
        const survived = result.survived;
        const card = document.createElement('div');
        card.className = `scenario-card ${survived ? 'success' : 'danger'}`;
        card.dataset.scenario = scenario.id;
        card.onclick = () => highlightScenario(scenario.id);
        
        const statusIcon = survived ? '✅' : '❌';
        const statusText = survived ? 'SURVIVED' : `BANKRUPT (Month ${result.bankruptMonth})`;
        const balanceClass = result.finalBalance > STARTING_CAPITAL ? 'positive' : 'negative';
        
        card.innerHTML = `
            <div class="scenario-name" style="color: ${scenario.color}">${scenario.name}</div>
            <div class="scenario-subtitle">${scenario.subtitle}</div>
            <div class="scenario-status">${statusIcon} ${statusText}</div>
            <div class="scenario-stat">
                <span>Final Balance:</span>
                <span class="${balanceClass}">€${Math.round(result.finalBalance).toLocaleString()}</span>
            </div>
            <div class="scenario-stat">
                <span>ROI:</span>
                <span class="${result.roi >= 0 ? 'positive' : 'negative'}">${result.roi >= 0 ? '+' : ''}${Math.round(result.roi)}%</span>
            </div>
            <div class="scenario-stat">
                <span>Total Waste:</span>
                <span>${Math.round(result.totalWaste).toLocaleString()} kg</span>
            </div>
        `;
        
        scenarioCards.appendChild(card);
    });
    
    // === DRAW CHART ===
    drawMultiLineChart(results);
    
    // === EVENT LOG ===
    displayEventLog(results);
    
    // === VERDICT ===
    displayVerdict(results, investments);
}

// ===== MULTI-LINE CHART =====
function drawMultiLineChart(results) {
    const canvas = profitCanvas;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    
    const width = rect.width;
    const height = rect.height;
    const padding = { top: 20, right: 20, bottom: 40, left: 70 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Find min/max across all scenarios
    let allBalances = [];
    Object.values(results).forEach(r => {
        allBalances = allBalances.concat(r.history.balance);
    });
    const maxBalance = Math.max(...allBalances, STARTING_CAPITAL * 2);
    const minBalance = Math.min(...allBalances, 0);
    const range = maxBalance - minBalance;
    
    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    for (let i = 0; i <= 5; i++) {
        const y = padding.top + (chartHeight * i / 5);
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();
    }
    
    // Draw axes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, height - padding.bottom);
    ctx.lineTo(width - padding.right, height - padding.bottom);
    ctx.stroke();
    
    // Draw zero line if visible
    if (minBalance < 0) {
        const zeroY = padding.top + chartHeight * (1 - (0 - minBalance) / range);
        ctx.strokeStyle = 'rgba(255, 107, 107, 0.5)';
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(padding.left, zeroY);
        ctx.lineTo(width - padding.right, zeroY);
        ctx.stroke();
        ctx.setLineDash([]);
    }
    
    // Draw scenario lines
    Object.values(results).forEach(result => {
        const scenario = result.scenario;
        const balances = result.history.balance;
        const stepX = chartWidth / (balances.length - 1);
        
        ctx.strokeStyle = scenario.color;
        ctx.lineWidth = selectedScenario === scenario.id ? 4 : 2;
        
        if (scenario.lineStyle === 'dashed') {
            ctx.setLineDash([10, 5]);
        } else {
            ctx.setLineDash([]);
        }
        
        ctx.beginPath();
        balances.forEach((balance, i) => {
            const x = padding.left + stepX * i;
            const y = padding.top + chartHeight * (1 - (balance - minBalance) / range);
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();
        ctx.setLineDash([]);
    });
    
    // Y-axis labels
    ctx.fillStyle = '#a0a0a0';
    ctx.font = '11px system-ui';
    ctx.textAlign = 'right';
    
    for (let i = 0; i <= 5; i++) {
        const value = maxBalance - (range * i / 5);
        const y = padding.top + (chartHeight * i / 5);
        ctx.fillText('€' + Math.round(value / 1000) + 'K', padding.left - 8, y + 4);
    }
    
    // X-axis labels
    ctx.textAlign = 'center';
    for (let year = 0; year <= 10; year += 2) {
        const x = padding.left + (chartWidth * year / 10);
        ctx.fillText('Y' + year, x, height - padding.bottom + 20);
    }
}

function highlightScenario(scenarioId) {
    selectedScenario = selectedScenario === scenarioId ? null : scenarioId;
    
    // Update card selection
    document.querySelectorAll('.scenario-card').forEach(card => {
        card.classList.toggle('selected', card.dataset.scenario === selectedScenario);
    });
    
    // Redraw chart
    if (simulationResults) {
        drawMultiLineChart(simulationResults);
    }
}

// ===== EVENT LOG =====
function displayEventLog(results) {
    eventLog.innerHTML = '';
    
    // Collect and sort all events
    let allEvents = [];
    Object.values(results).forEach(result => {
        allEvents = allEvents.concat(result.history.events);
    });
    
    allEvents.sort((a, b) => a.month - b.month);
    
    // Show up to 20 most significant events
    const displayEvents = allEvents.slice(0, 20);
    
    if (displayEvents.length === 0) {
        eventLog.innerHTML = '<div class="log-entry">No major events during simulation.</div>';
        return;
    }
    
    displayEvents.forEach(event => {
        const scenario = SCENARIOS[event.scenario];
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        entry.style.borderLeftColor = scenario.color;
        entry.innerHTML = `<span style="color: ${scenario.color}">${event.icon}</span> ${event.message}`;
        eventLog.appendChild(entry);
    });
}

// ===== VERDICT =====
function displayVerdict(results, investments) {
    const cornucopia = results.cornucopia;
    const transition = results.transition;
    const scarcity = results.scarcity;
    
    const survivedCount = [cornucopia, transition, scarcity].filter(r => r.survived).length;
    const avgROI = (cornucopia.roi + transition.roi + scarcity.roi) / 3;
    
    let verdictIcon, verdictTitle, verdictText, verdictClass;
    
    if (survivedCount === 3 && avgROI > 50) {
        verdictIcon = '🏆';
        verdictTitle = 'RESILIENT & PROFITABLE';
        verdictText = 'Your factory thrives across all futures. This is a truly sustainable business model.';
        verdictClass = 'verdict-success';
    } else if (survivedCount === 3) {
        verdictIcon = '✅';
        verdictTitle = 'RESILIENT';
        verdictText = 'Your factory survives all scenarios. Consider optimizing investments for higher returns.';
        verdictClass = 'verdict-success';
    } else if (survivedCount === 2 && cornucopia.survived && transition.survived) {
        verdictIcon = '⚠️';
        verdictTitle = 'FRAGILE';
        verdictText = 'Your factory only fails under extreme scarcity. Adequate for current conditions, but vulnerable to disruption.';
        verdictClass = 'verdict-warning';
    } else if (survivedCount === 1 && cornucopia.survived) {
        verdictIcon = '❌';
        verdictTitle = 'BRITTLE';
        verdictText = 'Your factory only profits if the world never changes. This strategy is a high-risk bet on infinite resources.';
        verdictClass = 'verdict-danger';
    } else {
        verdictIcon = '💀';
        verdictTitle = 'UNSUSTAINABLE';
        verdictText = 'Your factory fails even under ideal conditions. Fundamentally unviable business model.';
        verdictClass = 'verdict-danger';
    }
    
    // Calculate circular investment ratio
    const circularRatio = (investments.robotics + investments.ecodesign) / TOTAL_BUDGET;
    const traditionalRatio = investments.traditional / TOTAL_BUDGET;
    
    let adviceText = '';
    if (verdictClass !== 'verdict-success') {
        if (traditionalRatio > 0.5 && circularRatio < 0.2) {
            adviceText = '💡 <strong>Recommendation:</strong> Your factory is over-reliant on traditional manufacturing. Invest in Robotic Disassembly and Eco-Design to reduce material dependency and waste costs.';
        } else if (circularRatio > 0.3 && investments.detection < TOTAL_BUDGET * 0.15) {
            adviceText = '💡 <strong>Recommendation:</strong> Your circular investments need quality control support. Increase Smart Detection to reduce defects.';
        } else {
            adviceText = '💡 <strong>Recommendation:</strong> Balance your investments across all categories for maximum resilience.';
        }
    }
    
    verdictSection.innerHTML = `
        <div class="verdict-box ${verdictClass}">
            <div class="verdict-icon">${verdictIcon}</div>
            <div class="verdict-title">${verdictTitle}</div>
            <div class="verdict-text">${verdictText}</div>
            ${adviceText ? `<div class="verdict-advice">${adviceText}</div>` : ''}
            <div class="verdict-stats">
                <span>Scenarios Survived: <strong>${survivedCount}/3</strong></span>
                <span>Avg ROI: <strong class="${avgROI >= 0 ? 'positive' : 'negative'}">${avgROI >= 0 ? '+' : ''}${Math.round(avgROI)}%</strong></span>
            </div>
        </div>
    `;
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
    survivalMatrix.style.display = 'none';
    chartSection.style.display = 'none';
    eventLogSection.style.display = 'none';
    verdictSection.style.display = 'none';
    investmentSummary.style.display = 'none';
    
    simulationResults = null;
    selectedScenario = null;
}

// ===== EVENT LISTENERS =====
startBtn.addEventListener('click', runStressTest);
resetBtn.addEventListener('click', reset);

// Handle window resize
window.addEventListener('resize', () => {
    if (simulationResults) {
        drawMultiLineChart(simulationResults);
    }
});

// ===== INITIALIZE =====
updateBudget();
