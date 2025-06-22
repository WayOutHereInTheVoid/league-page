<script>
    import EnhancedBarChart from './EnhancedBarChart.svelte';
    import TrendChart from './TrendChart.svelte';

    import { round } from '$lib/utils/helper';
    import { 
        calculateAdvancedMetrics, 
        generateTrendData, 
        generatePerformanceInsights,
        calculateStrengthRatings,
        formatComparisonData
    } from '$lib/utils/helperFunctions/advancedStats.js';

    export let managerStats;
    export let leagueTeamManagers;
    export let rosterID;
    export let managerID;

    // Process season data for visualizations
    $: seasons = managerStats?.seasons || [];
    
    // Performance trend data
    $: winsTrendData = seasons.map(season => ({
        x: season.year,
        y: season.wins,
        label: season.year.toString(),
        description: `${season.wins}-${season.losses} record`
    })).reverse(); // Show chronologically

    $: pointsTrendData = seasons.map(season => ({
        x: season.year,
        y: round(season.fpts),
        label: season.year.toString(),
        description: `${round(season.fpts)} points scored`,
        change: seasons.indexOf(season) > 0 ? 
            round(season.fpts - seasons[seasons.indexOf(season) - 1].fpts) : null
    })).reverse();

    // Efficiency trend data
    $: efficiencyTrendData = seasons.map(season => ({
        x: season.year,
        y: season.lineupEfficiency || 0,
        label: season.year.toString(),
        description: `${season.lineupEfficiency || 0}% lineup efficiency`
    })).reverse();

    // Performance comparison data (current season vs career avg)
    $: currentSeasonStats = seasons.length > 0 ? seasons[0] : null;
    $: careerAverages = seasons.length > 0 ? {
        wins: round(seasons.reduce((sum, s) => sum + s.wins, 0) / seasons.length),
        points: round(seasons.reduce((sum, s) => sum + s.fpts, 0) / seasons.length),
        efficiency: round(seasons.reduce((sum, s) => sum + (s.lineupEfficiency || 0), 0) / seasons.length)
    } : null;

    $: comparisonData = currentSeasonStats && careerAverages ? [
        {
            label: 'Current Season',
            y: currentSeasonStats.wins,
            secondaryY: careerAverages.wins,
            description: `${currentSeasonStats.wins} wins this season vs ${careerAverages.wins} career avg`
        },
        {
            label: 'Points',
            y: round(currentSeasonStats.fpts),
            secondaryY: careerAverages.points,
            description: `${round(currentSeasonStats.fpts)} pts vs ${careerAverages.points} avg`
        },
        {
            label: 'Efficiency',
            y: currentSeasonStats.lineupEfficiency || 0,
            secondaryY: careerAverages.efficiency,
            description: `${currentSeasonStats.lineupEfficiency || 0}% vs ${careerAverages.efficiency}% avg`
        }
    ] : [];

    // Calculate key insights with enhanced formatting
    $: insights = {
        bestSeason: seasons.length > 0 ? 
            seasons.reduce((best, season) => season.wins > best.wins ? season : best) : null,
        worstSeason: seasons.length > 0 ? 
            seasons.reduce((worst, season) => season.wins < worst.wins ? season : worst) : null,
        totalChampionships: seasons.filter(s => s.championship).length,
        playoffAppearances: seasons.filter(s => s.playoffs).length,
        averageWins: seasons.length > 0 ? 
            round(seasons.reduce((sum, s) => sum + s.wins, 0) / seasons.length) : 0,
        winTrend: seasons.length > 2 ? 
            (seasons[0].wins - seasons[seasons.length - 1].wins) : 0,
        // Enhanced points metrics rounded to nearest hundred
        totalPoints: seasons.length > 0 ? 
            Math.round(seasons.reduce((sum, s) => sum + (s.fpts || 0), 0) / 100) * 100 : 0,
        averagePoints: seasons.length > 0 ? 
            Math.round((seasons.reduce((sum, s) => sum + (s.fpts || 0), 0) / seasons.length) / 100) * 100 : 0,
        highestScoringGame: seasons.length > 0 ? 
            Math.round(Math.max(...seasons.map(s => s.fpts || 0)) / 100) * 100 : 0,
        // Consistency metrics
        pointsConsistency: seasons.length > 1 ? (() => {
            const points = seasons.map(s => s.fpts || 0);
            const avg = points.reduce((sum, p) => sum + p, 0) / points.length;
            const variance = points.reduce((sum, p) => sum + Math.pow(p - avg, 2), 0) / points.length;
            const stdDev = Math.sqrt(variance);
            const cv = (stdDev / avg) * 100; // Coefficient of variation
            return Math.round((100 - cv) / 10) * 10; // Convert to consistency score (0-100, rounded to 10s)
        })() : 0,
        winConsistency: seasons.length > 1 ? (() => {
            const wins = seasons.map(s => s.wins || 0);
            const maxWins = Math.max(...wins);
            const minWins = Math.min(...wins);
            const range = maxWins - minWins;
            const maxPossibleRange = 17; // Assuming 17 game season
            const consistencyScore = Math.round((1 - (range / maxPossibleRange)) * 100);
            return Math.max(0, Math.min(100, consistencyScore)); // Clamp between 0-100
        })() : 0
    };

    // Performance streaks
    $: performanceStreaks = (() => {
        if (seasons.length < 2) return null;
        
        let currentStreak = 0;
        let streakType = null;
        let longestWinStreak = 0;
        let longestLossStreak = 0;
        
        for (let i = 0; i < seasons.length - 1; i++) {
            const current = seasons[i];
            const next = seasons[i + 1];
            
            if (current.wins > next.wins) {
                if (streakType === 'improving') {
                    currentStreak++;
                } else {
                    currentStreak = 1;
                    streakType = 'improving';
                }
            } else if (current.wins < next.wins) {
                if (streakType === 'declining') {
                    currentStreak++;
                } else {
                    currentStreak = 1;
                    streakType = 'declining';
                }
            } else {
                currentStreak = 0;
                streakType = null;
            }
        }
        
        return { currentStreak, streakType };
    })();
</script>

<style>
    /* TRUE Mobile-First Analytics Dashboard - Zero Overflow Design */
    .analytics-dashboard {
        /* Mobile-first: Safe container with overflow prevention */
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
        overflow-x: hidden;
        padding: 0.8rem 0;
        margin: 1rem 0;
        /* Flexible grid layout */
        display: grid;
        gap: 1rem;
    }

    .dashboard-header {
        text-align: center;
        margin-bottom: 1rem;
        padding: 0 0.5rem;
    }

    .dashboard-title {
        font-size: 1.2rem;
        font-weight: 700;
        color: var(--blueOne);
        margin-bottom: 0.4rem;
        /* Prevent title overflow */
        word-wrap: break-word;
        hyphens: auto;
    }

    .dashboard-subtitle {
        font-size: 0.8rem;
        color: var(--g555);
        font-style: italic;
        line-height: 1.3;
        /* Allow subtitle to wrap */
        word-wrap: break-word;
    }

    .charts-container {
        /* Mobile: Stack all charts vertically */
        display: grid;
        grid-template-columns: 1fr;
        gap: 1.2rem;
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
    }

    .trend-section {
        /* Mobile: Single column for trend charts */
        display: grid;
        grid-template-columns: 1fr;
        gap: 1rem;
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
    }

    .insights-section {
        /* Dedicated section for Key Insights - much better than cramped sidebar */
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
        margin: 1.5rem 0;
        padding: 0 0.5rem;
    }

    .insights-panel {
        background: var(--fff);
        border-radius: 8px;
        padding: 0.8rem;
        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        border-left: 3px solid var(--blueTwo);
        /* Prevent panel overflow */
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
        overflow-x: hidden;
    }

    .insights-title {
        font-size: 1rem;
        font-weight: 600;
        color: var(--blueOne);
        margin-bottom: 0.8rem;
        display: flex;
        align-items: center;
        gap: 0.4rem;
        /* Prevent title overflow */
        word-wrap: break-word;
    }

    /* Enhanced Insights Groups - Improved Visual Hierarchy */
    .insights-group {
        margin: 1.2rem 0;
        padding: 0.8rem;
        border-radius: 6px;
        background: linear-gradient(135deg, var(--f8f9fa) 0%, var(--fff) 100%);
        border: 1px solid var(--e9ecef);
        /* Ensure groups don't overflow */
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
    }

    .insights-group:first-child {
        margin-top: 0.8rem;
    }

    .insights-group-title {
        font-size: 0.9rem;
        font-weight: 600;
        color: var(--blueOne);
        margin-bottom: 0.6rem;
        padding-bottom: 0.3rem;
        border-bottom: 1px solid var(--dee2e6);
        display: flex;
        align-items: center;
        gap: 0.3rem;
        /* Prevent group title overflow */
        word-wrap: break-word;
    }

    .insight-item {
        /* Mobile: Stack label and value vertically */
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
        padding: 0.4rem 0.6rem;
        margin: 0.4rem 0;
        /* Ensure no overflow */
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
        overflow: hidden;
        border-radius: 4px;
        background: var(--fff);
        border: 1px solid transparent;
        transition: all 0.2s ease;
    }

    .insight-item:hover {
        border: 1px solid var(--dee2e6);
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }

    .insight-item.featured {
        background: linear-gradient(135deg, rgba(111, 214, 73, 0.05) 0%, rgba(126, 232, 88, 0.05) 100%);
        border: 1px solid rgba(111, 214, 73, 0.2);
        padding: 0.6rem 0.8rem;
    }

    .insight-item.featured:hover {
        border: 1px solid rgba(111, 214, 73, 0.4);
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(111, 214, 73, 0.1);
    }

    .insight-label {
        font-weight: 500;
        color: var(--g555);
        font-size: 0.8rem;
        /* Prevent label overflow */
        word-wrap: break-word;
    }

    .insight-value {
        font-weight: 600;
        color: var(--blueOne);
        font-size: 0.85rem;
        /* Prevent value overflow */
        word-break: break-word;
    }

    .highlight-positive {
        color: #4CAF50 !important;
    }

    .highlight-negative {
        color: #f44336 !important;
    }

    .highlight-neutral {
        color: #FFC107 !important;
    }

    .streak-indicator {
        display: inline-flex;
        align-items: center;
        gap: 0.3rem;
        padding: 0.3rem 0.6rem;
        border-radius: 12px;
        font-size: 0.7rem;
        font-weight: 600;
        /* Prevent streak indicator overflow */
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .streak-improving {
        background: rgba(76, 175, 80, 0.1);
        color: #4CAF50;
    }

    .streak-declining {
        background: rgba(244, 67, 54, 0.1);
        color: #f44336;
    }

    .chart-section {
        /* Ensure individual chart sections don't overflow */
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
        overflow: hidden;
        margin-bottom: 1rem;
    }

    .secondary-charts {
        /* Mobile: Stack secondary charts vertically */
        display: grid;
        grid-template-columns: 1fr;
        gap: 1rem;
        margin-top: 1rem;
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
    }

    .no-data-message {
        text-align: center;
        color: var(--g666);
        font-style: italic;
        padding: 1.5rem 0.8rem;
        background: var(--f8f9fa);
        border-radius: 8px;
        border: 2px dashed var(--ccc);
        /* Ensure message doesn't overflow */
        word-wrap: break-word;
        max-width: 100%;
        box-sizing: border-box;
    }

    .no-data-message h3 {
        font-size: 1.1rem;
        margin-bottom: 0.8rem;
        color: var(--blueOne);
    }

    .no-data-message p {
        font-size: 0.9rem;
        margin-bottom: 0.5rem;
        line-height: 1.4;
    }

    .no-data-message small {
        font-size: 0.75rem;
        color: var(--g555);
    }

    /* Small Mobile (480px+) - Enhanced spacing and sizing */
    @media (min-width: 480px) {
        .analytics-dashboard {
            padding: 1rem 0;
            margin: 1.2rem 0;
            gap: 1.2rem;
        }
        
        .dashboard-title {
            font-size: 1.3rem;
        }
        
        .dashboard-subtitle {
            font-size: 0.85rem;
        }
        
        .insights-panel {
            padding: 1rem;
        }
        
        .insights-title {
            font-size: 1.1rem;
        }
        
        .insight-label {
            font-size: 0.85rem;
        }
        
        .insight-value {
            font-size: 0.9rem;
        }
        
        .insights-group-title {
            font-size: 1rem;
        }
    }

    /* Tablet Portrait (600px+) - Better use of space */
    @media (min-width: 600px) {
        .analytics-dashboard {
            padding: 1.2rem 0.8rem;
            gap: 1.5rem;
        }
        
        .dashboard-title {
            font-size: 1.4rem;
        }
        
        .dashboard-subtitle {
            font-size: 0.9rem;
        }
        
        .charts-container {
            gap: 1.5rem;
        }
        
        .insight-item {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            gap: 1rem;
        }
        
        .insights-panel {
            padding: 1.2rem;
        }
    }

    /* Tablet Landscape (768px+) - Side-by-side layouts start */
    @media (min-width: 768px) {
        .analytics-dashboard {
            gap: 2rem;
            margin: 2rem 0;
        }
        
        .dashboard-title {
            font-size: 1.5rem;
        }
        
        .dashboard-subtitle {
            font-size: 1rem;
        }
        
        .trend-section {
            gap: 1.5rem;
        }
        
        .insights-title {
            font-size: 1.2rem;
        }
        
        .insight-label,
        .insight-value {
            font-size: 0.95rem;
        }
        
        .streak-indicator {
            font-size: 0.75rem;
        }
        
        .insights-group-title {
            font-size: 1.1rem;
        }
    }

    /* Desktop (992px+) - Full layout with constraints + VERTICAL SPACE OPTIMIZATION */
    @media (min-width: 992px) {
        .analytics-dashboard {
            max-width: 950px;
            margin: 1.5rem auto; /* REDUCED: was 2rem auto */
            padding: 1.5rem 1rem; /* REDUCED: was 2rem 1rem */
            gap: 2rem; /* REDUCED: was 2.5rem */
        }
        
        .trend-section {
            grid-template-columns: 1fr;
            gap: 2rem;
        }
        
        .insights-section {
            margin: 2rem 0;
            padding: 0 1rem;
        }
        
        .insights-panel {
            padding: 1.2rem;
            /* Desktop: Use grid layout for insights for better organization */
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1rem;
        }
        
        .insights-title {
            grid-column: 1 / -1; /* Span full width */
            font-size: 1.2rem;
            margin-bottom: 1rem;
        }
        
        .insights-group {
            margin: 0;
        }
        
        .secondary-charts {
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
        }
    }

    /* Large Desktop (1200px+) - Enhanced experience */
    @media (min-width: 1200px) {
        .analytics-dashboard {
            max-width: 1100px;
            padding: 2rem 1.5rem;
            gap: 3rem;
        }
        
        .charts-container {
            gap: 2.5rem;
        }
        
        .dashboard-title {
            font-size: 1.6rem;
        }
        
        .secondary-charts {
            gap: 2.5rem;
        }
    }

    /* Extra Large Desktop (1400px+) - Maximum experience */
    @media (min-width: 1400px) {
        .analytics-dashboard {
            max-width: 1200px;
            padding: 2rem 2rem;
            gap: 3.5rem;
        }
        
        .charts-container {
            gap: 3rem;
        }
        
        .secondary-charts {
            gap: 3rem;
        }
    }
</style>

<div class="analytics-dashboard">
    <div class="dashboard-header">
        <h2 class="dashboard-title">📊 Advanced Analytics Dashboard</h2>
        <p class="dashboard-subtitle">Comprehensive performance insights and trend analysis</p>
    </div>

    {#if seasons.length > 0}
        <!-- Main Charts Container -->
        <div class="charts-container">
            <!-- Trend Analysis Section -->
            <div class="trend-section">
                {#if winsTrendData.length > 1}
                    <div class="chart-section">
                        <TrendChart 
                            data={winsTrendData}
                            title="🏆 Wins Progression Over Time"
                            showArea={true}
                            height={180}
                        />
                    </div>
                {/if}

                {#if pointsTrendData.length > 1}
                    <div class="chart-section">
                        <TrendChart 
                            data={pointsTrendData}
                            title="📈 Fantasy Points Trend"
                            color="var(--blueTwo)"
                            height={180}
                        />
                    </div>
                {/if}
            </div>
        </div>

        <!-- Enhanced Key Insights with organized groups and visual hierarchy -->
        <div class="insights-section">
            <div class="insights-panel">
                <div class="insights-title">
                    🔍 Key Insights
                </div>

                <!-- Performance Achievements Section -->
                <div class="insights-group">
                    <div class="insights-group-title">🏆 Achievements</div>
                    
                    {#if insights.totalChampionships > 0}
                        <div class="insight-item featured">
                            <span class="insight-label">Championships</span>
                            <span class="insight-value highlight-positive">
                                {insights.totalChampionships} 🏆
                            </span>
                        </div>
                    {/if}

                    {#if insights.bestSeason}
                        <div class="insight-item">
                            <span class="insight-label">Best Season</span>
                            <span class="insight-value highlight-positive">
                                {insights.bestSeason.year} ({insights.bestSeason.wins} wins)
                            </span>
                        </div>
                    {/if}

                    <div class="insight-item">
                        <span class="insight-label">Playoff Rate</span>
                        <span class="insight-value {insights.playoffAppearances / seasons.length > 0.5 ? 'highlight-positive' : 'highlight-neutral'}">
                            {round((insights.playoffAppearances / seasons.length) * 100)}%
                        </span>
                    </div>
                </div>

                <!-- Scoring Metrics Section -->
                <div class="insights-group">
                    <div class="insights-group-title">📊 Scoring Profile</div>
                    
                    <div class="insight-item">
                        <span class="insight-label">Career Points</span>
                        <span class="insight-value highlight-neutral">
                            {insights.totalPoints.toLocaleString()}
                        </span>
                    </div>

                    <div class="insight-item">
                        <span class="insight-label">Avg Points/Season</span>
                        <span class="insight-value">
                            {insights.averagePoints.toLocaleString()}
                        </span>
                    </div>

                    <div class="insight-item">
                        <span class="insight-label">Highest Scoring</span>
                        <span class="insight-value highlight-positive">
                            {insights.highestScoringGame.toLocaleString()}
                        </span>
                    </div>
                </div>

                <!-- Consistency Metrics Section -->
                <div class="insights-group">
                    <div class="insights-group-title">⚖️ Consistency</div>
                    
                    <div class="insight-item">
                        <span class="insight-label">Win Consistency</span>
                        <span class="insight-value {insights.winConsistency >= 70 ? 'highlight-positive' : insights.winConsistency >= 50 ? 'highlight-neutral' : 'highlight-negative'}">
                            {insights.winConsistency}%
                        </span>
                    </div>

                    <div class="insight-item">
                        <span class="insight-label">Points Consistency</span>
                        <span class="insight-value {insights.pointsConsistency >= 70 ? 'highlight-positive' : insights.pointsConsistency >= 50 ? 'highlight-neutral' : 'highlight-negative'}">
                            {insights.pointsConsistency}%
                        </span>
                    </div>

                    <div class="insight-item">
                        <span class="insight-label">Career Average</span>
                        <span class="insight-value">
                            {insights.averageWins} wins/season
                        </span>
                    </div>
                </div>

                <!-- Current Trend Section -->
                {#if performanceStreaks?.currentStreak > 0}
                    <div class="insights-group">
                        <div class="insights-group-title">📈 Current Trend</div>
                        
                        <div class="insight-item featured">
                            <span class="insight-label">Performance Trend</span>
                            <span class="streak-indicator streak-{performanceStreaks.streakType}">
                                {performanceStreaks.streakType === 'improving' ? '📈' : '📉'}
                                {performanceStreaks.currentStreak} seasons {performanceStreaks.streakType}
                            </span>
                        </div>
                    </div>
                {/if}
            </div>
        </div>

        <!-- Secondary Charts -->
        <div class="secondary-charts">
            {#if comparisonData.length > 0}
                <div class="chart-section">
                    <EnhancedBarChart 
                        data={comparisonData}
                        title="📊 Current Season vs Career Average"
                        height={180}
                        showTrend={false}
                    />
                </div>
            {/if}

            {#if efficiencyTrendData.length > 1}
                <div class="chart-section">
                    <TrendChart 
                        data={efficiencyTrendData}
                        title="⚡ Lineup Efficiency Over Time"
                        color="#8BC34A"
                        height={180}
                    />
                </div>
            {/if}
        </div>

    {:else}
        <div class="no-data-message">
            <h3>📈 Analytics Coming Soon!</h3>
            <p>Advanced analytics and trend visualizations will appear here once the manager completes their first season.</p>
            <small>Check back after the season ends for comprehensive performance insights.</small>
        </div>
    {/if}
</div>