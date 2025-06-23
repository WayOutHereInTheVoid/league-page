<script>
    import { goto } from '$app/navigation';
    import { slide } from 'svelte/transition';
    import { getTeamNameFromTeamManagers } from '$lib/utils/helperFunctions/universalFunctions';
    import { round } from '$lib/utils/helper';
    import LinearProgress from '@smui/linear-progress';

    export let viewManager, managers, headToHeadRecords, leagueTeamManagers, loading = false;

    // State management for collapse/expand functionality
    let collapsed = true; // Default to collapsed state

    // Toggle function for collapse/expand
    const toggleCollapse = () => {
        collapsed = !collapsed;
    };

    // Process head-to-head records
    $: h2hData = headToHeadRecords ? Object.entries(headToHeadRecords)
        .map(([opponentRosterID, record]) => {
            const opponentManager = managers.find(m => {
                if (m.managerID) {
                    // Find roster ID for this manager
                    for (const year in leagueTeamManagers.teamManagersMap) {
                        for (const rID in leagueTeamManagers.teamManagersMap[year]) {
                            if (leagueTeamManagers.teamManagersMap[year][rID].managers.includes(m.managerID)) {
                                return rID === opponentRosterID;
                            }
                        }
                    }
                }
                return m.roster === parseInt(opponentRosterID);
            });

            return {
                opponentRosterID,
                opponentManager,
                wins: record.wins || 0,
                losses: record.losses || 0,
                ties: record.ties || 0,
                pointsFor: record.pointsFor || 0,
                pointsAgainst: record.pointsAgainst || 0,
                winPercentage: (record.wins || 0) + (record.losses || 0) > 0 
                    ? ((record.wins || 0) / ((record.wins || 0) + (record.losses || 0))) * 100 
                    : 0
            };
        })
        .filter(record => record.opponentManager)
        .sort((a, b) => b.winPercentage - a.winPercentage) : [];

    const navigateToManager = (opponentManager) => {
        const managerIndex = managers.findIndex(m => m === opponentManager);
        if (managerIndex !== -1) {
            goto(`/manager?manager=${managerIndex}`);
        }
    };

    const getRecordClass = (winPercentage) => {
        if (winPercentage >= 70) return 'dominant';
        if (winPercentage >= 60) return 'strong';
        if (winPercentage >= 40) return 'competitive';
        return 'struggling';
    };

    const getRecordEmoji = (winPercentage) => {
        if (winPercentage >= 70) return '🔥';
        if (winPercentage >= 60) return '💪';
        if (winPercentage >= 40) return '⚔️';
        return '📈';
    };
</script>

<style>
    .headToHeadContainer {
        background-color: var(--fff);
        padding: 0.5rem; /* OPTIMIZED: 50% reduction from 1rem */
        margin: 0.5rem 0; /* OPTIMIZED: 50% reduction from 1rem */
        border-radius: 8px; /* Slightly reduced for compactness */
        border: 1px solid var(--ccc);
        box-shadow: 0 2px 8px rgba(0,0,0,0.08); /* Reduced shadow for tighter feel */
    }

    .sectionTitle {
        font-size: 1.3em; /* Slightly reduced for compactness */
        font-weight: 600;
        color: var(--blueOne);
        margin-bottom: 0.5rem; /* OPTIMIZED: 50% reduction from 1rem */
        text-align: center;
        border-bottom: 2px solid var(--blueOne);
        padding-bottom: 0.3em; /* OPTIMIZED: reduced from 0.5em */
    }

    .recordsGrid {
        display: grid;
        gap: 0.3rem; /* OPTIMIZED: 50% reduction from 0.6rem */
    }

    .recordRow {
        display: grid;
        grid-template-columns: auto 1fr 200px auto; /* FIXED: 4 columns, recordStats fixed at 200px for alignment */
        align-items: center;
        gap: 0.4em; /* OPTIMIZED: 60% reduction from 1em for compact layout */
        padding: 0.3rem 0.5rem; /* OPTIMIZED: 50% reduction from 0.6rem 0.8rem */
        background: linear-gradient(135deg, var(--fff) 0%, var(--f8f9fa) 100%);
        border: 1px solid var(--e9ecef);
        border-radius: 6px; /* Slightly reduced for tighter appearance */
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .recordRow:hover {
        transform: translateX(3px); /* Reduced from 4px for subtler effect */
        box-shadow: 0 3px 8px rgba(0,0,0,0.08); /* Reduced shadow for tighter feel */
        background: linear-gradient(135deg, var(--f8f9fa) 0%, var(--e9ecef) 100%);
    }

    .opponentPhoto {
        width: 36px; /* OPTIMIZED: 10% reduction for compact layout */
        height: 36px; /* OPTIMIZED: 10% reduction for compact layout */
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid var(--ccc);
    }

    .opponentInfo {
        display: flex;
        flex-direction: column;
        gap: 0.3em;
    }

    .opponentName {
        font-weight: 600;
        color: var(--g333);
        font-size: 1em;
    }

    .opponentTeam {
        font-size: 0.8em;
        color: var(--g666);
        font-style: italic;
    }

    .recordStat {
        text-align: center;
        padding: 0.15em 0.3em; /* HEAVILY OPTIMIZED: 70% reduction for ultra-compact layout */
        border-radius: 4px; /* Further reduced for tighter appearance */
        width: 58px; /* FIXED: Consistent width for perfect column alignment */
    }

    .recordLabel {
        font-size: 0.65em; /* OPTIMIZED: Smaller text for compactness */
        color: var(--g666);
        text-transform: uppercase;
        letter-spacing: 0.3px; /* Reduced letter spacing */
        margin-bottom: 0.1em; /* OPTIMIZED: Reduced from 0.2em */
    }

    .recordValue {
        font-weight: 700;
        font-size: 0.95em; /* OPTIMIZED: Reduced from 1.1em for compactness */
    }

    .recordStats {
        display: flex; /* ADDED: Horizontal layout for desktop */
        gap: 0.3em; /* OPTIMIZED: Small gap between stats */
        align-items: center; /* Center align the stat cards */
        justify-content: space-between; /* FIXED: Distribute stats evenly for perfect alignment */
    }

    .dominant {
        background-color: #e8f5e8;
        border: 1px solid #4caf50;
        color: #2e7d32;
    }

    .strong {
        background-color: #e1f5fe;
        border: 1px solid #03a9f4;
        color: #0277bd;
    }

    .competitive {
        background-color: #fff8e1;
        border: 1px solid #ffc107;
        color: #f57c00;
    }

    .struggling {
        background-color: #ffebee;
        border: 1px solid #f44336;
        color: #d32f2f;
    }

    .recordEmoji {
        font-size: 1.5em;
        margin-left: 0.5em;
    }

    .noDataMessage {
        text-align: center;
        color: var(--g666);
        font-style: italic;
        padding: 2em;
        background-color: var(--f8f9fa);
        border-radius: 8px;
        border: 1px dashed var(--ccc);
    }

    .summaryStats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); /* OPTIMIZED: reduced minmax from 120px */
        gap: 0.4rem; /* OPTIMIZED: 50% reduction from 0.8rem */
        margin-bottom: 0.5rem; /* OPTIMIZED: 50% reduction from 1rem */
        padding: 0.4rem 0.6rem; /* OPTIMIZED: significant reduction from 0.8rem */
        background: linear-gradient(135deg, var(--f8f9fa) 0%, var(--e9ecef) 100%);
        border-radius: 6px; /* Slightly reduced for compactness */
        border: 1px solid var(--dee2e6);
    }

    .summaryCard {
        text-align: center;
    }

    .summaryValue {
        font-size: 1.3em; /* OPTIMIZED: reduced from 1.5em for compactness */
        font-weight: 700;
        color: var(--blueOne);
        line-height: 1.1; /* Tighter line height */
        margin-bottom: 0.1rem; /* Small gap between value and label */
    }

    .summaryLabel {
        font-size: 0.75em; /* OPTIMIZED: slightly reduced from 0.8em */
        color: var(--g555);
        text-transform: uppercase;
        letter-spacing: 0.3px; /* Slightly reduced for compactness */
        line-height: 1.2; /* Tighter line height */
    }

    /* Toggle Button Styles */
    .toggleContainer {
        display: flex;
        justify-content: center;
        margin: 0.6rem 0; /* OPTIMIZED: 50% reduction from 1.2rem for compact layout */
    }

    .toggleButton {
        display: flex;
        align-items: center;
        gap: 0.3rem; /* OPTIMIZED: 40% reduction from 0.5rem for compact layout */
        padding: 0.5rem 0.8rem; /* OPTIMIZED: 30% reduction from 0.7rem 1.2rem for compact layout */
        background: linear-gradient(135deg, var(--blueOne) 0%, #4a90e2 100%);
        color: white;
        border: none;
        border-radius: 6px; /* OPTIMIZED: 25% reduction from 8px for compact layout */
        font-weight: 600;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        min-width: 120px; /* OPTIMIZED: 14% reduction from 140px for compact layout */
        justify-content: center;
    }

    .toggleButton:hover {
        background: linear-gradient(135deg, #4a90e2 0%, var(--blueOne) 100%);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .toggleButton:focus {
        outline: 2px solid var(--blueOne);
        outline-offset: 2px;
    }

    .toggleButton:active {
        transform: translateY(0);
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .toggleIcon {
        font-size: 1.1em;
        transition: transform 0.3s ease;
        display: inline-block;
    }

    .toggleIcon.rotated {
        transform: rotate(180deg);
    }

    .toggleText {
        font-weight: 600;
        letter-spacing: 0.3px;
    }

    /* ========================================
       ENHANCED MOBILE RESPONSIVENESS & TOUCH FEEDBACK
       ======================================== */

    /* Enhanced Touch Interaction Feedback */
    .recordRow {
        /* Enhanced touch targets and feedback */
        min-height: 44px; /* WCAG minimum touch target */
        -webkit-tap-highlight-color: rgba(111, 214, 73, 0.2);
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .recordRow:hover {
        transform: translateX(3px);
        box-shadow: 0 4px 12px rgba(111, 214, 73, 0.12);
        background: linear-gradient(135deg, var(--f8f9fa) 0%, var(--e9ecef) 100%);
    }

    .recordRow:active {
        transform: translateX(1px);
        background: linear-gradient(135deg, var(--e9ecef) 0%, var(--dee2e6) 100%);
        box-shadow: 0 2px 6px rgba(111, 214, 73, 0.08);
    }

    .toggleButton {
        /* Enhanced touch targets for mobile accessibility */
        min-height: 44px; /* WCAG compliant */
        -webkit-tap-highlight-color: rgba(111, 214, 73, 0.3);
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .toggleButton:active {
        transform: translateY(1px) scale(0.98);
        background: linear-gradient(135deg, #5bc73a 0%, #3d7cd1 100%);
        box-shadow: 0 1px 3px rgba(0,0,0,0.12);
    }

    /* ========================================
       PROGRESSIVE BREAKPOINT STRATEGY
       ======================================== */

    /* Ultra-Small Mobile: 320px - 359px */
    @media (max-width: 359px) {
        .headToHeadContainer {
            padding: 0.4rem;
            margin: 0.4rem 0;
        }

        .summaryStats {
            grid-template-columns: 1fr;
            gap: 0.2rem;
            padding: 0.25rem 0.4rem;
        }

        .summaryValue {
            font-size: 1.1em;
        }

        .summaryLabel {
            font-size: 0.65em;
        }

        .recordStat {
            width: 50px;
            padding: 0.1em 0.2em;
        }

        .recordValue {
            font-size: 0.8em;
        }

        .recordLabel {
            font-size: 0.55em;
        }

        .toggleButton {
            min-width: 75px;
            padding: 0.4rem 0.5rem;
            font-size: 0.75rem;
            gap: 0.2rem;
        }

        .opponentPhoto {
            width: 28px;
            height: 28px;
        }

        .recordEmoji {
            font-size: 1.2em;
            margin-left: 0.3em;
        }
    }

    /* Small Mobile: 360px - 479px */
    @media (min-width: 360px) and (max-width: 479px) {
        .summaryStats {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.25rem;
            padding: 0.3rem 0.45rem;
        }

        .recordRow {
            grid-template-columns: auto 1fr;
            gap: 0.4em;
            padding: 0.4rem 0.5rem;
        }

        .recordStats {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 0.25em;
            margin-top: 0.25em;
        }

        .recordStat {
            padding: 0.2em 0.25em;
            width: 52px;
        }

        .toggleButton {
            min-width: 80px;
            padding: 0.35rem 0.55rem;
            font-size: 0.78rem;
        }

        .opponentPhoto {
            width: 30px;
            height: 30px;
        }
    }

    /* Standard Mobile: 480px - 599px */
    @media (min-width: 480px) and (max-width: 599px) {
        .summaryStats {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.3rem;
            padding: 0.35rem 0.5rem;
        }

        .recordRow {
            grid-template-columns: auto 1fr;
            gap: 0.45em;
            padding: 0.35rem 0.55rem;
        }

        .recordStats {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 0.3em;
            margin-top: 0.3em;
        }

        .recordStat {
            padding: 0.25em 0.3em;
            width: 55px;
        }

        .toggleButton {
            min-width: 90px;
            padding: 0.4rem 0.65rem;
            font-size: 0.82rem;
        }

        .opponentPhoto {
            width: 32px;
            height: 32px;
        }

        .recordValue {
            font-size: 0.88em;
        }

        .recordLabel {
            font-size: 0.58em;
        }
    }

    /* Large Mobile/Small Tablet: 600px - 767px */
    @media (min-width: 600px) and (max-width: 767px) {
        .summaryStats {
            grid-template-columns: repeat(4, 1fr);
            gap: 0.35rem;
            padding: 0.4rem 0.6rem;
        }

        .recordRow {
            grid-template-columns: auto 1fr 180px auto;
            gap: 0.5em;
            padding: 0.4rem 0.6rem;
        }

        .recordStats {
            display: flex;
            gap: 0.35em;
            align-items: center;
            justify-content: space-between;
        }

        .recordStat {
            width: 56px;
            padding: 0.2em 0.3em;
        }

        .toggleButton {
            min-width: 100px;
            padding: 0.45rem 0.75rem;
            font-size: 0.85rem;
        }

        .opponentPhoto {
            width: 34px;
            height: 34px;
        }

        .recordValue {
            font-size: 0.9em;
        }

        .recordLabel {
            font-size: 0.6em;
        }
    }

    /* Tablet Portrait: 768px - 991px */
    @media (min-width: 768px) and (max-width: 991px) {
        .summaryStats {
            grid-template-columns: repeat(4, 1fr);
            gap: 0.4rem;
            padding: 0.45rem 0.65rem;
        }

        .recordRow {
            grid-template-columns: auto 1fr 190px auto;
            gap: 0.5em;
            padding: 0.35rem 0.6rem;
        }

        .recordStats {
            display: flex;
            gap: 0.35em;
            align-items: center;
            justify-content: space-between;
        }

        .recordStat {
            width: 58px;
            padding: 0.2em 0.3em;
        }

        .toggleButton {
            min-width: 110px;
            padding: 0.45rem 0.8rem;
            font-size: 0.87rem;
        }

        .opponentPhoto {
            width: 36px;
            height: 36px;
        }

        .recordValue {
            font-size: 0.92em;
        }

        .recordLabel {
            font-size: 0.62em;
        }
    }

    /* Desktop: 992px+ */
    @media (min-width: 992px) {
        .summaryStats {
            grid-template-columns: repeat(4, 1fr);
            gap: 0.4rem;
            padding: 0.4rem 0.6rem;
        }

        .recordRow {
            grid-template-columns: auto 1fr 200px auto;
            gap: 0.4em;
            padding: 0.3rem 0.5rem;
        }

        .recordStats {
            display: flex;
            gap: 0.3em;
            align-items: center;
            justify-content: space-between;
        }

        .recordStat {
            width: 58px;
            padding: 0.15em 0.3em;
        }

        .toggleButton {
            min-width: 120px;
            padding: 0.5rem 0.8rem;
            font-size: 0.9rem;
        }

        .opponentPhoto {
            width: 36px;
            height: 36px;
        }

        .recordValue {
            font-size: 0.95em;
        }

        .recordLabel {
            font-size: 0.65em;
        }
    }

    /* ========================================
       ACCESSIBILITY & PROGRESSIVE ENHANCEMENT
       ======================================== */

    /* Reduced motion preference support */
    @media (prefers-reduced-motion: reduce) {
        .recordRow,
        .toggleButton,
        .toggleIcon {
            transition: none;
        }

        .recordRow:hover,
        .recordRow:active {
            transform: none;
        }

        .toggleButton:hover,
        .toggleButton:active {
            transform: none;
        }

        .toggleIcon.rotated {
            transform: none;
        }
    }

    /* High contrast mode support */
    @media (prefers-contrast: high) {
        .recordRow {
            border: 2px solid var(--g333);
        }

        .toggleButton {
            border: 2px solid var(--g333);
        }

        .recordStat {
            border: 1px solid var(--g333);
        }
    }

    /* Enhanced touch feedback for touch devices */
    @media (hover: none) and (pointer: coarse) {
        .recordRow:hover {
            transform: none;
            background: linear-gradient(135deg, var(--fff) 0%, var(--f8f9fa) 100%);
        }

        .recordRow:active {
            background: linear-gradient(135deg, var(--f8f9fa) 0%, var(--e9ecef) 100%);
            transform: scale(0.98);
        }

        .toggleButton:hover {
            transform: none;
            background: linear-gradient(135deg, var(--blueOne) 0%, #4a90e2 100%);
        }

        .toggleButton:active {
            transform: scale(0.96);
            background: linear-gradient(135deg, #5bc73a 0%, #3d7cd1 100%);
        }
    }
</style>

<div class="headToHeadContainer">
    <div class="sectionTitle">Head-to-Head Records</div>
    
    {#if loading}
        <div class="noDataMessage">
            ⏳ Loading head-to-head records across all seasons...<br>
            <small>Processing historical matchup data from 2020-2024.</small>
            <LinearProgress indeterminate />
        </div>
    {:else if h2hData.length > 0}
        <!-- Summary Statistics -->
        {@const totalWins = h2hData.reduce((sum, record) => sum + record.wins, 0)}
        {@const totalLosses = h2hData.reduce((sum, record) => sum + record.losses, 0)}
        {@const totalTies = h2hData.reduce((sum, record) => sum + record.ties, 0)}
        {@const dominatingCount = h2hData.filter(record => record.winPercentage >= 70).length}
        
        <div class="summaryStats">
            <div class="summaryCard">
                <div class="summaryValue">{totalWins}</div>
                <div class="summaryLabel">Total H2H Wins</div>
            </div>
            <div class="summaryCard">
                <div class="summaryValue">{totalLosses}</div>
                <div class="summaryLabel">Total H2H Losses</div>
            </div>
            <div class="summaryCard">
                <div class="summaryValue">{round(totalWins + totalLosses > 0 ? (totalWins / (totalWins + totalLosses)) * 100 : 0)}%</div>
                <div class="summaryLabel">H2H Win Rate</div>
            </div>
            <div class="summaryCard">
                <div class="summaryValue">{dominatingCount}</div>
                <div class="summaryLabel">Dominated Opponents</div>
            </div>
        </div>

        <!-- Toggle Button for Collapse/Expand -->
        <div class="toggleContainer">
            <button 
                class="toggleButton" 
                on:click={toggleCollapse}
                aria-expanded={!collapsed}
                aria-label={collapsed ? 'Show detailed head-to-head records' : 'Hide detailed head-to-head records'}
            >
                <span class="toggleIcon" class:rotated={!collapsed}>▼</span>
                <span class="toggleText">{collapsed ? 'Show Details' : 'Hide Details'}</span>
            </button>
        </div>

        <!-- Individual Records Grid - Conditionally Rendered with Smooth Transition -->
        {#if !collapsed}
            <div class="recordsGrid" transition:slide={{duration: 300, easing: 'ease-out'}}>
            {#each h2hData as record}
                <div class="recordRow" on:click={() => navigateToManager(record.opponentManager)}>
                    <img 
                        class="opponentPhoto" 
                        src={record.opponentManager.photo} 
                        alt={record.opponentManager.name}
                    />
                    
                    <div class="opponentInfo">
                        <div class="opponentName">{record.opponentManager.name}</div>
                        <div class="opponentTeam">
                            {getTeamNameFromTeamManagers(leagueTeamManagers, record.opponentRosterID)}
                        </div>
                    </div>
                    
                    <div class="recordStats">
                        <div class="recordStat {getRecordClass(record.winPercentage)}">
                            <div class="recordLabel">Record</div>
                            <div class="recordValue">{record.wins}-{record.losses}{record.ties > 0 ? `-${record.ties}` : ''}</div>
                        </div>
                        
                        <div class="recordStat">
                            <div class="recordLabel">Win %</div>
                            <div class="recordValue">{round(record.winPercentage)}%</div>
                        </div>
                        
                        <div class="recordStat">
                            <div class="recordLabel">Pts Diff</div>
                            <div class="recordValue">+{round(record.pointsFor - record.pointsAgainst)}</div>
                        </div>
                    </div>
                    
                    <div class="recordEmoji">
                        {getRecordEmoji(record.winPercentage)}
                    </div>
                </div>
            {/each}
            </div>
        {/if}
    {:else}
        <div class="noDataMessage">
            🤝 No head-to-head records available yet.<br>
            <small>Records will appear after completing matchups against other managers.</small>
        </div>
    {/if}
</div>