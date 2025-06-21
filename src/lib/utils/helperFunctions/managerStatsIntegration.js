/**
 * Enhanced Manager Statistics Integration
 * 
 * This module provides integration between the enhanced validation system and existing
 * manager statistics components. It ensures data integrity while maintaining compatibility
 * with existing UI components.
 * 
 * @version 1.0.0
 * @author TRL Development Team
 */

import { computeManagerStats, computeManagerStatsEnhanced } from './managerStats';
import { validateManagerStatsEnhanced } from './managerDataValidation';
import { debugAwardProcessing } from './awardProcessingUtils';
import { 
    getLeagueDataValidated,
    getRostersValidated,
    getDataWithFallback
} from './enhancedApiCalls';
import {
    ValidationOrchestrator,
    globalValidationMetrics,
    VALIDATION_INTEGRATION_CONFIG
} from './validationIntegration';

// ============================================================================
// ENHANCED MANAGER STATISTICS LOADER
// ============================================================================

/**
 * Enhanced manager statistics computation with comprehensive validation
 * This is the main function that components should use to get validated manager statistics
 */
export async function computeValidatedManagerStats(
    manager, 
    leagueTeamManagers, 
    records, 
    currentRosterID, 
    awards,
    options = {}
) {
    const {
        enableValidation = true,
        enableEnhancedStats = true,
        fallbackOnError = true,
        logValidation = true,
        validationLevel = 'warn'
    } = options;

    debugAwardProcessing('Enhanced Manager Stats Computation - Start', {
        managerID: manager?.managerID,
        enableValidation,
        enableEnhancedStats,
        hasRecords: !!records,
        hasAwards: !!awards
    });

    let managerStats = null;
    let validationResult = null;
    let usedEnhanced = false;

    try {
        // Step 1: Compute manager statistics (try enhanced first if enabled)
        if (enableEnhancedStats) {
            try {
                managerStats = await computeManagerStatsEnhanced(
                    manager, 
                    leagueTeamManagers, 
                    records, 
                    currentRosterID, 
                    awards
                );
                usedEnhanced = true;
                debugAwardProcessing('Enhanced stats computation successful', { managerID: manager?.managerID });
            } catch (enhancedError) {
                debugAwardProcessing('Enhanced stats failed, falling back to standard', {
                    managerID: manager?.managerID,
                    error: enhancedError.message
                }, 'warn');
                
                // Fallback to standard computation
                managerStats = computeManagerStats(
                    manager, 
                    leagueTeamManagers, 
                    records, 
                    currentRosterID, 
                    awards
                );
            }
        } else {
            // Use standard computation
            managerStats = computeManagerStats(
                manager, 
                leagueTeamManagers, 
                records, 
                currentRosterID, 
                awards
            );
        }

        // Step 2: Validate the computed statistics if validation is enabled
        if (enableValidation && managerStats) {
            validationResult = validateManagerStatsEnhanced(
                managerStats,
                manager?.managerID,
                {
                    includeAdvancedMetrics: true,
                    logResults: logValidation
                }
            );

            // Record validation metrics
            globalValidationMetrics.recordValidation(
                `manager_stats_${manager?.managerID || 'unknown'}`,
                validationResult
            );

            // If validation fails and fallback is disabled, throw error
            if (!validationResult.isValid && !fallbackOnError) {
                throw new Error(`Manager statistics validation failed: ${validationResult.errors.map(e => e.message).join(', ')}`);
            }

            // If validation fails but we're using fallback, apply fixes
            if (!validationResult.isValid && fallbackOnError) {
                managerStats = applyValidationFixes(managerStats, validationResult);
                debugAwardProcessing('Applied validation fixes', {
                    managerID: manager?.managerID,
                    fixesApplied: validationResult.errors.length
                });
            }
        }

        // Step 3: Return enhanced stats object with metadata
        const result = {
            stats: managerStats,
            metadata: {
                computed: new Date().toISOString(),
                method: usedEnhanced ? 'enhanced' : 'standard',
                validated: !!validationResult,
                isValid: validationResult?.isValid ?? true,
                validationErrors: validationResult?.errors?.length || 0,
                validationWarnings: validationResult?.warnings?.length || 0,
                enhancementMetadata: managerStats?.enhancementMetadata || null
            },
            validationResult
        };

        debugAwardProcessing('Manager stats computation complete', {
            managerID: manager?.managerID,
            method: result.metadata.method,
            isValid: result.metadata.isValid,
            seasonsCount: managerStats?.seasons?.length || 0
        });

        return result;

    } catch (error) {
        debugAwardProcessing('Manager stats computation failed', {
            managerID: manager?.managerID,
            error: error.message
        }, 'error');

        if (fallbackOnError) {
            // Return empty stats structure as last resort
            return {
                stats: createEmptyManagerStats(),
                metadata: {
                    computed: new Date().toISOString(),
                    method: 'fallback_empty',
                    validated: false,
                    isValid: false,
                    error: error.message
                },
                validationResult: null
            };
        }

        throw error;
    }
}

/**
 * Apply fixes to manager statistics based on validation results
 */
function applyValidationFixes(managerStats, validationResult) {
    if (!managerStats || !validationResult?.errors) {
        return managerStats;
    }

    const fixedStats = JSON.parse(JSON.stringify(managerStats)); // Deep clone

    // Apply fixes for common validation errors
    validationResult.errors.forEach(error => {
        switch (error.type) {
            case 'invalid_data_type':
                if (error.field && typeof fixedStats[error.field] === 'string') {
                    const numValue = parseFloat(fixedStats[error.field]);
                    if (!isNaN(numValue)) {
                        fixedStats[error.field] = numValue;
                    }
                }
                break;

            case 'out_of_range':
                // For win percentages over 100 or under 0
                if (error.field === 'winPercentage' || error.field === 'win_percentage') {
                    const value = error.value;
                    if (value > 100) fixedStats.totalStats.winPercentage = 100;
                    if (value < 0) fixedStats.totalStats.winPercentage = 0;
                }
                break;

            case 'inconsistent_data':
                // Fix logical inconsistencies
                if (error.message.includes('Championships cannot exceed playoff appearances')) {
                    fixedStats.totalStats.playoffAppearances = Math.max(
                        fixedStats.totalStats.playoffAppearances,
                        fixedStats.totalStats.championships
                    );
                }
                break;
        }
    });

    // Fix NaN values
    fixNaNValues(fixedStats);

    return fixedStats;
}

/**
 * Fix NaN values in manager statistics
 */
function fixNaNValues(stats) {
    function fixObject(obj) {
        if (!obj || typeof obj !== 'object') return;

        Object.keys(obj).forEach(key => {
            const value = obj[key];
            
            if (typeof value === 'number' && isNaN(value)) {
                // Replace NaN with appropriate default value
                if (key.includes('Percentage') || key.includes('percentage')) {
                    obj[key] = 0;
                } else if (key.includes('total') || key.includes('Total')) {
                    obj[key] = 0;
                } else if (key.includes('average') || key.includes('Average')) {
                    obj[key] = 0;
                } else {
                    obj[key] = 0; // Default to 0 for other numeric fields
                }
                
                debugAwardProcessing('Fixed NaN value', { field: key, oldValue: value, newValue: obj[key] }, 'warn');
            } else if (typeof value === 'object' && value !== null) {
                fixObject(value);
            }
        });
    }

    if (stats.seasons && Array.isArray(stats.seasons)) {
        stats.seasons.forEach(season => fixObject(season));
    }
    
    if (stats.totalStats) {
        fixObject(stats.totalStats);
    }
}

/**
 * Create empty manager statistics structure
 */
function createEmptyManagerStats() {
    return {
        seasons: [],
        totalStats: {
            totalWins: 0,
            totalLosses: 0,
            totalTies: 0,
            totalPoints: 0,
            totalPointsAgainst: 0,
            playoffAppearances: 0,
            championships: 0,
            divisionChampionships: 0,
            runnerUpFinishes: 0,
            thirdPlaceFinishes: 0,
            toiletBowlWins: 0,
            seasonsPlayed: 0,
            winPercentage: 0,
            averagePointsPerSeason: 0,
            averagePointsPerGame: 0
        }
    };
}

// ============================================================================
// BATCH MANAGER PROCESSING
// ============================================================================

/**
 * Process multiple managers with validation
 */
export async function processAllManagersWithValidation(
    managers,
    leagueTeamManagers,
    records,
    awards,
    options = {}
) {
    const {
        maxConcurrent = 3,
        enableValidation = true,
        progressCallback = null
    } = options;

    const results = {
        managers: [],
        summary: {
            total: managers.length,
            successful: 0,
            failed: 0,
            validated: 0,
            warnings: 0,
            errors: 0
        },
        validationMetrics: {},
        startTime: new Date()
    };

    debugAwardProcessing('Batch manager processing started', {
        managerCount: managers.length,
        maxConcurrent,
        enableValidation
    });

    // Process managers in batches to avoid overwhelming the system
    for (let i = 0; i < managers.length; i += maxConcurrent) {
        const batch = managers.slice(i, i + maxConcurrent);
        
        const batchPromises = batch.map(async (manager) => {
            try {
                const managerResult = await computeValidatedManagerStats(
                    manager,
                    leagueTeamManagers,
                    records,
                    manager.roster, // Use roster as fallback currentRosterID
                    awards,
                    { enableValidation, logValidation: false }
                );

                results.managers.push({
                    manager,
                    result: managerResult,
                    success: true
                });

                results.summary.successful++;
                
                if (managerResult.metadata.validated) {
                    results.summary.validated++;
                }
                
                if (managerResult.validationResult) {
                    results.summary.warnings += managerResult.validationResult.warnings?.length || 0;
                    results.summary.errors += managerResult.validationResult.errors?.length || 0;
                }

                return managerResult;

            } catch (error) {
                debugAwardProcessing('Manager processing failed', {
                    managerID: manager?.managerID,
                    error: error.message
                }, 'error');

                results.managers.push({
                    manager,
                    result: null,
                    success: false,
                    error: error.message
                });

                results.summary.failed++;
                return null;
            }
        });

        // Wait for current batch to complete
        await Promise.all(batchPromises);

        // Call progress callback if provided
        if (progressCallback) {
            progressCallback({
                completed: Math.min(i + maxConcurrent, managers.length),
                total: managers.length,
                percentage: Math.min(((i + maxConcurrent) / managers.length) * 100, 100)
            });
        }
    }

    results.endTime = new Date();
    results.duration = results.endTime - results.startTime;

    debugAwardProcessing('Batch manager processing complete', {
        duration: `${results.duration}ms`,
        successful: results.summary.successful,
        failed: results.summary.failed,
        validationErrors: results.summary.errors,
        validationWarnings: results.summary.warnings
    });

    return results;
}

// ============================================================================
// COMPONENT INTEGRATION HELPERS
// ============================================================================

/**
 * Prepare manager statistics for UI components
 * Ensures all required fields are present and properly formatted
 */
export function prepareStatsForComponent(validatedManagerResult) {
    if (!validatedManagerResult?.stats) {
        return createEmptyManagerStats();
    }

    const stats = validatedManagerResult.stats;
    
    // Ensure all required fields exist with proper defaults
    const preparedStats = {
        seasons: stats.seasons || [],
        totalStats: {
            totalWins: stats.totalStats?.totalWins || 0,
            totalLosses: stats.totalStats?.totalLosses || 0,
            totalTies: stats.totalStats?.totalTies || 0,
            totalPoints: stats.totalStats?.totalPoints || 0,
            totalPointsAgainst: stats.totalStats?.totalPointsAgainst || 0,
            playoffAppearances: stats.totalStats?.playoffAppearances || 0,
            championships: stats.totalStats?.championships || 0,
            divisionChampionships: stats.totalStats?.divisionChampionships || 0,
            runnerUpFinishes: stats.totalStats?.runnerUpFinishes || 0,
            thirdPlaceFinishes: stats.totalStats?.thirdPlaceFinishes || 0,
            toiletBowlWins: stats.totalStats?.toiletBowlWins || 0,
            seasonsPlayed: stats.totalStats?.seasonsPlayed || 0,
            winPercentage: stats.totalStats?.winPercentage || 0,
            averagePointsPerSeason: stats.totalStats?.averagePointsPerSeason || 0,
            averagePointsPerGame: stats.totalStats?.averagePointsPerGame || 0
        },
        // Include validation metadata for debugging
        _metadata: validatedManagerResult.metadata,
        _validationSummary: validatedManagerResult.validationResult ? {
            isValid: validatedManagerResult.validationResult.isValid,
            errorCount: validatedManagerResult.validationResult.errors?.length || 0,
            warningCount: validatedManagerResult.validationResult.warnings?.length || 0
        } : null
    };

    // Ensure seasons have all required fields
    preparedStats.seasons = preparedStats.seasons.map(season => ({
        year: season.year || 0,
        wins: season.wins || 0,
        losses: season.losses || 0,
        ties: season.ties || 0,
        fpts: season.fpts || 0,
        fptsAgainst: season.fptsAgainst || 0,
        playoffs: !!season.playoffs,
        championship: !!season.championship,
        divisionChamp: !!season.divisionChamp,
        runnerUp: !!season.runnerUp,
        thirdPlace: !!season.thirdPlace,
        toilet: !!season.toilet,
        potentialPoints: season.potentialPoints || 0,
        lineupEfficiency: season.lineupEfficiency || 0,
        rosterID: season.rosterID || null
    }));

    return preparedStats;
}

/**
 * Get validation summary for debugging
 */
export function getValidationSummary() {
    return globalValidationMetrics.getSummary();
}

/**
 * Reset validation metrics
 */
export function resetValidationMetrics() {
    globalValidationMetrics.metrics = {
        validationCounts: {},
        errorCounts: {},
        warningCounts: {},
        performanceMetrics: {},
        sessionHistory: []
    };
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
    computeValidatedManagerStats,
    processAllManagersWithValidation,
    prepareStatsForComponent,
    getValidationSummary,
    resetValidationMetrics,
    createEmptyManagerStats
};
