<script>
    import { gotoManager } from '$lib/utils/helper';
	import { getAvatarFromTeamManagers, getNestedTeamNamesFromTeamManagers } from '$lib/utils/helperFunctions/universalFunctions';
	export let podium, leagueTeamManagers;

	// Make destructuring reactive - this will update when podium prop changes
	$: ({ year, champion, second, third, divisions, toilet } = podium);
</script>

<style>
	/* TRL Premium Color Variables */
	:root {
		--trl-electric-lime: #8FE419;
		--trl-lime-bright: #A8FF2E;
		--trl-lime-deep: #6BC200;
		--chrome-silver: #E8E8E8;
		--platinum: #F5F5F5;
		--gunmetal: #8C9199;
		--elite-black: #0A0A0B;
		--carbon: #1A1D1F;
		--charcoal: #2D3135;
		--smoke: #404449;
		--victory-gold: #FFD700;
	}

	/* Main Awards Container */
	.awards {
		display: block;
		position: relative;
		width: 100%;
		max-width: 1200px;
		margin: 0 auto;
		z-index: 1;
		background: var(--elite-black);
		border-radius: 12px;
		overflow: hidden;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
	}

	/* Awards Header */
	.awards-header {
		text-align: center;
		padding: 2rem 1rem 1rem;
		background: linear-gradient(135deg, var(--carbon) 0%, var(--charcoal) 100%);
		border-bottom: 2px solid var(--smoke);
	}

	.awards-title {
		font-size: 2.5rem;
		font-weight: 900;
		color: var(--chrome-silver);
		text-shadow: 0 0 10px var(--trl-electric-lime);
		margin: 0;
		letter-spacing: 1px;
	}

	.champions-cup-banner {
		max-width: 400px;
		width: 80%;
		height: auto;
		margin: 1rem auto 0;
		filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
	}

	/* Championship Showcase Grid */
	.championship-showcase {
		display: grid;
		grid-template-columns: 2fr 1fr 1fr;
		gap: 1.5rem;
		padding: 2rem;
		background: var(--carbon);
	}

	/* Champion Card (Larger focal point) */
	.champion-card {
		background: linear-gradient(135deg, var(--victory-gold) 0%, #FFE55C 100%);
		border-radius: 16px;
		padding: 2rem;
		text-align: center;
		position: relative;
		overflow: hidden;
		box-shadow: 0 8px 24px rgba(255, 215, 0, 0.3);
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.champion-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 12px 32px rgba(255, 215, 0, 0.4);
	}

	.champion-card::before {
		content: '';
		position: absolute;
		top: -50%;
		left: -50%;
		width: 200%;
		height: 200%;
		background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
		animation: championGlow 4s infinite ease-in-out;
	}

	@keyframes championGlow {
		0%, 100% { transform: rotate(0deg) scale(1); opacity: 0.3; }
		50% { transform: rotate(180deg) scale(1.1); opacity: 0.6; }
	}

	.champion-avatar {
		width: 120px;
		height: 120px;
		border-radius: 50%;
		border: 4px solid var(--elite-black);
		margin: 0 auto 1rem;
		display: block;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
		position: relative;
		z-index: 2;
	}

	.champion-title {
		font-size: 1.8rem;
		font-weight: 900;
		color: var(--elite-black);
		margin: 0 0 0.5rem;
		position: relative;
		z-index: 2;
		text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.8);
	}

	.champion-name {
		font-size: 1.2rem;
		font-weight: bold;
		color: var(--elite-black);
		position: relative;
		z-index: 2;
	}

	/* Runner-up Cards */
	.runnerup-card {
		background: linear-gradient(135deg, var(--chrome-silver) 0%, var(--platinum) 100%);
		border-radius: 12px;
		padding: 1.5rem;
		text-align: center;
		position: relative;
		cursor: pointer;
		transition: all 0.3s ease;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
	}

	.runnerup-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
	}

	.runnerup-card.second {
		border: 3px solid #C0C0C0;
	}

	.runnerup-card.third {
		border: 3px solid #CD7F32;
	}

	.runnerup-avatar {
		width: 80px;
		height: 80px;
		border-radius: 50%;
		border: 3px solid var(--elite-black);
		margin: 0 auto 1rem;
		display: block;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
	}

	.runnerup-place {
		font-size: 1.4rem;
		font-weight: 900;
		color: var(--elite-black);
		margin: 0 0 0.5rem;
	}

	.runnerup-name {
		font-size: 1rem;
		font-weight: bold;
		color: var(--elite-black);
	}

	/* Division Leaders Section */
	.divisions-section {
		padding: 2rem;
		background: var(--charcoal);
	}

	.section-title {
		font-size: 1.8rem;
		font-weight: 900;
		color: var(--chrome-silver);
		text-align: center;
		margin: 0 0 1.5rem;
		text-shadow: 0 0 5px var(--trl-electric-lime);
	}

	.divisions-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 1rem;
	}

	.division-card {
		background: linear-gradient(135deg, var(--carbon) 0%, var(--smoke) 100%);
		border: 2px solid var(--trl-electric-lime);
		border-radius: 12px;
		padding: 1.5rem;
		text-align: center;
		cursor: pointer;
		transition: all 0.3s ease;
		box-shadow: 0 4px 16px rgba(143, 228, 25, 0.1);
	}

	.division-card:hover {
		transform: translateY(-2px);
		border-color: var(--trl-lime-bright);
		box-shadow: 0 8px 24px rgba(143, 228, 25, 0.2);
	}

	.division-name {
		font-size: 1.2rem;
		font-weight: bold;
		color: var(--trl-lime-bright);
		margin: 0 0 1rem;
	}

	.division-avatar {
		width: 70px;
		height: 70px;
		border-radius: 50%;
		border: 2px solid var(--trl-electric-lime);
		margin: 0 auto 1rem;
		display: block;
		box-shadow: 0 2px 8px rgba(143, 228, 25, 0.3);
	}

	.division-winner {
		font-size: 1rem;
		font-weight: bold;
		color: var(--platinum);
	}

	/* Toilet Bowl Section */
	.toilet-section {
		padding: 2rem;
		background: var(--elite-black);
		border-top: 2px solid var(--smoke);
	}

	.toilet-card {
		max-width: 400px;
		margin: 0 auto;
		background: linear-gradient(135deg, var(--carbon) 0%, var(--charcoal) 100%);
		border: 2px solid #8B4513;
		border-radius: 12px;
		padding: 2rem;
		text-align: center;
		cursor: pointer;
		transition: all 0.3s ease;
		box-shadow: 0 4px 16px rgba(139, 69, 19, 0.2);
	}

	.toilet-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 24px rgba(139, 69, 19, 0.3);
	}

	.toilet-banner {
		max-width: 300px;
		width: 80%;
		height: auto;
		margin: 0 auto 1rem;
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
	}

	.toilet-avatar {
		width: 80px;
		height: 80px;
		border-radius: 50%;
		border: 3px solid #8B4513;
		margin: 1rem auto;
		display: block;
		box-shadow: 0 2px 8px rgba(139, 69, 19, 0.3);
	}

	.toilet-winner-name {
		font-size: 1.1rem;
		font-weight: bold;
		color: var(--gunmetal);
	}

	/* Global Styles for Team Names */
	:global(.curOwner) {
		font-size: 0.85em;
		color: var(--gunmetal);
		font-style: italic;
		opacity: 0.8;
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		.championship-showcase {
			grid-template-columns: 1fr;
			gap: 1rem;
			padding: 1rem;
		}

		.champion-card {
			padding: 1.5rem;
		}

		.champion-avatar {
			width: 100px;
			height: 100px;
		}

		.champion-title {
			font-size: 1.5rem;
		}

		.awards-title {
			font-size: 2rem;
		}

		.divisions-grid {
			grid-template-columns: 1fr;
		}

		.divisions-section,
		.toilet-section {
			padding: 1rem;
		}
	}

	@media (max-width: 480px) {
		.awards-header {
			padding: 1rem 0.5rem 0.5rem;
		}

		.awards-title {
			font-size: 1.6rem;
		}

		.champion-title {
			font-size: 1.3rem;
		}

		.champion-avatar {
			width: 80px;
			height: 80px;
		}

		.runnerup-avatar {
			width: 60px;
			height: 60px;
		}
	}
</style>

<div class="awards">
	<!-- Awards Header -->
	<div class="awards-header">
		<h1 class="awards-title">{year} Awards</h1>
		<img src="/banner.png" class="champions-cup-banner" alt="The Champion's Cup" />
	</div>

	<!-- Championship Showcase Grid -->
	<div class="championship-showcase">
		<!-- Champion Card (Featured) -->
		<div class="champion-card" onclick={() => gotoManager({year, leagueTeamManagers, rosterID: champion})}>
			<img 
				src="{getAvatarFromTeamManagers(leagueTeamManagers, champion, year)}" 
				class="champion-avatar" 
				alt="Champion" 
			/>
			<h2 class="champion-title">🏆 CHAMPION</h2>
			<div class="champion-name">
				{@html getNestedTeamNamesFromTeamManagers(leagueTeamManagers, year, champion)}
			</div>
		</div>

		<!-- Second Place -->
		<div class="runnerup-card second" onclick={() => gotoManager({year, leagueTeamManagers, rosterID: second})}>
			<img 
				src="{getAvatarFromTeamManagers(leagueTeamManagers, second, year)}" 
				class="runnerup-avatar" 
				alt="Runner-up" 
			/>
			<h3 class="runnerup-place">🥈 2nd Place</h3>
			<div class="runnerup-name">
				{@html getNestedTeamNamesFromTeamManagers(leagueTeamManagers, year, second)}
			</div>
		</div>

		<!-- Third Place -->
		<div class="runnerup-card third" onclick={() => gotoManager({year, leagueTeamManagers, rosterID: third})}>
			<img 
				src="{getAvatarFromTeamManagers(leagueTeamManagers, third, year)}" 
				class="runnerup-avatar" 
				alt="Third place" 
			/>
			<h3 class="runnerup-place">🥉 3rd Place</h3>
			<div class="runnerup-name">
				{@html getNestedTeamNamesFromTeamManagers(leagueTeamManagers, year, third)}
			</div>
		</div>
	</div>

	<!-- Division Leaders Section -->
	{#if divisions && divisions.length > 0}
		<div class="divisions-section">
			<h2 class="section-title">⚡ Division Champions</h2>
			<div class="divisions-grid">
				{#each divisions as division}
					{#if division.rosterID}
						<div class="division-card" onclick={() => gotoManager({year, leagueTeamManagers, rosterID: division.rosterID})}>
							<h3 class="division-name">
								{division.name ? `${division.name} Division` : 'Regular Season Champion'}
							</h3>
							<img 
								src="{getAvatarFromTeamManagers(leagueTeamManagers, division.rosterID, year)}" 
								class="division-avatar" 
								alt="{division.name} champion" 
							/>
							<div class="division-winner">
								{@html getNestedTeamNamesFromTeamManagers(leagueTeamManagers, year, division.rosterID)}
							</div>
						</div>
					{/if}
				{/each}
			</div>
		</div>
	{/if}

	<!-- Toilet Bowl Section -->
	{#if toilet}
		<div class="toilet-section">
			<h2 class="section-title">🚽 Consolation Champion</h2>
			<div class="toilet-card" onclick={() => gotoManager({year, leagueTeamManagers, rosterID: toilet})}>
				<img src="/toilet-banner.png" class="toilet-banner" alt="The Toilet Bowl" />
				<img 
					src="{getAvatarFromTeamManagers(leagueTeamManagers, toilet, year)}" 
					class="toilet-avatar" 
					alt="Toilet bowl winner" 
				/>
				<div class="toilet-winner-name">
					{@html getNestedTeamNamesFromTeamManagers(leagueTeamManagers, year, toilet)}
				</div>
			</div>
		</div>
	{/if}
</div>
