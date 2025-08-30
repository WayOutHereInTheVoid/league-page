<script>
	import { gotoManager } from '$lib/utils/helper';
	import { getTeamFromTeamManagers } from '$lib/utils/helperFunctions/universalFunctions';
	import TransactionCard from './TransactionCard.svelte';

	export let transaction, players, leagueTeamManagers;
	// Search functionality props
	export let searchQuery = '';
	export let highlightSearchTerms = () => {};

    const owner = transaction.rosters[0];

    const getAvatar = (pos, player) => {
        if(pos == 'DEF') {
            return `background-image: url(https://sleepercdn.com/images/team_logos/nfl/${player.toLowerCase()}.png)`;
        }
        return `background-image: url(https://sleepercdn.com/content/nfl/players/thumb/${player}.jpg), url(https://sleepercdn.com/images/v2/icons/player_default.webp)`;
    };

    // Helper function for relative timestamps
    const getRelativeTime = (dateString) => {
        const transactionDate = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor((now - transactionDate) / (1000 * 60));
        
        if (diffInMinutes < 60) {
            return diffInMinutes <= 1 ? '1 minute ago' : `${diffInMinutes} minutes ago`;
        }
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) {
            return diffInHours === 1 ? '1 hour ago' : `${diffInHours} hours ago`;
        }
        
        const diffInDays = Math.floor(diffInHours / 24);
        return diffInDays === 1 ? '1 day ago' : `${diffInDays} days ago`;
    };
</script>

<style>
    .clickable {
        cursor: pointer;
        transition: all 0.2s ease;
    }
    
    .clickable:hover {
        transform: translateY(-1px);
    }

    .split-waiver-card {
        display: flex;
        flex-direction: column;
    }

    /* COMPACT HEADER STYLES */
    .waiver-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        background: var(--transaction-card-header-bg);
        border-bottom: 1px solid var(--transaction-card-border);
    }

    .team-info {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .team-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 2px solid var(--blueOne);
        background-color: var(--fff);
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    }

    .team-details {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    .team-name {
        font-size: 1rem;
        font-weight: 700;
        color: var(--blueTwo);
        margin: 0;
        line-height: 1.2;
    }

    .current-owner {
        font-style: italic;
        color: var(--g555);
        font-weight: normal;
        font-size: 0.9em;
    }

    .timestamp {
        font-size: 0.8rem;
        color: var(--g555);
        font-weight: 500;
    }

    .transaction-type {
        display: flex;
        align-items: center;
        gap: 6px;
        font-weight: 600;
        font-size: 0.9rem;
        color: var(--blueTwo);
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .transaction-type i {
        font-size: 1.1rem;
    }

    /* SPLIT ACTIONS STYLES */
    .split-actions {
        display: grid;
        grid-template-columns: 1fr 1fr;
        min-height: 120px;
    }

    .action-section {
        display: flex;
        flex-direction: column;
        padding: 16px;
        position: relative;
    }

    .action-section.added {
        background: var(--waiver-add-bg, rgba(76, 175, 80, 0.08));
        border-right: 1px solid var(--transaction-card-border);
    }

    .action-section.dropped {
        background: var(--waiver-drop-bg, rgba(233, 30, 99, 0.08));
    }

    .action-label {
        display: flex;
        align-items: center;
        gap: 6px;
        font-weight: 700;
        font-size: 0.8rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 12px;
    }

    .action-section.added .action-label {
        color: var(--action-label-add, #4CAF50);
    }

    .action-section.dropped .action-label {
        color: var(--action-label-drop, #E91E63);
    }

    .action-label i {
        font-size: 1rem;
    }

    .player-info {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
    }

    .player-avatar {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background-position: center;
        background-repeat: no-repeat;
        background-size: auto 60px;
        border: 3px solid;
        box-shadow: 0 3px 8px rgba(0, 0, 0, 0.12), 0 1px 3px rgba(0, 0, 0, 0.08);
        transition: all 0.2s ease;
    }

    .player-details {
        text-align: center;
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .player-name {
        font-size: 0.95rem;
        font-weight: 600;
        color: var(--g111);
        line-height: 1.2;
    }

    .player-position {
        font-size: 0.8rem;
        color: var(--g444);
        font-weight: 500;
        letter-spacing: 0.1px;
    }

    /* FOOTER STYLES */
    .waiver-footer {
        padding: 8px 16px;
        background: var(--transaction-card-footer-bg);
        border-top: 1px solid var(--transaction-card-footer-border);
        text-align: center;
    }

    .full-date {
        color: var(--g555);
        font-style: italic;
        font-size: 0.75rem;
    }

    /* MOBILE RESPONSIVENESS */
    @media (max-width: 768px) {
        .waiver-header {
            padding: 10px 12px;
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
        }

        .team-info {
            gap: 10px;
        }

        .team-avatar {
            width: 36px;
            height: 36px;
        }

        .team-name {
            font-size: 0.95rem;
        }

        .timestamp {
            font-size: 0.75rem;
        }

        .transaction-type {
            font-size: 0.85rem;
        }

        .split-actions {
            grid-template-columns: 1fr;
            min-height: auto;
        }

        .action-section {
            padding: 14px 12px;
        }

        .action-section.added {
            border-right: none;
            border-bottom: 1px solid var(--transaction-card-border);
        }

        .player-avatar {
            width: 55px;
            height: 55px;
            background-size: auto 55px;
        }

        .player-name {
            font-size: 0.9rem;
        }

        .player-position {
            font-size: 0.75rem;
        }

        .waiver-footer {
            padding: 6px 12px;
        }

        .full-date {
            font-size: 0.7rem;
        }
    }

    @media (max-width: 480px) {
        .waiver-header {
            padding: 12px;
        }

        .team-info {
            gap: 8px;
        }

        .team-avatar {
            width: 34px;
            height: 34px;
        }

        .team-name {
            font-size: 0.9rem;
        }

        .action-section {
            padding: 16px 12px;
        }

        .player-avatar {
            width: 52px;
            height: 52px;
            background-size: auto 52px;
        }

        .player-name {
            font-size: 0.85rem;
        }

        .player-position {
            font-size: 0.7rem;
        }
    }
</style>

<div 
    class="clickable" 
    role="button"
    tabindex="0"
    on:click={() => gotoManager({year: transaction.season, leagueTeamManagers, rosterID: owner})}
    on:keydown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            gotoManager({year: transaction.season, leagueTeamManagers, rosterID: owner});
        }
    }}
    aria-label="View {getTeamFromTeamManagers(leagueTeamManagers, owner, transaction.season).name} manager details"
>
    <TransactionCard {transaction} {leagueTeamManagers}>
        <div class="split-waiver-card">
            <!-- COMPACT HEADER: Team info + FAAB -->
            <div class="waiver-header">
                <div class="team-info">
                    <img class="team-avatar" src="{getTeamFromTeamManagers(leagueTeamManagers, owner, transaction.season).avatar}" alt="{getTeamFromTeamManagers(leagueTeamManagers, owner, transaction.season).name} avatar"/>
                    <div class="team-details">
                        <h3 class="team-name">
                            {@html searchQuery ? highlightSearchTerms(getTeamFromTeamManagers(leagueTeamManagers, owner, transaction.season).name, searchQuery) : getTeamFromTeamManagers(leagueTeamManagers, owner, transaction.season).name}
                            {#if getTeamFromTeamManagers(leagueTeamManagers, owner, transaction.season).name != getTeamFromTeamManagers(leagueTeamManagers, owner).name}
                                <span class="current-owner">({@html searchQuery ? highlightSearchTerms(getTeamFromTeamManagers(leagueTeamManagers, owner).name, searchQuery) : getTeamFromTeamManagers(leagueTeamManagers, owner).name})</span>
                            {/if}
                        </h3>
                        <span class="timestamp">{getRelativeTime(transaction.date)}</span>
                    </div>
                </div>
                <div class="transaction-type">
                    <i class="material-icons">swap_horiz</i>
                    Waiver{#if transaction.moves[0][0].bid} • ${transaction.moves[0][0].bid}{/if}
                </div>
            </div>
            
            <!-- SPLIT ACTIONS: Clear ADD vs DROP -->
            <div class="split-actions">
                {#each transaction.moves as move}
                    {#if move[0].type === "Added"}
                        <div class="action-section added">
                            <div class="action-label">
                                <i class="material-icons">add_circle</i>
                                ADDED
                            </div>
                            <div class="player-info">
                                <div class="player-avatar" style="border-color: var(--{players[move[0].player].pos}); {getAvatar(players[move[0].player].pos, move[0].player)}">
                                </div>
                                <div class="player-details">
                                    <span class="player-name">{@html searchQuery ? highlightSearchTerms(`${players[move[0].player].fn} ${players[move[0].player].ln}`, searchQuery) : `${players[move[0].player].fn} ${players[move[0].player].ln}`}</span>
                                    <span class="player-position">
                                        {players[move[0].player].pos}
                                        {#if players[move[0].player].t}
                                            • {players[move[0].player].t}
                                        {/if}
                                    </span>
                                </div>
                            </div>
                        </div>
                    {:else if move[0].type === "Dropped"}
                        <div class="action-section dropped">
                            <div class="action-label">
                                <i class="material-icons">remove_circle</i>
                                DROPPED
                            </div>
                            <div class="player-info">
                                <div class="player-avatar" style="border-color: var(--{players[move[0].player].pos}); {getAvatar(players[move[0].player].pos, move[0].player)}">
                                </div>
                                <div class="player-details">
                                    <span class="player-name">{@html searchQuery ? highlightSearchTerms(`${players[move[0].player].fn} ${players[move[0].player].ln}`, searchQuery) : `${players[move[0].player].fn} ${players[move[0].player].ln}`}</span>
                                    <span class="player-position">
                                        {players[move[0].player].pos}
                                        {#if players[move[0].player].t}
                                            • {players[move[0].player].t}
                                        {/if}
                                    </span>
                                </div>
                            </div>
                        </div>
                    {/if}
                {/each}
            </div>
            
            <!-- SIMPLE FOOTER: Full timestamp -->
            <div class="waiver-footer">
                <span class="full-date">{transaction.date}</span>
            </div>
        </div>
    </TransactionCard>
</div>
