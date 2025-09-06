<script>
	export let matchup;

	let team1Percentage = 50;
	let team2Percentage = 50;

	$: {
		const totalPoints = matchup.team1.points + matchup.team2.points;
		if (totalPoints > 0) {
			team1Percentage = (matchup.team1.points / totalPoints) * 100;
			team2Percentage = (matchup.team2.points / totalPoints) * 100;
		} else {
			team1Percentage = 50;
			team2Percentage = 50;
		}
	}
</script>

<style>
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

	.progress-bar {
		display: flex;
		height: 8px;
		border-radius: 4px;
		overflow: hidden;
		margin-top: 1rem;
		background-color: #404449;
	}

	.progress-bar-team1 {
		background: linear-gradient(90deg, #8FE419, #A8FF2E);
		transition: width 0.3s ease;
	}

	.progress-bar-team2 {
		background: linear-gradient(90deg, #FF6B35, #FF8C69);
		transition: width 0.3s ease;
	}

	@media (max-width: 768px) {
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

		.vs-divider {
			width: 32px;
			height: 32px;
			font-size: 0.7rem;
		}
	}

	@media (max-width: 480px) {
		.matchup-teams {
			flex-direction: column;
			gap: 0.5rem;
		}

		.vs-divider {
			display: none;
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

	@media (max-width: 400px) {
		.matchup {
			padding: 0.5rem;
		}

		.matchup-teams {
			gap: 0.75rem;
		}
	}
</style>

<div class="matchup">
	<div class="matchup-teams">
		<div class="team">
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

		<div class="team">
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
	<div class="progress-bar">
		<div class="progress-bar-team1" style="width: {team1Percentage}%"></div>
		<div class="progress-bar-team2" style="width: {team2Percentage}%"></div>
	</div>
</div>
