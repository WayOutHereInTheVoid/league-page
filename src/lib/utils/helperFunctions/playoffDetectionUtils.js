/**
 * Playoff Detection Utilities - Phase 2: Enhanced Playoff Detection Logic
 * Comprehensive playoff bracket parsing and validation for different league formats
 */

import { debugAwardProcessing } from './awardProcessingUtils';

/**
 * Playoff format configurations for different league structures
 */
const PLAYOFF_FORMATS = {
    4: { teams: 4, rounds: 2, hasWildCard: false, hasByes: false },
    6: { teams: 6, rounds: 3, hasWildCard: true, hasByes: true },
    8: { teams: 8, rounds: 3, hasWildCard: false, hasByes: false },
    10: { teams: 10, rounds: 4, hasWildCard: true, hasByes: true },
    12: { teams: 12, rounds: 4, hasWildCard: true, hasByes: true },
    14: { teams: 14, rounds: 4, hasWildCard: true, hasByes: true }
};

/**
 * Enhanced playoff bracket parser that handles multiple formats
 * @param {Array} winnersData - Winners bracket data from Sleeper API
 * @param {Array} losersData - Losers bracket data from Sleeper API  
 * @param {Object} leagueSettings - League settings including playoff configuration
 * @returns {Object} Parsed playoff structure with participants
 */
export function parsePlayoffBrackets(winnersData, losersData, leagueSettings) {
    debugAwardProcessing('Playoff Bracket Parsing - Input', {
        winnersDataLength: winnersData?.length || 0,
        losersDataLength: losersData?.length || 0,
        leagueSettings: {
            totalRosters: leagueSettings?.total_rosters,
            playoffTeams: leagueSettings?.playoff_teams,
            playoffWeekStart: leagueSettings?.playoff_week_start
        }
    });

    if (!winnersData || !Array.isArray(winnersData) || winnersData.length === 0) {
        debugAwardProcessing('Playoff Bracket Parsing - ERROR', {
            message: 'No valid winners bracket data'
        }, 'error');
        return createEmptyPlayoffStructure();
    }

    // Determine playoff format based on league settings and bracket data
    const playoffFormat = determinePlayoffFormat(winnersData, losersData, leagueSettings);
    
    debugAwardProcessing('Playoff Format Detection', {
        detectedFormat: playoffFormat,
        totalRounds: Math.max(...winnersData.map(m => m.r || 0))
    });

    // Parse bracket structure
    const bracketStructure = parseBracketStructure(winnersData, playoffFormat);
    
    // Identify all playoff participants using multiple validation methods
    const playoffParticipants = identifyPlayoffParticipants(
        winnersData, 
        losersData, 
        bracketStructure, 
        playoffFormat
    );

    // Extract championship information
    const championshipInfo = extractChampionshipInfo(winnersData, playoffFormat);

    // Build comprehensive playoff structure
    const playoffStructure = {
        format: playoffFormat,
        bracketStructure,
        participants: playoffParticipants,
        championship: championshipInfo,
        validationResults: validatePlayoffStructure(playoffParticipants, championshipInfo, playoffFormat)
    };

    debugAwardProcessing('Playoff Structure - Final', playoffStructure);
    
    return playoffStructure;
}

/**
 * Determine playoff format based on available data
 * @param {Array} winnersData - Winners bracket data
 * @param {Array} losersData - Losers bracket data
 * @param {Object} leagueSettings - League settings
 * @returns {Object} Playoff format configuration
 */
function determinePlayoffFormat(winnersData, losersData, leagueSettings) {
    // Try to get playoff teams from league settings first
    let playoffTeams = leagueSettings?.playoff_teams;
    
    // If not available, infer from bracket data
    if (!playoffTeams) {
        // Count unique teams that appear in bracket
        const teamsInBracket = new Set();
        
        winnersData.forEach(match => {
            if (match.t1 && typeof match.t1 === 'number') teamsInBracket.add(match.t1);
            if (match.t2 && typeof match.t2 === 'number') teamsInBracket.add(match.t2);
        });
        
        playoffTeams = teamsInBracket.size;
    }
    
    // Get format configuration or create custom one
    const format = PLAYOFF_FORMATS[playoffTeams] || {
        teams: playoffTeams,
        rounds: Math.max(...winnersData.map(m => m.r || 0)),
        hasWildCard: playoffTeams > 8,
        hasByes: playoffTeams % 4 !== 0
    };

    return {
        ...format,
        totalRosters: leagueSettings?.total_rosters || 12,
        playoffWeekStart: leagueSettings?.playoff_week_start || 14
    };
}

/**
 * Parse bracket structure to understand matchup flow
 * @param {Array} winnersData - Winners bracket data
 * @param {Object} playoffFormat - Playoff format configuration
 * @returns {Object} Parsed bracket structure
 */
function parseBracketStructure(winnersData, playoffFormat) {
    const structure = {
        rounds: {},
        matchupFlow: {},
        byeWeeks: []
    };

    // Group matches by round
    winnersData.forEach(match => {
        const round = match.r || 1;
        
        if (!structure.rounds[round]) {
            structure.rounds[round] = [];
        }
        
        structure.rounds[round].push({
            matchId: match.m,
            team1: match.t1,
            team2: match.t2,
            winner: match.w,
            loser: match.l,
            team1From: match.t1_from,
            team2From: match.t2_from
        });
    });

    // Identify bye weeks (teams that advance without playing)
    Object.entries(structure.rounds).forEach(([round, matches]) => {
        matches.forEach(match => {
            // Check for bye situations (null opponent)
            if (match.team1 && !match.team2) {
                structure.byeWeeks.push({
                    round: parseInt(round),
                    team: match.team1,
                    matchId: match.matchId
                });
            }
            if (match.team2 && !match.team1) {
                structure.byeWeeks.push({
                    round: parseInt(round),
                    team: match.team2,
                    matchId: match.matchId
                });
            }
        });
    });

    debugAwardProcessing('Bracket Structure Parsed', {
        totalRounds: Object.keys(structure.rounds).length,
        matchesByRound: Object.entries(structure.rounds).map(([r, matches]) => 
            ({ round: r, matchCount: matches.length })
        ),
        byeWeeksFound: structure.byeWeeks.length
    });

    return structure;
}

/**
 * ENHANCED: Identify all playoff participants using multiple validation methods
 * @param {Array} winnersData - Winners bracket data
 * @param {Array} losersData - Losers bracket data
 * @param {Object} bracketStructure - Parsed bracket structure
 * @param {Object} playoffFormat - Playoff format configuration
 * @returns {Set} Set of roster IDs that made playoffs
 */
function identifyPlayoffParticipants(winnersData, losersData, bracketStructure, playoffFormat) {
    const participants = new Set();
    const validationMethods = [];

    // Method 1: Extract from first round matches
    const firstRoundParticipants = extractFirstRoundParticipants(bracketStructure);
    firstRoundParticipants.forEach(p => participants.add(p));
    validationMethods.push({
        method: 'First Round Extraction',
        count: firstRoundParticipants.size,
        participants: Array.from(firstRoundParticipants)
    });

    // Method 2: Extract from bye weeks (teams that got first-round byes)
    const byeParticipants = extractByeParticipants(bracketStructure);
    byeParticipants.forEach(p => participants.add(p));
    validationMethods.push({
        method: 'Bye Week Extraction', 
        count: byeParticipants.size,
        participants: Array.from(byeParticipants)
    });

    // Method 3: Traverse bracket tree to find all teams that appeared
    const bracketTraversalParticipants = traverseBracketForParticipants(winnersData, losersData);
    bracketTraversalParticipants.forEach(p => participants.add(p));
    validationMethods.push({
        method: 'Bracket Traversal',
        count: bracketTraversalParticipants.size,
        participants: Array.from(bracketTraversalParticipants)
    });

    // Method 4: Cross-validate with expected playoff team count
    const expectedCount = playoffFormat.teams;
    const actualCount = participants.size;

    debugAwardProcessing('Playoff Participants Detection', {
        expectedPlayoffTeams: expectedCount,
        actualParticipantsFound: actualCount,
        validationMethods,
        finalParticipants: Array.from(participants).sort((a, b) => a - b),
        countMismatch: expectedCount !== actualCount
    });

    // If count doesn't match expected, try additional validation
    if (actualCount !== expectedCount) {
        debugAwardProcessing('Playoff Count Mismatch - Additional Validation', {
            expected: expectedCount,
            actual: actualCount,
            difference: Math.abs(expectedCount - actualCount)
        }, 'warn');

        // Try to reconcile using losers bracket data
        if (losersData && Array.isArray(losersData) && losersData.length > 0) {
            const losersParticipants = extractParticipantsFromLosersBracket(losersData);
            losersParticipants.forEach(p => participants.add(p));
            
            debugAwardProcessing('Losers Bracket Reconciliation', {
                losersParticipantsAdded: losersParticipants.size,
                newTotal: participants.size
            });
        }
    }

    return participants;
}

/**
 * Extract participants from first round matches
 * @param {Object} bracketStructure - Parsed bracket structure
 * @returns {Set} Set of roster IDs from first round
 */
function extractFirstRoundParticipants(bracketStructure) {
    const participants = new Set();
    const firstRound = bracketStructure.rounds[1] || [];

    firstRound.forEach(match => {
        if (match.team1 && typeof match.team1 === 'number') {
            participants.add(match.team1);
        }
        if (match.team2 && typeof match.team2 === 'number') {
            participants.add(match.team2);
        }
    });

    return participants;
}

/**
 * Extract participants who received byes
 * @param {Object} bracketStructure - Parsed bracket structure
 * @returns {Set} Set of roster IDs that received byes
 */
function extractByeParticipants(bracketStructure) {
    const participants = new Set();
    
    // Teams with byes appear in later rounds without being in first round
    const firstRoundTeams = extractFirstRoundParticipants(bracketStructure);
    
    // Check subsequent rounds for teams not in first round
    Object.entries(bracketStructure.rounds).forEach(([round, matches]) => {
        if (parseInt(round) > 1) {
            matches.forEach(match => {
                // Check if team appears directly (bye) without coming from first round
                if (match.team1 && typeof match.team1 === 'number' && 
                    !firstRoundTeams.has(match.team1) && !match.team1From) {
                    participants.add(match.team1);
                }
                if (match.team2 && typeof match.team2 === 'number' && 
                    !firstRoundTeams.has(match.team2) && !match.team2From) {
                    participants.add(match.team2);
                }
            });
        }
    });

    // Also include explicit bye weeks
    bracketStructure.byeWeeks.forEach(bye => {
        if (bye.team && typeof bye.team === 'number') {
            participants.add(bye.team);
        }
    });

    return participants;
}

/**
 * Traverse entire bracket structure to find all participants
 * @param {Array} winnersData - Winners bracket data
 * @param {Array} losersData - Losers bracket data
 * @returns {Set} Set of all roster IDs found in brackets
 */
function traverseBracketForParticipants(winnersData, losersData) {
    const participants = new Set();

    // Process winners bracket
    winnersData.forEach(match => {
        if (match.t1 && typeof match.t1 === 'number') participants.add(match.t1);
        if (match.t2 && typeof match.t2 === 'number') participants.add(match.t2);
        if (match.w && typeof match.w === 'number') participants.add(match.w);
        if (match.l && typeof match.l === 'number') participants.add(match.l);
    });

    // Process losers bracket if available
    if (losersData && Array.isArray(losersData)) {
        losersData.forEach(match => {
            if (match.t1 && typeof match.t1 === 'number') participants.add(match.t1);
            if (match.t2 && typeof match.t2 === 'number') participants.add(match.t2);
            if (match.w && typeof match.w === 'number') participants.add(match.w);
            if (match.l && typeof match.l === 'number') participants.add(match.l);
        });
    }

    return participants;
}

/**
 * Extract participants specifically from losers bracket
 * @param {Array} losersData - Losers bracket data
 * @returns {Set} Set of roster IDs from losers bracket
 */
function extractParticipantsFromLosersBracket(losersData) {
    const participants = new Set();

    losersData.forEach(match => {
        if (match.t1 && typeof match.t1 === 'number') participants.add(match.t1);
        if (match.t2 && typeof match.t2 === 'number') participants.add(match.t2);
    });

    return participants;
}

/**
 * Extract championship information from bracket data
 * @param {Array} winnersData - Winners bracket data
 * @param {Object} playoffFormat - Playoff format configuration
 * @returns {Object} Championship information
 */
function extractChampionshipInfo(winnersData, playoffFormat) {
    const finalRound = Math.max(...winnersData.map(m => m.r || 0));
    const championshipMatch = winnersData.find(m => 
        m.r === finalRound && m.w && m.l
    );

    const championshipInfo = {
        finalRound,
        championshipMatch: championshipMatch ? {
            matchId: championshipMatch.m,
            champion: championshipMatch.w,
            runnerUp: championshipMatch.l,
            team1: championshipMatch.t1,
            team2: championshipMatch.t2
        } : null,
        thirdPlaceMatch: null // Will be extracted separately if exists
    };

    // Look for third place match (common in some formats)
    const thirdPlaceMatch = winnersData.find(m => 
        m.r === finalRound - 1 && 
        m.t1_from?.l && m.t2_from?.l // Match between losers
    );

    if (thirdPlaceMatch && thirdPlaceMatch.w) {
        championshipInfo.thirdPlaceMatch = {
            matchId: thirdPlaceMatch.m,
            thirdPlace: thirdPlaceMatch.w,
            fourthPlace: thirdPlaceMatch.l
        };
    }

    debugAwardProcessing('Championship Info Extracted', championshipInfo);
    
    return championshipInfo;
}

/**
 * Validate playoff structure for consistency
 * @param {Set} participants - Set of playoff participants
 * @param {Object} championshipInfo - Championship information
 * @param {Object} playoffFormat - Expected playoff format
 * @returns {Object} Validation results
 */
function validatePlayoffStructure(participants, championshipInfo, playoffFormat) {
    const validation = {
        isValid: true,
        issues: [],
        warnings: []
    };

    // Check participant count
    if (participants.size !== playoffFormat.teams) {
        validation.issues.push(
            `Expected ${playoffFormat.teams} playoff teams, found ${participants.size}`
        );
        validation.isValid = false;
    }

    // Check championship data
    if (!championshipInfo.championshipMatch) {
        validation.warnings.push('No championship match found');
    } else {
        // Validate champion and runner-up are in participant list
        const { champion, runnerUp } = championshipInfo.championshipMatch;
        
        if (champion && !participants.has(champion)) {
            validation.issues.push(`Champion (${champion}) not found in participant list`);
            validation.isValid = false;
        }
        
        if (runnerUp && !participants.has(runnerUp)) {
            validation.issues.push(`Runner-up (${runnerUp}) not found in participant list`);
            validation.isValid = false;
        }
    }

    // Check for logical inconsistencies
    if (playoffFormat.hasByes && participants.size % 2 === 0) {
        validation.warnings.push('Format indicates byes but participant count is even');
    }

    debugAwardProcessing('Playoff Structure Validation', validation);
    
    return validation;
}

/**
 * Create empty playoff structure for error cases
 * @returns {Object} Empty playoff structure
 */
function createEmptyPlayoffStructure() {
    return {
        format: { teams: 0, rounds: 0, hasWildCard: false, hasByes: false },
        bracketStructure: { rounds: {}, matchupFlow: {}, byeWeeks: [] },
        participants: new Set(),
        championship: { finalRound: 0, championshipMatch: null, thirdPlaceMatch: null },
        validationResults: { isValid: false, issues: ['No bracket data available'], warnings: [] }
    };
}

/**
 * ENHANCED: Determine if a roster made playoffs using comprehensive bracket analysis
 * @param {number} rosterID - The roster ID to check
 * @param {number} year - The year to check
 * @param {Array} winnersData - Winners bracket data
 * @param {Array} losersData - Losers bracket data  
 * @param {Object} leagueSettings - League settings
 * @returns {Object} Detailed playoff analysis
 */
export function analyzePlayoffParticipation(rosterID, year, winnersData, losersData, leagueSettings) {
    debugAwardProcessing('Playoff Participation Analysis', {
        rosterID,
        year,
        hasWinnersData: !!winnersData,
        hasLosersData: !!losersData
    });

    if (!winnersData || !Array.isArray(winnersData)) {
        return {
            madePlayoffs: false,
            reason: 'No bracket data available',
            confidence: 0,
            details: {}
        };
    }

    // Parse playoff structure
    const playoffStructure = parsePlayoffBrackets(winnersData, losersData, leagueSettings);
    
    // Check if roster is in participants
    const madePlayoffs = playoffStructure.participants.has(rosterID);
    
    // Determine placement and achievements
    const achievements = analyzePlayoffAchievements(rosterID, playoffStructure);
    
    // Calculate confidence based on data quality
    const confidence = calculateAnalysisConfidence(playoffStructure, achievements);

    const analysis = {
        madePlayoffs,
        reason: madePlayoffs ? 'Found in playoff bracket' : 'Not found in playoff participants',
        confidence,
        details: {
            playoffFormat: playoffStructure.format,
            achievements,
            validationResults: playoffStructure.validationResults
        }
    };

    debugAwardProcessing('Playoff Analysis Complete', analysis);
    
    return analysis;
}

/**
 * Analyze specific playoff achievements for a roster
 * @param {number} rosterID - The roster ID to analyze
 * @param {Object} playoffStructure - Parsed playoff structure
 * @returns {Object} Detailed achievements
 */
function analyzePlayoffAchievements(rosterID, playoffStructure) {
    const achievements = {
        champion: false,
        runnerUp: false,
        thirdPlace: false,
        semifinalist: false,
        receivedBye: false,
        eliminatedInRound: null
    };

    // Check championship achievements
    const { championshipMatch, thirdPlaceMatch } = playoffStructure.championship;
    
    if (championshipMatch) {
        if (championshipMatch.champion === rosterID) {
            achievements.champion = true;
        }
        if (championshipMatch.runnerUp === rosterID) {
            achievements.runnerUp = true;
        }
    }

    if (thirdPlaceMatch && thirdPlaceMatch.thirdPlace === rosterID) {
        achievements.thirdPlace = true;
    }

    // Check for bye weeks
    const receivedBye = playoffStructure.bracketStructure.byeWeeks.some(
        bye => bye.team === rosterID
    );
    achievements.receivedBye = receivedBye;

    // Determine elimination round by finding last appearance
    let lastRound = 0;
    Object.entries(playoffStructure.bracketStructure.rounds).forEach(([round, matches]) => {
        const appearsInRound = matches.some(match => 
            match.team1 === rosterID || match.team2 === rosterID ||
            match.winner === rosterID || match.loser === rosterID
        );
        if (appearsInRound) {
            lastRound = Math.max(lastRound, parseInt(round));
        }
    });

    if (lastRound > 0 && !achievements.champion) {
        achievements.eliminatedInRound = lastRound;
        
        // Determine if semifinalist (made it to final four)
        const totalRounds = playoffStructure.format.rounds;
        if (lastRound >= totalRounds - 1) {
            achievements.semifinalist = true;
        }
    }

    return achievements;
}

/**
 * Calculate confidence score for playoff analysis
 * @param {Object} playoffStructure - Parsed playoff structure
 * @param {Object} achievements - Analyzed achievements
 * @returns {number} Confidence score (0-100)
 */
function calculateAnalysisConfidence(playoffStructure, achievements) {
    let confidence = 100;

    // Reduce confidence for validation issues
    if (!playoffStructure.validationResults.isValid) {
        confidence -= 30;
    }

    // Reduce confidence for warnings
    confidence -= playoffStructure.validationResults.warnings.length * 10;

    // Reduce confidence if no championship data
    if (!playoffStructure.championship.championshipMatch) {
        confidence -= 20;
    }

    // Increase confidence if multiple data points align
    if (achievements.champion || achievements.runnerUp) {
        confidence += 10; // Championship data is usually most reliable
    }

    return Math.max(0, Math.min(100, confidence));
}
