<script>
	import Textfield from '@smui/textfield';
  	import Icon from '@smui/textfield/icon';
	import TradeTransaction from './TradeTransaction.svelte';
	import Button, { Label } from '@smui/button';
	import IconButton from '@smui/icon-button';
	import Pagination from '../Pagination.svelte';
	import { match } from 'fuzzyjs';
	import { goto } from '$app/navigation';
	import { getLeagueTransactions, loadPlayers } from '$lib/utils/helper';
	import WaiverTransaction from './WaiverTransaction.svelte';
	import DateGroup from './DateGroup.svelte';

	export let show, playersInfo, query, queryPage, transactions, stale, perPage, postUpdate=false, leagueTeamManagers;
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

	// filtered subset based on filter
	$: filteredTransactions = setFilter(show, transactions);

	// Date grouping logic
	const groupTransactionsByDate = (transactions) => {
		if (!transactions || transactions.length === 0) {
			return {};
		}

		const groups = {};
		
		transactions.forEach(transaction => {
			// Parse the transaction date - handle different date formats
			let transactionDate;
			try {
				// Handle both date objects and strings
				if (typeof transaction.date === 'string') {
					// Try to parse common date formats
					const dateStr = transaction.date;
					// Handle formats like "January 15, 2024" or "1/15/2024" etc.
					transactionDate = new Date(dateStr);
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

			// Create a date key for grouping (YYYY-MM-DD format)
			const dateKey = transactionDate.toISOString().split('T')[0];
			
			if (!groups[dateKey]) {
				groups[dateKey] = [];
			}
			groups[dateKey].push(transaction);
		});

		// Sort groups by date (newest first)
		const sortedGroups = {};
		Object.keys(groups)
			.sort((a, b) => new Date(b) - new Date(a))
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
			(nameMatch.score);
			return true;
		}
	}

	const checkForQuery = (transaction) => {
		const moves = transaction.moves;
		for(const move of moves) {
			for(const col of move) {
				if(!col?.player) continue;
				return checkMatch(query, `${players[col.player].fn} ${players[col.player].ln}`);
			}
		}
		return false;
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
			label="Search for a player..."
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

		<div class="date-groups-container">
			{#if Object.keys(groupedTransactions).length > 0}
				{#each Object.entries(groupedTransactions) as [dateKey, dateTransactions] (dateKey)}
					<DateGroup 
						{dateKey} 
						transactionCount={dateTransactions.length}
						expanded={true}
					>
						{#each dateTransactions as transaction (transaction.id)}
							{#if transaction.type == "waiver"}
								<WaiverTransaction {players} {transaction} {leagueTeamManagers} />
							{:else}
								<TradeTransaction {players} {transaction} {leagueTeamManagers} />
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
