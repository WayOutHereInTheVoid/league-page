<script>
    import { round } from "$lib/utils/helper";
	import { checkIfManagerReceivedAward, getTeamNameFromTeamManagers } from "$lib/utils/helperFunctions/universalFunctions";

    export let awards, records, rosterID, tookOver, leagueTeamManagers, managerID;

    let displayAwards = [];

    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    let formerGlobal = false;

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
        padding: 0 0.5rem;
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
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .award:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        background: var(--f8f9fa);
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
        color: var(--g555);
        font-weight: 500;
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
        transition: transform 0.2s ease;
    }

    .award:hover .awardIcon {
        transform: scale(1.05);
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
</style>

<div class="awardsCase">
    <h3>Team Awards & Records</h3>
    <div class="awardsCaseInner">
        {#each displayAwards as award}
            <div class="award">
                <div class="awardHeader">{award.type != 'award' ? award.type : ''}</div>
                <div class="awardIcon">
                    <img class="awardImage" src="{award.icon}" alt="trophy" />
                </div>
                <div class="awardLabel">{award.type == 'award' ? `${award.year} ` : ''}{computeAward(award.award)}{award.former ? '*' : ''}</div>
                {#if award.extraInfo}
                    <div class="subText">{award.year ? `${award.year} ` : ''}{award.week ? `Week ${award.week} ` : ''}{award.year || award.week ? ' - ' : ''}{award.extraInfo}{award.wins ? ' Wins' : ''}{award.iq ? '%' : ''}{!award.wins && !award.iq ? 'pts' : ''}</div>
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
