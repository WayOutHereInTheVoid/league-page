<script>
	export let weeklyWinnerData;

	function formatPoints(points) {
		return points.toFixed(1);
	}
</script>

<style>
	.weekly-winner {
		background: rgba(255, 255, 255, 0.1);
		border-radius: 8px;
		padding: 1rem;
		margin-top: 1rem;
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	.winner-header {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		margin-bottom: 0.75rem;
	}

	.winner-title {
		font-size: 1.1rem;
		font-weight: 600;
		margin: 0;
	}

	.week-badge {
		background: rgba(255, 255, 255, 0.2);
		padding: 0.25rem 0.75rem;
		border-radius: 20px;
		font-size: 0.85rem;
		font-weight: 500;
	}

	.winner-content {
		text-align: center;
	}

	.team-name {
		font-size: 1.4rem;
		font-weight: 700;
		margin-bottom: 0.25rem;
		color: #FFD700; /* Gold color for emphasis */
	}

	.points-display {
		font-size: 1.1rem;
		opacity: 0.9;
	}

	.points-value {
		font-weight: 600;
		font-size: 1.2rem;
	}

	@media (max-width: 768px) {
		.weekly-winner {
			padding: 0.75rem;
			margin-top: 0.75rem;
		}
		
		.winner-header {
			flex-direction: column;
			gap: 0.25rem;
		}
		
		.team-name {
			font-size: 1.2rem;
		}
		
		.winner-title {
			font-size: 1rem;
		}
	}
</style>

{#if weeklyWinnerData}
<div class="weekly-winner">
	<div class="winner-header">
		<h3 class="winner-title">🏆 Weekly Winner</h3>
		<span class="week-badge">Week {weeklyWinnerData.week}</span>
	</div>
	
	<div class="winner-content">
		<div class="team-name">{weeklyWinnerData.teamName}</div>
		<div class="points-display">
			<span class="points-value">{formatPoints(weeklyWinnerData.points)}</span> points
		</div>
	</div>
</div>
{/if}
