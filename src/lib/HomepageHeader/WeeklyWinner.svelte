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
			padding: 0.5rem;
			margin-top: 0.5rem;
		}

		.winner-header {
			justify-content: flex-start;
			gap: 0.5rem;
			margin-bottom: 0;
		}
		
		.winner-content {
			text-align: left;
			display: inline;
			margin-left: 0.5rem;
		}
		
		.team-name {
			font-size: 1rem;
			margin-bottom: 0;
			display: inline;
		}
		
		.points-display {
			font-size: 0.85rem;
			display: inline;
			margin-left: 0.5rem;
			opacity: 0.8;
		}

		.points-value {
			font-size: 0.9rem;
		}
		
		.winner-title {
			font-size: 0.9rem;
		}

		.week-badge {
			font-size: 0.75rem;
			padding: 0.15rem 0.5rem;
		}

		/* Make it all one compact line on mobile */
		.weekly-winner {
			display: flex;
			align-items: center;
			padding: 0.4rem 0.75rem;
		}

		.winner-header {
			margin-bottom: 0;
			flex-shrink: 0;
		}
	}

	@media (max-width: 480px) {
		.winner-title {
			font-size: 0.8rem;
		}

		.week-badge {
			font-size: 0.7rem;
			padding: 0.1rem 0.4rem;
		}

		.team-name {
			font-size: 0.9rem;
		}

		.points-display {
			font-size: 0.8rem;
		}

		.points-value {
			font-size: 0.85rem;
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
		<span class="team-name">{weeklyWinnerData.teamName}</span>
		<span class="points-display">
			<span class="points-value">{formatPoints(weeklyWinnerData.points)}</span> points
		</span>
	</div>
</div>
{/if}
