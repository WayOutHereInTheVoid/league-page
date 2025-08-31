<script>
	import { onMount, onDestroy } from 'svelte';
	import { getNflState, getLeagueMatchups, getLeagueTeamManagers } from '$lib/utils/helper';
	import { getTeamNameFromTeamManagers } from '$lib/utils/helperFunctions/universalFunctions';
	import { nflState, matchupsStore } from '$lib/stores';
	import { get } from 'svelte/store';
	import { draftConfig, getDraftDate } from '$lib/utils/leagueInfo';
	import { 
		determineSchedulePeriod, 
		getCountdownData, 
		shouldShowLiveScoreboard,
		hasSeasonStarted
	} from '$lib/utils/helperFunctions/scheduleLogic';
	import GameWeekCountdown from './GameWeekCountdown.svelte';
	import LiveScoreboard from './LiveScoreboard.svelte';
	import WeeklyWinner from './WeeklyWinner.svelte';

	let pollingInterval = null;
	let showLiveScores = false;
	let weeklyWinnerData = null;
	let countdownData = null;
	let currentNflState = null;

	onMount(async () => {
		// Initial data load
		await loadInitialData();
		
		// Start smart polling
		startSmartPolling();
	});

	onDestroy(() => {
		stopPolling();
	});

	async function loadInitialData() {
		try {
			currentNflState = await getNflState();
			await calculateWeeklyWinner();
			determineDisplayMode();
		} catch (error) {
			console.error('Error loading header data:', error);
		}
	}

	function determineDisplayMode() {
		if (!currentNflState) return;

		// Use new hardcoded schedule logic
		showLiveScores = shouldShowLiveScoreboard(currentNflState);
		
		// Prepare countdown data for non-live periods
		if (!showLiveScores) {
			prepareCountdownData();
		}
	}

	function prepareCountdownData() {
		if (!currentNflState) return;

		// Handle preseason draft countdown (if before season starts)
		if (!hasSeasonStarted() && draftConfig.enableDraftCountdown) {
			// PRESEASON MODE: Countdown to draft
			const draftDate = getDraftDate();
			
			countdownData = {
				targetDate: draftDate,
				week: currentNflState.week,
				seasonType: currentNflState.season_type,
				isDraftCountdown: true,
				draftInfo: {
					dateString: draftConfig.dateString,
					year: draftConfig.year
				}
			};
		} else {
			// Use new schedule logic for countdown data
			countdownData = getCountdownData(currentNflState);
		}
	}

	async function calculateWeeklyWinner() {
		try {
			const [matchupsData, teamManagers] = await Promise.all([
				getLeagueMatchups(),
				getLeagueTeamManagers()
			]);

			if (!matchupsData?.matchupWeeks?.length) return;

			// Find the most recent completed week
			let mostRecentWeek = null;
			let highestScore = 0;
			let winnerRosterId = null;

			// Look through weeks in reverse order to find most recent completed
			for (let i = matchupsData.matchupWeeks.length - 1; i >= 0; i--) {
				const weekData = matchupsData.matchupWeeks[i];
				
				// Check if this week has completed matchups (all teams have scores)
				const allMatchups = Object.values(weekData.matchups).flat();
				const hasAllScores = allMatchups.every(team => 
					team.points && team.points.length > 0
				);

				if (hasAllScores) {
					mostRecentWeek = weekData.week;
					
					// Find highest scorer in this week
					allMatchups.forEach(team => {
						const totalPoints = team.points.reduce((sum, points) => sum + (points || 0), 0);
						if (totalPoints > highestScore) {
							highestScore = totalPoints;
							winnerRosterId = team.roster_id;
						}
					});
					break; // Found most recent completed week
				}
			}

			if (mostRecentWeek && winnerRosterId) {
				// Get team name using the proper helper function
				const teamName = getTeamNameFromTeamManagers(teamManagers, winnerRosterId, teamManagers.currentSeason);

				weeklyWinnerData = {
					week: mostRecentWeek,
					teamName,
					points: Math.round(highestScore * 100) / 100, // Round to 2 decimal places
					rosterId: winnerRosterId
				};
			}
		} catch (error) {
			console.error('Error calculating weekly winner:', error);
		}
	}

	function startSmartPolling() {
		// Poll more frequently during game days, less frequently otherwise
		const pollInterval = showLiveScores ? 30000 : 300000; // 30s vs 5min
		
		pollingInterval = setInterval(async () => {
			if (showLiveScores) {
				// Refresh live scores
				await getLeagueMatchups(true); // Force refresh
			} else {
				// Refresh NFL state and weekly winner less frequently
				currentNflState = await getNflState();
				await calculateWeeklyWinner();
				determineDisplayMode();
			}
		}, pollInterval);
	}

	function stopPolling() {
		if (pollingInterval) {
			clearInterval(pollingInterval);
			pollingInterval = null;
		}
	}

	// Reactive updates when stores change
	$: if ($nflState) {
		currentNflState = $nflState;
		determineDisplayMode();
	}

	$: if ($matchupsStore) {
		calculateWeeklyWinner();
	}
</script>

<style>
	.dynamic-header {
		width: 100%;
		background: linear-gradient(135deg, #2d5aa0 0%, #1a472a 100%);
		border-radius: 12px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		overflow: hidden;
		margin-bottom: 1.5rem;
	}

	.header-content {
		padding: 1.5rem;
		color: white;
	}

	.loading {
		text-align: center;
		padding: 2rem;
		color: rgba(255, 255, 255, 0.8);
	}

	@media (max-width: 768px) {
		.header-content {
			padding: 0.75rem;
		}

		.dynamic-header {
			margin-bottom: 1rem;
		}

		.loading {
			padding: 1rem;
		}
	}
</style>

<div class="dynamic-header">
	<div class="header-content">
		{#if showLiveScores}
			<LiveScoreboard />
		{:else if countdownData}
			<GameWeekCountdown {countdownData} />
		{:else}
			<div class="loading">
				Loading league data...
			</div>
		{/if}
		
		{#if weeklyWinnerData}
			<WeeklyWinner {weeklyWinnerData} />
		{/if}
	</div>
</div>
