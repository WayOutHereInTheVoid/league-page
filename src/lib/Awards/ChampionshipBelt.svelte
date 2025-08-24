<script>
    import { slide } from 'svelte/transition';
    import { getNestedTeamNamesFromTeamManagers } from '$lib/utils/helperFunctions/universalFunctions';

    // Props Interface (matching your existing YearNavigator pattern)
    export let podiums = [];
    export let selectedYearIndex = 0;
    export let onYearChange;
    export let leagueTeamManagers;

    // Reactive statements for data processing
    $: currentPodium = podiums[selectedYearIndex];
    $: years = podiums
        .map((podium, originalIndex) => ({
            year: podium.year,
            originalIndex: originalIndex
        }))
        .sort((a, b) => b.year - a.year); // Sort newest to oldest

    // State management for smooth transitions
    let isTransitioning = false;

    // Navigation functions
    const navigateYear = (direction) => {
        if (isTransitioning || !onYearChange || years.length <= 1) return;
        
        const currentSortedIndex = years.findIndex(y => y.originalIndex === selectedYearIndex);
        let newIndex;
        
        if (direction === 'prev') {
            newIndex = currentSortedIndex > 0 ? currentSortedIndex - 1 : years.length - 1;
        } else {
            newIndex = currentSortedIndex < years.length - 1 ? currentSortedIndex + 1 : 0;
        }
        
        isTransitioning = true;
        onYearChange(years[newIndex].originalIndex);
        
        setTimeout(() => isTransitioning = false, 600);
    };

    // Keyboard navigation support (matching your YearNavigator pattern)
    const handleKeydown = (event, direction) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            navigateYear(direction);
        }
        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            navigateYear('prev');
        } else if (event.key === 'ArrowRight') {
            event.preventDefault();
            navigateYear('next');
        }
    };

    // Get team name with null checking
    const getChampionName = (podium) => {
        if (!podium || !podium.champion || !leagueTeamManagers) return 'No Champion';
        try {
            return getNestedTeamNamesFromTeamManagers(leagueTeamManagers, podium.year, podium.champion);
        } catch (error) {
            console.warn('Error getting champion name:', error);
            return 'Unknown Champion';
        }
    };
</script>

<style>
    .championship-belt-container {
        position: relative;
        max-width: 800px;
        margin: 2rem auto;
        padding: 2rem 1rem;
        perspective: 1200px;
    }

    .belt-wrapper {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        transform: perspective(1200px) rotateX(8deg);
        transition: transform 0.4s ease;
        filter: drop-shadow(0 15px 35px rgba(0, 0, 0, 0.4));
    }

    .belt-wrapper:hover {
        transform: perspective(1200px) rotateX(0deg) scale(1.02);
    }

    .belt-wrapper.transitioning {
        pointer-events: none;
        opacity: 0.8;
    }

    .belt-image {
        width: 100%;
        height: auto;
        position: relative;
        z-index: 1;
        display: block;
    }

    /* Navigation Plates */
    .nav-plate {
        position: absolute;
        width: 90px;
        height: 90px;
        background: transparent;
        border: none;
        cursor: pointer;
        z-index: 3;
        border-radius: 12px;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        outline: none;
    }

    .nav-plate:focus {
        outline: 3px solid rgba(255, 215, 0, 0.6);
        outline-offset: 4px;
    }

    .left-plate {
        left: 8%;
        top: 50%;
        transform: translateY(-50%);
    }

    .right-plate {
        right: 8%;
        top: 50%;
        transform: translateY(-50%);
    }

    .nav-plate:hover {
        background: rgba(255, 215, 0, 0.15);
        transform: translateY(-50%) scale(1.1);
        box-shadow: 0 0 25px rgba(255, 215, 0, 0.4);
    }

    .nav-plate:active {
        transform: translateY(-50%) scale(0.95);
        animation: pulse 0.6s ease-out;
    }

    .nav-arrow {
        font-size: 2.8rem;
        font-weight: bold;
        color: transparent;
        text-shadow: none;
        transition: all 0.3s ease;
        user-select: none;
    }

    .nav-plate:hover .nav-arrow {
        color: transparent;
        transform: none;
        text-shadow: none;
    }

    .nav-plate:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: translateY(-50%);
    }

    .nav-plate:disabled:hover {
        background: transparent;
        box-shadow: none;
    }

    .nav-plate:disabled .nav-arrow {
        color: transparent;
        transform: none;
    }

    /* Center Championship Plate */
    .center-plate {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
        z-index: 2;
        width: 300px;
        height: 160px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 1rem;
        box-sizing: border-box;
    }

    .year-display {
        font-size: 2rem;
        font-weight: 900;
        color: #1a1a1a;
        text-shadow: 
            1px 1px 2px rgba(255, 255, 255, 0.8),
            0 0 5px rgba(255, 215, 0, 0.3);
        margin-bottom: 0.5rem;
        font-family: 'Arial Black', 'Helvetica', sans-serif;
        letter-spacing: 1px;
    }

    .champion-name-container {
        position: relative;
        min-height: 60px; /* Use min-height instead of fixed height */
        overflow: visible; /* Allow content to show */
        margin: 0.5rem 0;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
    }

    .champion-name {
        position: absolute;
        font-size: 1.3rem;
        font-weight: bold;
        color: #1a1a1a;
        text-shadow: 
            1px 1px 2px rgba(255, 255, 255, 0.9),
            0 0 3px rgba(255, 215, 0, 0.2);
        white-space: normal; /* Allow text wrapping */
        max-width: 280px;
        overflow: visible; /* Allow text to show */
        word-wrap: break-word; /* Break long words if needed */
        line-height: 1.2;
        text-align: center;
    }



    /* Belt Shine Animation */
    .belt-shine {
        position: absolute;
        top: 25%;
        left: -50%;
        width: 50%;
        height: 50%;
        background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.4) 30%,
            rgba(255, 255, 255, 0.6) 50%,
            rgba(255, 255, 255, 0.4) 70%,
            transparent 100%
        );
        transform: skewX(-15deg);
        animation: shine 6s infinite ease-in-out;
        pointer-events: none;
        z-index: 4;
        border-radius: 8px;
    }

    @keyframes shine {
        0% { left: -50%; }
        20% { left: -50%; }
        50% { left: 75%; }
        100% { left: 75%; }
    }

    @keyframes pulse {
        0% { box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.4); }
        70% { box-shadow: 0 0 0 15px rgba(255, 215, 0, 0); }
        100% { box-shadow: 0 0 0 0 rgba(255, 215, 0, 0); }
    }

    /* Championship Glow Effect */
    .center-plate::before {
        content: '';
        position: absolute;
        top: -10px;
        left: -10px;
        right: -10px;
        bottom: -10px;
        background: radial-gradient(
            ellipse,
            rgba(255, 215, 0, 0.3) 0%,
            rgba(255, 165, 0, 0.2) 40%,
            transparent 70%
        );
        border-radius: 50%;
        opacity: 0;
        animation: championGlow 4s infinite alternate ease-in-out;
        z-index: -1;
        filter: blur(8px);
    }

    @keyframes championGlow {
        0% { 
            opacity: 0; 
            transform: scale(0.8) rotate(0deg); 
        }
        100% { 
            opacity: 1; 
            transform: scale(1.2) rotate(180deg); 
        }
    }

    /* Responsive Design */
    @media (max-width: 768px) {
        .championship-belt-container {
            padding: 1rem 0.5rem;
            max-width: 600px;
        }
        
        .belt-wrapper {
            transform: none; /* Remove 3D effect on mobile for performance */
        }
        
        .belt-wrapper:hover {
            transform: scale(1.01);
        }
        
        .center-plate {
            width: 240px;
            height: 120px;
            padding: 0.5rem;
        }
        
        .year-display {
            font-size: 1.6rem;
        }
        
        .champion-name {
            font-size: 1.1rem;
            max-width: 100%; /* Allow full width usage */
            white-space: normal; /* Allow text wrapping */
            word-wrap: break-word; /* Break long words if needed */
        }


        
        .nav-plate {
            width: 70px;
            height: 70px;
        }
        
        .left-plate {
            left: 5%;
        }
        
        .right-plate {
            right: 5%;
        }
        
        .nav-arrow {
            font-size: 2.2rem;
            color: transparent;
        }
    }

    @media (max-width: 480px) {
        .championship-belt-container {
            max-width: 100%;
            padding: 0.5rem;
        }

        .center-plate {
            width: 180px;
            height: 100px;
        }
        
        .year-display {
            font-size: 1.4rem;
        }
        
        .champion-name {
            font-size: 1rem;
            max-width: 100%; /* Allow full width usage */
            white-space: normal; /* Allow text wrapping */
            word-wrap: break-word; /* Break long words if needed */
        }
        


        .nav-plate {
            width: 60px;
            height: 60px;
        }

        .nav-arrow {
            font-size: 2rem;
            color: transparent;
        }

        .belt-shine {
            animation-duration: 8s; /* Slower on mobile for better performance */
        }
    }

    @media (max-width: 320px) {
        .center-plate {
            width: 160px;
            height: 90px;
        }
        
        .year-display {
            font-size: 1.2rem;
        }
        
        .champion-name {
            font-size: 0.9rem;
            max-width: 100%; /* Allow full width usage */
            white-space: normal; /* Allow text wrapping */
            word-wrap: break-word; /* Break long words if needed */
        }

    }

    /* Accessibility Improvements */
    @media (prefers-reduced-motion: reduce) {
        .belt-wrapper,
        .nav-plate,
        .nav-arrow,
        .champion-name {
            transition: none;
        }
        
        .belt-shine,
        .center-plate::before {
            animation: none;
        }
    }

    /* High contrast mode support */
    @media (prefers-contrast: high) {
        .year-display,
        .champion-name {
            color: #000;
            text-shadow: none;
        }
        
        .nav-arrow {
            color: transparent;
            text-shadow: none;
        }
        
        .nav-plate:focus {
            outline: 3px solid #000;
        }
    }

    /* Global styles for HTML content from getNestedTeamNamesFromTeamManagers */
    .champion-name :global(.curOwner) {
        font-size: 0.8em;
        color: rgba(26, 26, 26, 0.7);
        font-style: italic;
        display: block;
        margin-top: 2px;
    }
</style>

<div class="championship-belt-container">
    {#if podiums.length > 0 && currentPodium}
        <!-- Championship Belt Background -->
        <div class="belt-wrapper" class:transitioning={isTransitioning}>
            <img src="/championship-belt.png" alt="Championship Belt" class="belt-image" />
            
            <!-- Left Navigation Plate -->
            <button 
                class="nav-plate left-plate" 
                onclick={() => navigateYear('prev')}
                onkeydown={(e) => handleKeydown(e, 'prev')}
                disabled={isTransitioning}
                aria-label="Previous year - {years.find(y => y.originalIndex === selectedYearIndex)?.year - 1 || 'Last year'}"
                title="Previous year"
            >
                <div class="nav-arrow left-arrow">‹</div>
            </button>
            
            <!-- Center Championship Plate -->
            <div class="center-plate">
                <div class="year-display">{currentPodium.year}</div>
                <div class="champion-name-container">
                    {#key selectedYearIndex}
                        <div 
                            class="champion-name" 
                            in:slide="{{ duration: 300, delay: 100, axis: 'x' }}"
                            out:slide="{{ duration: 200, axis: 'x' }}"
                        >
                            {@html getChampionName(currentPodium)}
                        </div>
                    {/key}
                </div>

            </div>
            
            <!-- Right Navigation Plate -->
            <button 
                class="nav-plate right-plate" 
                onclick={() => navigateYear('next')}
                onkeydown={(e) => handleKeydown(e, 'next')}
                disabled={isTransitioning}
                aria-label="Next year - {years.find(y => y.originalIndex === selectedYearIndex)?.year + 1 || 'Next year'}"
                title="Next year"
            >
                <div class="nav-arrow right-arrow">›</div>
            </button>
            
            <!-- Belt Shine Animation -->
            <div class="belt-shine"></div>
        </div>
    {:else}
        <!-- Fallback state -->
        <div class="belt-wrapper">
            <img src="/championship-belt.png" alt="Championship Belt" class="belt-image" />
            <div class="center-plate">
                <div class="year-display">----</div>
                <div class="champion-name-container">
                    <div class="champion-name">No Champions Yet</div>
                </div>

            </div>
        </div>
    {/if}
</div>