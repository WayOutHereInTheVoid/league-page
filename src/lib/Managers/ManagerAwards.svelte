<script>
    import { round } from "$lib/utils/helper";
	import { checkIfManagerReceivedAward, getTeamNameFromTeamManagers } from "$lib/utils/helperFunctions/universalFunctions";

    export let awards, records, rosterID, tookOver, leagueTeamManagers, managerID;

    let displayAwards = [];

    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    let formerGlobal = false;

    // Task 2: Rich Tooltip System Variables
    let activeTooltip = null;
    let tooltipPosition = { x: 0, y: 0 };
    let isMobile = false;
    let tooltipElement = null;

    // Task 2: Detect mobile device
    const checkIfMobile = () => {
        if (typeof window !== 'undefined') {
            isMobile = window.innerWidth < 768 || ('ontouchstart' in window);
        }
    };

    // Task 2: Award rarity calculation based on frequency in league
    const calculateRarity = (awardType, awardValue) => {
        const awardCounts = displayAwards.filter(a => a.type === awardType).length;
        
        if (awardType === 'award') {
            // Championship-level awards are rarer
            if (awardValue === 'Champion') return { level: 'Legendary', color: '#FFD700', description: 'Ultimate Achievement' };
            if (awardValue === 'Second') return { level: 'Epic', color: '#C0C0C0', description: 'Outstanding Performance' };
            if (awardValue === 'Third') return { level: 'Rare', color: '#CD7F32', description: 'Excellent Showing' };
            return { level: 'Common', color: '#FF6B35', description: 'Solid Achievement' };
        }
        
        if (awardType.includes('All-Time')) {
            if (awardValue === 1) return { level: 'Legendary', color: '#FFD700', description: 'All-Time Greatest' };
            if (awardValue === 2) return { level: 'Epic', color: '#C0C0C0', description: 'All-Time Elite' };
            if (awardValue === 3) return { level: 'Rare', color: '#CD7F32', description: 'All-Time Great' };
        }
        
        // Single week records are uncommon
        if (awardType.includes('Single Week')) {
            return { level: 'Uncommon', color: '#9370DB', description: 'Weekly Excellence' };
        }
        
        return { level: 'Common', color: '#FF6B35', description: 'Notable Achievement' };
    };

    // Task 2: Generate rich tooltip content
    const generateTooltipContent = (award) => {
        const rarity = calculateRarity(award.type, award.award);
        
        let description = '';
        let context = '';
        let difficulty = '';
        
        // Award-specific descriptions and context
        switch (award.type) {
            case 'award':
                if (award.award === 'Champion') {
                    description = 'League Champion - Conquered the league in the ultimate test of fantasy football mastery.';
                    context = 'Won the championship playoff bracket, defeating all opponents in the final stretch.';
                    difficulty = 'Requires consistent excellence throughout the entire season and playoffs.';
                } else if (award.award === 'Second') {
                    description = 'Runner-Up - Reached the championship game through exceptional play.';
                    context = 'Advanced to the final championship matchup but fell just short of the title.';
                    difficulty = 'Requires top-tier management and a bit of playoff luck.';
                } else if (award.award === 'Third') {
                    description = 'Third Place - Secured a podium finish through consistent performance.';
                    context = 'Finished in the top 3 of the league, demonstrating strong fantasy skills.';
                    difficulty = 'Requires above-average draft strategy and waiver wire management.';
                } else if (award.award.includes('Division Champion')) {
                    description = `${award.award} - Dominated the regular season within their division.`;
                    context = 'Achieved the best regular season record within their division group.';
                    difficulty = 'Requires consistent weekly lineup optimization and strategic planning.';
                } else if (award.award === 'Toilet') {
                    description = 'Toilet Bowl Champion - Won the consolation bracket with pride.';
                    context = 'Demonstrated resilience by winning the toilet bowl tournament.';
                    difficulty = 'Sometimes the hardest trophy to win - requires persistence despite setbacks.';
                }
                break;
                
            case 'All-Time Wins Record':
                description = `All-Time Wins Leader - Holds the #${award.award} position in total league victories.`;
                context = `Has accumulated ${award.extraInfo} total wins across all seasons, demonstrating sustained excellence.`;
                difficulty = 'Requires multiple seasons of competitive play and consistent winning.';
                break;
                
            case 'All-Time Fantasy Points Record':
                description = `All-Time Scoring Leader - Ranks #${award.award} in total fantasy points scored.`;
                context = `Has scored ${award.extraInfo} total fantasy points, showcasing offensive firepower.`;
                difficulty = 'Requires elite draft strategy, waiver wire activity, and lineup optimization.';
                break;
                
            case 'All-Time Lineup IQ Record':
                description = `All-Time Lineup IQ Leader - Ranks #${award.award} in starting the best possible lineup.`;
                context = `Achieved ${award.extraInfo}% lineup efficiency, maximizing available points.`;
                difficulty = 'Requires deep player knowledge, injury awareness, and matchup analysis.';
                break;
                
            case 'All-Time Single Week Record':
                description = `All-Time Single Week Record - The #${award.award} highest-scoring week in league history.`;
                context = `Scored ${award.extraInfo} points in Week ${award.week}${award.year ? ` of ${award.year}` : ''}, an explosive performance.`;
                difficulty = 'Requires perfect lineup decisions, player breakouts, and favorable matchups aligning.';
                break;
                
            case 'All-Time Season Long Points':
                description = `All-Time Season Points Record - The #${award.award} highest-scoring season in league history.`;
                context = `Accumulated ${award.extraInfo} points throughout the ${award.year} season.`;
                difficulty = 'Requires exceptional draft execution, active waiver management, and season-long optimization.';
                break;
                
            default:
                if (award.type.includes('Single Week Record')) {
                    const year = award.type.match(/\d{4}/)?.[0];
                    description = `${year} Single Week Record - The #${award.award} highest-scoring week of the ${year} season.`;
                    context = `Scored ${award.extraInfo} points in Week ${award.week}, dominating that week's competition.`;
                    difficulty = 'Requires optimal lineup decisions and players having exceptional performances.';
                } else {
                    description = `${award.type} - Achievement earned through competitive play.`;
                    context = 'Demonstrates skill and dedication in fantasy football management.';
                    difficulty = 'Earned through strategic gameplay and fantasy football knowledge.';
                }
        }
        
        return {
            title: award.type === 'award' ? computeAward(award.award) : `${computeAward(award.award)} ${award.type}`,
            description,
            context,
            difficulty,
            rarity,
            year: award.year,
            week: award.week,
            points: award.extraInfo,
            originalName: award.originalName,
            former: award.former
        };
    };

    // Task 2: Tooltip positioning with smart boundary detection
    const updateTooltipPosition = (event) => {
        if (!tooltipElement || !event) return;
        
        const rect = tooltipElement.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        let x = event.clientX + 15;
        let y = event.clientY - rect.height - 10;
        
        // Smart boundary detection
        if (x + rect.width > viewportWidth - 20) {
            x = event.clientX - rect.width - 15;
        }
        
        if (y < 20) {
            y = event.clientY + 15;
        }
        
        if (y + rect.height > viewportHeight - 20) {
            y = viewportHeight - rect.height - 20;
        }
        
        tooltipPosition = { x, y };
    };

    // Task 2: Show tooltip with position calculation
    const showTooltip = (award, event) => {
        if (isMobile) return; // Mobile uses touch interactions
        
        activeTooltip = generateTooltipContent(award);
        
        // Small delay to ensure tooltip element exists
        setTimeout(() => updateTooltipPosition(event), 10);
    };

    // Task 2: Hide tooltip
    const hideTooltip = () => {
        activeTooltip = null;
    };

    // Task 2: Mobile tap handler for tooltip
    const handleMobileTap = (award, event) => {
        event.preventDefault();
        event.stopPropagation();
        
        if (activeTooltip?.title === generateTooltipContent(award).title) {
            hideTooltip();
        } else {
            activeTooltip = generateTooltipContent(award);
            updateTooltipPosition(event);
        }
    };

    // Task 2: Initialize mobile detection and event listeners
    import { onMount } from 'svelte';
    
    onMount(() => {
        checkIfMobile();
        
        // Update mobile detection on resize
        const handleResize = () => checkIfMobile();
        window.addEventListener('resize', handleResize);
        
        // Close tooltip when clicking outside
        const handleClickOutside = () => {
            if (isMobile && activeTooltip) {
                hideTooltip();
            }
        };
        document.addEventListener('click', handleClickOutside);
        
        return () => {
            window.removeEventListener('resize', handleResize);
            document.removeEventListener('click', handleClickOutside);
        };
    });

    const checkIfDeserves = (awardRosterID, userRosterID, year) => {
        if(!managerID || !year || !awardRosterID) {
            return awardRosterID == userRosterID;
        }
        return checkIfManagerReceivedAward(leagueTeamManagers, awardRosterID, year, managerID);
    }

    const checkIfDeservesWithManagerID = (recordManagerID, userRosterID) => {
        if(managerID) {
            return recordManagerID == managerID;
        }
        for(const year in leagueTeamManagers.teamManagersMap) {
            for(const rosterID in  leagueTeamManagers.teamManagersMap[year]) {
                if(leagueTeamManagers.teamManagersMap[year][rosterID].managers.indexOf(recordManagerID) > -1) {
                    return rosterID == userRosterID;
                }
            }
        }
        return false;
    }

    const computePodiums = (cRosterID) => {
        formerGlobal = false;
        displayAwards = [];

        // first look through annual awards (champion, second, etc)
        for(const podium of awards) {
            for(const award in podium) {
                if(award == 'year') continue;
                if(award == 'divisions') {
                    for(const division of podium[award]) {
                        if(checkIfDeserves(division.rosterID, cRosterID, podium.year)) {
                            const former = tookOver && tookOver > podium.year;
                            if(former) {
                                formerGlobal = true;
                            }
                            let awardTitle = 'Regular Season Champion';
                            if(division.name) {
                                awardTitle = `${division.name} Division Champion`;
                            }
                            displayAwards.push({
                                award: awardTitle,
                                icon: '/awards/division.png',
                                type: 'award',
                                originalName: getTeamNameFromTeamManagers(leagueTeamManagers, cRosterID, podium.year),
                                year: podium.year,
                                former
                            })
                        }
                    }
                } else if(checkIfDeserves(podium[award], cRosterID, podium.year)) {
                    const former = tookOver && tookOver > podium.year;
                    if(former) {
                        formerGlobal = true;
                    }
                    displayAwards.push({
                        award: capitalizeFirstLetter(award),
                        icon: '/awards/' + award + '.png',
                        type: 'award',
                        originalName: getTeamNameFromTeamManagers(leagueTeamManagers, cRosterID, podium.year),
                        year: podium.year,
                        former
                    })
                }
            }
        }

        // Next look through record books
        const leagueManagerRecords = [];
        for(const key in records.regularSeasonData.leagueManagerRecords) {
            const record = records.regularSeasonData.leagueManagerRecords[key];
            record.rosterID = key;
            leagueManagerRecords.push(record);
        }
        const winRecords = [...leagueManagerRecords].sort((a, b) => b.wins - a.wins);
        const pointsRecords = [...leagueManagerRecords].sort((a, b) => b.fptsFor - a.fptsFor);
        const iqRecords = [...leagueManagerRecords].sort((a, b) => (b.fptsFor/b.potentialPoints) - (a.fptsFor/a.potentialPoints));

        for(let i = 0; i < records.regularSeasonData.leagueWeekHighs.length; i++) {
            const leagueWeekRecord = records.regularSeasonData.leagueWeekHighs[i];
            const seasonLongRecord = records.regularSeasonData.mostSeasonLongPoints[i];
            const winRecord = winRecords[i];
            const pointsRecord = pointsRecords[i];
            const iqRecord = iqRecords[i];

            if(checkIfDeservesWithManagerID(winRecord?.rosterID, cRosterID) && i < 3) {
                displayAwards.push({
                    award: i + 1,
                    icon: '/awards/record-' + (i+1) + '.png',
                    type: 'All-Time Wins Record',
                    extraInfo: winRecord.wins,
                    wins: true
                })
            }

            if(checkIfDeservesWithManagerID(pointsRecord?.rosterID, cRosterID) && i < 3) {
                displayAwards.push({
                    award: i + 1,
                    icon: '/awards/record-' + (i+1) + '.png',
                    type: 'All-Time Fantasy Points Record',
                    extraInfo: round(pointsRecord.fptsFor)
                })
            }

            if(checkIfDeservesWithManagerID(iqRecord?.rosterID, cRosterID) && i < 3) {
                displayAwards.push({
                    award: i + 1,
                    icon: '/awards/record-' + (i+1) + '.png',
                    type: 'All-Time Lineup IQ Record',
                    extraInfo: round(iqRecord.fptsFor * 100 / iqRecord.potentialPoints),
                    iq: true
                })
            }

            if(checkIfDeserves(leagueWeekRecord.rosterID, cRosterID, leagueWeekRecord.year)) {
                const former = tookOver && tookOver > leagueWeekRecord.year;
                if(former) {
                    formerGlobal = true;
                }
                displayAwards.push({
                    award: i + 1,
                    icon: '/awards/' + (i < 3 ? `record-${i+1}` : 'generic') + '.png',
                    type: 'All-Time Single Week Record',
                    originalName: getTeamNameFromTeamManagers(leagueTeamManagers, cRosterID, leagueWeekRecord.year),
                    year: leagueWeekRecord.year,
                    week: leagueWeekRecord.week,
                    extraInfo: leagueWeekRecord.fpts,
                    former
                })
            }

            if(checkIfDeserves(seasonLongRecord.rosterID, cRosterID, seasonLongRecord.year)) {
                const former = tookOver && tookOver > seasonLongRecord.year;
                if(former) {
                    formerGlobal = true;
                }
                displayAwards.push({
                    award: i + 1,
                    icon: '/awards/' + (i < 3 ? `record-${i+1}` : 'generic') + '.png',
                    type: 'All-Time Season Long Points',
                    originalName: getTeamNameFromTeamManagers(leagueTeamManagers, cRosterID, seasonLongRecord.year),
                    year: seasonLongRecord.year,
                    extraInfo: seasonLongRecord.fpts,
                    former
                })
            }
        }
        for(const yearRecords of records.regularSeasonData.seasonWeekRecords) {
            for(let i = 0; i < 3; i++) {
                const seasonPointsRecord = yearRecords.seasonPointsHighs[i];
                if(checkIfDeserves(seasonPointsRecord.rosterID, cRosterID, yearRecords.year)) {
                    const former = tookOver && tookOver > yearRecords.year;
                    if(former) {
                        formerGlobal = true;
                    }
                    displayAwards.push({
                        award: i + 1,
                        icon: '/awards/' + (i < 3 ? `record-${i+1}` : 'generic') + '.png',
                        type: `${yearRecords.year} Single Week Record`,
                        originalName: getTeamNameFromTeamManagers(leagueTeamManagers, cRosterID, seasonPointsRecord.year),
                        year: null,
                        week: seasonPointsRecord.week,
                        extraInfo: seasonPointsRecord.fpts,
                        former
                    })
                }
            }
        }
    }

    $: computePodiums(rosterID);

    const computeAward = (award) => {
        switch (award) {
            case 1:
                return '1st Place'
            case 2:
                return '2nd Place'
            case 3:
                return '3rd Place'
            case 4:
            case 5:
            case 6:
            case 7:
            case 8:
            case 9:
            case 10:
                return award + 'th Place';
            case 'Champion':
                return award
            case 'Second':
            case 'Third':
                return award + ' Place'
            case 'Toilet':
                return award + ' Bowl'
            default:
                return award;
        }
    }
</script>

<style>
    /* TRUE Mobile-First Design for Awards - Eliminates All Fixed-Width Issues */
    .awardsCase {
        background-color: var(--fff);
        padding: 0.8rem 0.8rem 1rem; /* REDUCED: was 1rem 0.8rem 1.5rem */
        margin: 1rem 0; /* REDUCED: was 1.5rem 0 2rem */
        border-bottom: 1px solid var(--aaa);
        border-top: 1px solid var(--aaa);
        box-shadow: 0 0 6px 2px var(--ccc);
        border-radius: 8px;
        /* Ensure no overflow */
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
        overflow-x: hidden;
    }

    .awardsCaseInner {
        /* Mobile-first: CSS Grid for better control than flex */
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(95px, 1fr));
        gap: 0.6rem; /* OPTIMIZED: was 0.8rem */
        justify-items: center;
        padding: 0 0.5rem;
        /* Ensure grid doesn't overflow */
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
    }

    h3 {
        text-align: center;
        font-size: 1.3rem;
        margin: 0.8rem 0 0.6rem; /* REDUCED: was 1.2rem 0 1rem */
        font-weight: 500;
        color: var(--blueOne);
        /* Prevent title overflow */
        word-wrap: break-word;
        padding: 0 0.5rem 0.8rem;
        /* Orange Theme: Subtle orange accent underline */
        border-bottom: 2px solid var(--blueTwo);
        display: inline-block;
        position: relative;
        left: 50%;
        transform: translateX(-50%);
    }

    .award {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        /* Remove fixed margins, use flexible spacing */
        width: 100%;
        max-width: 120px;
        min-width: 100px;
        /* Better mobile touch targets */
        padding: 0.6rem 0.3rem 0.8rem;
        border-radius: 8px;
        /* Orange Theme: Subtle border with transparent default to prevent layout shift */
        border: 1px solid transparent;
        /* Task 3: Enhanced transitions for micro-interactions */
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        /* Phase 3: Advanced visual effects */
        position: relative;
        background: linear-gradient(135deg, 
            var(--fff) 0%, 
            rgba(255, 107, 53, 0.02) 30%,
            rgba(255, 107, 53, 0.01) 70%,
            var(--fff) 100%);
        /* Task 3: Enhanced entrance animation with anticipation */
        animation: awardRevealAdvanced 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) backwards;
        transform-origin: center bottom;
        /* Task 3: Interaction states preparation */
        overflow: hidden;
    }

    /* Task 3: Advanced entrance animation with bounce and anticipation */
    @keyframes awardRevealAdvanced {
        0% { 
            opacity: 0; 
            transform: translateY(40px) scale(0.8) rotateX(20deg);
            filter: blur(4px);
        }
        60% {
            opacity: 0.8;
            transform: translateY(-8px) scale(1.02) rotateX(-5deg);
            filter: blur(1px);
        }
        80% {
            opacity: 0.95;
            transform: translateY(2px) scale(0.98) rotateX(2deg);
            filter: blur(0px);
        }
        100% { 
            opacity: 1; 
            transform: translateY(0) scale(1) rotateX(0deg);
            filter: blur(0px);
        }
    }

    /* Task 3: Enhanced staggered animation delays with wave effect */
    .award:nth-child(1) { animation-delay: 0.1s; }
    .award:nth-child(2) { animation-delay: 0.18s; }
    .award:nth-child(3) { animation-delay: 0.26s; }
    .award:nth-child(4) { animation-delay: 0.34s; }
    .award:nth-child(5) { animation-delay: 0.42s; }
    .award:nth-child(6) { animation-delay: 0.5s; }
    .award:nth-child(7) { animation-delay: 0.58s; }
    .award:nth-child(8) { animation-delay: 0.66s; }
    .award:nth-child(9) { animation-delay: 0.74s; }
    .award:nth-child(10) { animation-delay: 0.82s; }
    .award:nth-child(n+11) { animation-delay: 0.9s; }

    /* Phase 3: Advanced depth effects with pseudo-elements */
    .award::before {
        content: '';
        position: absolute;
        inset: -2px;
        background: linear-gradient(45deg, 
            rgba(255, 107, 53, 0.08), 
            transparent, 
            rgba(255, 107, 53, 0.08));
        border-radius: inherit;
        z-index: -1;
        opacity: 0;
        transition: opacity 0.3s ease;
    }

    .award:hover {
        transform: translateY(-4px) scale(1.02);
        /* Phase 3: Enhanced multi-layer shadow system */
        box-shadow: 
            0 12px 35px rgba(255, 107, 53, 0.18),
            0 6px 15px rgba(255, 107, 53, 0.12),
            0 2px 8px rgba(0, 0, 0, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.4);
        /* Phase 3: Enhanced gradient background */
        background: linear-gradient(135deg, 
            var(--f8f9fa) 0%, 
            rgba(255, 107, 53, 0.04) 30%,
            rgba(255, 107, 53, 0.02) 70%,
            var(--f8f9fa) 100%);
        /* Orange Theme: Enhanced orange border with subtle glow */
        border-color: var(--blueTwo);
        position: relative;
        z-index: 10;
    }

    /* Phase 3: Activate depth effects on hover */
    .award:hover::before {
        opacity: 1;
    }

    /* Task 3: Ripple effect pseudo-element for click feedback */
    .award::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: radial-gradient(
            circle,
            rgba(255, 107, 53, 0.3) 0%,
            rgba(255, 107, 53, 0.1) 70%,
            transparent 100%
        );
        transform: translate(-50%, -50%) scale(0);
        transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        pointer-events: none;
        z-index: 1;
    }

    /* Task 3: Click/Active state with ripple effect */
    .award:active::after {
        width: 140px;
        height: 140px;
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* Task 3: Active state visual feedback */
    .award:active {
        transform: translateY(-3px) scale(1.01);
        transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* Task 3: Focus state for keyboard navigation */
    .award:focus {
        outline: 2px solid rgba(255, 107, 53, 0.6);
        outline-offset: 2px;
        transform: translateY(-2px) scale(1.01);
        box-shadow: 
            0 8px 25px rgba(255, 107, 53, 0.2),
            0 4px 12px rgba(255, 107, 53, 0.1);
    }

    .awardHeader, .awardLabel, .subText {
        text-align: center;
        line-height: 1.3;
        /* Remove ALL fixed widths - use flexible width */
        width: 100%;
        max-width: 100%;
        /* Ensure text wraps properly */
        word-wrap: break-word;
        hyphens: auto;
        overflow-wrap: break-word;
    }

    .awardHeader {
        /* Remove fixed height, use flexible sizing */
        min-height: 2.2rem;
        font-size: 0.75rem;
        margin-bottom: 0.6rem;
        /* Orange Theme: Award types in orange for better hierarchy */
        color: var(--blueTwo);
        font-weight: 600; /* Increased from 500 for better prominence */
        /* Allow height to adjust to content */
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .awardLabel {
        font-size: 0.85rem;
        margin-top: 0.8rem;
        font-weight: 600;
        color: var(--g333);
        /* Allow height to adjust to content */
        min-height: 1.8rem;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
    }

    .subText {
        font-size: 0.7rem;
        color: var(--g555);
        margin-top: 0.4rem;
        font-style: italic;
        line-height: 1.2;
        /* Allow flexible height */
        min-height: 1rem;
    }

    /* Orange Theme: Highlight class for years, weeks, and key values */
    .orange-highlight {
        color: var(--blueTwo);
        font-weight: 700;
        font-style: normal;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* Orange Theme: Enhanced brightness on award hover */
    .award:hover .orange-highlight {
        color: #FF8A5C; /* Slightly brighter orange */
        text-shadow: 
            0 0 12px rgba(255, 107, 53, 0.6),
            0 0 6px rgba(255, 107, 53, 0.4);
        transform: scale(1.08);
    }

    .sad {
        color: var(--g999);
        font-style: italic;
        text-align: center;
        padding: 2rem 1rem;
        grid-column: 1 / -1; /* Span full width */
        font-size: 1rem;
    }

    .awardIcon {
        height: 70px;
        width: 70px;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        overflow: hidden;
        background: var(--fff);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        /* Phase 3: Enhanced icon positioning for pseudo-elements */
        position: relative;
        z-index: 2;
    }

    /* Phase 3: Advanced icon glow effect with pseudo-element */
    .awardIcon::after {
        content: '';
        position: absolute;
        inset: -6px;
        border-radius: 50%;
        background: radial-gradient(
            circle at center,
            rgba(255, 107, 53, 0.15) 0%,
            rgba(255, 107, 53, 0.08) 40%,
            transparent 70%
        );
        opacity: 0;
        transform: scale(0.8);
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        z-index: -1;
    }

    .award:hover .awardIcon {
        transform: scale(1.12) rotate(-3deg);
        /* Task 3: Enhanced orange glow with multiple shadow layers */
        box-shadow: 
            0 8px 25px rgba(255, 107, 53, 0.4),
            0 4px 15px rgba(255, 107, 53, 0.25),
            inset 0 2px 0 rgba(255, 255, 255, 0.4);
        border-color: rgba(255, 107, 53, 0.4);
        /* Task 3: Icon breathing animation on hover */
        animation: iconPulse 2s ease-in-out infinite;
    }

    /* Task 3: Icon breathing/pulse animation */
    @keyframes iconPulse {
        0%, 100% {
            transform: scale(1.12) rotate(-3deg);
        }
        50% {
            transform: scale(1.15) rotate(-1deg);
        }
    }

    /* Task 3: Icon click feedback */
    .award:active .awardIcon {
        transform: scale(1.05) rotate(2deg);
        transition: all 0.1s cubic-bezier(0.4, 0, 0.2, 1);
        animation: none; /* Stop pulse during click */
    }

    .awardImage {
        height: 100%;
        width: 100%;
        object-fit: contain;
    }
    
    .disclaimer {
        font-size: 0.75rem;
        color: var(--g999);
        font-style: italic;
        text-align: center;
        margin: 1rem 0 0;
        line-height: 1.2;
        padding: 0 1rem;
    }

    /* Phase 3: Activate icon glow effect on hover */
    .award:hover .awardIcon::after {
        opacity: 1;
        transform: scale(1.2);
    }

    /* Phase 3: Accessibility - Respect reduced motion preferences */
    @media (prefers-reduced-motion: reduce) {
        .award {
            animation: none;
        }
        .award:hover {
            transform: translateY(-2px) scale(1.01);
        }
        .award:hover .awardIcon {
            transform: scale(1.04);
        }
    }

    /* Phase 3: Enhanced mobile touch feedback */
    @media (hover: none) and (pointer: coarse) {
        .award:active {
            transform: scale(0.98);
            transition: transform 0.1s ease;
        }
    }

    /* Small Mobile (400px+) - Slightly larger awards */
    @media (min-width: 400px) {
        .awardsCaseInner {
            grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
            gap: 1rem;
        }
        
        .award {
            max-width: 130px;
            padding: 0.8rem 0.4rem 1rem;
        }
        
        .awardIcon {
            height: 75px;
            width: 75px;
        }
        
        .awardHeader {
            font-size: 0.8rem;
            min-height: 2.8rem;
        }
        
        .awardLabel {
            font-size: 0.9rem;
            min-height: 2.2rem;
        }
        
        .subText {
            font-size: 0.75rem;
        }
    }

    /* Tablet Portrait (600px+) - More awards per row */
    @media (min-width: 600px) {
        .awardsCase {
            padding: 1.5rem 1rem 2rem;
            margin: 1.5rem 0 2rem;
        }
        
        .awardsCaseInner {
            grid-template-columns: repeat(auto-fit, minmax(115px, 1fr));
            gap: 1.2rem;
            padding: 0 1rem;
        }
        
        .award {
            max-width: 140px;
            padding: 1rem 0.5rem 1.2rem;
        }
        
        .awardIcon {
            height: 72px;
            width: 72px;
        }
        
        .awardHeader {
            font-size: 0.85rem;
            min-height: 2.7rem;
        }
        
        .awardLabel {
            font-size: 0.95rem;
            min-height: 2.2rem;
        }
        
        .subText {
            font-size: 0.8rem;
        }
        
        h3 {
            font-size: 1.4rem;
        }
    }

    /* Tablet Landscape (768px+) - Enhanced layout */
    @media (min-width: 768px) {
        .awardsCaseInner {
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 1.4rem;
            max-width: 100%;
        }
        
        .award {
            max-width: 150px;
            padding: 1.2rem 0.6rem 1.4rem;
        }
        
        .awardHeader {
            font-size: 0.9rem;
            min-height: 3.2rem;
        }
        
        .awardLabel {
            font-size: 1rem;
            min-height: 2.6rem;
        }
        
        .subText {
            font-size: 0.85rem;
        }
        
        h3 {
            font-size: 1.5rem;
        }
    }

    /* Desktop (992px+) - Full layout with constraints */
    @media (min-width: 992px) {
        .awardsCase {
            max-width: 900px;
            margin: 1.5rem auto 2rem; /* OPTIMIZED: was 2rem auto 3rem */
            padding: 1.5rem 1.5rem 2rem; /* REDUCED: was 2rem 1.5rem 2.5rem */
        }
        
        .awardsCaseInner {
            grid-template-columns: repeat(auto-fit, minmax(125px, 1fr));
            gap: 1.6rem;
            padding: 0 1.5rem;
        }
        
        .award {
            max-width: 155px;
            padding: 1.3rem 0.8rem 1.5rem;
        }
        
        .awardIcon {
            height: 75px;
            width: 75px;
        }
        
        .awardHeader {
            font-size: 0.95rem;
            min-height: 3rem;
        }
        
        .awardLabel {
            font-size: 1.05rem;
            min-height: 2.5rem;
        }
        
        .subText {
            font-size: 0.9rem;
        }
    }

    /* Large Desktop (1200px+) - Enhanced experience */
    @media (min-width: 1200px) {
        .awardsCase {
            max-width: 1000px;
        }
        
        .awardsCaseInner {
            grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
            gap: 1.8rem;
        }
        
        .award {
            max-width: 165px;
        }
        
        .awardIcon {
            height: 75px;
            width: 75px;
        }
    }

    /* Extra Large Desktop (1400px+) - Maximum experience */
    @media (min-width: 1400px) {
        .awardsCase {
            max-width: 1100px;
        }
        
        .awardsCaseInner {
            gap: 2rem;
        }
    }

    /* Task 2: Rich Tooltip Styles */
    .tooltip {
        position: fixed;
        z-index: 1000;
        /* Dark mode friendly background */
        background: var(--fff);
        border: 1px solid var(--ccc);
        border-radius: 6px;
        padding: 0.6rem;
        max-width: 200px;
        min-width: 160px;
        box-shadow: 
            0 4px 12px rgba(0, 0, 0, 0.15),
            0 2px 4px rgba(0, 0, 0, 0.1);
        font-family: inherit;
        font-size: 0.75rem;
        line-height: 1.3;
        
        /* Smooth entrance animation */
        animation: tooltipFadeIn 0.2s ease-out;
        transform-origin: bottom left;
    }

    @keyframes tooltipFadeIn {
        0% { 
            opacity: 0; 
            transform: scale(0.95) translateY(5px);
        }
        100% { 
            opacity: 1; 
            transform: scale(1) translateY(0);
        }
    }



    .tooltip-title {
        font-weight: 600;
        font-size: 0.8rem;
        color: var(--g333);
        margin: 0 0 0.4rem 0;
        line-height: 1.2;

    }

    .tooltip-rarity {
        display: flex;
        align-items: center;
        gap: 0.3rem;
        font-size: 0.75rem;
        font-weight: 600;
        padding: 0.25rem 0.6rem;
        border-radius: 20px;
        background: rgba(255, 255, 255, 0.8);
        border: 1px solid;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .tooltip-rarity.legendary {
        color: #B8860B;
        border-color: #FFD700;
        background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 215, 0, 0.05));
    }

    .tooltip-rarity.epic {
        color: #8B008B;
        border-color: #C0C0C0;
        background: linear-gradient(135deg, rgba(192, 192, 192, 0.1), rgba(192, 192, 192, 0.05));
    }

    .tooltip-rarity.rare {
        color: #8B4513;
        border-color: #CD7F32;
        background: linear-gradient(135deg, rgba(205, 127, 50, 0.1), rgba(205, 127, 50, 0.05));
    }

    .tooltip-rarity.uncommon {
        color: #4B0082;
        border-color: #9370DB;
        background: linear-gradient(135deg, rgba(147, 112, 219, 0.1), rgba(147, 112, 219, 0.05));
    }

    .tooltip-rarity.common {
        color: #D2691E;
        border-color: #FF6B35;
        background: linear-gradient(135deg, rgba(255, 107, 53, 0.1), rgba(255, 107, 53, 0.05));
    }

    .tooltip-rarity-icon {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: currentColor;
        display: inline-block;
    }

    .tooltip-description {
        font-size: 0.9rem;
        line-height: 1.4;
        color: var(--g555);
        margin-bottom: 0.8rem;
        font-weight: 500;
    }

    .tooltip-section {
        margin-bottom: 0.6rem;
    }

    .tooltip-section:last-child {
        margin-bottom: 0;
    }

    .tooltip-section-title {
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--blueTwo);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 0.3rem;
        display: flex;
        align-items: center;
        gap: 0.4rem;
    }

    .tooltip-section-title::before {
        content: '';
        width: 4px;
        height: 4px;
        background: var(--blueTwo);
        border-radius: 50%;
    }

    .tooltip-section-content {
        font-size: 0.8rem;
        line-height: 1.3;
        color: var(--g666);
        padding-left: 0.8rem;
    }

    .tooltip-stats {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.5rem;
        margin-top: 0.8rem;
        padding-top: 0.8rem;
        border-top: 1px solid rgba(255, 107, 53, 0.1);
    }

    .tooltip-stat {
        text-align: center;
    }

    .tooltip-stat-value {
        font-size: 1rem;
        font-weight: 700;
        color: var(--blueTwo);
        display: block;
        line-height: 1.2;
    }

    .tooltip-stat-label {
        font-size: 0.7rem;
        color: var(--g666);
        text-transform: uppercase;
        letter-spacing: 0.3px;
        margin-top: 0.2rem;
    }

    .tooltip-former-note {
        font-size: 0.7rem;
        color: var(--g888);
        font-style: italic;
        margin-top: 0.6rem;
        padding-top: 0.6rem;
        border-top: 1px solid rgba(255, 107, 53, 0.08);
        text-align: center;
    }

    /* Mobile tooltip adjustments */
    @media (max-width: 767px) {
        .tooltip {
            max-width: 280px;
            min-width: 250px;
            padding: 0.8rem;
            font-size: 0.85rem;
        }
        
        .tooltip-title {
            font-size: 0.9rem;
        }
        
        .tooltip-description {
            font-size: 0.8rem;
        }
        
        .tooltip-section-content {
            font-size: 0.75rem;
        }
        
        .tooltip-stats {
            grid-template-columns: 1fr;
            gap: 0.3rem;
        }
    }

    /* Task 2: Enhanced award interaction cursor */
    .award.interactive {
        cursor: pointer;
    }

    .award.interactive:hover {
        cursor: help;
    }

    /* Additional compact styles to fix tooltip readability */
    .tooltip-description {
        font-size: 0.7rem !important;
        line-height: 1.3 !important;
        color: var(--g555) !important;
        margin-bottom: 0.5rem !important;
        max-height: 3rem !important;
        overflow: hidden !important;
    }

    .tooltip-section {
        display: none !important; /* Hide complex sections for cleaner look */
    }

    .tooltip-stats {
        font-size: 0.7rem !important;
        color: var(--g555) !important;
        margin-top: 0.5rem !important;
        text-align: center !important;
        border-top: 1px solid var(--ddd) !important;
        padding-top: 0.4rem !important;
        line-height: 1.2 !important;
    }

    .tooltip-stat {
        display: inline !important;
        margin: 0 0.2rem !important;
    }

    .tooltip-stat-value {
        font-size: 0.7rem !important;
        font-weight: 600 !important;
        color: var(--blueTwo) !important;
    }

    .tooltip-stat-label {
        font-size: 0.65rem !important;
        color: var(--g666) !important;
        margin-left: 0.15rem !important;
    }

    .tooltip-former-note {
        font-size: 0.65rem !important;
        color: var(--g777) !important;
        font-style: italic !important;
        margin-top: 0.4rem !important;
        text-align: center !important;
    }
</style>

<div class="awardsCase">
    <h3>Team Awards & Records</h3>
    <div class="awardsCaseInner">
        {#each displayAwards as award}
            <div 
                class="award interactive"
                on:mouseenter={(e) => showTooltip(award, e)}
                on:mouseleave={hideTooltip}
                on:mousemove={(e) => updateTooltipPosition(e)}
                on:click={(e) => isMobile ? handleMobileTap(award, e) : null}
                on:keydown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        if (isMobile) handleMobileTap(award, e);
                    }
                }}
                on:focus={(e) => showTooltip(award, e)}
                on:blur={hideTooltip}
                role="button"
                tabindex="0"
                aria-label="View award details"
            >
                <div class="awardHeader">{award.type != 'award' ? award.type : ''}</div>
                <div class="awardIcon">
                    <img class="awardImage" src="{award.icon}" alt="trophy" />
                </div>
                <div class="awardLabel">
                    {#if award.type == 'award' && award.year}
                        <span class="orange-highlight">{award.year}</span> {computeAward(award.award)}{award.former ? '*' : ''}
                    {:else}
                        {computeAward(award.award)}{award.former ? '*' : ''}
                    {/if}
                </div>
                {#if award.extraInfo}
                    <div class="subText">
                        {#if award.year}
                            <span class="orange-highlight">{award.year}</span>
                        {/if}
                        {#if award.week}
                            Week <span class="orange-highlight">{award.week}</span>
                        {/if}
                        {#if award.year || award.week} - {/if}
                        <span class="orange-highlight">{award.extraInfo}</span>{award.wins ? ' Wins' : ''}{award.iq ? '%' : ''}{!award.wins && !award.iq ? 'pts' : ''}
                    </div>
                {/if}
            </div>
        {:else}
            <p class="sad">...nothing yet</p>
        {/each}
    </div>
    {#if formerGlobal}
        <p class="disclaimer">*Awarded under a previous manager</p>
    {/if}
</div>

<!-- Task 2: Rich Tooltip Component -->
{#if activeTooltip}
    <div 
        class="tooltip"
        bind:this={tooltipElement}
        style="left: {tooltipPosition.x}px; top: {tooltipPosition.y}px;"
        role="tooltip"
        aria-live="polite"
    >
        <div class="tooltip-title">{activeTooltip.title}</div>
        <div class="tooltip-description">{activeTooltip.description}</div>
        
        <div class="tooltip-section">
            <div class="tooltip-section-title">Achievement Context</div>
            <div class="tooltip-section-content">{activeTooltip.context}</div>
        </div>
        
        <div class="tooltip-section">
            <div class="tooltip-section-title">Difficulty</div>
            <div class="tooltip-section-content">{activeTooltip.difficulty}</div>
        </div>
        
        {#if activeTooltip.year || activeTooltip.week || activeTooltip.points}
            <div class="tooltip-stats">
                {#if activeTooltip.year}
                    <div class="tooltip-stat">
                        <span class="tooltip-stat-value">{activeTooltip.year}</span>
                        <span class="tooltip-stat-label">Season</span>
                    </div>
                {/if}
                {#if activeTooltip.week}
                    <div class="tooltip-stat">
                        <span class="tooltip-stat-value">{activeTooltip.week}</span>
                        <span class="tooltip-stat-label">Week</span>
                    </div>
                {/if}
                {#if activeTooltip.points}
                    <div class="tooltip-stat">
                        <span class="tooltip-stat-value">{activeTooltip.points}</span>
                        <span class="tooltip-stat-label">
                            {#if activeTooltip.title.includes('Wins')}
                                Total Wins
                            {:else if activeTooltip.title.includes('IQ')}
                                IQ %
                            {:else}
                                Points
                            {/if}
                        </span>
                    </div>
                {/if}
            </div>
        {/if}
        
        {#if activeTooltip.originalName && activeTooltip.originalName !== 'N/A'}
            <div class="tooltip-section">
                <div class="tooltip-section-title">Team Name</div>
                <div class="tooltip-section-content">{activeTooltip.originalName}</div>
            </div>
        {/if}
        
        {#if activeTooltip.former}
            <div class="tooltip-former-note">
                *This award was earned under a previous manager
            </div>
        {/if}
    </div>
{/if}
