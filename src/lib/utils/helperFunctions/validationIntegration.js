/**
 * Data Validation Integration and Testing Suite
 * 
 * This module provides comprehensive integration of all validation systems,
 * testing utilities, and validation reporting for the TRL Fantasy Football app.
 * It demonstrates how to use all validation components together effectively.
 * 
 * @version 1.0.0
 * @author TRL Development Team
 */

import {
    ValidationResult,
    VALIDATION_CONFIG,
    VALIDATION_ERRORS,
    batchValidate,
    logValidationResult
} from './dataValidation';

import {
    getLeagueDataValidated,
    getRostersValidated,
    getMatchupsValidated,
    getBracketsValidated,
    getUsersValidated,
    getLeagueDataWithConsistencyCheck,
    getHistoricalLeagueDataValidated,
    performApiHealthCheck,
    API_CONFIG
} from './enhancedApiCalls';

import {
    validateManagerStatsEnhanced,
    MANAGER_VALIDATION_CONFIG
} from './managerDataValidation';

import {
    computeManagerStats,
    computeManagerStatsEnhanced
} from './managerStats';

import {
    debugAwardProcessing
} from './awardProcessingUtils';

// ============================================================================
// VALIDATION INTEGRATION CONFIGURATION
// ============================================================================

export const VALIDATION_INTEGRATION_CONFIG = {
    // Test data sets for validation testing
    TEST_SCENARIOS: {
        BASIC_FUNCTIONALITY: 'basic',
        EDGE_CASES: 'edge_cases',
        ERROR_CONDITIONS: 'error_conditions',
        PERFORMANCE: 'performance',
        COMPREHENSIVE: 'comprehensive'
    },
    
    // Reporting levels
    REPORTING_LEVELS: {
        SUMMARY: 'summary',
        DETAILED: 'detailed',
        VERBOSE: 'verbose'
    },
    
    // Validation modes
    VALIDATION_MODES: {
        STRICT: 'strict',           // Fail on any validation error
        LENIENT: 'lenient',         // Log warnings but continue
        MONITORING: 'monitoring'    // Collect metrics without blocking
    }
};

// ============================================================================
// COMPREHENSIVE VALIDATION ORCHESTRATOR
// ============================================================================

/**
 * Main validation orchestrator class
 */
export class ValidationOrchestrator {
    constructor(options = {}) {
        this.config = {
            mode: options.mode || 'lenient',
            reportingLevel: options.reportingLevel || 'detailed',
            enableMetrics: options.enableMetrics || true,
            logResults: options.logResults !== false // Default to true
        };
        
        this.metrics = {
            validationsRun: 0,
            validationsPassed: 0,
            validationsFailed: 0,
            warningsGenerated: 0,
            errorsGenerated: 0,
            startTime: null,
            endTime: null
        };
        
        this.results = [];
    }

    /**
     * Start validation session
     */
    startSession(sessionName = 'validation_session') {
        this.sessionName = sessionName;
        this.metrics.startTime = new Date();
        this.results = [];
        
        debugAwardProcessing('Validation Session Started', {
            sessionName,
            mode: this.config.mode,
            reportingLevel: this.config.reportingLevel
        });
    }

    /**
     * End validation session and generate report
     */
    endSession() {
        this.metrics.endTime = new Date();
        const duration = this.metrics.endTime - this.metrics.startTime;
        
        const sessionSummary = {
            sessionName: this.sessionName,
            duration: `${duration}ms`,
            metrics: this.metrics,
            overallSuccess: this.metrics.validationsFailed === 0,
            successRate: this.metrics.validationsRun > 0 
                ? (this.metrics.validationsPassed / this.metrics.validationsRun * 100).toFixed(2) + '%'
                : '0%'
        };

        debugAwardProcessing('Validation Session Complete', sessionSummary);
        
        if (this.config.logResults) {
            this.generateReport();
        }
        
        return sessionSummary;
    }

    /**
     * Run validation with metrics tracking
     */
    async runValidation(validationFn, context, ...args) {
        this.metrics.validationsRun++;
        
        try {
            const result = await validationFn(...args);
            
            if (result && typeof result.isValid === 'boolean') {
                // Handle ValidationResult objects
                if (result.isValid) {
                    this.metrics.validationsPassed++;
                } else {
                    this.metrics.validationsFailed++;
                }
                
                this.metrics.warningsGenerated += result.warnings?.length || 0;
                this.metrics.errorsGenerated += result.errors?.length || 0;
                
                this.results.push({
                    context,
                    result,
                    timestamp: new Date().toISOString()
                });
                
                if (this.config.logResults) {
                    logValidationResult(result, context, this.config.mode);
                }
                
                return result;
            }
            
            // Handle non-ValidationResult returns
            this.metrics.validationsPassed++;
            return result;
            
        } catch (error) {
            this.metrics.validationsFailed++;
            this.metrics.errorsGenerated++;
            
            const errorResult = new ValidationResult();
            errorResult.addError(
                VALIDATION_ERRORS.NETWORK_ERROR,
                `Validation execution failed: ${error.message}`,
                'execution',
                error.message
            );
            
            this.results.push({
                context,
                result: errorResult,
                timestamp: new Date().toISOString()
            });
            
            if (this.config.mode === 'strict') {
                throw error;
            }
            
            console.error(`[VALIDATION_ORCHESTRATOR] ${context} failed:`, error);
            return errorResult;
        }
    }

    /**
     * Generate comprehensive validation report
     */
    generateReport() {
        const report = {
            session: this.sessionName,
            timestamp: new Date().toISOString(),
            metrics: this.metrics,
            summary: {
                totalValidations: this.metrics.validationsRun,
                successRate: this.metrics.validationsRun > 0 
                    ? (this.metrics.validationsPassed / this.metrics.validationsRun * 100).toFixed(2) + '%'
                    : '0%',
                totalErrors: this.metrics.errorsGenerated,
                totalWarnings: this.metrics.warningsGenerated
            }
        };

        if (this.config.reportingLevel !== 'summary') {
            report.validationResults = this.results.map(r => ({
                context: r.context,
                isValid: r.result.isValid,
                errorCount: r.result.errors?.length || 0,
                warningCount: r.result.warnings?.length || 0,
                timestamp: r.timestamp
            }));
        }

        if (this.config.reportingLevel === 'verbose') {
            report.detailedResults = this.results;
        }

        console.log('[VALIDATION_REPORT]', report);
        return report;
    }
}

// ============================================================================
// COMPREHENSIVE DATA VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate complete league setup
 */
export async function validateCompleteLeagueSetup(leagueID, options = {}) {
    const orchestrator = new ValidationOrchestrator(options);
    orchestrator.startSession(`complete_league_validation_${leagueID}`);

    try {
        // Step 1: Validate basic league data
        const leagueData = await orchestrator.runValidation(
            getLeagueDataValidated,
            'League Data',
            leagueID
        );

        // Step 2: Validate league-roster consistency
        const consistencyCheck = await orchestrator.runValidation(
            getLeagueDataWithConsistencyCheck,
            'League-Roster Consistency',
            leagueID
        );

        // Step 3: Validate users
        const userData = await orchestrator.runValidation(
            getUsersValidated,
            'User Data',
            leagueID
        );

        // Step 4: Validate current week matchups (if season is active)
        if (leagueData?.status === 'in_season') {
            try {
                const matchupData = await orchestrator.runValidation(
                    getMatchupsValidated,
                    'Current Matchups',
                    leagueID,
                    1 // Start with week 1
                );
            } catch (error) {
                console.warn('Matchup validation failed - league might not have started');
            }
        }

        // Step 5: Validate playoff brackets (if playoffs have started)
        if (leagueData?.status === 'in_season' || leagueData?.status === 'complete') {
            try {
                const winnersData = await orchestrator.runValidation(
                    getBracketsValidated,
                    'Winners Bracket',
                    leagueID,
                    'winners_bracket'
                );

                const losersData = await orchestrator.runValidation(
                    getBracketsValidated,
                    'Losers Bracket',
                    leagueID,
                    'losers_bracket'
                );
            } catch (error) {
                console.warn('Bracket validation failed - playoffs might not have started');
            }
        }

        return orchestrator.endSession();

    } catch (error) {
        console.error('Complete league validation failed:', error);
        throw error;
    }
}

/**
 * Validate manager data comprehensively
 */
export async function validateCompleteManagerData(manager, leagueTeamManagers, records, awards, options = {}) {
    const orchestrator = new ValidationOrchestrator(options);
    orchestrator.startSession(`manager_validation_${manager?.managerID || 'unknown'}`);

    try {
        // Step 1: Compute manager statistics
        const managerStats = await orchestrator.runValidation(
            () => computeManagerStats(manager, leagueTeamManagers, records, manager?.roster, awards),
            'Manager Statistics Computation'
        );

        // Step 2: Validate computed statistics
        const statsValidation = await orchestrator.runValidation(
            validateManagerStatsEnhanced,
            'Manager Statistics Validation',
            managerStats,
            manager?.managerID,
            { includeAdvancedMetrics: true, logResults: false }
        );

        // Step 3: Enhanced statistics with bracket validation (if available)
        try {
            const enhancedStats = await orchestrator.runValidation(
                () => computeManagerStatsEnhanced(manager, leagueTeamManagers, records, manager?.roster, awards),
                'Enhanced Manager Statistics'
            );

            // Validate enhanced statistics
            await orchestrator.runValidation(
                validateManagerStatsEnhanced,
                'Enhanced Statistics Validation',
                enhancedStats,
                manager?.managerID,
                { includeAdvancedMetrics: true, logResults: false }
            );
        } catch (error) {
            console.warn('Enhanced manager stats validation failed - continuing with basic stats');
        }

        return orchestrator.endSession();

    } catch (error) {
        console.error('Complete manager validation failed:', error);
        throw error;
    }
}

/**
 * Validate historical league data
 */
export async function validateHistoricalData(startLeagueID, options = {}) {
    const orchestrator = new ValidationOrchestrator(options);
    orchestrator.startSession(`historical_validation_${startLeagueID}`);

    try {
        // Fetch and validate historical data
        const historicalData = await orchestrator.runValidation(
            getHistoricalLeagueDataValidated,
            'Historical League Data',
            startLeagueID,
            options.maxSeasons || 10
        );

        // Validate each season's data integrity
        if (historicalData?.data) {
            for (const [year, yearData] of Object.entries(historicalData.data)) {
                await orchestrator.runValidation(
                    () => {
                        const validation = new ValidationResult();
                        
                        // Basic year data validation
                        if (!yearData.data || !yearData.leagueID) {
                            validation.addError(
                                VALIDATION_ERRORS.MISSING_REQUIRED_FIELD,
                                `Missing data for year ${year}`,
                                'year_data',
                                yearData
                            );
                        }
                        
                        return validation;
                    },
                    `Historical Year ${year}`
                );
            }
        }

        return orchestrator.endSession();

    } catch (error) {
        console.error('Historical data validation failed:', error);
        throw error;
    }
}

// ============================================================================
// VALIDATION TESTING UTILITIES
// ============================================================================

/**
 * Run comprehensive validation test suite
 */
export async function runValidationTestSuite(leagueID, options = {}) {
    const {
        scenario = 'basic', // Using direct value to avoid import timing issues
        includePerformance = false,
        generateReport = true
    } = options;

    console.log(`[VALIDATION_TEST_SUITE] Starting ${scenario} test scenario for league ${leagueID}`);

    const results = {
        scenario,
        leagueID,
        timestamp: new Date().toISOString(),
        tests: {},
        summary: {}
    };

    try {
        // Test 1: API Health Check
        results.tests.apiHealth = await performApiHealthCheck();

        // Test 2: League Setup Validation
        results.tests.leagueSetup = await validateCompleteLeagueSetup(leagueID, {
            mode: 'lenient', // Using direct value to avoid import timing issues
            logResults: false
        });

        // Test 3: Historical Data Validation (if comprehensive)
        if (scenario === 'comprehensive') { // Using direct value to avoid import timing issues
            results.tests.historicalData = await validateHistoricalData(leagueID, {
                maxSeasons: 5,
                logResults: false
            });
        }

        // Test 4: Performance Testing (if requested)
        if (includePerformance) {
            results.tests.performance = await runPerformanceTests(leagueID);
        }

        // Generate summary
        results.summary = {
            totalTests: Object.keys(results.tests).length,
            passedTests: Object.values(results.tests).filter(t => 
                t.overallSuccess !== false && t.overallStatus !== 'unhealthy'
            ).length,
            overallSuccess: Object.values(results.tests).every(t => 
                t.overallSuccess !== false && t.overallStatus !== 'unhealthy'
            )
        };

        if (generateReport) {
            console.log('[VALIDATION_TEST_SUITE] Results:', results);
        }

        return results;

    } catch (error) {
        console.error('[VALIDATION_TEST_SUITE] Test suite failed:', error);
        results.error = error.message;
        results.summary.overallSuccess = false;
        return results;
    }
}

/**
 * Run performance validation tests
 */
async function runPerformanceTests(leagueID) {
    const performanceResults = {
        tests: {},
        summary: {}
    };

    // Test API response times
    const apiTests = [
        { name: 'league_data', fn: () => getLeagueDataValidated(leagueID) },
        { name: 'rosters', fn: () => getRostersValidated(leagueID) },
        { name: 'users', fn: () => getUsersValidated(leagueID) }
    ];

    for (const test of apiTests) {
        const startTime = performance.now();
        try {
            await test.fn();
            const endTime = performance.now();
            performanceResults.tests[test.name] = {
                success: true,
                responseTime: endTime - startTime,
                status: endTime - startTime < 2000 ? 'good' : 'slow'
            };
        } catch (error) {
            performanceResults.tests[test.name] = {
                success: false,
                error: error.message
            };
        }
    }

    // Calculate summary
    const successfulTests = Object.values(performanceResults.tests).filter(t => t.success);
    performanceResults.summary = {
        totalTests: apiTests.length,
        successfulTests: successfulTests.length,
        averageResponseTime: successfulTests.length > 0 
            ? successfulTests.reduce((sum, t) => sum + t.responseTime, 0) / successfulTests.length
            : 0,
        allTestsPassed: successfulTests.length === apiTests.length
    };

    return performanceResults;
}

// ============================================================================
// VALIDATION MONITORING AND METRICS
// ============================================================================

/**
 * Validation metrics collector
 */
export class ValidationMetricsCollector {
    constructor() {
        this.metrics = {
            validationCounts: {},
            errorCounts: {},
            warningCounts: {},
            performanceMetrics: {},
            sessionHistory: []
        };
    }

    /**
     * Record validation result
     */
    recordValidation(context, result, responseTime = null) {
        // Update counts
        this.metrics.validationCounts[context] = (this.metrics.validationCounts[context] || 0) + 1;
        
        if (result.errors?.length > 0) {
            this.metrics.errorCounts[context] = (this.metrics.errorCounts[context] || 0) + result.errors.length;
        }
        
        if (result.warnings?.length > 0) {
            this.metrics.warningCounts[context] = (this.metrics.warningCounts[context] || 0) + result.warnings.length;
        }
        
        // Record performance if provided
        if (responseTime !== null) {
            if (!this.metrics.performanceMetrics[context]) {
                this.metrics.performanceMetrics[context] = [];
            }
            this.metrics.performanceMetrics[context].push(responseTime);
            
            // Keep only last 100 measurements
            if (this.metrics.performanceMetrics[context].length > 100) {
                this.metrics.performanceMetrics[context] = this.metrics.performanceMetrics[context].slice(-100);
            }
        }
    }

    /**
     * Get metrics summary
     */
    getSummary() {
        const summary = {
            totalValidations: Object.values(this.metrics.validationCounts).reduce((sum, count) => sum + count, 0),
            totalErrors: Object.values(this.metrics.errorCounts).reduce((sum, count) => sum + count, 0),
            totalWarnings: Object.values(this.metrics.warningCounts).reduce((sum, count) => sum + count, 0),
            contexts: Object.keys(this.metrics.validationCounts),
            performanceAverages: {}
        };

        // Calculate performance averages
        Object.entries(this.metrics.performanceMetrics).forEach(([context, times]) => {
            if (times.length > 0) {
                summary.performanceAverages[context] = {
                    average: times.reduce((sum, time) => sum + time, 0) / times.length,
                    min: Math.min(...times),
                    max: Math.max(...times),
                    count: times.length
                };
            }
        });

        return summary;
    }
}

// Create global metrics collector instance
export const globalValidationMetrics = new ValidationMetricsCollector();

// ============================================================================
// EXPORTS
// ============================================================================

export default {
    ValidationOrchestrator,
    ValidationMetricsCollector,
    validateCompleteLeagueSetup,
    validateCompleteManagerData,
    validateHistoricalData,
    runValidationTestSuite,
    globalValidationMetrics,
    VALIDATION_INTEGRATION_CONFIG
};
