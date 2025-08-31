<script>
	import { waitForAll } from '$lib/utils/helper';
    import LinearProgress from '@smui/linear-progress';
    import Draft from './Draft.svelte'; 

    export let previousDraftsData, leagueTeamManagersData, playersData;
</script>

<style>
	.loading {
		display: block;
		width: 85%;
		max-width: 500px;
		margin: 80px auto;
	}

    h4 {
        text-align: center;
    }

    h6 {
        text-align: center;
    }
</style>

{#await waitForAll(previousDraftsData, leagueTeamManagersData, playersData) }
	<h4>Previous Drafts</h4>
	<div class="loading">
		<p>Retrieving previous drafts...</p>
		<br />
		<LinearProgress indeterminate />
	</div>
{:then [previousDrafts, leagueTeamManagers, {players}] }
	<!-- Don't display anything unless there are previous drafts -->
	{#if previousDrafts.length}
		<h4>Previous Drafts</h4>
		{#each previousDrafts as previousDraft}
			<h6>{previousDraft.year} Draft</h6>
			<Draft draftData={previousDraft} previous={true} {leagueTeamManagers} year={previousDraft.year} {players} />
		{/each}
	{/if}
{:catch error}
	<!-- promise was rejected -->
	<p>Something went wrong: {error.message}</p>
{/await}
