<script>
    import { onMount, createEventDispatcher } from 'svelte';
    import TradeTransaction from './TradeTransaction.svelte';
    import WaiverTransaction from './WaiverTransaction.svelte';
    import DateGroup from './DateGroup.svelte';
    import MobileTransactionCard from './MobileTransactionCard.svelte';
    import { assignGridPlacement, calculateTransactionImpact, generateGridPerformanceInsights } from '$lib/utils/helperFunctions/transactionIntelligence.js';
    import { optimizeForThumbZone } from '$lib/utils/helperFunctions/mobileInteractions.js';
    
    const dispatch = createEventDispatcher();
    
    // Props
    export let groupedTransactions = {};
    export let players = {};
    export let leagueTeamManagers = {};
    export let searchQuery = '';
    export let highlightSearchTerms = () => {};
    export let groupStates = {};
    export let getDefaultGroupState = () => true;
    
    // Grid configuration
    let gridContainer;
    let containerWidth = 0;
    let isDesktop = false;
    let isTablet = false;
    let isMobile = false;
    let thumbZoneOptimizer = null;
    
    // Performance insights (optional for debugging/analytics)
    let gridPerformanceInsights = {};
    
    // Mobile interaction state
    let enableMobileOptimizations = true;
    let showDebugInfo = false;
    
    // Enhanced responsive breakpoint detection with mobile optimizations
    const updateBreakpoints = () => {
        if (!gridContainer) return;
        
        containerWidth = gridContainer.offsetWidth;
        const wasMobile = isMobile;
        
        isMobile = containerWidth < 768 || 'ontouchstart' in window;
        isTablet = containerWidth >= 768 && containerWidth < 1200;
        isDesktop = containerWidth >= 1200;
        
        // Initialize mobile optimizations when switching to mobile
        if (isMobile && !wasMobile && enableMobileOptimizations) {
            thumbZoneOptimizer = optimizeForThumbZone(gridContainer);
        }
    };
    
    // Mobile interaction handlers
    const handleMobileSwipeLeft = (event) => {
        const { transaction } = event.detail;
        dispatch('mobileSwipeLeft', { transaction });
    };
    
    const handleMobileSwipeRight = (event) => {
        const { transaction } = event.detail;
        dispatch('mobileSwipeRight', { transaction });
    };
    
    const handleMobileTap = (event) => {
        const { transaction } = event.detail;
        dispatch('mobileTap', { transaction });
    };
    
    const handleMobileLongPress = (event) => {
        const { transaction } = event.detail;
        dispatch('mobileLongPress', { transaction });
    };
    
    const handleExpansionChange = (event) => {
        const { transaction, isExpanded } = event.detail;
        dispatch('transactionExpansionChange', { transaction, isExpanded });
    };
    
    // Reactive grid processing with enhanced intelligence
    $: processedGroups = Object.entries(groupedTransactions).reduce((processed, [groupKey, groupData]) => {
        const assignedTransactions = assignGridPlacement(groupData.transactions, isDesktop);
        
        // Generate performance insights for debugging
        if (isDesktop && assignedTransactions.length > 0) {
            gridPerformanceInsights[groupKey] = generateGridPerformanceInsights(assignedTransactions);
        }
        
        processed[groupKey] = {
            ...groupData,
            transactions: assignedTransactions
        };
        return processed;
    }, {});
    
    // Handle group toggle events
    const handleGroupToggle = (event) => {
        const { groupKey, expanded } = event.detail;
        dispatch('groupToggle', {
            groupKey,
            expanded
        });
    };
    
    // Handle resize events for responsive behavior
    const handleResize = () => {
        updateBreakpoints();
    };
    
    onMount(() => {
        updateBreakpoints();
        window.addEventListener('resize', handleResize);
        
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    });
</script>

<style>
    .transactions-grid {
        width: 100%;
        position: relative;
        overflow-x: hidden; /* Fix: Prevent horizontal overflow */
        max-width: 100%; /* Fix: Ensure container doesn't exceed parent width */
        box-sizing: border-box; /* Fix: Include padding/borders in width calculation */
    }
    
    .date-groups-container {
        margin: 1rem 0;
    }
    
    /* Grid layout for transactions within each date group */
    .transactions-grid-layout {
        display: grid;
        gap: 0.8rem;
        width: 100%;
        grid-template-columns: 1fr; /* Default: single column */
    }
    
    /* Desktop: Smart 2-column grid */
    @media (min-width: 1200px) {
        .transactions-grid-layout.desktop {
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); /* TASK 2: Auto-responsive with minimum width */
            gap: 1.5rem; /* TASK 2: Increased gap */
        }
        
        .transaction-item.column-1 {
            grid-column: 1;
        }
        
        .transaction-item.column-2 {
            grid-column: 2;
        }
    }
    
    /* Tablet: Optimized single column with enhanced spacing */
    @media (min-width: 768px) and (max-width: 1199px) {
        .transactions-grid-layout.tablet {
            grid-template-columns: 1fr;
            gap: 0.9rem;
            max-width: 800px;
            margin: 0 auto;
        }
    }
    
    /* Mobile: Compact single column */
    @media (max-width: 767px) {
        .transactions-grid-layout.mobile {
            grid-template-columns: 1fr;
            gap: 0.8rem;
        }
    }
    
    /* Grid item styling */
    .transaction-item {
        position: relative;
        transition: all 0.3s ease;
    }
    
    /* Enhanced hover effects for desktop grid */
    @media (min-width: 1200px) {
        .transaction-item:hover {
            transform: translateY(-2px);
            z-index: 10;
        }
    }
    
    /* Complexity-based visual indicators */
    .transaction-item.complexity-high {
        border-left: 4px solid #4CAF50;
    }
    
    .transaction-item.complexity-medium {
        border-left: 3px solid #FF9800;
    }
    
    .transaction-item.complexity-low {
        border-left: 2px solid #9E9E9E;
    }
    
    /* Grid animation system */
    .transaction-item {
        opacity: 0;
        animation: fadeInUp 0.4s ease forwards;
    }
    
    /* Staggered animation delays for smooth reveals */
    .transaction-item:nth-child(1) { animation-delay: 0.05s; }
    .transaction-item:nth-child(2) { animation-delay: 0.1s; }
    .transaction-item:nth-child(3) { animation-delay: 0.15s; }
    .transaction-item:nth-child(4) { animation-delay: 0.2s; }
    .transaction-item:nth-child(5) { animation-delay: 0.25s; }
    .transaction-item:nth-child(n+6) { animation-delay: 0.3s; }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    /* Performance optimizations */
    .transactions-grid-layout {
        contain: layout style;
        will-change: transform;
    }
    
    .transaction-item {
        contain: layout style;
    }
    
    /* Debug information (conditionally shown) */
    .debug-info {
        position: fixed;
        top: 10px;
        right: 10px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 10px;
        border-radius: 4px;
        font-size: 12px;
        z-index: 1000;
        display: none;
    }
    
    .debug-info.show {
        display: block;
    }
</style>

<div class="transactions-grid" bind:this={gridContainer}>
    <!-- Debug information (hidden by default) -->
    <div class="debug-info" class:show={false}>
        <div>Container Width: {containerWidth}px</div>
        <div>Layout: {isDesktop ? 'Desktop' : isTablet ? 'Tablet' : 'Mobile'}</div>
        <div>Groups: {Object.keys(processedGroups).length}</div>
    </div>
    
    <div class="date-groups-container">
        {#if Object.keys(processedGroups).length > 0}
            {#each Object.entries(processedGroups) as [groupKey, groupData] (groupKey)}
                <DateGroup 
                    dateKey={groupKey}
                    transactionCount={groupData.count}
                    expanded={groupStates[groupKey] !== undefined ? groupStates[groupKey] : getDefaultGroupState(groupKey)}
                    on:toggle={handleGroupToggle}
                >
                    <!-- Smart Grid Layout for Transactions -->
                    <div class="transactions-grid-layout {isDesktop ? 'desktop' : isTablet ? 'tablet' : 'mobile'}">
                        {#each groupData.transactions as transaction (transaction.id)}
                            <div class="transaction-item column-{transaction.gridColumn}">
                                {#if transaction.type === 'waiver'}
                                    <WaiverTransaction 
                                        {players} 
                                        {transaction} 
                                        {leagueTeamManagers} 
                                        {searchQuery} 
                                        {highlightSearchTerms} 
                                    />
                                {:else}
                                    <TradeTransaction 
                                        {players} 
                                        {transaction} 
                                        {leagueTeamManagers} 
                                        {searchQuery} 
                                        {highlightSearchTerms} 
                                    />
                                {/if}
                            </div>
                        {/each}
                    </div>
                </DateGroup>
            {/each}
        {/if}
    </div>
</div>
