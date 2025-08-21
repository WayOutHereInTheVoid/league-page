<script>
    import StatCard from './StatCard.svelte';
    
    // Props - data from the parent Records component
    export let leagueData = null;
    export let leagueTeamManagers = null;
    export let dataType = 'regularSeasonData'; // 'regularSeasonData' or 'playoffData'
    
    // Extract data for the current view (regular season or playoffs)
    $: currentData = leagueData?.[dataType];
    $: displayYear = currentData?.currentYear || 2024;
    
    // Get season-specific records for the display year
    $: seasonSpecificData = currentData?.seasonWeekRecords?.find(record => record.year === displayYear);
    
    // Extract statistics with robust fallbacks
    $: weeklyHighScore = getWeeklyHighScore();
    $: biggestBlowout = getBiggestBlowout();
    $: closestGame = getClosestGame();
    $: seasonLeader = getSeasonLeader();
    
    const getWeeklyHighScore = () => {
        // Try season-specific data first, then fall back to all-time
        const seasonHigh = seasonSpecificData?.seasonPointsHighs?.[0];
        const allTimeHigh = currentData?.leagueWeekHighs?.[0];
        
        const record = seasonHigh || allTimeHigh;
        if (!record) return null;
        
        return {
            value: record.fpts || 0,
            rosterID: record.rosterID,
            year: record.year || displayYear,
            week: record.week,
        };
    };
    
    const getBiggestBlowout = () => {
        // Try season-specific data first, then fall back to all-time
        const seasonBlowout = seasonSpecificData?.biggestBlowouts?.[0];
        const allTimeBlowout = currentData?.allTimeBiggestBlowouts?.[0];
        
        const record = seasonBlowout || allTimeBlowout;
        if (!record) return null;
        
        return {
            value: record.differential || 0,
            homeRosterID: record.home?.rosterID,
            awayRosterID: record.away?.rosterID,
            homePoints: record.home?.fpts,
            awayPoints: record.away?.fpts,
            year: record.year || displayYear,
            week: record.week,
        };
    };
    
    const getClosestGame = () => {
        // Try season-specific data first, then fall back to all-time
        const seasonClose = seasonSpecificData?.closestMatchups?.[0];
        const allTimeClose = currentData?.allTimeClosestMatchups?.[0];
        
        const record = seasonClose || allTimeClose;
        if (!record) return null;
        
        return {
            value: record.differential || 0,
            homeRosterID: record.home?.rosterID,
            awayRosterID: record.away?.rosterID,
            homePoints: record.home?.fpts,
            awayPoints: record.away?.fpts,
            year: record.year || displayYear,
            week: record.week,
        };
    };
    
    const getSeasonLeader = () => {
        // Filter season-long points for the display year
        const seasonPoints = currentData?.mostSeasonLongPoints?.filter(p => p.year === displayYear);
        const record = seasonPoints?.[0] || currentData?.mostSeasonLongPoints?.[0];
        
        if (!record) return null;
        
        return {
            value: record.fpts || 0,
            rosterID: record.rosterID,
            year: record.year || displayYear,
            fptsPerGame: record.fptsPerGame,
        };
    };
    
    // Helper function to get week display text
    const getWeekText = (week) => {
        if (typeof week === 'string') return week; // Playoff weeks like "Finals"
        return `Week ${week}`;
    };
    
    // Helper function to format team vs team text
    const getVersusText = (homeRosterID, awayRosterID, homePoints, awayPoints) => {
        if (!homeRosterID || !awayRosterID) return '';
        return `${homePoints?.toFixed(1)} - ${awayPoints?.toFixed(1)}`;
    };
</script>

<style>
    .summary-cards-container {
        margin: 2.5rem 0;
        padding: 0 1rem;
    }
    
    .cards-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 1.5rem;
        max-width: 1200px;
        margin: 0 auto;
    }
    
    .section-header {
        text-align: center;
        margin-bottom: 2rem;
    }
    
    .section-title {
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--g333);
        margin: 0 0 0.5rem 0;
    }
    
    .section-subtitle {
        font-size: 0.9rem;
        color: var(--g555);
        margin: 0;
    }
    
    /* Responsive Design */
    @media (max-width: 1200px) {
        .cards-grid {
            grid-template-columns: repeat(2, 1fr);
        }
    }
    
    @media (max-width: 768px) {
        .summary-cards-container {
            margin: 2rem 0;
            padding: 0 0.5rem;
        }
        
        .cards-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
        }
        
        .section-title {
            font-size: 1.3rem;
        }
        
        .section-subtitle {
            font-size: 0.85rem;
        }
    }
    
    @media (max-width: 620px) {
        .cards-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
        }
    }
    
    @media (max-width: 480px) {
        .summary-cards-container {
            margin: 1.5rem 0;
            padding: 0 0.25rem;
        }
        
        .cards-grid {
            gap: 0.75rem;
        }
        
        .section-header {
            margin-bottom: 1.5rem;
        }
        
        .section-title {
            font-size: 1.2rem;
        }
    }
</style>

{#if currentData && leagueTeamManagers}
    <div class="summary-cards-container">
        <div class="section-header">
            <h2 class="section-title">Key Statistics</h2>
            <p class="section-subtitle">
                {dataType === 'playoffData' ? 'Playoff' : 'Regular Season'} Records Overview
            </p>
        </div>
        
        <div class="cards-grid">
            <!-- Weekly High Score Card -->
            {#if weeklyHighScore}
                <StatCard
                    title="Weekly High Score"
                    value={weeklyHighScore.value}
                    format="decimal"
                    decimals={1}
                    icon="🏆"
                    season={displayYear}
                    subtitle={weeklyHighScore.week ? getWeekText(weeklyHighScore.week) : 'Best Performance'}
                    teamData={{
                        rosterID: weeklyHighScore.rosterID,
                        year: weeklyHighScore.year,
                        leagueTeamManagers: leagueTeamManagers
                    }}
                />
            {/if}
            
            <!-- Biggest Blowout Card -->
            {#if biggestBlowout}
                <StatCard
                    title="Biggest Blowout"
                    value={biggestBlowout.value}
                    format="decimal"
                    decimals={1}
                    icon="💥"
                    season={displayYear}
                    subtitle={biggestBlowout.week ? getWeekText(biggestBlowout.week) : 'Largest Margin'}
                    teamData={{
                        rosterID: biggestBlowout.homeRosterID,
                        year: biggestBlowout.year,
                        leagueTeamManagers: leagueTeamManagers
                    }}
                    extraInfo={getVersusText(
                        biggestBlowout.homeRosterID, 
                        biggestBlowout.awayRosterID,
                        biggestBlowout.homePoints,
                        biggestBlowout.awayPoints
                    )}
                />
            {/if}
            
            <!-- Closest Game Card -->
            {#if closestGame}
                <StatCard
                    title="Closest Game"
                    value={closestGame.value}
                    format="decimal"
                    decimals={1}
                    icon="⚖️"
                    season={displayYear}
                    subtitle={closestGame.week ? getWeekText(closestGame.week) : 'Smallest Margin'}
                    teamData={{
                        rosterID: closestGame.homeRosterID,
                        year: closestGame.year,
                        leagueTeamManagers: leagueTeamManagers
                    }}
                    extraInfo={getVersusText(
                        closestGame.homeRosterID, 
                        closestGame.awayRosterID,
                        closestGame.homePoints,
                        closestGame.awayPoints
                    )}
                />
            {/if}
            
            <!-- Season Leader Card -->
            {#if seasonLeader}
                <StatCard
                    title="Season Leader"
                    value={seasonLeader.value}
                    format="decimal"
                    decimals={1}
                    icon="👑"
                    season={displayYear}
                    subtitle={seasonLeader.fptsPerGame ? `${seasonLeader.fptsPerGame.toFixed(1)} PPG` : 'Total Points'}
                    teamData={{
                        rosterID: seasonLeader.rosterID,
                        year: seasonLeader.year,
                        leagueTeamManagers: leagueTeamManagers
                    }}
                />
            {/if}
        </div>
    </div>
{/if}
