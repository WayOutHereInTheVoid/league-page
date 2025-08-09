<script>
	import { getLeagueMatchups, getLeagueTeamManagers } from '$lib/utils/helper';
	import { matchupsStore } from '$lib/stores';
	import { onMount } from 'svelte';

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
								rosterId: team1.roster_id
							},
							team2: {
								name: getTeamName(team2.roster_id),
								points: calculateTotalPoints(team2.points),
								rosterId: team2.roster_id
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
		return teamManagers?.currentSeason?.[rosterId]?.name || `Team ${rosterId}`;
	}

	function calculateTotalPoints(pointsArray) {
		if (!pointsArray || !Array.isArray(pointsArray)) return 0;
		return Math.round(pointsArray.reduce((sum, points) => sum + (points || 0), 0) * 100) / 100;
	}

	function getWinningTeam(matchup) {
		if (matchup.team1.points > matchup.team2.points) return 'team1';
		if (matchup.team2.points > matchup.team1.points) return 'team2';
		return 'tie';
	}

	// Reactive update when matchups store changes
	$: if ($matchupsStore) {
		loadLiveData();
	}
</script>

<style>
	.live-scoreboard {
		text-align: center;
	}

	.scoreboard-title {
		font-size: 1.3rem;
		font-weight: 600;
		margin-bottom: 1rem;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
	}

	.week-indicator {
		background: rgba(255, 255, 255, 0.2);
		padding: 0.25rem 0.75rem;
		border-radius: 20px;
		font-size: 0.9rem;
	}

	.matchups-grid {
		display: grid;
		gap: 1rem;
		max-height: 300px;
		overflow-y: auto;
	}

	.matchup {
		background: rgba(255, 255, 255, 0.1);
		border-radius: 8px;
		padding: 0.75rem;
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	.matchup-teams {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
	}

	.team {
		flex: 1;
		text-align: center;
	}

	.team-name {
		font-size: 0.9rem;
		font-weight: 500;
		margin-bottom: 0.25rem;
		opacity: 0.9;
	}

	.team-points {
		font-size: 1.2rem;
		font-weight: 700;
	}

	.team.winning .team-points {
		color: #90EE90; /* Light green for winning team */
	}

	.team.losing .team-points {
		opacity: 0.7;
	}

	.vs-divider {
		font-size: 0.8rem;
		opacity: 0.6;
		font-weight: 500;
	}

	.no-matchups {
		text-align: center;
		opacity: 0.7;
		font-style: italic;
		padding: 2rem;
	}

	.live-indicator {
		color: #FF6B6B;
		animation: pulse 2s infinite;
	}

	@keyframes pulse {
		0% { opacity: 1; }
		50% { opacity: 0.5; }
		100% { opacity: 1; }
	}

	@media (max-width: 768px) {
		.matchups-grid {
			gap: 0.75rem;
			max-height: 250px;
		}
		
		.matchup {
			padding: 0.5rem;
		}
		
		.team-name {
			font-size: 0.8rem;
		}
		
		.team-points {
			font-size: 1.1rem;
		}
		
		.scoreboard-title {
			font-size: 1.2rem;
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
				{@const winner = getWinningTeam(matchup)}
				<div class="matchup">
					<div class="matchup-teams">
						<div class="team" class:winning={winner === 'team1'} class:losing={winner === 'team2'}>
							<div class="team-name">{matchup.team1.name}</div>
							<div class="team-points">{matchup.team1.points}</div>
						</div>
						
						<div class="vs-divider">VS</div>
						
						<div class="team" class:winning={winner === 'team2'} class:losing={winner === 'team1'}>
							<div class="team-name">{matchup.team2.name}</div>
							<div class="team-points">{matchup.team2.points}</div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<div class="no-matchups">
			No live matchups available
		</div>
	{/if}
</div>
