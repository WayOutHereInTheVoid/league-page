<script>
    import { round } from '$lib/utils/helper';
    import AnalyticsDashboard from '$lib/AnalyticsDashboard.svelte';
    import ApexBarChart from '$lib/ApexBarChart.svelte';

    export let managerStats, leagueTeamManagers, rosterID, managerID;

    // Enhanced data structure from improved managerStats computation
    $: seasons = managerStats?.seasons || [];
    $: totalStats = managerStats?.totalStats || {};

    // Use enhanced statistics if available, fallback to manual calculation for legacy data
    $: totalWins = totalStats.totalWins ?? seasons.reduce((sum, season) => sum + (season.wins || 0), 0);
    $: totalLosses = totalStats.totalLosses ?? seasons.reduce((sum, season) => sum + (season.losses || 0), 0);
    $: totalTies = totalStats.totalTies ?? seasons.reduce((sum, season) => sum + (season.ties || 0), 0);
    $: totalPoints = totalStats.totalPoints ?? seasons.reduce((sum, season) => sum + (isNaN(season.fpts) ? 0 : season.fpts || 0), 0);
    $: totalPointsAgainst = totalStats.totalPointsAgainst ?? seasons.reduce((sum, season) => sum + (isNaN(season.fptsAgainst) ? 0 : season.fptsAgainst || 0), 0);
    
    // Enhanced statistics with more accurate calculations
    $: winPercentage = totalStats.winPercentage ?? (totalWins + totalLosses > 0 ? round((totalWins / (totalWins + totalLosses)) * 100) : 0);
    $: averagePointsPerSeason = totalStats.averagePointsPerSeason ?? (seasons.length > 0 ? round(totalPoints / seasons.length) : 0);
    $: averagePointsPerGame = totalStats.averagePointsPerGame ?? 0;
    $: playoffAppearances = totalStats.playoffAppearances ?? seasons.filter(season => season.playoffs).length;
    $: championships = totalStats.championships ?? seasons.filter(season => season.championship).length;
    $: divisionChampionships = totalStats.divisionChampionships ?? seasons.filter(season => season.divisionChamp).length;
    $: seasonsPlayed = totalStats.seasonsPlayed ?? seasons.length;

    // Performance trends for visualization
    $: winTrendData = seasons.map(season => ({
        x: season.year,
        y: season.wins || 0
    }));

    $: pointsTrendData = seasons.map(season => ({
        x: season.year,
        y: season.fpts || 0
    }));

    $: performanceLevel = (() => {
        if (winPercentage >= 70) return { level: 'Elite', color: '#6FD649', description: 'Dominant manager with consistent success' };
        if (winPercentage >= 60) return { level: 'Excellent', color: '#7EE858', description: 'Strong performer above league average' };
        if (winPercentage >= 50) return { level: 'Solid', color: '#FF8C42', description: 'Competitive manager around .500' };
        if (winPercentage >= 40) return { level: 'Developing', color: '#FF6B35', description: 'Building toward consistent success' };
        return { level: 'Rebuilding', color: '#FF5722', description: 'Working to improve performance' };
    })();

    // State for collapsible charts section
    let chartsExpanded = false;
    
    // State for collapsible analytics dashboard
    let analyticsExpanded = false;

    // Function to toggle charts visibility
    const toggleCharts = () => {
        chartsExpanded = !chartsExpanded;
    };

    // Function to toggle analytics dashboard visibility
    const toggleAnalytics = () => {
        analyticsExpanded = !analyticsExpanded;
    };
</script>

<style>
    /* === PHASE 3.1: ENHANCED COLOR-CODED CATEGORIES SYSTEM === */
    :root {
        /* Enhanced Color System - Semantic Categories with Depth */
        --stats-positive: #10b981;           /* Green: wins, success metrics */
        --stats-positive-light: #34d399;     /* Lighter green for accents */
        --stats-positive-dark: #059669;      /* Darker green for borders */
        --stats-positive-bg: rgba(16, 185, 129, 0.1);  /* Background tint */
        
        --stats-performance: #3b82f6;        /* Blue: performance, points */
        --stats-performance-light: #60a5fa;  /* Lighter blue for accents */
        --stats-performance-dark: #2563eb;   /* Darker blue for borders */
        --stats-performance-bg: rgba(59, 130, 246, 0.1);  /* Background tint */
        
        --stats-neutral: #6b7280;            /* Gray: neutral stats */
        --stats-neutral-light: #9ca3af;      /* Lighter gray for accents */
        --stats-neutral-dark: #4b5563;       /* Darker gray for borders */
        --stats-neutral-bg: rgba(107, 114, 128, 0.05);  /* Background tint */
        
        --stats-achievement: #f59e0b;         /* Gold: special achievements */
        --stats-achievement-light: #fbbf24;   /* Lighter gold for accents */
        --stats-achievement-dark: #d97706;    /* Darker gold for borders */
        --stats-achievement-bg: rgba(245, 158, 11, 0.1);  /* Background tint */
        
        /* FIXED Typography Scale - Conservative Sizes for Better Proportions */
        --stats-text-primary: 1.5rem;     /* Conservative size for win percentage */
        --stats-text-secondary: 1.1rem;   /* Conservative size for record */
        --stats-text-tertiary: 0.9rem;    /* Achievement values */
        --stats-text-labels: 0.7rem;      /* Labels and descriptions */
        --stats-text-description: 0.75rem; /* Descriptive text */
        
        /* Weight Scale */
        --stats-weight-heavy: 800;        /* Primary emphasis */
        --stats-weight-bold: 700;         /* Secondary emphasis */
        --stats-weight-medium: 600;       /* Labels and tertiary */
        --stats-weight-normal: 500;       /* Descriptions */
        
        /* Typography Spacing Standards - Task 3.2 */
        --stats-letter-spacing-tight: -0.02em;    /* Large numbers */
        --stats-letter-spacing-normal: 0;         /* Default text */
        --stats-letter-spacing-wide: 0.05em;      /* Labels */
        --stats-letter-spacing-wider: 0.1em;      /* Emphasis labels */
        
        /* Line Height Standards - Task 3.2 */
        --stats-line-height-tight: 1.1;           /* Large numbers */
        --stats-line-height-normal: 1.4;          /* Body text */
        --stats-line-height-relaxed: 1.6;         /* Descriptions */
        
        /* Spacing System - Reduced for Better Card Proportions */
        --stats-gap-xs: 0.3rem;    /* Further reduced for smaller cards */
        --stats-gap-sm: 0.4rem;    /* Further reduced for smaller cards */
        --stats-gap-md: 0.6rem;    /* Further reduced for smaller cards */
        --stats-gap-lg: 0.8rem;    /* Further reduced for smaller cards */
        --stats-gap-xl: 1rem;      /* Further reduced for smaller cards */
        
        /* Shadow & Transition Standards */
        --stats-shadow-subtle: 0 1px 3px rgba(0,0,0,0.1);
        --stats-shadow-card: 0 4px 12px rgba(0,0,0,0.15);
        --stats-transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* TRUE Mobile-First Design - OPTIMIZED SPACING */
    .statisticsContainer {
        /* MOBILE OVERFLOW FIX: Aggressive mobile containment */
        padding: 0;
        margin: 0;
        width: 100%;
        max-width: 100vw;          /* Never exceed viewport width */
        box-sizing: border-box;
        overflow-x: hidden;
        /* Force all children to respect container width */
        min-width: 0;
    }

    .sectionTitle {
        font-size: 1.2rem;
        font-weight: 600;
        color: var(--blueOne);
        margin-bottom: 0.5rem; /* OPTIMIZED: 50% reduction for mobile-first spacing */
        text-align: center;
        border-bottom: 2px solid var(--blueOne);
        padding-bottom: 0.4rem;
        /* Ensure title never causes overflow */
        word-wrap: break-word;
        hyphens: auto;
        /* PHASE 1: Hide duplicate title - parent provides section title */
        display: none;
    }

    /* === PHASE 2: NEW EMPHASIS HIERARCHY STYLES === */
    
    /* Primary Grid Layout */
    .emphasisGrid {
        display: grid;
        grid-template-columns: 1fr;
        gap: var(--stats-gap-md);
        margin-bottom: var(--stats-gap-lg);
    }
    
    /* Primary Win Rate Card - Enhanced Color System */
    .primaryCard {
        background: linear-gradient(135deg, var(--stats-positive) 0%, var(--stats-positive-dark) 100%);
        border: 2px solid var(--stats-positive-dark);
        border-left: 4px solid var(--stats-positive-light);
        color: white;
        padding: var(--stats-gap-lg);
        border-radius: 12px;
        text-align: center;
        box-shadow: var(--stats-shadow-card), 0 0 20px var(--stats-positive-bg);
        transition: var(--stats-transition);
        position: relative;
        overflow: hidden;
    }
    
    .primaryCard::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 1px;
        background: var(--stats-positive-light);
        opacity: 0.8;
    }
    
    .primaryCard:hover {
        transform: translateY(-2px);
        box-shadow: var(--stats-shadow-card), 0 0 25px var(--stats-positive-bg);
        border-color: var(--stats-positive-light);
    }
    
    /* Enhanced Typography Classes - Task 3.2 */
    .primaryValue {
        font-size: var(--stats-text-primary);
        font-weight: var(--stats-weight-heavy);
        letter-spacing: var(--stats-letter-spacing-tight);
        line-height: var(--stats-line-height-tight);
        margin-bottom: 0.5rem;
        transition: font-size var(--stats-transition);
    }
    
    .primaryLabel {
        font-size: var(--stats-text-labels);
        font-weight: var(--stats-weight-medium);
        text-transform: uppercase;
        letter-spacing: var(--stats-letter-spacing-wider);
        line-height: var(--stats-line-height-normal);
        opacity: 0.9;
        margin-bottom: var(--stats-gap-sm);
        transition: all var(--stats-transition);
    }
    
    .progressBar {
        height: 4px;
        background: rgba(255,255,255,0.3);
        border-radius: 2px;
        overflow: hidden;
    }
    
    .progressFill {
        height: 100%;
        background: white;
        transition: width 0.8s ease;
    }
    
    /* Secondary Record Card */
    .secondaryCard {
        background: linear-gradient(135deg, var(--stats-performance) 0%, var(--stats-performance-dark) 100%);
        border: 2px solid var(--stats-performance-dark);
        border-left: 4px solid var(--stats-performance-light);
        color: white;
        padding: var(--stats-gap-lg);
        border-radius: 12px;
        text-align: center;
        box-shadow: var(--stats-shadow-card), 0 0 20px var(--stats-performance-bg);
        transition: var(--stats-transition);
        position: relative;
        overflow: hidden;
    }
    
    .secondaryCard::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 1px;
        background: var(--stats-performance-light);
        opacity: 0.8;
    }
    
    .secondaryCard:hover {
        transform: translateY(-2px);
        box-shadow: var(--stats-shadow-card), 0 0 25px var(--stats-performance-bg);
        border-color: var(--stats-performance-light);
    }
    
    .recordValue {
        font-size: var(--stats-text-secondary);
        font-weight: var(--stats-weight-bold);
        letter-spacing: var(--stats-letter-spacing-tight);
        line-height: var(--stats-line-height-tight);
        margin-bottom: 0.5rem;
        transition: font-size var(--stats-transition);
    }
    
    .recordSubtext {
        font-size: var(--stats-text-description);
        opacity: 0.9;
        font-weight: var(--stats-weight-normal);
        letter-spacing: var(--stats-letter-spacing-normal);
        line-height: var(--stats-line-height-normal);
        transition: all var(--stats-transition);
    }
    
    /* Achievement Row */
    .achievementRow {
        display: grid;
        grid-template-columns: 1fr;
        gap: var(--stats-gap-md);
        margin-bottom: var(--stats-gap-lg);
    }
    
    .achievementCard {
        background: linear-gradient(135deg, var(--fff) 0%, var(--f8f9fa) 100%);
        border: 2px solid var(--stats-neutral-light);
        border-left: 4px solid var(--stats-neutral);
        padding: var(--stats-gap-md);
        border-radius: 8px;
        text-align: center;
        box-shadow: var(--stats-shadow-subtle), 0 0 15px var(--stats-neutral-bg);
        transition: var(--stats-transition);
    }
    
    .achievementCard:hover {
        transform: translateY(-2px);
        box-shadow: var(--stats-shadow-card), 0 0 20px var(--stats-neutral-bg);
        border-color: var(--stats-neutral);
        border-left-color: var(--stats-neutral-dark);
    }
    
    .achievementValue {
        font-size: var(--stats-text-tertiary);
        font-weight: var(--stats-weight-bold);
        color: var(--stats-neutral);
        letter-spacing: var(--stats-letter-spacing-tight);
        line-height: var(--stats-line-height-tight);
        margin-bottom: 0.25rem;
        transition: all var(--stats-transition);
    }
    
    .achievementLabel {
        font-size: var(--stats-text-labels);
        font-weight: var(--stats-weight-medium);
        text-transform: uppercase;
        letter-spacing: var(--stats-letter-spacing-wide);
        line-height: var(--stats-line-height-normal);
        color: var(--g555);
        transition: all var(--stats-transition);
    }
    
    /* Performance Card Special Styling */
    /* Performance Card - Enhanced Achievement Color System */
    .performanceCard {
        background: linear-gradient(135deg, var(--stats-achievement) 0%, var(--stats-achievement-dark) 100%);
        border: 2px solid var(--stats-achievement-dark) !important;
        border-left: 4px solid var(--stats-achievement-light) !important;
        color: white;
    }
    
    .performanceCard::before {
        background: var(--stats-achievement-light) !important;
    }
    
    .performanceCard:hover {
        box-shadow: var(--stats-shadow-card), 0 0 25px var(--stats-achievement-bg) !important;
        border-color: var(--stats-achievement-light) !important;
        border-left-color: var(--stats-achievement) !important;
    }
    
    .performanceBadge {
        font-size: var(--stats-text-description);
        font-weight: var(--stats-weight-bold);
        letter-spacing: var(--stats-letter-spacing-wide);
        line-height: var(--stats-line-height-normal);
        margin-bottom: 0.5rem;
        transition: all var(--stats-transition);
    }
    
    .performanceDesc {
        font-size: var(--stats-text-labels);
        opacity: 0.9;
        font-weight: var(--stats-weight-normal);
        letter-spacing: var(--stats-letter-spacing-normal);
        line-height: var(--stats-line-height-relaxed);
        transition: all var(--stats-transition);
    }

    .performanceLevel {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.6rem;
        margin: 1.2rem 0;
        padding: 0.8rem;
        border-radius: 6px;
        background: linear-gradient(135deg, rgba(4, 219, 22, 0.2) 0%, rgba(4,219,22,0.1) 100%);
        border-left: 3px solid var(--performance-color);
        text-align: center;
        /* Prevent overflow */
        max-width: 100%;
        box-sizing: border-box;
    }

    .levelBadge {
        padding: 0.4rem 0.8rem;
        border-radius: 15px;
        color: white;
        font-weight: 600;
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.3px;
        /* Ensure badge text doesn't break layout */
        white-space: nowrap;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .levelDescription {
        font-style: italic;
        color: var(--g666);
        font-size: 0.8rem;
        line-height: 1.3;
        /* Allow text to wrap nicely */
        word-wrap: break-word;
        text-align: center;
    }

    .chartSection {
        margin-top: 1.5rem;
    }

    .chartTitle {
        font-size: 1rem;
        font-weight: 600;
        color: var(--g555);
        margin-bottom: 0.8rem;
        text-align: center;
        /* Prevent title overflow */
        word-wrap: break-word;
    }

    .noDataMessage {
        text-align: center;
        color: var(--g666);
        font-style: italic;
        padding: 1.5rem 0.8rem;
        background-color: var(--f8f9fa);
        border-radius: 6px;
        border: 1px dashed var(--ccc);
        /* Ensure message doesn't overflow */
        word-wrap: break-word;
    }

    .achievementHighlight {
        background: linear-gradient(135deg, rgba(111, 214, 73, 0.1) 0%, rgba(100, 212, 60, 0.2) 100%);
        border: 1px solid rgba(111, 214, 73, 0.4);
        color: var(--g333);
        box-shadow: 0 2px 8px rgba(111, 214, 73, 0.15);
    }

    .championshipHighlight {
        background: linear-gradient(135deg, rgba(111, 214, 73, 0.1) 0%, rgba(100, 212, 60, 0.2) 100%);
        border: 1px solid rgba(111, 214, 73, 0.4);
        color: var(--g333);
        box-shadow: 0 2px 8px rgba(255, 107, 53, 0.15);
    }

    /* Dark theme enhancements for achievement highlights */
    @media (prefers-color-scheme: dark) {
        .achievementHighlight {
            background: linear-gradient(135deg, rgba(126, 232, 88, 0.15) 0%, rgba(126, 232, 88, 0.25) 100%);
            border: 1px solid rgba(126, 232, 88, 0.5);
            color: var(--g111);
        }
        
        .championshipHighlight {
            background: linear-gradient(135deg, rgba(126, 232, 88, 0.15) 0%, rgba(126, 232, 88, 0.25) 100%);
            border: 1px solid rgba(126, 232, 88, 0.5);
            color: var(--g111);
        }
    }

    .trendContainer {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1.2rem;
        margin-top: 1.2rem;
    }

    /* Toggle Button Styles - Consistent with Head-to-Head Records */
    .toggleContainer {
        display: flex;
        justify-content: center;
        margin: 0.6rem 0; /* OPTIMIZED: consistent with H2H toggle container */
    }

    .toggleButton {
        display: flex;
        align-items: center;
        gap: 0.3rem; /* OPTIMIZED: consistent with H2H toggle button */
        padding: 0.5rem 0.8rem; /* OPTIMIZED: consistent with H2H toggle button */
        background: linear-gradient(135deg, var(--blueOne) 0%, #4a90e2 100%);
        color: white;
        border: none;
        border-radius: 6px; /* OPTIMIZED: consistent with H2H toggle button */
        font-weight: 600;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        min-width: 120px; /* OPTIMIZED: consistent with H2H toggle button */
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

    .chartsContent {
        overflow: hidden;
        transition: all 0.4s ease;
        opacity: 0;
        max-height: 0;
        margin-top: 0;
    }

    .chartsContent.expanded {
        opacity: 1;
        max-height: 1000px;
        margin-top: 1rem;
    }

    /* Small Mobile (480px+) - Add two-column grid back carefully */
    @media (min-width: 480px) {
        .statisticsContainer {
            padding: 1rem;
            margin: 1.2rem 0;
        }
        
        .statsGrid {
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
        }
        
        .statValue {
            font-size: 1.5rem;
        }
        
        .statLabel {
            font-size: 0.8rem;
        }
        
        .sectionTitle {
            font-size: 1.3rem;
        }
    }

    /* Tablet Portrait (768px+) - Enhanced layout - OPTIMIZED SPACING */
    @media (min-width: 768px) {
        .statisticsContainer {
            padding: 0.8rem; /* OPTIMIZED: 50% reduction from 1.5rem */
            margin: 1rem 0; /* OPTIMIZED: 50% reduction from 2rem */
            border-radius: 10px;
        }
        
        .statsGrid {
            grid-template-columns: repeat(3, 1fr);
            gap: 0.6rem; /* OPTIMIZED: 50% reduction from 1.2rem */
        }
        
        .statCard {
            padding: 0.6rem; /* OPTIMIZED: 50% reduction from 1.2rem */
        }
        
        .statValue {
            font-size: 1.8rem;
        }
        
        .statLabel {
            font-size: 0.85rem;
        }
        
        .sectionTitle {
            font-size: 1.5rem;
        }
        
        .performanceLevel {
            flex-direction: row;
            text-align: left;
            gap: 0.5rem; /* OPTIMIZED: 50% reduction from 1rem */
        }
        
        .levelDescription {
            text-align: left;
        }
    }

    /* Desktop (992px+) - Full layout with constraints */
    @media (min-width: 992px) {
        .statisticsContainer {
            max-width: 850px;
            margin: 0.8rem auto; /* OPTIMIZED: 50% reduction from 1.5rem auto */
            padding: 0.8rem; /* OPTIMIZED: 50% reduction from 1.5rem */
            border-radius: 12px;
        }
        
        .trendContainer {
            grid-template-columns: 1fr 1fr;
            gap: 0.8rem; /* OPTIMIZED: 50% reduction from 1.5rem */
        }
        
        .chartTitle {
            font-size: 1.1rem;
        }
    }

    /* Large Desktop (1200px+) - Enhanced experience */
    @media (min-width: 1200px) {
        .statisticsContainer {
            max-width: 950px;
        }
        
        .statsGrid {
            gap: 0.9rem; /* OPTIMIZED: 50% reduction from 1.8rem */
        }
        
        .statCard {
            padding: 0.8rem; /* OPTIMIZED: 50% reduction from 1.5rem */
        }
        
        .statValue {
            font-size: 2rem;
        }
        
        .statLabel {
            font-size: 0.9rem;
        }
        
        .sectionTitle {
            font-size: 1.6rem;
        }
    }

    /* Extra Large Desktop (1400px+) - Maximum experience */
    @media (min-width: 1400px) {
        .statisticsContainer {
            max-width: 1050px;
        }
        
        .statsGrid {
            gap: 1rem; /* OPTIMIZED: 50% reduction from 2rem */
        }
    }

    /* === PHASE 2: RESPONSIVE EMPHASIS HIERARCHY === */
    
    /* Mobile (< 768px) - Mobile-first optimizations */
    @media (max-width: 767px) {
        .primaryValue {
            font-size: 2rem !important;     /* Smaller primary text for mobile */
        }
        
        .recordValue {
            font-size: 1.2rem !important;   /* Smaller record text for mobile */
        }
        
        .recordSubtext {
            font-size: 0.85rem !important;  /* Smaller subtext for mobile */
        }
        
        .achievementValue {
            font-size: 1rem !important;     /* Smaller achievement values for mobile */
        }
        
        .achievementLabel {
            font-size: 0.6rem !important;   /* Smaller achievement labels for mobile */
        }
        
        .performanceBadge {
            font-size: 0.75rem !important;  /* Smaller performance badge for mobile */
        }
        
        .performanceDesc {
            font-size: 0.65rem !important;  /* Smaller performance desc for mobile */
        }
        
        .emphasisGrid {
            gap: 0.75rem !important;        /* Tighter spacing for mobile */
            margin-bottom: 1rem !important;
        }
        
        .achievementRow {
            gap: 0.75rem !important;        /* Tighter spacing for mobile */
            margin-bottom: 1rem !important;
        }
        
        .primaryCard, .secondaryCard, .achievementCard {
            padding: 0.8rem !important;     /* FIXED: Reduced mobile padding */
        }
    }
    
    /* Tablet Portrait (768px+) - Two-column top row */
    @media (min-width: 768px) {
        .emphasisGrid {
            grid-template-columns: 1fr 1fr;
            gap: var(--stats-gap-lg);
        }
        
        .achievementRow {
            grid-template-columns: repeat(3, 1fr);
        }
        
        .primaryValue {
            font-size: 2rem; /* FIXED: Much smaller than 3.2rem */
        }
        
        .recordValue {
            font-size: 1.4rem; /* FIXED: Much smaller than 2.2rem */
        }
    }
    
    /* Desktop (992px+) - Full emphasis hierarchy */
    @media (min-width: 992px) {
        .emphasisGrid {
            gap: var(--stats-gap-xl);
        }
        
        .primaryCard {
            padding: var(--stats-gap-md); /* FIXED: Using medium gap instead of XL */
        }
        
        .secondaryCard {
            padding: var(--stats-gap-md); /* FIXED: Using medium gap instead of XL */
        }
        
        /* REMOVED: Hard-coded font size - using CSS variables */
        
        /* REMOVED: Hard-coded recordValue font size */
        
        /* REMOVED: Hard-coded achievementValue font size */
    }
    
    /* Large Desktop (1200px+) - Maximum impact */
    @media (min-width: 1200px) {
        /* REMOVED: Hard-coded primaryValue font size */
        
        /* REMOVED: Hard-coded recordValue font size */
    }
    
    /* === PHASE 3.2: RESPONSIVE TYPOGRAPHY ENHANCEMENTS === */
    
    /* Mobile Typography Optimization */
    @media (max-width: 767px) {
        :root {
            --stats-text-primary: 1.2rem;     /* FIXED: Even smaller mobile primary */
            --stats-text-secondary: 0.95rem;  /* FIXED: Smaller mobile secondary */
            --stats-text-tertiary: 0.9rem;    /* Small mobile tertiary */
            --stats-text-labels: 0.6rem;      /* Small mobile labels */
            --stats-text-description: 0.7rem; /* Small mobile text */
        }
    }
    
    /* Tablet Typography Enhancement */
    @media (min-width: 768px) and (max-width: 991px) {
        :root {
            --stats-text-primary: 1.1rem;     /* Smaller tablet - was 1.6rem */
            --stats-text-secondary: 0.95rem;   /* Smaller tablet - was 1.3rem */
            --stats-text-tertiary: 0.85rem;    /* Smaller tablet - was 1.1rem */
        }
    }
</style>

<div class="statisticsContainer">
    <div class="sectionTitle">Manager Performance Statistics</div>
    
    {#if seasons.length > 0}
        <!-- PHASE 2: NEW EMPHASIS HIERARCHY LAYOUT -->
        <div class="emphasisGrid">
            <!-- PRIMARY: Large Win Rate Card -->
            <div class="primaryCard winRateCard">
                <div class="primaryValue">{winPercentage}%</div>
                <div class="primaryLabel">Win Rate</div>
                <div class="progressBar">
                    <div class="progressFill" style="width: {winPercentage}%"></div>
                </div>
            </div>
            
            <!-- SECONDARY: Record Summary Card -->
            <div class="secondaryCard recordCard">
                <div class="recordStats">
                    <div class="recordValue">{totalWins}-{totalLosses} RECORD</div>
                    <div class="recordSubtext">({round(averagePointsPerSeason)} avg pts/season)</div>
                </div>
            </div>
        </div>
        
        <!-- BOTTOM ROW: Three Achievement Cards -->
        <div class="achievementRow">
            <div class="achievementCard {playoffAppearances > 0 ? 'achievementHighlight' : ''}">
                <div class="achievementValue">{playoffAppearances}</div>
                <div class="achievementLabel">Playoffs</div>
            </div>
            
            <div class="achievementCard {championships > 0 ? 'championshipHighlight' : ''}">
                <div class="achievementValue">{championships}</div>
                <div class="achievementLabel">Titles</div>
            </div>
            
            <div class="achievementCard performanceCard" style="--performance-color: {performanceLevel.color}">
                <div class="performanceBadge">⭐ {performanceLevel.level.toUpperCase()}</div>
                <div class="performanceDesc">{performanceLevel.description}</div>
            </div>
        </div>

        {#if winTrendData.length > 1}
            <!-- Collapsible Charts Header -->
            <div class="toggleContainer">
                <button 
                    class="toggleButton" 
                    on:click={toggleCharts}
                    aria-expanded={chartsExpanded}
                    aria-label={chartsExpanded ? 'Hide season performance charts' : 'Show season performance charts'}
                >
                    <span class="toggleIcon" class:rotated={chartsExpanded}>▼</span>
                    <span class="toggleText">{chartsExpanded ? 'Hide Charts' : 'Show Charts'}</span>
                </button>
            </div>
            
            <!-- Collapsible Charts Content -->
            <div class="chartsContent" class:expanded={chartsExpanded}>
                <div class="trendContainer">
                    <ApexBarChart 
                        data={winTrendData} 
                        title="Wins by Season" 
                        height={240} 
                        chartType="wins"
                    />
                    
                    <ApexBarChart 
                        data={pointsTrendData} 
                        title="Points by Season" 
                        height={240} 
                        chartType="points"
                    />
                </div>
            </div>
        {/if}

        <!-- Collapsible Analytics Dashboard Header -->
        <div class="toggleContainer">
            <button 
                class="toggleButton" 
                on:click={toggleAnalytics}
                aria-expanded={analyticsExpanded}
                aria-label={analyticsExpanded ? 'Hide advanced analytics dashboard' : 'Show advanced analytics dashboard'}
            >
                <span class="toggleIcon" class:rotated={analyticsExpanded}>▼</span>
                <span class="toggleText">{analyticsExpanded ? 'Hide Analytics' : 'Show Analytics'}</span>
            </button>
        </div>
        
        <!-- Collapsible Analytics Dashboard Content -->
        <div class="chartsContent" class:expanded={analyticsExpanded}>
            <AnalyticsDashboard {managerStats} {leagueTeamManagers} {rosterID} {managerID} />
        </div>
    {:else}
        <div class="noDataMessage">
            📊 No historical statistics available yet.<br>
            <small>Stats will appear after the manager completes their first season.</small>
        </div>
    {/if}
</div>
