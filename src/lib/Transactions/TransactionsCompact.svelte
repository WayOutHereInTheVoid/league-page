<script>
    import { goto } from '$app/navigation';
    import { getLeagueTransactions, getLeagueTeamManagers, loadPlayers, waitForAll } from '$lib/utils/helper';
    import LinearProgress from '@smui/linear-progress';
    import { onMount } from 'svelte';
    import { getTeamFromTeamManagers } from '$lib/utils/helperFunctions/universalFunctions';

    let loading = true;
    let players;
    let transactions;
    let leagueTeamManagers;

    onMount(async () => {
        const [transactionsData, playersData, leagueTeamManagersData] = await waitForAll(getLeagueTransactions(true),loadPlayers(null), getLeagueTeamManagers());
        players = playersData.players;
        transactions = transactionsData.transactions;
        leagueTeamManagers = leagueTeamManagersData;
        loading = false;

        if(transactionsData.stale) {
            const newTransactions = await getLeagueTransactions(true, true);
            transactions = newTransactions.transactions;
        }

        if(playersData.stale) {
            const newPlayersData = await loadPlayers(true);
            players = newPlayersData.players;
        }
    })

    function getPlayerDisplayName(playerId) {
        if (!players[playerId]) return 'Unknown Player';
        return `${players[playerId].fn} ${players[playerId].ln}`;
    }

    function getPlayerInfo(playerId) {
        if (!players[playerId]) return { pos: 'N/A', team: '' };
        return {
            pos: players[playerId].pos || 'N/A',
            team: players[playerId].t || ''
        };
    }

    function formatDate(dateStr) {
        const date = new Date(dateStr);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString();
    }
</script>

<style>
    .compact-transactions {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .transaction-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem;
        background: var(--fff);
        border-radius: 8px;
        border: 1px solid var(--ddd);
        transition: background-color 0.2s ease;
        cursor: pointer;
    }

    .transaction-item:hover {
        background: var(--f9f9f9);
    }

    .transaction-type {
        font-size: 0.75rem;
        font-weight: 600;
        padding: 0.25rem 0.5rem;
        border-radius: 12px;
        text-transform: uppercase;
        min-width: 50px;
        text-align: center;
    }

    .type-trade {
        background: #e3f2fd;
        color: #1565c0;
    }

    .type-waiver {
        background: #f3e5f5;
        color: #7b1fa2;
    }

    .manager-info {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex: 1;
    }

    .manager-avatar {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 1px solid var(--ddd);
    }

    .manager-name {
        font-weight: 500;
        font-size: 0.85rem;
        color: var(--textColor);
    }

    .transaction-details {
        display: flex;
        flex-direction: column;
        flex: 2;
        min-width: 0;
    }

    .players-involved {
        font-size: 0.8rem;
        color: var(--textColor);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .player-added {
        color: #2e7d32;
        font-weight: 500;
    }

    .player-dropped {
        color: #d32f2f;
        font-weight: 500;
    }

    .transaction-date {
        font-size: 0.7rem;
        color: #666;
        white-space: nowrap;
    }

    .loading-container {
        text-align: center;
        padding: 1rem;
    }

    .no-transactions {
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
        .transaction-item {
            padding: 0.5rem;
            gap: 0.5rem;
        }

        .manager-name {
            font-size: 0.8rem;
        }

        .players-involved {
            font-size: 0.75rem;
        }

        .transaction-type {
            font-size: 0.7rem;
            padding: 0.2rem 0.4rem;
            min-width: 45px;
        }
    }
</style>

<div class="compact-transactions">
    {#if loading}
        <div class="loading-container">
            <p>Loading transactions...</p>
            <LinearProgress indeterminate />
        </div>
    {:else}
        {#if transactions.trades.length === 0 && transactions.waivers.length === 0}
            <div class="no-transactions">
                No recent activity
            </div>
        {:else}
            <!-- Combine and sort trades and waivers by date -->
            {#each [...transactions.trades.slice(0, 3).map(t => ({...t, type: 'trade'})), ...transactions.waivers.slice(0, 3).map(w => ({...w, type: 'waiver'}))]
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 5) as transaction}
                
                <div class="transaction-item" 
                     onclick={() => goto('/transactions')}
                     onkeydown={(e) => e.key === 'Enter' && goto('/transactions')}
                     role="button"
                     tabindex="0"
                >
                    <div class="transaction-type type-{transaction.type}">
                        {transaction.type}
                    </div>
                    
                    <div class="manager-info">
                        <img 
                            src="{getTeamFromTeamManagers(leagueTeamManagers, transaction.rosters[0], transaction.season).avatar}" 
                            alt="Team avatar"
                            class="manager-avatar"
                        />
                        <div class="manager-name">
                            {getTeamFromTeamManagers(leagueTeamManagers, transaction.rosters[0], transaction.season).name}
                        </div>
                    </div>

                    <div class="transaction-details">
                        {#if transaction.type === 'trade'}
                            <div class="players-involved">
                                {#if transaction.moves && transaction.moves.length > 0}
                                    {#each transaction.moves.slice(0, 2) as move}
                                        {#if move.length > 0 && move[0].player}
                                            {getPlayerDisplayName(move[0].player)}
                                            {#if transaction.moves.indexOf(move) < transaction.moves.length - 1 && transaction.moves.indexOf(move) < 1}, {/if}
                                        {/if}
                                    {/each}
                                    {#if transaction.moves.length > 2}...{/if}
                                {:else}
                                    Trade completed
                                {/if}
                            </div>
                        {:else}
                            <div class="players-involved">
                                {#if transaction.moves && transaction.moves.length > 0}
                                    {#each transaction.moves.slice(0, 2) as move}
                                        {#if move.length > 0 && move[0].player}
                                            <span class="player-{move[0].type === 'Added' ? 'added' : 'dropped'}">
                                                {move[0].type === 'Added' ? '+' : '-'}{getPlayerDisplayName(move[0].player)}
                                            </span>
                                            {#if transaction.moves.indexOf(move) < transaction.moves.length - 1 && transaction.moves.indexOf(move) < 1}, {/if}
                                        {/if}
                                    {/each}
                                    {#if transaction.moves.length > 2}...{/if}
                                {:else}
                                    Waiver activity
                                {/if}
                            </div>
                        {/if}
                    </div>

                    <div class="transaction-date">
                        {formatDate(transaction.date)}
                    </div>
                </div>
            {/each}

            <div class="view-more">
                <a href="/transactions">View all transactions →</a>
            </div>
        {/if}
    {/if}
</div>
