<script>
    import Button, { Group, Label } from '@smui/button';
	import LinearProgress from '@smui/linear-progress';
    import {loadPlayers, getLeagueTransactions} from '$lib/utils/helper';
	import Roster from '../Rosters/Roster.svelte';
	import TransactionsPage from '../Transactions/TransactionsPage.svelte';
    import { goto } from '$app/navigation';
    import ManagerFantasyInfo from './ManagerFantasyInfo.svelte';
    import ManagerAwards from './ManagerAwards.svelte';
    import ManagerStatistics from './ManagerStatistics.svelte';
    import ManagerHeadToHead from './ManagerHeadToHead.svelte';
    import { onMount } from 'svelte';
	import { getDatesActive, getRosterIDFromManagerID, getTeamNameFromTeamManagers } from '$lib/utils/helperFunctions/universalFunctions';
    import { computeManagerStats, computeHeadToHeadRecords } from '$lib/utils/helperFunctions/managerStats';

    export let manager, managers, rostersData, leagueTeamManagers, rosterPositions, transactionsData, awards, records;

    let transactions = transactionsData.transactions;

    // Sidebar state management for desktop layout
    let sidebarCollapsed = false;
    let isMobile = false;

    // Check screen size for responsive behavior  
    const checkScreenSize = () => {
        if (typeof window !== 'undefined') {
            isMobile = window.innerWidth < 992; // Desktop starts at 992px
            // On mobile, always show as single column (no sidebar concept)
            if (isMobile) {
                sidebarCollapsed = false;
            }
        }
    };

    // Toggle sidebar on desktop
    const toggleSidebar = () => {
        if (!isMobile) {
            sidebarCollapsed = !sidebarCollapsed;
        }
    };

    $: viewManager = managers[manager];

    $: datesActive = getDatesActive(leagueTeamManagers, viewManager.managerID);

    const  startersAndReserve = rostersData.startersAndReserve;
    let rosters = rostersData.rosters;

    $: ({rosterID, year} = viewManager.managerID ? getRosterIDFromManagerID(leagueTeamManagers, viewManager.managerID) : {rosterID: viewManager.roster, year: null});

    $: teamTransactions = transactions.filter(t => t.rosters.includes(parseInt(rosterID)));

    $: roster = rosters[rosterID];

    $: coOwners = year && rosterID ? leagueTeamManagers.teamManagersMap[year][rosterID].managers.length > 1 : roster.co_owners;

    $: commissioner = viewManager.managerID ? leagueTeamManagers.users[viewManager.managerID].is_owner : false;

    // Compute real manager statistics from league data
    $: managerStats = computeManagerStats(viewManager, leagueTeamManagers, records, rosterID, awards);

    // Head-to-head records will be loaded asynchronously
    let headToHeadRecords = {};
    let headToHeadLoading = true;

    // Function to load head-to-head records
    const loadHeadToHeadRecords = async () => {
        if (viewManager && leagueTeamManagers) {
            headToHeadLoading = true;
            try {
                headToHeadRecords = await computeHeadToHeadRecords(viewManager, leagueTeamManagers, rosterID);
            } catch (error) {
                headToHeadRecords = {}; // Fallback to empty
            }
            headToHeadLoading = false;
        }
    };

    // Reactive statement to trigger H2H loading when manager changes
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
        // Initialize sidebar state management
        checkScreenSize();
        
        // Add resize listener for responsive behavior
        const handleResize = () => checkScreenSize();
        window.addEventListener('resize', handleResize);
        
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
        
        // Cleanup function for resize listener
        return () => {
            window.removeEventListener('resize', handleResize);
        };
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
    /* TRUE Mobile-First Manager Container - Unified Responsive Design */
    .managerContainer {
        /* Mobile-first: Safe container structure */
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
        overflow-x: hidden;
        margin: 1rem 0 3rem;
        padding: 0 0.8rem;
    }

    .managerHeader {
        /* Unified header section for manager info */
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
        text-align: center;
        margin-bottom: 1.5rem;
    }

    .managerContent {
        /* Main content wrapper for sections */
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
    }

    .managerSection {
        /* Consistent section wrapper */
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
        margin: 1.5rem 0;
    }

    /* SIDEBAR LAYOUT SYSTEM - Desktop Enhancement */
    .desktopLayout {
        /* Desktop grid layout with sidebar */
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 2rem;
        align-items: start;
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
    }

    .mainContent {
        /* Primary content area */
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
        min-width: 0; /* Prevent grid overflow */
    }

    .sidebar {
        /* Secondary content sidebar */
        width: 320px;
        max-width: 320px;
        box-sizing: border-box;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        overflow: hidden;
        background: linear-gradient(135deg, var(--f8f9fa) 0%, var(--fff) 100%);
        border-radius: 12px;
        border: 1px solid var(--e9ecef);
        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }

    .sidebar.collapsed {
        width: 0;
        max-width: 0;
        padding: 0;
        margin: 0;
        border: none;
        box-shadow: none;
    }

    .sidebarContent {
        /* Sidebar internal content */
        width: 320px;
        padding: 1.2rem;
        transition: opacity 0.3s ease;
    }

    .sidebar.collapsed .sidebarContent {
        opacity: 0;
        pointer-events: none;
    }

    .sidebarToggle {
        /* Sidebar toggle button */
        position: fixed;
        top: 50%;
        right: 1rem;
        transform: translateY(-50%);
        z-index: 100;
        background: var(--blueOne);
        color: white;
        border: none;
        border-radius: 50%;
        width: 48px;
        height: 48px;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
    }

    .sidebarToggle:hover {
        background: var(--blueTwo);
        transform: translateY(-50%) scale(1.05);
        box-shadow: 0 6px 20px rgba(0,0,0,0.3);
    }

    .sidebarToggle.collapsed {
        right: 1rem;
    }

    .sidebarToggle:not(.collapsed) {
        right: 340px; /* sidebar width + gap */
    }

    /* Mobile: No sidebar, single column layout */
    @media (max-width: 991px) {
        .desktopLayout {
            display: block;
        }
        
        .sidebar {
            width: 100%;
            max-width: 100%;
            margin-top: 1rem;
            background: none;
            border: none;
            box-shadow: none;
        }
        
        .sidebar.collapsed {
            width: 100%;
            max-width: 100%;
            padding: initial;
            margin: initial;
            border: initial;
            box-shadow: initial;
        }
        
        .sidebarContent {
            width: 100%;
            padding: 0;
        }
        
        .sidebar.collapsed .sidebarContent {
            opacity: 1;
            pointer-events: auto;
        }
        
        .sidebarToggle {
            display: none; /* Hide toggle on mobile */
        }
    }

    .managerPhoto {
        display: block;
        border-radius: 50%;
        width: 60%;
        max-width: 160px;
        height: auto;
        margin: 2rem auto 1rem;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transition: transform 0.2s ease;
    }

    .managerPhoto:hover {
        transform: scale(1.02);
    }

    h2 {
        text-align: center;
        font-size: 1.6rem;
        margin: 1rem 0 0.5rem;
        line-height: 1.2;
        color: var(--g333);
        font-weight: 600;
        /* Prevent overflow */
        word-wrap: break-word;
        hyphens: auto;
    }

    h3 {
        text-align: center;
        font-size: 1.2rem;
        margin: 1.2rem 0 0.8rem;
        font-weight: 500;
        color: var(--blueOne);
        /* Prevent overflow */
        word-wrap: break-word;
    }

    .teamSub {
        font-size: 0.75rem;
        line-height: 1.3;
        color: var(--g666);
        font-weight: 400;
        margin-top: 0.3rem;
        /* Allow wrapping */
        word-wrap: break-word;
    }

    .basicInfo {
        /* Mobile: Stack info items vertically */
        display: flex;
        flex-direction: column;
        gap: 0.6rem;
        align-items: center;
        margin: 1.5rem 0;
        padding: 0 0.5rem;
        /* Prevent overflow */
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
    }

    .infoRow {
        /* Individual info row container */
        display: flex;
        align-items: center;
        gap: 0.4rem;
        flex-wrap: wrap;
        justify-content: center;
        /* Ensure rows don't overflow */
        max-width: 100%;
        word-wrap: break-word;
    }

    .basicInfo span {
        color: var(--g555);
        font-size: 0.8rem;
        line-height: 1.3;
        /* Prevent text overflow */
        word-wrap: break-word;
        max-width: 100%;
    }

    .infoChild {
        font-style: italic;
        text-align: center;
    }

    .seperator {
        color: var(--g999);
        margin: 0 0.2rem;
    }

    .infoContact {
        height: 16px;
        width: auto;
        margin-left: 0.3rem;
    }

    .infoTeam {
        height: 24px;
        width: auto;
    }

    .commissionerBadge {
        display: inline-flex;
        justify-content: center;
        align-items: center;
        height: 20px;
        width: 20px;
        font-weight: 600;
        border-radius: 10px;
        background-color: var(--blueTwo);
        border: 1px solid var(--blueOne);
        font-size: 0.7rem;
    }

    .commissionerBadge span {
        color: #fff;
        font-style: normal;
    }

    .managerNav {
        margin: 2rem 0 1.5rem;
        text-align: center;
        /* Ensure nav doesn't overflow */
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
        overflow-x: auto;
        padding: 0 0.5rem;
    }

    .managerNav.upper {
        margin-top: 1rem;
    }

    .bio, .philosophy {
        margin: 1.5rem 0.8rem;
        line-height: 1.5;
        text-align: justify;
        /* Remove large text-indent for mobile */
        text-indent: 1rem;
        /* Prevent overflow */
        word-wrap: break-word;
        hyphens: auto;
    }

    .loading {
        display: block;
        width: 90%;
        max-width: 400px;
        margin: 2rem auto;
        text-align: center;
    }

    /* Small Mobile (480px+) - Enhanced spacing */
    @media (min-width: 480px) {
        .managerContainer {
            padding: 0 1rem;
            margin: 1.5rem 0 4rem;
        }
        
        .managerPhoto {
            width: 50%;
            max-width: 180px;
            margin: 2.5rem auto 1.2rem;
        }
        
        h2 {
            font-size: 1.8rem;
        }
        
        h3 {
            font-size: 1.3rem;
        }
        
        .basicInfo {
            gap: 0.8rem;
        }
        
        .basicInfo span {
            font-size: 0.85rem;
        }
        
        .bio, .philosophy {
            margin: 1.8rem 1rem;
            text-indent: 1.5rem;
        }
    }

    /* Tablet Portrait (600px+) - Side-by-side info starts */
    @media (min-width: 600px) {
        .managerContainer {
            padding: 0 1.2rem;
        }
        
        .basicInfo {
            flex-direction: row;
            flex-wrap: wrap;
            justify-content: center;
            gap: 1rem;
        }
        
        .infoRow {
            flex-wrap: nowrap;
        }
        
        .managerPhoto {
            max-width: 200px;
        }
        
        h2 {
            font-size: 2rem;
        }
        
        h3 {
            font-size: 1.4rem;
        }
        
        .bio, .philosophy {
            text-indent: 2rem;
        }
    }

    /* Tablet Landscape (768px+) - Enhanced layout */
    @media (min-width: 768px) {
        .managerContainer {
            padding: 0 1.5rem;
            margin: 1.5rem 0 4rem; /* REDUCED: was 2rem 0 5rem */
        }
        
        .managerHeader {
            margin-bottom: 1.5rem; /* REDUCED: was 2rem */
        }
        
        .managerSection {
            margin: 1.3rem 0; /* REDUCED: was 1.5rem 0 -> optimized for rhythm */
        }
        
        .managerPhoto {
            margin: 3rem auto 1.5rem;
        }
        
        h2 {
            font-size: 2.2rem;
        }
        
        h3 {
            font-size: 1.5rem;
        }
        
        .basicInfo span {
            font-size: 0.9rem;
        }
        
        .managerNav {
            margin: 2rem 0 1.5rem; /* REDUCED: was 3rem 0 2rem */
        }
        
        .bio, .philosophy {
            margin: 2rem 1.5rem;
            text-indent: 3rem;
        }
    }

    /* Desktop (992px+) - Constrained layout + VERTICAL SPACE OPTIMIZATION */
    @media (min-width: 992px) {
        .managerContainer {
            max-width: 900px;
            margin: 1.2rem auto 2.5rem; /* REDUCED: was 1.5rem auto 3rem -> further optimized */
            padding: 0 2rem;
        }
        
        .managerPhoto {
            max-width: 220px;
            margin: 2rem auto 1.2rem; /* REDUCED: was 3.5rem auto 2rem */
        }
        
        h2 {
            font-size: 2.4rem;
        }
        
        .bio, .philosophy {
            margin: 1.5rem 2rem; /* REDUCED: was 2.5rem 2rem */
            text-indent: 3.5rem;
        }
        
        /* VERTICAL SPACE OPTIMIZATION - New rules for better desktop spacing */
        .managerHeader {
            margin-bottom: 1.2rem; /* REDUCED: was 1.5rem -> further optimized */
        }
        
        .managerSection {
            margin: 1.2rem 0; /* REDUCED: was 2rem 0 */
        }
        
        h2 {
            margin: 0.8rem 0 0.4rem; /* REDUCED margins */
        }
        
        h3 {
            margin: 1rem 0 0.6rem; /* REDUCED: was 1.2rem 0 0.8rem */
        }
        
        .managerNav {
            margin: 1.2rem 0 0.8rem; /* REDUCED: was 1.5rem 0 1rem -> further optimized */
        }
        
        .managerNav.upper {
            margin-top: 0.6rem; /* REDUCED: was 0.8rem -> further optimized */
        }
        
        .basicInfo {
            margin: 1rem 0; /* REDUCED: was 1.5rem 0 */
        }
    }

    /* Large Desktop (1200px+) - Enhanced experience */
    @media (min-width: 1200px) {
        .managerContainer {
            max-width: 1000px;
            padding: 0 2.5rem;
        }
        
        h2 {
            font-size: 2.6rem;
        }
        
        h3 {
            font-size: 1.6rem;
        }
        
        .managerPhoto {
            max-width: 240px;
        }
    }

    /* Extra Large Desktop (1400px+) - Maximum experience */
    @media (min-width: 1400px) {
        .managerContainer {
            max-width: 1100px;
            padding: 0 3rem;
        }
        
        .bio, .philosophy {
            margin: 3rem 2.5rem;
            text-indent: 4rem;
        }
    }

    /* Mobile Navigation Improvements */
    @media (max-width: 600px) {
        :global(.selectionButtons span) {
            font-size: 0.8rem;
            line-height: 1.2;
        }
    }

    @media (max-width: 480px) {
        :global(.selectionButtons span) {
            font-size: 0.75rem;
        }
        
        .infoContact {
            height: 14px;
        }
        
        .infoTeam {
            height: 20px;
        }
        
        .commissionerBadge {
            height: 18px;
            width: 18px;
            font-size: 0.6rem;
        }
    }
</style>

<div class="managerContainer">
    <div class="managerHeader">
        <img class="managerPhoto" src="{viewManager.photo}" alt="manager"/>
        <h2>
            {viewManager.name}
            <div class="teamSub">{coOwners ? 'Co-' : ''}Manager of <i>{getTeamNameFromTeamManagers(leagueTeamManagers, rosterID, year)}</i></div>
        </h2>
        
        <div class="basicInfo">
            <div class="infoRow">
                <span class="infoChild">{viewManager.location || 'Undisclosed Location'}</span>
                {#if viewManager.managerID && datesActive.start}
                    <span class="seperator">|</span>
                    {#if datesActive.end}
                        <span class="infoChild">In the league from '{datesActive.start.toString().substr(2)} to '{datesActive.end.toString().substr(2)}</span>
                    {:else}
                        <span class="infoChild">In the league since '{datesActive.start.toString().substr(2)}</span>
                    {/if}
                {:else if viewManager.fantasyStart}
                    <span class="seperator">|</span>
                    <span class="infoChild">Playing ff since '{viewManager.fantasyStart.toString().substr(2)}</span>
                {/if}
            </div>
            
            <div class="infoRow">
                {#if viewManager.preferredContact}
                    <span class="infoChild">{viewManager.preferredContact}<img class="infoChild infoContact" src="/{viewManager.preferredContact}.png" alt="contact method"/></span>
                    <span class="seperator">|</span>
                {/if}
                {#if viewManager.favoriteTeam}
                    <img class="infoChild infoTeam" src="https://sleepercdn.com/images/team_logos/nfl/{viewManager.favoriteTeam}.png" alt="favorite team"/>
                    <span class="seperator">|</span>
                {/if}
                {#if commissioner}
                    <div class="infoChild commissionerBadge">
                        <span>C</span>
                    </div>
                {/if}
            </div>
        </div>

        <div class="managerNav upper">
            <Group variant="outlined">
                {#if manager == 0}
                    <Button disabled class="selectionButtons" onclick={() => changeManager(parseInt(manager) - 1, true)} variant="outlined">
                        <Label>Previous Manager</Label>
                    </Button>
                {:else}
                    <Button class="selectionButtons" onclick={() => changeManager(parseInt(manager) - 1, true)} variant="outlined">
                        <Label>Previous Manager</Label>
                    </Button>
                {/if}
                <Button class="selectionButtons" onclick={() => goto('/managers')} variant="outlined">
                    <Label>All Managers</Label>
                </Button>
                {#if manager == managers.length - 1}
                    <Button disabled class="selectionButtons" onclick={() => changeManager(parseInt(manager) + 1, true)} variant="outlined">
                        <Label>Next Manager</Label>
                    </Button>
                {:else}
                    <Button class="selectionButtons" onclick={() => changeManager(parseInt(manager) + 1, true)} variant="outlined">
                        <Label>Next Manager</Label>
                    </Button>
                {/if}
            </Group>
        </div>

        <p class="bio">{@html viewManager.bio}</p>

        {#if viewManager.philosophy}
            <h3>Team Philosophy</h3>
            <p class="philosophy">{@html viewManager.philosophy}</p>
        {/if}
    </div>

    <!-- Desktop Sidebar Toggle Button -->
    {#if !isMobile}
        <button 
            class="sidebarToggle {sidebarCollapsed ? 'collapsed' : ''}" 
            on:click={toggleSidebar}
            aria-label="{sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}"
        >
            {sidebarCollapsed ? '◀' : '▶'}
        </button>
    {/if}

    <div class="managerContent {isMobile ? '' : 'desktopLayout'}">
        <!-- Primary Content Area -->
        <div class="mainContent">
            {#if !loading}            
                <!-- Manager Performance Statistics (PRIMARY) -->
                <div class="managerSection">
                    <ManagerStatistics {managerStats} {leagueTeamManagers} {rosterID} managerID={viewManager.managerID} />
                </div>
                
                <!-- Enhanced Fantasy Information (PRIMARY) -->
                <div class="managerSection">
                    <ManagerFantasyInfo {viewManager} {players} {changeManager} />
                </div>
                
                <!-- Head-to-Head Records (PRIMARY) -->
                <div class="managerSection">
                    <ManagerHeadToHead {viewManager} {managers} {headToHeadRecords} {leagueTeamManagers} loading={headToHeadLoading} />
                </div>
            {/if}

            {#if loading}
                <div class="loading">
                    <p>Retrieving players...</p>
                    <LinearProgress indeterminate />
                </div>
            {:else}
                <!-- Roster Section (PRIMARY) -->
                <div class="managerSection">
                    <Roster division="1" expanded={false} {rosterPositions} {roster} {leagueTeamManagers} {players} {startersAndReserve} />
                </div>
            {/if}

            <!-- Team Transactions Section (PRIMARY) -->
            <div class="managerSection">
                <h3>Team Transactions</h3>
                {#if loading}
                    <div class="loading">
                        <p>Retrieving players...</p>
                        <LinearProgress indeterminate />
                    </div>
                {:else}
                    <TransactionsPage {playersInfo} transactions={teamTransactions} {leagueTeamManagers} show='both' query='' page={0} perPage={5} />
                {/if}
            </div>

            <!-- Bottom Navigation -->
            <div class="managerNav">
                <Group variant="outlined">
                    {#if manager == 0}
                        <Button disabled class="selectionButtons" onclick={() => changeManager(parseInt(manager) - 1)} variant="outlined">
                            <Label>Previous Manager</Label>
                        </Button>
                    {:else}
                        <Button class="selectionButtons" onclick={() => changeManager(parseInt(manager) - 1)} variant="outlined">
                            <Label>Previous Manager</Label>
                        </Button>
                    {/if}
                    <Button class="selectionButtons" onclick={() => goto('/managers')} variant="outlined">
                        <Label>All Managers</Label>
                    </Button>
                    {#if manager == managers.length - 1}
                        <Button disabled class="selectionButtons" onclick={() => changeManager(parseInt(manager) + 1)} variant="outlined">
                            <Label>Next Manager</Label>
                        </Button>
                    {:else}
                        <Button class="selectionButtons" onclick={() => changeManager(parseInt(manager) + 1)} variant="outlined">
                            <Label>Next Manager</Label>
                        </Button>
                    {/if}
                </Group>
            </div>
        </div>

        <!-- Secondary Content Sidebar (Desktop Only) -->
        {#if !isMobile}
            <div class="sidebar {sidebarCollapsed ? 'collapsed' : ''}">
                <div class="sidebarContent">
                    <!-- Awards and Records (SECONDARY) -->
                    <div class="managerSection">
                        <ManagerAwards {leagueTeamManagers} tookOver={viewManager.tookOver} {awards} {records} {rosterID} managerID={viewManager.managerID} />
                    </div>
                </div>
            </div>
        {:else}
            <!-- Mobile: Awards shown in main flow -->
            <div class="managerSection">
                <ManagerAwards {leagueTeamManagers} tookOver={viewManager.tookOver} {awards} {records} {rosterID} managerID={viewManager.managerID} />
            </div>
        {/if}
    </div>
</div>
