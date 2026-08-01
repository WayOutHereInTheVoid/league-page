import { writable } from "svelte/store";

/**
 * @file Svelte Stores Module.
 * Defines centralized, reactive writable store hooks for sharing state
 * (such as league data, standings, transactions, and news) throughout components.
 */

/**
 * Store holding compiled league awards and podium data.
 * @type {import('svelte/store').Writable<Object>}
 */
export const awards = writable({});

/**
 * Store holding general configuration settings for cached Sleeper leagues, indexed by league ID.
 * @type {import('svelte/store').Writable<Object>}
 */
export const leagueData = writable({});

/**
 * Store holding predicted or confirmed upcoming draft grid data.
 * @type {import('svelte/store').Writable<Object>}
 */
export const upcomingDraft = writable({});

/**
 * Store holding lists of completed past draft boards per season.
 * @type {import('svelte/store').Writable<Array>}
 */
export const previousDrafts = writable([]);

/**
 * Store holding processed weekly regular season matchups data.
 * @type {import('svelte/store').Writable<Object>}
 */
export const matchupsStore = writable({});

/**
 * Store holding regular season and playoff record books.
 * @type {import('svelte/store').Writable<Object>}
 */
export const records = writable({});

/**
 * Store holding rosters maps and starter/reserve lists, indexed by league ID.
 * @type {import('svelte/store').Writable<Object>}
 */
export const rostersStore = writable({});

/**
 * Store holding transaction lists and manager trade/waiver metrics.
 * @type {import('svelte/store').Writable<Object>}
 */
export const transactionsStore = writable({});

/**
 * Store holding mapped team manager configurations and normalized users databases.
 * @type {import('svelte/store').Writable<Object>}
 */
export const teamManagersStore = writable({});

/**
 * Store holding the active NFL state (display week, season type, year).
 * @type {import('svelte/store').Writable<Object>}
 */
export const nflState = writable({});

/**
 * Store holding the complete calculated NFL players database.
 * @type {import('svelte/store').Writable<Object>}
 */
export const players = writable({});

/**
 * Store holding current combined fantasy football RSS and Reddit news articles.
 * @type {import('svelte/store').Writable<Array>}
 */
export const news = writable([]);

/**
 * Store holding sorted Contentful blog post items list.
 * @type {import('svelte/store').Writable<Array>}
 */
export const posts = writable([]);

/**
 * Store holding processed playoff winner/loser bracket maps.
 * @type {import('svelte/store').Writable<Object>}
 */
export const brackets = writable({});

/**
 * Store holding calculated active league standings.
 * @type {import('svelte/store').Writable<Object>}
 */
export const standingsStore = writable({});
