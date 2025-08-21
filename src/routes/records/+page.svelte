<script>
	import { Records } from '$lib/components';
	import LoadingSkeleton from '$lib/Records/LoadingSkeleton.svelte';

    export let data;
    const recordsInfo = data.recordsInfo;
</script>

<style>
    #main {
        position: relative;
        z-index: 1;
    }
</style>

<div id="main">
    {#await recordsInfo}
        <!-- promise is pending -->
        <LoadingSkeleton type="table" />
    {:then [leagueData, {totals, stale}, leagueTeamManagers]}
        <Records {leagueData} {totals} {stale} {leagueTeamManagers} />
    {:catch error}
        <!-- promise was rejected -->
        <p>Something went wrong: {error.message}</p>
    {/await}
</div>
