<!-- Simplified Page Builder without @dnd-kit dependency -->
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
	let draggedFromPalette = null;
	let isDraggingOver = false;

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

	// Drag and drop handlers for sections
	function handleSectionDragStart(event, section) {
		if (previewMode) return;
		draggedSection = section;
		event.dataTransfer.effectAllowed = 'move';
		event.dataTransfer.setData('text/plain', '');
	}

	function handleSectionDragOver(event) {
		if (previewMode || !draggedSection) return;
		event.preventDefault();
		event.dataTransfer.dropEffect = 'move';
	}

	function handleSectionDrop(event, targetSection) {
		if (previewMode || !draggedSection) return;
		event.preventDefault();

		if (draggedSection.id === targetSection.id) return;

		// Reorder sections
		const draggedIndex = sections.findIndex(s => s.id === draggedSection.id);
		const targetIndex = sections.findIndex(s => s.id === targetSection.id);

		if (draggedIndex !== -1 && targetIndex !== -1) {
			const newSections = [...sections];
			const [movedSection] = newSections.splice(draggedIndex, 1);
			newSections.splice(targetIndex, 0, movedSection);

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
	}

	function handleSectionDragEnd() {
		draggedSection = null;
		isDraggingOver = false;
	}

	// Palette drag and drop handlers
	function handlePaletteDragOver(event) {
		if (previewMode) return;
		event.preventDefault();
		isDraggingOver = true;
		event.dataTransfer.dropEffect = 'copy';
	}

	function handlePaletteDrop(event) {
		if (previewMode) return;
		event.preventDefault();
		isDraggingOver = false;

		try {
			const data = JSON.parse(event.dataTransfer.getData('text/plain'));
			if (data.source === 'palette') {
				addSection(data.componentKey, data.componentConfig);
			}
		} catch (e) {
			console.warn('Invalid drag data:', e);
		}
	}

	function handlePaletteDragLeave() {
		isDraggingOver = false;
	}

	function addSection(componentKey, componentConfig, targetId = null) {
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

		// Auto-select the new section
		selectSection(newSection);
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

	function duplicateSection(sectionId) {
		const section = sections.find(s => s.id === sectionId);
		if (section) {
			const componentConfig = getComponentConfig(section.component);
			if (componentConfig) {
				const duplicatedSection = {
					...section,
					id: `section-${Date.now()}`,
					order: sections.length + 1
				};
				sections = [...sections, duplicatedSection];
				pageLayoutManager.addSection(page, duplicatedSection);
				dispatch('layoutUpdate', { page, layout: pageLayout });
			}
		}
	}

	function getPreviewText(section) {
		if (section.component === 'homepage-text') {
			return section.props?.text || 'League introduction text will appear here...';
		} else if (section.component === 'power-rankings') {
			return `Algorithmic power rankings${section.props?.animated ? ' with animations' : ''}`;
		} else if (section.component === 'transactions') {
			return `Latest ${section.props?.limit || 10} transactions and trades`;
		} else if (section.component === 'all-managers') {
			return `Manager profiles in ${section.props?.layout || 'grid'} layout`;
		} else if (section.component === 'standings') {
			return `Current season standings${section.props?.showPoints ? ' with points' : ''}`;
		} else if (section.component === 'awards') {
			return `League awards${section.props?.showDetails ? ' with details' : ''}`;
		}
		const componentConfig = getComponentConfig(section.component);
		return componentConfig?.description || 'Component preview';
	}

	function getCategoryIcon(componentKey) {
		const componentConfig = getComponentConfig(componentKey);
		if (!componentConfig) return '📦';
		
		switch (componentConfig.category) {
			case 'Content': return '📝';
			case 'League Data': return '📊';
			case 'Managers': return '👥';
			case 'Historical': return '🏆';
			case 'Charts': return '📈';
			case 'Layout': return '🎨';
			default: return '📦';
		}
	}
</script>

<style>
	.page-builder {
		height: 100%;
		display: flex;
		flex-direction: column;
		position: relative;
	}

	.builder-header {
		padding: 1rem;
		background-color: #f8f9fa;
		border-bottom: 1px solid #ddd;
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-shrink: 0;
	}

	.page-title {
		font-size: 1.5rem;
		font-weight: bold;
		margin: 0;
		text-transform: capitalize;
		color: #333;
	}

	.builder-actions {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.btn {
		padding: 0.5rem 1rem;
		border: 1px solid #ddd;
		border-radius: 6px;
		background: white;
		cursor: pointer;
		font-size: 0.9rem;
		transition: all 0.2s;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.btn:hover {
		background-color: #f8f9fa;
		transform: translateY(-1px);
		box-shadow: 0 2px 4px rgba(0,0,0,0.1);
	}

	.btn-primary {
		background-color: #007cba;
		color: white;
		border-color: #007cba;
	}

	.btn-primary:hover {
		background-color: #005a8b;
	}

	.status-indicator {
		padding: 0.25rem 0.75rem;
		border-radius: 12px;
		font-size: 0.8rem;
		font-weight: 500;
	}

	.status-indicator.preview {
		background-color: #e3f2fd;
		color: #1976d2;
	}

	.status-indicator.edit {
		background-color: #f3e5f5;
		color: #7b1fa2;
	}

	.builder-content {
		flex: 1;
		display: flex;
		overflow: hidden;
		min-height: 0;
	}

	.section-list {
		flex: 1;
		padding: 1rem;
		overflow-y: auto;
		background-color: #fafafa;
	}

	.sections-container {
		min-height: 400px;
		position: relative;
	}

	.drop-zone {
		border: 2px dashed #ddd;
		border-radius: 12px;
		padding: 2rem;
		text-align: center;
		color: #666;
		background: white;
		margin-bottom: 1rem;
		transition: all 0.2s;
	}

	.drop-zone.drag-over {
		border-color: #007cba;
		background-color: #f0f8ff;
		color: #005a8b;
	}

	.section-item {
		margin-bottom: 1rem;
		border: 2px solid #e2e8f0;
		border-radius: 12px;
		background: white;
		transition: all 0.2s ease;
		cursor: pointer;
		overflow: hidden;
		position: relative;
	}

	.section-item:hover {
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		transform: translateY(-1px);
	}

	.section-item.selected {
		border-color: #007cba;
		box-shadow: 0 4px 12px rgba(0, 124, 186, 0.2);
	}

	.section-item.disabled {
		opacity: 0.6;
		background-color: #f8f9fa;
	}

	.section-item.dragging {
		opacity: 0.5;
		transform: rotate(2deg);
		z-index: 1000;
	}

	.section-header {
		padding: 1rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		border-bottom: 1px solid #f1f3f4;
		background-color: #fafbfc;
		cursor: grab;
	}

	.section-header:active {
		cursor: grabbing;
	}

	.section-header.preview-mode {
		cursor: default;
	}

	.section-info {
		display: flex;
		align-items: center;
		gap: 1rem;
		flex: 1;
	}

	.section-drag-handle {
		color: #9ca3af;
		font-size: 1.2rem;
		transition: color 0.2s;
		padding: 0.25rem;
	}

	.section-drag-handle:hover {
		color: #6b7280;
	}

	.section-meta {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.section-name {
		font-weight: 600;
		color: #1f2937;
		font-size: 1rem;
		margin: 0;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.section-actions {
		display: flex;
		gap: 0.25rem;
		align-items: center;
	}

	.section-btn {
		padding: 0.4rem 0.8rem;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		background: white;
		cursor: pointer;
		font-size: 0.8rem;
		transition: all 0.2s;
		display: flex;
		align-items: center;
		gap: 0.3rem;
		font-weight: 500;
	}

	.section-btn:hover {
		background-color: #f9fafb;
		border-color: #9ca3af;
		transform: translateY(-1px);
	}

	.section-btn.primary {
		background-color: #3b82f6;
		color: white;
		border-color: #3b82f6;
	}

	.section-btn.primary:hover {
		background-color: #2563eb;
	}

	.section-btn.warning {
		background-color: #f59e0b;
		color: white;
		border-color: #f59e0b;
	}

	.section-btn.warning:hover {
		background-color: #d97706;
	}

	.section-btn.danger {
		color: #dc2626;
		border-color: #dc2626;
	}

	.section-btn.danger:hover {
		background-color: #dc2626;
		color: white;
	}

	.section-preview {
		padding: 1rem;
		background-color: #fafbfc;
		color: #4b5563;
		font-size: 0.9rem;
		line-height: 1.5;
		border-top: 1px solid #f1f3f4;
	}

	.preview-text {
		margin: 0;
		font-style: italic;
	}

	.properties-panel {
		width: 320px;
		border-left: 1px solid #ddd;
		background-color: white;
		overflow-y: auto;
		flex-shrink: 0;
	}

	.properties-header {
		padding: 1rem;
		border-bottom: 1px solid #eee;
		background-color: #f8f9fa;
	}

	.properties-title {
		margin: 0;
		font-size: 1.1rem;
		font-weight: 600;
		color: #333;
	}

	.empty-state {
		text-align: center;
		color: #666;
		padding: 3rem 2rem;
		background: white;
		border: 2px dashed #ddd;
		border-radius: 12px;
		margin-bottom: 1rem;
	}

	.empty-state h3 {
		margin: 0 0 1rem 0;
		color: #333;
		font-size: 1.5rem;
	}

	.empty-state p {
		margin: 0.5rem 0;
		line-height: 1.5;
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

		.section-actions {
			flex-wrap: wrap;
		}

		.section-btn {
			font-size: 0.75rem;
			padding: 0.3rem 0.5rem;
		}
	}
</style>

<div class="page-builder">
	<!-- Header -->
	<div class="builder-header">
		<div>
			<h2 class="page-title">{page} Layout Builder</h2>
		</div>
		<div class="builder-actions">
			{#if !previewMode}
				<button 
					class="btn btn-primary"
					on:click={() => addSection('homepage-text', { name: 'Text Section', defaultProps: { text: 'New text section' } })}
				>
					➕ Add Section
				</button>
			{/if}
			<span class="status-indicator" class:preview={previewMode} class:edit={!previewMode}>
				{previewMode ? '👁️ Preview Mode' : '✏️ Edit Mode'}
			</span>
		</div>
	</div>

	<!-- Content -->
	<div class="builder-content">
		<!-- Section List -->
		<div class="section-list">
			<div class="sections-container">
				{#if sections.length === 0}
					<div 
						class="drop-zone"
						class:drag-over={isDraggingOver}
						on:dragover={handlePaletteDragOver}
						on:drop={handlePaletteDrop}
						on:dragleave={handlePaletteDragLeave}
						role="region"
						aria-label="Drop zone for components"
					>
						<h3>🎯 Drop Components Here</h3>
						<p>Drag components from the palette below to start building your page</p>
						<p style="font-size: 0.9rem; color: #999;">You can also click "Add Section" above</p>
					</div>
				{:else}
					{#each sections as section (section.id)}
						<div 
							class="section-item"
							class:selected={selectedSection && selectedSection.id === section.id}
							class:disabled={!section.enabled}
							class:dragging={draggedSection && draggedSection.id === section.id}
							draggable={!previewMode}
							on:click={() => selectSection(section)}
							on:dragstart={(e) => handleSectionDragStart(e, section)}
							on:dragover={handleSectionDragOver}
							on:drop={(e) => handleSectionDrop(e, section)}
							on:dragend={handleSectionDragEnd}
							role="button"
							tabindex="0"
							on:keydown={(e) => e.key === 'Enter' && selectSection(section)}
						>
							<!-- Section Header -->
							<div 
								class="section-header"
								class:preview-mode={previewMode}
							>
								<div class="section-info">
									{#if !previewMode}
										<span class="section-drag-handle" title="Drag to reorder">⋮⋮</span>
									{/if}
									
									<div class="section-meta">
										<h3 class="section-name">
											<span>{getCategoryIcon(section.component)}</span>
											{getComponentConfig(section.component)?.name || section.component}
										</h3>
									</div>
								</div>

								{#if !previewMode}
									<div class="section-actions">
										<button 
											class="section-btn primary"
											on:click|stopPropagation={() => selectSection(section)}
											title="Edit settings"
										>
											⚙️ Settings
										</button>
										
										<button 
											class="section-btn"
											on:click|stopPropagation={() => duplicateSection(section.id)}
											title="Duplicate section"
										>
											📋 Copy
										</button>
										
										<button 
											class="section-btn warning"
											on:click|stopPropagation={() => toggleSection(section.id)}
											title={section.enabled ? 'Hide section' : 'Show section'}
										>
											{section.enabled ? '👁️ Hide' : '👁️‍🗨️ Show'}
										</button>
										
										<button 
											class="section-btn danger"
											on:click|stopPropagation={() => removeSection(section.id)}
											title="Remove section"
										>
											🗑️ Remove
										</button>
									</div>
								{/if}
							</div>

							<!-- Section Preview -->
							{#if section.enabled}
								<div class="section-preview">
									<p class="preview-text">
										💡 {getPreviewText(section)}
									</p>
								</div>
							{/if}
						</div>
					{/each}

					{#if !previewMode}
						<div 
							class="drop-zone"
							class:drag-over={isDraggingOver}
							on:dragover={handlePaletteDragOver}
							on:drop={handlePaletteDrop}
							on:dragleave={handlePaletteDragLeave}
							role="region"
							aria-label="Drop zone for additional components"
						>
							<p>Drop more components here to add them to your page</p>
						</div>
					{/if}
				{/if}
			</div>
		</div>

		<!-- Properties Panel -->
		<div class="properties-panel">
			<div class="properties-header">
				<h3 class="properties-title">
					{#if selectedSection && !previewMode}
						⚙️ Component Settings
					{:else if !previewMode}
						📋 Page Overview
					{:else}
						👁️ Preview Mode
					{/if}
				</h3>
			</div>

			{#if selectedSection && !previewMode}
				<ComponentEditor 
					section={selectedSection}
					componentConfig={getComponentConfig(selectedSection.component)}
					on:updateSection={(e) => updateSection(e.detail.sectionId, e.detail.updates)}
				/>
			{:else if !previewMode}
				<div style="padding: 1rem;">
					<p style="color: #666; margin: 0;">
						Select a component from the page layout to edit its properties and settings.
					</p>
					
					{#if sections.length > 0}
						<div style="margin-top: 2rem;">
							<h4 style="margin: 0 0 1rem 0; color: #333;">Quick Stats:</h4>
							<ul style="margin: 0; padding-left: 1.5rem; color: #666;">
								<li>{sections.length} total sections</li>
								<li>{sections.filter(s => s.enabled).length} visible sections</li>
								<li>{sections.filter(s => !s.enabled).length} hidden sections</li>
							</ul>
						</div>
					{/if}
				</div>
			{/if}
		</div>
	</div>
</div>
