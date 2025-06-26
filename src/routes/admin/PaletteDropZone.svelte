<!-- Palette Drop Zone - Drop zone for components from the component palette -->
<script>
	import { createEventDispatcher } from 'svelte';
	import { useDroppable } from '@dnd-kit/core';

	export let previewMode = false;
	export let page = '';
	export let isDraggingFromPalette = false;
	export let dropZoneId = 'main-drop-zone';
	export let text = 'Drag components from the palette to build your page layout';

	const dispatch = createEventDispatcher();

	// Set up droppable functionality
	const { setNodeRef, isOver } = useDroppable({
		id: dropZoneId,
		disabled: previewMode
	});

	function handleDrop(event) {
		event.preventDefault();
		
		if (previewMode) return;

		try {
			const data = JSON.parse(event.dataTransfer.getData('text/plain'));
			
			if (data.source === 'palette') {
				dispatch('drop', {
					componentKey: data.componentKey,
					componentConfig: data.componentConfig
				});
			}
		} catch (e) {
			console.error('Error handling drop:', e);
		}
	}

	function handleDragOver(event) {
		event.preventDefault();
		event.dataTransfer.dropEffect = 'copy';
	}

	$: dropZoneState = {
		isActive: isOver,
		isDragging: isDraggingFromPalette,
		isPreview: previewMode
	};
</script>

<style>
	.drop-zone {
		min-height: 120px;
		border: 2px dashed #cbd5e1;
		border-radius: 12px;
		padding: 2rem;
		text-align: center;
		color: #64748b;
		background-color: #f8fafc;
		margin: 1rem 0;
		transition: all 0.3s ease;
		position: relative;
		overflow: hidden;
	}

	.drop-zone.active {
		border-color: #3b82f6;
		background-color: #eff6ff;
		color: #1d4ed8;
		transform: scale(1.02);
		box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15);
	}

	.drop-zone.dragging {
		border-color: #10b981;
		background-color: #f0fdf4;
		color: #047857;
		animation: pulse 2s ease-in-out infinite;
	}

	.drop-zone.preview-mode {
		background: linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%);
		border-color: #3b82f6;
		color: #1e40af;
	}

	.drop-zone.empty-state {
		min-height: 200px;
		background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
		border-style: solid;
		border-width: 3px;
	}

	.drop-zone-content {
		position: relative;
		z-index: 2;
	}

	.drop-zone-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
		opacity: 0.6;
		transition: all 0.3s ease;
	}

	.active .drop-zone-icon,
	.dragging .drop-zone-icon {
		opacity: 1;
		transform: scale(1.1);
	}

	.drop-zone-title {
		font-size: 1.25rem;
		font-weight: 600;
		margin: 0 0 0.5rem 0;
		transition: all 0.3s ease;
	}

	.drop-zone-description {
		margin: 0;
		line-height: 1.5;
		opacity: 0.8;
	}

	.preview-content {
		padding: 1rem 0;
	}

	.preview-title {
		font-size: 1.5rem;
		font-weight: 700;
		margin: 0 0 1rem 0;
		color: #1e40af;
	}

	.preview-description {
		font-size: 1rem;
		line-height: 1.6;
		margin: 0;
	}

	.drop-indicator {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(45deg, 
			rgba(59, 130, 246, 0.1) 25%, 
			transparent 25%, 
			transparent 50%, 
			rgba(59, 130, 246, 0.1) 50%, 
			rgba(59, 130, 246, 0.1) 75%, 
			transparent 75%, 
			transparent
		);
		background-size: 20px 20px;
		animation: slide 1s linear infinite;
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	.active .drop-indicator,
	.dragging .drop-indicator {
		opacity: 1;
	}

	.getting-started {
		background: white;
		border: 1px solid #e2e8f0;
		border-radius: 8px;
		padding: 1.5rem;
		margin-top: 1rem;
		text-align: left;
	}

	.getting-started h4 {
		margin: 0 0 1rem 0;
		color: #374151;
		font-size: 1rem;
	}

	.steps-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.steps-list li {
		padding: 0.5rem 0;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		color: #6b7280;
		font-size: 0.9rem;
	}

	.step-number {
		background: #3b82f6;
		color: white;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.8rem;
		font-weight: 600;
		flex-shrink: 0;
	}

	@keyframes pulse {
		0%, 100% { transform: scale(1); }
		50% { transform: scale(1.02); }
	}

	@keyframes slide {
		0% { background-position: 0 0; }
		100% { background-position: 20px 20px; }
	}

	@media (max-width: 768px) {
		.drop-zone {
			padding: 1.5rem 1rem;
			margin: 0.5rem 0;
		}

		.drop-zone-icon {
			font-size: 2rem;
		}

		.drop-zone-title {
			font-size: 1.1rem;
		}

		.drop-zone-description {
			font-size: 0.9rem;
		}
	}
</style>

<div 
	use:setNodeRef
	class="drop-zone"
	class:active={dropZoneState.isActive}
	class:dragging={dropZoneState.isDragging}
	class:preview-mode={dropZoneState.isPreview}
	class:empty-state={!previewMode && dropZoneId === 'main-drop-zone'}
	on:drop={handleDrop}
	on:dragover={handleDragOver}
	role="region"
	aria-label="Component drop zone"
>
	<!-- Animated background indicator -->
	<div class="drop-indicator"></div>
	
	<div class="drop-zone-content">
		{#if previewMode}
			<div class="preview-content">
				<h2 class="preview-title">🎉 Preview Mode</h2>
				<p class="preview-description">
					This is how your <strong>{page}</strong> page will look with the current layout.
					Switch to Edit Mode to continue building your page.
				</p>
			</div>
		{:else if dropZoneId === 'main-drop-zone'}
			<!-- Main empty state -->
			<div class="drop-zone-icon">
				{#if dropZoneState.isDragging}
					🎯
				{:else if dropZoneState.isActive}
					✨
				{:else}
					🏗️
				{/if}
			</div>
			
			<h3 class="drop-zone-title">
				{#if dropZoneState.isDragging}
					Drop your component here!
				{:else if dropZoneState.isActive}
					Ready to drop!
				{:else}
					Start Building Your {page.charAt(0).toUpperCase() + page.slice(1)} Page
				{/if}
			</h3>
			
			<p class="drop-zone-description">
				{#if dropZoneState.isDragging}
					Release to add the component to your page layout
				{:else}
					Drag components from the palette on the left to build your page layout
				{/if}
			</p>

			{#if !dropZoneState.isDragging && !dropZoneState.isActive}
				<div class="getting-started">
					<h4>Getting Started:</h4>
					<ol class="steps-list">
						<li>
							<span class="step-number">1</span>
							Browse components in the left sidebar
						</li>
						<li>
							<span class="step-number">2</span>
							Drag a component into this area
						</li>
						<li>
							<span class="step-number">3</span>
							Configure it using the properties panel
						</li>
						<li>
							<span class="step-number">4</span>
							Add more components and reorder as needed
						</li>
					</ol>
				</div>
			{/if}
		{:else}
			<!-- Regular drop zone -->
			<div class="drop-zone-icon">
				{#if dropZoneState.isDragging}
					⬇️
				{:else if dropZoneState.isActive}
					📍
				{:else}
					➕
				{/if}
			</div>
			
			<h3 class="drop-zone-title">
				{#if dropZoneState.isDragging}
					Drop here to add
				{:else if dropZoneState.isActive}
					Release to add
				{:else}
					Add Components
				{/if}
			</h3>
			
			<p class="drop-zone-description">
				{text}
			</p>
		{/if}
	</div>
</div>