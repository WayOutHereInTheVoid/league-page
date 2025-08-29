<script>
    import { getTeamFromTeamManagers } from '$lib/utils/helperFunctions/universalFunctions';
    
    export let transaction;
    export let leagueTeamManagers;
    export let showImpactIndicator = true;
    
    // Calculate transaction impact level (will be enhanced in Phase 2)
    const calculateImpactLevel = (transaction) => {
        // Basic impact calculation - will be enhanced with proper trade value analysis
        if (transaction.type === 'trade') {
            const totalPlayers = transaction.moves.reduce((total, move) => {
                return total + move.filter(item => item && item.player).length;
            }, 0);
            
            if (totalPlayers >= 4) return 'high';
            if (totalPlayers >= 2) return 'medium';
            return 'low';
        }
        
        // For waivers, consider FAAB amount if available
        if (transaction.moves[0] && transaction.moves[0][0] && transaction.moves[0][0].bid) {
            const bid = transaction.moves[0][0].bid;
            if (bid >= 20) return 'medium';
        }
        
        return 'low';
    };
    
    const impactLevel = calculateImpactLevel(transaction);
    
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
    
    .transaction-card.high-impact {
        border-left-color: #4CAF50;
        border-left-width: 6px;
    }
    
    .transaction-card.medium-impact {
        border-left-color: #FF9800;
        border-left-width: 5px;
    }
    
    .transaction-card.low-impact {
        border-left-color: #9E9E9E;
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
    
    .impact-indicator {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 2px 6px;
        border-radius: 12px;
        font-size: 0.7rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.3px;
    }
    
    .impact-high {
        background: var(--r1);
        color: #2E7D32;
        border: 1px solid var(--blueOne);
    }
    
    .impact-medium {
        background: var(--r2);
        color: #F57C00;
        border: 1px solid var(--blueTwo);
    }
    
    .impact-low {
        background: var(--eee);
        color: var(--g555);
        border: 1px solid var(--ccc);
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
        
        .impact-indicator {
            font-size: 0.7rem;
            padding: 3px 6px;
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

<div class="transaction-card {impactLevel}-impact">
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
        
        {#if showImpactIndicator}
            <div class="impact-indicator impact-{impactLevel}">
                {#if impactLevel === 'high'}
                    <i class="material-icons" style="font-size: 0.9rem;">trending_up</i>
                {/if}
                {impactLevel} Impact
            </div>
        {/if}
    </div>
    
    <div class="card-content">
        <slot />
    </div>
    
    <div class="card-footer">
        <p class="transaction-date">{transaction.date}</p>
    </div>
</div>
