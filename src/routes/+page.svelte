<script>
	import LinearProgress from '@smui/linear-progress';
	import { getNflState, leagueName, getAwards, getLeagueTeamManagers, homepageText, managers, gotoManager, enableBlog, waitForAll, getLeagueRosters, getLeagueData, loadPlayers, getLeagueStandings } from '$lib/utils/helper';
	import { TransactionsCompact, PowerRankingsCompact, HomePost, StandingsCompact} from '$lib/components';
	import { getAvatarFromTeamManagers, getTeamFromTeamManagers } from '$lib/utils/helperFunctions/universalFunctions';
	import { DynamicHeader } from '$lib/HomepageHeader';
	import { dynasty } from '$lib/utils/leagueInfo';

    const nflState = getNflState();
    const podiumsData = getAwards();
    const leagueTeamManagersData = getLeagueTeamManagers();
    
    // Data for compact components
    const rostersData = getLeagueRosters();
    const leagueData = getLeagueData();
    const playersInfo = loadPlayers();
    const standingsData = getLeagueStandings();
</script>

<style>
    /* Modern Dashboard Grid Layout */
    .dashboard {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
        gap: clamp(1rem, 3vw, 1.5rem);
        padding: 1rem;
        max-width: 1600px;
        margin: 0 auto;
    }

    /* Card-based design system */
    .dashboard-card {
        background: var(--f3f3f3);
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        border: 1px solid var(--ddd);
        overflow: hidden;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .dashboard-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }

    /* Card headers */
    .card-header {
        background: var(--blueOne);
        color: white;
        padding: 1rem 1.5rem;
        font-weight: 600;
        font-size: 1.1rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .card-header.nfl-state {
        background: linear-gradient(135deg, #1a472a 0%, var(--blueOne) 100%);
    }

    .card-header.welcome {
        background: linear-gradient(135deg, #1a472a 0%, var(--blueOne) 100%);
    }

    .card-header.champion {
        background: linear-gradient(135deg, var(--blueOne) 0%, var(--blueTwo) 100%);  /* Logo-harmonized gradient */
        color: white;                                                                 /* Professional white text */
    }

    .card-header.power-rankings {
        background: linear-gradient(135deg, var(--blueOne) 0%, #2d5aa0 100%);
    }

    .card-header.transactions {
        background: linear-gradient(135deg, #2d5aa0 0%, #1a472a 100%);
    }

    /* Card content */
    .card-content {
        padding: 1.5rem;
    }

    .card-content.compact {
        padding: 1rem;
    }

    /* NFL State Card */
    .nfl-state-card {
        text-align: center;
    }



    /* League Info Content Styles */
    .league-info-content {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .info-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem 0;
        border-bottom: 1px solid var(--ddd);
    }

    .info-item:last-child {
        border-bottom: none;
    }

    .info-item .label {
        font-weight: 600;
        color: var(--blueOne);
        font-size: 0.9rem;
    }

    .info-item .value {
        font-weight: 500;
        color: var(--textColor);
        font-size: 0.9rem;
    }

    .info-item .value.preseason {
        color: #2e7d32;
        font-weight: 600;
    }

    .info-item .value.playoffs {
        color: #f57c00;
        font-weight: 600;
    }

    .info-item .value.regular {
        color: #d32f2f;
        font-weight: 600;
    }

    /* Champion Card Styling */
    .champion-card {
        text-align: center;
    }

    .champion-display {
        position: relative;
        width: clamp(80px, 15vw, 120px);
        height: clamp(80px, 15vw, 120px);
        margin: 0 auto 1rem;
        cursor: pointer;
    }

    .champion-avatar {
        position: absolute;
        transform: translate(-50%, -50%);
        width: clamp(50px, 10vw, 70px);
        height: clamp(50px, 10vw, 70px);
        border-radius: 100%;
        border: 2px solid #FFD700;
        left: 50%;
        top: 43%;
    }

    .champion-laurel {
        position: absolute;
        transform: translate(-50%, -50%);
        width: clamp(70px, 14vw, 110px);
        height: auto;
        left: 50%;
        top: 50%;
    }

    .champion-title {
        font-size: 1.4rem;
        margin-bottom: 1rem;
        color: var(--textColor);
        font-weight: 600;
    }

    .champion-name {
        font-size: 1.2rem;
        font-weight: 600;
        color: var(--blueOne);
        cursor: pointer;
        transition: color 0.2s ease;
    }

    .champion-name:hover {
        color: #FFD700;
    }

    /* Large cards (span 2 columns on desktop) */
    .card-large {
        grid-column: span 2;
    }

    /* Responsive grid adjustments */
    @media (max-width: 1200px) {
        .dashboard {
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1rem;
        }
        
        .card-large {
            grid-column: span 1;
        }
    }

    /* Tablet adjustments */
    @media (max-width: 900px) {
        .dashboard {
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 1rem;
            padding: 0.75rem;
        }
        
        /* League Info card optimization for tablets */
        .info-item {
            padding: 0.45rem 0;
        }
        
        .info-item .label,
        .info-item .value {
            font-size: 0.875rem;
        }
    }

    @media (max-width: 768px) {
        .dashboard {
            grid-template-columns: 1fr;
            padding: 0.5rem;
            gap: 1rem;
        }
        
        .card-content {
            padding: 1rem;
        }
        
        /* Champion card mobile adjustments */
        .champion-display {
            width: 100px;
            height: 100px;
        }
        
        .champion-avatar {
            width: 60px;
            height: 60px;
        }
        
        .champion-laurel {
            width: 90px;
        }
        
        /* League Info mobile responsiveness */
        .league-info-content {
            gap: 0.5rem;
        }
        
        .info-item {
            padding: 0.4rem 0;
            flex-direction: column;
            align-items: flex-start;
            gap: 0.25rem;
        }
        
        .info-item .label {
            font-size: 0.85rem;
            opacity: 0.8;
        }
        
        .info-item .value {
            font-size: 0.9rem;
            font-weight: 600;
        }
        
        /* Ensure conditional cards display well on mobile */
        .card-large {
            grid-column: span 1;
        }
    }

    /* Enhanced Mobile Optimization for Very Small Screens */
    @media (max-width: 480px) {
        .dashboard {
            gap: 0.75rem;
            padding: 0.5rem;
        }
        
        .card-content {
            padding: 0.75rem;
        }
        
        .info-item {
            padding: 0.3rem 0;
            gap: 0.15rem;
        }
        
        .info-item .label {
            font-size: 0.8rem;
        }
        
        .info-item .value {
            font-size: 0.85rem;
        }
    }

    /* Loading states */
    .loading {
        text-align: center;
        padding: 2rem;
        color: #666;
    }

    .center {
        text-align: center;
    }

    /* Legacy compatibility */
	:global(.curOwner) {
		font-size: 0.75em;
		color: #bbb;
		font-style: italic;
	}
</style>

<!-- Dynamic Header for Game Week Countdown / Live Scores / Weekly Winner -->
<DynamicHeader />

<!-- Modern Dashboard Grid Layout -->
<div class="dashboard">
    <!-- League Welcome/Blog Card - PRIORITY 1: Brand Recognition First -->
    <div class="dashboard-card">
        <div class="card-header welcome">
            <span>📰</span>
            <span>{leagueName}</span>
        </div>
        <div class="card-content">
            {#if enableBlog}
                <HomePost />
            {:else}
                <div style="text-align: center; color: var(--textColor);">
                    <p><strong>Welcome to {leagueName}!</strong></p>
                    <p>Your premier fantasy football destination since 2020.</p>
                </div>
            {/if}
        </div>
    </div>

    <!-- NFL State Card - PRIORITY 2: Context Setting -->
    <div class="dashboard-card nfl-state-card">
        <div class="card-header nfl-state">
            <span>🏈</span>
            <span>League Info</span>
        </div>
        <div class="card-content">
            {#await nflState}
                <div class="loading">Loading league info...</div>
                <LinearProgress indeterminate />
            {:then nflStateData}
                <div class="league-info-content">
                    <!-- League Format & Status -->
                    <div class="info-item">
                        <span class="label">Format:</span>
                        <span class="value">12-Team {dynasty ? 'Dynasty' : 'Redraft'}</span>
                    </div>
                    
                    <div class="info-item">
                        <span class="label">Season:</span>
                        <span class="value">{nflStateData.season} ({nflStateData.season_type === 'pre' ? 'Preseason' : nflStateData.season_type === 'post' ? 'Playoffs' : `Week ${nflStateData.week || 1}`})</span>
                    </div>
                    
                    <div class="info-item">
                        <span class="label">League Age:</span>
                        <span class="value">{nflStateData.season - 2020 + 1} Seasons</span>
                    </div>
                    
                    <!-- Season-specific context -->
                    {#if nflStateData.season_type === 'pre'}
                        <div class="info-item">
                            <span class="label">Status:</span>
                            <span class="value preseason">Draft Season 🏈</span>
                        </div>
                    {:else if nflStateData.season_type === 'post'}
                        <div class="info-item">
                            <span class="label">Status:</span>
                            <span class="value playoffs">Playoff Time! 🏆</span>
                        </div>
                    {:else}
                        <div class="info-item">
                            <span class="label">Status:</span>
                            <span class="value regular">Battle Mode ⚔️</span>
                        </div>
                    {/if}
                </div>
            {:catch error}
                <div class="center">Error loading league info: {error.message}</div>
            {/await}
        </div>
    </div>

    <!-- Current Champion Card - PRIORITY 3: Achievement Highlight -->
    <div class="dashboard-card champion-card">
        <div class="card-header champion">
            <span>🏆</span>
            <span>Reigning Champion</span>
        </div>
        <div class="card-content">
            {#await waitForAll(podiumsData, leagueTeamManagersData)}
                <div class="loading">Retrieving awards...</div>
                <LinearProgress indeterminate />
            {:then [podiums, leagueTeamManagers]}
                {#if podiums[0]}
                    <div class="champion-title">{podiums[0].year} Fantasy Champ</div>
                    <div class="champion-display" 
                         on:click={() => {if(managers.length) gotoManager({year: podiums[0].year, leagueTeamManagers, rosterID: parseInt(podiums[0].champion)})}}
                         on:keydown={() => {if(managers.length) gotoManager({year: podiums[0].year, leagueTeamManagers, rosterID: parseInt(podiums[0].champion)})}}
                         role="button"
                         tabindex="0">
                        <img src="{getAvatarFromTeamManagers(leagueTeamManagers, podiums[0].champion, podiums[0].year)}" 
                             class="champion-avatar" 
                             alt="champion" />
                        <img src="/laurel.png" class="champion-laurel" alt="laurel" />
                    </div>
                    <div class="champion-name"
                         on:click={() => gotoManager({year: podiums[0].year, leagueTeamManagers, rosterID: parseInt(podiums[0].champion)})}
                         on:keydown={() => gotoManager({year: podiums[0].year, leagueTeamManagers, rosterID: parseInt(podiums[0].champion)})}
                         role="button"
                         tabindex="0">
                        {getTeamFromTeamManagers(leagueTeamManagers, podiums[0].champion, podiums[0].year).name}
                    </div>
                {:else}
                    <div class="center">No former champs.</div>
                {/if}
            {:catch error}
                <div class="center">Something went wrong: {error.message}</div>
            {/await}
        </div>
    </div>

    <!-- Smart Conditional Power Rankings - Based on NFL Season State -->
    {#await nflState}
        <div class="dashboard-card card-large">
            <div class="card-header power-rankings">
                <span>📊</span>
                <span>Power Rankings</span>
            </div>
            <div class="card-content compact">
                <div class="loading">Loading power rankings...</div>
                <LinearProgress indeterminate />
            </div>
        </div>
    {:then nflStateData}
        {#if nflStateData.season_type === 'pre'}
            <!-- PRESEASON: Show Power Rankings in large format (primary focus) -->
            <div class="dashboard-card card-large">
                <div class="card-header power-rankings">
                    <span>📊</span>
                    <span>Power Rankings</span>
                </div>
                <div class="card-content compact">
                    {#await waitForAll(rostersData, leagueTeamManagersData, playersInfo, leagueData)}
                        <div class="loading">Loading power rankings...</div>
                        <LinearProgress indeterminate />
                    {:then [rostersDataResolved, leagueTeamManagers, playersInfoResolved, leagueDataResolved]}
                        <PowerRankingsCompact 
                            nflState={nflStateData} 
                            rostersData={rostersDataResolved} 
                            {leagueTeamManagers} 
                            playersInfo={playersInfoResolved} 
                            leagueData={leagueDataResolved} 
                        />
                    {:catch error}
                        <div class="center">Error loading power rankings: {error.message}</div>
                    {/await}
                </div>
            </div>
        {:else}
            <!-- REGULAR SEASON & POSTSEASON: Show Power Rankings in regular format -->
            <div class="dashboard-card">
                <div class="card-header power-rankings">
                    <span>📊</span>
                    <span>Power Rankings</span>
                </div>
                <div class="card-content compact">
                    {#await waitForAll(rostersData, leagueTeamManagersData, playersInfo, leagueData)}
                        <div class="loading">Loading power rankings...</div>
                        <LinearProgress indeterminate />
                    {:then [rostersDataResolved, leagueTeamManagers, playersInfoResolved, leagueDataResolved]}
                        <PowerRankingsCompact 
                            nflState={nflStateData} 
                            rostersData={rostersDataResolved} 
                            {leagueTeamManagers} 
                            playersInfo={playersInfoResolved} 
                            leagueData={leagueDataResolved} 
                        />
                    {:catch error}
                        <div class="center">Error loading power rankings: {error.message}</div>
                    {/await}
                </div>
            </div>
        {/if}
    {:catch error}
        <div class="dashboard-card">
            <div class="card-header">
                <span>⚠️</span>
                <span>Error Loading Power Rankings</span>
            </div>
            <div class="card-content">
                <div class="center">Unable to load season data: {error.message}</div>
            </div>
        </div>
    {/await}

    <!-- Recent Transactions Card -->
    <div class="dashboard-card">
        <div class="card-header transactions">
            <span>⚡</span>
            <span>Recent Activity</span>
        </div>
        <div class="card-content compact">
            <TransactionsCompact />
        </div>
    </div>

    <!-- Smart Conditional Standings - Based on NFL Season State -->
    {#await nflState}
        <div class="dashboard-card">
            <div class="card-header">
                <span>🏆</span>
                <span>Standings</span>
            </div>
            <div class="card-content compact">
                <div class="loading">Loading standings...</div>
                <LinearProgress indeterminate />
            </div>
        </div>
    {:then nflStateData}
        {#if nflStateData.season_type === 'pre'}
            <!-- PRESEASON: Hide Standings (empty/meaningless data) -->
            <!-- Standings card is hidden during preseason to avoid showing "no standings yet" -->
        {:else if nflStateData.season_type === 'post'}
            <!-- POSTSEASON: Prioritize Standings with playoff context -->
            <div class="dashboard-card card-large">
                <div class="card-header">
                    <span>🏆</span>
                    <span>Playoff Standings</span>
                </div>
                <div class="card-content compact">
                    <StandingsCompact {standingsData} leagueTeamManagersData={leagueTeamManagersData} />
                </div>
            </div>
        {:else}
            <!-- REGULAR SEASON: Show normal Standings -->
            <div class="dashboard-card">
                <div class="card-header">
                    <span>🏆</span>
                    <span>Standings</span>
                </div>
                <div class="card-content compact">
                    <StandingsCompact {standingsData} leagueTeamManagersData={leagueTeamManagersData} />
                </div>
            </div>
        {/if}
    {:catch error}
        <div class="dashboard-card">
            <div class="card-header">
                <span>⚠️</span>
                <span>Error Loading Standings</span>
            </div>
            <div class="card-content">
                <div class="center">Unable to load standings: {error.message}</div>
            </div>
        </div>
    {/await}

</div>