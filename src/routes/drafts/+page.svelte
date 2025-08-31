<script>
	import { Drafts } from '$lib/components';

    export let data;
    const {previousDraftsData, leagueTeamManagersData, playersData} = data;
</script>

<style>
    #main {
        position: relative;
        z-index: 1;
    }
</style>

<div id="main">
	<Drafts {previousDraftsData} {leagueTeamManagersData} {playersData} />
</div>
