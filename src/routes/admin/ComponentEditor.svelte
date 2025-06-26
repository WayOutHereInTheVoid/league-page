<!-- Component Editor - Properties panel for editing component settings -->
<script>
	import { createEventDispatcher } from 'svelte';

	export let section = null;
	export let componentConfig = null;

	const dispatch = createEventDispatcher();

	let localProps = {};

	$: if (section && section.props) {
		localProps = { ...section.props };
	}

	function updateProp(propKey, value) {
		localProps[propKey] = value;
		
		dispatch('updateSection', {
			sectionId: section.id,
			updates: { props: localProps }
		});
	}

	function resetToDefaults() {
		if (componentConfig && componentConfig.defaultProps) {
			localProps = { ...componentConfig.defaultProps };
			dispatch('updateSection', {
				sectionId: section.id,
				updates: { props: localProps }
			});
		}
	}

	function renderControl(propKey, propConfig, currentValue) {
		const value = currentValue !== undefined ? currentValue : propConfig.default;
		
		switch (propConfig.type) {
			case 'boolean':
				return { type: 'checkbox', value };
			case 'number':
				return { 
					type: 'number', 
					value,
					min: propConfig.min,
					max: propConfig.max,
					step: propConfig.step || 1
				};
			case 'select':
				return { type: 'select', value, options: propConfig.options };
			case 'multi-select':
				return { type: 'multi-select', value: value || [], options: propConfig.options };
			case 'rich-text':
				return { type: 'textarea', value };
			default:
				return { type: 'text', value };
		}
	}
</script>

<style>
	.component-editor {
		padding: 1rem;
		height: 100%;
		overflow-y: auto;
	}

	.editor-header {
		margin-bottom: 1.5rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid #eee;
	}

	.editor-title {
		font-size: 1.2rem;
		font-weight: bold;
		margin: 0 0 0.5rem 0;
		color: #333;
	}

	.editor-description {
		font-size: 0.9rem;
		color: #666;
		line-height: 1.4;
	}

	.property-group {
		margin-bottom: 1.5rem;
	}

	.property-label {
		display: block;
		font-weight: 500;
		margin-bottom: 0.5rem;
		color: #333;
	}

	.property-description {
		font-size: 0.85rem;
		color: #666;
		margin-bottom: 0.5rem;
		line-height: 1.3;
	}

	.form-control {
		width: 100%;
		padding: 0.5rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-size: 0.9rem;
		transition: border-color 0.2s;
	}

	.form-control:focus {
		outline: none;
		border-color: #007cba;
		box-shadow: 0 0 0 2px rgba(0, 124, 186, 0.1);
	}

	.checkbox-wrapper {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.checkbox-input {
		width: auto;
	}

	.multi-select {
		border: 1px solid #ddd;
		border-radius: 4px;
		padding: 0.5rem;
		background: white;
	}

	.multi-select-option {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.25rem 0;
	}

	.multi-select-option input {
		width: auto;
	}

	.current-value {
		background-color: #f8f9fa;
		padding: 0.5rem;
		border-radius: 4px;
		margin-top: 0.5rem;
		font-size: 0.85rem;
		border-left: 3px solid #007cba;
	}

	.current-value-label {
		font-weight: bold;
		color: #007cba;
		display: block;
		margin-bottom: 0.25rem;
	}

	.editor-actions {
		margin-top: 2rem;
		padding-top: 1rem;
		border-top: 1px solid #eee;
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
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

	.btn-secondary {
		background-color: #6c757d;
		color: white;
		border-color: #6c757d;
	}

	.btn-secondary:hover {
		background-color: #545b62;
	}

	.no-selection {
		text-align: center;
		color: #666;
		padding: 2rem;
	}

	.property-hint {
		font-size: 0.8rem;
		color: #999;
		margin-top: 0.25rem;
		font-style: italic;
	}

	.range-input {
		width: 100%;
		margin: 0.5rem 0;
	}

	.range-display {
		text-align: center;
		font-weight: bold;
		color: #007cba;
	}
</style>

<div class="component-editor">
	{#if section && componentConfig}
		<!-- Header -->
		<div class="editor-header">
			<h3 class="editor-title">{componentConfig.name}</h3>
			<p class="editor-description">{componentConfig.description}</p>
		</div>

		<!-- Properties -->
		{#if componentConfig.configurable && Object.keys(componentConfig.configurable).length > 0}
			{#each Object.entries(componentConfig.configurable) as [propKey, propConfig]}
				<div class="property-group">
					<label class="property-label">
						{propConfig.label || propKey}
						{#if propConfig.required}
							<span style="color: #dc3545;">*</span>
						{/if}
					</label>

					{#if propConfig.description}
						<div class="property-description">{propConfig.description}</div>
					{/if}

					<!-- Render appropriate input based on type -->
					{#each [renderControl(propKey, propConfig, localProps[propKey])] as control}
						{#if control.type === 'checkbox'}
							<div class="checkbox-wrapper">
								<input 
									type="checkbox"
									class="checkbox-input"
									checked={control.value}
									on:change={(e) => updateProp(propKey, e.target.checked)}
								/>
								<span>Enable {propConfig.label}</span>
							</div>

						{:else if control.type === 'number'}
							<input 
								type="number"
								class="form-control"
								value={control.value}
								min={control.min}
								max={control.max}
								step={control.step}
								on:input={(e) => updateProp(propKey, parseInt(e.target.value) || 0)}
							/>
							
							{#if control.min !== undefined || control.max !== undefined}
								<div class="property-hint">
									Range: {control.min || 'no minimum'} - {control.max || 'no maximum'}
								</div>
							{/if}

							{#if propKey === 'chartHeight' || propKey === 'photosPerRow'}
								<input 
									type="range"
									class="range-input"
									value={control.value}
									min={control.min || 1}
									max={control.max || 100}
									on:input={(e) => updateProp(propKey, parseInt(e.target.value))}
								/>
								<div class="range-display">{control.value}</div>
							{/if}

						{:else if control.type === 'select'}
							<select 
								class="form-control"
								value={control.value}
								on:change={(e) => updateProp(propKey, e.target.value)}
							>
								{#each control.options as option}
									<option value={option}>{option}</option>
								{/each}
							</select>

						{:else if control.type === 'multi-select'}
							<div class="multi-select">
								{#each control.options as option}
									<div class="multi-select-option">
										<input 
											type="checkbox"
											checked={control.value.includes(option)}
											on:change={(e) => {
												let newValue = [...control.value];
												if (e.target.checked) {
													newValue.push(option);
												} else {
													newValue = newValue.filter(v => v !== option);
												}
												updateProp(propKey, newValue);
											}}
										/>
										<span>{option}</span>
									</div>
								{/each}
							</div>

						{:else if control.type === 'textarea'}
							<textarea 
								class="form-control"
								rows="4"
								value={control.value}
								on:input={(e) => updateProp(propKey, e.target.value)}
								placeholder="Enter your text here..."
							></textarea>

						{:else}
							<input 
								type="text"
								class="form-control"
								value={control.value}
								on:input={(e) => updateProp(propKey, e.target.value)}
							/>
						{/if}

						<!-- Current Value Display -->
						{#if control.value !== undefined && control.value !== ''}
							<div class="current-value">
								<span class="current-value-label">Current Value:</span>
								{#if Array.isArray(control.value)}
									{control.value.join(', ') || 'None selected'}
								{:else if typeof control.value === 'boolean'}
									{control.value ? 'Enabled' : 'Disabled'}
								{:else}
									{control.value}
								{/if}
							</div>
						{/if}
					{/each}
				</div>
			{/each}
		{:else}
			<div class="no-selection">
				<p>This component has no configurable properties.</p>
			</div>
		{/if}

		<!-- Actions -->
		<div class="editor-actions">
			<button class="btn btn-secondary" on:click={resetToDefaults}>
				Reset to Defaults
			</button>
		</div>

	{:else}
		<div class="no-selection">
			<h3>No Component Selected</h3>
			<p>Click on a component in the page layout to edit its properties.</p>
		</div>
	{/if}
</div>
