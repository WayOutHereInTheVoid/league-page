import { get } from "svelte/store";
import { nflState } from "$lib/stores";
import { cacheManager, CACHE_DURATIONS } from "$lib/utils/cacheManager";

/**
 * Retrieves the current state of the NFL (week, season phase, etc.) from Sleeper API.
 * Employs local caching and updates the Svelte store cache when possible.
 *
 * @returns {Promise<Object>} Current NFL state object.
 */
export const getNflState = async () => {
  if (get(nflState).season) {
    return get(nflState);
  }

  // Use cached fetch with automatic store updating
  const result = await cacheManager.cachedFetch(
    `https://api.sleeper.app/v1/state/nfl`,
    (data) => {
      nflState.update(() => data);
    },
    CACHE_DURATIONS.NFL_STATE,
    "nfl_state",
  );

  return result.data;
};
