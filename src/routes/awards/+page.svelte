<script>
	import { Awards } from '$lib/components'
	import { waitForAll } from '$lib/utils/helper';
	import LinearProgress from '@smui/linear-progress';
	import YearNavigator from '$lib/Awards/YearNavigator.svelte';

    export let data;
    const {awardsData, teamManagersData} = data;

    // State Management - Add selectedYearIndex and reactive selectedPodium
    let selectedYearIndex = 0;
    let podiums = [];
    let leagueTeamManagers = [];

    // Reactive statement for selectedPodium with debugging
    $: selectedPodium = podiums[selectedYearIndex];
    $: console.log('DEBUG - selectedYearIndex:', selectedYearIndex);
    $: console.log('DEBUG - podiums array:', podiums.map(p => ({ year: p.year, champion: p.champion })));
    $: console.log('DEBUG - selectedPodium year:', selectedPodium?.year);

    // Year change handler with debugging
    const handleYearChange = (yearIndex) => {
        console.log('DEBUG - handleYearChange called with:', yearIndex);
        selectedYearIndex = yearIndex;
        console.log('DEBUG - selectedYearIndex updated to:', selectedYearIndex);
    };

    // Update podiums and leagueTeamManagers when data loads
    const updateData = async () => {
        try {
            const [newPodiums, newLeagueTeamManagers] = await waitForAll(awardsData, teamManagersData);
            podiums = newPodiums;
            leagueTeamManagers = newLeagueTeamManagers;
            // Reset to first year when data loads
            selectedYearIndex = 0;
            return { podiums: newPodiums, leagueTeamManagers: newLeagueTeamManagers };
        } catch (error) {
            throw error;
        }
    };
</script>

<style>
    .awards {
        display: block;
        margin: 30px auto;
		width: 95%;
		max-width: 1000px;
		position: relative;
		z-index: 1;
		overflow-y: hidden;
    }

	.loading {
		display: block;
		width: 85%;
		max-width: 500px;
		margin: 80px auto;
	}

	.nothingYet {
		display: block;
		width: 85%;
		max-width: 500px;
		margin: 80px auto;
		text-align: center;
	}
</style>

<div class="awards">
	{#await updateData() }
		<div class="loading">
			<p>Retrieving awards data...</p>
			<LinearProgress indeterminate />
		</div>
	{:then result }
		{#if podiums.length > 0}
			<!-- YearNavigator + Single podium display -->
			<YearNavigator {podiums} {selectedYearIndex} onYearChange={handleYearChange} />

			{#if selectedPodium}
				<Awards podium={selectedPodium} {leagueTeamManagers} />
			{/if}
		{:else}
			<p class="nothingYet">No seasons have been completed yet, so no awards have been earned...</p>
		{/if}
	{:catch error}
		<!-- promise was rejected -->
		<p>Something went wrong: {error.message}</p>
	{/await}
</div>