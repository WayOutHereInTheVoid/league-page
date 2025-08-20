/**
 * Enhanced Manager Data Validation
 * 
 * This module provides specialized validation for manager statistics, playoff detection,
 * and head-to-head data processing. It integrates with the existing playoff detection
 * utilities to provide comprehensive validation of all manager-related calculations.
 * 
 * @version 1.0.0
 * @author TRL Development Team
 */

import {
    ValidationResult,
    VALIDATION_ERRORS,
    validateRequiredFields,
    validateRange,
    validateSeasonData,
    validateTotalStats,
    logValidationResult
} from './dataValidation';

import {
    debugAwardProcessing
} from './awardProcessingUtils';

// ============================================================================
// MANAGER VALIDATION CONFIGURATION
// ============================================================================

export const MANAGER_VALIDATION_CONFIG = {
    // Expected ranges for manager statistics
    REASONABLE_RANGES: {
        SEASONS_PLAYED: { min: 1, max: 20 },
        WINS_PER_SEASON: { min: 0, max: 20 },
        LOSSES_PER_SEASON: { min: 0, max: 20 },
        TIES_PER_SEASON: { min: 0, max: 5 },
        POINTS_PER_SEASON: { min: 500, max: 3000 },
        POINTS_PER_GAME: { min: 50, max: 250 },
        WIN_PERCENTAGE: { min: 0, max: 100 },
        LINEUP_EFFICIENCY: { min: 0, max: 100 },
        PLAYOFF_RATE: { min: 0, max: 100 }, // Percentage of seasons making playoffs
        CHAMPIONSHIP_RATE: { min: 0, max: 100 } // Percentage of seasons winning championship
    },
    
    // Logical consistency rules
    LOGICAL_RULES: {
        CHAMPIONSHIPS_VS_PLAYOFFS: 'Championships cannot exceed playoff appearances',
        PLAYOFFS_VS_SEASONS: 'Playoff appearances cannot exceed seasons played',
        GAMES_PER_SEASON: 'Games per season should be consistent within league',
        POINTS_CONSISTENCY: 'Points should be consistent with game outcomes'
    },
    
    // Validation thresholds for warnings vs errors
    WARNING_THRESHOLDS: {
        HIGH_WIN_RATE: 80,      // Win % above this triggers warning for verification
        LOW_WIN_RATE: 20,       // Win % below this triggers warning
        HIGH_PPG: 200,          // Points per game above this seems unusual
        LOW_PPG: 75,            // Points per game below this seems unusual
        EFFICIENCY_THRESHOLD: 95, // Lineup efficiency above this seems too perfect
        PERFECT_SEASON_COUNT: 2   // More than this many perfect seasons seems unusual
    }
};

// ============================================================================
// ENHANCED MANAGER DATA VALIDATION
// ============================================================================

/**
 * Comprehensive validation of manager statistics
 */
export function validateManagerStatistics(managerStats, managerID = null, context = 'manager stats') {
    const result = new ValidationResult();
    
    debugAwardProcessing('Manager Statistics Validation - Start', {
        managerID,
        context,
        hasSeasons: !!(managerStats?.seasons),
        hasTotalStats: !!(managerStats?.totalStats),
        seasonCount: managerStats?.seasons?.length || 0
    });

    // Basic structure validation
    if (!managerStats || typeof managerStats !== 'object') {
        result.addError(
            VALIDATION_ERRORS.INVALID_DATA_TYPE,
            `${context} must be an object`,
            'managerStats',
            typeof managerStats
        );
        return result;
    }

    // Validate seasons array
    if ('seasons' in managerStats) {
        const seasonsValidation = validateSeasonsArray(managerStats.seasons, context);
        result.merge(seasonsValidation);
    }

    // Validate total stats
    if ('totalStats' in managerStats) {
        const totalStatsValidation = validateManagerTotalStats(managerStats.totalStats, context);
        result.merge(totalStatsValidation);
    }

    // Cross-validate seasons vs totals consistency
    if (managerStats.seasons && managerStats.totalStats) {
        const consistencyValidation = validateSeasonsToTotalsConsistency(
            managerStats.seasons,
            managerStats.totalStats,
            context
        );
        result.merge(consistencyValidation);
    }

    // Advanced statistical validation
    const advancedValidation = validateAdvancedManagerMetrics(managerStats, context);
    result.merge(advancedValidation);

    debugAwardProcessing('Manager Statistics Validation - Complete', {
        managerID,
        context,
        isValid: result.isValid,
        errorCount: result.errors.length,
        warningCount: result.warnings.length
    });

    return result;
}

/**
 * Validate array of season data
 */
export function validateSeasonsArray(seasons, context = 'seasons') {
    const result = new ValidationResult();

    if (!Array.isArray(seasons)) {
        result.addError(
            VALIDATION_ERRORS.INVALID_DATA_TYPE,
            'Seasons must be an array',
            'seasons',
            typeof seasons
        );
        return result;
    }

    if (seasons.length === 0) {
        result.addWarning(
            VALIDATION_ERRORS.INCONSISTENT_DATA,
            'Manager has no seasons data',
            'seasons',
            seasons.length
        );
        return result;
    }

    // Validate each season
    seasons.forEach((season, index) => {
        const seasonValidation = validateEnhancedSeasonData(season, `${context} season ${index}`);
        result.merge(seasonValidation);
    });

    // Check for duplicate years
    const years = seasons.map(s => s.year).filter(y => y !== undefined);
    const uniqueYears = [...new Set(years)];
    if (years.length !== uniqueYears.length) {
        result.addError(
            VALIDATION_ERRORS.INCONSISTENT_DATA,
            'Duplicate season years found',
            'years',
            years
        );
    }

    // Check year sequence consistency
    if (years.length > 1) {
        const sortedYears = [...years].sort((a, b) => a - b);
        const hasGaps = sortedYears.some((year, index) => {
            if (index === 0) return false;
            return year - sortedYears[index - 1] > 1;
        });

        if (hasGaps) {
            result.addWarning(
                VALIDATION_ERRORS.INCONSISTENT_DATA,
                'Season years have gaps - manager may have missed seasons',
                'year_gaps',
                sortedYears
            );
        }
    }

    return result;
}

/**
 * Enhanced season data validation with playoff detection validation
 */
export function validateEnhancedSeasonData(seasonData, context = 'season') {
    const result = new ValidationResult();

    // Use base season validation
    const baseValidation = validateSeasonData(seasonData, context);
    result.merge(baseValidation);

    if (!baseValidation.isValid) return result;

    // Enhanced validations specific to playoff detection
    if ('playoffs' in seasonData && typeof seasonData.playoffs === 'boolean') {
        // If made playoffs, should have reasonable win record
        if (seasonData.playoffs) {
            const totalGames = (seasonData.wins || 0) + (seasonData.losses || 0) + (seasonData.ties || 0);
            const winRate = totalGames > 0 ? (seasonData.wins || 0) / totalGames : 0;
            
            if (winRate < 0.4) { // Less than 40% win rate but made playoffs
                result.addWarning(
                    VALIDATION_ERRORS.INCONSISTENT_DATA,
                    `Low win rate (${(winRate * 100).toFixed(1)}%) for playoff team in ${context}`,
                    'playoff_win_rate',
                    winRate
                );
            }
        }
    }

    // Validate award combinations
    if (seasonData.championship && !seasonData.playoffs) {
        result.addError(
            VALIDATION_ERRORS.INCONSISTENT_DATA,
            `Championship winner must have made playoffs in ${context}`,
            'championship_without_playoffs',
            { championship: seasonData.championship, playoffs: seasonData.playoffs }
        );
    }

    if (seasonData.runnerUp && !seasonData.playoffs) {
        result.addError(
            VALIDATION_ERRORS.INCONSISTENT_DATA,
            `Runner-up must have made playoffs in ${context}`,
            'runnerup_without_playoffs',
            { runnerUp: seasonData.runnerUp, playoffs: seasonData.playoffs }
        );
    }

    if (seasonData.championship && seasonData.runnerUp) {
        result.addError(
            VALIDATION_ERRORS.INCONSISTENT_DATA,
            `Cannot be both champion and runner-up in ${context}`,
            'championship_and_runnerup',
            { championship: seasonData.championship, runnerUp: seasonData.runnerUp }
        );
    }

    // Validate validation metadata if present (from Phase 2 enhancements)
    if ('validationMetadata' in seasonData) {
        const metadataValidation = validateValidationMetadata(seasonData.validationMetadata, context);
        result.merge(metadataValidation);
    }

    return result;
}

/**
 * Validate validation metadata from playoff detection
 */
export function validateValidationMetadata(metadata, context = 'validation metadata') {
    const result = new ValidationResult();

    if (!metadata || typeof metadata !== 'object') {
        // Metadata is optional, so this is just a warning
        result.addWarning(
            VALIDATION_ERRORS.INVALID_DATA_TYPE,
            `${context} should be an object if present`,
            'metadata',
            typeof metadata
        );
        return result;
    }

    // Check confidence scores
    if ('crossValidationConfidence' in metadata) {
        const confidence = metadata.crossValidationConfidence;
        if (typeof confidence === 'number') {
            if (confidence < 0 || confidence > 100) {
                result.addError(
                    VALIDATION_ERRORS.OUT_OF_RANGE,
                    `Confidence score must be 0-100 in ${context}`,
                    'confidence',
                    confidence
                );
            } else if (confidence < 50) {
                result.addWarning(
                    VALIDATION_ERRORS.INCONSISTENT_DATA,
                    `Low confidence score (${confidence}%) in ${context}`,
                    'low_confidence',
                    confidence
                );
            }
        }
    }

    // Check detection methods
    if ('detectionMethods' in metadata && Array.isArray(metadata.detectionMethods)) {
        if (metadata.detectionMethods.length === 0) {
            result.addWarning(
                VALIDATION_ERRORS.INCONSISTENT_DATA,
                `No detection methods recorded in ${context}`,
                'no_detection_methods',
                metadata.detectionMethods
            );
        }
    }

    return result;
}

/**
 * Enhanced total stats validation with manager-specific checks
 */
export function validateManagerTotalStats(totalStats, context = 'total stats') {
    const result = new ValidationResult();

    // Use base total stats validation
    const baseValidation = validateTotalStats(totalStats, context);
    result.merge(baseValidation);

    if (!baseValidation.isValid) return result;

    // Enhanced validations for manager totals - using direct values to avoid import timing issues
    const ranges = {
        SEASONS_PLAYED: { min: 1, max: 20 },
        WINS_PER_SEASON: { min: 0, max: 20 },
        LOSSES_PER_SEASON: { min: 0, max: 20 },
        TIES_PER_SEASON: { min: 0, max: 5 },
        POINTS_PER_SEASON: { min: 500, max: 3000 },
        POINTS_PER_GAME: { min: 50, max: 250 },
        WIN_PERCENTAGE: { min: 0, max: 100 },
        LINEUP_EFFICIENCY: { min: 0, max: 100 },
        PLAYOFF_RATE: { min: 0, max: 100 },
        CHAMPIONSHIP_RATE: { min: 0, max: 100 }
    };
    const thresholds = {
        HIGH_WIN_RATE: 80,
        LOW_WIN_RATE: 20,
        HIGH_PPG: 200,
        LOW_PPG: 75,
        EFFICIENCY_THRESHOLD: 95,
        PERFECT_SEASON_COUNT: 2
    };

    // Validate seasons played range
    if ('seasonsPlayed' in totalStats) {
        const seasonsValidation = validateRange(
            totalStats.seasonsPlayed,
            ranges.SEASONS_PLAYED.min,
            ranges.SEASONS_PLAYED.max,
            'seasons played'
        );
        result.merge(seasonsValidation);
    }

    // Check for unusually high performance
    if ('winPercentage' in totalStats && typeof totalStats.winPercentage === 'number') {
        if (totalStats.winPercentage > thresholds.HIGH_WIN_RATE) {
            result.addWarning(
                VALIDATION_ERRORS.OUT_OF_RANGE,
                `Very high win percentage: ${totalStats.winPercentage}% - verify data accuracy`,
                'high_win_rate',
                totalStats.winPercentage
            );
        } else if (totalStats.winPercentage < thresholds.LOW_WIN_RATE) {
            result.addWarning(
                VALIDATION_ERRORS.OUT_OF_RANGE,
                `Very low win percentage: ${totalStats.winPercentage}% - verify data accuracy`,
                'low_win_rate',
                totalStats.winPercentage
            );
        }
    }

    // Check average points per game
    if ('averagePointsPerGame' in totalStats && typeof totalStats.averagePointsPerGame === 'number') {
        if (totalStats.averagePointsPerGame > thresholds.HIGH_PPG) {
            result.addWarning(
                VALIDATION_ERRORS.OUT_OF_RANGE,
                `Very high points per game: ${totalStats.averagePointsPerGame} - verify data accuracy`,
                'high_ppg',
                totalStats.averagePointsPerGame
            );
        } else if (totalStats.averagePointsPerGame < thresholds.LOW_PPG) {
            result.addWarning(
                VALIDATION_ERRORS.OUT_OF_RANGE,
                `Very low points per game: ${totalStats.averagePointsPerGame} - verify data accuracy`,
                'low_ppg',
                totalStats.averagePointsPerGame
            );
        }
    }

    // Validate playoff and championship rates
    if (totalStats.seasonsPlayed > 0) {
        const playoffRate = (totalStats.playoffAppearances / totalStats.seasonsPlayed) * 100;
        const championshipRate = (totalStats.championships / totalStats.seasonsPlayed) * 100;

        if (playoffRate > 90) {
            result.addWarning(
                VALIDATION_ERRORS.OUT_OF_RANGE,
                `Very high playoff rate: ${playoffRate.toFixed(1)}% - verify data accuracy`,
                'high_playoff_rate',
                playoffRate
            );
        }

        if (championshipRate > 50) {
            result.addWarning(
                VALIDATION_ERRORS.OUT_OF_RANGE,
                `Very high championship rate: ${championshipRate.toFixed(1)}% - verify data accuracy`,
                'high_championship_rate',
                championshipRate
            );
        }
    }

    return result;
}

/**
 * Validate consistency between season data and calculated totals
 */
export function validateSeasonsToTotalsConsistency(seasons, totalStats, context = 'consistency check') {
    const result = new ValidationResult();

    // Calculate totals from seasons
    const calculatedTotals = {
        totalWins: seasons.reduce((sum, s) => sum + (s.wins || 0), 0),
        totalLosses: seasons.reduce((sum, s) => sum + (s.losses || 0), 0),
        totalTies: seasons.reduce((sum, s) => sum + (s.ties || 0), 0),
        totalPoints: seasons.reduce((sum, s) => sum + (s.fpts || 0), 0),
        totalPointsAgainst: seasons.reduce((sum, s) => sum + (s.fptsAgainst || 0), 0),
        playoffAppearances: seasons.filter(s => s.playoffs).length,
        championships: seasons.filter(s => s.championship).length,
        seasonsPlayed: seasons.length
    };

    // Compare with reported totals
    const tolerance = 0.01; // Allow small floating point differences

    Object.entries(calculatedTotals).forEach(([field, calculated]) => {
        if (field in totalStats) {
            const reported = totalStats[field];
            const difference = Math.abs(calculated - reported);

            if (difference > tolerance) {
                result.addError(
                    VALIDATION_ERRORS.INCONSISTENT_DATA,
                    `${field} mismatch: calculated ${calculated}, reported ${reported} in ${context}`,
                    field,
                    { calculated, reported, difference }
                );
            }
        }
    });

    // Calculate and verify derived stats
    const totalGames = calculatedTotals.totalWins + calculatedTotals.totalLosses + calculatedTotals.totalTies;
    
    if (totalGames > 0 && 'winPercentage' in totalStats) {
        const calculatedWinPct = (calculatedTotals.totalWins / totalGames) * 100;
        const reportedWinPct = totalStats.winPercentage;
        const pctDifference = Math.abs(calculatedWinPct - reportedWinPct);

        if (pctDifference > 1.0) { // Allow 1% difference for rounding
            result.addError(
                VALIDATION_ERRORS.INCONSISTENT_DATA,
                `Win percentage mismatch: calculated ${calculatedWinPct.toFixed(2)}%, reported ${reportedWinPct}% in ${context}`,
                'win_percentage',
                { calculated: calculatedWinPct, reported: reportedWinPct }
            );
        }
    }

    return result;
}

/**
 * Advanced statistical validation for detecting anomalies
 */
export function validateAdvancedManagerMetrics(managerStats, context = 'advanced metrics') {
    const result = new ValidationResult();

    if (!managerStats.seasons || !Array.isArray(managerStats.seasons)) {
        return result; // Can't do advanced validation without seasons
    }

    const seasons = managerStats.seasons;
    
    // Check for perfect seasons (0 losses)
    const perfectSeasons = seasons.filter(s => (s.losses || 0) === 0 && (s.wins || 0) > 0);
    if (perfectSeasons.length > 2) { // Using direct value to avoid import timing issues
        result.addWarning(
            VALIDATION_ERRORS.OUT_OF_RANGE,
            `Many perfect seasons (${perfectSeasons.length}) - verify data accuracy`,
            'perfect_seasons',
            perfectSeasons.map(s => s.year)
        );
    }

    // Check for extremely consistent performance (might indicate static test data)
    if (seasons.length >= 3) {
        const winCounts = seasons.map(s => s.wins || 0);
        const lossCounts = seasons.map(s => s.losses || 0);
        
        // Check if wins are too consistent
        const winVariance = calculateVariance(winCounts);
        if (winVariance === 0 && winCounts[0] > 0) {
            result.addWarning(
                VALIDATION_ERRORS.INCONSISTENT_DATA,
                `Identical win counts across all seasons - possible test data`,
                'identical_wins',
                winCounts
            );
        }

        // Check if losses are too consistent
        const lossVariance = calculateVariance(lossCounts);
        if (lossVariance === 0) {
            result.addWarning(
                VALIDATION_ERRORS.INCONSISTENT_DATA,
                `Identical loss counts across all seasons - possible test data`,
                'identical_losses',
                lossCounts
            );
        }
    }

    // Check for lineup efficiency outliers
    const efficiencies = seasons
        .filter(s => typeof s.lineupEfficiency === 'number')
        .map(s => s.lineupEfficiency);
    
    if (efficiencies.length > 0) {
        const avgEfficiency = efficiencies.reduce((sum, eff) => sum + eff, 0) / efficiencies.length;
        const perfectEfficiencySeasons = efficiencies.filter(eff => eff >= 95); // Using direct value to avoid import timing issues
        
        if (perfectEfficiencySeasons.length > 1) {
            result.addWarning(
                VALIDATION_ERRORS.OUT_OF_RANGE,
                `Multiple seasons with near-perfect lineup efficiency (${perfectEfficiencySeasons.length})`,
                'high_efficiency_seasons',
                perfectEfficiencySeasons
            );
        }

        if (avgEfficiency > 95) {
            result.addWarning(
                VALIDATION_ERRORS.OUT_OF_RANGE,
                `Extremely high average lineup efficiency: ${avgEfficiency.toFixed(1)}%`,
                'avg_efficiency',
                avgEfficiency
            );
        }
    }

    return result;
}

// ============================================================================
// HEAD-TO-HEAD VALIDATION
// ============================================================================

/**
 * Validate head-to-head records data
 */
export function validateHeadToHeadRecords(h2hRecords, context = 'head-to-head records') {
    const result = new ValidationResult();

    if (!h2hRecords || typeof h2hRecords !== 'object') {
        result.addError(
            VALIDATION_ERRORS.INVALID_DATA_TYPE,
            `${context} must be an object`,
            'h2h_records',
            typeof h2hRecords
        );
        return result;
    }

    Object.entries(h2hRecords).forEach(([opponentId, record]) => {
        const recordContext = `${context} vs ${opponentId}`;
        
        // Validate required fields
        const requiredFields = ['wins', 'losses', 'pointsFor', 'pointsAgainst'];
        const fieldValidation = validateRequiredFields(record, requiredFields, recordContext);
        result.merge(fieldValidation);

        if (!fieldValidation.isValid) return;

        // Validate non-negative values
        ['wins', 'losses', 'ties', 'pointsFor', 'pointsAgainst'].forEach(field => {
            if (field in record && typeof record[field] === 'number') {
                if (record[field] < 0) {
                    result.addError(
                        VALIDATION_ERRORS.OUT_OF_RANGE,
                        `${field} cannot be negative in ${recordContext}`,
                        field,
                        record[field]
                    );
                }
            }
        });

        // Validate total games consistency
        const calculatedTotal = (record.wins || 0) + (record.losses || 0) + (record.ties || 0);
        if ('totalGames' in record && record.totalGames !== calculatedTotal) {
            result.addError(
                VALIDATION_ERRORS.INCONSISTENT_DATA,
                `Total games mismatch in ${recordContext}: calculated ${calculatedTotal}, reported ${record.totalGames}`,
                'total_games',
                { calculated: calculatedTotal, reported: record.totalGames }
            );
        }

        // Check for reasonable matchup counts
        if (calculatedTotal > 30) { // More than 30 games vs one opponent seems high
            result.addWarning(
                VALIDATION_ERRORS.OUT_OF_RANGE,
                `High matchup count vs ${opponentId}: ${calculatedTotal} games`,
                'high_matchup_count',
                calculatedTotal
            );
        }
    });

    return result;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate variance for array of numbers
 */
function calculateVariance(numbers) {
    if (numbers.length === 0) return 0;
    
    const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
    const squaredDifferences = numbers.map(num => Math.pow(num - mean, 2));
    return squaredDifferences.reduce((sum, diff) => sum + diff, 0) / numbers.length;
}

/**
 * Enhanced manager statistics validation wrapper
 */
export function validateManagerStatsEnhanced(managerStats, managerID = null, options = {}) {
    const {
        includeAdvancedMetrics = true,
        validateH2H = false,
        h2hRecords = null,
        logResults = true,
        level = 'warn'
    } = options;

    const context = managerID ? `Manager ${managerID}` : 'Manager Stats';
    
    // Start with base validation
    let result = validateManagerStatistics(managerStats, managerID, context);

    // Add advanced metrics validation if requested
    if (includeAdvancedMetrics && result.isValid) {
        const advancedResult = validateAdvancedManagerMetrics(managerStats, `${context} Advanced`);
        result.merge(advancedResult);
    }

    // Add H2H validation if requested
    if (validateH2H && h2hRecords) {
        const h2hResult = validateHeadToHeadRecords(h2hRecords, `${context} H2H`);
        result.merge(h2hResult);
    }

    // Log results if requested
    if (logResults) {
        logValidationResult(result, context, level);
    }

    return result;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
    MANAGER_VALIDATION_CONFIG,
    validateManagerStatistics,
    validateSeasonsArray,
    validateEnhancedSeasonData,
    validateValidationMetadata,
    validateManagerTotalStats,
    validateSeasonsToTotalsConsistency,
    validateAdvancedManagerMetrics,
    validateHeadToHeadRecords,
    validateManagerStatsEnhanced
};
