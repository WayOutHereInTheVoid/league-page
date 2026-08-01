import { managers as managersObj } from "$lib/utils/leagueInfo";
import { goto } from "$app/navigation";
import { stringDate } from "./news";

const QUESTION = "managers/question.jpg";

/**
 * Standardizes a manager or team name by removing "Team " and symbols and lowercasing.
 *
 * @param {string} name - The raw name string.
 * @returns {string} Standardized clean name string.
 */
export const cleanName = (name) => {
  return name
    .replace("Team ", "")
    .toLowerCase()
    .replace(/[ ’'!"#$%&\\'()\*+,\-\.\/:;<=>?@\[\\\]\^_`{|}~']/g, "");
};

/**
 * Rounds a number to exactly two decimal places, returning a string.
 * Handles string conversion gracefully.
 *
 * @param {number|string} num - The value to round.
 * @returns {string} The rounded number represented as a string.
 */
export const round = (num) => {
  if (typeof num == "string") {
    num = parseFloat(num);
  }
  return (Math.round((num + Number.EPSILON) * 100) / 100).toFixed(2);
};

/**
 * Calculates a rounded minimum value suited for y-axis chart starting bounds.
 *
 * @param {number[]} stats - Array of numerical values.
 * @param {number} roundOverride - Step interval to round to.
 * @param {number} max - The maximum value in the set.
 * @returns {number} The computed y-axis minimum bound.
 */
const min = (stats, roundOverride, max) => {
  const num = Math.min(...stats);
  let minAnswer = Math.floor(num / roundOverride) * roundOverride;
  if (max && num > 0) {
    let i = 0;
    while (minAnswer > 0 && (num - minAnswer) / (max - minAnswer) < 0.15) {
      minAnswer -= roundOverride;
      i++;
      // prevent infinite loop, emergency exit
      if (i > 100) {
        break;
      }
    }
  }
  return minAnswer > 0 ? minAnswer : 0;
};

/**
 * Calculates a rounded maximum value suited for y-axis chart ceilings.
 *
 * @param {number[]} stats - Array of numerical values.
 * @param {number} roundOverride - Step interval to round to.
 * @returns {number} The computed y-axis maximum ceiling.
 */
const max = (stats, roundOverride) => {
  const num = Math.max(...stats);
  return Math.ceil(num / roundOverride) * roundOverride;
};

/**
 * Navigates client-side to a target manager's profile index.
 * Handles legacy/deprecated roster ID mappings.
 *
 * @param {Object} params - Context variables.
 * @param {Object} params.leagueTeamManagers - Mapped team managers records.
 * @param {string} [params.managerID] - Manager user ID.
 * @param {string|number} [params.rosterID] - Fallback roster ID.
 * @param {number} [params.year] - Current year constraint.
 * @returns {void}
 */
export const gotoManager = ({
  leagueTeamManagers,
  managerID,
  rosterID,
  year,
}) => {
  if (!managersObj.length) return;
  let managersIndex = -1;

  if (!year || year > leagueTeamManagers.currentSeason) {
    year = leagueTeamManagers.currentSeason;
  }

  if (managerID) {
    // modern approach
    managersIndex = managersObj.findIndex((m) => m.managerID == managerID);

    // support for league pages still using deprecated roster field
    if (managersIndex < 0 && leagueTeamManagers.teamManagersMap[year] != null) {
      for (const rID in leagueTeamManagers.teamManagersMap[year]) {
        if (leagueTeamManagers.teamManagersMap[year][rID] == null) continue;
        for (const mID of leagueTeamManagers.teamManagersMap[year][rID]
          .managers) {
          if (mID == managerID) {
            managersIndex = managersObj.findIndex((m) => m.roster == rID);
            goto(`/manager?manager=${managersIndex}`);
            return;
          }
        }
      }
    }
  } else if (rosterID) {
    // check for matching managerID first
    if (leagueTeamManagers.teamManagersMap[year] != null) {
      for (const mID of leagueTeamManagers.teamManagersMap[year][rosterID]
        .managers) {
        managersIndex = managersObj.findIndex((m) => m.managerID == mID);
        if (managersIndex > -1) {
          goto(`/manager?manager=${managersIndex}`);
          return;
        }
      }
    }

    // support for league pages still using deprecated roster field
    managersIndex = managersObj.findIndex((m) => m.roster == rosterID);
  }

  // if no manager exists for that roster, -1 will take you to the main managers page
  goto(`/manager?manager=${managersIndex}`);
};

/**
 * Searches users for a matching author username and returns a formatted HTML link pointing to their manager page.
 *
 * @param {Object} leagueTeamManagers - Mapped managers metadata.
 * @param {string} author - The author username.
 * @returns {string[]} An array containing either the formatted HTML link or the original author name.
 */
export const getAuthor = (leagueTeamManagers, author) => {
  for (const userID in leagueTeamManagers.users) {
    if (
      leagueTeamManagers.users[userID].user_name.toLowerCase() ==
      author.toLowerCase()
    ) {
      return [
        `<a href="/manager?manager=${managersObj.findIndex((m) => m.managerID == String(userID))}">${leagueTeamManagers.users[userID].display_name}</a>`,
      ];
    }
  }
  return author;
};

/**
 * Resolves the Sleeper CDN avatar URL for a given author name.
 *
 * @param {Object} leagueTeamManagers - Mapped managers data.
 * @param {string} author - Target author username.
 * @returns {string} The CDN image URL, or default question mark fallback.
 */
export const getAvatar = (leagueTeamManagers, author) => {
  for (const uID in leagueTeamManagers.users) {
    if (
      leagueTeamManagers.users[uID].user_name.toLowerCase() ==
      author.toLowerCase()
    ) {
      return `https://sleepercdn.com/avatars/thumbs/${leagueTeamManagers.users[uID].avatar}`;
    }
  }
  return QUESTION;
};

/**
 * Parses a raw date string into standard fantasy league readable format (using stringDate).
 *
 * @param {string} rawDate - Raw date string.
 * @returns {string} Standardized date representation.
 */
export const parseDate = (rawDate) => {
  const ts = Date.parse(rawDate);
  const d = new Date(ts);
  return stringDate(d);
};

/**
 * Builds an ApexCharts-compatible graph data object from a set of stats records.
 *
 * @param {Object} params - Context variables.
 * @param {Object[]} params.stats - Raw stats objects.
 * @param {string} params.x - X-axis title label.
 * @param {string} params.stat - Stat title label.
 * @param {string} params.header - Header title string.
 * @param {string} params.field - Primary stats field key.
 * @param {boolean} params.short - True to abbreviate labels.
 * @param {string|null} [params.secondField=null] - Secondary stats field key for comparison.
 * @param {number} year - Target season year.
 * @param {number} [roundOverride=10] - X-axis tick step rounding constraint.
 * @param {number|null} [xMinOverride=null] - Manual override for x-axis minimum boundary.
 * @returns {Object|null} Resolved ApexCharts dataset, or null if stats are empty.
 */
export const generateGraph = (
  { stats, x, stat, header, field, short, secondField = null },
  year,
  roundOverride = 10,
  xMinOverride = null,
) => {
  if (!stats) {
    return null;
  }
  const graph = {
    stats: [],
    secondStats: [],
    managerIDs: [],
    rosterIDs: [],
    labels: { x, stat },
    header,
    xMin: 0,
    xMax: 0,
    short,
    year,
  };

  const sortedStats = [...stats].sort((a, b) => b[field] - a[field]);

  for (const indivStat of sortedStats) {
    graph.stats.push(indivStat[field]);
    if (secondField) {
      graph.secondStats.push(indivStat[secondField]);
    }
    if (indivStat.managerID) {
      graph.managerIDs.push(indivStat.managerID);
      graph.rosterIDs.push(null);
    } else if (indivStat.rosterID) {
      graph.managerIDs.push(null);
      graph.rosterIDs.push(indivStat.rosterID);
    }
  }

  graph.xMax = max(graph.stats, roundOverride);
  graph.xMin = min(graph.stats, roundOverride, graph.xMax);
  if (secondField) {
    graph.xMin = min(graph.secondStats, roundOverride, graph.xMax);
  }
  if (xMinOverride) {
    graph.xMin = xMinOverride;
  }

  return graph;
};

/**
 * sorts an array by field, returning the 10 highest and lowest members.
 *
 * @param {Object[]} arr - The target array to sort.
 * @param {string} field - Sort field key.
 * @returns {Array[]} High and low parsed subsets: [highIndex, lowIndex].
 */
export const sortHighAndLow = (arr, field) => {
  const sorted = arr.sort((a, b) => b[field] - a[field]);
  const high = sorted.slice(0, 10);
  const low = sorted.slice(-10).reverse();
  return [high, low];
};

/**
 * Extracts and maps all active manager and co-owner user IDs on a roster.
 *
 * @param {Object} roster - Sleeper roster settings object.
 * @returns {string[]} Compiled list of active manager IDs.
 */
export const getManagers = (roster) => {
  const managers = [];
  if (roster.owner_id) {
    managers.push(roster.owner_id);
  }
  if (roster.co_owners) {
    for (const coOwner of roster.co_owners) {
      managers.push(coOwner);
    }
  }
  return managers;
};

/**
 * Resolves name and avatar CDN details for a team based on users profiles and owner IDs.
 *
 * @param {Object} users - Users key-value map.
 * @param {string} ownerID - Owner user ID.
 * @returns {Object} Normalized avatar and name objects.
 */
export const getTeamData = (users, ownerID) => {
  const user = users[ownerID];
  if (user) {
    return {
      avatar: user.metadata?.avatar
        ? user.metadata.avatar
        : `https://sleepercdn.com/avatars/thumbs/${user.avatar}`,
      name: user.metadata.team_name
        ? user.metadata.team_name
        : user.display_name,
    };
  }
  return {
    avatar: `https://sleepercdn.com/images/v2/icons/player_default.webp`,
    name: "Unknown Team",
  };
};

/**
 * Returns the avatar URL matching the target roster ID and year from mapped team managers data.
 *
 * @param {Object} teamManagers - Mapped managers configuration.
 * @param {string|number} rosterID - Target roster ID.
 * @param {number} year - Target season year.
 * @returns {string} Secure avatar image URL.
 */
export const getAvatarFromTeamManagers = (teamManagers, rosterID, year) => {
  if (!year || year > teamManagers.currentSeason) {
    year = teamManagers.currentSeason;
  }
  const yearManagers = teamManagers.teamManagersMap[year];
  if (yearManagers == null) {
    return QUESTION;
  }
  const roster = yearManagers[rosterID];
  if (roster == null) {
    return QUESTION;
  }
  return roster.team?.avatar;
};

/**
 * Returns the team name matching the target roster ID and year from mapped team managers data.
 *
 * @param {Object} teamManagers - Mapped managers configuration.
 * @param {string|number} rosterID - Target roster ID.
 * @param {number} year - Target season year.
 * @returns {string} Resolved team name string.
 */
export const getTeamNameFromTeamManagers = (teamManagers, rosterID, year) => {
  if (!year || year > teamManagers.currentSeason) {
    year = teamManagers.currentSeason;
  }

  // Add null checking for nested object access
  if (!teamManagers?.teamManagersMap?.[year]?.[rosterID]?.team?.name) {
    return "Unknown Team";
  }

  return teamManagers.teamManagersMap[year][rosterID].team.name;
};

/**
 * Returns a comma-separated list string containing the display names of all owners on a roster.
 *
 * @param {Object} teamManagers - Mapped managers metadata.
 * @param {string|number} rosterID - Target roster ID.
 * @param {number} year - Target season year.
 * @returns {string} String listing all active manager display names.
 */
export const renderManagerNames = (teamManagers, rosterID, year) => {
  if (!year || year > teamManagers.currentSeason) {
    year = teamManagers.currentSeason;
  }
  let managersString = "";

  // Add null checking for nested object access
  if (!teamManagers?.teamManagersMap?.[year]?.[rosterID]?.managers) {
    return "Unknown Managers";
  }

  for (const managerID of teamManagers.teamManagersMap[year][rosterID]
    .managers) {
    const manager = teamManagers.users[managerID];
    if (manager) {
      if (managersString != "") {
        managersString += ", ";
      }
      managersString += manager.display_name;
    }
  }
  return managersString;
};

/**
 * Retrieves the core team details object (avatar/name) matching a roster ID and year.
 *
 * @param {Object} teamManagers - Mapped managers metadata.
 * @param {string|number} rosterID - Target roster ID.
 * @param {number} year - Target season year.
 * @returns {Object|null} Mapped team details or null if missing.
 */
export const getTeamFromTeamManagers = (teamManagers, rosterID, year) => {
  if (!year || year > teamManagers.currentSeason) {
    year = teamManagers.currentSeason;
  }

  // Add null checking for nested object access
  if (!teamManagers?.teamManagersMap?.[year]?.[rosterID]?.team) {
    return null;
  }

  return teamManagers.teamManagersMap[year][rosterID]["team"];
};

/**
 * Generates an HTML block representing a team's historical name, noting if ownership changed.
 *
 * @param {Object} teamManagers - Mapped managers configuration.
 * @param {number} year - Historical season year.
 * @param {string|number} rosterID - Target roster ID.
 * @returns {string} Converted HTML string with ownership change flags.
 */
export const getNestedTeamNamesFromTeamManagers = (
  teamManagers,
  year,
  rosterID,
) => {
  const originalName =
    teamManagers.teamManagersMap[year][rosterID]["team"]["name"];
  const currentName =
    teamManagers.teamManagersMap[teamManagers.currentSeason][rosterID]["team"][
      "name"
    ];
  if (cleanName(originalName) != cleanName(currentName)) {
    return `${originalName}<div class="curOwner">(${currentName})</div>`;
  }
  return originalName;
};

/**
 * Calculates a manager's start and end season dates by scanning all years of historical team mappings.
 *
 * @param {Object} teamManagers - Mapped managers metadata.
 * @param {string} managerID - Target manager ID.
 * @returns {Object|undefined} Start and end year numbers, or undefined if managerID is empty.
 */
export const getDatesActive = (teamManagers, managerID) => {
  if (!managerID) return;
  let datesActive = { start: null, end: null };
  const years = Object.keys(teamManagers.teamManagersMap).sort((a, b) => b - a);
  for (const year of years) {
    for (const rosterID in teamManagers.teamManagersMap[year]) {
      // Add null checking for nested object access
      if (
        teamManagers.teamManagersMap[year][rosterID]?.managers &&
        teamManagers.teamManagersMap[year][rosterID].managers.indexOf(
          managerID,
        ) > -1
      ) {
        datesActive.start = year;
        if (!datesActive.end) {
          datesActive.end = year;
        }
        break;
      }
    }
  }
  if (datesActive.end == teamManagers.currentSeason) {
    datesActive.end = null;
  }
  return datesActive;
};

/**
 * Resolves a manager's most recent active roster ID and active season year.
 *
 * @param {Object} teamManagers - Mapped managers metadata.
 * @param {string} managerID - Target manager user ID.
 * @returns {Object|null} Object containing rosterID and year, or null if missing.
 */
export const getRosterIDFromManagerID = (teamManagers, managerID) => {
  if (!managerID) return null;
  const years = Object.keys(teamManagers.teamManagersMap).sort((a, b) => b - a);
  for (const year of years) {
    for (const rosterID in teamManagers.teamManagersMap[year]) {
      if (
        teamManagers.teamManagersMap[year][rosterID].managers.indexOf(
          managerID,
        ) > -1
      ) {
        return { rosterID, year };
      }
    }
  }
  return null;
};

/**
 * Resolves the roster ID held by a manager on a specific year.
 *
 * @param {Object} teamManagers - Mapped managers configuration.
 * @param {string} managerID - Target manager ID.
 * @param {number} year - Target season year.
 * @returns {string|number|null} The resolved roster ID, or null.
 */
export const getRosterIDFromManagerIDAndYear = (
  teamManagers,
  managerID,
  year,
) => {
  if (!managerID || !year) return null;
  for (const rosterID in teamManagers.teamManagersMap[year]) {
    if (
      teamManagers.teamManagersMap[year][rosterID].managers.indexOf(managerID) >
      -1
    ) {
      return rosterID;
    }
  }
  return null;
};

/**
 * Determines whether a specific manager was the recipient of an award based on awardRosterID.
 *
 * @param {Object} teamManagers - Mapped managers metadata.
 * @param {string|number} awardRosterID - The roster ID designated for the award.
 * @param {number} year - Year of the award.
 * @param {string} managerID - The target manager user ID.
 * @returns {boolean} True if the manager matched the award roster ID.
 */
export const checkIfManagerReceivedAward = (
  teamManagers,
  awardRosterID,
  year,
  managerID,
) => {
  if (!managerID) return false;

  // Add null checking for nested object access
  if (!teamManagers?.teamManagersMap?.[year]?.[awardRosterID]?.managers) {
    return false;
  }

  return (
    teamManagers.teamManagersMap[year][awardRosterID].managers.indexOf(
      managerID,
    ) > -1
  );
};
