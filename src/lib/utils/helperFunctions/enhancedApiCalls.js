/**
 * Enhanced API Functions with Comprehensive Validation
 *
 * This module provides validated wrappers for all Sleeper API calls used in the TRL app.
 * It integrates the dataValidation system to ensure data integrity and provide detailed
 * error reporting for debugging and monitoring.
 *
 * @version 1.0.0
 * @author TRL Development Team
 */

import { get } from "svelte/store";
import { leagueData } from "$lib/stores";
import { leagueID } from "$lib/utils/leagueInfo";
import { cacheManager, CACHE_DURATIONS } from "$lib/utils/cacheManager";
import {
  validateLeagueData,
  validateRosterData,
  validateMatchupData,
  validateBracketData,
  validateApiResponse,
  validateJsonStructure,
  validateLeagueRosterConsistency,
  logValidationResult,
  ValidationResult,
  VALIDATION_ERRORS,
  VALIDATION_CONFIG,
} from "./dataValidation";

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Enhanced API configuration
 */
export const API_CONFIG = {
  BASE_URL: "https://api.sleeper.app/v1",
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  VALIDATION_LEVEL: VALIDATION_CONFIG.VALIDATION_LEVELS.WARN,
};

// ============================================================================
// ENHANCED FETCH UTILITIES
// ============================================================================

/**
 * Enhanced fetch with timeout, retries, and validation
 */
async function fetchWithValidation(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

  const fetchOptions = {
    ...options,
    signal: controller.signal,
    compress: true,
  };

  let lastError;

  for (let attempt = 1; attempt <= API_CONFIG.RETRY_ATTEMPTS; attempt++) {
    try {
      console.log(
        `[API_FETCH] Attempt ${attempt}/${API_CONFIG.RETRY_ATTEMPTS}: ${url}`,
      );

      const response = await fetch(url, fetchOptions);
      clearTimeout(timeoutId);

      // Validate response
      const responseValidation = validateApiResponse(response);
      if (!responseValidation.isValid) {
        logValidationResult(responseValidation, `API Response: ${url}`);

        if (response.status >= 500 && attempt < API_CONFIG.RETRY_ATTEMPTS) {
          console.warn(
            `[API_FETCH] Server error ${response.status}, retrying...`,
          );
          await new Promise((resolve) =>
            setTimeout(resolve, API_CONFIG.RETRY_DELAY * attempt),
          );
          continue;
        }

        throw new Error(
          `API request failed: ${responseValidation.errors.map((e) => e.message).join(", ")}`,
        );
      }

      return response;
    } catch (error) {
      lastError = error;

      if (error.name === "AbortError") {
        console.error(`[API_FETCH] Request timeout: ${url}`);
        break; // Don't retry timeout errors
      }

      if (attempt < API_CONFIG.RETRY_ATTEMPTS) {
        console.warn(
          `[API_FETCH] Attempt ${attempt} failed, retrying:`,
          error.message,
        );
        await new Promise((resolve) =>
          setTimeout(resolve, API_CONFIG.RETRY_DELAY * attempt),
        );
      } else {
        console.error(`[API_FETCH] All attempts failed for: ${url}`, error);
      }
    }
  }

  clearTimeout(timeoutId);
  throw (
    lastError ||
    new Error(
      `Failed to fetch ${url} after ${API_CONFIG.RETRY_ATTEMPTS} attempts`,
    )
  );
}

/**
 * Parse and validate JSON response
 */
async function parseAndValidateJson(response, url, validator = null) {
  try {
    const data = await response.json();

    // Basic JSON structure validation
    const jsonValidation = validateJsonStructure(data);
    if (!jsonValidation.isValid) {
      logValidationResult(jsonValidation, `JSON Parse: ${url}`);
      throw new Error(
        `Invalid JSON structure: ${jsonValidation.errors.map((e) => e.message).join(", ")}`,
      );
    }

    // Apply specific validator if provided
    if (validator) {
      const specificValidation = validator(data);
      logValidationResult(
        specificValidation,
        `Data Validation: ${url}`,
        API_CONFIG.VALIDATION_LEVEL,
      );

      if (
        !specificValidation.isValid &&
        API_CONFIG.VALIDATION_LEVEL ===
          VALIDATION_CONFIG.VALIDATION_LEVELS.STRICT
      ) {
        throw new Error(
          `Data validation failed: ${specificValidation.errors.map((e) => e.message).join(", ")}`,
        );
      }

      // Return data even with warnings in non-strict mode
      return specificValidation.data || data;
    }

    return data;
  } catch (error) {
    if (error.name === "SyntaxError") {
      console.error(`[JSON_PARSE] Invalid JSON from ${url}:`, error);
      throw new Error(`Invalid JSON response from ${url}`);
    }
    throw error;
  }
}

// ============================================================================
// ENHANCED LEAGUE DATA FUNCTIONS
// ============================================================================

/**
 * Enhanced league data fetching with comprehensive validation
 */
export const getLeagueDataValidated = async (queryLeagueID = leagueID) => {
  // Check if data is already in the store
  if (get(leagueData)[queryLeagueID]) {
    const existingData = get(leagueData)[queryLeagueID];

    // Validate cached data
    const cacheValidation = validateLeagueData(existingData);
    logValidationResult(
      cacheValidation,
      `Cached League Data: ${queryLeagueID}`,
    );

    if (cacheValidation.isValid) {
      return existingData;
    } else {
      console.warn(
        `[CACHE_VALIDATION] Cached league data is invalid, refetching...`,
      );
    }
  }

  const url = `${API_CONFIG.BASE_URL}/league/${queryLeagueID}`;

  try {
    // Use enhanced fetch with validation
    const response = await fetchWithValidation(url);
    const data = await parseAndValidateJson(response, url, validateLeagueData);

    // Update store with validated data
    leagueData.update((ld) => {
      ld[queryLeagueID] = data;
      return ld;
    });

    console.log(
      `[LEAGUE_DATA] Successfully fetched and validated league data for ${queryLeagueID}`,
    );
    return data;
  } catch (error) {
    console.error(
      `[LEAGUE_DATA] Failed to fetch league data for ${queryLeagueID}:`,
      error,
    );
    throw new Error(`Unable to fetch league data: ${error.message}`);
  }
};

/**
 * Enhanced roster data fetching with validation
 */
export const getRostersValidated = async (queryLeagueID = leagueID) => {
  const url = `${API_CONFIG.BASE_URL}/league/${queryLeagueID}/rosters`;

  try {
    const response = await fetchWithValidation(url);
    const data = await parseAndValidateJson(response, url, validateRosterData);

    console.log(
      `[ROSTERS] Successfully fetched and validated ${data.length} rosters for league ${queryLeagueID}`,
    );
    return data;
  } catch (error) {
    console.error(
      `[ROSTERS] Failed to fetch roster data for ${queryLeagueID}:`,
      error,
    );
    throw new Error(`Unable to fetch roster data: ${error.message}`);
  }
};

/**
 * Enhanced matchup data fetching with validation
 */
export const getMatchupsValidated = async (
  queryLeagueID = leagueID,
  week = 1,
) => {
  const url = `${API_CONFIG.BASE_URL}/league/${queryLeagueID}/matchups/${week}`;

  try {
    const response = await fetchWithValidation(url);
    const data = await parseAndValidateJson(response, url, (data) =>
      validateMatchupData(data, week),
    );

    console.log(
      `[MATCHUPS] Successfully fetched and validated week ${week} matchups for league ${queryLeagueID}`,
    );
    return data;
  } catch (error) {
    console.error(
      `[MATCHUPS] Failed to fetch matchup data for week ${week}, league ${queryLeagueID}:`,
      error,
    );
    throw new Error(`Unable to fetch matchup data: ${error.message}`);
  }
};

/**
 * Enhanced bracket data fetching with validation
 */
export const getBracketsValidated = async (
  queryLeagueID = leagueID,
  bracketType = "winners_bracket",
) => {
  const url = `${API_CONFIG.BASE_URL}/league/${queryLeagueID}/${bracketType}`;

  try {
    const response = await fetchWithValidation(url);
    const data = await parseAndValidateJson(response, url, (data) =>
      validateBracketData(data, bracketType),
    );

    console.log(
      `[BRACKETS] Successfully fetched and validated ${bracketType} for league ${queryLeagueID}`,
    );
    return data;
  } catch (error) {
    console.error(
      `[BRACKETS] Failed to fetch ${bracketType} for league ${queryLeagueID}:`,
      error,
    );
    throw new Error(`Unable to fetch bracket data: ${error.message}`);
  }
};

/**
 * Enhanced user data fetching with validation
 */
export const getUsersValidated = async (queryLeagueID = leagueID) => {
  const url = `${API_CONFIG.BASE_URL}/league/${queryLeagueID}/users`;

  try {
    const response = await fetchWithValidation(url);
    const data = await parseAndValidateJson(response, url);

    // Basic validation for users array
    if (!Array.isArray(data)) {
      throw new Error("Users data must be an array");
    }

    data.forEach((user, index) => {
      if (!user.user_id || !user.username) {
        console.warn(`[USERS] User ${index} missing required fields:`, user);
      }
    });

    console.log(
      `[USERS] Successfully fetched and validated ${data.length} users for league ${queryLeagueID}`,
    );
    return data;
  } catch (error) {
    console.error(
      `[USERS] Failed to fetch user data for ${queryLeagueID}:`,
      error,
    );
    throw new Error(`Unable to fetch user data: ${error.message}`);
  }
};

// ============================================================================
// ENHANCED BATCH OPERATIONS
// ============================================================================

/**
 * Fetch and validate multiple weeks of matchup data
 */
export const getMultipleMatchupsValidated = async (
  queryLeagueID = leagueID,
  weeks = [],
) => {
  if (!Array.isArray(weeks) || weeks.length === 0) {
    throw new Error("Weeks parameter must be a non-empty array");
  }

  const results = {};
  const errors = [];

  for (const week of weeks) {
    try {
      results[week] = await getMatchupsValidated(queryLeagueID, week);
    } catch (error) {
      errors.push({ week, error: error.message });
      console.error(`[MULTI_MATCHUPS] Failed to fetch week ${week}:`, error);
    }
  }

  if (errors.length > 0) {
    console.warn(
      `[MULTI_MATCHUPS] ${errors.length} weeks failed to fetch:`,
      errors,
    );
  }

  console.log(
    `[MULTI_MATCHUPS] Successfully fetched ${Object.keys(results).length}/${weeks.length} weeks`,
  );
  return { data: results, errors };
};

/**
 * Fetch and cross-validate league data consistency
 */
export const getLeagueDataWithConsistencyCheck = async (
  queryLeagueID = leagueID,
) => {
  try {
    // Fetch both league data and rosters
    const [leagueData, rosterData] = await Promise.all([
      getLeagueDataValidated(queryLeagueID),
      getRostersValidated(queryLeagueID),
    ]);

    // Cross-validate consistency
    const consistencyValidation = validateLeagueRosterConsistency(
      leagueData,
      rosterData,
    );
    logValidationResult(
      consistencyValidation,
      `League-Roster Consistency: ${queryLeagueID}`,
    );

    if (
      !consistencyValidation.isValid &&
      API_CONFIG.VALIDATION_LEVEL === VALIDATION_CONFIG.VALIDATION_LEVELS.STRICT
    ) {
      throw new Error(
        `Data consistency check failed: ${consistencyValidation.errors.map((e) => e.message).join(", ")}`,
      );
    }

    return {
      leagueData,
      rosterData,
      consistencyCheck: consistencyValidation,
    };
  } catch (error) {
    console.error(
      `[CONSISTENCY_CHECK] Failed for league ${queryLeagueID}:`,
      error,
    );
    throw error;
  }
};

// ============================================================================
// HISTORICAL DATA VALIDATION
// ============================================================================

/**
 * Fetch and validate historical league data across seasons
 */
export const getHistoricalLeagueDataValidated = async (
  startLeagueID = leagueID,
  maxSeasons = 10,
) => {
  const historicalData = {};
  const validationResults = {};
  let currentLeagueID = startLeagueID;
  let seasonsProcessed = 0;

  while (
    currentLeagueID &&
    currentLeagueID !== "0" &&
    seasonsProcessed < maxSeasons
  ) {
    try {
      console.log(
        `[HISTORICAL] Processing season ${seasonsProcessed + 1}, league ${currentLeagueID}`,
      );

      const leagueData = await getLeagueDataValidated(currentLeagueID);
      const year = parseInt(leagueData.season);

      historicalData[year] = {
        leagueID: currentLeagueID,
        data: leagueData,
      };

      // Store validation metadata
      validationResults[year] = {
        processed: true,
        leagueID: currentLeagueID,
        timestamp: new Date().toISOString(),
      };

      // Move to previous season
      currentLeagueID = leagueData.previous_league_id;
      seasonsProcessed++;
    } catch (error) {
      console.error(
        `[HISTORICAL] Failed to process league ${currentLeagueID}:`,
        error,
      );

      // Store error information
      validationResults[`error_${currentLeagueID}`] = {
        processed: false,
        error: error.message,
        leagueID: currentLeagueID,
        timestamp: new Date().toISOString(),
      };

      break; // Stop processing on error
    }
  }

  const summary = {
    seasonsProcessed,
    totalFound: Object.keys(historicalData).length,
    years: Object.keys(historicalData)
      .map(Number)
      .sort((a, b) => b - a),
    validationResults,
  };

  console.log(`[HISTORICAL] Completed processing:`, summary);

  return {
    data: historicalData,
    summary,
    validationResults,
  };
};

// ============================================================================
// ERROR RECOVERY AND FALLBACK FUNCTIONS
// ============================================================================

/**
 * Get data with fallback to cached version on validation failure
 */
export const getDataWithFallback = async (
  fetchFunction,
  cacheKey,
  fallbackData = null,
) => {
  try {
    return await fetchFunction();
  } catch (error) {
    console.warn(
      `[FALLBACK] Primary fetch failed, attempting fallback:`,
      error.message,
    );

    // Try to get from cache manager
    if (cacheKey) {
      try {
        const cachedData = cacheManager.get(cacheKey);
        if (cachedData) {
          console.log(`[FALLBACK] Using cached data for ${cacheKey}`);
          return cachedData;
        }
      } catch (cacheError) {
        console.warn(`[FALLBACK] Cache retrieval failed:`, cacheError.message);
      }
    }

    // Use provided fallback data
    if (fallbackData) {
      console.log(`[FALLBACK] Using provided fallback data`);
      return fallbackData;
    }

    // Re-throw original error if no fallback available
    throw error;
  }
};

/**
 * Health check for API endpoints
 */
export const performApiHealthCheck = async () => {
  const healthCheck = {
    timestamp: new Date().toISOString(),
    endpoints: {},
    overallStatus: "unknown",
  };

  const testEndpoints = [
    {
      name: "league",
      url: `${API_CONFIG.BASE_URL}/league/${leagueID}`,
      validator: validateLeagueData,
    },
    {
      name: "rosters",
      url: `${API_CONFIG.BASE_URL}/league/${leagueID}/rosters`,
      validator: validateRosterData,
    },
    {
      name: "nfl_state",
      url: `${API_CONFIG.BASE_URL}/state/nfl`,
      validator: null,
    },
  ];

  let passedTests = 0;

  for (const endpoint of testEndpoints) {
    try {
      console.log(`[HEALTH_CHECK] Testing ${endpoint.name}...`);

      const startTime = Date.now();
      const response = await fetchWithValidation(endpoint.url);
      const data = await parseAndValidateJson(
        response,
        endpoint.url,
        endpoint.validator,
      );
      const endTime = Date.now();

      healthCheck.endpoints[endpoint.name] = {
        status: "healthy",
        responseTime: endTime - startTime,
        dataSize: JSON.stringify(data).length,
        validationPassed: true,
      };

      passedTests++;
    } catch (error) {
      healthCheck.endpoints[endpoint.name] = {
        status: "unhealthy",
        error: error.message,
        validationPassed: false,
      };
    }
  }

  healthCheck.overallStatus =
    passedTests === testEndpoints.length
      ? "healthy"
      : passedTests > 0
        ? "partial"
        : "unhealthy";

  console.log(`[HEALTH_CHECK] Completed:`, healthCheck);
  return healthCheck;
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  getLeagueDataValidated,
  getRostersValidated,
  getMatchupsValidated,
  getBracketsValidated,
  getUsersValidated,
  getMultipleMatchupsValidated,
  getLeagueDataWithConsistencyCheck,
  getHistoricalLeagueDataValidated,
  getDataWithFallback,
  performApiHealthCheck,
  fetchWithValidation,
  parseAndValidateJson,
  API_CONFIG,
};
