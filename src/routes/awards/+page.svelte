<script>
	import { Awards } from '$lib/components'
	import { waitForAll } from '$lib/utils/helper';
	import LinearProgress from '@smui/linear-progress';
	import ChampionshipBelt from '$lib/Awards/ChampionshipBelt.svelte';

    export let data;
    const {awardsData, teamManagersData} = data;

    // State Management - Add selectedYearIndex and reactive selectedPodium
    let selectedYearIndex = 0;
    let podiums = [];
    let leagueTeamManagers = [];

    // Reactive statement for selectedPodium
    $: selectedPodium = podiums[selectedYearIndex];

    // Year change handler
    const handleYearChange = (yearIndex) => {
        selectedYearIndex = yearIndex;
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
    .awards-page {
        display: block;
        margin: 20px auto;
		width: 95%;
		max-width: 1400px;
		position: relative;
		z-index: 1;
		overflow-y: hidden;
    }

	.loading {
		display: block;
		width: 85%;
		max-width: 500px;
		margin: 80px auto;
		text-align: center;
		color: #E8E8E8;
		background: #1A1D1F;
		padding: 2rem;
		border-radius: 12px;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
	}

	.loading p {
		color: #E8E8E8;
		font-size: 1.1rem;
		margin-bottom: 1rem;
	}

	.nothingYet {
		display: block;
		width: 85%;
		max-width: 500px;
		margin: 80px auto;
		text-align: center;
		color: #E8E8E8;
		background: #1A1D1F;
		padding: 2rem;
		border-radius: 12px;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
		font-size: 1.1rem;
	}

	.error-message {
		display: block;
		width: 85%;
		max-width: 500px;
		margin: 80px auto;
		text-align: center;
		color: #FF4444;
		background: #1A1D1F;
		padding: 2rem;
		border: 2px solid #FF4444;
		border-radius: 12px;
		box-shadow: 0 4px 16px rgba(255, 68, 68, 0.2);
		font-size: 1.1rem;
	}

	/* Spacing optimization for Championship Belt + Awards integration */
	:global(.championship-belt-container + .awards) {
		margin-top: 1rem;
	}

	/* Responsive adjustments */
	@media (max-width: 768px) {
		.awards-page {
			width: 98%;
			margin: 10px auto;
		}
	}
</style>

<div class="awards-page">
	{#await updateData() }
		<div class="loading">
			<p>Retrieving awards data...</p>
			<LinearProgress indeterminate />
		</div>
	{:then result }
		{#if podiums.length > 0}
			<!-- Championship Belt Navigation -->
			<ChampionshipBelt {podiums} {selectedYearIndex} onYearChange={handleYearChange} {leagueTeamManagers} />

			{#if selectedPodium}
				<Awards podium={selectedPodium} {leagueTeamManagers} />
			{/if}
		{:else}
			<p class="nothingYet">No seasons have been completed yet, so no awards have been earned...</p>
		{/if}
	{:catch error}
		<!-- promise was rejected -->
		<p class="error-message">Something went wrong: {error.message}</p>
	{/await}
</div>
