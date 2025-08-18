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
		overflow-y: auto; /* Allow scrolling if needed */
		display: block;
		position: absolute;
		z-index: 1001; /* Above the fixed nav but below mobile drawer */
		background-color: var(--fff);
		transition: all 0.4s;
		box-shadow: 0 4px 12px rgba(46, 125, 50, 0.15);
		border-radius: 0 0 8px 8px;
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		max-height: 400px; /* Limit height */
		min-width: 200px; /* Ensure minimum width */
		border: 1px solid var(--blueOne);
		border-top: none;
	}

	.overlay {
		display: block;
		position: fixed; /* Fixed to cover entire viewport */
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		height: 100vh;
		z-index: 1000; /* Same as nav to capture clicks */
	}

	:global(.mdc-deprecated-list) {
		padding: 0;
	}

	:global(.subText) {
		font-size: 0.8em;
	}

	:global(.dontDisplay) {
		display: none;
	}

	/* Enhanced submenu styling for fixed nav */
	.subMenu :global(.mdc-deprecated-list-item) {
		padding: 12px 16px;
		transition: background-color 0.2s ease;
	}

	.subMenu :global(.mdc-deprecated-list-item:hover) {
		background-color: var(--r1);
	}

	/* Dark mode support for submenu */
	:global([data-theme="dark"]) .subMenu {
		background-color: rgba(34, 34, 34, 0.95);
		border-color: var(--blueTwo);
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
		max-height: {display ? Math.min(400, 50 * tabChildren.length) : 0}px; 
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
