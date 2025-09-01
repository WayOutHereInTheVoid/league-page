import { getLeagueData } from './leagueData';
import { getLeagueRosters } from './leagueRosters';
import { getLeagueUsers } from './leagueUsers';
import { waitForAll } from './multiPromise';
import { get } from 'svelte/store';
import { powerRankingsStore }
from '$lib/stores';
import { leagueID } from '$lib/utils/leagueInfo';
import {
    winsOnWeek,
    getPowerRanking
} from './advancedStats';
import pkg from 'lodash';
const { mean, max, min } = pkg;
export const getPowerRankings = async (preview) => {
    if (get(powerRankingsStore).rankings) {
        return get(powerRankingsStore);
    }
    const [leagueData, rostersData, usersData] = await waitForAll(
        getLeagueData(),
        getLeagueRosters(),
        getLeagueUsers()
    ).catch((err) => {
        console.error(err);
    });
    const year = leagueData.season;
    const regularSeasonLength = leagueData.settings.playoff_week_start - 1;
    const rosters = rostersData.rosters;
    const users = usersData.users;
    const week = regularSeasonLength;
    const matchupsPromises = [];
    for (let i = 1; i <= week; i++) {
        matchupsPromises.push(fetch(`https://api.sleeper.app/v1/league/${leagueID}/matchups/${i}`, {
            compress: true
        }))
    }
    const matchupsRes = await waitForAll(...matchupsPromises);
    const matchupsJsonPromises = [];
    for (const matchupRes of matchupsRes) {
        const data = matchupRes.json();
        matchupsJsonPromises.push(data)
        if (!matchupRes.ok) {
            throw new Error(data);
        }
    }
    const matchupsData = await waitForAll(...matchupsJsonPromises).catch((err) => {
        console.error(err);
    });
    const processedStats = processStats(matchupsData, rosters, users, regularSeasonLength);
    const response = {
        rankings: processedStats,
        year,
        regularSeasonLength
    }
    powerRankingsStore.update(() => response);
    return response;
}
const processStats = (matchupsData, rosters, users, regularSeasonLength) => {
    const processedStats = {};
    for (const rosterID in rosters) {
        const user = users[rosters[rosterID].owner_id];
        processedStats[rosterID] = {
            manager: {
                name: user.metadata.team_name ? user.metadata.team_name : user.display_name,
                avatar: `https://sleepercdn.com/avatars/thumbs/${user.avatar}`,
            },
            stats: {
                wins: rosters[rosterID].settings.wins,
                losses: rosters[rosterID].settings.losses,
                ties: rosters[rosterID].settings.ties,
                fpts: rosters[rosterID].settings.fpts + rosters[rosterID].settings.fpts_decimal / 100,
            },
            points: [],
            recordByWeek: [],
        }
    }
    for (let i = 1; i <= regularSeasonLength; i++) {
        const weeklyMatchups = matchupsData[i - 1];
        const matchups = {};
        for (const matchup of weeklyMatchups) {
            if (!matchups[matchup.matchup_id]) {
                matchups[matchup.matchup_id] = [];
            }
            matchups[matchup.matchup_id].push({
                rosterID: matchup.roster_id,
                points: matchup.points,
            })
        }
        for (const matchupKey in matchups) {
            const teamA = matchups[matchupKey][0];
            const teamB = matchups[matchupKey][1];
            if (teamA.points > teamB.points) {
                processedStats[teamA.rosterID].recordByWeek.push("W");
                processedStats[teamB.rosterID].recordByWeek.push("L");
            } else if (teamB.points > teamA.points) {
                processedStats[teamB.rosterID].recordByWeek.push("W");
                processedStats[teamA.rosterID].recordByWeek.push("L");
            } else {
                processedStats[teamB.rosterID].recordByWeek.push("T");
                processedStats[teamA.rosterID].recordByWeek.push("T");
            }
            processedStats[teamA.rosterID].points.push(teamA.points);
            processedStats[teamB.rosterID].points.push(teamB.points);
        }
    }
    for (const rosterID in processedStats) {
        const weeklyPowerRankings = [];
        for (let i = 0; i < regularSeasonLength; i++) {
            const currentWins = winsOnWeek(processedStats[rosterID].recordByWeek, i);
            const currentLosses = (i + 1) - currentWins;
            const winPer = currentWins / (currentWins + currentLosses);
            const points = processedStats[rosterID].points.slice(0, i + 1);
            const powerRanking = getPowerRanking(mean(points), max(points), min(points), winPer);
            weeklyPowerRankings.push(powerRanking);
        }
        processedStats[rosterID].weeklyPowerRankings = weeklyPowerRankings;
        processedStats[rosterID].powerRanking = weeklyPowerRankings[weeklyPowerRankings.length - 1];
    }
    return processedStats;
}
