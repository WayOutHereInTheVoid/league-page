import { round } from "./universalFunctions";

/**
 * Debug wrapper to log data transformations
 */
function debugLog(context, data, level = "info") {
  if (
    typeof window !== "undefined" &&
    window.localStorage?.getItem("debug-manager-stats") === "true"
  ) {
    console.group(`[ManagerStats Debug] ${context}`);
    console.log(`Level: ${level}`);
    console.log("Data:", JSON.parse(JSON.stringify(data)));
    console.groupEnd();
  }
}

/**
 * Validate and log data structure
 */
function validateData(context, data, expectedFields = []) {
  debugLog(`${context} - Validation`, {
    provided: data ? Object.keys(data) : "null/undefined",
    expected: expectedFields,
    dataType: typeof data,
    isEmpty: !data || Object.keys(data).length === 0,
  });

  if (!data) {
    debugLog(
      `${context} - ERROR`,
      { error: "Data is null or undefined" },
      "error",
    );
    return false;
  }

  const missingFields = expectedFields.filter((field) => !(field in data));
  if (missingFields.length > 0) {
    debugLog(`${context} - WARNING`, { missingFields }, "warn");
  }

  return true;
}

/**
 * Enhanced processSeasonData with debugging
 */
function processSeasonDataDebug(yearData, awards, managerRosters) {
  debugLog("processSeasonData - Input", {
    yearData,
    awards: awards ? awards.length : "null",
    managerRosters: Object.keys(managerRosters || {}),
  });

  let playoffs = false;
  let championship = false;
  let divisionChamp = false;

  // Log awards processing
  if (awards && Array.isArray(awards)) {
    debugLog("Awards Processing", {
      totalAwards: awards.length,
      yearDataYear: yearData.year,
      yearDataRosterID: yearData.rosterID,
    });

    for (const award of awards) {
      if (award.year === yearData.year) {
        const rosterNum = parseInt(yearData.rosterID);

        debugLog("Award Year Match", {
          awardYear: award.year,
          yearDataYear: yearData.year,
          rosterNum,
          award: {
            champion: award.champion,
            second: award.second,
            third: award.third,
            divisions: award.divisions?.length || 0,
          },
        });

        // Check for championship
        if (award.champion === rosterNum) {
          championship = true;
          playoffs = true;
          debugLog("Championship Found", { rosterNum, year: award.year });
        }

        // Check for runner-up or third place
        if (award.second === rosterNum || award.third === rosterNum) {
          playoffs = true;
          debugLog("Playoff Position Found", {
            rosterNum,
            position: award.second === rosterNum ? "second" : "third",
            year: award.year,
          });
        }

        // Check for division championships
        if (award.divisions && Array.isArray(award.divisions)) {
          for (const division of award.divisions) {
            if (division.rosterID === rosterNum) {
              playoffs = true;
              divisionChamp = true;
              debugLog("Division Championship Found", {
                rosterNum,
                division,
                year: award.year,
              });
            }
          }
        }
      }
    }
  } else {
    debugLog(
      "Awards Processing - WARNING",
      {
        message: "No awards data available",
        awards,
      },
      "warn",
    );
  }

  // Debug field name mappings and data extraction
  debugLog("Field Name Mapping", {
    originalYearData: yearData,
    availableFields: Object.keys(yearData || {}),
    fptsForField: yearData.fptsFor,
    fptsField: yearData.fpts,
    fptsAgainstField: yearData.fptsAgainst,
    fpts_againstField: yearData.fpts_against,
    potentialPointsField: yearData.potentialPoints,
    pptsField: yearData.ppts,
  });

  // Try multiple field name variations
  let fpts = 0;
  let fptsAgainst = 0;
  let potentialPoints = 0;

  // Points For - try multiple field variations
  if (yearData.fptsFor !== undefined && yearData.fptsFor !== null) {
    fpts = parseFloat(yearData.fptsFor);
  } else if (yearData.fpts !== undefined && yearData.fpts !== null) {
    // Handle decimal separately if it exists
    const decimal = yearData.fpts_decimal ? yearData.fpts_decimal / 100 : 0;
    fpts = parseFloat(yearData.fpts) + decimal;
  } else {
    debugLog(
      "Points For - ERROR",
      {
        message: "No valid points for field found",
        yearData,
      },
      "error",
    );
  }

  // Points Against - try multiple field variations
  if (yearData.fptsAgainst !== undefined && yearData.fptsAgainst !== null) {
    fptsAgainst = parseFloat(yearData.fptsAgainst);
  } else if (
    yearData.fpts_against !== undefined &&
    yearData.fpts_against !== null
  ) {
    // Handle decimal separately if it exists
    const decimal = yearData.fpts_against_decimal
      ? yearData.fpts_against_decimal / 100
      : 0;
    fptsAgainst = parseFloat(yearData.fpts_against) + decimal;
  } else {
    debugLog(
      "Points Against - ERROR",
      {
        message: "No valid points against field found",
        yearData,
      },
      "error",
    );
  }

  // Potential Points - try multiple field variations
  if (
    yearData.potentialPoints !== undefined &&
    yearData.potentialPoints !== null
  ) {
    potentialPoints = parseFloat(yearData.potentialPoints);
  } else if (yearData.ppts !== undefined && yearData.ppts !== null) {
    // Handle decimal separately if it exists
    const decimal = yearData.ppts_decimal ? yearData.ppts_decimal / 100 : 0;
    potentialPoints = parseFloat(yearData.ppts) + decimal;
  } else {
    debugLog(
      "Potential Points - WARNING",
      {
        message: "No valid potential points field found",
        yearData,
      },
      "warn",
    );
  }

  // Apply rounding and ensure numbers
  const finalFpts = parseFloat(round(fpts || 0));
  const finalFptsAgainst = parseFloat(round(fptsAgainst || 0));
  const finalPotentialPoints = parseFloat(round(potentialPoints || 0));

  debugLog("Points Calculation Results", {
    original: { fpts, fptsAgainst, potentialPoints },
    final: { finalFpts, finalFptsAgainst, finalPotentialPoints },
    isNaN: {
      fpts: isNaN(finalFpts),
      fptsAgainst: isNaN(finalFptsAgainst),
      potentialPoints: isNaN(finalPotentialPoints),
    },
  });

  const season = {
    year: yearData.year,
    wins: yearData.wins || 0,
    losses: yearData.losses || 0,
    ties: yearData.ties || 0,
    fpts: finalFpts,
    fptsAgainst: finalFptsAgainst,
    playoffs,
    championship,
    divisionChamp,
    potentialPoints: finalPotentialPoints,
    lineupEfficiency:
      finalPotentialPoints > 0
        ? parseFloat(round((finalFpts / finalPotentialPoints) * 100))
        : 0,
    rosterID: yearData.rosterID,
  };

  debugLog("processSeasonData - Output", season);
  return season;
}

/**
 * Enhanced computeManagerStats with debugging
 */
export function computeManagerStatsDebug(
  manager,
  leagueTeamManagers,
  records,
  currentRosterID,
  awards,
) {
  debugLog("computeManagerStats - Start", {
    manager: manager
      ? { name: manager.name, managerID: manager.managerID }
      : "null",
    hasLeagueTeamManagers: !!leagueTeamManagers,
    hasRecords: !!records,
    currentRosterID,
    hasAwards: awards ? awards.length : "null",
  });

  // Validate required data
  if (!manager?.managerID) {
    debugLog(
      "Manager Validation - WARNING",
      {
        message: "No managerID found, falling back to legacy method",
        manager,
      },
      "warn",
    );
    return { seasons: [], totalStats: getEmptyStats() };
  }

  if (!validateData("Records Data", records, ["regularSeasonData"])) {
    return { seasons: [], totalStats: getEmptyStats() };
  }

  // Get all roster IDs this manager has used across seasons
  const managerRosters = getAllManagerRosterIDsDebug(
    manager.managerID,
    leagueTeamManagers,
  );

  debugLog("Manager Roster Mapping", {
    managerID: manager.managerID,
    managerRosters,
    rosterCount: Object.keys(managerRosters).length,
  });

  if (Object.keys(managerRosters).length === 0) {
    debugLog(
      "Manager Rosters - ERROR",
      {
        message: "No roster history found for manager",
        managerID: manager.managerID,
      },
      "error",
    );
    return { seasons: [], totalStats: getEmptyStats() };
  }

  // Aggregate season data across all roster IDs
  const seasonData = aggregateManagerSeasonDataDebug(managerRosters, records);

  debugLog("Season Data Aggregation", {
    seasonData,
    seasonCount: seasonData.length,
  });

  if (seasonData.length === 0) {
    debugLog(
      "Season Data - ERROR",
      {
        message: "No season data found",
        managerRosters,
      },
      "error",
    );
    return { seasons: [], totalStats: getEmptyStats() };
  }

  // Process each season and add awards/achievements
  const seasons = [];
  let totalStats = {
    totalWins: 0,
    totalLosses: 0,
    totalTies: 0,
    totalPoints: 0,
    totalPointsAgainst: 0,
    playoffAppearances: 0,
    championships: 0,
    divisionChampionships: 0,
    seasonsPlayed: 0,
  };

  for (const yearData of seasonData) {
    const season = processSeasonDataDebug(yearData, awards, managerRosters);
    seasons.push(season);

    // Aggregate totals with debugging
    debugLog("Totals Aggregation", {
      before: { ...totalStats },
      seasonContribution: {
        wins: season.wins,
        losses: season.losses,
        ties: season.ties,
        fpts: season.fpts,
        fptsAgainst: season.fptsAgainst,
        playoffs: season.playoffs,
        championship: season.championship,
        divisionChamp: season.divisionChamp,
      },
    });

    totalStats.totalWins += season.wins;
    totalStats.totalLosses += season.losses;
    totalStats.totalTies += season.ties;
    totalStats.totalPoints += season.fpts;
    totalStats.totalPointsAgainst += season.fptsAgainst;
    totalStats.seasonsPlayed++;

    if (season.playoffs) totalStats.playoffAppearances++;
    if (season.championship) totalStats.championships++;
    if (season.divisionChamp) totalStats.divisionChampionships++;

    debugLog("Totals After Season", { ...totalStats });
  }

  // Calculate derived statistics
  const totalGames =
    totalStats.totalWins + totalStats.totalLosses + totalStats.totalTies;
  totalStats.winPercentage =
    totalGames > 0
      ? parseFloat(round((totalStats.totalWins / totalGames) * 100))
      : 0;
  totalStats.averagePointsPerSeason =
    totalStats.seasonsPlayed > 0
      ? parseFloat(round(totalStats.totalPoints / totalStats.seasonsPlayed))
      : 0;
  totalStats.averagePointsPerGame =
    totalGames > 0 ? parseFloat(round(totalStats.totalPoints / totalGames)) : 0;

  debugLog("Final Calculations", {
    totalGames,
    derivedStats: {
      winPercentage: totalStats.winPercentage,
      averagePointsPerSeason: totalStats.averagePointsPerSeason,
      averagePointsPerGame: totalStats.averagePointsPerGame,
    },
    isNaN: {
      winPercentage: isNaN(totalStats.winPercentage),
      averagePointsPerSeason: isNaN(totalStats.averagePointsPerSeason),
      averagePointsPerGame: isNaN(totalStats.averagePointsPerGame),
    },
  });

  // Sort seasons by year (most recent first)
  seasons.sort((a, b) => b.year - a.year);

  const result = { seasons, totalStats };
  debugLog("computeManagerStats - Final Result", result);

  return result;
}

/**
 * Enhanced getAllManagerRosterIDs with debugging
 */
function getAllManagerRosterIDsDebug(managerID, leagueTeamManagers) {
  debugLog("getAllManagerRosterIDs - Start", {
    managerID,
    hasTeamManagersMap: !!leagueTeamManagers?.teamManagersMap,
  });

  const managerRosters = {};

  if (!leagueTeamManagers?.teamManagersMap) {
    debugLog(
      "getAllManagerRosterIDs - ERROR",
      {
        message: "No teamManagersMap available",
      },
      "error",
    );
    return managerRosters;
  }

  debugLog("TeamManagersMap Structure", {
    years: Object.keys(leagueTeamManagers.teamManagersMap),
    sampleYear: Object.keys(leagueTeamManagers.teamManagersMap)[0],
  });

  // Search through all years to find all roster IDs this manager has used
  for (const [year, yearData] of Object.entries(
    leagueTeamManagers.teamManagersMap,
  )) {
    debugLog(`Year ${year} Processing`, {
      year,
      rosters: Object.keys(yearData || {}),
      yearDataType: typeof yearData,
    });

    for (const [rosterID, rosterData] of Object.entries(yearData)) {
      debugLog(`Roster ${rosterID} Check`, {
        rosterID,
        rosterData: rosterData
          ? {
              hasManagers: !!rosterData.managers,
              managersLength: rosterData.managers?.length,
              managers: rosterData.managers,
            }
          : "null",
      });

      if (rosterData.managers && rosterData.managers.includes(managerID)) {
        managerRosters[year] = rosterID;
        debugLog(`Manager Match Found`, {
          year,
          rosterID,
          managerID,
        });
        break; // Manager can only have one roster per year
      }
    }
  }

  debugLog("getAllManagerRosterIDs - Result", managerRosters);
  return managerRosters;
}

/**
 * Enhanced aggregateManagerSeasonData with debugging
 */
function aggregateManagerSeasonDataDebug(managerRosters, records) {
  debugLog("aggregateManagerSeasonData - Start", {
    managerRosters,
    hasRecords: !!records,
    hasRegularSeasonData: !!records?.regularSeasonData,
    hasLeagueRosterRecords: !!records?.regularSeasonData?.leagueRosterRecords,
  });

  const seasons = [];

  if (!records?.regularSeasonData?.leagueRosterRecords) {
    debugLog(
      "aggregateManagerSeasonData - ERROR",
      {
        message: "No leagueRosterRecords available",
      },
      "error",
    );
    return seasons;
  }

  const rosterRecords = records.regularSeasonData.leagueRosterRecords;

  debugLog("RosterRecords Structure", {
    rosterIDs: Object.keys(rosterRecords),
    sampleRoster: Object.keys(rosterRecords)[0],
  });

  // For each year this manager played, get their season data
  for (const [year, rosterID] of Object.entries(managerRosters)) {
    debugLog(`Processing Year ${year}`, {
      year,
      rosterID,
      hasRosterData: !!rosterRecords[rosterID],
    });

    const rosterData = rosterRecords[rosterID];

    if (!rosterData?.years) {
      debugLog(
        `Year ${year} - WARNING`,
        {
          message: "No years data for roster",
          rosterID,
          rosterData,
        },
        "warn",
      );
      continue;
    }

    debugLog(`Roster ${rosterID} Years`, {
      availableYears: rosterData.years.map((y) => y.year),
      lookingForYear: parseInt(year),
    });

    // Find the specific year's data for this roster
    const yearData = rosterData.years.find((y) => y.year === parseInt(year));

    if (yearData) {
      const seasonWithRosterID = {
        ...yearData,
        rosterID: rosterID,
      };
      seasons.push(seasonWithRosterID);
      debugLog(`Year ${year} Data Found`, seasonWithRosterID);
    } else {
      debugLog(
        `Year ${year} - WARNING`,
        {
          message: "Year data not found in roster records",
          year: parseInt(year),
          availableYears: rosterData.years.map((y) => y.year),
        },
        "warn",
      );
    }
  }

  debugLog("aggregateManagerSeasonData - Result", {
    seasonsFound: seasons.length,
    seasons,
  });

  return seasons;
}

/**
 * Create empty stats object for fallback cases
 */
function getEmptyStats() {
  return {
    totalWins: 0,
    totalLosses: 0,
    totalTies: 0,
    totalPoints: 0,
    totalPointsAgainst: 0,
    playoffAppearances: 0,
    championships: 0,
    divisionChampionships: 0,
    seasonsPlayed: 0,
    winPercentage: 0,
    averagePointsPerSeason: 0,
    averagePointsPerGame: 0,
  };
}

// Enable debugging in browser console with: localStorage.setItem('debug-manager-stats', 'true')
// Disable debugging with: localStorage.removeItem('debug-manager-stats')
