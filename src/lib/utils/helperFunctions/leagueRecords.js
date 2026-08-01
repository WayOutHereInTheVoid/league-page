import { getLeagueData } from "./leagueData";
import { leagueID } from "$lib/utils/leagueInfo";
import { getNflState } from "./nflState";
import { getLeagueRosters } from "./leagueRosters";
import { waitForAll } from "./multiPromise";
import { get } from "svelte/store";
import { records } from "$lib/stores";
import { getManagers, round, sortHighAndLow } from "./universalFunctions";
import { Records } from "$lib/utils/dataClasses";
import { getBrackets } from "./leagueBrackets";
import { browser } from "$app/environment";

/**
 * Traverses historical seasons from the active Sleeper league ID backward and processes
 * detailed regular season and post-season fantasy data to compute and compile historical league records.
 *
 * @param {boolean} [refresh=false] - True to force a fresh traversal and API calculation, bypassing stored local results.
 * @returns {Promise<Object>} Aggregated regular season and playoff record books.
 */
export const getLeagueRecords = async (refresh = false) => {
  // records temporarily cached for an individual session
  if (get(records).leagueWeekHighs) {
    return get(records);
  }

  // if this isn't a refresh data call, check if there are already
  // transactions stored in localStorage (long term)
  if (!refresh && browser) {
    let localRecords = await JSON.parse(localStorage.getItem("records"));
    // check if transactions have been saved to localStorage before
    if (localRecords && localRecords.playoffData) {
      localRecords.stale = true;
      return localRecords;
    }
  }

  // get info about the current NFL season (week and season type)
  const nflState = await getNflState().catch((err) => {
    console.error(err);
  });
  let week = 0;
  if (nflState.season_type == "regular") {
    week = nflState.week - 1;
  } else if (nflState.season_type == "post") {
    week = 18;
  }

  // initiate current season to be your current
  // league page leagueID
  let curSeason = leagueID;

  // currentYear will eventually be assigned as the most recent year
  // that has record information (current season if past week 1,
  // previous season if not)
  let currentYear;

  // lastYear gets updated as it loops through each season, so that
  // it will eventually be set to the last year that records exist
  let lastYear;

  // regularSeason is a Records class that stores all the data
  // necessary to display regular season records
  let regularSeason = new Records();

  // playoffRecords is a Records class that stores all the data
  // necessary to display playoff records
  let playoffRecords = new Records();

  // loop through each season until the previous_league_id becomes null (or in some cases 0)
  while (curSeason && curSeason != 0) {
    const [rosterRes, leagueData] = await waitForAll(
      getLeagueRosters(curSeason),
      getLeagueData(curSeason),
    ).catch((err) => {
      console.error(err);
    });

    const rosters = rosterRes.rosters;

    // on first run, week is provided above from nflState,
    // after that get the final week of regular season from leagueData
    if (
      leagueData.status == "complete" ||
      week > leagueData.settings.playoff_week_start - 1
    ) {
      week = 99; // set it high
    }

    // regular season data
    const { season, year } = await processRegularSeason({
      leagueData,
      rosters,
      curSeason,
      week,
      regularSeason,
    });

    // post season data
    const pS = await processPlayoffs({
      year,
      curSeason,
      week,
      playoffRecords,
      rosters,
    });

    if (pS) {
      playoffRecords = pS; // update the regular season records
    }

    lastYear = year;

    if (!currentYear && year) {
      currentYear = year;
    }

    curSeason = season;
  }

  playoffRecords.currentYear = regularSeason.currentYear;
  playoffRecords.lastYear = regularSeason.lastYear;

  regularSeason.finalizeAllTimeRecords({ currentYear, lastYear });
  playoffRecords.finalizeAllTimeRecords({ currentYear, lastYear });

  const regularSeasonData = regularSeason.returnRecords();
  const playoffData = playoffRecords.returnRecords();

  const recordsData = { regularSeasonData, playoffData };

  if (browser) {
    // update localStorage
    localStorage.setItem("records", JSON.stringify(recordsData));

    records.update(() => recordsData);
  }

  return recordsData;
};

/**
 * Processes a single season's regular season data by retrieving and mapping matchups per week.
 *
 * @param {Object} params - Context variables.
 * @param {Object} params.leagueData - Sleeper general league configuration data.
 * @param {Object} params.rosters - Roster configuration mapping.
 * @param {string} params.curSeason - Active league ID string.
 * @param {number} params.week - Current week count.
 * @param {Records} params.regularSeason - Records object storing regular season results.
 * @returns {Promise<{season: string, year: number|null}>} The preceding league ID and the calculated year.
 */
const processRegularSeason = async ({
  rosters,
  leagueData,
  curSeason,
  week,
  regularSeason,
}) => {
  let year = parseInt(leagueData.season);

  // on first run, week is provided above from nflState,
  // after that get the final week of regular season from leagueData
  if (
    leagueData.status == "complete" ||
    week > leagueData.settings.playoff_week_start - 1
  ) {
    week = leagueData.settings.playoff_week_start - 1;
  }

  for (const rosterID in rosters) {
    analyzeRosters({ year, roster: rosters[rosterID], regularSeason });
  }

  // loop through each week of the season
  const matchupsPromises = [];
  let startWeek = parseInt(week);
  while (week > 0) {
    matchupsPromises.push(
      fetch(`https://api.sleeper.app/v1/league/${curSeason}/matchups/${week}`, {
        compress: true,
      }),
    );
    week--;
  }

  const matchupsRes = await waitForAll(...matchupsPromises).catch((err) => {
    console.error(err);
  });

  // convert the json matchup responses
  const matchupsJsonPromises = [];
  for (const matchupRes of matchupsRes) {
    const data = matchupRes.json();
    matchupsJsonPromises.push(data);
    if (!matchupRes.ok) {
      console.error(data);
    }
  }
  const matchupsData = await waitForAll(...matchupsJsonPromises).catch(
    (err) => {
      console.error(err);
    },
  );

  // now that we've used the current season ID for everything we need, set it to the previous season
  curSeason = leagueData.previous_league_id;

  let seasonPointsRecord = [];
  let matchupDifferentials = [];

  // process all the matchups
  for (const matchupWeek of matchupsData) {
    const { sPR, mD, sW } = processMatchups({
      matchupWeek,
      seasonPointsRecord,
      record: regularSeason,
      startWeek,
      matchupDifferentials,
      year,
    });
    seasonPointsRecord = sPR;
    matchupDifferentials = mD;
    startWeek = sW;
  }

  // sort matchup differentials
  const [biggestBlowouts, closestMatchups] = sortHighAndLow(
    matchupDifferentials,
    "differential",
  );

  // sort season point records
  const [seasonPointsHighs, seasonPointsLows] = sortHighAndLow(
    seasonPointsRecord,
    "fpts",
  );

  // add matchupDifferentials to tha all time  records
  regularSeason.addAllTimeMatchupDifferentials(matchupDifferentials);

  if (seasonPointsHighs.length > 0) {
    regularSeason.addSeasonWeekRecord({
      year,
      biggestBlowouts,
      closestMatchups,
      seasonPointsLows,
      seasonPointsHighs,
    });
  } else {
    year = null;
  }

  return {
    season: curSeason,
    year,
  };
};

/**
 * Analyzes an individual roster settings entry and updates the regularSeason accumulators.
 *
 * @param {Object} params - Context variables.
 * @param {number} params.year - The season year.
 * @param {Object} params.roster - The individual roster settings data.
 * @param {Records} params.regularSeason - Records object storing accumulated details.
 * @returns {void}
 */
const analyzeRosters = ({ year, roster, regularSeason }) => {
  // team name and logo are tied to the ownerID
  const rosterID = roster.roster_id;

  const managers = getManagers(roster);

  // season hasn't started, no records to obtain
  if (
    roster.settings.wins == 0 &&
    roster.settings.ties == 0 &&
    roster.settings.losses == 0
  )
    return;

  // fptsFor and fptsPerGame are used for both rosterRecords and seasonLongPoints
  const fptsFor = roster.settings.fpts + roster.settings.fpts_decimal / 100;
  const fptsPerGame = round(
    fptsFor /
      (roster.settings.wins + roster.settings.losses + roster.settings.ties),
  );

  const rosterRecords = {
    wins: roster.settings.wins,
    losses: roster.settings.losses,
    ties: roster.settings.ties,
    fptsFor,
    fptsAgainst:
      roster.settings.fpts_against + roster.settings.fpts_against_decimal / 100,
    fptsPerGame,
    potentialPoints: roster.settings.ppts + roster.settings.ppts_decimal / 100,
    rosterID,
    year,
  };

  // update the roster records for this roster ID
  regularSeason.updateManagerRecord(managers, rosterRecords);

  // add season long points entry
  regularSeason.addSeasonLongPoints({
    rosterID,
    fpts: fptsFor,
    fptsPerGame,
    year,
  });
};

/**
 * Processes weekly matchups data, updating accumulated week scores and recording weekly high/lows.
 *
 * @param {Object} params - Context variables.
 * @param {Object[]} params.matchupWeek - List of matchups for the week.
 * @param {Object[]} params.seasonPointsRecord - Accumulated list of weekly point records.
 * @param {Records} params.record - Records storage container.
 * @param {number|string} params.startWeek - Current week label or count.
 * @param {Object[]} params.matchupDifferentials - Accumulated list of matchup differentials.
 * @param {number} params.year - The current year.
 * @returns {Object} Processed points, differentials, and week index.
 */
const processMatchups = ({
  matchupWeek,
  seasonPointsRecord,
  record,
  startWeek,
  matchupDifferentials,
  year,
}) => {
  let matchups = {};

  // only used when building post season record
  let pSD = {};

  for (const matchup of matchupWeek) {
    // exit if there's no roster ID
    const rosterID = matchup.roster_id;
    if (!rosterID) continue;

    let mID = matchup.matchup_id;

    if (!mID) {
      if (!pSD[rosterID]) {
        pSD[rosterID] = {
          wins: 0,
          losses: 0,
          ties: 0,
          fptsFor: 0,
          fptsAgainst: 0,
          potentialPoints: 0,
          fptspg: 0,
          pOGames: 0,
          byes: 0,
        };
      }
      pSD[rosterID].pOGames = 1;
      const m = matchup.m;
      if (!m) {
        pSD[rosterID].byes = 1;
        continue;
      }
      mID = `PS:${m}`;
    }

    const entry = {
      rosterID,
      fpts: matchup.points,
      week: startWeek,
      year,
    };

    // add each entry to the matchup object
    if (!matchups[mID]) {
      matchups[mID] = [];
    }
    matchups[mID].push(entry);
    record.addLeagueWeekRecord(entry);
    seasonPointsRecord.push(entry);
  }
  startWeek--;

  // create matchup differentials from matchups obj
  for (const matchupKey in matchups) {
    const matchup = matchups[matchupKey];
    let home = matchup[0];
    let away = matchup[1];

    // if there are no teams or only one, continue
    if (!away || !home) continue;

    if (home.fpts < away.fpts) {
      home = matchup[1];
      away = matchup[0];
    }
    const matchupDifferential = {
      year: home.year,
      week: home.week,
      home: {
        rosterID: home.rosterID,
        fpts: home.fpts,
      },
      away: {
        rosterID: away.rosterID,
        fpts: away.fpts,
      },
      differential: home.fpts - away.fpts,
    };
    matchupDifferentials.push(matchupDifferential);

    // handle post-season data
    if (matchupKey.split(":")[0] == "PS") {
      pSD[home.rosterID].wins = 1;
      pSD[home.rosterID].fptsFor = home.fpts;
      pSD[home.rosterID].fptsAgainst = away.fpts;

      pSD[away.rosterID].losses = 1;
      pSD[away.rosterID].fptsFor = away.fpts;
      pSD[away.rosterID].fptsAgainst = home.fpts;
    }
  }

  return {
    sPR: seasonPointsRecord,
    mD: matchupDifferentials,
    sW: startWeek,
    pSD,
  };
};

/**
 * Processes playoff brackets and maps post-season matchups into playoff records.
 *
 * @param {Object} params - Context variables.
 * @param {string} params.curSeason - Active league ID string.
 * @param {Records} params.playoffRecords - Records storage object.
 * @param {number} params.year - The season year.
 * @param {number} params.week - Current week count.
 * @param {Object} params.rosters - Roster configuration structures.
 * @returns {Promise<Records|null>} Resolved playoff records container, or null if playoffs have not started.
 */
const processPlayoffs = async ({
  curSeason,
  playoffRecords,
  year,
  week,
  rosters,
}) => {
  const { playoffsStart, playoffRounds, champs } = await getBrackets(curSeason);

  if (week <= playoffsStart || !year) {
    return null;
  }

  let seasonPointsRecord = [];
  let matchupDifferentials = [];
  let postSeasonData = {};

  // process all the championship matches
  const champBracket = digestBracket({
    bracket: champs.bracket,
    playoffsStart,
    matchupDifferentials,
    postSeasonData,
    playoffRecords,
    playoffRounds,
    consolation: false,
    seasonPointsRecord,
    year,
  });

  postSeasonData = champBracket.postSeasonData;
  seasonPointsRecord = champBracket.seasonPointsRecord;
  playoffRecords = champBracket.playoffRecords;
  matchupDifferentials = champBracket.matchupDifferentials;

  // process all the consolation matches
  const consolationBracket = digestBracket({
    bracket: champs.consolations,
    playoffsStart,
    matchupDifferentials,
    postSeasonData,
    playoffRecords,
    playoffRounds,
    consolation: true,
    seasonPointsRecord,
    year,
  });

  postSeasonData = consolationBracket.postSeasonData;
  seasonPointsRecord = consolationBracket.seasonPointsRecord;
  playoffRecords = consolationBracket.playoffRecords;
  matchupDifferentials = consolationBracket.matchupDifferentials;

  for (const rosterID in postSeasonData) {
    const pSD = postSeasonData[rosterID];
    const fptsPerGame = round(pSD.fptsFor / (pSD.wins + pSD.losses + pSD.ties));
    pSD.fptsPerGame = fptsPerGame;
    pSD.year = year;
    pSD.rosterID = rosterID;

    // add season long points entry
    playoffRecords.addSeasonLongPoints({
      fpts: pSD.fptsFor,
      fptsPerGame,
      year,
      rosterID: rosterID,
    });

    // update the manager records for this roster ID
    const managers = getManagers(rosters[rosterID]);
    playoffRecords.updateManagerRecord(managers, pSD);
  }

  // sort matchup differentials
  const [biggestBlowouts, closestMatchups] = sortHighAndLow(
    matchupDifferentials,
    "differential",
  );

  // sort season point records
  const [seasonPointsHighs, seasonPointsLows] = sortHighAndLow(
    seasonPointsRecord,
    "fpts",
  );

  // add matchupDifferentials to the all time records
  playoffRecords.addAllTimeMatchupDifferentials(matchupDifferentials);

  if (seasonPointsHighs.length > 0) {
    playoffRecords.addSeasonWeekRecord({
      year,
      biggestBlowouts,
      closestMatchups,
      seasonPointsLows,
      seasonPointsHighs,
    });
  }

  return playoffRecords;
};

/**
 * Digests raw championship or consolation bracket maps into points/differential arrays.
 *
 * @param {Object} params - Context variables.
 * @param {Array[]} params.bracket - Flattened bracket matchup map.
 * @param {Records} params.playoffRecords - Records storage.
 * @param {number} params.playoffRounds - Total playoff rounds.
 * @param {Object[]} params.matchupDifferentials - Accumulated differentials.
 * @param {Object} params.postSeasonData - Playoff standings records.
 * @param {boolean} params.consolation - True if evaluating consolation bracket.
 * @param {Object[]} params.seasonPointsRecord - Accumulated weekly point details.
 * @param {number} params.playoffsStart - Week the playoffs commenced.
 * @param {number} params.year - The season year.
 * @returns {Object} Digested post season results.
 */
const digestBracket = ({
  bracket,
  playoffRecords,
  playoffRounds,
  matchupDifferentials,
  postSeasonData,
  consolation,
  seasonPointsRecord,
  playoffsStart,
  year,
}) => {
  for (let i = 0; i < bracket.length; i++) {
    const startWeek = getStartWeek(
      i + (playoffRounds - bracket.length),
      playoffRounds,
      consolation,
      playoffsStart,
    );
    const matchupWeek = [];

    for (let matchups of bracket[i]) {
      if (consolation) {
        // consolation matchups are nested within an additional array, we need to flatten them before proceeding
        matchups.flat();
      }
      for (const matchup of matchups) {
        if (matchup.r) {
          const newMatchup = { ...matchup };
          let points = 0;
          for (const k in newMatchup.points) {
            points += newMatchup.points[k].reduce((t, nV) => t + nV, 0);
          }
          newMatchup.points = points;
          matchupWeek.push(newMatchup);
        }
      }
    }
    const { sPR, mD, pSD } = processMatchups({
      matchupWeek,
      seasonPointsRecord,
      record: playoffRecords,
      startWeek,
      matchupDifferentials,
      year,
    });

    postSeasonData = meshPostSeasonData(postSeasonData, pSD);

    seasonPointsRecord = sPR;
    matchupDifferentials = mD;
  }

  return {
    postSeasonData,
    seasonPointsRecord,
    playoffRecords,
    matchupDifferentials,
  };
};

/**
 * Merges two post-season standings mappings together.
 *
 * @param {Object} postSeasonData - Target accumulated record mapping.
 * @param {Object} pSD - Source weekly record mapping.
 * @returns {Object} Combined record mapping.
 */
const meshPostSeasonData = (postSeasonData, pSD) => {
  for (const key in pSD) {
    if (!postSeasonData[key]) {
      postSeasonData[key] = pSD[key];
      continue;
    }
    for (const k in pSD[key]) {
      if (k == "manager") continue;
      postSeasonData[key][k] += pSD[key][k];
    }
  }

  return postSeasonData;
};

/**
 * Helper mapping playoff week indexes to structured string labels (Finals, Semi-Finals, etc.).
 *
 * @param {number} i - Current round offset.
 * @param {number} playoffRounds - Total playoff rounds.
 * @param {boolean} consolation - True if consolation bracket.
 * @param {number} playoffsStart - The starting playoff week.
 * @returns {string} Readable week string identifier.
 */
const getStartWeek = (i, playoffRounds, consolation, playoffsStart) => {
  if (consolation) {
    return `(C) Week ${playoffsStart + i}`;
  }

  switch (playoffRounds - i) {
    case 1:
      return "Finals";
    case 2:
      return "Semi-Finals";
    case 3:
      return "Quarter-Finals";

    default:
      return "Qualifiers";
  }
};
