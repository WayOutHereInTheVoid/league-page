<!-- Page Builder - Main editing interface for page layouts -->
<script>
	import { createEventDispatcher, onMount } from 'svelte';
	import { pageLayoutManager } from '$lib/admin/pageLayoutManager.js';
	import { getComponentConfig } from '$lib/admin/componentRegistry.js';
	import ComponentEditor from './ComponentEditor.svelte';

	export let page = '';
	export let previewMode = false;
	export let selectedSection = null;

	const dispatch = createEventDispatcher();

	let pageLayout = null;
	let sections = [];
	let draggedSection = null;
	let dropTarget = null;

	onMount(() => {
		loadPageLayout();
	});

	$: if (page) {
		loadPageLayout();
	}

	function loadPageLayout() {
		if (!page) return;
		
		pageLayout = pageLayoutManager.getPageLayout(page);
		if (pageLayout) {
			sections = pageLayoutManager.getAllSections(page);
		} else {
			sections = [];
		}
	}

	function handleDragStart(event, section) {
		if (previewMode) return;
		
		draggedSection = section;
		event.dataTransfer.effectAllowed = 'move';
		event.dataTransfer.setData('text/plain', JSON.stringify({
			sectionId: section.id,
			source: 'section'
		}));
	}

	function handleDragOver(event) {
		event.preventDefault();
		event.dataTransfer.dropEffect = 'move';
	}

	function handleDrop(event, targetSection) {
		event.preventDefault();
		
		if (!draggedSection || previewMode) return;

		const draggedIndex = sections.findIndex(s => s.id === draggedSection.id);
		const targetIndex = sections.findIndex(s => s.id === targetSection.id);

		if (draggedIndex !== -1 && targetIndex !== -1 && draggedIndex !== targetIndex) {
			// Reorder sections
			const newSections = [...sections];
			const [removed] = newSections.splice(draggedIndex, 1);
			newSections.splice(targetIndex, 0, removed);

			// Update order values
			newSections.forEach((section, index) => {
				section.order = index + 1;
			});

			sections = newSections;
			
			// Update layout manager
			const sectionIds = newSections.map(s => s.id);
			pageLayoutManager.reorderSections(page, sectionIds);
			
			dispatch('layoutUpdate', { page, layout: pageLayout });
		}

		draggedSection = null;
		dropTarget = null;
	}

	function handlePaletteDrop(event) {
		event.preventDefault();
		
		if (previewMode) return;

		try {
			const data = JSON.parse(event.dataTransfer.getData('text/plain'));
			
			if (data.source === 'palette') {
				addSection(data.componentKey, data.componentConfig);
			}
		} catch (e) {
			console.error('Error handling drop:', e);
		}
	}

	function addSection(componentKey, componentConfig) {
		const newSection = {
			id: `section-${Date.now()}`,
			component: componentKey,
			props: { ...componentConfig.defaultProps },
			enabled: true,
			order: sections.length + 1
		};

		sections = [...sections, newSection];
		pageLayoutManager.addSection(page, newSection);
		
		dispatch('layoutUpdate', { page, layout: pageLayout });
	}

	function selectSection(section) {
		if (previewMode) return;
		
		selectedSection = section;
		dispatch('sectionSelect', { section });
	}

	function updateSection(sectionId, updates) {
		const sectionIndex = sections.findIndex(s => s.id === sectionId);
		if (sectionIndex !== -1) {
			sections[sectionIndex] = { ...sections[sectionIndex], ...updates };
			pageLayoutManager.updateSection(page, sectionId, updates);
			dispatch('layoutUpdate', { page, layout: pageLayout });
		}
	}

	function removeSection(sectionId) {
		sections = sections.filter(s => s.id !== sectionId);
		pageLayoutManager.removeSection(page, sectionId);
		
		if (selectedSection && selectedSection.id === sectionId) {
			selectedSection = null;
		}
		
		dispatch('layoutUpdate', { page, layout: pageLayout });
	}

	function toggleSection(sectionId) {
		const section = sections.find(s => s.id === sectionId);
		if (section) {
			updateSection(sectionId, { enabled: !section.enabled });
		}
	}

	function getSectionComponent(componentKey) {
		const config = getComponentConfig(componentKey);
		return config ? config.component : null;
	}
</script>

<style>
	.page-builder {
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.builder-header {
		padding: 1rem;
		background-color: #f8f9fa;
		border-bottom: 1px solid #ddd;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.page-title {
		font-size: 1.5rem;
		font-weight: bold;
		margin: 0;
		text-transform: capitalize;
	}

	.builder-actions {
		display: flex;
		gap: 0.5rem;
	}

	.btn {
		padding: 0.5rem 1rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		background: white;
		cursor: pointer;
		font-size: 0.9rem;
		transition: all 0.2s;
	}

	.btn:hover {
		background-color: #f8f9fa;
	}

	.btn-primary {
		background-color: #007cba;
		color: white;
		border-color: #007cba;
	}

	.btn-primary:hover {
		background-color: #005a8b;
	}

	.builder-content {
		flex: 1;
		display: flex;
		overflow: hidden;
	}

	.section-list {
		flex: 1;
		padding: 1rem;
		overflow-y: auto;
	}

	.drop-zone {
		min-height: 400px;
		border: 2px dashed #ddd;
		border-radius: 8px;
		padding: 2rem;
		text-align: center;
		color: #666;
		background-color: #fafafa;
		margin-bottom: 1rem;
		transition: all 0.2s;
	}

	.drop-zone.active {
		border-color: #007cba;
		background-color: #f0f8ff;
		color: #007cba;
	}

	.section-item {
		margin-bottom: 1rem;
		border: 1px solid #ddd;
		border-radius: 8px;
		background: white;
		transition: all 0.2s;
		cursor: pointer;
	}

	.section-item:hover {
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.section-item.selected {
		border-color: #007cba;
		box-shadow: 0 2px 8px rgba(0, 124, 186, 0.2);
	}

	.section-item.disabled {
		opacity: 0.6;
	}

	.section-item.dragging {
		opacity: 0.5;
		transform: rotate(2deg);
	}

	.section-header {
		padding: 1rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		border-bottom: 1px solid #eee;
		cursor: grab;
	}

	.section-header:active {
		cursor: grabbing;
	}

	.section-info {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.section-drag-handle {
		color: #999;
		font-size: 1.2rem;
	}

	.section-name {
		font-weight: 500;
		color: #333;
	}

	.section-type {
		font-size: 0.85rem;
		color: #666;
		background-color: #f8f9fa;
		padding: 0.25rem 0.5rem;
		border-radius: 12px;
	}

	.section-actions {
		display: flex;
		gap: 0.5rem;
	}

	.section-btn {
		padding: 0.25rem 0.5rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		background: white;
		cursor: pointer;
		font-size: 0.8rem;
		transition: all 0.2s;
	}

	.section-btn:hover {
		background-color: #f8f9fa;
	}

	.section-btn.danger {
		color: #dc3545;
		border-color: #dc3545;
	}

	.section-btn.danger:hover {
		background-color: #dc3545;
		color: white;
	}

	.section-preview {
		padding: 1rem;
		background-color: #f8f9fa;
		border-radius: 4px;
		margin: 0.5rem;
		font-size: 0.9rem;
		color: #666;
	}

	.properties-panel {
		width: 300px;
		border-left: 1px solid #ddd;
		background-color: white;
		overflow-y: auto;
	}

	.empty-state {
		text-align: center;
		color: #666;
		padding: 2rem;
	}

	.empty-state h3 {
		margin: 0 0 1rem 0;
		color: #333;
	}

	.preview-mode {
		background-color: #f0f8ff;
		border: 2px solid #007cba;
	}

	@media (max-width: 768px) {
		.builder-content {
			flex-direction: column;
		}

		.properties-panel {
			width: 100%;
			border-left: none;
			border-top: 1px solid #ddd;
			max-height: 300px;
		}
	}
</style>

<div class="page-builder">
	<!-- Header -->
	<div class="builder-header">
		<h2 class="page-title">{page} Layout</h2>
		<div class="builder-actions">
			{#if !previewMode}
				<button class="btn" on:click={() => addSection('homepage-text', { name: 'Text Section' })}>
					+ Add Section
				</button>
			{/if}
			<span class="btn" class:btn-primary={previewMode}>
				{previewMode ? '👁️ Preview Mode' : '✏️ Edit Mode'}
			</span>
		</div>
	</div>

	<!-- Content -->
	<div class="builder-content">
		<!-- Section List -->
		<div class="section-list">
			{#if sections.length === 0}
				<div 
					class="drop-zone"
					class:preview-mode={previewMode}
					on:dragover={handleDragOver}
					on:drop={handlePaletteDrop}
				>
					{#if previewMode}
						<h3>Preview Mode</h3>
						<p>This is how your {page} page will look with the current layout.</p>
					{:else}
						<h3>Start Building Your {page} Page</h3>
						<p>Drag components from the palette on the left to build your page layout.</p>
						<p>You can also click the "+ Add Section" button above.</p>
					{/if}
				</div>
			{:else}
				<!-- Existing Sections -->
				{#each sections as section (section.id)}
					<div 
						class="section-item"
						class:selected={selectedSection && selectedSection.id === section.id}
						class:disabled={!section.enabled}
						class:dragging={draggedSection && draggedSection.id === section.id}
						draggable={!previewMode}
						on:dragstart={(e) => handleDragStart(e, section)}
						on:dragover={handleDragOver}
						on:drop={(e) => handleDrop(e, section)}
						on:click={() => selectSection(section)}
					>
						<!-- Section Header -->
						<div class="section-header">
							<div class="section-info">
								{#if !previewMode}
									<span class="section-drag-handle">⋮⋮</span>
								{/if}
								<span class="section-name">
									{getComponentConfig(section.component)?.name || section.component}
								</span>
								<span class="section-type">{section.component}</span>
								{#if !section.enabled}
									<span class="section-type" style="background-color: #ffc107;">Hidden</span>
								{/if}
							</div>

							{#if !previewMode}
								<div class="section-actions">
									<button 
										class="section-btn"
										on:click|stopPropagation={() => toggleSection(section.id)}
									>
										{section.enabled ? 'Hide' : 'Show'}
									</button>
									<button 
										class="section-btn danger"
										on:click|stopPropagation={() => removeSection(section.id)}
									>
										Remove
									</button>
								</div>
							{/if}
						</div>

						<!-- Section Preview -->
						{#if section.enabled}
							<div class="section-preview">
								{#if section.component === 'homepage-text'}
									<strong>League Introduction Text</strong><br>
									Preview of your league welcome message...
								{:else if section.component === 'power-rankings'}
									<strong>Power Rankings</strong><br>
									Algorithmic rankings chart will appear here
								{:else if section.component === 'transactions'}
									<strong>Recent Transactions</strong><br>
									Latest {section.props?.limit || 10} trades and waiver moves
								{:else if section.component === 'all-managers'}
									<strong>All Managers</strong><br>
									Manager profiles in {section.props?.layout || 'grid'} layout
								{:else}
									<strong>{getComponentConfig(section.component)?.name}</strong><br>
									{getComponentConfig(section.component)?.description}
								{/if}
							</div>
						{/if}
					</div>
				{/each}

				<!-- Drop Zone for Adding More -->
				{#if !previewMode}
					<div 
						class="drop-zone"
						on:dragover={handleDragOver}
						on:drop={handlePaletteDrop}
					>
						Drop components here to add them to your page
					</div>
				{/if}
			{/if}
		</div>

		<!-- Properties Panel -->
		{#if selectedSection && !previewMode}
			<div class="properties-panel">
				<ComponentEditor 
					section={selectedSection}
					componentConfig={getComponentConfig(selectedSection.component)}
					on:updateSection={(e) => updateSection(e.detail.sectionId, e.detail.updates)}
				/>
			</div>
		{:else if !previewMode}
			<div class="properties-panel">
				<div class="empty-state">
					<h3>Component Settings</h3>
					<p>Select a component from the page layout to edit its properties and settings.</p>
				</div>
			</div>
		{/if}
	</div>
</div>
