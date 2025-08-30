import {
  getLeagueStandings,
  getLeagueTeamManagers,
  getLeagueData,
} from "$lib/utils/helper";
import {
  getWeeklyPoints,
  createTableData,
} from "$lib/utils/helperFunctions/advancedStats";

export async function load() {
  const leagueData = await getLeagueData();
  const standingsData = await getLeagueStandings();
  const leagueTeamManagersData = await getLeagueTeamManagers();
  const weeklyPoints = await getWeeklyPoints(
    leagueData.league_id,
    leagueData.settings.playoff_week_start - 1,
  );

  const processedStats = createTableData(
    leagueTeamManagersData.users,
    standingsData.standingsInfo,
    weeklyPoints,
    leagueData.settings.league_average_match,
  );

  return {
    standingsData,
    leagueTeamManagersData,
    processedStats,
  };
}
