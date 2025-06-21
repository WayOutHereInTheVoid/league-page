/**
 * Award Processing Utilities - Phase 1: Data Validation & Type Safety
 * Enhanced utilities for robust awards processing with comprehensive validation
 */

/**
 * Validate awards data structure and normalize values
 * @param {Array} awards - Raw awards data from API
 * @returns {Array} Validated and normalized awards data
 */
export function validateAndNormalizeAwards(awards) {
    if (!awards || !Array.isArray(awards)) {
        console.warn('[Awards Validation] Awards data is not an array:', awards);
        return [];
    }

    const validatedAwards = [];

    for (const award of awards) {
        try {
            const validatedAward = validateSingleAward(award);
            if (validatedAward) {
                validatedAwards.push(validatedAward);
            }
        } catch (error) {
            console.error('[Awards Validation] Error validating award:', error, award);
            // Continue processing other awards
        }
    }

    return validatedAwards;
}

/**
 * Validate and normalize a single award object
 * @param {Object} award - Single award object
 * @returns {Object|null} Validated award or null if invalid
 */
function validateSingleAward(award) {
    if (!award || typeof award !== 'object') {
        console.warn('[Awards Validation] Invalid award object:', award);
        return null;
    }

    // Validate required fields
    if (!award.year || isNaN(parseInt(award.year))) {
        console.warn('[Awards Validation] Award missing valid year:', award);
        return null;
    }

    const validatedAward = {
        year: parseInt(award.year),
        champion: normalizeRosterID(award.champion),
        second: normalizeRosterID(award.second),
        third: normalizeRosterID(award.third),
        toilet: normalizeRosterID(award.toilet),
        divisions: validateDivisions(award.divisions)
    };

    // Ensure at least one meaningful award exists
    if (!validatedAward.champion && !validatedAward.second && !validatedAward.third && 
        (!validatedAward.divisions || validatedAward.divisions.length === 0)) {
        console.warn('[Awards Validation] Award has no meaningful data:', award);
        return null;
    }

    return validatedAward;
}

/**
 * Normalize roster ID to ensure consistent type handling
 * @param {*} rosterID - Raw roster ID (could be string, number, or undefined)
 * @returns {number|null} Normalized roster ID as integer or null
 */
function normalizeRosterID(rosterID) {
    if (rosterID === undefined || rosterID === null || rosterID === '') {
        return null;
    }

    const normalized = parseInt(rosterID);
    if (isNaN(normalized) || normalized <= 0) {
        return null;
    }

    return normalized;
}

/**
 * Validate and normalize divisions data
 * @param {Array} divisions - Raw divisions data
 * @returns {Array} Validated divisions array
 */
function validateDivisions(divisions) {
    if (!divisions || !Array.isArray(divisions)) {
        return [];
    }

    const validatedDivisions = [];

    for (const division of divisions) {
        if (!division || typeof division !== 'object') {
            continue;
        }

        const normalizedRosterID = normalizeRosterID(division.rosterID);
        if (normalizedRosterID !== null) {
            validatedDivisions.push({
                rosterID: normalizedRosterID,
                name: division.name || `Division ${validatedDivisions.length + 1}`,
                wins: parseInt(division.wins) || 0,
                points: parseFloat(division.points) || 0
            });
        }
    }

    return validatedDivisions;
}

/**
 * Enhanced award detection for a specific roster and year
 * @param {number} rosterID - The roster ID to check awards for
 * @param {number} year - The year to check awards for
 * @param {Array} validatedAwards - Pre-validated awards data
 * @returns {Object} Award detection results
 */
export function detectAwardsForRoster(rosterID, year, validatedAwards) {
    const normalizedRosterID = normalizeRosterID(rosterID);
    const normalizedYear = parseInt(year);

    if (!normalizedRosterID || !normalizedYear || !Array.isArray(validatedAwards)) {
        return {
            playoffs: false,
            championship: false,
            divisionChamp: false,
            runnerUp: false,
            thirdPlace: false,
            toilet: false,
            detectionLog: ['Invalid input parameters']
        };
    }

    const detectionLog = [];
    let playoffs = false;
    let championship = false;
    let divisionChamp = false;
    let runnerUp = false;
    let thirdPlace = false;
    let toilet = false;

    // Find awards for the specific year
    const yearAwards = validatedAwards.filter(award => award.year === normalizedYear);
    
    if (yearAwards.length === 0) {
        detectionLog.push(`No awards found for year ${normalizedYear}`);
        return {
            playoffs,
            championship,
            divisionChamp,
            runnerUp,
            thirdPlace,
            toilet,
            detectionLog
        };
    }

    detectionLog.push(`Found ${yearAwards.length} award(s) for year ${normalizedYear}`);

    for (const award of yearAwards) {
        // Championship check
        if (award.champion === normalizedRosterID) {
            championship = true;
            playoffs = true;
            detectionLog.push(`Championship detected for roster ${normalizedRosterID}`);
        }

        // Runner-up check
        if (award.second === normalizedRosterID) {
            runnerUp = true;
            playoffs = true;
            detectionLog.push(`Runner-up (2nd place) detected for roster ${normalizedRosterID}`);
        }

        // Third place check
        if (award.third === normalizedRosterID) {
            thirdPlace = true;
            playoffs = true;
            detectionLog.push(`Third place detected for roster ${normalizedRosterID}`);
        }

        // Toilet bowl check
        if (award.toilet === normalizedRosterID) {
            toilet = true;
            detectionLog.push(`Toilet bowl detected for roster ${normalizedRosterID}`);
        }

        // Division championship check
        if (award.divisions && award.divisions.length > 0) {
            const divisionWin = award.divisions.find(div => div.rosterID === normalizedRosterID);
            if (divisionWin) {
                divisionChamp = true;
                playoffs = true;
                detectionLog.push(`Division championship detected for roster ${normalizedRosterID} (${divisionWin.name || 'Unknown Division'})`);
            }
        }
    }

    return {
        playoffs,
        championship,
        divisionChamp,
        runnerUp,
        thirdPlace,
        toilet,
        detectionLog
    };
}

/**
 * Comprehensive validation report for awards data
 * @param {Array} rawAwards - Raw awards data
 * @returns {Object} Validation report with statistics and issues
 */
export function generateAwardsValidationReport(rawAwards) {
    const report = {
        totalAwards: 0,
        validAwards: 0,
        invalidAwards: 0,
        yearsCovered: [],
        issues: [],
        statistics: {
            championsFound: 0,
            runnerUpsFound: 0,
            thirdPlacesFound: 0,
            divisionChampionships: 0,
            toiletBowlWinners: 0
        }
    };

    if (!rawAwards || !Array.isArray(rawAwards)) {
        report.issues.push('Awards data is not an array');
        return report;
    }

    report.totalAwards = rawAwards.length;

    const validatedAwards = validateAndNormalizeAwards(rawAwards);
    report.validAwards = validatedAwards.length;
    report.invalidAwards = report.totalAwards - report.validAwards;

    // Collect statistics
    const years = new Set();
    for (const award of validatedAwards) {
        years.add(award.year);
        
        if (award.champion) report.statistics.championsFound++;
        if (award.second) report.statistics.runnerUpsFound++;
        if (award.third) report.statistics.thirdPlacesFound++;
        if (award.toilet) report.statistics.toiletBowlWinners++;
        if (award.divisions) report.statistics.divisionChampionships += award.divisions.length;
    }

    report.yearsCovered = Array.from(years).sort((a, b) => b - a);

    // Identify potential issues
    if (report.invalidAwards > 0) {
        report.issues.push(`${report.invalidAwards} invalid award entries found`);
    }

    if (report.yearsCovered.length === 0) {
        report.issues.push('No valid years found in awards data');
    }

    // Check for missing champions (unusual but possible)
    const missingChampions = validatedAwards.filter(award => !award.champion).length;
    if (missingChampions > 0) {
        report.issues.push(`${missingChampions} years missing champion data`);
    }

    return report;
}

/**
 * Debug logging utility for award processing
 * @param {string} context - Debug context
 * @param {*} data - Data to log
 * @param {string} level - Log level (info, warn, error)
 */
export function debugAwardProcessing(context, data, level = 'info') {
    if (typeof window !== 'undefined' && window.localStorage?.getItem('debug-manager-stats') === 'true') {
        const logMethod = level === 'error' ? console.error : (level === 'warn' ? console.warn : console.log);
        
        console.group(`[Awards Processing] ${context}`);
        logMethod('Data:', JSON.parse(JSON.stringify(data)));
        console.groupEnd();
    }
}
