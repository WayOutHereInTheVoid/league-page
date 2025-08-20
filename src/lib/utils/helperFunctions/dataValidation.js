/**
 * Comprehensive Data Validation System for TRL Fantasy Football App
 * 
 * This module provides robust validation for:
 * - Sleeper API responses
 * - Manager statistics calculations
 * - Playoff detection data
 * - Cross-data integrity checks
 * 
 * @version 1.0.0
 * @author TRL Development Team
 */

// ============================================================================
// CONFIGURATION AND CONSTANTS
// ============================================================================

/**
 * Validation configuration settings
 */
export const VALIDATION_CONFIG = {
    // Thresholds for detecting anomalies
    THRESHOLDS: {
        MIN_SEASON_GAMES: 10,           // Minimum games per season
        MAX_SEASON_GAMES: 20,           // Maximum games per season
        MIN_POINTS_PER_GAME: 50,        // Minimum reasonable points per game
        MAX_POINTS_PER_GAME: 250,       // Maximum reasonable points per game
        MIN_WIN_PERCENTAGE: 0,          // Minimum win percentage (0%)
        MAX_WIN_PERCENTAGE: 100,        // Maximum win percentage (100%)
        MIN_PLAYOFF_TEAMS: 4,           // Minimum playoff teams
        MAX_PLAYOFF_TEAMS: 14,          // Maximum playoff teams
    },
    
    // Required fields for different data types
    REQUIRED_FIELDS: {
        LEAGUE_DATA: ['league_id', 'name', 'season', 'total_rosters', 'settings'],
        ROSTER_DATA: ['roster_id', 'owner_id', 'players'],
        USER_DATA: ['user_id', 'username', 'display_name'],
        MATCHUP_DATA: ['roster_id', 'points', 'matchup_id'],
        TRANSACTION_DATA: ['transaction_id', 'type', 'roster_ids', 'status'],
        BRACKET_DATA: ['r', 'm'],
        MANAGER_STATS: ['wins', 'losses', 'fpts'],
    },
    
    // Validation levels
    VALIDATION_LEVELS: {
        STRICT: 'strict',     // Fail on any validation error
        WARN: 'warn',         // Log warnings but continue
        SILENT: 'silent'      // Only log critical errors
    }
};

/**
 * Validation error types
 */
export const VALIDATION_ERRORS = {
    MISSING_REQUIRED_FIELD: 'missing_required_field',
    INVALID_DATA_TYPE: 'invalid_data_type',
    OUT_OF_RANGE: 'out_of_range',
    INCONSISTENT_DATA: 'inconsistent_data',
    MALFORMED_RESPONSE: 'malformed_response',
    NETWORK_ERROR: 'network_error',
    TIMEOUT_ERROR: 'timeout_error'
};

// ============================================================================
// VALIDATION RESULT CLASSES
// ============================================================================

/**
 * Represents a validation result with details about success/failure
 */
export class ValidationResult {
    constructor(isValid = true, errors = [], warnings = [], data = null) {
        this.isValid = isValid;
        this.errors = errors;
        this.warnings = warnings;
        this.data = data;
        this.timestamp = new Date().toISOString();
    }

    /**
     * Add an error to the validation result
     */
    addError(type, message, field = null, value = null) {
        this.errors.push({
            type,
            message,
            field,
            value,
            timestamp: new Date().toISOString()
        });
        this.isValid = false;
    }

    /**
     * Add a warning to the validation result
     */
    addWarning(type, message, field = null, value = null) {
        this.warnings.push({
            type,
            message,
            field,
            value,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Merge another validation result into this one
     */
    merge(other) {
        this.errors = [...this.errors, ...other.errors];
        this.warnings = [...this.warnings, ...other.warnings];
        this.isValid = this.isValid && other.isValid;
        return this;
    }

    /**
     * Get a summary of validation issues
     */
    getSummary() {
        return {
            isValid: this.isValid,
            errorCount: this.errors.length,
            warningCount: this.warnings.length,
            hasIssues: this.errors.length > 0 || this.warnings.length > 0
        };
    }
}

// ============================================================================
// CORE VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate that required fields exist in an object
 */
export function validateRequiredFields(data, requiredFields, context = 'object') {
    const result = new ValidationResult();

    if (!data || typeof data !== 'object') {
        result.addError(
            VALIDATION_ERRORS.INVALID_DATA_TYPE,
            `${context} must be an object`,
            null,
            typeof data
        );
        return result;
    }

    for (const field of requiredFields) {
        if (!(field in data) || data[field] === null || data[field] === undefined) {
            result.addError(
                VALIDATION_ERRORS.MISSING_REQUIRED_FIELD,
                `Required field '${field}' is missing or null in ${context}`,
                field,
                data[field]
            );
        }
    }

    result.data = data;
    return result;
}

/**
 * Validate data type and basic structure
 */
export function validateDataType(value, expectedType, field = 'value') {
    const result = new ValidationResult();
    const actualType = Array.isArray(value) ? 'array' : typeof value;

    if (actualType !== expectedType) {
        result.addError(
            VALIDATION_ERRORS.INVALID_DATA_TYPE,
            `Field '${field}' expected ${expectedType}, got ${actualType}`,
            field,
            actualType
        );
    }

    result.data = value;
    return result;
}

/**
 * Validate numeric ranges
 */
export function validateRange(value, min, max, field = 'value') {
    const result = new ValidationResult();

    if (typeof value !== 'number' || isNaN(value)) {
        result.addError(
            VALIDATION_ERRORS.INVALID_DATA_TYPE,
            `Field '${field}' must be a valid number`,
            field,
            value
        );
        return result;
    }

    if (value < min || value > max) {
        result.addError(
            VALIDATION_ERRORS.OUT_OF_RANGE,
            `Field '${field}' value ${value} is outside valid range [${min}, ${max}]`,
            field,
            value
        );
    }

    result.data = value;
    return result;
}

// ============================================================================
// SLEEPER API VALIDATION
// ============================================================================

/**
 * Validate Sleeper League Data response
 */
export function validateLeagueData(leagueData) {
    const result = new ValidationResult();

    // Check required fields
    const requiredFieldsResult = validateRequiredFields(
        leagueData,
        ['league_id', 'name', 'season', 'total_rosters', 'settings'], // Using direct value to avoid import timing issues
        'league data'
    );
    result.merge(requiredFieldsResult);

    if (!result.isValid) return result;

    // Validate specific field types and ranges
    const rosters = leagueData.total_rosters;
    if (typeof rosters === 'number') {
        const rostersValidation = validateRange(rosters, 6, 20, 'total_rosters');
        result.merge(rostersValidation);
    }

    // Validate season format
    const season = leagueData.season;
    if (typeof season === 'string') {
        const currentYear = new Date().getFullYear();
        const seasonYear = parseInt(season);
        if (seasonYear < 2009 || seasonYear > currentYear + 1) {
            result.addWarning(
                VALIDATION_ERRORS.OUT_OF_RANGE,
                `Season year ${seasonYear} seems unusual`,
                'season',
                season
            );
        }
    }

    // Validate settings object
    if (leagueData.settings) {
        if (typeof leagueData.settings !== 'object') {
            result.addError(
                VALIDATION_ERRORS.INVALID_DATA_TYPE,
                'League settings must be an object',
                'settings',
                typeof leagueData.settings
            );
        } else {
            // Validate playoff settings if present
            if ('playoff_week_start' in leagueData.settings) {
                const playoffWeek = leagueData.settings.playoff_week_start;
                if (typeof playoffWeek === 'number') {
                    const playoffValidation = validateRange(playoffWeek, 13, 18, 'playoff_week_start');
                    result.merge(playoffValidation);
                }
            }
        }
    }

    result.data = leagueData;
    return result;
}

/**
 * Validate Sleeper Roster Data response
 */
export function validateRosterData(rosterData) {
    const result = new ValidationResult();

    if (!Array.isArray(rosterData)) {
        result.addError(
            VALIDATION_ERRORS.INVALID_DATA_TYPE,
            'Roster data must be an array',
            null,
            typeof rosterData
        );
        return result;
    }

    rosterData.forEach((roster, index) => {
        const rosterValidation = validateRequiredFields(
            roster,
            ['roster_id', 'owner_id', 'players'], // Using direct value to avoid import timing issues
            `roster ${index}`
        );
        result.merge(rosterValidation);

        // Validate roster ID is positive integer
        if (typeof roster.roster_id === 'number') {
            if (roster.roster_id < 1 || !Number.isInteger(roster.roster_id)) {
                result.addError(
                    VALIDATION_ERRORS.OUT_OF_RANGE,
                    `Invalid roster_id: ${roster.roster_id}`,
                    'roster_id',
                    roster.roster_id
                );
            }
        }

        // Validate players array
        if (roster.players && !Array.isArray(roster.players)) {
            result.addError(
                VALIDATION_ERRORS.INVALID_DATA_TYPE,
                `Roster ${roster.roster_id} players must be an array`,
                'players',
                typeof roster.players
            );
        }
    });

    result.data = rosterData;
    return result;
}

/**
 * Validate Sleeper Matchup Data response
 */
export function validateMatchupData(matchupData, week = null) {
    const result = new ValidationResult();

    if (!Array.isArray(matchupData)) {
        result.addError(
            VALIDATION_ERRORS.INVALID_DATA_TYPE,
            'Matchup data must be an array',
            null,
            typeof matchupData
        );
        return result;
    }

    const context = week ? `week ${week} matchups` : 'matchups';
    
    matchupData.forEach((matchup, index) => {
        const matchupValidation = validateRequiredFields(
            matchup,
            ['roster_id', 'points', 'matchup_id'], // Using direct value to avoid import timing issues
            `${context} ${index}`
        );
        result.merge(matchupValidation);

        // Validate points range
        if (typeof matchup.points === 'number') {
            const pointsValidation = validateRange(
                matchup.points,
                50, // MIN_POINTS_PER_GAME - using direct value to avoid import timing issues
                250, // MAX_POINTS_PER_GAME - using direct value to avoid import timing issues
                'points'
            );
            if (!pointsValidation.isValid) {
                result.addWarning(
                    VALIDATION_ERRORS.OUT_OF_RANGE,
                    `Unusual points value: ${matchup.points} in ${context}`,
                    'points',
                    matchup.points
                );
            }
        }

        // Validate starters array if present
        if (matchup.starters && !Array.isArray(matchup.starters)) {
            result.addError(
                VALIDATION_ERRORS.INVALID_DATA_TYPE,
                `Matchup starters must be an array`,
                'starters',
                typeof matchup.starters
            );
        }
    });

    result.data = matchupData;
    return result;
}

/**
 * Validate Sleeper Bracket Data response
 */
export function validateBracketData(bracketData, bracketType = 'winners') {
    const result = new ValidationResult();

    if (!Array.isArray(bracketData)) {
        result.addError(
            VALIDATION_ERRORS.INVALID_DATA_TYPE,
            `${bracketType} bracket data must be an array`,
            null,
            typeof bracketData
        );
        return result;
    }

    bracketData.forEach((match, index) => {
        const matchValidation = validateRequiredFields(
            match,
            ['r', 'm'], // Using direct value to avoid import timing issues
            `${bracketType} bracket match ${index}`
        );
        result.merge(matchValidation);

        // Validate round numbers
        if (typeof match.r === 'number') {
            const roundValidation = validateRange(match.r, 1, 5, 'round');
            result.merge(roundValidation);
        }

        // Validate match ID
        if (typeof match.m === 'number') {
            if (match.m < 1) {
                result.addError(
                    VALIDATION_ERRORS.OUT_OF_RANGE,
                    `Invalid match ID: ${match.m}`,
                    'match_id',
                    match.m
                );
            }
        }
    });

    result.data = bracketData;
    return result;
}

// ============================================================================
// MANAGER STATISTICS VALIDATION
// ============================================================================

/**
 * Validate manager statistics data
 */
export function validateManagerStats(managerStats, managerID = null) {
    const result = new ValidationResult();
    const context = managerID ? `manager ${managerID} stats` : 'manager stats';

    // Check if stats object exists
    if (!managerStats || typeof managerStats !== 'object') {
        result.addError(
            VALIDATION_ERRORS.INVALID_DATA_TYPE,
            `${context} must be an object`,
            null,
            typeof managerStats
        );
        return result;
    }

    // Validate seasons array
    if ('seasons' in managerStats) {
        if (!Array.isArray(managerStats.seasons)) {
            result.addError(
                VALIDATION_ERRORS.INVALID_DATA_TYPE,
                'Manager seasons must be an array',
                'seasons',
                typeof managerStats.seasons
            );
        } else {
            // Validate each season
            managerStats.seasons.forEach((season, index) => {
                const seasonValidation = validateSeasonData(season, `${context} season ${index}`);
                result.merge(seasonValidation);
            });
        }
    }

    // Validate total stats
    if ('totalStats' in managerStats) {
        const totalStatsValidation = validateTotalStats(managerStats.totalStats, context);
        result.merge(totalStatsValidation);
    }

    result.data = managerStats;
    return result;
}

/**
 * Validate individual season data
 */
export function validateSeasonData(seasonData, context = 'season') {
    const result = new ValidationResult();

    const requiredSeasonFields = ['year', 'wins', 'losses', 'fpts'];
    const requiredFieldsResult = validateRequiredFields(
        seasonData,
        requiredSeasonFields,
        context
    );
    result.merge(requiredFieldsResult);

    if (!result.isValid) return result;

    // Validate year
    if (typeof seasonData.year === 'number') {
        const currentYear = new Date().getFullYear();
        const yearValidation = validateRange(seasonData.year, 2009, currentYear + 1, 'year');
        result.merge(yearValidation);
    }

    // Validate win/loss counts
    ['wins', 'losses', 'ties'].forEach(field => {
        if (field in seasonData && typeof seasonData[field] === 'number') {
            const rangeValidation = validateRange(seasonData[field], 0, 20, field);
            result.merge(rangeValidation);
        }
    });

    // Validate total games count
    const totalGames = (seasonData.wins || 0) + (seasonData.losses || 0) + (seasonData.ties || 0);
    if (totalGames > 0) {
        const gamesValidation = validateRange(
            totalGames,
            10, // MIN_SEASON_GAMES - using direct value to avoid import timing issues
            20, // MAX_SEASON_GAMES - using direct value to avoid import timing issues
            'total games'
        );
        if (!gamesValidation.isValid) {
            result.addWarning(
                VALIDATION_ERRORS.OUT_OF_RANGE,
                `Unusual game count: ${totalGames} games in ${context}`,
                'total_games',
                totalGames
            );
        }
    }

    // Validate points
    if (typeof seasonData.fpts === 'number') {
        const avgPointsPerGame = totalGames > 0 ? seasonData.fpts / totalGames : seasonData.fpts;
        if (avgPointsPerGame > 0) {
            const pointsValidation = validateRange(
                avgPointsPerGame,
                50, // MIN_POINTS_PER_GAME - using direct value to avoid import timing issues
                250, // MAX_POINTS_PER_GAME - using direct value to avoid import timing issues
                'average points per game'
            );
            if (!pointsValidation.isValid) {
                result.addWarning(
                    VALIDATION_ERRORS.OUT_OF_RANGE,
                    `Unusual points per game: ${avgPointsPerGame.toFixed(2)} in ${context}`,
                    'avg_points_per_game',
                    avgPointsPerGame
                );
            }
        }
    }

    // Validate lineup efficiency if present
    if ('lineupEfficiency' in seasonData && typeof seasonData.lineupEfficiency === 'number') {
        const efficiencyValidation = validateRange(seasonData.lineupEfficiency, 0, 100, 'lineup efficiency');
        result.merge(efficiencyValidation);
    }

    result.data = seasonData;
    return result;
}

/**
 * Validate total statistics
 */
export function validateTotalStats(totalStats, context = 'total stats') {
    const result = new ValidationResult();

    const requiredTotalFields = ['totalWins', 'totalLosses', 'totalPoints', 'seasonsPlayed'];
    const requiredFieldsResult = validateRequiredFields(
        totalStats,
        requiredTotalFields,
        context
    );
    result.merge(requiredFieldsResult);

    if (!result.isValid) return result;

    // Validate counts are non-negative
    ['totalWins', 'totalLosses', 'totalTies', 'seasonsPlayed', 'playoffAppearances', 'championships'].forEach(field => {
        if (field in totalStats && typeof totalStats[field] === 'number') {
            if (totalStats[field] < 0) {
                result.addError(
                    VALIDATION_ERRORS.OUT_OF_RANGE,
                    `${field} cannot be negative`,
                    field,
                    totalStats[field]
                );
            }
        }
    });

    // Validate win percentage
    if ('winPercentage' in totalStats && typeof totalStats.winPercentage === 'number') {
        const winPctValidation = validateRange(
            totalStats.winPercentage,
            0, // MIN_WIN_PERCENTAGE - using direct value to avoid import timing issues
            100, // MAX_WIN_PERCENTAGE - using direct value to avoid import timing issues
            'win percentage'
        );
        result.merge(winPctValidation);
    }

    // Validate logical consistency
    if (totalStats.playoffAppearances > totalStats.seasonsPlayed) {
        result.addError(
            VALIDATION_ERRORS.INCONSISTENT_DATA,
            'Playoff appearances cannot exceed seasons played',
            'playoff_appearances',
            totalStats.playoffAppearances
        );
    }

    if (totalStats.championships > totalStats.playoffAppearances) {
        result.addError(
            VALIDATION_ERRORS.INCONSISTENT_DATA,
            'Championships cannot exceed playoff appearances',
            'championships',
            totalStats.championships
        );
    }

    result.data = totalStats;
    return result;
}

// ============================================================================
// CROSS-DATA VALIDATION
// ============================================================================

/**
 * Validate consistency between league data and rosters
 */
export function validateLeagueRosterConsistency(leagueData, rosterData) {
    const result = new ValidationResult();

    if (!leagueData || !rosterData) {
        result.addError(
            VALIDATION_ERRORS.MISSING_REQUIRED_FIELD,
            'Both league data and roster data are required for consistency check',
            null,
            { leagueData: !!leagueData, rosterData: !!rosterData }
        );
        return result;
    }

    // Check roster count matches league settings
    const expectedRosters = leagueData.total_rosters;
    const actualRosters = rosterData.length;

    if (expectedRosters !== actualRosters) {
        result.addError(
            VALIDATION_ERRORS.INCONSISTENT_DATA,
            `League expects ${expectedRosters} rosters but found ${actualRosters}`,
            'roster_count',
            { expected: expectedRosters, actual: actualRosters }
        );
    }

    // Check for duplicate roster IDs
    const rosterIds = rosterData.map(r => r.roster_id);
    const uniqueRosterIds = [...new Set(rosterIds)];

    if (rosterIds.length !== uniqueRosterIds.length) {
        result.addError(
            VALIDATION_ERRORS.INCONSISTENT_DATA,
            'Duplicate roster IDs found in roster data',
            'roster_ids',
            rosterIds
        );
    }

    result.data = { leagueData, rosterData };
    return result;
}

/**
 * Validate consistency between matchup data across weeks
 */
export function validateMatchupConsistency(matchupsData, expectedRosterIds) {
    const result = new ValidationResult();

    if (!Array.isArray(matchupsData) || !Array.isArray(expectedRosterIds)) {
        result.addError(
            VALIDATION_ERRORS.INVALID_DATA_TYPE,
            'Matchups data and expected roster IDs must be arrays',
            null,
            { matchupsType: typeof matchupsData, rostersType: typeof expectedRosterIds }
        );
        return result;
    }

    matchupsData.forEach((weekMatchups, weekIndex) => {
        if (!Array.isArray(weekMatchups)) return;

        const weekRosterIds = weekMatchups.map(m => m.roster_id);
        const missingRosters = expectedRosterIds.filter(id => !weekRosterIds.includes(id));
        const extraRosters = weekRosterIds.filter(id => !expectedRosterIds.includes(id));

        if (missingRosters.length > 0) {
            result.addWarning(
                VALIDATION_ERRORS.INCONSISTENT_DATA,
                `Week ${weekIndex + 1}: Missing rosters ${missingRosters.join(', ')}`,
                'missing_rosters',
                missingRosters
            );
        }

        if (extraRosters.length > 0) {
            result.addWarning(
                VALIDATION_ERRORS.INCONSISTENT_DATA,
                `Week ${weekIndex + 1}: Unexpected rosters ${extraRosters.join(', ')}`,
                'extra_rosters',
                extraRosters
            );
        }
    });

    result.data = matchupsData;
    return result;
}

// ============================================================================
// NETWORK AND API VALIDATION
// ============================================================================

/**
 * Validate API response structure and status
 */
export function validateApiResponse(response, expectedStatus = 200) {
    const result = new ValidationResult();

    if (!response) {
        result.addError(
            VALIDATION_ERRORS.NETWORK_ERROR,
            'No response received from API',
            'response',
            null
        );
        return result;
    }

    // Validate response status
    if (response.status !== expectedStatus) {
        result.addError(
            VALIDATION_ERRORS.NETWORK_ERROR,
            `API returned status ${response.status}, expected ${expectedStatus}`,
            'status',
            response.status
        );
    }

    // Check for basic response structure
    if (!response.ok) {
        result.addError(
            VALIDATION_ERRORS.NETWORK_ERROR,
            `API request failed: ${response.statusText}`,
            'ok',
            response.ok
        );
    }

    result.data = response;
    return result;
}

/**
 * Validate parsed JSON data structure
 */
export function validateJsonStructure(data, expectedStructure = null) {
    const result = new ValidationResult();

    try {
        // Basic JSON structure validation
        if (data === null || data === undefined) {
            result.addError(
                VALIDATION_ERRORS.MALFORMED_RESPONSE,
                'Response data is null or undefined',
                'data',
                data
            );
            return result;
        }

        // Check for common error patterns in API responses
        if (typeof data === 'object' && 'error' in data) {
            result.addError(
                VALIDATION_ERRORS.NETWORK_ERROR,
                `API returned error: ${data.error}`,
                'error',
                data.error
            );
        }

        // Validate against expected structure if provided
        if (expectedStructure && typeof expectedStructure === 'object') {
            const structureValidation = validateRequiredFields(data, Object.keys(expectedStructure), 'JSON response');
            result.merge(structureValidation);
        }

    } catch (error) {
        result.addError(
            VALIDATION_ERRORS.MALFORMED_RESPONSE,
            `JSON structure validation failed: ${error.message}`,
            'structure',
            error.message
        );
    }

    result.data = data;
    return result;
}

// ============================================================================
// UTILITY AND HELPER FUNCTIONS
// ============================================================================

/**
 * Log validation results with appropriate level
 */
export function logValidationResult(result, context = 'validation', level = 'warn') {
    if (level === 'silent' && result.isValid) {
        return; // Don't log successful validations in silent mode
    }

    const summary = result.getSummary();
    const prefix = `[${context.toUpperCase()}]`;

    if (!result.isValid) {
        console.error(`${prefix} Validation failed:`, {
            context,
            summary,
            errors: result.errors,
            warnings: result.warnings
        });
    } else if (result.warnings.length > 0 && level !== 'silent') {
        console.warn(`${prefix} Validation warnings:`, {
            context,
            summary,
            warnings: result.warnings
        });
    } else if (level === 'strict') {
        console.log(`${prefix} Validation passed:`, {
            context,
            summary
        });
    }
}

/**
 * Create a validation wrapper for async functions
 */
export function createValidatedFunction(asyncFn, validator, context = 'function') {
    return async function (...args) {
        try {
            const result = await asyncFn(...args);
            
            if (validator) {
                const validation = validator(result);
                logValidationResult(validation, context);
                
                if (!validation.isValid) {
                    throw new Error(`Validation failed for ${context}: ${validation.errors.map(e => e.message).join(', ')}`);
                }
                
                return validation.data || result;
            }
            
            return result;
        } catch (error) {
            console.error(`[${context.toUpperCase()}] Function execution failed:`, error);
            throw error;
        }
    };
}

/**
 * Batch validate multiple pieces of data
 */
export function batchValidate(validations) {
    const results = [];
    let overallValid = true;

    for (const { data, validator, context } of validations) {
        try {
            const result = validator(data);
            results.push({ context, result });
            
            if (!result.isValid) {
                overallValid = false;
            }
            
            logValidationResult(result, context);
        } catch (error) {
            const errorResult = new ValidationResult();
            errorResult.addError(
                VALIDATION_ERRORS.NETWORK_ERROR,
                `Validation function failed: ${error.message}`,
                'validator',
                error.message
            );
            
            results.push({ context, result: errorResult });
            overallValid = false;
        }
    }

    return {
        isValid: overallValid,
        results,
        summary: {
            total: results.length,
            passed: results.filter(r => r.result.isValid).length,
            failed: results.filter(r => !r.result.isValid).length
        }
    };
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
    ValidationResult,
    VALIDATION_CONFIG,
    VALIDATION_ERRORS,
    validateRequiredFields,
    validateDataType,
    validateRange,
    validateLeagueData,
    validateRosterData,
    validateMatchupData,
    validateBracketData,
    validateManagerStats,
    validateSeasonData,
    validateTotalStats,
    validateLeagueRosterConsistency,
    validateMatchupConsistency,
    validateApiResponse,
    validateJsonStructure,
    logValidationResult,
    createValidatedFunction,
    batchValidate
};
