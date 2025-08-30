<script>
    import { getTeamFromTeamManagers } from '$lib/utils/helperFunctions/universalFunctions';
    
    export let transaction;
    export let leagueTeamManagers;
    
    // Get participating teams for the header
    const getParticipatingTeams = (transaction) => {
        return transaction.rosters.map(rosterID => 
            getTeamFromTeamManagers(leagueTeamManagers, rosterID, transaction.season)
        );
    };
    
    const teams = getParticipatingTeams(transaction);
</script>

<style>
    .transaction-card {
        background: var(--transaction-card-bg);
        border-radius: 8px;
        border-left: 3px solid var(--blueOne);
        box-shadow: 0 2px 8px var(--transaction-card-shadow);
        margin-bottom: 0.6rem;
        overflow: hidden;
        transition: all 0.3s ease;
        position: relative;
    }
    
    .transaction-card:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 16px var(--transaction-card-shadow-hover);
        border-left-width: 4px;
    }
    
    .card-header {
        background: var(--transaction-card-header-bg);
        padding: 8px 16px 6px;
        border-bottom: 1px solid var(--transaction-card-border);
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: relative;
    }
    
    .transaction-type {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
        font-size: 0.9rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    
    .transaction-type.trade {
        color: var(--blueOne);
    }
    
    .transaction-type.waiver {
        color: var(--blueTwo);
    }
    
    .transaction-type i {
        font-size: 1.1rem;
    }
    
    .card-content {
        padding: 0;
        position: relative;
    }
    
    .card-footer {
        padding: 6px 16px;
        background: var(--transaction-card-footer-bg);
        border-top: 1px solid var(--transaction-card-footer-border);
        display: flex;
        justify-content: center;
        align-items: center;
    }
    
    .transaction-date {
        color: var(--g555);
        font-style: italic;
        font-size: 0.8rem;
        margin: 0;
    }
    
    /* Mobile responsiveness */
    @media (max-width: 768px) {
        .transaction-card {
            margin-bottom: 0.8rem;
            border-radius: 8px;
        }
        
        .card-header {
            padding: 8px 12px 6px;
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
        }
        
        .transaction-type {
            font-size: 0.85rem;
        }
        
        .card-footer {
            padding: 6px 12px;
        }
        
        .transaction-date {
            font-size: 0.75rem;
        }
    }
    
    @media (max-width: 480px) {
        .card-header {
            padding: 10px 12px 8px;
        }
        
        .transaction-type {
            font-size: 0.8rem;
        }
        
        .card-footer {
            padding: 8px 12px;
        }
    }
</style>

<div class="transaction-card">
    <div class="card-header">
        <div class="transaction-type {transaction.type}">
            {#if transaction.type === 'trade'}
                <i class="material-icons" aria-hidden="true">swap_horiz</i>
                Trade
            {:else}
                <i class="material-icons" aria-hidden="true">person_add</i>
                Waiver
            {/if}
        </div>
    </div>
    
    <div class="card-content">
        <slot />
    </div>
    
    <div class="card-footer">
        <p class="transaction-date">{transaction.date}</p>
    </div>
</div>
