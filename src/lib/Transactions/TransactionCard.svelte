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
        background: white;
        border-radius: 12px;
        border-left: 4px solid var(--blueOne);
        box-shadow: 0 2px 8px rgba(46, 125, 50, 0.1);
        margin-bottom: 1.5rem;
        overflow: hidden;
        transition: all 0.3s ease;
        position: relative;
    }
    
    .transaction-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(46, 125, 50, 0.15);
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
        background: linear-gradient(135deg, #F1F8E9 0%, #E8F5E8 100%);
        padding: 16px 20px 12px;
        border-bottom: 1px solid #E0E0E0;
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
        color: #2E7D32;
    }
    
    .transaction-type.waiver {
        color: #FF7043;
    }
    
    .transaction-type i {
        font-size: 1.1rem;
    }
    
    .impact-indicator {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 8px;
        border-radius: 16px;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.3px;
    }
    
    .impact-high {
        background: #E8F5E9;
        color: #2E7D32;
        border: 1px solid #C8E6C9;
    }
    
    .impact-medium {
        background: #FFF3E0;
        color: #F57C00;
        border: 1px solid #FFCC02;
    }
    
    .impact-low {
        background: #F5F5F5;
        color: #757575;
        border: 1px solid #E0E0E0;
    }
    
    .card-content {
        padding: 0;
        position: relative;
    }
    
    .card-footer {
        padding: 12px 20px;
        background: #FAFAFA;
        border-top: 1px solid #F0F0F0;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    
    .transaction-date {
        color: #666;
        font-style: italic;
        font-size: 0.8rem;
        margin: 0;
    }
    
    /* Mobile responsiveness */
    @media (max-width: 768px) {
        .transaction-card {
            margin-bottom: 1rem;
            border-radius: 8px;
        }
        
        .card-header {
            padding: 12px 16px 10px;
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
            padding: 10px 16px;
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
