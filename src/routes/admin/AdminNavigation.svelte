<!-- Admin Navigation Component -->
<script>
	import { createEventDispatcher } from 'svelte';

	export let currentPage = '';
	export let availablePages = [];

	const dispatch = createEventDispatcher();

	function selectPage(page) {
		dispatch('pageChange', { page });
	}
</script>

<style>
	.navigation {
		padding: 1rem;
		border-bottom: 1px solid #ddd;
	}

	.nav-title {
		font-size: 1.1rem;
		font-weight: bold;
		margin: 0 0 1rem 0;
		color: #333;
	}

	.page-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.page-item {
		margin-bottom: 0.5rem;
	}

	.page-button {
		width: 100%;
		padding: 0.75rem 1rem;
		background: none;
		border: 1px solid #ddd;
		border-radius: 4px;
		cursor: pointer;
		text-align: left;
		font-size: 1rem;
		transition: all 0.2s;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.page-button:hover {
		background-color: #f8f9fa;
		border-color: #007cba;
	}

	.page-button.active {
		background-color: #007cba;
		color: white;
		border-color: #007cba;
	}

	.page-info {
		display: flex;
		flex-direction: column;
		flex: 1;
	}

	.page-name {
		font-weight: 500;
		text-transform: capitalize;
	}

	.page-description {
		font-size: 0.85rem;
		opacity: 0.7;
		margin-top: 0.25rem;
	}

	.page-status {
		font-size: 0.75rem;
		padding: 0.25rem 0.5rem;
		border-radius: 12px;
		background-color: rgba(255, 255, 255, 0.2);
		margin-left: 0.5rem;
	}

	.active .page-status {
		background-color: rgba(255, 255, 255, 0.3);
	}

	.help-text {
		margin-top: 1rem;
		padding: 1rem;
		background-color: #f8f9fa;
		border-radius: 4px;
		font-size: 0.9rem;
		color: #666;
		line-height: 1.4;
	}

	.help-title {
		font-weight: bold;
		margin-bottom: 0.5rem;
		color: #333;
	}
</style>

<div class="navigation">
	<h3 class="nav-title">Pages to Edit</h3>
	
	<ul class="page-list">
		{#each availablePages as page}
			<li class="page-item">
				<button 
					class="page-button"
					class:active={currentPage === page}
					on:click={() => selectPage(page)}
				>
					<div class="page-info">
						<div class="page-name">{page}</div>
						<div class="page-description">
							{#if page === 'homepage'}
								Main landing page with league intro
							{:else if page === 'managers'}
								Manager profiles and information
							{:else}
								{page} page
							{/if}
						</div>
					</div>
					<div class="page-status">
						{currentPage === page ? 'Editing' : 'Available'}
					</div>
				</button>
			</li>
		{/each}
	</ul>

	<div class="help-text">
		<div class="help-title">How it works:</div>
		• Select a page to edit its layout<br>
		• Drag components from the palette below<br>
		• Click components to edit their settings<br>
		• Changes are saved to your leagueInfo.js file
	</div>
</div>
