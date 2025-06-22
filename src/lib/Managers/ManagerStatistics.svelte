<script>
    import { round } from '$lib/utils/helper';
    import AnalyticsDashboard from '$lib/AnalyticsDashboard.svelte';
    import EnhancedBarChart from '$lib/EnhancedBarChart.svelte';

    export let managerStats, leagueTeamManagers, rosterID, managerID;

    // Enhanced data structure from improved managerStats computation
    $: seasons = managerStats?.seasons || [];
    $: totalStats = managerStats?.totalStats || {};

    // Use enhanced statistics if available, fallback to manual calculation for legacy data
    $: totalWins = totalStats.totalWins ?? seasons.reduce((sum, season) => sum + (season.wins || 0), 0);
    $: totalLosses = totalStats.totalLosses ?? seasons.reduce((sum, season) => sum + (season.losses || 0), 0);
    $: totalTies = totalStats.totalTies ?? seasons.reduce((sum, season) => sum + (season.ties || 0), 0);
    $: totalPoints = totalStats.totalPoints ?? seasons.reduce((sum, season) => sum + (isNaN(season.fpts) ? 0 : season.fpts || 0), 0);
    $: totalPointsAgainst = totalStats.totalPointsAgainst ?? seasons.reduce((sum, season) => sum + (isNaN(season.fptsAgainst) ? 0 : season.fptsAgainst || 0), 0);
    
    // Enhanced statistics with more accurate calculations
    $: winPercentage = totalStats.winPercentage ?? (totalWins + totalLosses > 0 ? round((totalWins / (totalWins + totalLosses)) * 100) : 0);
    $: averagePointsPerSeason = totalStats.averagePointsPerSeason ?? (seasons.length > 0 ? round(totalPoints / seasons.length) : 0);
    $: averagePointsPerGame = totalStats.averagePointsPerGame ?? 0;
    $: playoffAppearances = totalStats.playoffAppearances ?? seasons.filter(season => season.playoffs).length;
    $: championships = totalStats.championships ?? seasons.filter(season => season.championship).length;
    $: divisionChampionships = totalStats.divisionChampionships ?? seasons.filter(season => season.divisionChamp).length;
    $: seasonsPlayed = totalStats.seasonsPlayed ?? seasons.length;

    // Performance trends for visualization
    $: winTrendData = seasons.map(season => ({
        x: season.year,
        y: season.wins || 0
    }));

    $: pointsTrendData = seasons.map(season => ({
        x: season.year,
        y: season.fpts || 0
    }));

    $: performanceLevel = (() => {
        if (winPercentage >= 70) return { level: 'Elite', color: '#6FD649', description: 'Dominant manager with consistent success' };
        if (winPercentage >= 60) return { level: 'Excellent', color: '#7EE858', description: 'Strong performer above league average' };
        if (winPercentage >= 50) return { level: 'Solid', color: '#FF8C42', description: 'Competitive manager around .500' };
        if (winPercentage >= 40) return { level: 'Developing', color: '#FF6B35', description: 'Building toward consistent success' };
        return { level: 'Rebuilding', color: '#FF5722', description: 'Working to improve performance' };
    })();

    // State for collapsible charts section
    let chartsExpanded = false;
    
    // State for collapsible analytics dashboard
    let analyticsExpanded = false;

    // Function to toggle charts visibility
    const toggleCharts = () => {
        chartsExpanded = !chartsExpanded;
    };

    // Function to toggle analytics dashboard visibility
    const toggleAnalytics = () => {
        analyticsExpanded = !analyticsExpanded;
    };
</script>

<style>
    /* TRUE Mobile-First Design - Prevents All Overflow Issues */
    .statisticsContainer {
        /* Mobile-first: Minimal, safe styling */
        background-color: var(--fff);
        padding: 0.8rem;
        margin: 1rem 0;
        border-radius: 8px;
        border: 1px solid var(--ccc);
        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        /* Critical: Ensure container never exceeds viewport */
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
        overflow-x: hidden;
    }

    .sectionTitle {
        font-size: 1.2rem;
        font-weight: 600;
        color: var(--blueOne);
        margin-bottom: 1rem;
        text-align: center;
        border-bottom: 2px solid var(--blueOne);
        padding-bottom: 0.4rem;
        /* Ensure title never causes overflow */
        word-wrap: break-word;
        hyphens: auto;
    }

    .statsGrid {
        /* Mobile: Single column to prevent any overflow risk */
        display: grid;
        grid-template-columns: 1fr;
        gap: 0.8rem;
        margin-bottom: 1.5rem;
    }

    .statCard {
        background: linear-gradient(135deg, var(--fff) 0%, var(--f8f9fa) 100%);
        border: 1px solid var(--e9ecef);
        border-radius: 6px;
        padding: 0.8rem;
        text-align: center;
        box-shadow: 0 1px 4px rgba(0,0,0,0.05);
        transition: transform 0.15s ease;
        /* Critical: Prevent any overflow */
        min-width: 0;
        max-width: 100%;
        box-sizing: border-box;
        overflow: hidden;
    }

    .statCard:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .statValue {
        font-size: 1.4rem;
        font-weight: 700;
        color: var(--blueOne);
        margin-bottom: 0.2rem;
        /* Prevent text overflow */
        word-break: break-word;
    }

    .statLabel {
        font-size: 0.7rem;
        color: var(--g555);
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.3px;
        /* Ensure labels wrap properly */
        word-wrap: break-word;
        line-height: 1.2;
    }

    .performanceLevel {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.6rem;
        margin: 1.2rem 0;
        padding: 0.8rem;
        border-radius: 6px;
        background: linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,249,250,0.9) 100%);
        border-left: 3px solid var(--performance-color);
        text-align: center;
        /* Prevent overflow */
        max-width: 100%;
        box-sizing: border-box;
    }

    .levelBadge {
        padding: 0.4rem 0.8rem;
        border-radius: 15px;
        color: white;
        font-weight: 600;
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.3px;
        /* Ensure badge text doesn't break layout */
        white-space: nowrap;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .levelDescription {
        font-style: italic;
        color: var(--g666);
        font-size: 0.8rem;
        line-height: 1.3;
        /* Allow text to wrap nicely */
        word-wrap: break-word;
        text-align: center;
    }

    .chartSection {
        margin-top: 1.5rem;
    }

    .chartTitle {
        font-size: 1rem;
        font-weight: 600;
        color: var(--g555);
        margin-bottom: 0.8rem;
        text-align: center;
        /* Prevent title overflow */
        word-wrap: break-word;
    }

    .noDataMessage {
        text-align: center;
        color: var(--g666);
        font-style: italic;
        padding: 1.5rem 0.8rem;
        background-color: var(--f8f9fa);
        border-radius: 6px;
        border: 1px dashed var(--ccc);
        /* Ensure message doesn't overflow */
        word-wrap: break-word;
    }

    .achievementHighlight {
        background: linear-gradient(135deg, rgba(111, 214, 73, 0.1) 0%, rgba(111, 214, 73, 0.2) 100%);
        border: 1px solid rgba(111, 214, 73, 0.4);
        color: var(--g333);
        box-shadow: 0 2px 8px rgba(111, 214, 73, 0.15);
    }

    .championshipHighlight {
        background: linear-gradient(135deg, rgba(255, 107, 53, 0.1) 0%, rgba(255, 107, 53, 0.2) 100%);
        border: 1px solid rgba(255, 107, 53, 0.4);
        color: var(--g333);
        box-shadow: 0 2px 8px rgba(255, 107, 53, 0.15);
    }

    /* Dark theme enhancements for achievement highlights */
    @media (prefers-color-scheme: dark) {
        .achievementHighlight {
            background: linear-gradient(135deg, rgba(126, 232, 88, 0.15) 0%, rgba(126, 232, 88, 0.25) 100%);
            border: 1px solid rgba(126, 232, 88, 0.5);
            color: var(--g111);
        }
        
        .championshipHighlight {
            background: linear-gradient(135deg, rgba(255, 140, 66, 0.15) 0%, rgba(255, 140, 66, 0.25) 100%);
            border: 1px solid rgba(255, 140, 66, 0.5);
            color: var(--g111);
        }
    }

    .trendContainer {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1.2rem;
        margin-top: 1.2rem;
    }

    /* Collapsible Charts Section Styles */
    .chartsHeader {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.8rem;
        margin-top: 1.2rem;
        background: linear-gradient(135deg, var(--fff) 0%, var(--f8f9fa) 100%);
        border: 1px solid var(--e9ecef);
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s ease;
        /* Ensure header doesn't overflow */
        max-width: 100%;
        box-sizing: border-box;
    }

    .chartsHeader:hover {
        background: linear-gradient(135deg, var(--f8f9fa) 0%, var(--e9ecef) 100%);
        box-shadow: 0 2px 6px rgba(0,0,0,0.1);
    }

    .chartsHeaderTitle {
        font-size: 1rem;
        font-weight: 600;
        color: var(--blueOne);
        margin: 0;
        /* Prevent title overflow */
        word-wrap: break-word;
        flex-grow: 1;
    }

    .chartsToggleIcon {
        font-size: 1.2rem;
        color: var(--blueOne);
        transition: transform 0.3s ease;
        margin-left: 0.5rem;
        flex-shrink: 0;
    }

    .chartsToggleIcon.expanded {
        transform: rotate(180deg);
    }

    .chartsContent {
        overflow: hidden;
        transition: all 0.4s ease;
        opacity: 0;
        max-height: 0;
        margin-top: 0;
    }

    .chartsContent.expanded {
        opacity: 1;
        max-height: 1000px;
        margin-top: 1rem;
    }

    /* Small Mobile (480px+) - Add two-column grid back carefully */
    @media (min-width: 480px) {
        .statisticsContainer {
            padding: 1rem;
            margin: 1.2rem 0;
        }
        
        .statsGrid {
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
        }
        
        .statValue {
            font-size: 1.5rem;
        }
        
        .statLabel {
            font-size: 0.8rem;
        }
        
        .sectionTitle {
            font-size: 1.3rem;
        }
    }

    /* Tablet Portrait (768px+) - Enhanced layout */
    @media (min-width: 768px) {
        .statisticsContainer {
            padding: 1.5rem;
            margin: 2rem 0;
            border-radius: 10px;
        }
        
        .statsGrid {
            grid-template-columns: repeat(3, 1fr);
            gap: 1.2rem;
        }
        
        .statCard {
            padding: 1.2rem;
        }
        
        .statValue {
            font-size: 1.8rem;
        }
        
        .statLabel {
            font-size: 0.85rem;
        }
        
        .sectionTitle {
            font-size: 1.5rem;
        }
        
        .performanceLevel {
            flex-direction: row;
            text-align: left;
            gap: 1rem;
        }
        
        .levelDescription {
            text-align: left;
        }
    }

    /* Desktop (992px+) - Full layout with constraints */
    @media (min-width: 992px) {
        .statisticsContainer {
            max-width: 850px;
            margin: 1.5rem auto; /* REDUCED: was 2rem auto */
            padding: 1.5rem; /* REDUCED: was 2rem */
            border-radius: 12px;
        }
        
        .trendContainer {
            grid-template-columns: 1fr 1fr;
            gap: 1.5rem; /* REDUCED: was 2rem */
        }
        
        .chartTitle {
            font-size: 1.1rem;
        }
    }

    /* Large Desktop (1200px+) - Enhanced experience */
    @media (min-width: 1200px) {
        .statisticsContainer {
            max-width: 950px;
        }
        
        .statsGrid {
            gap: 1.8rem;
        }
        
        .statCard {
            padding: 1.5rem;
        }
        
        .statValue {
            font-size: 2rem;
        }
        
        .statLabel {
            font-size: 0.9rem;
        }
        
        .sectionTitle {
            font-size: 1.6rem;
        }
    }

    /* Extra Large Desktop (1400px+) - Maximum experience */
    @media (min-width: 1400px) {
        .statisticsContainer {
            max-width: 1050px;
        }
        
        .statsGrid {
            gap: 2rem;
        }
    }
</style>

<div class="statisticsContainer">
    <div class="sectionTitle">Manager Performance Statistics</div>
    
    {#if seasons.length > 0}
        <div class="statsGrid">
            <div class="statCard">
                <div class="statValue">{totalWins}</div>
                <div class="statLabel">Total Wins</div>
            </div>
            
            <div class="statCard">
                <div class="statValue">{totalLosses}</div>
                <div class="statLabel">Total Losses</div>
            </div>
            
            <div class="statCard">
                <div class="statValue">{winPercentage}%</div>
                <div class="statLabel">Win Rate</div>
            </div>
            
            <div class="statCard">
                <div class="statValue">{round(averagePointsPerSeason)}</div>
                <div class="statLabel">Avg Points/Season</div>
            </div>
            
            <div class="statCard {playoffAppearances > 0 ? 'achievementHighlight' : ''}">
                <div class="statValue">{playoffAppearances}</div>
                <div class="statLabel">Playoff Appearances</div>
            </div>
            
            <div class="statCard {championships > 0 ? 'championshipHighlight' : ''}">
                <div class="statValue">{championships}</div>
                <div class="statLabel">Championships</div>
            </div>
        </div>

        <div class="performanceLevel" style="--performance-color: {performanceLevel.color}">
            <div class="levelBadge" style="background-color: {performanceLevel.color}">
                {performanceLevel.level}
            </div>
            <div class="levelDescription">{performanceLevel.description}</div>
        </div>

        {#if winTrendData.length > 1}
            <!-- Collapsible Charts Header -->
            <div class="chartsHeader" on:click={toggleCharts}>
                <h3 class="chartsHeaderTitle">Season Performance Charts</h3>
                <span class="chartsToggleIcon" class:expanded={chartsExpanded}>
                    ▼
                </span>
            </div>
            
            <!-- Collapsible Charts Content -->
            <div class="chartsContent" class:expanded={chartsExpanded}>
                <div class="trendContainer">
                    <div class="chartSection">
                        <div class="chartTitle">Wins by Season</div>
                        <EnhancedBarChart data={winTrendData} title="Wins by Season" height={200} />
                    </div>
                    
                    <div class="chartSection">
                        <div class="chartTitle">Points by Season</div>
                        <EnhancedBarChart data={pointsTrendData} title="Points by Season" height={200} />
                    </div>
                </div>
            </div>
        {/if}

        <!-- Collapsible Analytics Dashboard Header -->
        <div class="chartsHeader" on:click={toggleAnalytics}>
            <h3 class="chartsHeaderTitle">Advanced Analytics Dashboard</h3>
            <span class="chartsToggleIcon" class:expanded={analyticsExpanded}>
                ▼
            </span>
        </div>
        
        <!-- Collapsible Analytics Dashboard Content -->
        <div class="chartsContent" class:expanded={analyticsExpanded}>
            <AnalyticsDashboard {managerStats} {leagueTeamManagers} {rosterID} {managerID} />
        </div>
    {:else}
        <div class="noDataMessage">
            📊 No historical statistics available yet.<br>
            <small>Stats will appear after the manager completes their first season.</small>
        </div>
    {/if}
</div>
