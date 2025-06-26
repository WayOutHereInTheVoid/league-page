<!-- Sortable Section Component - Individual draggable/sortable section -->
<script>
	import { createEventDispatcher } from 'svelte';
	import {
		useSortable
	} from '@dnd-kit/sortable';
	import {
		CSS
	} from '@dnd-kit/utilities';
	import { getComponentConfig } from '$lib/admin/componentRegistry.js';

	export let section;
	export let previewMode = false;
	export let selectedSection = null;
	export let isActive = false;

	const dispatch = createEventDispatcher();

	$: isSelected = selectedSection && selectedSection.id === section.id;
	$: componentConfig = getComponentConfig(section.component);

	// Local variable for the node reference
	let nodeRef;

	// Set up sortable functionality
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging
	} = useSortable({
		id: section.id,
		disabled: previewMode
	});

	// Call setNodeRef when nodeRef changes
	$: if (nodeRef) {
		setNodeRef(nodeRef);
	}

	$: style = `
		transform: ${CSS.Transform.toString(transform)};
		transition: ${transition};
		opacity: ${isDragging ? 0.5 : 1};
	`;

	function handleSelect() {
		if (previewMode) return;
		dispatch('select', { section });
	}

	function handleToggle(event) {
		event.stopPropagation();
		dispatch('toggle', { sectionId: section.id });
	}

	function handleRemove(event) {
		event.stopPropagation();
		if (confirm(`Remove "${componentConfig?.name || section.component}" section?`)) {
			dispatch('remove', { sectionId: section.id });
		}
	}

	function handleDuplicate(event) {
		event.stopPropagation();
		dispatch('duplicate', { sectionId: section.id });
	}

	function handleSettingsClick(event) {
		event.stopPropagation();
		dispatch('select', { section });
	}

	function getPreviewText() {
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
		return componentConfig?.description || 'Component preview';
	}

	function getCategoryIcon() {
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
		transform: rotate(2deg);
		box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
		z-index: 1000;
	}

	.section-item.preview-mode {
		cursor: default;
		background-color: #f0f8ff;
		border-color: #b3d9ff;
	}

	.section-item.preview-mode:hover {
		transform: none;
		box-shadow: none;
	}

	.section-header {
		padding: 1rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		border-bottom: 1px solid #f1f3f4;
		background-color: #fafbfc;
	}

	.section-header.draggable {
		cursor: grab;
	}

	.section-header.draggable:active {
		cursor: grabbing;
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
	}

	.section-type {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.component-badge {
		font-size: 0.75rem;
		color: #6b7280;
		background-color: #f3f4f6;
		padding: 0.2rem 0.6rem;
		border-radius: 12px;
		font-weight: 500;
	}

	.status-indicators {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.status-badge {
		font-size: 0.7rem;
		padding: 0.2rem 0.5rem;
		border-radius: 8px;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.025em;
	}

	.status-badge.hidden {
		background-color: #fef3c7;
		color: #92400e;
	}

	.status-badge.visible {
		background-color: #d1fae5;
		color: #065f46;
	}

	.status-badge.selected {
		background-color: #dbeafe;
		color: #1d4ed8;
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

	.section-btn.success {
		background-color: #10b981;
		color: white;
		border-color: #10b981;
	}

	.section-btn.success:hover {
		background-color: #059669;
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

	.preview-mode .section-preview {
		background-color: white;
		color: #1f2937;
		font-style: normal;
		padding: 1.5rem;
	}

	.component-icon {
		font-size: 1.1rem;
		margin-right: 0.5rem;
	}

	.order-indicator {
		position: absolute;
		top: 0.5rem;
		left: 0.5rem;
		background-color: #6b7280;
		color: white;
		font-size: 0.7rem;
		padding: 0.2rem 0.5rem;
		border-radius: 8px;
		font-weight: 600;
		opacity: 0.7;
	}

	@media (max-width: 768px) {
		.section-header {
			flex-direction: column;
			gap: 1rem;
			align-items: flex-start;
		}

		.section-actions {
			width: 100%;
			justify-content: space-between;
		}

		.section-btn {
			flex: 1;
			justify-content: center;
			font-size: 0.75rem;
			padding: 0.3rem 0.5rem;
		}
	}
</style>

<div 
	bind:this={nodeRef}
	{style}
	class="section-item"
	class:selected={isSelected}
	class:disabled={!section.enabled}
	class:dragging={isDragging}
	class:preview-mode={previewMode}
	on:click={handleSelect}
	role="button"
	tabindex="0"
	on:keydown={(e) => e.key === 'Enter' && handleSelect()}
>
	<!-- Order indicator (only visible when dragging) -->
	{#if isDragging}
		<div class="order-indicator">#{section.order}</div>
	{/if}

	<!-- Section Header -->
	<div 
		class="section-header"
		class:draggable={!previewMode}
		use:attributes
		use:listeners
	>
		<div class="section-info">
			{#if !previewMode}
				<span class="section-drag-handle" title="Drag to reorder">⋮⋮</span>
			{/if}
			
			<div class="section-meta">
				<h3 class="section-name">
					<span class="component-icon">{getCategoryIcon()}</span>
					{componentConfig?.name || section.component}
				</h3>
				<div class="section-type">
					<span class="component-badge">{section.component}</span>
					<div class="status-indicators">
						{#if isSelected}
							<span class="status-badge selected">Selected</span>
						{/if}
						<span class="status-badge" class:hidden={!section.enabled} class:visible={section.enabled}>
							{section.enabled ? 'Visible' : 'Hidden'}
						</span>
					</div>
				</div>
			</div>
		</div>

		{#if !previewMode}
			<div class="section-actions">
				<button 
					class="section-btn primary"
					on:click={handleSettingsClick}
					title="Edit settings"
				>
					⚙️ Settings
				</button>
				
				<button 
					class="section-btn"
					on:click={handleDuplicate}
					title="Duplicate section"
				>
					📋 Copy
				</button>
				
				<button 
					class="section-btn warning"
					on:click={handleToggle}
					title={section.enabled ? 'Hide section' : 'Show section'}
				>
					{section.enabled ? '👁️ Hide' : '👁️‍🗨️ Show'}
				</button>
				
				<button 
					class="section-btn danger"
					on:click={handleRemove}
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
				{#if previewMode}
					<strong>{componentConfig?.name || section.component}</strong><br>
					{getPreviewText()}
				{:else}
					💡 {getPreviewText()}
				{/if}
			</p>
			
			{#if !previewMode && Object.keys(section.props || {}).length > 0}
				<details style="margin-top: 0.5rem;">
					<summary style="cursor: pointer; color: #6b7280;">View Configuration</summary>
					<div style="margin-top: 0.5rem; font-size: 0.8rem; color: #9ca3af;">
						{#each Object.entries(section.props || {}) as [key, value]}
							<div><strong>{key}:</strong> {typeof value === 'object' ? JSON.stringify(value) : value}</div>
						{/each}
					</div>
				</details>
			{/if}
		</div>
	{/if}
</div>