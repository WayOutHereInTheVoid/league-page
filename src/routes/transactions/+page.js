import {
  getLeagueTransactions,
  loadPlayers,
  getLeagueTeamManagers,
} from "$lib/utils/helper";

export async function load({ url, fetch }) {
  const show = url?.searchParams?.get("show");
  const query = url?.searchParams?.get("query");
  const curPage = url?.searchParams?.get("page");
  const team = url?.searchParams?.get("team");

  const transactionsData = getLeagueTransactions(false);
  const leagueTeamManagersData = getLeagueTeamManagers();

  const playersData = loadPlayers(fetch);

  const bannedValued = ["undefined"];

  const props = {
    show: "both",
    query: "",
    playersData,
    transactionsData,
    leagueTeamManagersData,
    page: 0,
    team: null,
  };
  if (show && (show == "trade" || show == "waiver" || show == "both")) {
    props.show = show;
  }
  if (query && !bannedValued.includes(query)) {
    props.query = query;
  }
  if (curPage && !isNaN(curPage)) {
    props.page = parseInt(curPage) - 1;
  }
  if (team && !isNaN(team)) {
    props.team = parseInt(team);
  }
  return props;
}
