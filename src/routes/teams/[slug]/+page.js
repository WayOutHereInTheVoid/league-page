import { trlTeams, slugToRosterId } from '$lib/utils/leagueInfo.js';
import {
    waitForAll,
    getLeagueRosters,
    getLeagueTeamManagers,
    getLeagueData,
    getLeagueTransactions,
    getAwards,
    getLeagueRecords,
    managers,
} from '$lib/utils/helper';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
    const { slug } = params;

    const rosterId = slugToRosterId[slug];
    if (rosterId === undefined) {
        throw error(404, `Team not found: ${slug}`);
    }

    const team = trlTeams[rosterId];

    // managers array in leagueInfo.js is ordered by roster_id (roster 1 = index 0).
    const managerIndex = rosterId - 1;

    if (!managers.length) {
        return { team, rosterId, manager: -1, managers, managersInfo: null };
    }

    const managersInfo = waitForAll(
        getLeagueRosters(),
        getLeagueTeamManagers(),
        getLeagueData(),
        getLeagueTransactions(),
        getAwards(),
        getLeagueRecords(),
    );

    return {
        team,
        rosterId,
        manager: managerIndex >= 0 && managerIndex < managers.length ? managerIndex : -1,
        managers,
        managersInfo,
    };
}
