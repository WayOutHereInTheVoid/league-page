<script>
	import { tabs } from '$lib/utils/tabs';
	import Drawer, {
	  Content,
	  Header,
	  Title,
	} from '@smui/drawer';
	import { Icon } from '@smui/tab';
  	import List, { Item, Text, Graphic, Separator, Subheader } from '@smui/list';
	import { goto, preloadData } from '$app/navigation';
    import { page } from '$app/state';
	import { leagueName } from '$lib/utils/helper';
	import { enableBlog, managers } from '$lib/utils/leagueInfo';

	let active = $state(page.url.pathname);

	let open = $state(false);

	const selectTab = (tab) => {
		open = false;
		goto(tab.dest);
	}
</script>

<style>
	:global(.menuIcon) {
		position: absolute;
		top: 15px;
		left: 15px;
		font-size: 2em;
		color: #888;
		padding: 6px;
		cursor: pointer;
		z-index: 1002; /* Above the fixed nav */
		transition: color 0.2s ease;
	}

	:global(.menuIcon:hover) {
		color: var(--blueOne);
	}

	:global(.nav-drawer) {
		z-index: 1050; /* High z-index for mobile drawer */
		top: 0 !important;
		left: 0 !important;
		height: 100vh !important;
		position: fixed !important;
	}

	:global(.nav-item) {
		color: #858585 !important;
	}

	.nav-back {
		position: fixed;
		z-index: 1049; /* Just below the drawer */
		width: 100%;
		width: 100vw;
		height: 100%;
		height: 100vh;
		top: 0;
		left: 0;
		background-color: rgba(0, 0, 0, 0.32);
		transition: all 0.7s;
	}

	/* Ensure drawer content fills the viewport */
	:global(.nav-drawer .mdc-drawer__content) {
		height: 100vh !important;
		overflow-y: auto !important;
	}

	/* Fix drawer header positioning */
	:global(.nav-drawer .mdc-drawer__header) {
		padding: 16px;
		border-bottom: 1px solid var(--blueOne);
	}
</style>

<Icon class="material-icons menuIcon" onclick={() => open = true} ripple={false} touch={true}>menu</Icon>

<div class="nav-back" style="pointer-events: {open ? "visible" : "none"}; opacity: {open ? 1 : 0};" onclick={() => open = false}></div>

<Drawer variant="modal" class="nav-drawer" fixed={true} bind:open>
	<Header>
		<Title>{leagueName}</Title>
	</Header>
	<Content>
		<List>
			{#each tabs as tab}
				{#if !tab.nest && (tab.label != 'Blog' || (tab.label == 'Blog' && enableBlog))}
					<Item href="javascript:void(0)" onSMUIAction={() => selectTab(tab)} ontouchstart={() => preloadData(tab.dest)} onmouseover={() => preloadData(tab.dest)} activated={active == tab.dest} >
						<Graphic class="material-icons{active == tab.dest ? "" : " nav-item"}" aria-hidden="true">{tab.icon}</Graphic>
						<Text class="{active == tab.dest ? "" : "nav-item"}">{tab.label}</Text>
					</Item>
				{/if}
			{/each}
			{#each tabs as tab}
				{#if tab.nest}
					<Separator />
					<Subheader>{tab.label}</Subheader>
					{#each tab.children as subTab}
						{#if subTab.label == 'Managers'}
							{#if managers.length}
								<Item href="javascript:void(0)" onSMUIAction={() => selectTab(subTab)} activated={active == subTab.dest}  ontouchstart={() => preloadData(subTab.dest)} onmouseover={() => preloadData(subTab.dest)}>
									<Graphic class="material-icons{active == subTab.dest ? "" : " nav-item"}" aria-hidden="true">{subTab.icon}</Graphic>
									<Text class="{active == subTab.dest ? "" : "nav-item"}">{subTab.label}</Text>
								</Item>
							{/if}
						{:else}
							<Item href="javascript:void(0)" onSMUIAction={() => selectTab(subTab)} activated={active == subTab.dest}  ontouchstart={() => {if(subTab.label != 'Go to Sleeper') preloadData(subTab.dest)}} onmouseover={() => {if(subTab.label != 'Go to Sleeper') preloadData(subTab.dest)}}>
								<Graphic class="material-icons{active == subTab.dest ? "" : " nav-item"}" aria-hidden="true">{subTab.icon}</Graphic>
								<Text class="{active == subTab.dest ? "" : "nav-item"}">{subTab.label}</Text>
							</Item>
						{/if}
					{/each}
				{/if}
			{/each}
		</List>
	</Content>
  </Drawer>
	
