<!-- Enhanced Page Builder with @dnd-kit integration -->
<script>
	import { createEventDispatcher, onMount } from 'svelte';
	import { 
		DndContext,
		DragOverlay,
		closestCenter,
		KeyboardSensor,
		PointerSensor,
		useSensor,
		useSensors
	} from '@dnd-kit/core';
	import {
		arrayMove,
		SortableContext,
		sortableKeyboardCoordinates,
		verticalListSortingStrategy
	} from '@dnd-kit/sortable';
	import {
		CSS
	} from '@dnd-kit/utilities';
	
	import { pageLayoutManager } from '$lib/admin/pageLayoutManager.js';
	import { getComponentConfig } from '$lib/admin/componentRegistry.js';
	import ComponentEditor from './ComponentEditor.svelte';
	import SortableSection from './SortableSection.svelte';
	import PaletteDropZone from './PaletteDropZone.svelte';

	export let page = '';
	export let previewMode = false;
	export let selectedSection = null;

	const dispatch = createEventDispatcher();

	let pageLayout = null;
	let sections = [];
	let activeId = null;
	let isDraggingFromPalette = false;
	let pendingPaletteItem = null;

	// Configure sensors for drag & drop
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8,
			},
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	onMount(() => {
		loadPageLayout();
	});

	$: if (page) {
		loadPageLayout();
	}

	$: sectionIds = sections.map(section => section.id);

	function loadPageLayout() {
		if (!page) return;
		
		pageLayout = pageLayoutManager.getPageLayout(page);
		if (pageLayout) {
			sections = pageLayoutManager.getAllSections(page);
		} else {
			sections = [];
		}
	}

	function handleDragStart(event) {
		activeId = event.active.id;
		
		// Check if dragging from palette
		if (event.active.data.current?.source === 'palette') {
			isDraggingFromPalette = true;
			pendingPaletteItem = event.active.data.current;
		}
	}

	function handleDragOver(event) {
		const { active, over } = event;
		
		if (!over) return;

		// Handle palette item drag over
		if (isDraggingFromPalette && over.id === 'drop-zone') {
			return; // Allow drop on drop zone
		}

		// Handle section reordering
		if (!isDraggingFromPalette) {
			const activeIndex = sections.findIndex(section => section.id === active.id);
			const overIndex = sections.findIndex(section => section.id === over.id);

			if (activeIndex !== overIndex) {
				sections = arrayMove(sections, activeIndex, overIndex);
			}
		}
	}

	function handleDragEnd(event) {
		const { active, over } = event;

		if (!over) {
			// Reset state
			activeId = null;
			isDraggingFromPalette = false;
			pendingPaletteItem = null;
			return;
		}

		// Handle palette drop
		if (isDraggingFromPalette && pendingPaletteItem) {
			if (over.id === 'drop-zone' || sections.some(s => s.id === over.id)) {
				addSection(pendingPaletteItem.componentKey, pendingPaletteItem.componentConfig, over.id);
			}
			isDraggingFromPalette = false;
			pendingPaletteItem = null;
			activeId = null;
			return;
		}

		// Handle section reordering
		if (active.id !== over.id && !isDraggingFromPalette) {
			const activeIndex = sections.findIndex(section => section.id === active.id);
			const overIndex = sections.findIndex(section => section.id === over.id);

			if (activeIndex !== -1 && overIndex !== -1) {
				const newSections = arrayMove(sections, activeIndex, overIndex);
				
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
		}

		activeId = null;
	}

	function addSection(componentKey, componentConfig, targetId = null) {
		const newSection = {
			id: `section-${Date.now()}`,
			component: componentKey,
			props: { ...componentConfig.defaultProps },
			enabled: true,
			order: sections.length + 1
		};

		if (targetId && targetId !== 'drop-zone') {
			// Insert at specific position
			const targetIndex = sections.findIndex(s => s.id === targetId);
			if (targetIndex !== -1) {
				sections.splice(targetIndex + 1, 0, newSection);
				// Reorder all sections
				sections.forEach((section, index) => {
					section.order = index + 1;
				});
				sections = [...sections];
			} else {
				sections = [...sections, newSection];
			}
		} else {
			sections = [...sections, newSection];
		}

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

	// Add keyboard shortcuts
	function handleKeyDown(event) {
		if (event.ctrlKey || event.metaKey) {
			switch (event.key) {
				case 's':
					event.preventDefault();
					// Save functionality would go here
					break;
				case 'z':
					event.preventDefault();
					// Undo functionality would go here
					break;
			}
		}
		
		if (event.key === 'Delete' && selectedSection) {
			removeSection(selectedSection.id);
		}
	}

	// Handle external drops from the component palette
	export function handlePaletteDrop(componentKey, componentConfig) {
		addSection(componentKey, componentConfig);
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

	.btn-success {
		background-color: #28a745;
		color: white;
		border-color: #28a745;
	}

	.btn-success:hover {
		background-color: #218838;
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

	.empty-state.preview {
		background-color: #f0f8ff;
		border-color: #007cba;
		color: #005a8b;
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

	.section-count {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: #666;
		font-size: 0.9rem;
		margin-top: 0.5rem;
	}

	.count-badge {
		background-color: #007cba;
		color: white;
		padding: 0.2rem 0.6rem;
		border-radius: 12px;
		font-size: 0.8rem;
		font-weight: 500;
	}

	.quick-actions {
		display: flex;
		gap: 0.5rem;
		margin-top: 1rem;
	}

	.quick-btn {
		padding: 0.4rem 0.8rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		background: white;
		cursor: pointer;
		font-size: 0.8rem;
		transition: all 0.2s;
		flex: 1;
		text-align: center;
	}

	.quick-btn:hover {
		background-color: #f8f9fa;
	}

	.keyboard-shortcuts {
		position: fixed;
		bottom: 1rem;
		right: 1rem;
		background: rgba(0, 0, 0, 0.8);
		color: white;
		padding: 0.5rem 1rem;
		border-radius: 8px;
		font-size: 0.8rem;
		opacity: 0;
		transition: opacity 0.3s;
		pointer-events: none;
		z-index: 1000;
	}

	.keyboard-shortcuts.visible {
		opacity: 1;
	}

	.drag-overlay {
		background: white;
		border-radius: 8px;
		box-shadow: 0 10px 25px rgba(0,0,0,0.2);
		padding: 1rem;
		opacity: 0.9;
		transform: rotate(5deg);
		min-width: 200px;
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

		.builder-actions {
			flex-direction: column;
			gap: 0.25rem;
		}

		.btn {
			font-size: 0.8rem;
			padding: 0.4rem 0.8rem;
		}
	}
</style>

<svelte:window on:keydown={handleKeyDown} />

<div class="page-builder">
	<!-- Header -->
	<div class="builder-header">
		<div>
			<h2 class="page-title">{page} Layout Builder</h2>
			<div class="section-count">
				<span>📄 {sections.length} sections</span>
				<span class="count-badge">{sections.filter(s => s.enabled).length} visible</span>
			</div>
		</div>
		<div class="builder-actions">
			{#if !previewMode}
				<button 
					class="btn"
					on:click={() => addSection('homepage-text', { name: 'Text Section', defaultProps: { text: 'New text section' } })}
				>
					➕ Add Section
				</button>
				<button class="btn" disabled>
					💾 Save Layout
				</button>
			{/if}
			<span class="status-indicator" class:preview={previewMode} class:edit={!previewMode}>
				{previewMode ? '👁️ Preview Mode' : '✏️ Edit Mode'}
			</span>
		</div>
	</div>

	<!-- Content -->
	<div class="builder-content">
		<!-- Section List with Drag & Drop -->
		<div class="section-list">
			<DndContext
				{sensors}
				collisionDetection={closestCenter}
				on:dragstart={handleDragStart}
				on:dragover={handleDragOver}
				on:dragend={handleDragEnd}
			>
				<div class="sections-container">
					{#if sections.length === 0}
						<PaletteDropZone 
							{previewMode} 
							{page}
							{isDraggingFromPalette}
							on:drop={(e) => addSection(e.detail.componentKey, e.detail.componentConfig)}
						/>
					{:else}
						<SortableContext items={sectionIds} strategy={verticalListSortingStrategy}>
							{#each sections as section (section.id)}
								<SortableSection
									{section}
									{previewMode}
									{selectedSection}
									isActive={activeId === section.id}
									on:select={(e) => selectSection(e.detail.section)}
									on:toggle={(e) => toggleSection(e.detail.sectionId)}
									on:remove={(e) => removeSection(e.detail.sectionId)}
									on:duplicate={(e) => duplicateSection(e.detail.sectionId)}
									on:update={(e) => updateSection(e.detail.sectionId, e.detail.updates)}
								/>
							{/each}
						</SortableContext>

						{#if !previewMode}
							<PaletteDropZone 
								{previewMode} 
								{page}
								{isDraggingFromPalette}
								dropZoneId="drop-zone"
								text="Drop components here to add them to your page"
								on:drop={(e) => addSection(e.detail.componentKey, e.detail.componentConfig)}
							/>
						{/if}
					{/if}
				</div>

				<!-- Drag Overlay -->
				<DragOverlay>
					{#if activeId && !isDraggingFromPalette}
						{@const section = sections.find(s => s.id === activeId)}
						{#if section}
							<div class="drag-overlay">
								<strong>{getComponentConfig(section.component)?.name || section.component}</strong>
								<p>{getComponentConfig(section.component)?.description || ''}</p>
							</div>
						{/if}
					{:else if isDraggingFromPalette && pendingPaletteItem}
						<div class="drag-overlay">
							<strong>{pendingPaletteItem.componentConfig.name}</strong>
							<p>{pendingPaletteItem.componentConfig.description}</p>
						</div>
					{/if}
				</DragOverlay>
			</DndContext>
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
				
				{#if !previewMode}
					<div class="quick-actions">
						<button class="quick-btn" on:click={() => sections.forEach(s => updateSection(s.id, { enabled: true }))}>
							Show All
						</button>
						<button class="quick-btn" on:click={() => sections.forEach(s => updateSection(s.id, { enabled: false }))}>
							Hide All
						</button>
					</div>
				{/if}
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

	<!-- Keyboard Shortcuts Tooltip -->
	<div class="keyboard-shortcuts" class:visible={!previewMode}>
		<strong>Shortcuts:</strong> Ctrl+S Save • Del Remove • Drag to reorder
	</div>
</div>