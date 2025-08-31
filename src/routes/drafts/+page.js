import {
  getPreviousDrafts,
  getLeagueTeamManagers,
  loadPlayers,
} from "$lib/utils/helper";

export async function load({ fetch }) {
  const previousDraftsData = getPreviousDrafts();
  const leagueTeamManagersData = getLeagueTeamManagers();
  const playersData = loadPlayers(fetch);

  return {
    previousDraftsData,
    leagueTeamManagersData,
    playersData,
  };
}
