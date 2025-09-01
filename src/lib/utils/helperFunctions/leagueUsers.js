import { leagueID } from '$lib/utils/leagueInfo';
import { get } from 'svelte/store';
import { usersStore } from '$lib/stores';
import { cacheManager, CACHE_DURATIONS } from '$lib/utils/cacheManager';

export const getLeagueUsers = async (queryLeagueID = leagueID) => {
    const storedUsers = get(usersStore)[queryLeagueID];
    if (storedUsers) {
        return storedUsers;
    }

    const result = await cacheManager.cachedFetch(
        `https://api.sleeper.app/v1/league/${queryLeagueID}/users`,
        (data) => {
            const processedUsers = processUsers(data);
            usersStore.update(u => {
                u[queryLeagueID] = processedUsers;
                return u;
            });
        },
        CACHE_DURATIONS.USERS,
        'league_users',
        { leagueID: queryLeagueID }
    );

    let processedData = result.data;
    if (Array.isArray(result.data)) {
        processedData = processUsers(result.data);
        if (result.fromCache) {
            usersStore.update(u => {
                u[queryLeagueID] = processedData;
                return u;
            });
        }
    }

    return processedData;
}

const processUsers = (users) => {
    const userMap = {};
    for (const user of users) {
        userMap[user.user_id] = user;
    }
    return { users: userMap };
}
