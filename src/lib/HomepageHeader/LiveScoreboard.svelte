<script>
	import { getLeagueMatchups, getLeagueTeamManagers } from '$lib/utils/helper';
	import { getTeamNameFromTeamManagers, getAvatarFromTeamManagers } from '$lib/utils/helperFunctions/universalFunctions';
	import { matchupsStore } from '$lib/stores';
	import { onMount } from 'svelte';
	import MatchupCard from './MatchupCard.svelte';

	let currentMatchups = [];
	let teamManagers = null;
	let currentWeek = 1;

	onMount(async () => {
		await loadLiveData();
	});

	async function loadLiveData() {
		try {
			const [matchupsData, teamManagersData] = await Promise.all([
				getLeagueMatchups(),
				getLeagueTeamManagers()
			]);

			teamManagers = teamManagersData;
			
			if (matchupsData?.matchupWeeks?.length) {
				currentWeek = matchupsData.week;
				
				// Get current week's matchups
				const currentWeekData = matchupsData.matchupWeeks.find(
					week => week.week === currentWeek
				);

				if (currentWeekData) {
					currentMatchups = Object.values(currentWeekData.matchups).map(matchup => {
						const [team1, team2] = matchup;
						return {
							team1: {
								name: getTeamName(team1.roster_id),
								points: calculateTotalPoints(team1.points),
								rosterId: team1.roster_id,
								avatar: getTeamAvatar(team1.roster_id)
							},
							team2: {
								name: getTeamName(team2.roster_id),
								points: calculateTotalPoints(team2.points),
								rosterId: team2.roster_id,
								avatar: getTeamAvatar(team2.roster_id)
							}
						};
					});
				}
			}
		} catch (error) {
			console.error('Error loading live scoreboard data:', error);
		}
	}

	function getTeamName(rosterId) {
		if (!teamManagers) return `Team ${rosterId}`;
		return getTeamNameFromTeamManagers(teamManagers, rosterId, teamManagers.currentSeason);
	}

	function getTeamAvatar(rosterId) {
		if (!teamManagers) return '/managers/question.jpg';
		return getAvatarFromTeamManagers(teamManagers, rosterId, teamManagers.currentSeason);
	}

	function calculateTotalPoints(pointsArray) {
		if (!pointsArray || !Array.isArray(pointsArray)) return 0;
		return Math.round(pointsArray.reduce((sum, points) => sum + (points || 0), 0) * 100) / 100;
	}

	// Reactive update when matchups store changes
	$: if ($matchupsStore) {
		loadLiveData();
	}
</script>

<style>
	.live-scoreboard {
		text-align: center;
		width: 100%;
	}

	.scoreboard-title {
		font-size: 1.4rem;
		font-weight: 700;
		margin-bottom: 1.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		color: #E8E8E8; /* Chrome Silver */
		letter-spacing: 0.025em;
	}

	.week-indicator {
		background: linear-gradient(135deg, #8FE419, #A8FF2E);
		color: #0A0A0B;
		padding: 0.4rem 1rem;
		border-radius: 25px;
		font-size: 0.9rem;
		font-weight: 700;
		box-shadow: 0 2px 8px rgba(168, 255, 46, 0.3);
	}

	/* GRID LAYOUT OPTIMIZATION - No More Scrolling! */
	.matchups-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
		gap: 1rem;
		max-width: 1200px;
		margin: 0 auto;
		/* Remove scroll - all matchups visible */
	}

	.no-matchups {
		text-align: center;
		color: #8C9199;
		font-style: italic;
		padding: 3rem 2rem;
		font-size: 1.1rem;
		opacity: 0.8;
	}

	.live-indicator {
		color: #FF6B35; /* Warning Orange */
		animation: pulse 2s infinite;
		filter: drop-shadow(0 0 4px rgba(255, 107, 53, 0.4));
	}

	@keyframes pulse {
		0% { opacity: 1; transform: scale(1); }
		50% { opacity: 0.7; transform: scale(1.05); }
		100% { opacity: 1; transform: scale(1); }
	}

	/* RESPONSIVE DESIGN */
	@media (max-width: 1200px) {
		.matchups-grid {
			grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
			gap: 0.875rem;
		}
	}

	@media (max-width: 768px) {
		.matchups-grid {
			grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
			gap: 0.75rem;
		}
		
		.scoreboard-title {
			font-size: 1.2rem;
			margin-bottom: 1rem;
		}

		.week-indicator {
			padding: 0.3rem 0.75rem;
			font-size: 0.8rem;
		}
	}

	@media (max-width: 480px) {
		.matchups-grid {
			grid-template-columns: 1fr;
			gap: 0.75rem;
		}
	}

	/* ENHANCED MOBILE LAYOUT */
	@media (max-width: 400px) {
		.scoreboard-title {
			flex-direction: column;
			gap: 0.5rem;
		}
	}
</style>

<div class="live-scoreboard">
	<div class="scoreboard-title">
		<span class="live-indicator">🔴</span>
		Live Scoreboard
		<span class="week-indicator">Week {currentWeek}</span>
	</div>

	{#if currentMatchups.length > 0}
		<div class="matchups-grid">
			{#each currentMatchups as matchup}
				<MatchupCard {matchup} />
			{/each}
		</div>
	{:else}
		<div class="no-matchups">
			No live matchups available
		</div>
	{/if}
</div>
