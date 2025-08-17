<script>
    import Button, { Group, Label } from '@smui/button';
	import LinearProgress from '@smui/linear-progress';
    import {loadPlayers, getLeagueTransactions} from '$lib/utils/helper';
	import Roster from '../Rosters/Roster.svelte';
	import TransactionsPage from '../Transactions/TransactionsPage.svelte';
    import { goto } from '$app/navigation';
    import ManagerAwards from './ManagerAwards.svelte';
    import ManagerStatistics from './ManagerStatistics.svelte';
    import ManagerHeadToHead from './ManagerHeadToHead.svelte';
    import { onMount } from 'svelte';
	import { getDatesActive, getRosterIDFromManagerID, getTeamNameFromTeamManagers } from '$lib/utils/helperFunctions/universalFunctions';
    import { computeManagerStats, computeHeadToHeadRecords } from '$lib/utils/helperFunctions/managerStats';

    export let manager, managers, rostersData, leagueTeamManagers, rosterPositions, transactionsData, awards, records;

    let transactions = transactionsData.transactions;

    $: viewManager = managers[manager];
    $: datesActive = getDatesActive(leagueTeamManagers, viewManager.managerID);

    const startersAndReserve = rostersData.startersAndReserve;
    let rosters = rostersData.rosters;

    $: ({rosterID, year} = viewManager.managerID ? getRosterIDFromManagerID(leagueTeamManagers, viewManager.managerID) : {rosterID: viewManager.roster, year: null});
    $: teamTransactions = transactions.filter(t => t.rosters.includes(parseInt(rosterID)));
    $: roster = rosters[rosterID];
    $: coOwners = year && rosterID ? leagueTeamManagers.teamManagersMap[year][rosterID].managers.length > 1 : roster.co_owners;
    $: commissioner = viewManager.managerID ? leagueTeamManagers.users[viewManager.managerID].is_owner : false;
    $: managerStats = computeManagerStats(viewManager, leagueTeamManagers, records, rosterID, awards);

    // Head-to-head records
    let headToHeadRecords = {};
    let headToHeadLoading = true;

    const loadHeadToHeadRecords = async () => {
        if (viewManager && leagueTeamManagers) {
            headToHeadLoading = true;
            try {
                headToHeadRecords = await computeHeadToHeadRecords(viewManager, leagueTeamManagers, rosterID);
            } catch (error) {
                headToHeadRecords = {};
            }
            headToHeadLoading = false;
        }
    };

    $: if (viewManager && leagueTeamManagers && rosterID) {
        loadHeadToHeadRecords();
    }

    let players, playersInfo;
    let loading = true;

    const refreshTransactions = async () => {
        const newTransactions = await getLeagueTransactions(false, true);
        transactions = newTransactions.transactions;
    }

    onMount(async () => {
        if(transactionsData.stale) {
            refreshTransactions();
        }
        const playerData = await loadPlayers(null);
        playersInfo = playerData;
        players = playerData.players;
        loading = false;

        if(playerData.stale) {
            const newPlayerData = await loadPlayers(null, true);
            playersInfo = newPlayerData;
            players = newPlayerData.players;
        }
    })

    const changeManager = (newManager, noscroll = false) => {
        if(!newManager) {
            goto(`/managers`);
        }
        manager = newManager;
        goto(`/manager?manager=${newManager}`, {noscroll});
    }
</script>

<style>
    /* MODERN MANAGER LAYOUT - Two Column Priority Design */
    .managerContainer {
        max-width: 1400px;
        margin: 0 auto;
        padding: 1rem;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        line-height: 1.6;
        /* MOBILE OVERFLOW FIX: Comprehensive container control */
        width: 100%;
        box-sizing: border-box;
        overflow-x: hidden; /* Prevent horizontal overflow */
    }

    /* Ensure all child elements respect container boundaries */
    .managerContainer * {
        box-sizing: border-box;
        max-width: 100%;
    }

    /* ENHANCED HEADER SECTION - Includes Bio Integration */
    .managerHeader {
        text-align: center;
        margin-bottom: 1.5rem;
        background: linear-gradient(135deg, var(--fff) 0%, var(--f8f8f8) 100%);
        border-radius: 12px;
        padding: 1.5rem;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        border: 1px solid var(--eee);
    }

    .managerPhoto {
        width: 100px;
        height: 100px;
        border-radius: 50%;
        margin: 0 auto 1rem;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
        transition: transform 0.3s ease;
        object-fit: cover;
        display: block;
    }

    .managerPhoto:hover {
        transform: scale(1.05);
    }

    .managerName {
        font-size: 2.2rem;
        font-weight: 700;
        margin: 0 0 0.4rem 0;
        color: var(--g333);
        line-height: 1.2;
    }

    .teamSubtitle {
        font-size: 1rem;
        color: var(--g666);
        margin-bottom: 1.2rem;
        font-weight: 400;
    }

    .managerMeta {
        display: flex;
        justify-content: center;
        gap: 1.5rem;
        flex-wrap: wrap;
        margin-bottom: 1.2rem;
    }

    .metaItem {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.9rem;
        color: var(--g555);
    }

    .metaIcon {
        width: 20px;
        height: 20px;
    }

    .commissionerBadge {
        background: var(--blueOne);
        color: white;
        padding: 0.25rem 0.5rem;
        border-radius: 12px;
        font-size: 0.8rem;
        font-weight: 600;
    }

    /* INTEGRATED BIO SECTION IN HEADER */
    .headerBioSection {
        margin: 1.5rem 0;
        padding: 1.5rem;
        background: linear-gradient(135deg, rgba(52, 152, 219, 0.05) 0%, rgba(52, 152, 219, 0.02) 100%);
        border-radius: 8px;
        border: 1px solid rgba(52, 152, 219, 0.1);
    }

    .headerBioText {
        font-size: 1.05rem;
        line-height: 1.6;
        color: var(--g444);
        text-align: center;
        font-style: italic;
        margin-bottom: 0.8rem;
    }

    .headerPhilosophyText {
        font-size: 0.95rem;
        line-height: 1.6;
        color: var(--g555);
        text-align: center;
        padding-top: 0.8rem;
        border-top: 1px solid rgba(52, 152, 219, 0.15);
    }

    /* NAVIGATION */
    .managerNav {
        margin: 1.5rem 0;
        text-align: center;
    }

    /* TWO-COLUMN PRIORITY LAYOUT - Performance Left, Roster Right */
    .twoColumnGrid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1.5rem;
        margin-bottom: 2rem;
        /* MOBILE OVERFLOW FIX: Ensure grid children respect boundaries */
        width: 100%;
        box-sizing: border-box;
        overflow-x: hidden;
        /* Prevent grid children from overflowing */
        min-width: 0;
    }

    /* Left Column - Performance Statistics */
    .leftColumn {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1.5rem;
        /* MOBILE OVERFLOW FIX: Ensure column children respect boundaries */
        width: 100%;
        box-sizing: border-box;
        overflow-x: hidden;
        min-width: 0;
    }

    /* Right Column - Current Roster + Awards */
    .rightColumn {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1.5rem;
        /* MOBILE OVERFLOW FIX: Ensure column children respect boundaries */
        width: 100%;
        box-sizing: border-box;
        overflow-x: hidden;
        min-width: 0;
    }

    /* ENHANCED PERFORMANCE STATISTICS SECTION */
    .performanceSection {
        background: var(--fff);
        border-radius: 12px;
        padding: 1.5rem;
        box-shadow: 0 3px 15px rgba(0, 0, 0, 0.06);
        border: 1px solid var(--eee);
        transition: box-shadow 0.3s ease;
        height: fit-content;
    }

    .performanceSection:hover {
        box-shadow: 0 6px 25px rgba(0, 0, 0, 0.1);
    }

    /* SECTION STYLING */
    .contentSection {
        background: var(--fff);
        border-radius: 12px;
        padding: 1.5rem;
        box-shadow: 0 3px 15px rgba(0, 0, 0, 0.06);
        border: 1px solid var(--eee);
        transition: box-shadow 0.3s ease;
        height: fit-content;
    }

    .contentSection:hover {
        box-shadow: 0 6px 25px rgba(0, 0, 0, 0.1);
    }

    .sectionTitle {
        font-size: 1.2rem;
        font-weight: 600;
        color: var(--blueOne);
        margin: 0 0 1rem 0;
        text-align: center;
        border-bottom: 2px solid var(--blueOne);
        padding-bottom: 0.4rem;
    }

    /* RIGHT COLUMN ROSTER SECTION */
    .rosterSection {
        background: linear-gradient(135deg, var(--fff) 0%, var(--f8f8f8) 100%);
        border-radius: 12px;
        padding: 1.5rem;
        border: 1px solid var(--eee);
        box-shadow: 0 3px 15px rgba(0, 0, 0, 0.06);
        min-height: 500px;
    }

    /* OPTIMIZED TRANSACTIONS SECTION - Limited Height with Scroll */
    .transactionsSection {
        background: linear-gradient(135deg, var(--f8f8f8) 0%, var(--fff) 100%);
        border-radius: 12px;
        padding: 1.5rem;
        border: 1px solid var(--eee);
        box-shadow: 0 3px 15px rgba(0, 0, 0, 0.06);
        margin-bottom: 2rem;
        max-height: 600px; /* Limited height */
        overflow-y: auto; /* Scrollable */
        position: relative;
    }

    /* Custom scrollbar styling for transactions */
    .transactionsSection::-webkit-scrollbar {
        width: 8px;
    }

    .transactionsSection::-webkit-scrollbar-track {
        background: var(--f8f9fa);
        border-radius: 4px;
    }

    .transactionsSection::-webkit-scrollbar-thumb {
        background: var(--ccc);
        border-radius: 4px;
        transition: background 0.3s ease;
    }

    .transactionsSection::-webkit-scrollbar-thumb:hover {
        background: var(--999);
    }

    /* LOADING STATE */
    .loading {
        text-align: center;
        padding: 3rem;
        color: var(--g666);
    }

    .loadingText {
        font-size: 1.1rem;
        margin-bottom: 1rem;
    }

    /* HEAD-TO-HEAD INTEGRATION SECTION */
    .headToHeadIntegration {
        margin-top: 1.5rem;
        padding-top: 1.5rem;
        border-top: 2px solid var(--eee);
    }

    /* RESPONSIVE DESIGN - Mobile First */
    @media (min-width: 768px) {
        .managerContainer {
            padding: 2rem;
        }
        
        .managerHeader {
            padding: 2rem;
        }
        
        .managerPhoto {
            width: 120px;
            height: 120px;
        }
        
        .managerName {
            font-size: 2.5rem;
        }
        
        .twoColumnGrid {
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
        }
    }

    @media (min-width: 1024px) {
        .twoColumnGrid {
            grid-template-columns: 1fr 1.2fr; /* Performance | Roster (slightly larger) */
            gap: 2rem;
        }
        
        .rosterSection {
            min-height: 600px;
        }
        
        .transactionsSection {
            max-height: 700px; /* More space on desktop */
        }
    }

    @media (min-width: 1200px) {
        .managerContainer {
            padding: 2.5rem;
        }
        
        .twoColumnGrid {
            gap: 2.5rem;
        }
        
        .rosterSection {
            min-height: 700px;
        }
        
        .transactionsSection {
            max-height: 800px;
        }
    }
</style>

<div class="managerContainer">
    <!-- ENHANCED MANAGER HEADER WITH INTEGRATED BIO -->
    <div class="managerHeader">
        <img class="managerPhoto" src="{viewManager.photo}" alt="{viewManager.name}"/>
        
        <h1 class="managerName">{viewManager.name}</h1>
        <div class="teamSubtitle">
            {coOwners ? 'Co-' : ''}Manager of {getTeamNameFromTeamManagers(leagueTeamManagers, rosterID, year)}
        </div>
        
        <div class="managerMeta">
            <div class="metaItem">
                📍 {viewManager.location || 'Undisclosed Location'}
            </div>
            
            {#if viewManager.managerID && datesActive.start}
                <div class="metaItem">
                    🏈 {#if datesActive.end}
                        '{datesActive.start.toString().substr(2)} - '{datesActive.end.toString().substr(2)}
                    {:else}
                        Since '{datesActive.start.toString().substr(2)}
                    {/if}
                </div>
            {:else if viewManager.fantasyStart}
                <div class="metaItem">
                    🏈 Since '{viewManager.fantasyStart.toString().substr(2)}
                </div>
            {/if}
            
            {#if viewManager.preferredContact}
                <div class="metaItem">
                    💬 {viewManager.preferredContact}
                    <img class="metaIcon" src="/{viewManager.preferredContact}.png" alt="contact"/>
                </div>
            {/if}
            
            {#if viewManager.favoriteTeam}
                <div class="metaItem">
                    <img class="metaIcon" src="https://sleepercdn.com/images/team_logos/nfl/{viewManager.favoriteTeam}.png" alt="team"/>
                </div>
            {/if}
            
            {#if commissioner}
                <div class="commissionerBadge">Commissioner</div>
            {/if}
        </div>

        <!-- INTEGRATED BIO SECTION -->
        {#if viewManager.bio || viewManager.philosophy}
            <div class="headerBioSection">
                {#if viewManager.bio}
                    <div class="headerBioText">{@html viewManager.bio}</div>
                {/if}
                {#if viewManager.philosophy}
                    <div class="headerPhilosophyText">
                        <strong>Team Philosophy:</strong> {@html viewManager.philosophy}
                    </div>
                {/if}
            </div>
        {/if}

        <div class="managerNav">
            <Group variant="outlined">
                {#if manager == 0}
                    <Button disabled variant="outlined">
                        <Label>Previous</Label>
                    </Button>
                {:else}
                    <Button onclick={() => changeManager(parseInt(manager) - 1, true)} variant="outlined">
                        <Label>Previous</Label>
                    </Button>
                {/if}
                
                <Button onclick={() => goto('/managers')} variant="outlined">
                    <Label>All Managers</Label>
                </Button>
                
                {#if manager == managers.length - 1}
                    <Button disabled variant="outlined">
                        <Label>Next</Label>
                    </Button>
                {:else}
                    <Button onclick={() => changeManager(parseInt(manager) + 1, true)} variant="outlined">
                        <Label>Next</Label>
                    </Button>
                {/if}
            </Group>
        </div>
    </div>

    <!-- TWO-COLUMN PRIORITY LAYOUT -->
    <div class="twoColumnGrid">
        <!-- LEFT COLUMN: Enhanced Performance Statistics with Head-to-Head -->
        <div class="leftColumn">
            <div class="performanceSection">
                <h2 class="sectionTitle">Performance Statistics</h2>
                {#if !loading}
                    <ManagerStatistics {managerStats} {leagueTeamManagers} {rosterID} managerID={viewManager.managerID} />
                    
                    <!-- INTEGRATED HEAD-TO-HEAD SECTION -->
                    <div class="headToHeadIntegration">
                        <ManagerHeadToHead {viewManager} {managers} {headToHeadRecords} {leagueTeamManagers} loading={headToHeadLoading} />
                    </div>
                {:else}
                    <div class="loading">
                        <div class="loadingText">Loading statistics...</div>
                        <LinearProgress indeterminate />
                    </div>
                {/if}
            </div>
        </div>

        <!-- RIGHT COLUMN: Roster + Awards -->
        <div class="rightColumn">
            <!-- Current Roster -->
            <div class="rosterSection">
                <h2 class="sectionTitle">Current Roster</h2>
                {#if loading}
                    <div class="loading">
                        <div class="loadingText">Loading roster...</div>
                        <LinearProgress indeterminate />
                    </div>
                {:else}
                    <Roster division="1" expanded={true} {rosterPositions} {roster} {leagueTeamManagers} {players} {startersAndReserve} />
                {/if}
            </div>

            <!-- Awards and Records -->
            <div class="contentSection">
                <h2 class="sectionTitle">Awards & Records</h2>
                <ManagerAwards {leagueTeamManagers} tookOver={viewManager.tookOver} {awards} {records} {rosterID} managerID={viewManager.managerID} />
            </div>
        </div>
    </div>

    <!-- OPTIMIZED TRANSACTIONS SECTION - Limited Height with Scroll -->
    <div class="transactionsSection">
        <h2 class="sectionTitle">Recent Transactions</h2>
        {#if loading}
            <div class="loading">
                <div class="loadingText">Loading transactions...</div>
                <LinearProgress indeterminate />
            </div>
        {:else}
            <TransactionsPage {playersInfo} transactions={teamTransactions} {leagueTeamManagers} show='both' query='' page={0} perPage={12} />
        {/if}
    </div>

    <!-- BOTTOM NAVIGATION -->
    <div class="managerNav">
        <Group variant="outlined">
            {#if manager == 0}
                <Button disabled variant="outlined">
                    <Label>Previous Manager</Label>
                </Button>
            {:else}
                <Button onclick={() => changeManager(parseInt(manager) - 1)} variant="outlined">
                    <Label>Previous Manager</Label>
                </Button>
            {/if}
            
            <Button onclick={() => goto('/managers')} variant="outlined">
                <Label>All Managers</Label>
            </Button>
            
            {#if manager == managers.length - 1}
                <Button disabled variant="outlined">
                    <Label>Next Manager</Label>
                </Button>
            {:else}
                <Button onclick={() => changeManager(parseInt(manager) + 1)} variant="outlined">
                    <Label>Next Manager</Label>
                </Button>
            {/if}
        </Group>
    </div>
</div>
