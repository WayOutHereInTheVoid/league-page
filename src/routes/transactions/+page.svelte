<script>
	import LinearProgress from '@smui/linear-progress';
	import { TransactionsPage } from '$lib/components'
    import { waitForAll } from '$lib/utils/helper';

    export let data;
    const {show, query, page, team, playersData, transactionsData, leagueTeamManagersData} = data;

	const perPage = 10;
</script>

<style>
    #main {
        position: relative;
        z-index: 1;
        display: block;
        margin: 30px auto;
		width: 99%;
		max-width: 1300px;
        overflow-y: hidden;
    }

    /* Enhanced responsive container system for Phase 2.0 */
    @media (min-width: 1400px) {
        #main {
            max-width: 1400px;
        }
    }

    @media (min-width: 1200px) and (max-width: 1399px) {
        #main {
            max-width: 1300px;
        }
    }

    @media (min-width: 992px) and (max-width: 1199px) {
        #main {
            max-width: 1100px;
        }
    }

	.loading {
		display: block;
		position: relative;
		z-index: 1;
		width: 85%;
		max-width: 500px;
		margin: 80px auto;
	}
</style>

<div id="main">
    {#await waitForAll(transactionsData, playersData, leagueTeamManagersData)}
        <div class="loading" >
            <p>Loading league transactions...</p>
            <LinearProgress indeterminate />
        </div>
    {:then [{transactions, currentTeams, stale}, playersInfo, leagueTeamManagers]}
        <TransactionsPage {playersInfo} {stale} {transactions} {currentTeams} {show} {query} queryPage={page} queryTeam={team} {perPage} postUpdate={true} {leagueTeamManagers} />
    {:catch error}
        <p class="center">Something went wrong: {error.message}</p>
    {/await}
</div>