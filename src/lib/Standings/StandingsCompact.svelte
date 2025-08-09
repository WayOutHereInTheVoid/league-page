<script>
    import { round } from '$lib/utils/helper';
    import { getTeamFromTeamManagers } from '$lib/utils/helperFunctions/universalFunctions';
    import LinearProgress from '@smui/linear-progress';
    import { onMount } from 'svelte';

    export let standingsData, leagueTeamManagersData;

    // Least important to most important (i.e. the most important [usually wins] goes last)
    const sortOrder = ["fptsAgainst", "divisionTies", "divisionWins", "fpts", "ties", "wins"];

    let loading = true;
    let preseason = false;
    let standings, year, leagueTeamManagers;
    
    onMount(async () => {
        const asyncStandingsData = await standingsData;
        if(!asyncStandingsData) {
            loading = false;
            preseason = true;
            return;
        }
        const {standingsInfo, yearData} = asyncStandingsData;
        leagueTeamManagers = await leagueTeamManagersData;
        year = yearData;

        let finalStandings = Object.keys(standingsInfo).map((key) => standingsInfo[key]);

        for(const sortType of sortOrder) {
            if(!finalStandings[0][sortType] && finalStandings[0][sortType] != 0) {
                continue;
            }
            finalStandings = [...finalStandings].sort((a,b) => b[sortType] - a[sortType]);
        }

        standings = finalStandings;
        loading = false;
    })

    function getWinPercentage(wins, losses, ties = 0) {
        const totalGames = wins + losses + ties;
        if (totalGames === 0) return 0;
        return round((wins + (ties * 0.5)) / totalGames * 100);
    }
</script>

<style>
    .compact-standings {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .standing-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 0.75rem;
        background: var(--fff);
        border-radius: 8px;
        border: 1px solid var(--ddd);
        transition: background-color 0.2s ease;
    }

    .standing-item:hover {
        background: var(--f9f9f9);
    }

    .standing-position {
        font-weight: 600;
        font-size: 1.1rem;
        color: var(--blueOne);
        min-width: 24px;
        text-align: center;
    }

    .standing-position.playoff-bound {
        color: #2e7d32;
    }

    .standing-position.bubble {
        color: #f57c00;
    }

    .team-info {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex: 1;
    }

    .team-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 2px solid var(--blueOne);
    }

    .team-details {
        flex: 1;
    }

    .team-name {
        font-weight: 500;
        font-size: 0.9rem;
        color: var(--textColor);
        line-height: 1.2;
    }

    .team-record {
        font-size: 0.75rem;
        color: #666;
    }

    .team-stats {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 0.25rem;
    }

    .win-percentage {
        font-weight: 600;
        font-size: 0.9rem;
        color: var(--blueOne);
    }

    .points-for {
        font-size: 0.75rem;
        color: #666;
    }

    .loading-container {
        text-align: center;
        padding: 1rem;
    }

    .no-standings {
        text-align: center;
        color: #666;
        font-style: italic;
        padding: 2rem;
    }

    .view-more {
        text-align: center;
        margin-top: 0.5rem;
    }

    .view-more a {
        color: var(--blueOne);
        font-size: 0.85rem;
        text-decoration: none;
    }

    .view-more a:hover {
        text-decoration: underline;
    }

    @media (max-width: 768px) {
        .standing-item {
            padding: 0.5rem;
            gap: 0.75rem;
        }

        .team-avatar {
            width: 28px;
            height: 28px;
        }

        .team-name {
            font-size: 0.85rem;
        }

        .team-record {
            font-size: 0.7rem;
        }

        .win-percentage {
            font-size: 0.85rem;
        }

        .points-for {
            font-size: 0.7rem;
        }
    }
</style>

<div class="compact-standings">
    {#if loading}
        <div class="loading-container">
            <p>Loading standings...</p>
            <LinearProgress indeterminate />
        </div>
    {:else if preseason}
        <div class="no-standings">
            Preseason - no standings yet
        </div>
    {:else}
        {#each standings.slice(0, 8) as standing, index}
            {@const team = getTeamFromTeamManagers(leagueTeamManagers, standing.rosterID)}
            {@const winPct = getWinPercentage(standing.wins, standing.losses, standing.ties)}
            {@const isPlayoffBound = index < 6}
            {@const isBubble = index >= 6 && index < 8}
            
            <div class="standing-item">
                <div class="standing-position {isPlayoffBound ? 'playoff-bound' : isBubble ? 'bubble' : ''}">
                    {index + 1}
                </div>
                
                <div class="team-info">
                    <img 
                        src="{team.avatar}" 
                        alt="{team.name} avatar"
                        class="team-avatar"
                    />
                    <div class="team-details">
                        <div class="team-name">{team.name}</div>
                        <div class="team-record">
                            {standing.wins}-{standing.losses}{standing.ties > 0 ? `-${standing.ties}` : ''}
                        </div>
                    </div>
                </div>

                <div class="team-stats">
                    <div class="win-percentage">{winPct}%</div>
                    <div class="points-for">{round(standing.fpts)} PF</div>
                </div>
            </div>
        {/each}

        {#if standings.length > 8}
            <div class="view-more">
                <a href="/standings">View full standings →</a>
            </div>
        {/if}
    {/if}
</div>
