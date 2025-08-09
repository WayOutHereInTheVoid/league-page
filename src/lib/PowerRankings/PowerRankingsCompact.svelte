<script>
    import { generateGraph, getTeamFromTeamManagers, round, predictScores, loadPlayers } from '$lib/utils/helper';
    export let nflState, rostersData, leagueTeamManagers, playersInfo, leagueData;

    const rosters = rostersData.rosters;

    let validGraph = false;
    let rosterPowers = [];
    let seasonOver = false;

    const buildRankings = () => {
        const tempRosterPowers = [];
        let week = nflState.week;
        if(week == 0) {
            week = 1;
        }
        let max = 0;

        for(const rosterID in rosters) {
            const roster = rosters[rosterID];
            // make sure the roster has players on it
            if(!roster.players) continue;
            // if at least one team has players, create the graph
            validGraph = true;

            const rosterPlayers = [];

            for(const rosterPlayer of roster.players) {
                if(!players[rosterPlayer]) continue;
                rosterPlayers.push({
                    name: players[rosterPlayer].ln,
                    pos: players[rosterPlayer].pos,
                    wi: players[rosterPlayer].wi
                })
            }

            const rosterPower = {
                rosterID,
                manager: getTeamFromTeamManagers(leagueTeamManagers, rosterID),
                powerScore: 0,
            }
            const seasonEnd = 18;
            if(week >= seasonEnd) {
                seasonOver = true;
            }
            for(let i = week; i < seasonEnd; i++) {
                rosterPower.powerScore += predictScores(rosterPlayers, i, leagueData);
            }
            if(rosterPower.powerScore > max) {
                max = rosterPower.powerScore;
            }
            tempRosterPowers.push(rosterPower);
        }

        // Normalize scores and sort
        for(const rosterPower of tempRosterPowers) {
            rosterPower.powerScore = round(rosterPower.powerScore/max * 100);
        }

        // Sort by power score
        rosterPowers = tempRosterPowers.sort((a, b) => b.powerScore - a.powerScore);
    }

    let players = playersInfo.players;

    buildRankings();

    const refreshPlayers = async () => {
        const newPlayersInfo = await loadPlayers(null, true);
        players = newPlayersInfo.players;
        buildRankings();
    }

    if(playersInfo.stale) {
        refreshPlayers();
    }
</script>

<style>
    .compact-rankings {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .ranking-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 0.75rem;
        background: var(--fff);
        border-radius: 8px;
        border: 1px solid var(--ddd);
        transition: background-color 0.2s ease;
    }

    .ranking-item:hover {
        background: var(--f9f9f9);
    }

    .rank-position {
        font-weight: 600;
        font-size: 1.1rem;
        color: var(--blueOne);
        min-width: 24px;
        text-align: center;
    }

    .rank-position.top-three {
        color: #FFD700;
    }

    .manager-info {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex: 1;
    }

    .manager-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 2px solid var(--blueOne);
    }

    .manager-name {
        font-weight: 500;
        font-size: 0.9rem;
        color: var(--textColor);
    }

    .power-score {
        font-weight: 600;
        font-size: 0.9rem;
        color: var(--blueOne);
        min-width: 40px;
        text-align: right;
    }

    .power-bar {
        height: 4px;
        background: var(--blueOne);
        border-radius: 2px;
        margin-top: 0.25rem;
        transition: width 0.3s ease;
    }

    .no-rankings {
        text-align: center;
        color: #666;
        font-style: italic;
        padding: 2rem;
    }

    .season-over {
        text-align: center;
        color: #666;
        font-style: italic;
        padding: 1rem;
    }

    @media (max-width: 768px) {
        .ranking-item {
            padding: 0.5rem;
            gap: 0.75rem;
        }

        .manager-avatar {
            width: 28px;
            height: 28px;
        }

        .manager-name {
            font-size: 0.85rem;
        }

        .power-score {
            font-size: 0.85rem;
        }
    }
</style>

{#if !validGraph}
    <div class="no-rankings">
        No power rankings available yet
    </div>
{:else if seasonOver}
    <div class="season-over">
        Season complete - no projections available
    </div>
{:else}
    <div class="compact-rankings">
        {#each rosterPowers.slice(0, 8) as ranking, index}
            <div class="ranking-item">
                <div class="rank-position {index < 3 ? 'top-three' : ''}">
                    {index + 1}
                </div>
                <div class="manager-info">
                    <img 
                        src="{ranking.manager.avatar}" 
                        alt="{ranking.manager.name} avatar"
                        class="manager-avatar"
                    />
                    <div>
                        <div class="manager-name">{ranking.manager.name}</div>
                        <div class="power-bar" style="width: {ranking.powerScore}%"></div>
                    </div>
                </div>
                <div class="power-score">
                    {ranking.powerScore}
                </div>
            </div>
        {/each}
        {#if rosterPowers.length > 8}
            <div style="text-align: center; margin-top: 0.5rem;">
                <a href="/standings" style="color: var(--blueOne); font-size: 0.85rem; text-decoration: none;">
                    View all rankings →
                </a>
            </div>
        {/if}
    </div>
{/if}
