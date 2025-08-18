<script>
	import { tabs } from '$lib/utils/tabs';
	import Tab, { Icon, Label } from '@smui/tab';
	import List, { Item, Graphic, Text, Separator } from '@smui/list';
	import TabBar from '@smui/tab-bar';
    import { page } from '$app/state';
	import { goto, preloadData } from '$app/navigation';
	import { enableBlog, managers } from '$lib/utils/leagueInfo';

	let active = $state(tabs.find(tab => tab.dest == page.url.pathname || (tab.nest && tab.children.find(subTab => subTab.dest == page.url.pathname))));

	let display = $state(false);
	let el = $state();
	let width = $state();
	let height= $state();
	let left = $state();
	let top = $state();

	$effect(() => {
		top = el?.getBoundingClientRect() ? el?.getBoundingClientRect().top  : 0;
		const bottom = el?.getBoundingClientRect() ? el?.getBoundingClientRect().bottom  : 0;

		height = bottom - top + 1;

		left = el?.getBoundingClientRect() ? el?.getBoundingClientRect().left  : 0;
		const right = el?.getBoundingClientRect() ? el?.getBoundingClientRect().right  : 0;

		width = right - left;
	});

	let innerWidth = $state();

	const open = () => {
		display = !display;
	}

	const subGoto = (dest) => {
		open(false);
		goto(dest);
	}

	let tabChildren = $state([]);

	for(const tab of tabs) {
		if(tab.nest) {
			tabChildren = tab.children;
		}
	}

</script>

<svelte:window bind:innerWidth={innerWidth} />

<style>
    :global(.navBar) {
		display: inline-flex;
		position: relative;
    	justify-content: center;
    }

	:global(.navBar .material-icons) {
		font-size: 1.8em;
		height: 25px;
		width: 22px;
	}

	.parent {
		position: relative;
	}

	.subMenu {
		overflow-y: visible;
		display: block;
		position: absolute;
		z-index: 1001;
		background-color: var(--fff) !important;
		transition: all 0.4s;
		box-shadow: 0 4px 12px rgba(46, 125, 50, 0.15);
		border-radius: 0 0 8px 8px;
		max-height: 300px; /* Compact height for all items */
		min-width: 200px;
		border: 1px solid var(--blueOne);
		border-top: none;
	}

	.overlay {
		display: block;
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		height: 100vh;
		z-index: 1000;
	}

	:global(.mdc-deprecated-list) {
		padding: 0 !important;
		background-color: var(--fff) !important;
	}

	:global(.subText) {
		font-size: 0.8em;
	}

	:global(.dontDisplay) {
		display: none;
	}

	/* Compact submenu styling - much tighter spacing */
	.subMenu :global(.mdc-deprecated-list-item) {
		padding: 4px 12px !important; /* Very compact padding */
		min-height: 28px !important; /* Force smaller height */
		transition: background-color 0.2s ease;
		background-color: var(--fff) !important;
	}

	.subMenu :global(.mdc-deprecated-list-item:hover) {
		background-color: var(--r1) !important;
	}

	/* Force icons and text to be compact */
	.subMenu :global(.mdc-deprecated-list-item__graphic) {
		margin-right: 8px !important;
		width: 20px !important;
		height: 20px !important;
	}

	.subMenu :global(.material-icons) {
		font-size: 16px !important;
		line-height: 20px !important;
	}

	.subMenu :global(.mdc-deprecated-list-item__text) {
		font-size: 0.8em !important;
		line-height: 1.2 !important;
	}

	/* Compact separators */
	.subMenu :global(.mdc-deprecated-list-divider) {
		margin: 0 !important;
		height: 1px !important;
		background-color: var(--blueOne) !important;
	}

	/* Dark mode support for submenu */
	:global([data-theme="dark"]) .subMenu {
		background-color: rgba(34, 34, 34, 1) !important;
		border-color: var(--blueTwo);
	}

	:global([data-theme="dark"]) .subMenu :global(.mdc-deprecated-list-item) {
		background-color: rgba(34, 34, 34, 1) !important;
	}

	:global([data-theme="dark"]) .subMenu :global(.mdc-deprecated-list) {
		background-color: rgba(34, 34, 34, 1) !important;
	}
</style>

<div tabindex="0" role="button" class="overlay" style="display: {display ? "block" : "none"};" onclick={() => open(true)}></div>

<div class="parent">
	<TabBar class="navBar" {tabs} key={(tab) => tab.key} bind:active>
		{#snippet tab(tab)}
			{#if tab.nest}
				<div bind:this={el}>
					<Tab
						{tab}
						minWidth
						onclick={() => open()}
					>
						<Icon class="material-icons">{tab.icon}</Icon>
						<Label>{tab.label}</Label>
					</Tab>
				</div>
			{:else}
				<Tab
					class="{tab.label == 'Blog' && !enableBlog ? 'dontDisplay' : ''}"
					{tab}
					onTouchstart={() => preloadData(tab.dest)}
					onMouseover={() => preloadData(tab.dest)}
					href={tab.dest}
					minWidth
				>
					<Icon class="material-icons">{tab.icon}</Icon>
					<Label>{tab.label}</Label>
				</Tab>
			{/if}
		{/snippet}
	</TabBar>
	<div class="subMenu" style="
		max-height: {display ? Math.min(300, 30 * tabChildren.length) : 0}px; 
		width: {Math.max(width, 200)}px; 
		top: {height}px; 
		left: {left}px; 
		opacity: {display ? 1 : 0};
		transform: translateY({display ? 0 : -10}px);
	">
		<List>
			{#each tabChildren as subTab, ix}
				{#if subTab.label == 'Managers'}
					<Item class="{managers.length ? '' : 'dontDisplay'}" onSMUIAction={() => subGoto(subTab.dest)} ontouchstart={() => preloadData(subTab.dest)} onmouseover={() => preloadData(subTab.dest)}>
						<Graphic class="material-icons">{subTab.icon}</Graphic>
						<Text class="subText">{subTab.label}</Text>
					</Item>
					{#if ix != tabChildren.length - 1}
						<Separator />
					{/if}
				{:else}
					<Item onSMUIAction={() => subGoto(subTab.dest)} ontouchstart={() => {if(subTab.label != 'Go to Sleeper') preloadData(subTab.dest)}} onmouseover={() => {if(subTab.label != 'Go to Sleeper') preloadData(subTab.dest)}}>
						<Graphic class="material-icons">{subTab.icon}</Graphic>
						<Text class="subText">{subTab.label}</Text>
					</Item>
					{#if ix != tabChildren.length - 1}
						<Separator />
					{/if}
				{/if}
			{/each}
		</List>
	</div>
</div>
