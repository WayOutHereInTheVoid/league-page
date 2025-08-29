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
        width: 100%;
        max-width: 1200px;
        padding: 0 16px;
        overflow-y: hidden;
    }

    /* TASK 1: Enhanced responsive container system - Fixed width calculations */
    @media (min-width: 1400px) {
        #main {
            max-width: 1200px;
            padding: 0 24px;
        }
    }

    @media (min-width: 1200px) and (max-width: 1399px) {
        #main {
            max-width: 1150px;
            padding: 0 20px;
        }
    }

    @media (min-width: 992px) and (max-width: 1199px) {
        #main {
            max-width: 960px;
            padding: 0 16px;
        }
    }
    
    @media (max-width: 991px) {
        #main {
            max-width: 100%;
            padding: 0 12px;
        }
    }
    
    @media (max-width: 480px) {
        #main {
            padding: 0 8px;
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