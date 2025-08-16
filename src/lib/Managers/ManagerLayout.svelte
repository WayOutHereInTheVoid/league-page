<script>
    import Button, { Group, Label } from '@smui/button';
    import LinearProgress from '@smui/linear-progress';
    import { loadPlayers, getLeagueTransactions } from '$lib/utils/helper';
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
    /* MODERN MANAGER LAYOUT - Grid-Based Design */
    .managerContainer {
        max-width: 1400px;
        margin: 0 auto;
        padding: 1rem;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }

    /* HEADER SECTION - Clean, Professional */
    .managerHeader {
        text-align: center;
        margin-bottom: 2rem;
        background: linear-gradient(135deg, var(--fff) 0%, var(--f8f8f8) 100%);
        border-radius: 16px;
        padding: 2rem;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        border: 1px solid var(--eee);
    }

    .managerPhoto {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        margin: 0 auto 1.5rem;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        transition: transform 0.3s ease;
        object-fit: cover;
        display: block;
    }

    .managerPhoto:hover {
        transform: scale(1.05);
    }

    .managerName {
        font-size: 2.5rem;
        font-weight: 700;
        margin: 0 0 0.5rem 0;
        color: var(--g333);
        line-height: 1.2;
    }

    .teamSubtitle {
        font-size: 1.1rem;
        color: var(--g666);
        margin-bottom: 1.5rem;
        font-weight: 400;
    }

    .managerMeta {
        display: flex;
        justify-content: center;
        gap: 2rem;
        flex-wrap: wrap;
        margin-bottom: 1.5rem;
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

    /* NAVIGATION */
    .managerNav {
        margin: 2rem 0;
        text-align: center;
    }

    /* BIO SECTION */
    .bioSection {
        background: linear-gradient(135deg, var(--f8f8f8) 0%, var(--fff) 100%);
        border-radius: 12px;
        padding: 2rem;
        margin-bottom: 2rem;
        border: 1px solid var(--eee);
    }

    .bioText {
        font-size: 1.1rem;
        line-height: 1.6;
        color: var(--g444);
        text-align: center;
        font-style: italic;
    }

    .philosophyText {
        font-size: 1rem;
        line-height: 1.6;
        color: var(--g555);
        text-align: center;
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid var(--eee);
    }

    /* MAIN GRID LAYOUT */
    .contentGrid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 2rem;
        margin-bottom: 2rem;
    }

    /* SECTION STYLING */
    .contentSection {
        background: var(--fff);
        border-radius: 16px;
        padding: 2rem;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
        border: 1px solid var(--eee);
        transition: box-shadow 0.3s ease;
    }

    .contentSection:hover {
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }

    .sectionTitle {
        font-size: 1.4rem;
        font-weight: 600;
        color: var(--blueOne);
        margin: 0 0 1.5rem 0;
        text-align: center;
        border-bottom: 2px solid var(--blueOne);
        padding-bottom: 0.5rem;
    }

    /* ROSTER + TRANSACTIONS LAYOUT */
    .teamDataGrid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 2rem;
    }

    .rosterSection {
        background: linear-gradient(135deg, var(--fff) 0%, var(--f8f8f8) 100%);
        border-radius: 16px;
        padding: 2rem;
        border: 1px solid var(--eee);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
    }

    .transactionSection {
        background: linear-gradient(135deg, var(--f8f8f8) 0%, var(--fff) 100%);
        border-radius: 16px;
        padding: 2rem;
        border: 1px solid var(--eee);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
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

    /* RESPONSIVE DESIGN */
    @media (min-width: 768px) {
        .managerContainer {
            padding: 2rem;
        }
        
        .managerHeader {
            padding: 3rem;
        }
        
        .managerPhoto {
            width: 150px;
            height: 150px;
        }
        
        .managerName {
            font-size: 3rem;
        }
        
        .contentGrid {
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
        }
        
        .teamDataGrid {
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
        }
    }

    @media (min-width: 1024px) {
        .contentGrid {
            grid-template-columns: repeat(2, 1fr);
        }
        
        .teamDataGrid {
            grid-template-columns: 2fr 1fr;
            gap: 2rem;
        }
    }

    @media (min-width: 1200px) {
        .managerContainer {
            padding: 3rem;
        }
        
        .contentGrid {
            gap: 2.5rem;
        }
        
        .teamDataGrid {
            gap: 2.5rem;
        }
    }
</style>

<div class="managerContainer">
    <!-- MANAGER HEADER -->
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

    <!-- BIO SECTION -->
    <div class="bioSection">
        <div class="bioText">{@html viewManager.bio}</div>
        {#if viewManager.philosophy}
            <div class="philosophyText">
                <strong>Team Philosophy:</strong> {@html viewManager.philosophy}
            </div>
        {/if}
    </div>

    <!-- MAIN CONTENT GRID -->
    <div class="contentGrid">
        <!-- Manager Performance Statistics -->
        <div class="contentSection">
            <h2 class="sectionTitle">Performance Statistics</h2>
            {#if !loading}
                <ManagerStatistics {managerStats} {leagueTeamManagers} {rosterID} managerID={viewManager.managerID} />
            {/if}
        </div>

        <!-- Fantasy Football Profile -->
        <div class="contentSection">
            <h2 class="sectionTitle">Fantasy Profile</h2>
            {#if !loading}
                <ManagerFantasyInfo {viewManager} {players} {changeManager} />
            {/if}
        </div>

        <!-- Head-to-Head Records -->
        <div class="contentSection">
            <h2 class="sectionTitle">Head-to-Head Records</h2>
            {#if !loading}
                <ManagerHeadToHead {viewManager} {managers} {headToHeadRecords} {leagueTeamManagers} loading={headToHeadLoading} />
            {/if}
        </div>

        <!-- Awards and Records -->
        <div class="contentSection">
            <h2 class="sectionTitle">Awards & Records</h2>
            <ManagerAwards {leagueTeamManagers} tookOver={viewManager.tookOver} {awards} {records} {rosterID} managerID={viewManager.managerID} />
        </div>
    </div>

    <!-- TEAM DATA: ROSTER + TRANSACTIONS -->
    <div class="teamDataGrid">
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

        <!-- Recent Transactions -->
        <div class="transactionSection">
            <h2 class="sectionTitle">Recent Transactions</h2>
            {#if loading}
                <div class="loading">
                    <div class="loadingText">Loading transactions...</div>
                    <LinearProgress indeterminate />
                </div>
            {:else}
                <TransactionsPage {playersInfo} transactions={teamTransactions} {leagueTeamManagers} show='both' query='' page={0} perPage={8} />
            {/if}
        </div>
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
