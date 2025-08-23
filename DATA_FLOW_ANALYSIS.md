# Sleeper API Data Flow Analysis

This document provides a deep dive into the data flow of the application, from the initial API calls to the Sleeper API to how the data is used in the Svelte components.

## 1. Data Fetching and Caching

The core of the data fetching logic resides in the `src/lib/utils/helperFunctions` directory. Each file in this directory is responsible for fetching a specific type of data from the Sleeper API. For example:

- `leagueData.js`: Fetches general league information.
- `leagueRosters.js`: Fetches team rosters.
- `leagueTransactions.js`: Fetches league transactions.

All API calls go through a centralized caching mechanism defined in `src/lib/utils/cacheManager.js`. This `CacheManager` class uses `localStorage` to cache API responses, which significantly improves performance and reduces the number of requests to the Sleeper API.

The `cachedFetch` method in `CacheManager` is the primary method used for fetching data. Its logic is as follows:

1.  **Check Cache:** It first checks for a valid (non-expired) cache entry in `localStorage`.
2.  **Return Cached Data:** If a valid cache entry is found, the data is returned immediately.
3.  **Handle Stale Data:** If the cached data is stale (expired), it is returned to the user, but a background refresh is triggered to fetch fresh data from the API.
4.  **Fetch Fresh Data:** If no cache entry is found, it fetches fresh data from the API, caches it in `localStorage` with an expiration time, and then returns it.

This caching strategy ensures that the application is fast and responsive, even on slower network connections.

## 2. Data Storage with Svelte Stores

Once the data is fetched (either from the cache or the API), it is stored in Svelte stores. These stores are defined in `src/lib/stores.js` and serve as the single source of truth for the application's data.

Some of the key stores include:

- `leagueData`: Stores general league information.
- `rostersStore`: Stores team rosters.
- `transactionsStore`: Stores league transactions.
- `matchupsStore`: Stores matchup data.
- `players`: Stores player information.

The helper functions in `src/lib/utils/helperFunctions` are responsible for updating these stores with the data they fetch.

## 3. Data Consumption in Svelte Components

The Svelte components and pages throughout the application subscribe to these stores to get the data they need. They use the `$` prefix to reactively access the store's value.

For example, the standings page might use the `$rostersStore` and `$leagueData` stores to display the current league standings. When the data in these stores is updated, the standings page will automatically re-render to reflect the changes.

This reactive data flow makes the UI of the application very dynamic and ensures that it always displays the most up-to-date information.

## Data Flow Diagram

```
[Sleeper API] -> [CacheManager (cachedFetch)] -> [Helper Functions] -> [Svelte Stores] -> [Svelte Components/Pages]
```

This data flow is efficient, scalable, and easy to maintain. The centralized caching layer and the use of Svelte stores make the application fast and responsive, while the helper functions keep the data fetching logic organized and modular.
