<script>
    import { round } from "$lib/utils/helper";
	import { checkIfManagerReceivedAward, getTeamNameFromTeamManagers } from "$lib/utils/helperFunctions/universalFunctions";
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';

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
        if (!tooltipElement || !event || typeof window === 'undefined') return;
        
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

    // Group awards logically for compact button layout
    $: groupedAwards = (() => {
        const championships = displayAwards.filter(a => 
            (a.type === 'award' && (a.award === 'Champion' || a.award.includes('Champion')))
        );
        
        const podiumFinishes = displayAwards.filter(a => 
            (a.type === 'award' && (a.award === 'Second' || a.award === 'Third'))
        );
        
        const allTimeRecords = displayAwards.filter(a => 
            a.type.includes('All-Time')
        );
        
        const seasonRecords = displayAwards.filter(a => 
            a.type.includes('Single Week Record') && !a.type.includes('All-Time')
        );
        
        const otherAwards = displayAwards.filter(a => 
            !championships.includes(a) && 
            !podiumFinishes.includes(a) && 
            !allTimeRecords.includes(a) && 
            !seasonRecords.includes(a)
        );
        
        return {
            championships,
            podiumFinishes, 
            allTimeRecords,
            seasonRecords,
            otherAwards
        };
    })();
</script>

<style>
    .awardsContainer {
        background-color: var(--fff);
        padding: 1em;
        margin: 1.2em 0;
        border-radius: 12px;
        border: 1px solid var(--ccc);
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .sectionTitle {
        font-size: 1.4em;
        font-weight: 600;
        color: var(--blueOne);
        margin-bottom: 1em;
        text-align: center;
        border-bottom: 2px solid var(--blueOne);
        padding-bottom: 0.5em;
    }

    /* COMPACT HORIZONTAL BUTTON DESIGN FOR AWARDS */
    .awardsGrid {
        display: grid;
        gap: 0.6em;
    }

    .awardGroup {
        margin-bottom: 0.8em;
    }

    .groupLabel {
        font-size: 0.8em;
        color: var(--blueTwo);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 0.5em;
        padding-left: 0.5em;
        display: flex;
        align-items: center;
        gap: 0.5em;
    }

    .groupLabel::before {
        content: '';
        width: 3px;
        height: 3px;
        background: var(--blueTwo);
        border-radius: 50%;
    }

    .buttonRow {
        display: flex;
        gap: 0.6em;
        flex-wrap: wrap;
        margin-bottom: 0.6em;
    }

    .awardButton {
        flex: 1;
        min-width: 160px;
        display: flex;
        align-items: center;
        gap: 0.6em;
        padding: 0.6em 0.8em;
        background: linear-gradient(135deg, var(--fff) 0%, var(--f8f9fa) 100%);
        border: 1px solid var(--dee2e6);
        border-radius: 8px;
        transition: all 0.2s ease;
        cursor: pointer;
        position: relative;
        overflow: hidden;
    }

    .awardButton:hover {
        transform: translateY(-1px);
        box-shadow: 0 3px 12px rgba(0,0,0,0.1);
        background: linear-gradient(135deg, var(--f8f9fa) 0%, var(--e9ecef) 100%);
        border-color: var(--blueTwo);
    }

    .awardIcon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: 6px;
        flex-shrink: 0;
        overflow: hidden;
        box-shadow: 0 2px 6px rgba(0,0,0,0.15);
        background: white;
    }

    .awardImage {
        width: 100%;
        height: 100%;
        object-fit: contain;
    }

    .awardContent {
        flex: 1;
        min-width: 0;
    }

    .awardLabel {
        font-size: 0.75em;
        color: var(--blueOne);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.3px;
        margin-bottom: 0.2em;
        line-height: 1;
    }

    .awardTitle {
        font-size: 0.85em;
        color: var(--g555);
        font-weight: 500;
        line-height: 1.2;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .awardStats {
        font-size: 0.7em;
        color: var(--blueTwo);
        font-weight: 600;
        margin-top: 0.2em;
    }

    /* Special highlighting for championship awards */
    .championshipButton {
        background: linear-gradient(135deg, 
            rgba(255, 215, 0, 0.05) 0%, 
            rgba(255, 215, 0, 0.02) 50%,
            var(--fff) 100%);
        border-color: rgba(255, 215, 0, 0.3);
    }

    .championshipButton:hover {
        background: linear-gradient(135deg, 
            rgba(255, 215, 0, 0.1) 0%, 
            rgba(255, 215, 0, 0.05) 50%,
            var(--f8f9fa) 100%);
        border-color: #FFD700;
        box-shadow: 0 3px 12px rgba(255, 215, 0, 0.2);
    }



    /* No awards state */
    .noAwards {
        text-align: center;
        padding: 2rem 1rem;
        color: var(--g666);
        font-style: italic;
        background: linear-gradient(135deg, var(--f8f9fa) 0%, var(--e9ecef) 100%);
        border: 1px dashed var(--dee2e6);
        border-radius: 8px;
        font-size: 0.9em;
    }

    .noAwardsIcon {
        font-size: 2em;
        margin-bottom: 0.5em;
        opacity: 0.5;
    }

    .disclaimer {
        font-size: 0.7em;
        color: var(--g777);
        font-style: italic;
        text-align: center;
        margin-top: 1em;
        padding-top: 0.8em;
        border-top: 1px solid var(--e9ecef);
    }

    /* Former award indicator */
    .formerIndicator {
        color: var(--g777);
        font-weight: 400;
    }

    /* Mobile responsiveness */
    @media (max-width: 768px) {
        .buttonRow {
            flex-direction: column;
        }

        .awardButton {
            min-width: auto;
        }

        .groupLabel {
            font-size: 0.75em;
            margin-bottom: 0.4em;
        }
    }

    @media (max-width: 480px) {
        .awardsContainer {
            padding: 0.8em;
        }

        .awardButton {
            padding: 0.5em 0.7em;
            gap: 0.5em;
        }

        .awardIcon {
            width: 28px;
            height: 28px;
        }

        .awardLabel {
            font-size: 0.7em;
        }

        .awardTitle {
            font-size: 0.8em;
        }

        .awardStats {
            font-size: 0.65em;
        }
    }

    /* Tooltip styles (simplified for better mobile experience) */
    .tooltip {
        position: fixed;
        z-index: 1000;
        background: var(--fff);
        border: 1px solid var(--ccc);
        border-radius: 6px;
        padding: 0.6rem;
        max-width: 200px;
        min-width: 160px;
        box-shadow: 
            0 4px 12px rgba(0, 0, 0, 0.15),
            0 2px 4px rgba(0, 0, 0, 0.1);
        font-size: 0.75rem;
        line-height: 1.3;
        animation: tooltipFadeIn 0.2s ease-out;
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

    .tooltip-description {
        font-size: 0.7rem;
        line-height: 1.3;
        color: var(--g555);
        margin-bottom: 0.5rem;
    }

    .tooltip-stats {
        font-size: 0.7rem;
        color: var(--g555);
        margin-top: 0.5rem;
        text-align: center;
        border-top: 1px solid var(--ddd);
        padding-top: 0.4rem;
        line-height: 1.2;
    }

    .tooltip-stat-value {
        font-size: 0.7rem;
        font-weight: 600;
        color: var(--blueTwo);
    }

    .tooltip-stat-label {
        font-size: 0.65rem;
        color: var(--g666);
        margin-left: 0.15rem;
    }

    .tooltip-former-note {
        font-size: 0.65rem;
        color: var(--g777);
        font-style: italic;
        margin-top: 0.4rem;
        text-align: center;
    }
</style>

<div class="awardsContainer">
    <div class="sectionTitle">Awards & Records</div>
    
    {#if displayAwards.length === 0}
        <div class="noAwards">
            <div class="noAwardsIcon">🏆</div>
            <div>No awards or records yet</div>
        </div>
    {:else}
        <div class="awardsGrid">
            <!-- Championships Group -->
            {#if groupedAwards.championships.length > 0}
                <div class="awardGroup">
                    <div class="groupLabel">Championships</div>
                    <div class="buttonRow">
                        {#each groupedAwards.championships as award}
                            <div 
                                class="awardButton championshipButton"
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
                                role="button"
                                tabindex="0"
                                aria-label="View award details"
                            >
                                <div class="awardIcon">
                                    <img class="awardImage" src="{award.icon}" alt="trophy" />
                                </div>
                                <div class="awardContent">
                                    <div class="awardLabel">
                                        {award.year ? award.year : ''} Champion
                                    </div>
                                    <div class="awardTitle">
                                        {computeAward(award.award)}{#if award.former}<span class="formerIndicator">*</span>{/if}
                                    </div>
                                </div>
                            </div>
                        {/each}
                    </div>
                </div>
            {/if}

            <!-- Podium Finishes Group -->
            {#if groupedAwards.podiumFinishes.length > 0}
                <div class="awardGroup">
                    <div class="groupLabel">Podium Finishes</div>
                    <div class="buttonRow">
                        {#each groupedAwards.podiumFinishes as award}
                            <div 
                                class="awardButton"
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
                                role="button"
                                tabindex="0"
                                aria-label="View award details"
                            >
                                <div class="awardIcon">
                                    <img class="awardImage" src="{award.icon}" alt="trophy" />
                                </div>
                                <div class="awardContent">
                                    <div class="awardLabel">
                                        {award.year ? award.year : ''} Finish
                                    </div>
                                    <div class="awardTitle">
                                        {computeAward(award.award)}{#if award.former}<span class="formerIndicator">*</span>{/if}
                                    </div>
                                </div>
                            </div>
                        {/each}
                    </div>
                </div>
            {/if}





            <!-- Other Awards Group -->
            {#if groupedAwards.otherAwards.length > 0}
                <div class="awardGroup">
                    <div class="groupLabel">Other Awards</div>
                    <div class="buttonRow">
                        {#each groupedAwards.otherAwards as award}
                            <div 
                                class="awardButton"
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
                                role="button"
                                tabindex="0"
                                aria-label="View award details"
                            >
                                <div class="awardIcon">
                                    <img class="awardImage" src="{award.icon}" alt="award" />
                                </div>
                                <div class="awardContent">
                                    <div class="awardLabel">
                                        {award.type !== 'award' ? award.type : 'Achievement'}
                                    </div>
                                    <div class="awardTitle">
                                        {computeAward(award.award)}{#if award.former}<span class="formerIndicator">*</span>{/if}
                                    </div>
                                    {#if award.extraInfo}
                                        <div class="awardStats">
                                            {award.extraInfo}{award.wins ? ' Wins' : ''}{award.iq ? '%' : ''}{!award.wins && !award.iq ? ' pts' : ''}
                                        </div>
                                    {/if}
                                </div>
                            </div>
                        {/each}
                    </div>
                </div>
            {/if}
        </div>
    {/if}
    
    {#if formerGlobal}
        <div class="disclaimer">*Awarded under a previous manager</div>
    {/if}
</div>

<!-- Simplified Tooltip Component -->
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
        
        {#if activeTooltip.year || activeTooltip.week || activeTooltip.points}
            <div class="tooltip-stats">
                {#if activeTooltip.year}
                    <span class="tooltip-stat-value">{activeTooltip.year}</span>
                    <span class="tooltip-stat-label">Season</span>
                {/if}
                {#if activeTooltip.week}
                    {#if activeTooltip.year} | {/if}
                    <span class="tooltip-stat-value">Week {activeTooltip.week}</span>
                {/if}
                {#if activeTooltip.points}
                    {#if activeTooltip.year || activeTooltip.week} | {/if}
                    <span class="tooltip-stat-value">{activeTooltip.points}</span>
                    <span class="tooltip-stat-label">
                        {#if activeTooltip.title.includes('Wins')}
                            Wins
                        {:else if activeTooltip.title.includes('IQ')}
                            IQ %
                        {:else}
                            Points
                        {/if}
                    </span>
                {/if}
            </div>
        {/if}
        
        {#if activeTooltip.former}
            <div class="tooltip-former-note">
                *This award was earned under a previous manager
            </div>
        {/if}
    </div>
{/if}
