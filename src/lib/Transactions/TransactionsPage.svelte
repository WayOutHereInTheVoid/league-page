<script>
	import Textfield from '@smui/textfield';
  	import Icon from '@smui/textfield/icon';
	import TradeTransaction from './TradeTransaction.svelte';
	import Button, { Label } from '@smui/button';
	import IconButton from '@smui/icon-button';
	import Pagination from '../Pagination.svelte';
	import { match } from 'fuzzyjs';
	import { goto } from '$app/navigation';
	import { getLeagueTransactions, loadPlayers, extractUniqueTeamsFromTransactions, createTeamLookupMap, generateTeamFilterOptions, filterTransactionsByTeamInvolvement } from '$lib/utils/helper';
	import WaiverTransaction from './WaiverTransaction.svelte';
	import DateGroup from './DateGroup.svelte';
	import TeamFilter from './TeamFilter.svelte';
	import { browser } from '$app/environment';

	export let show, playersInfo, query, queryPage, queryTeam = null, transactions, stale, perPage, postUpdate=false, leagueTeamManagers;
	const oldQuery = query;
	let page = queryPage || 0;

	const refreshTransactions = async () => {
		const newTransactions = await getLeagueTransactions(false, true);
		transactions = newTransactions.transactions;
	}

	if(stale) {
		refreshTransactions();
	}

	let players = playersInfo.players;

	const refreshPlayers = async () => {
		const newPlayersInfo = await loadPlayers(null, true);
		players = newPlayersInfo.players;
	}

	if(playersInfo.stale) {
		refreshPlayers();
	}

	// Team filter state management
	let selectedTeam = queryTeam !== null && queryTeam !== undefined ? parseInt(queryTeam) : null;
	let teamOptions = [];
	let teamLookupMap = new Map();
	let teamDataInitialized = false;

	// Initialize team filter data when transactions and teamManagers are available
	const initializeTeamFilter = () => {
		try {
			if (!transactions || !leagueTeamManagers || teamDataInitialized) {
				return;
			}

			// Extract teams from transaction history
			const extractionResult = extractUniqueTeamsFromTransactions(transactions, leagueTeamManagers);
			
			// Create lookup map for efficient filtering
			teamLookupMap = createTeamLookupMap(
				extractionResult.uniqueRosterIDs,
				leagueTeamManagers,
				leagueTeamManagers.currentSeason
			);
			
			// Generate options for dropdown
			teamOptions = generateTeamFilterOptions(teamLookupMap);
			
			teamDataInitialized = true;
			
			console.log(`Team filter initialized with ${teamOptions.length - 1} teams`); // -1 for "All Teams" option
			
		} catch (error) {
			console.error('Error initializing team filter:', error);
			// Provide safe fallback
			teamOptions = [{ value: null, label: "All Teams", avatar: null, managers: "", isHistorical: false }];
			teamDataInitialized = false;
		}
	};

	// Reactive initialization when data is available
	$: if (transactions && leagueTeamManagers) {
		initializeTeamFilter();
	}

	// Group state management system
	const GROUP_STATE_KEY = 'trl-date-group-states';
	let groupStates = {};

	// Load group states from localStorage
	const loadGroupStates = () => {
		if (!browser) return {};
		try {
			const saved = localStorage.getItem(GROUP_STATE_KEY);
			return saved ? JSON.parse(saved) : {};
		} catch (error) {
			console.warn('Could not load group states:', error);
			return {};
		}
	};

	// Save group states to localStorage
	const saveGroupStates = (states) => {
		if (!browser) return;
		try {
			localStorage.setItem(GROUP_STATE_KEY, JSON.stringify(states));
		} catch (error) {
			console.warn('Could not save group states:', error);
		}
	};

	// Initialize group states
	groupStates = loadGroupStates();

	// Handle group toggle
	const handleGroupToggle = (groupKey, expanded) => {
		groupStates[groupKey] = expanded;
		groupStates = { ...groupStates }; // Trigger reactivity
		saveGroupStates(groupStates);
	};

	// Get default state for a group (recent groups expanded by default)
	const getDefaultGroupState = (groupKey) => {
		const recentGroups = ['today', 'yesterday', 'thisWeek'];
		return recentGroups.includes(groupKey);
	};

	// filtered subset based on search
	let subsetTransactions = [];
	let totalTransactions = 0;

	const setFilter = (filterBy, transactions) => {
		if(filterBy == "both") {
			return transactions;
		} else {
			return transactions.filter( transaction => transaction.type == filterBy);
		}
	}

	// Enhanced filtering chain - applies type filter, then team filter
	$: typeFilteredTransactions = setFilter(show, transactions);
	$: filteredTransactions = selectedTeam !== null 
		? filterTransactionsByTeamInvolvement(typeFilteredTransactions, selectedTeam)
		: typeFilteredTransactions;

	// Enhanced intelligent date grouping logic
	const groupTransactionsByDate = (transactions) => {
		if (!transactions || transactions.length === 0) {
			return {};
		}

		// Reference points for intelligent grouping
		const now = new Date();
		const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		const yesterday = new Date(today);
		yesterday.setDate(yesterday.getDate() - 1);
		
		const thisWeekStart = new Date(today);
		thisWeekStart.setDate(today.getDate() - today.getDay()); // Start of current week (Sunday)
		
		const lastWeekStart = new Date(thisWeekStart);
		lastWeekStart.setDate(thisWeekStart.getDate() - 7);
		
		const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
		const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

		const groups = {};

		const getDateGroupKey = (transactionDate) => {
			const normalizedDate = new Date(transactionDate.getFullYear(), transactionDate.getMonth(), transactionDate.getDate());
			
			if (normalizedDate.getTime() === today.getTime()) return 'today';
			if (normalizedDate.getTime() === yesterday.getTime()) return 'yesterday';
			if (transactionDate >= thisWeekStart && transactionDate < today) return 'thisWeek';
			if (transactionDate >= lastWeekStart && transactionDate < thisWeekStart) return 'lastWeek';
			if (transactionDate >= thisMonthStart && transactionDate < today) return 'thisMonth';
			if (transactionDate >= lastMonthStart && transactionDate < thisMonthStart) return 'lastMonth';
			
			// For older transactions, group by month-year
			return transactionDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
		};

		transactions.forEach(transaction => {
			// Parse the transaction date - prioritize timestamp for accuracy
			let transactionDate;
			try {
				// Use timestamp if available (more reliable)
				if (transaction.timestamp) {
					transactionDate = new Date(transaction.timestamp);
				} else if (typeof transaction.date === 'string') {
					transactionDate = new Date(transaction.date);
				} else {
					transactionDate = new Date(transaction.date);
				}
				
				// Validate the parsed date
				if (isNaN(transactionDate.getTime())) {
					console.warn('Invalid transaction date:', transaction.date);
					transactionDate = new Date(); // Fallback to current date
				}
			} catch (e) {
				console.warn('Error parsing transaction date:', transaction.date, e);
				transactionDate = new Date(); // Fallback to current date
			}

			const groupKey = getDateGroupKey(transactionDate);
			
			if (!groups[groupKey]) {
				groups[groupKey] = {
					key: groupKey,
					transactions: [],
					count: 0,
					oldestDate: transactionDate,
					newestDate: transactionDate
				};
			}
			
			groups[groupKey].transactions.push(transaction);
			groups[groupKey].count++;
			
			// Track date range for the group
			if (transactionDate < groups[groupKey].oldestDate) {
				groups[groupKey].oldestDate = transactionDate;
			}
			if (transactionDate > groups[groupKey].newestDate) {
				groups[groupKey].newestDate = transactionDate;
			}
		});

		// Sort groups by logical order (newest first)
		const groupOrder = ['today', 'yesterday', 'thisWeek', 'lastWeek', 'thisMonth', 'lastMonth'];
		const sortedGroups = {};
		
		// Add groups in logical order
		groupOrder.forEach(key => {
			if (groups[key]) {
				sortedGroups[key] = groups[key];
			}
		});
		
		// Add remaining month-year groups (sorted newest first)
		Object.keys(groups)
			.filter(key => !groupOrder.includes(key))
			.sort((a, b) => {
				const dateA = new Date(groups[a].newestDate);
				const dateB = new Date(groups[b].newestDate);
				return dateB - dateA;
			})
			.forEach(key => {
				sortedGroups[key] = groups[key];
			});

		return sortedGroups;
	};

	const setQuery = (query, filteredTransactions) => {
		if(!filteredTransactions) {
			return [];
		}
		if(query && query.trim() != "") {
			subsetTransactions = filteredTransactions.filter( transaction => checkForQuery(transaction));
			totalTransactions = subsetTransactions.length;
		} else {
			subsetTransactions = filteredTransactions;
			totalTransactions = subsetTransactions.length;
		}

		const start = page * perPage;
		const end = (page + 1) * perPage;
		return subsetTransactions.slice(start, end);
	}
	
	$: displayTransactions = setQuery(query, filteredTransactions);
	$: groupedTransactions = groupTransactionsByDate(displayTransactions);

	const changePage = (dest, pageChange = false) => {
		if(queryPage == dest && pageChange) return;
		page = dest;
		if(dest > (filteredTransactions.length / perPage) || dest < 0) {
			page = 0;
		}
		displayTransactions = setQuery(query, filteredTransactions);
		if(postUpdate) {
            goto(`/transactions?show=${show}&query=${query}&page=${page+1}`, {noscroll: true,  keepfocus: true});
		}
	}

	let lastUpdate = new Date;
    let timer;

	const debounce = (dest) => {
		clearTimeout(timer);
		timer = setTimeout(() => {
            goto(dest,{noscroll: true,  keepfocus: true});
		}, 750);
	}

	const search = () => {
		lastUpdate = new Date;
		query = query.trimLeft();
		if(query.trim() == oldQuery) return;
		page = 0;
		if(postUpdate) {
            const dest = `/transactions?show=${show}&query=${query.trim()}&page=${page+1}`;
            debounce(dest);
		}
	}

	const clearSearch = () => {
		query = "";
		if(postUpdate) {
			goto(`/transactions?show=${show}&query=&page=${page+1}`, {noscroll: true,  keepfocus: true});
		}
	}
	
	const checkMatch = (query, name) => {
		const nameMatch = match(query, name)
		if(nameMatch.match && nameMatch.score > 0) {
			return true;
		}
	}

	// NEW: Enhanced multi-field search functions
	const checkPlayerMatch = (transaction, searchQuery) => {
		const moves = transaction.moves;
		for(const move of moves) {
			for(const col of move) {
				if(!col?.player) continue;
				const playerName = `${players[col.player].fn} ${players[col.player].ln}`;
				if (checkMatch(searchQuery, playerName)) {
					return true;
				}
			}
		}
		return false;
	}

	const checkTeamMatch = (transaction, searchQuery) => {
		if (!transaction.rosters || !leagueTeamManagers) return false;
		
		// Get the season for this transaction (default to current season)
		const transactionSeason = transaction.season || leagueTeamManagers.currentSeason;
		
		// Search through all teams involved in this transaction
		for (const rosterID of transaction.rosters) {
			const teamData = leagueTeamManagers.teamManagersMap?.[transactionSeason]?.[rosterID];
			if (teamData?.team?.name) {
				if (checkMatch(searchQuery, teamData.team.name)) {
					return true;
				}
			}
		}
		return false;
	}

	const checkManagerMatch = (transaction, searchQuery) => {
		if (!transaction.rosters || !leagueTeamManagers) return false;
		
		// Get the season for this transaction (default to current season)
		const transactionSeason = transaction.season || leagueTeamManagers.currentSeason;
		
		// Search through all managers involved in this transaction
		for (const rosterID of transaction.rosters) {
			const teamData = leagueTeamManagers.teamManagersMap?.[transactionSeason]?.[rosterID];
			if (teamData?.managers) {
				// Check each manager involved in this team
				for (const manager of teamData.managers) {
					if (manager?.display_name && checkMatch(searchQuery, manager.display_name)) {
						return true;
					}
				}
			}
		}
		return false;
	}

	// ENHANCED: Multi-field search function
	const checkForQuery = (transaction) => {
		// Search players (existing functionality)
		if (checkPlayerMatch(transaction, query)) return true;
		
		// Search team names (NEW)
		if (checkTeamMatch(transaction, query)) return true;
		
		// Search manager names (NEW) 
		if (checkManagerMatch(transaction, query)) return true;
		
		return false;
	}

	// NEW: Search term highlighting utility
	const highlightSearchTerms = (text, searchTerm) => {
		if (!searchTerm || !text) return text;
		
		// Escape special regex characters in search term
		const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		const regex = new RegExp(`(${escapedTerm})`, 'gi');
		
		return text.replace(regex, '<mark class="search-highlight">$1</mark>');
	}

	$: changePage(page, true);
	$: setQuery(query);

    let el;
    $: top = el?.getBoundingClientRect() ? el?.getBoundingClientRect().top  : 0;

	const setShow = (val) => {
		show = val;
		page = 0;
		changePage(0);
	}

	// Team filter change handler
	const handleTeamFilterChange = (event) => {
		selectedTeam = event.detail.selectedTeam;
		page = 0; // Reset pagination when filter changes
		if(postUpdate) {
			updateUrlParams();
		}
	};

	// Enhanced URL parameter update function
	const updateUrlParams = () => {
		const params = new URLSearchParams();
		params.set('show', show);
		params.set('query', query || '');
		params.set('page', (page + 1).toString());
		
		// Add team parameter only if a team is selected
		if (selectedTeam !== null && selectedTeam !== undefined) {
			params.set('team', selectedTeam.toString());
		}
		
		goto(`/transactions?${params.toString()}`, { noscroll: true, keepfocus: true });
	};
</script>

<style>
	.transactionsParent {
		display: flex;
		flex-wrap: wrap;
		position: relative;
		width: 100%;
		z-index: 1;
		overflow-y: hidden;
	}

	.transactions {
		flex-grow: 1;
		padding: 0 15px;
	}

	p {
		text-align: center;
	}

	h5 {
		text-align: center;
		margin: 30px auto 16px;
		color: var(--blueOne);
		font-weight: 600;
	}

	.buttons {
		margin: 40px auto 0;
	}

	:global(.disabled) {
		pointer-events: none;
	}

	.invis-buttons {
		display: none !important;
	}

	.searchContainer {
		width: 100%;
		text-align: center;
		margin: 2em 0 .5em;
	}

	.team-filter-container {
		width: 100%;
		display: flex;
		justify-content: center;
		margin: 1em 0 1.5em;
		padding: 0 15px;
	}

	.clearPlaceholder {
		width: 48px;
		display: inline-block;
	}
	
	.empty {
		width: 100%;
		font-style: italic;
		text-align: center;
		color: var(--g999);
		margin: 2rem 0;
		padding: 2rem;
		background: var(--f8f8f8);
		border-radius: 12px;
		border: 2px dashed var(--eee);
	}

	.date-groups-container {
		margin: 1rem 0;
	}

	.pagination-container {
		margin: 1.5rem 0;
		display: flex;
		justify-content: center;
	}

	.group-controls {
		display: flex;
		gap: 12px;
		justify-content: center;
		margin-bottom: 1rem;
	}

	.group-controls button {
		background: var(--blueOne);
		color: white;
		border: none;
		padding: 8px 16px;
		border-radius: 6px;
		cursor: pointer;
		font-size: 0.85rem;
		transition: all 0.2s ease;
	}

	.group-controls button:hover {
		background: var(--blueTwo);
		transform: translateY(-1px);
	}

	/* Enhanced mobile responsiveness for buttons */
	@media (max-width: 768px) {
		.transactions {
			padding: 0 8px;
		}
		
		.searchContainer {
			margin: 1.5em 0 .5em;
			padding: 0 8px;
		}
		
		h5 {
			font-size: 1.1rem;
			margin: 20px auto 12px;
		}

		.group-controls {
			gap: 8px;
			margin-bottom: 0.8rem;
		}

		.group-controls button {
			padding: 6px 12px;
			font-size: 0.8rem;
		}
	}

	@media (max-width: 480px) {
		.transactions {
			padding: 0 4px;
		}
		
		.searchContainer {
			padding: 0 4px;
		}
		
		.buttons {
			margin: 30px auto 0;
		}
		
		h5 {
			font-size: 1rem;
			margin: 16px auto 10px;
		}

		.group-controls {
			flex-direction: column;
			gap: 6px;
		}

		.group-controls button {
			padding: 8px 12px;
		}
	}

	/* Team Filter Mobile Styles */
	@media (max-width: 768px) {
		.team-filter-container {
			margin: 0.8em 0 1.2em;
			padding: 0 8px;
		}
	}

	@media (max-width: 480px) {
		.team-filter-container {
			margin: 0.6em 0 1em;
			padding: 0 4px;
		}
	}

	/* NEW: Search highlighting styles */
	:global(.search-highlight) {
		background-color: var(--highlight-bg, #ffeb3b);
		color: var(--highlight-text, #000);
		padding: 1px 2px;
		border-radius: 2px;
		font-weight: 500;
	}

	/* Dark mode search highlighting */
	@media (prefers-color-scheme: dark) {
		:global(.search-highlight) {
			background-color: var(--highlight-bg-dark, #ff9800);
			color: var(--highlight-text-dark, #fff);
		}
	}
</style>

<div class="transactionsParent">
	<div class="buttons {show == "trade" ? "" : "invis-buttons"}">
		<Button class="{show == "trade" ? "disabled" : ""}" color="primary" onclick={() => setShow("trade")} variant="{show == "trade" ? "raised" : "outlined"}" touch>
			<Label>Trades</Label>
		</Button>
		<Button class="{show == "waiver" ? "disabled" : ""}" color="primary" onclick={() => setShow("waiver")} variant="{show == "waiver" ? "raised" : "outlined"}" touch>
			<Label>Waivers</Label>
		</Button>
		<Button class="{show == "both" ? "disabled" : ""}" color="primary" onclick={() => setShow("both")} variant="{show == "both" ? "raised" : "outlined"}" touch>
			<Label>Both</Label>
		</Button>
	</div>
	<div class="buttons {show == "waiver" ? "" : "invis-buttons"}">
		<Button class="{show == "trade" ? "disabled" : ""}" color="primary" onclick={() => setShow("trade")} variant="{show == "trade" ? "raised" : "outlined"}" touch>
			<Label>Trades</Label>
		</Button>
		<Button class="{show == "waiver" ? "disabled" : ""}" color="primary" onclick={() => setShow("waiver")} variant="{show == "waiver" ? "raised" : "outlined"}" touch>
			<Label>Waivers</Label>
		</Button>
		<Button class="{show == "both" ? "disabled" : ""}" color="primary" onclick={() => setShow("both")} variant="{show == "both" ? "raised" : "outlined"}" touch>
			<Label>Both</Label>
		</Button>
	</div>
	<div class="buttons {show == "both" ? "" : "invis-buttons"}">
		<Button class="{show == "trade" ? "disabled" : ""}" color="primary" onclick={() => setShow("trade")} variant="{show == "trade" ? "raised" : "outlined"}" touch>
			<Label>Trades</Label>
		</Button>
		<Button class="{show == "waiver" ? "disabled" : ""}" color="primary" onclick={() => setShow("waiver")} variant="{show == "waiver" ? "raised" : "outlined"}" touch>
			<Label>Waivers</Label>
		</Button>
		<Button class="{show == "both" ? "disabled" : ""}" color="primary" onclick={() => setShow("both")} variant="{show == "both" ? "raised" : "outlined"}" touch>
			<Label>Both</Label>
		</Button>
	</div>
	<div class="searchContainer">
		<span class="clearPlaceholder"></span>
		<Textfield
			class="shaped-outlined"
			variant="outlined"
			bind:value={query}
			label="Search players, teams, managers..."
			on:input={() => search()}
		>
			<Icon class="material-icons" slot="leadingIcon">search</Icon>
		</Textfield>
		{#if query.length > 0}
			  <IconButton class="material-icons" onclick={() => clearSearch()}>clear</IconButton>
		{:else}
			<span class="clearPlaceholder"></span>
		{/if}
	</div>

	<!-- Team Filter Section -->
	{#if teamOptions.length > 1}
		<div class="team-filter-container">
			<TeamFilter 
				{teamOptions}
				bind:selectedTeam
				on:teamchange={handleTeamFilterChange}
				disabled={transactions.length === 0}
			/>
		</div>
	{/if}

	<div class="transactions" bind:this={el}>
		{#if show == "both"}
			<h5>Recent Transactions</h5>
		{:else if show == "trade"}
			<h5>Recent Trades</h5>
		{:else}
			<h5>Recent Waivers</h5>
		{/if}

		<div class="pagination-container">
			<Pagination {perPage} total={totalTransactions} bind:page={page} target={top} scroll={false} />
		</div>

		{#if Object.keys(groupedTransactions).length > 0}
			<div class="group-controls">
				<button on:click={() => {
					Object.keys(groupedTransactions).forEach(key => {
						groupStates[key] = true;
					});
					groupStates = { ...groupStates };
					saveGroupStates(groupStates);
				}}>
					Expand All
				</button>
				<button on:click={() => {
					Object.keys(groupedTransactions).forEach(key => {
						groupStates[key] = false;
					});
					groupStates = { ...groupStates };
					saveGroupStates(groupStates);
				}}>
					Collapse All
				</button>
			</div>
		{/if}

		<div class="date-groups-container">
			{#if Object.keys(groupedTransactions).length > 0}
				{#each Object.entries(groupedTransactions) as [groupKey, groupData] (groupKey)}
					<DateGroup 
						dateKey={groupKey}
						transactionCount={groupData.count}
						expanded={groupStates[groupKey] !== undefined ? groupStates[groupKey] : getDefaultGroupState(groupKey)}
						on:toggle={(e) => handleGroupToggle(groupKey, e.detail.expanded)}
					>
						{#each groupData.transactions as transaction (transaction.id)}
							{#if transaction.type == "waiver"}
								<WaiverTransaction {players} {transaction} {leagueTeamManagers} searchQuery={query} {highlightSearchTerms} />
							{:else}
								<TradeTransaction {players} {transaction} {leagueTeamManagers} searchQuery={query} {highlightSearchTerms} />
							{/if}
						{/each}
					</DateGroup>
				{/each}
			{/if}
		</div>

		<div class="pagination-container">
			<Pagination {perPage} total={totalTransactions} bind:page={page} target={top} scroll={true} />
		</div>
	</div>

	{#if totalTransactions == 0}
		{#if show == "trade"}
			<p class="empty">{query.trim() != "" ? "No trades match your search" : "Nobody has made any trades yet... that's just sad" }</p>
		{:else if show == "waiver"}
			<p class="empty">{query.trim() != "" ? "No waivers match your search" : "Nobody has made any waiver wire moves yet... that's just sad" }</p>
		{:else}
			<p class="empty">{query.trim() != "" ? "No transactions match your search" : "Nobody has made any moves yet... that's just sad" }</p>
		{/if}
	{/if}
</div>
