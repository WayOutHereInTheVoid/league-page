<script>
	import LinearProgress from '@smui/linear-progress';
	import { getNflState, leagueName, getAwards, getLeagueTeamManagers, homepageText, managers, gotoManager, enableBlog, waitForAll, getLeagueRosters, getLeagueData, loadPlayers, getLeagueStandings } from '$lib/utils/helper';
	import { TransactionsCompact, PowerRankingsCompact, HomePost, StandingsCompact} from '$lib/components';
	import { getAvatarFromTeamManagers, getTeamFromTeamManagers } from '$lib/utils/helperFunctions/universalFunctions';
	import { DynamicHeader } from '$lib/HomepageHeader';

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
        gap: 1.5rem;
        padding: 1rem;
        max-width: 1400px;
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

    .card-header.champion {
        background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
        color: #333;
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

    .nfl-state-content {
        font-size: 1.1rem;
        color: var(--textColor);
    }

    /* Champion Card Styling */
    .champion-card {
        text-align: center;
    }

    .champion-display {
        position: relative;
        width: 120px;
        height: 120px;
        margin: 0 auto 1rem;
        cursor: pointer;
    }

    .champion-avatar {
        position: absolute;
        transform: translate(-50%, -50%);
        width: 70px;
        height: 70px;
        border-radius: 100%;
        border: 2px solid #FFD700;
        left: 50%;
        top: 43%;
    }

    .champion-laurel {
        position: absolute;
        transform: translate(-50%, -50%);
        width: 110px;
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

    @media (max-width: 768px) {
        .dashboard {
            grid-template-columns: 1fr;
            padding: 0.5rem;
            gap: 1rem;
        }
        
        .card-content {
            padding: 1rem;
        }
        
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
    <!-- NFL State Card -->
    <div class="dashboard-card nfl-state-card">
        <div class="card-header nfl-state">
            <span>🏈</span>
            <span>NFL Status</span>
        </div>
        <div class="card-content">
            {#await nflState}
                <div class="loading">Retrieving NFL state...</div>
                <LinearProgress indeterminate />
            {:then nflStateData}
                <div class="nfl-state-content">
                    NFL {nflStateData.season}
                    {#if nflStateData.season_type == 'pre'}
                        Preseason
                    {:else if nflStateData.season_type == 'post'}
                        Postseason  
                    {:else}
                        Season - {nflStateData.week > 0 ? `Week ${nflStateData.week}` : "Preseason"}
                    {/if}
                </div>
            {:catch error}
                <div class="center">Something went wrong: {error.message}</div>
            {/await}
        </div>
    </div>

    <!-- Current Champion Card -->
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

    <!-- Power Rankings Card (Large) -->
    <div class="dashboard-card card-large">
        <div class="card-header power-rankings">
            <span>📊</span>
            <span>Power Rankings</span>
        </div>
        <div class="card-content compact">
            {#await waitForAll(nflState, rostersData, leagueTeamManagersData, playersInfo, leagueData)}
                <div class="loading">Loading power rankings...</div>
                <LinearProgress indeterminate />
            {:then [nflStateData, rostersDataResolved, leagueTeamManagers, playersInfoResolved, leagueDataResolved]}
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

    <!-- Standings Card -->
    <div class="dashboard-card">
        <div class="card-header">
            <span>🏆</span>
            <span>Standings</span>
        </div>
        <div class="card-content compact">
            <StandingsCompact {standingsData} leagueTeamManagersData={leagueTeamManagersData} />
        </div>
    </div>

    <!-- League Welcome/Blog Card (if blog is enabled, otherwise simple welcome) -->
    <div class="dashboard-card">
        <div class="card-header">
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
</div>