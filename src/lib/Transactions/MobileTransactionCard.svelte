<script>
    import { onMount, createEventDispatcher } from 'svelte';
    import { addTouchGestures, addProgressiveDisclosure, ensureTouchTargetSize } from '$lib/utils/helperFunctions/mobileInteractions.js';
    import { getTeamFromTeamManagers } from '$lib/utils/helperFunctions/universalFunctions';
    
    const dispatch = createEventDispatcher();
    
    export let transaction;
    export let leagueTeamManagers;
    export let showImpactIndicator = true;
    export let enableMobileOptimizations = true;
    export let expandable = true;
    
    let cardElement;
    let touchGestures;
    let progressiveDisclosure;
    let isExpanded = false;
    let isMobile = false;
    
    // Calculate transaction impact level
    const calculateImpactLevel = (transaction) => {
        if (transaction.type === 'trade') {
            const totalPlayers = transaction.moves.reduce((total, move) => {
                return total + move.filter(item => item && item.player).length;
            }, 0);
            
            if (totalPlayers >= 4) return 'high';
            if (totalPlayers >= 2) return 'medium';
            return 'low';
        }
        
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
    
    // Mobile detection
    const checkIfMobile = () => {
        isMobile = window.innerWidth < 768 || 'ontouchstart' in window;
    };
    
    // Handle mobile gestures
    const handleSwipeLeft = (event, distance) => {
        dispatch('swipeLeft', { transaction, distance });
        // Quick action: maybe show "more info" or "share" options
    };
    
    const handleSwipeRight = (event, distance) => {
        dispatch('swipeRight', { transaction, distance });
        // Quick action: maybe show "bookmark" or "hide" options
    };
    
    const handleTap = (event) => {
        if (expandable && isMobile) {
            toggleExpansion();
        }
        dispatch('tap', { transaction });
    };
    
    const handleLongPress = (event) => {
        dispatch('longPress', { transaction });
        // Show context menu or additional options
    };
    
    const toggleExpansion = () => {
        if (progressiveDisclosure) {
            progressiveDisclosure.toggle();
            isExpanded = progressiveDisclosure.isExpanded;
            dispatch('expansionChange', { transaction, isExpanded });
        }
    };
    
    onMount(() => {
        checkIfMobile();
        
        if (enableMobileOptimizations && cardElement) {
            // Add touch gestures for mobile
            if (isMobile) {
                touchGestures = addTouchGestures(cardElement, {
                    onSwipeLeft: handleSwipeLeft,
                    onSwipeRight: handleSwipeRight,
                    onTap: handleTap,
                    onLongPress: handleLongPress,
                    swipeThreshold: 60
                });
            }
            
            // Add progressive disclosure if expandable
            if (expandable) {
                progressiveDisclosure = addProgressiveDisclosure(cardElement, {
                    expandedClass: 'expanded',
                    collapsedClass: 'collapsed',
                    animationDuration: 300
                });
            }
            
            // Ensure proper touch target sizes
            const interactiveElements = cardElement.querySelectorAll('button, .clickable, [role="button"]');
            interactiveElements.forEach(element => {
                ensureTouchTargetSize(element, 44);
            });
        }
        
        // Listen for window resize
        const handleResize = () => {
            checkIfMobile();
        };
        
        window.addEventListener('resize', handleResize);
        
        return () => {
            window.removeEventListener('resize', handleResize);
            if (touchGestures) touchGestures.destroy();
            if (progressiveDisclosure) progressiveDisclosure.destroy();
        };
    });
</script>

<style>
    .mobile-transaction-card {
        background: var(--transaction-card-bg);
        border-radius: 12px;
        border-left: 3px solid var(--blueOne);
        box-shadow: 0 2px 8px var(--transaction-card-shadow);
        margin-bottom: 0.8rem;
        overflow: hidden;
        transition: all 0.3s ease;
        position: relative;
        user-select: none; /* Prevent text selection during gestures */
        -webkit-touch-callout: none; /* Disable iOS callout */
    }
    
    /* Touch interaction states */
    .mobile-transaction-card.touching {
        transform: scale(0.98);
    }
    
    .mobile-transaction-card:hover,
    .mobile-transaction-card:active {
        transform: translateY(-1px);
        box-shadow: 0 4px 16px var(--transaction-card-shadow-hover);
        border-left-width: 4px;
    }
    
    /* Impact level styling */
    .mobile-transaction-card.high-impact {
        border-left-color: #4CAF50;
        border-left-width: 6px;
    }
    
    .mobile-transaction-card.medium-impact {
        border-left-color: #FF9800;
        border-left-width: 5px;
    }
    
    .mobile-transaction-card.low-impact {
        border-left-color: #9E9E9E;
        border-left-width: 4px;
    }
    
    /* Enhanced mobile header */
    .card-header {
        background: var(--transaction-card-header-bg);
        padding: 14px 16px 10px; /* Increased for better touch targets */
        border-bottom: 1px solid var(--transaction-card-border);
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: relative;
        min-height: 44px; /* Ensure minimum touch target */
    }
    
    .transaction-summary {
        display: flex;
        flex-direction: column;
        gap: 4px;
        flex: 1;
    }
    
    .transaction-type {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
        font-size: 0.9rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        min-height: 24px; /* Ensure readability */
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
        padding: 3px 8px; /* Slightly larger for mobile */
        border-radius: 12px;
        font-size: 0.7rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.3px;
        min-height: 24px; /* Ensure touch target */
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
    
    /* Progressive disclosure areas */
    .transaction-details {
        overflow: hidden;
        transition: max-height 0.3s ease;
    }
    
    .card-content {
        padding: 0;
        position: relative;
    }
    
    .card-footer {
        padding: 12px 16px; /* Increased for mobile */
        background: var(--transaction-card-footer-bg);
        border-top: 1px solid var(--transaction-card-footer-border);
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 44px; /* Ensure touch target */
    }
    
    .transaction-date {
        color: var(--g555);
        font-style: italic;
        font-size: 0.85rem; /* Slightly larger for mobile */
        margin: 0;
    }
    
    /* Mobile-specific optimizations */
    @media (max-width: 768px) {
        .mobile-transaction-card {
            margin-bottom: 1rem;
            border-radius: 8px;
        }
        
        .card-header {
            padding: 16px 16px 12px; /* Increased touch targets */
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
            min-height: 56px; /* Larger minimum for mobile */
        }
        
        .transaction-type {
            font-size: 0.9rem;
        }
        
        .impact-indicator {
            font-size: 0.75rem;
            padding: 4px 10px;
            min-height: 28px;
        }
        
        .card-footer {
            padding: 14px 16px;
            min-height: 48px;
        }
        
        .transaction-date {
            font-size: 0.8rem;
        }
    }
    
    /* Ultra-small mobile devices */
    @media (max-width: 480px) {
        .card-header {
            padding: 16px 12px 12px;
        }
        
        .transaction-type {
            font-size: 0.85rem;
        }
        
        .card-footer {
            padding: 12px 12px;
        }
    }
    
    /* Expansion states */
    .mobile-transaction-card.expanded .card-header {
        border-bottom-color: var(--blueOne);
        border-bottom-width: 2px;
    }
    
    .mobile-transaction-card.collapsed .transaction-details {
        max-height: 0;
    }
    
    /* Visual feedback for touch interactions */
    .mobile-transaction-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(255, 255, 255, 0.1);
        opacity: 0;
        transition: opacity 0.2s ease;
        pointer-events: none;
        z-index: 1;
    }
    
    .mobile-transaction-card:active::before {
        opacity: 1;
    }
    
    /* Accessibility improvements */
    .mobile-transaction-card:focus {
        outline: 2px solid var(--blueOne);
        outline-offset: 2px;
    }
    
    .mobile-transaction-card[aria-expanded="true"] .expand-indicator {
        transform: rotate(180deg);
    }
    
    .expand-indicator {
        transition: transform 0.3s ease;
        color: var(--g777);
        font-size: 1.2rem;
        min-width: 24px;
        min-height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
</style>

<div 
    class="mobile-transaction-card {impactLevel}-impact {isExpanded ? 'expanded' : 'collapsed'}"
    bind:this={cardElement}
    role="button"
    tabindex="0"
    aria-expanded={expandable ? isExpanded : undefined}
    aria-label="Transaction from {transaction.date} - {transaction.type}"
    on:keydown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && expandable) {
            e.preventDefault();
            toggleExpansion();
        }
    }}
>
    <div class="card-header">
        <div class="transaction-summary">
            <div class="transaction-type {transaction.type}">
                <i class="material-icons">
                    {transaction.type === 'trade' ? 'swap_horiz' : 'person_add'}
                </i>
                {transaction.type}
            </div>
            
            {#if showImpactIndicator}
                <div class="impact-indicator impact-{impactLevel}">
                    <i class="material-icons">
                        {impactLevel === 'high' ? 'trending_up' : impactLevel === 'medium' ? 'trending_flat' : 'trending_down'}
                    </i>
                    {impactLevel} impact
                </div>
            {/if}
        </div>
        
        {#if expandable}
            <div class="expand-indicator" aria-hidden="true">
                <i class="material-icons">expand_more</i>
            </div>
        {/if}
    </div>
    
    <div class="transaction-details">
        <div class="card-content">
            <slot />
        </div>
        
        <div class="card-footer">
            <p class="transaction-date">{transaction.date}</p>
        </div>
    </div>
</div>
