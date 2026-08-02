<script>
    import ApexBarChart from './ApexBarChart.svelte';
    import ApexLineChart from './ApexLineChart.svelte';
    import ApexComparisonChart from './ApexComparisonChart.svelte';

    import { round } from '$lib/utils/helper';

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
                        <ApexLineChart 
                            data={winsTrendData}
                            title="🏆 Wins Progression Over Time"
                            height={240}
                            color="#4CAF50"
                            showArea={true}
                            chartType="spline"
                        />
                    </div>
                {/if}

                {#if pointsTrendData.length > 1}
                    <div class="chart-section">
                        <ApexLineChart 
                            data={pointsTrendData}
                            title="📈 Fantasy Points Trend"
                            height={240}
                            color="#2196F3"
                            showArea={false}
                            chartType="spline"
                        />
                    </div>
                {/if}
            </div>
        </div>

        <!-- Secondary Charts -->
        <div class="secondary-charts">
            {#if comparisonData.length > 0}
                <div class="chart-section">
                    <ApexComparisonChart 
                        data={comparisonData}
                        title="📊 Current Season vs Career Average"
                        height={240}
                        primaryLabel="Current Season"
                        secondaryLabel="Career Average"
                    />
                </div>
            {/if}

            {#if efficiencyTrendData.length > 1}
                <div class="chart-section">
                    <ApexLineChart 
                        data={efficiencyTrendData}
                        title="⚡ Lineup Efficiency Over Time"
                        height={240}
                        color="#8BC34A"
                        showArea={false}
                        chartType="spline"
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
