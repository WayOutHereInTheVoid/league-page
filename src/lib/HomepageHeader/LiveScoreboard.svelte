<script>
	import { getLeagueMatchups, getLeagueTeamManagers } from '$lib/utils/helper';
	import { getTeamNameFromTeamManagers, getAvatarFromTeamManagers } from '$lib/utils/helperFunctions/universalFunctions';
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

	function getWinningTeam(matchup) {
		if (matchup.team1.points > matchup.team2.points) return 'team1';
		if (matchup.team2.points > matchup.team1.points) return 'team2';
		return 'tie';
	}

	function getHighestScore() {
		if (!currentMatchups.length) return 0;
		let highestScore = 0;
		currentMatchups.forEach(matchup => {
			highestScore = Math.max(highestScore, matchup.team1.points, matchup.team2.points);
		});
		return highestScore;
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

	/* TRL BRAND INTEGRATION - Premium Card Design */
	.matchup {
		background: linear-gradient(135deg, #2D3135, #1A1D1F);
		border-radius: 12px;
		padding: 1rem;
		border: 2px solid #404449;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
		transition: all 0.3s ease;
		position: relative;
		overflow: hidden;
	}

	.matchup::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 3px;
		background: linear-gradient(90deg, #8FE419, #A8FF2E, #8FE419);
		opacity: 0.8;
	}

	.matchup:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(168, 255, 46, 0.2);
		border-color: #8FE419;
	}

	.matchup-teams {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
	}

	/* TEAM DESIGN WITH AVATARS */
	.team {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
		padding: 0.5rem;
		border-radius: 8px;
		transition: all 0.2s ease;
	}

	.team-info {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		width: 100%;
		justify-content: center;
	}

	.team-avatar {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		border: 2px solid #8C9199;
		object-fit: cover;
		transition: all 0.3s ease;
	}

	.team-name {
		font-size: 0.9rem;
		font-weight: 600;
		color: #F5F5F5; /* Platinum */
		text-align: center;
		line-height: 1.2;
		min-height: 2.4em;
		display: flex;
		align-items: center;
	}

	.team-points {
		font-size: 1.3rem;
		font-weight: 800;
		color: #E8E8E8; /* Chrome Silver */
		text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
		letter-spacing: 0.025em;
	}

	/* WINNING TEAM STYLES - TRL Electric Lime */
	.team.winning {
		background: rgba(168, 255, 46, 0.1);
		border: 1px solid rgba(168, 255, 46, 0.3);
	}

	.team.winning .team-points {
		color: #A8FF2E; /* TRL Lime Bright */
		text-shadow: 0 0 8px rgba(168, 255, 46, 0.4);
	}

	.team.winning .team-avatar {
		border-color: #A8FF2E;
		box-shadow: 0 0 12px rgba(168, 255, 46, 0.3);
	}

	.team.winning .team-name {
		color: #A8FF2E;
		font-weight: 700;
	}

	/* LOSING TEAM STYLES */
	.team.losing .team-points {
		opacity: 0.7;
		color: #8C9199; /* Gunmetal */
	}

	.team.losing .team-name {
		opacity: 0.8;
	}

	/* HIGHEST SCORER SPECIAL TREATMENT */
	.team.highest-scorer {
		background: linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(255, 215, 0, 0.05));
		border: 1px solid rgba(255, 215, 0, 0.4);
	}

	.team.highest-scorer .team-points {
		color: #FFD700; /* Victory Gold */
		text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
	}

	.team.highest-scorer .team-avatar {
		border-color: #FFD700;
		box-shadow: 0 0 15px rgba(255, 215, 0, 0.4);
	}

	/* VS DIVIDER - TRL STYLED */
	.vs-divider {
		font-size: 0.8rem;
		font-weight: 700;
		color: #8C9199; /* Gunmetal */
		opacity: 0.8;
		background: #404449;
		padding: 0.5rem;
		border-radius: 50%;
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 2px solid #1A1D1F;
		letter-spacing: 0.1em;
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
		
		.matchup {
			padding: 0.75rem;
		}

		.team-info {
			gap: 0.5rem;
		}

		.team-avatar {
			width: 28px;
			height: 28px;
		}
		
		.team-name {
			font-size: 0.8rem;
		}
		
		.team-points {
			font-size: 1.1rem;
		}
		
		.scoreboard-title {
			font-size: 1.2rem;
			margin-bottom: 1rem;
		}

		.week-indicator {
			padding: 0.3rem 0.75rem;
			font-size: 0.8rem;
		}

		.vs-divider {
			width: 32px;
			height: 32px;
			font-size: 0.7rem;
		}
	}

	@media (max-width: 480px) {
		.matchups-grid {
			grid-template-columns: 1fr;
			gap: 0.75rem;
		}

		.team-info {
			flex-direction: column;
			gap: 0.5rem;
		}

		.team-name {
			font-size: 0.85rem;
			text-align: center;
		}
	}

	/* ENHANCED MOBILE LAYOUT */
	@media (max-width: 400px) {
		.scoreboard-title {
			flex-direction: column;
			gap: 0.5rem;
		}

		.matchup {
			padding: 0.5rem;
		}

		.matchup-teams {
			gap: 0.75rem;
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
		{@const highestScore = getHighestScore()}
		<div class="matchups-grid">
			{#each currentMatchups as matchup}
				{@const winner = getWinningTeam(matchup)}
				<div class="matchup">
					<div class="matchup-teams">
						<div class="team" 
							 class:winning={winner === 'team1'} 
							 class:losing={winner === 'team2'}
							 class:highest-scorer={matchup.team1.points === highestScore && highestScore > 0}>
							<div class="team-info">
								<img src="{matchup.team1.avatar}" 
									 class="team-avatar" 
									 alt="{matchup.team1.name} avatar"
									 loading="lazy" />
								<div class="team-name">{matchup.team1.name}</div>
							</div>
							<div class="team-points">{matchup.team1.points}</div>
						</div>
						
						<div class="vs-divider">VS</div>
						
						<div class="team" 
							 class:winning={winner === 'team2'} 
							 class:losing={winner === 'team1'}
							 class:highest-scorer={matchup.team2.points === highestScore && highestScore > 0}>
							<div class="team-info">
								<img src="{matchup.team2.avatar}" 
									 class="team-avatar" 
									 alt="{matchup.team2.name} avatar"
									 loading="lazy" />
								<div class="team-name">{matchup.team2.name}</div>
							</div>
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
