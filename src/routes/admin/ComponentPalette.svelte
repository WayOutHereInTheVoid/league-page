<!-- Enhanced Component Palette with @dnd-kit support -->
<script>
	import { createEventDispatcher } from 'svelte';
	import { useDraggable } from '@dnd-kit/core';
	import { CSS } from '@dnd-kit/utilities';
	import { searchComponents, getComponentsByCategory } from '$lib/admin/componentRegistry.js';

	export let componentCategories = {};
	export let currentPage = '';

	const dispatch = createEventDispatcher();

	let expandedCategories = new Set(['Content', 'League Data']);
	let searchQuery = '';
	let searchResults = [];
	let isSearching = false;

	$: {
		if (searchQuery.trim()) {
			isSearching = true;
			searchResults = searchComponents(searchQuery);
		} else {
			isSearching = false;
			searchResults = [];
		}
	}

	function toggleCategory(category) {
		if (expandedCategories.has(category)) {
			expandedCategories.delete(category);
		} else {
			expandedCategories.add(category);
		}
		expandedCategories = expandedCategories;
	}

	function addComponent(componentKey, componentConfig) {
		dispatch('addComponent', {
			componentKey,
			componentConfig,
			page: currentPage
		});
	}

	// Filter components based on page context
	function isComponentRelevantForPage(componentKey, page) {
		if (page === 'homepage') {
			return ['homepage-text', 'power-rankings', 'standings', 'transactions', 'awards', 'blog-post', 'news', 'bar-chart', 'trend-chart'].includes(componentKey);
		} else if (page === 'managers') {
			return ['all-managers', 'rivalry', 'records', 'radar-chart', 'single-manager'].includes(componentKey);
		}
		return true;
	}

	function getComponentIcon(category) {
		const icons = {
			'Content': '📝',
			'League Data': '📊',
			'Managers': '👥',
			'Historical': '🏆',
			'Charts': '📈',
			'Layout': '🎨',
			'System': '⚙️'
		};
		return icons[category] || '📦';
	}

	function clearSearch() {
		searchQuery = '';
	}
</script>

<style>
	.component-palette {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		border-top: 1px solid #e2e8f0;
		background-color: #fafbfc;
	}

	.palette-header {
		padding: 1rem;
		border-bottom: 1px solid #e2e8f0;
		background-color: white;
		flex-shrink: 0;
	}

	.palette-title {
		font-size: 1.1rem;
		font-weight: 600;
		margin: 0 0 1rem 0;
		color: #1f2937;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.search-container {
		position: relative;
		margin-bottom: 1rem;
	}

	.search-input {
		width: 100%;
		padding: 0.75rem 2.5rem 0.75rem 2.5rem;
		border: 1px solid #d1d5db;
		border-radius: 8px;
		font-size: 0.9rem;
		background-color: #f9fafb;
		transition: all 0.2s;
	}

	.search-input:focus {
		outline: none;
		border-color: #3b82f6;
		background-color: white;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	.search-icon {
		position: absolute;
		left: 0.75rem;
		top: 50%;
		transform: translateY(-50%);
		color: #9ca3af;
		font-size: 1rem;
	}

	.search-clear {
		position: absolute;
		right: 0.75rem;
		top: 50%;
		transform: translateY(-50%);
		background: none;
		border: none;
		color: #9ca3af;
		cursor: pointer;
		padding: 0.25rem;
		border-radius: 4px;
		transition: all 0.2s;
	}

	.search-clear:hover {
		color: #6b7280;
		background-color: #f3f4f6;
	}

	.page-context {
		background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
		border: 1px solid #bfdbfe;
		padding: 0.75rem;
		border-radius: 8px;
		font-size: 0.85rem;
		margin-bottom: 1rem;
	}

	.page-context-title {
		font-weight: 600;
		color: #1d4ed8;
		margin-bottom: 0.25rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.page-context-description {
		color: #3730a3;
		margin: 0;
	}

	.palette-content {
		flex: 1;
		padding: 0 1rem 1rem 1rem;
		overflow-y: auto;
	}

	.search-results {
		margin-bottom: 2rem;
	}

	.search-results-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid #e5e7eb;
	}

	.search-results-title {
		font-size: 1rem;
		font-weight: 600;
		color: #374151;
		margin: 0;
	}

	.search-results-count {
		font-size: 0.8rem;
		color: #6b7280;
		background-color: #f3f4f6;
		padding: 0.25rem 0.5rem;
		border-radius: 12px;
	}

	.category {
		margin-bottom: 1.5rem;
	}

	.category-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem;
		background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
		border: 1px solid #e2e8f0;
		border-radius: 8px 8px 0 0;
		cursor: pointer;
		font-weight: 500;
		transition: all 0.2s;
		color: #374151;
	}

	.category-header:hover {
		background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
	}

	.category-header.expanded {
		background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
		color: white;
	}

	.category-info {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.category-icon {
		font-size: 1.1rem;
		transition: transform 0.2s;
	}

	.category-name {
		font-weight: 600;
	}

	.category-count {
		background-color: rgba(255, 255, 255, 0.2);
		color: inherit;
		padding: 0.2rem 0.5rem;
		border-radius: 10px;
		font-size: 0.75rem;
		font-weight: 500;
	}

	.expand-icon {
		transition: transform 0.2s;
		font-size: 0.8rem;
	}

	.expand-icon.expanded {
		transform: rotate(90deg);
	}

	.component-list {
		border: 1px solid #e2e8f0;
		border-top: none;
		border-radius: 0 0 8px 8px;
		background-color: white;
		max-height: 400px;
		overflow-y: auto;
	}

	.component-item {
		padding: 1rem;
		border-bottom: 1px solid #f3f4f6;
		cursor: grab;
		transition: all 0.2s;
		user-select: none;
		position: relative;
	}

	.component-item:hover {
		background-color: #f8fafc;
		transform: translateX(2px);
	}

	.component-item:active {
		cursor: grabbing;
		transform: scale(1.02);
	}

	.component-item:last-child {
		border-bottom: none;
	}

	.component-item.disabled {
		opacity: 0.5;
		cursor: not-allowed;
		background-color: #f9fafb;
	}

	.component-item.disabled:hover {
		transform: none;
	}

	.component-item.dragging {
		opacity: 0.5;
		transform: rotate(2deg) scale(0.95);
		z-index: 1000;
	}

	.component-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 0.5rem;
	}

	.component-info {
		flex: 1;
	}

	.component-name {
		font-weight: 600;
		color: #1f2937;
		margin-bottom: 0.25rem;
		font-size: 0.95rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.component-description {
		font-size: 0.8rem;
		color: #6b7280;
		line-height: 1.4;
		margin-bottom: 0.75rem;
	}

	.component-badges {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
		margin-bottom: 0.75rem;
	}

	.component-badge {
		display: inline-block;
		font-size: 0.7rem;
		padding: 0.25rem 0.6rem;
		border-radius: 12px;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.025em;
	}

	.component-badge.core {
		background-color: #dbeafe;
		color: #1d4ed8;
	}

	.component-badge.available {
		background-color: #d1fae5;
		color: #047857;
	}

	.component-badge.optional {
		background-color: #f3f4f6;
		color: #6b7280;
	}

	.component-badge.blog {
		background-color: #fef3c7;
		color: #92400e;
	}

	.component-badge.chart {
		background-color: #ede9fe;
		color: #7c3aed;
	}

	.component-actions {
		display: flex;
		gap: 0.5rem;
		margin-top: 0.5rem;
	}

	.add-button {
		background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 6px;
		font-size: 0.8rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex: 1;
		justify-content: center;
	}

	.add-button:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
	}

	.add-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		transform: none;
		box-shadow: none;
	}

	.drag-handle {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		color: #d1d5db;
		font-size: 1rem;
		cursor: grab;
	}

	.drag-handle:hover {
		color: #9ca3af;
	}

	.empty-message {
		text-align: center;
		color: #9ca3af;
		padding: 3rem 1rem;
		font-style: italic;
	}

	.empty-search {
		text-align: center;
		padding: 2rem;
		color: #6b7280;
	}

	.relevance-score {
		position: absolute;
		top: 0.5rem;
		left: 0.5rem;
		background-color: #f59e0b;
		color: white;
		font-size: 0.7rem;
		padding: 0.2rem 0.4rem;
		border-radius: 6px;
		font-weight: 600;
	}

	@media (max-width: 768px) {
		.palette-header {
			padding: 0.75rem;
		}

		.component-item {
			padding: 0.75rem;
		}

		.component-actions {
			flex-direction: column;
		}

		.search-input {
			font-size: 16px; /* Prevent zoom on iOS */
		}
	}
</style>

<div class="component-palette">
	<div class="palette-header">
		<h3 class="palette-title">
			🧩 Component Palette
		</h3>
		
		<!-- Search -->
		<div class="search-container">
			<span class="search-icon">🔍</span>
			<input 
				type="text" 
				class="search-input"
				placeholder="Search components..."
				bind:value={searchQuery}
			/>
			{#if searchQuery}
				<button class="search-clear" on:click={clearSearch}>✕</button>
			{/if}
		</div>

		{#if currentPage}
			<div class="page-context">
				<div class="page-context-title">
					📄 Editing: {currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}
				</div>
				<p class="page-context-description">
					Drag components below to add them to your page
				</p>
			</div>
		{/if}
	</div>

	<div class="palette-content">
		{#if isSearching}
			<!-- Search Results -->
			<div class="search-results">
				<div class="search-results-header">
					<h4 class="search-results-title">Search Results</h4>
					<span class="search-results-count">{searchResults.length} found</span>
				</div>

				{#if searchResults.length === 0}
					<div class="empty-search">
						<p>No components found for "<strong>{searchQuery}</strong>"</p>
						<p style="font-size: 0.8rem; margin-top: 0.5rem;">Try searching for: standings, managers, charts, transactions</p>
					</div>
				{:else}
					<div class="component-list" style="border-radius: 8px;">
						{#each searchResults as component}
							{@const isRelevant = isComponentRelevantForPage(component.key, currentPage)}
							{@const isBlogComponent = component.key === 'blog-post'}
							{@const isChartComponent = component.category === 'Charts'}
							
							<div 
								class="component-item"
								class:disabled={!isRelevant}
								draggable={isRelevant}
								on:dragstart={(e) => isRelevant && e.dataTransfer.setData('text/plain', JSON.stringify({
									componentKey: component.key,
									componentConfig: component,
									source: 'palette'
								}))}
								role="button"
								tabindex="0"
							>
								{#if component.relevance}
									<div class="relevance-score">{component.relevance}</div>
								{/if}
								
								<span class="drag-handle">⋮⋮</span>
								
								<div class="component-header">
									<div class="component-info">
										<div class="component-name">
											{getComponentIcon(component.category)}
											{component.name}
										</div>
										<div class="component-description">{component.description}</div>
									</div>
								</div>
								
								<div class="component-badges">
									{#if component.key === 'homepage-text'}
										<span class="component-badge core">Core</span>
									{:else if isBlogComponent}
										<span class="component-badge blog">Requires Blog</span>
									{:else if isChartComponent}
										<span class="component-badge chart">Chart</span>
									{:else if !isRelevant}
										<span class="component-badge optional">Different Page</span>
									{:else}
										<span class="component-badge available">Available</span>
									{/if}
								</div>

								<div class="component-actions">
									<button 
										class="add-button"
										disabled={!isRelevant}
										on:click={() => isRelevant && addComponent(component.key, component)}
									>
										➕ Add to Page
									</button>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		{:else if Object.keys(componentCategories).length === 0}
			<!-- Empty State -->
			<div class="empty-message">
				No components available
			</div>
		{:else}
			<!-- Category View -->
			{#each Object.entries(componentCategories) as [categoryName, categoryData]}
				<div class="category">
					<div 
						class="category-header"
						class:expanded={expandedCategories.has(categoryName)}
						on:click={() => toggleCategory(categoryName)}
						role="button"
						tabindex="0"
						on:keydown={(e) => e.key === 'Enter' && toggleCategory(categoryName)}
					>
						<div class="category-info">
							<span class="category-icon">{getComponentIcon(categoryName)}</span>
							<span class="category-name">{categoryName}</span>
							<span class="category-count">{categoryData.count || categoryData.components?.length || 0}</span>
						</div>
						<span class="expand-icon" class:expanded={expandedCategories.has(categoryName)}>
							▶
						</span>
					</div>

					{#if expandedCategories.has(categoryName)}
						<div class="component-list">
							{#each (categoryData.components || categoryData) as component}
								{@const isRelevant = isComponentRelevantForPage(component.key, currentPage)}
								{@const isBlogComponent = component.key === 'blog-post'}
								{@const isChartComponent = component.category === 'Charts'}
								
								<div 
									class="component-item"
									class:disabled={!isRelevant}
									draggable={isRelevant}
									on:dragstart={(e) => isRelevant && e.dataTransfer.setData('text/plain', JSON.stringify({
										componentKey: component.key,
										componentConfig: component,
										source: 'palette'
									}))}
									role="button"
									tabindex="0"
								>
									<span class="drag-handle">⋮⋮</span>
									
									<div class="component-header">
										<div class="component-info">
											<div class="component-name">
												{component.name}
											</div>
											<div class="component-description">{component.description}</div>
										</div>
									</div>
									
									<div class="component-badges">
										{#if component.key === 'homepage-text'}
											<span class="component-badge core">Core</span>
										{:else if isBlogComponent}
											<span class="component-badge blog">Requires Blog</span>
										{:else if isChartComponent}
											<span class="component-badge chart">Chart</span>
										{:else if !isRelevant}
											<span class="component-badge optional">Different Page</span>
										{:else}
											<span class="component-badge available">Available</span>
										{/if}
									</div>

									<div class="component-actions">
										<button 
											class="add-button"
											disabled={!isRelevant}
											on:click={() => isRelevant && addComponent(component.key, component)}
										>
											➕ Add to Page
										</button>
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			{/each}
		{/if}
	</div>
</div>