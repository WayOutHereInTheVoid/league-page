import { getLeagueData } from "./leagueData";
import { getLeagueRosters } from "./leagueRosters";
import { waitForAll } from "./multiPromise";
import { get } from "svelte/store";
import { awards } from "$lib/stores";
import {
  parsePlayoffBrackets,
  analyzePlayoffParticipation,
} from "./playoffDetectionUtils";
import { debugAwardProcessing } from "./awardProcessingUtils";

export const getAwards = async () => {
  if (get(awards).length) {
    return get(awards);
  }
  const leagueData = await getLeagueData().catch((err) => {
    console.error(err);
  });

  let previousSeasonID =
    leagueData.status == "complete"
      ? leagueData.league_id
      : leagueData.previous_league_id;

  const podiums = await getPodiums(previousSeasonID);

  awards.update(() => podiums);

  return podiums;
};

/**
 * ENHANCED: Get podiums with robust playoff detection and validation
 * @param {string} previousSeasonID - Starting season ID to traverse backwards
 * @returns {Array} Array of podium/award objects
 */
const getPodiums = async (previousSeasonID) => {
  const podiums = [];

  debugAwardProcessing("Awards Processing - Starting", {
    startingSeasonID: previousSeasonID,
  });

  while (previousSeasonID && previousSeasonID != 0) {
    try {
      // Get previous season data with enhanced error handling
      const previousSeasonData =
        await getPreviousLeagueDataEnhanced(previousSeasonID);

      if (!previousSeasonData) {
        debugAwardProcessing(
          "Season Data Retrieval Failed",
          {
            seasonID: previousSeasonID,
          },
          "warn",
        );
        break;
      }

      const {
        losersData,
        winnersData,
        year,
        previousRosters,
        numDivisions,
        playoffRounds,
        toiletRounds,
        leagueMetadata,
        leagueSettings,
      } = previousSeasonData;

      previousSeasonID = previousSeasonData.previousSeasonID;

      debugAwardProcessing(`Processing Season ${year}`, {
        year,
        winnersDataLength: winnersData?.length || 0,
        losersDataLength: losersData?.length || 0,
        numDivisions,
        playoffRounds,
        toiletRounds,
      });

      // PHASE 2 ENHANCEMENT: Use robust playoff bracket parsing
      const playoffStructure = parsePlayoffBrackets(
        winnersData,
        losersData,
        leagueSettings,
      );

      // Enhanced championship detection with multiple fallback methods
      const championshipInfo = extractChampionshipInfoEnhanced(
        winnersData,
        losersData,
        playoffStructure,
        playoffRounds,
      );

      // Enhanced division processing
      const divisions = buildDivisionsAndManagersEnhanced({
        previousRosters,
        leagueMetadata,
        numDivisions,
        playoffParticipants: playoffStructure.participants,
      });

      // Convert divisions to array format
      const divisionArr = [];
      for (const key in divisions) {
        divisionArr.push(divisions[key]);
      }

      // PHASE 2 ENHANCEMENT: Robust toilet bowl detection
      const toiletInfo = extractToiletBowlInfoEnhanced(
        losersData,
        toiletRounds,
        playoffStructure,
      );

      // Skip seasons with no meaningful championship data
      if (!championshipInfo.champion) {
        debugAwardProcessing(
          `Season ${year} - Skipping`,
          {
            reason: "No championship data found",
            championshipInfo,
          },
          "warn",
        );
        continue;
      }

      // PHASE 2 ENHANCEMENT: Create enhanced podium object with validation
      const podium = {
        year,
        champion: championshipInfo.champion,
        second: championshipInfo.second,
        third: championshipInfo.third,
        divisions: divisionArr,
        toilet: toiletInfo.toilet,
        // NEW: Additional data for enhanced validation
        playoffParticipants: Array.from(playoffStructure.participants),
        validationResults: playoffStructure.validationResults,
        detectionMethods: {
          championship: championshipInfo.detectionMethod,
          toilet: toiletInfo.detectionMethod,
          confidence: calculatePodiumConfidence(
            championshipInfo,
            toiletInfo,
            playoffStructure,
          ),
        },
      };

      debugAwardProcessing(`Season ${year} - Podium Created`, {
        podium: {
          ...podium,
          playoffParticipants:
            podium.playoffParticipants.length + " participants",
        },
      });

      podiums.push(podium);
    } catch (error) {
      debugAwardProcessing(
        `Season Processing Error`,
        {
          seasonID: previousSeasonID,
          error: error.message,
        },
        "error",
      );

      // Continue processing other seasons even if one fails
      try {
        const fallbackData = await getPreviousLeagueData(previousSeasonID);
        previousSeasonID = fallbackData?.previousSeasonID;
      } catch (fallbackError) {
        debugAwardProcessing(
          "Fallback Failed - Stopping",
          {
            seasonID: previousSeasonID,
            error: fallbackError.message,
          },
          "error",
        );
        break;
      }
    }
  }

  debugAwardProcessing("Awards Processing - Complete", {
    totalSeasonsProcessed: podiums.length,
    yearsProcessed: podiums.map((p) => p.year),
  });

  return podiums;
};

/**
 * ENHANCED: Fetch previous season data with additional league settings
 * @param {string} previousSeasonID - Season ID to fetch data for
 * @returns {Object} Enhanced season data including settings
 */
const getPreviousLeagueDataEnhanced = async (previousSeasonID) => {
  try {
    const resPromises = [
      fetch(`https://api.sleeper.app/v1/league/${previousSeasonID}`, {
        compress: true,
      }),
      getLeagueRosters(previousSeasonID),
      fetch(
        `https://api.sleeper.app/v1/league/${previousSeasonID}/losers_bracket`,
        { compress: true },
      ),
      fetch(
        `https://api.sleeper.app/v1/league/${previousSeasonID}/winners_bracket`,
        { compress: true },
      ),
    ];

    const [leagueRes, rostersData, losersRes, winnersRes] = await waitForAll(
      ...resPromises,
    );

    // Check if all required requests succeeded
    if (!leagueRes.ok || !winnersRes.ok) {
      throw new Error(`Failed to fetch data for season ${previousSeasonID}`);
    }

    const jsonPromises = [leagueRes.json(), winnersRes.json()];

    // Handle losers bracket failure gracefully (some seasons might not have it)
    if (losersRes.ok) {
      jsonPromises.push(losersRes.json());
    }

    const jsonResults = await waitForAll(...jsonPromises);
    const [prevLeagueData, winnersData] = jsonResults;
    const losersData = jsonResults.length > 2 ? jsonResults[2] : [];

    const year = parseInt(prevLeagueData.season);
    const previousRosters = rostersData.rosters;
    const numDivisions = prevLeagueData.settings?.divisions || 1;
    const previousSeasonIDNext = prevLeagueData.previous_league_id;

    // Enhanced: Extract playoff rounds with fallback
    let playoffRounds = 0;
    let toiletRounds = 0;

    try {
      if (winnersData && winnersData.length > 0) {
        playoffRounds = Math.max(...winnersData.map((m) => m.r || 0));
      }

      if (losersData && losersData.length > 0) {
        toiletRounds = Math.max(...losersData.map((m) => m.r || 0));
      }
    } catch (error) {
      debugAwardProcessing(
        "Playoff Rounds Extraction Failed",
        {
          seasonID: previousSeasonID,
          error: error.message,
        },
        "warn",
      );
    }

    return {
      losersData: losersData || [],
      winnersData: winnersData || [],
      year,
      previousRosters,
      numDivisions,
      previousSeasonID: previousSeasonIDNext,
      playoffRounds,
      toiletRounds,
      leagueMetadata: prevLeagueData.metadata || {},
      leagueSettings: {
        total_rosters: prevLeagueData.total_rosters,
        playoff_teams: prevLeagueData.settings?.playoff_teams,
        playoff_week_start: prevLeagueData.settings?.playoff_week_start,
        divisions: numDivisions,
        ...prevLeagueData.settings,
      },
    };
  } catch (error) {
    debugAwardProcessing(
      "Enhanced League Data Fetch Failed",
      {
        seasonID: previousSeasonID,
        error: error.message,
      },
      "error",
    );
    return null;
  }
};

/**
 * ENHANCED: Extract championship information with multiple detection methods
 * @param {Array} winnersData - Winners bracket data
 * @param {Array} losersData - Losers bracket data
 * @param {Object} playoffStructure - Parsed playoff structure
 * @param {number} playoffRounds - Number of playoff rounds
 * @returns {Object} Championship information with detection method
 */
function extractChampionshipInfoEnhanced(
  winnersData,
  losersData,
  playoffStructure,
  playoffRounds,
) {
  let championshipInfo = {
    champion: null,
    second: null,
    third: null,
    detectionMethod: "none",
  };

  // Method 1: Use playoff structure championship data (most reliable)
  if (playoffStructure.championship?.championshipMatch) {
    const { champion, runnerUp } =
      playoffStructure.championship.championshipMatch;

    championshipInfo.champion = champion;
    championshipInfo.second = runnerUp;
    championshipInfo.detectionMethod = "playoff_structure";

    // Check for third place from playoff structure
    if (playoffStructure.championship.thirdPlaceMatch) {
      championshipInfo.third =
        playoffStructure.championship.thirdPlaceMatch.thirdPlace;
    }

    debugAwardProcessing(
      "Championship - Playoff Structure Method",
      championshipInfo,
    );
    return championshipInfo;
  }

  // Method 2: Legacy detection (original logic as fallback)
  try {
    const finalsMatch = winnersData.filter(
      (m) => m.r == playoffRounds && m.t1_from?.w,
    )[0];

    if (finalsMatch && finalsMatch.w) {
      championshipInfo.champion = finalsMatch.w;
      championshipInfo.second = finalsMatch.l;
      championshipInfo.detectionMethod = "legacy_finals";

      // Look for third place match
      const runnersUpMatch = winnersData.filter(
        (m) => m.r == playoffRounds && m.t1_from?.l,
      )[0];

      if (runnersUpMatch && runnersUpMatch.w) {
        championshipInfo.third = runnersUpMatch.w;
      }

      debugAwardProcessing("Championship - Legacy Method", championshipInfo);
      return championshipInfo;
    }
  } catch (error) {
    debugAwardProcessing(
      "Championship - Legacy Method Failed",
      {
        error: error.message,
      },
      "warn",
    );
  }

  // Method 3: Last resort - find any winner in final round
  try {
    const finalRoundMatches = winnersData.filter((m) => m.r === playoffRounds);
    const winnerMatch = finalRoundMatches.find((m) => m.w);

    if (winnerMatch) {
      championshipInfo.champion = winnerMatch.w;
      championshipInfo.second = winnerMatch.l;
      championshipInfo.detectionMethod = "final_round_winner";

      debugAwardProcessing(
        "Championship - Final Round Method",
        championshipInfo,
      );
    }
  } catch (error) {
    debugAwardProcessing(
      "Championship - Final Round Method Failed",
      {
        error: error.message,
      },
      "warn",
    );
  }

  return championshipInfo;
}

/**
 * ENHANCED: Extract toilet bowl information with enhanced detection
 * @param {Array} losersData - Losers bracket data
 * @param {number} toiletRounds - Number of toilet rounds
 * @param {Object} playoffStructure - Parsed playoff structure
 * @returns {Object} Toilet bowl information
 */
function extractToiletBowlInfoEnhanced(
  losersData,
  toiletRounds,
  playoffStructure,
) {
  let toiletInfo = {
    toilet: null,
    detectionMethod: "none",
  };

  if (!losersData || !Array.isArray(losersData) || losersData.length === 0) {
    debugAwardProcessing("Toilet Bowl - No Losers Bracket Data", {}, "warn");
    return toiletInfo;
  }

  // Method 1: Original logic
  try {
    const toiletBowlMatch = losersData.filter(
      (m) => m.r == toiletRounds && (!m.t1_from || m.t1_from.w),
    )[0];

    if (toiletBowlMatch && toiletBowlMatch.w) {
      toiletInfo.toilet = toiletBowlMatch.w;
      toiletInfo.detectionMethod = "original_logic";

      debugAwardProcessing("Toilet Bowl - Original Method", toiletInfo);
      return toiletInfo;
    }
  } catch (error) {
    debugAwardProcessing(
      "Toilet Bowl - Original Method Failed",
      {
        error: error.message,
      },
      "warn",
    );
  }

  // Method 2: Find winner in final losers bracket round
  try {
    const finalLoserRound = Math.max(...losersData.map((m) => m.r || 0));
    const finalLoserMatch = losersData.find(
      (m) => m.r === finalLoserRound && m.w,
    );

    if (finalLoserMatch) {
      toiletInfo.toilet = finalLoserMatch.w;
      toiletInfo.detectionMethod = "final_loser_round";

      debugAwardProcessing("Toilet Bowl - Final Round Method", toiletInfo);
    }
  } catch (error) {
    debugAwardProcessing(
      "Toilet Bowl - Final Round Method Failed",
      {
        error: error.message,
      },
      "warn",
    );
  }

  return toiletInfo;
}

/**
 * ENHANCED: Build divisions with playoff participant validation
 * @param {Object} params - Parameters object
 * @returns {Object} Enhanced divisions object
 */
function buildDivisionsAndManagersEnhanced({
  previousRosters,
  leagueMetadata,
  numDivisions,
  playoffParticipants,
}) {
  const divisions = {};

  // Initialize divisions
  for (let i = 1; i <= numDivisions; i++) {
    divisions[i] = {
      name: leagueMetadata ? leagueMetadata[`division_${i}`] : null,
      wins: -1,
      points: -1,
      rosterID: null,
      isPlayoffTeam: false, // NEW: Track if division winner made playoffs
    };
  }

  // Process each roster
  for (const rosterID in previousRosters) {
    const rSettings = previousRosters[rosterID].settings;
    const div =
      !rSettings.division || rSettings.division > numDivisions
        ? 1
        : rSettings.division;

    // Calculate total points (including decimals)
    const totalPoints = rSettings.fpts + (rSettings.fpts_decimal || 0) / 100;

    // Check if this is the division winner
    if (
      rSettings.wins > divisions[div].wins ||
      (rSettings.wins == divisions[div].wins &&
        totalPoints > divisions[div].points)
    ) {
      divisions[div].points = totalPoints;
      divisions[div].wins = rSettings.wins;
      divisions[div].rosterID = parseInt(rosterID);

      // PHASE 2 ENHANCEMENT: Check if division winner made playoffs
      divisions[div].isPlayoffTeam = playoffParticipants
        ? playoffParticipants.has(parseInt(rosterID))
        : false;
    }
  }

  debugAwardProcessing("Divisions Built", {
    numDivisions,
    divisions: Object.entries(divisions).map(([div, data]) => ({
      division: div,
      rosterID: data.rosterID,
      wins: data.wins,
      points: Math.round(data.points),
      madePlayoffs: data.isPlayoffTeam,
    })),
  });

  return divisions;
}

/**
 * Calculate confidence score for podium data
 * @param {Object} championshipInfo - Championship information
 * @param {Object} toiletInfo - Toilet bowl information
 * @param {Object} playoffStructure - Playoff structure
 * @returns {number} Confidence score (0-100)
 */
function calculatePodiumConfidence(
  championshipInfo,
  toiletInfo,
  playoffStructure,
) {
  let confidence = 100;

  // Reduce confidence based on detection methods
  if (championshipInfo.detectionMethod === "none") {
    confidence -= 50;
  } else if (championshipInfo.detectionMethod === "final_round_winner") {
    confidence -= 20;
  } else if (championshipInfo.detectionMethod === "legacy_finals") {
    confidence -= 10;
  }

  // Reduce confidence for playoff structure issues
  if (!playoffStructure.validationResults.isValid) {
    confidence -= 20;
  }

  // Reduce confidence for validation warnings
  confidence -= playoffStructure.validationResults.warnings.length * 5;

  return Math.max(0, Math.min(100, confidence));
}

// LEGACY: Original fetch function kept as fallback
const getPreviousLeagueData = async (previousSeasonID) => {
  const resPromises = [
    fetch(`https://api.sleeper.app/v1/league/${previousSeasonID}`, {
      compress: true,
    }),
    getLeagueRosters(previousSeasonID),
    fetch(
      `https://api.sleeper.app/v1/league/${previousSeasonID}/losers_bracket`,
      { compress: true },
    ),
    fetch(
      `https://api.sleeper.app/v1/league/${previousSeasonID}/winners_bracket`,
      { compress: true },
    ),
  ];

  const [leagueRes, rostersData, losersRes, winnersRes] = await waitForAll(
    ...resPromises,
  ).catch((err) => {
    console.error(err);
  });

  if (!leagueRes.ok || !losersRes.ok || !winnersRes.ok) {
    throw new Error(`Failed to fetch data for season ${previousSeasonID}`);
  }

  const jsonPromises = [leagueRes.json(), losersRes.json(), winnersRes.json()];

  const [prevLeagueData, losersData, winnersData] = await waitForAll(
    ...jsonPromises,
  ).catch((err) => {
    console.error(err);
  });

  const year = prevLeagueData.season;
  const previousRosters = rostersData.rosters;
  const numDivisions = prevLeagueData.settings.divisions || 1;
  const previousSeasonIDNext = prevLeagueData.previous_league_id;
  const playoffRounds = winnersData[winnersData.length - 1].r;
  const toiletRounds = losersData[losersData.length - 1].r;

  return {
    losersData,
    winnersData,
    year,
    previousRosters,
    numDivisions,
    previousSeasonID: previousSeasonIDNext,
    playoffRounds,
    toiletRounds,
    leagueMetadata: prevLeagueData.metadata,
  };
};

// LEGACY: Original divisions function kept for compatibility
const buildDivisionsAndManagers = ({
  previousRosters,
  leagueMetadata,
  numDivisions,
}) => {
  const divisions = {};

  for (let i = 1; i <= numDivisions; i++) {
    divisions[i] = {
      name: leagueMetadata ? leagueMetadata[`division_${i}`] : null,
      wins: -1,
      points: -1,
    };
  }

  for (const rosterID in previousRosters) {
    const rSettings = previousRosters[rosterID].settings;
    const div =
      !rSettings.division || rSettings.division > numDivisions
        ? 1
        : rSettings.division;
    if (
      rSettings.wins > divisions[div].wins ||
      (rSettings.wins == divisions[div].wins &&
        rSettings.fpts + rSettings.fpts_decimal / 100 == divisions[div].points)
    ) {
      divisions[div].points = rSettings.fpts + rSettings.fpts_decimal / 100;
      divisions[div].wins = rSettings.wins;
      divisions[div].rosterID = rosterID;
    }
  }

  return divisions;
};
