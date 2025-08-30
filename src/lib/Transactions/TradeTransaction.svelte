<script>
	import { gotoManager } from '$lib/utils/helper';
	import { getTeamFromTeamManagers } from '$lib/utils/helperFunctions/universalFunctions';
	import TransactionMove from './TransactionMove.svelte';
	import TransactionCard from './TransactionCard.svelte';

	export let transaction, players, leagueTeamManagers;
	// NEW: Search functionality props
	export let searchQuery = '';
	export let highlightSearchTerms = () => {};
</script>

<style>
    .trade-content {
        display: flex;
        position: relative;
        flex-direction: column;
    }
    
    .name {
        position: relative;
        text-align: center;
    }

    .avatar {
        border-radius: 50%;
        height: 30px;
        width: 30px;
        border: 1px solid var(--blueOne);
        background-color: var(--fff);
    }

    .ownerName {
        display: inline-block;
        font-weight: 600;
        line-height: 1em;
        margin: 0.1em;
        color: var(--blueOne);
        font-size: 0.9rem;
    }

    .currentOwner {
        font-style: italic;
        color: var(--g555);
        font-size: 0.7em;
        font-weight: normal;
    }

    .clickable {
        cursor: pointer;
        transition: all 0.2s ease;
    }
    
    .clickable:hover {
        transform: scale(1.02);
    }

    table {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
        /*
            the height setting is ignored, but
            allows the holder class div to have
            a height of 100%
        */
        height: 1px;
        margin: 6px 0;
    }

    thead th {
        background: var(--transactHeader);
        border-bottom: 2px solid var(--borderOverride);
        padding: 8px 4px;
        font-size: 0.9rem;
    }

    tbody {
        background-color: var(--fff);
    }

    .holder {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        height: 100%;
        gap: 6px;
        padding: 8px 4px;
    }

    @media (max-width: 768px) {
        .ownerName {
            font-size: 0.85em;
        }
        
        .avatar {
            height: 35px;
            width: 35px;
        }
        
        thead th {
            padding: 12px 6px;
        }
    }

    @media (max-width: 480px) {
        .ownerName {
            font-size: 0.8em;
        }
        
        .avatar {
            height: 32px;
            width: 32px;
        }
        
        thead th {
            padding: 10px 4px;
        }
    }
</style>

<TransactionCard {transaction} {leagueTeamManagers} showImpactIndicator={false}>
    <div class="trade-content">
        <table>
            <thead>
                <tr>
                    {#each transaction.rosters as owner}
                        <th class="name clickable" style="width: {1 / transaction.rosters.length * 100}%;" onclick={() => gotoManager({year: transaction.season, leagueTeamManagers, rosterID: owner})}>
                            <div class="holder">
                                <img class="avatar" src="{getTeamFromTeamManagers(leagueTeamManagers, owner, transaction.season).avatar}" alt="{getTeamFromTeamManagers(leagueTeamManagers, owner, transaction.season).name} avatar"/>
                                <span class="ownerName">
                                    {@html searchQuery ? highlightSearchTerms(getTeamFromTeamManagers(leagueTeamManagers, owner, transaction.season).name, searchQuery) : getTeamFromTeamManagers(leagueTeamManagers, owner, transaction.season).name}
                                    {#if getTeamFromTeamManagers(leagueTeamManagers, owner, transaction.season).name != getTeamFromTeamManagers(leagueTeamManagers, owner).name}
                                        <br />
                                        <span class="currentOwner">({@html searchQuery ? highlightSearchTerms(getTeamFromTeamManagers(leagueTeamManagers, owner).name, searchQuery) : getTeamFromTeamManagers(leagueTeamManagers, owner).name})</span>
                                    {/if}
                                </span>
                            </div>
                        </th>
                    {/each}
                </tr>
            </thead>
            <tbody>
                {#each transaction.moves as move}
                    <TransactionMove {players} {move} type={transaction.type} {leagueTeamManagers} season={transaction.season} {searchQuery} {highlightSearchTerms} />
                {/each}
            </tbody>
        </table>
    </div>
</TransactionCard>
