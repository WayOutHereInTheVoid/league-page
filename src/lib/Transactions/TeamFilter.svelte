<script>
	import Select, { Option } from '@smui/select';
	import { createEventDispatcher } from 'svelte';

	export let selectedTeam = null;
	export let teamOptions = [];
	export let disabled = false;

	const dispatch = createEventDispatcher();

	const handleTeamChange = (event) => {
		const newValue = event.detail.value;
		selectedTeam = newValue;
		dispatch('teamchange', { selectedTeam: newValue });
	};

	// Ensure we have a fallback option if no options provided
	$: safeTeamOptions = teamOptions && teamOptions.length > 0 ? teamOptions : [
		{ value: null, label: "All Teams", avatar: null, managers: "", isHistorical: false }
	];
</script>

<div class="team-filter-wrapper">
	<Select 
		bind:value={selectedTeam}
		on:SMUISelect:change={handleTeamChange}
		label="Filter by Team"
		variant="outlined"
		class="team-filter-select"
		{disabled}
		menuProps={{
			class: 'team-filter-menu'
		}}
	>
		{#each safeTeamOptions as option (option.value)}
			<Option value={option.value} selected={selectedTeam === option.value}>
				<div class="team-option" class:all-teams-option={option.value === null}>
					{#if option.value === null}
						<div class="all-teams-icon">🏈</div>
					{:else if option.avatar}
						<img 
							src="https://sleepercdn.com/avatars/thumbs/{option.avatar}" 
							alt="{option.label} avatar" 
							class="team-avatar"
							loading="lazy"
						/>
					{:else}
						<div class="team-avatar-placeholder"></div>
					{/if}
					<span class="team-name">{option.label}</span>
					{#if option.managers && !option.isHistorical && option.value !== null}
						<span class="team-managers">({option.managers})</span>
					{/if}
				</div>
			</Option>
		{/each}
	</Select>
</div>

<style>
	.team-filter-wrapper {
		min-width: 250px;
		max-width: 300px;
	}

	:global(.team-filter-select) {
		width: 100%;
	}

	:global(.team-filter-menu) {
		max-height: 300px;
		z-index: 1000;
	}

	.team-option {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 4px 0;
		min-height: 32px;
	}

	.all-teams-option {
		font-weight: 500;
	}

	.all-teams-icon {
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 16px;
		flex-shrink: 0;
	}

	.team-avatar {
		width: 24px;
		height: 24px;
		border-radius: 50%;
		object-fit: cover;
		flex-shrink: 0;
		background-color: var(--f8f8f8);
	}

	.team-avatar-placeholder {
		width: 24px;
		height: 24px;
		border-radius: 50%;
		background-color: var(--eee);
		flex-shrink: 0;
	}

	.team-name {
		font-weight: 500;
		flex-grow: 1;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.team-managers {
		font-size: 0.85em;
		color: var(--g999);
		font-style: italic;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 120px;
	}

	/* Mobile optimization */
	@media (max-width: 768px) {
		.team-filter-wrapper {
			min-width: 100%;
			max-width: 100%;
		}
		
		.team-option {
			padding: 6px 0;
			min-height: 36px;
		}
		
		.team-avatar,
		.all-teams-icon,
		.team-avatar-placeholder {
			width: 20px;
			height: 20px;
		}
		
		.all-teams-icon {
			font-size: 14px;
		}
		
		.team-managers {
			display: none; /* Hide on mobile for space */
		}

		.team-name {
			font-size: 0.9rem;
		}
	}

	@media (max-width: 480px) {
		:global(.team-filter-select .mdc-select__selected-text) {
			font-size: 14px;
		}

		.team-option {
			min-height: 40px; /* Larger touch targets */
		}

		.team-name {
			font-size: 0.85rem;
		}
	}

	/* Theme support */
	.team-managers {
		color: var(--g999);
	}

	.team-avatar-placeholder {
		background-color: var(--eee);
	}

	.team-avatar {
		background-color: var(--f8f8f8);
	}

	/* Loading and error states */
	.team-avatar {
		transition: opacity 0.2s ease;
	}

	.team-avatar:not([src]) {
		opacity: 0.5;
	}
</style>
