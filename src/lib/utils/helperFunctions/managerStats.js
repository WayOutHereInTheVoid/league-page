import { round } from './universalFunctions';
import { 
    validateAndNormalizeAwards, 
    detectAwardsForRoster, 
    debugAwardProcessing 
} from './awardProcessingUtils';
import { 
    analyzePlayoffParticipation 
} from './playoffDetectionUtils';

/**
 * Get all roster IDs that a manager has used across all seasons
 * @param {String} managerID - The manager's ID
 * @param {Object} leagueTeamManagers - League team manager data
 * @returns {Object} Map of year -> rosterID for this manager
 */
function getAllManagerRosterIDs(managerID, leagueTeamManagers) {
    const managerRosters = {};
    
    if (!leagueTeamManagers?.teamManagersMap) {
        return managerRosters;
    }
    
    // Search through all years to find all roster IDs this manager has used
    for (const [year, yearData] of Object.entries(leagueTeamManagers.teamManagersMap)) {
        for (const [rosterID, rosterData] of Object.entries(yearData)) {
            if (rosterData.managers && rosterData.managers.includes(managerID)) {
                managerRosters[year] = rosterID;
                break; // Manager can only have one roster per year
            }
        }
    }
    
    return managerRosters;
}

/**
 * Get season data for all roster IDs this manager has used
 * @param {Object} managerRosters - Map of year -> rosterID
 * @param {Object} records - League records data
 * @returns {Array} Array of season data objects
 */
function aggregateManagerSeasonData(managerRosters, records) {
    const seasons = [];
    
    if (!records?.regularSeasonData?.leagueRosterRecords) {
        return seasons;
    }
    
    const rosterRecords = records.regularSeasonData.leagueRosterRecords;
    
    // For each year this manager played, get their season data
    for (const [year, rosterID] of Object.entries(managerRosters)) {
        const rosterData = rosterRecords[rosterID];
        
        if (!rosterData?.years) {
            continue;
        }
        
        // Find the specific year's data for this roster
        const yearData = rosterData.years.find(y => y.year === parseInt(year));
        
        if (yearData) {
            seasons.push({
                ...yearData,
                rosterID: rosterID // Include rosterID for awards matching
            });
        }
    }
    
    return seasons;
}

/**
 * ENHANCED: Process individual season data and add awards/achievements with robust validation
 * @param {Object} yearData - Season data for a specific year
 * @param {Array} awards - Awards data (will be validated and normalized)
 * @param {Object} managerRosters - Map of year -> rosterID for this manager
 * @returns {Object} Processed season object
 */
function processSeasonData(yearData, awards, managerRosters) {
    debugAwardProcessing('processSeasonData - Input', {
        year: yearData.year,
        rosterID: yearData.rosterID,
        hasAwards: !!awards,
        awardsLength: awards?.length || 0
    });

    // PHASE 1 ENHANCEMENT: Validate and normalize awards data
    const validatedAwards = validateAndNormalizeAwards(awards);
    
    debugAwardProcessing('Awards Validation', {
        originalCount: awards?.length || 0,
        validatedCount: validatedAwards.length,
        validatedAwards: validatedAwards
    });

    // PHASE 1 ENHANCEMENT: Use robust award detection
    const awardResults = detectAwardsForRoster(
        yearData.rosterID, 
        yearData.year, 
        validatedAwards
    );

    debugAwardProcessing('Award Detection Results', {
        rosterID: yearData.rosterID,
        year: yearData.year,
        results: awardResults
    });

    // Extract award flags from enhanced detection
    const { 
        playoffs, 
        championship, 
        divisionChamp, 
        runnerUp, 
        thirdPlace, 
        toilet 
    } = awardResults;

    // ENHANCED: Use correct field names with fallbacks and ensure numbers
    // Try multiple field name variations for points for
    let fpts = 0;
    if (yearData.fpts !== undefined && yearData.fpts !== null) {
        fpts = parseFloat(yearData.fpts);
        // Handle decimal points if they exist as separate field
        if (yearData.fpts_decimal) {
            fpts += parseFloat(yearData.fpts_decimal) / 100;
        }
    } else if (yearData.fptsFor !== undefined && yearData.fptsFor !== null) {
        fpts = parseFloat(yearData.fptsFor);
    }
    
    // Try multiple field name variations for points against
    let fptsAgainst = 0;
    if (yearData.fptsAgainst !== undefined && yearData.fptsAgainst !== null) {
        fptsAgainst = parseFloat(yearData.fptsAgainst);
        // Handle decimal points if they exist as separate field
        if (yearData.fptsAgainst_decimal) {
            fptsAgainst += parseFloat(yearData.fptsAgainst_decimal) / 100;
        }
    } else if (yearData.fpts_against !== undefined && yearData.fpts_against !== null) {
        fptsAgainst = parseFloat(yearData.fpts_against);
        // Handle decimal points if they exist as separate field
        if (yearData.fpts_against_decimal) {
            fptsAgainst += parseFloat(yearData.fpts_against_decimal) / 100;
        }
    }
    
    // Try multiple field name variations for potential points
    let potentialPoints = 0;
    if (yearData.potentialPoints !== undefined && yearData.potentialPoints !== null) {
        potentialPoints = parseFloat(yearData.potentialPoints);
    } else if (yearData.ppts !== undefined && yearData.ppts !== null) {
        potentialPoints = parseFloat(yearData.ppts);
        // Handle decimal points if they exist as separate field
        if (yearData.ppts_decimal) {
            potentialPoints += parseFloat(yearData.ppts_decimal) / 100;
        }
    }
    
    // Apply rounding and ensure valid numbers
    fpts = parseFloat(round(fpts || 0));
    fptsAgainst = parseFloat(round(fptsAgainst || 0));
    potentialPoints = parseFloat(round(potentialPoints || 0));

    // PHASE 1 ENHANCEMENT: Enhanced season object with additional award details
    const processedSeason = {
        year: yearData.year,
        wins: yearData.wins || 0,
        losses: yearData.losses || 0,
        ties: yearData.ties || 0,
        fpts: fpts,
        fptsAgainst: fptsAgainst,
        playoffs,
        championship,
        divisionChamp,
        runnerUp,        // NEW: Explicit runner-up tracking
        thirdPlace,      // NEW: Explicit third place tracking
        toilet,          // NEW: Toilet bowl tracking
        potentialPoints: potentialPoints,
        lineupEfficiency: potentialPoints > 0 ? 
            parseFloat(round((fpts / potentialPoints) * 100)) : 0,
        rosterID: yearData.rosterID,
        awardDetectionLog: awardResults.detectionLog // NEW: Debug information
    };

    debugAwardProcessing('processSeasonData - Output', processedSeason);
    
    return processedSeason;
}

/**
 * ENHANCED: Create empty stats object for fallback cases with new award tracking
 * @returns {Object} Empty statistics object
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
        runnerUpFinishes: 0,        // NEW: Track runner-up finishes
        thirdPlaceFinishes: 0,      // NEW: Track third place finishes
        toiletBowlWins: 0,          // NEW: Track toilet bowl wins
        seasonsPlayed: 0,
        winPercentage: 0,
        averagePointsPerSeason: 0,
        averagePointsPerGame: 0
    };
}

/**
 * Legacy fallback function for managers without managerID
 * @param {Object} manager - The manager object
 * @param {Object} leagueTeamManagers - League team manager data
 * @param {Object} records - League records data
 * @param {String} currentRosterID - Current roster ID
 * @param {Array} awards - Awards data
 * @returns {Object} Manager statistics object
 */
function computeManagerStatsLegacy(manager, leagueTeamManagers, records, currentRosterID, awards) {
    if (!records?.regularSeasonData?.leagueRosterRecords) {
        return { seasons: [], totalStats: getEmptyStats() };
    }
    
    const rosterRecords = records.regularSeasonData.leagueRosterRecords;
    const seasonData = rosterRecords?.[currentRosterID]?.years || [];
    
    const seasons = [];
    for (const yearData of seasonData) {
        const season = processSeasonData({ ...yearData, rosterID: currentRosterID }, awards, {});
        seasons.push(season);
    }
    
    // Calculate basic totals
    const totalStats = getEmptyStats();
    seasons.forEach(season => {
        totalStats.totalWins += season.wins;
        totalStats.totalLosses += season.losses;
        totalStats.totalTies += season.ties;
        totalStats.totalPoints += season.fpts;
        totalStats.totalPointsAgainst += season.fptsAgainst;
        totalStats.seasonsPlayed++;
        
        if (season.playoffs) totalStats.playoffAppearances++;
        if (season.championship) totalStats.championships++;
        if (season.divisionChamp) totalStats.divisionChampionships++;
        if (season.runnerUp) totalStats.runnerUpFinishes++;
        if (season.thirdPlace) totalStats.thirdPlaceFinishes++;
        if (season.toilet) totalStats.toiletBowlWins++;
    });
    
    const totalGames = totalStats.totalWins + totalStats.totalLosses + totalStats.totalTies;
    totalStats.winPercentage = totalGames > 0 ? parseFloat(round((totalStats.totalWins / totalGames) * 100)) : 0;
    totalStats.averagePointsPerSeason = totalStats.seasonsPlayed > 0 ? 
        parseFloat(round(totalStats.totalPoints / totalStats.seasonsPlayed)) : 0;
    
    seasons.sort((a, b) => b.year - a.year);
    
    return { seasons, totalStats };
}

/**
 * Enhanced manager statistics computation with proper cross-season mapping
 * @param {Object} manager - The manager object
 * @param {Object} leagueTeamManagers - League team manager data
 * @param {Object} records - League records data
 * @param {String} currentRosterID - Current roster ID (for fallback)
 * @param {Array} awards - Awards data
 * @returns {Object} Manager statistics object
 */
export function computeManagerStats(manager, leagueTeamManagers, records, currentRosterID, awards) {
    // Validate required data
    if (!manager?.managerID) {
        return computeManagerStatsLegacy(manager, leagueTeamManagers, records, currentRosterID, awards);
    }
    
    if (!records?.regularSeasonData) {
        return { seasons: [], totalStats: getEmptyStats() };
    }
    
    // Get all roster IDs this manager has used across seasons
    const managerRosters = getAllManagerRosterIDs(manager.managerID, leagueTeamManagers);
    
    if (Object.keys(managerRosters).length === 0) {
        return { seasons: [], totalStats: getEmptyStats() };
    }
    
    // Aggregate season data across all roster IDs
    const seasonData = aggregateManagerSeasonData(managerRosters, records);
    
    if (seasonData.length === 0) {
        return { seasons: [], totalStats: getEmptyStats() };
    }
    
    // ENHANCED: Process each season and add awards/achievements with new tracking
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
        runnerUpFinishes: 0,        // NEW: Track runner-up finishes
        thirdPlaceFinishes: 0,      // NEW: Track third place finishes
        toiletBowlWins: 0,          // NEW: Track toilet bowl wins
        seasonsPlayed: 0
    };
    
    debugAwardProcessing('Manager Statistics Calculation', {
        managerID: manager.managerID,
        seasonsToProcess: seasonData.length,
        awardsAvailable: !!awards
    });
    
    for (const yearData of seasonData) {
        const season = processSeasonData(yearData, awards, managerRosters);
        seasons.push(season);
        
        // ENHANCED: Aggregate totals with new award tracking - ensure all values are numbers
        totalStats.totalWins += isNaN(season.wins) ? 0 : season.wins;
        totalStats.totalLosses += isNaN(season.losses) ? 0 : season.losses;
        totalStats.totalTies += isNaN(season.ties) ? 0 : season.ties;
        totalStats.totalPoints += isNaN(season.fpts) ? 0 : season.fpts;
        totalStats.totalPointsAgainst += isNaN(season.fptsAgainst) ? 0 : season.fptsAgainst;
        totalStats.seasonsPlayed++;
        
        // ENHANCED: Track all award categories
        if (season.playoffs) totalStats.playoffAppearances++;
        if (season.championship) totalStats.championships++;
        if (season.divisionChamp) totalStats.divisionChampionships++;
        if (season.runnerUp) totalStats.runnerUpFinishes++;         // NEW
        if (season.thirdPlace) totalStats.thirdPlaceFinishes++;     // NEW
        if (season.toilet) totalStats.toiletBowlWins++;             // NEW
        
        debugAwardProcessing(`Season ${season.year} Aggregation`, {
            season: season.year,
            playoffs: season.playoffs,
            championship: season.championship,
            divisionChamp: season.divisionChamp,
            runnerUp: season.runnerUp,
            thirdPlace: season.thirdPlace,
            toilet: season.toilet,
            currentTotals: { ...totalStats }
        });
    }
    
    // ENHANCED: Calculate derived statistics with validation
    const totalGames = totalStats.totalWins + totalStats.totalLosses + totalStats.totalTies;
    totalStats.winPercentage = totalGames > 0 ? parseFloat(round((totalStats.totalWins / totalGames) * 100)) : 0;
    totalStats.averagePointsPerSeason = totalStats.seasonsPlayed > 0 ? 
        parseFloat(round(totalStats.totalPoints / totalStats.seasonsPlayed)) : 0;
    totalStats.averagePointsPerGame = totalGames > 0 ? 
        parseFloat(round(totalStats.totalPoints / totalGames)) : 0;
    
    // Sort seasons by year (most recent first)
    seasons.sort((a, b) => b.year - a.year);
    
    debugAwardProcessing('Final Manager Statistics', {
        managerID: manager.managerID,
        totalSeasons: seasons.length,
        finalStats: totalStats
    });
    
    return { seasons, totalStats };
}

/**
 * Get historical matchup data across all seasons for head-to-head analysis
 * @param {String} managerID - The manager's ID to get H2H data for
 * @param {Object} leagueTeamManagers - League team manager data
 * @returns {Object} Historical matchup data for H2H processing
 */
async function getHistoricalMatchupData(managerID, leagueTeamManagers) {
    const { leagueID } = await import('$lib/utils/leagueInfo');
    const { getLeagueData } = await import('./leagueData');
    const { waitForAll } = await import('./multiPromise');
    
    let curSeason = leagueID;
    const historicalMatchups = [];
    const managerRosterHistory = {}; // Track which roster ID this manager used each year
    
    // Get all roster IDs this manager has used across seasons
    if (leagueTeamManagers?.teamManagersMap) {
        for (const [year, yearData] of Object.entries(leagueTeamManagers.teamManagersMap)) {
            for (const [rosterID, rosterData] of Object.entries(yearData)) {
                if (rosterData.managers && rosterData.managers.includes(managerID)) {
                    managerRosterHistory[year] = rosterID;
                    break;
                }
            }
        }
    }
    
    // Loop through all seasons to get historical matchup data
    while (curSeason && curSeason != 0) {
        try {
            const leagueData = await getLeagueData(curSeason);
            const year = parseInt(leagueData.season);
            const managerRosterID = managerRosterHistory[year];
            
            if (!managerRosterID) {
                curSeason = leagueData.previous_league_id;
                continue; // Manager didn't play this season
            }
            
            // Get all regular season matchups for this season
            const regularSeasonLength = leagueData.settings.playoff_week_start - 1;
            const matchupsPromises = [];
            
            for (let week = 1; week <= regularSeasonLength; week++) {
                matchupsPromises.push(
                    fetch(`https://api.sleeper.app/v1/league/${curSeason}/matchups/${week}`, {compress: true})
                );
            }
            
            const matchupsResults = await waitForAll(...matchupsPromises);
            const matchupsData = await waitForAll(...matchupsResults.map(res => res.json()));
            
            // Process each week's matchups
            for (let weekIndex = 0; weekIndex < matchupsData.length; weekIndex++) {
                const weekMatchups = matchupsData[weekIndex];
                const week = weekIndex + 1;
                
                // Find this manager's matchup for the week
                const managerMatchup = weekMatchups.find(m => m.roster_id == managerRosterID);
                if (!managerMatchup || !managerMatchup.matchup_id) continue;
                
                // Find opponent in the same matchup
                const opponentMatchup = weekMatchups.find(m => 
                    m.matchup_id === managerMatchup.matchup_id && 
                    m.roster_id != managerRosterID
                );
                
                if (opponentMatchup) {
                    historicalMatchups.push({
                        year,
                        week,
                        managerRosterID,
                        opponentRosterID: opponentMatchup.roster_id,
                        managerPoints: managerMatchup.points || 0,
                        opponentPoints: opponentMatchup.points || 0,
                        won: (managerMatchup.points || 0) > (opponentMatchup.points || 0),
                        tied: (managerMatchup.points || 0) === (opponentMatchup.points || 0)
                    });
                }
            }
            
            curSeason = leagueData.previous_league_id;
        } catch (error) {
            // Skip seasons that fail to load
            break;
        }
    }
    
    return { historicalMatchups, managerRosterHistory };
}

/**
 * Process historical matchup data into head-to-head records by opponent manager
 * @param {Array} historicalMatchups - Array of historical matchup data
 * @param {Object} managerRosterHistory - Manager's roster ID history
 * @param {Object} leagueTeamManagers - League team manager data
 * @returns {Object} Head-to-head records by opponent manager
 */
function processHeadToHeadRecords(historicalMatchups, managerRosterHistory, leagueTeamManagers) {
    const h2hRecords = {};
    
    // Group matchups by opponent roster ID across all seasons
    const opponentGroups = {};
    
    for (const matchup of historicalMatchups) {
        const opponentRosterID = matchup.opponentRosterID.toString();
        
        if (!opponentGroups[opponentRosterID]) {
            opponentGroups[opponentRosterID] = [];
        }
        opponentGroups[opponentRosterID].push(matchup);
    }
    
    // Convert roster ID groups to manager-based records
    for (const [opponentRosterID, matchups] of Object.entries(opponentGroups)) {
        // Find which manager used this roster ID
        let opponentManagerID = null;
        
        // Check each season to find who used this roster ID
        for (const [year, yearData] of Object.entries(leagueTeamManagers.teamManagersMap || {})) {
            if (yearData[opponentRosterID] && yearData[opponentRosterID].managers.length > 0) {
                opponentManagerID = yearData[opponentRosterID].managers[0];
                break;
            }
        }
        
        if (!opponentManagerID) continue;
        
        // Aggregate all matchups against this manager across all their roster IDs
        if (!h2hRecords[opponentManagerID]) {
            h2hRecords[opponentManagerID] = {
                wins: 0,
                losses: 0,
                ties: 0,
                pointsFor: 0,
                pointsAgainst: 0,
                matchups: []
            };
        }
        
        for (const matchup of matchups) {
            if (matchup.tied) {
                h2hRecords[opponentManagerID].ties++;
            } else if (matchup.won) {
                h2hRecords[opponentManagerID].wins++;
            } else {
                h2hRecords[opponentManagerID].losses++;
            }
            
            h2hRecords[opponentManagerID].pointsFor += matchup.managerPoints;
            h2hRecords[opponentManagerID].pointsAgainst += matchup.opponentPoints;
            h2hRecords[opponentManagerID].matchups.push(matchup);
        }
    }
    
    // Convert manager IDs back to roster IDs for UI compatibility
    const finalRecords = {};
    for (const [opponentManagerID, record] of Object.entries(h2hRecords)) {
        // Find this manager's current roster ID for UI display
        const currentYear = Math.max(...Object.keys(leagueTeamManagers.teamManagersMap || {}).map(Number));
        let currentRosterID = null;
        
        const yearData = leagueTeamManagers.teamManagersMap[currentYear];
        if (yearData) {
            for (const [rosterID, rosterData] of Object.entries(yearData)) {
                if (rosterData.managers && rosterData.managers.includes(opponentManagerID)) {
                    currentRosterID = rosterID;
                    break;
                }
            }
        }
        
        if (currentRosterID) {
            finalRecords[currentRosterID] = {
                wins: record.wins,
                losses: record.losses,
                ties: record.ties,
                pointsFor: parseFloat(round(record.pointsFor)),
                pointsAgainst: parseFloat(round(record.pointsAgainst)),
                totalGames: record.wins + record.losses + record.ties
            };
        }
    }
    
    return finalRecords;
}

/**
 * Enhanced head-to-head records computation with real historical matchup data
 * @param {Object} manager - The manager object
 * @param {Object} leagueTeamManagers - League team manager data
 * @param {String} rosterID - Current roster ID (fallback)
 * @param {Array} matchupData - Optional matchup history data (unused in new implementation)
 * @returns {Object} Real head-to-head records across all seasons
 */
export async function computeHeadToHeadRecords(manager, leagueTeamManagers, rosterID, matchupData = null) {
    if (!manager?.managerID || !leagueTeamManagers?.teamManagersMap) {
        return {};
    }
    
    try {
        // Get historical matchup data across all seasons
        const { historicalMatchups, managerRosterHistory } = await getHistoricalMatchupData(
            manager.managerID, 
            leagueTeamManagers
        );
        
        if (historicalMatchups.length === 0) {
            return {};
        }
        
        // Process into head-to-head records by opponent
        const h2hRecords = processHeadToHeadRecords(
            historicalMatchups, 
            managerRosterHistory, 
            leagueTeamManagers
        );
        
        return h2hRecords;
        
    } catch (error) {
        // Fallback to empty records if historical data fails
        return {};
    }
}

/**
 * Get manager performance level based on win percentage
 * @param {Number} winPercentage - Win percentage (0-100)
 * @returns {Object} Performance level object with color and description
 */
export function getManagerPerformanceLevel(winPercentage) {
    if (winPercentage >= 70) {
        return { 
            level: 'Elite', 
            color: '#4CAF50', 
            description: 'Dominant manager with consistent success' 
        };
    }
    if (winPercentage >= 60) {
        return { 
            level: 'Excellent', 
            color: '#8BC34A', 
            description: 'Strong performer above league average' 
        };
    }
    if (winPercentage >= 50) {
        return { 
            level: 'Solid', 
            color: '#FFC107', 
            description: 'Competitive manager around .500' 
        };
    }
    if (winPercentage >= 40) {
        return { 
            level: 'Developing', 
            color: '#FF9800', 
            description: 'Building toward consistent success' 
        };
    }
    return { 
        level: 'Rebuilding', 
        color: '#f44336', 
        description: 'Working to improve performance' 
    };
}

/**
 * Compute manager rankings based on various metrics
 * @param {Object} records - League records data
 * @param {String} rosterID - Current roster ID
 * @returns {Object} Manager rankings
 */
export function computeManagerRankings(records, rosterID) {
    if (!records?.regularSeasonData?.leagueManagerRecords) {
        return {};
    }

    const allRecords = Object.entries(records.regularSeasonData.leagueManagerRecords)
        .map(([id, record]) => ({ rosterID: id, ...record }));

    // Sort by various metrics
    const winRanking = allRecords
        .sort((a, b) => b.wins - a.wins)
        .findIndex(record => record.rosterID === rosterID) + 1;

    const pointsRanking = allRecords
        .sort((a, b) => b.fptsFor - a.fptsFor)
        .findIndex(record => record.rosterID === rosterID) + 1;

    const efficiencyRanking = allRecords
        .sort((a, b) => (b.fptsFor / (b.potentialPoints || 1)) - (a.fptsFor / (a.potentialPoints || 1)))
        .findIndex(record => record.rosterID === rosterID) + 1;

    return {
        winRanking,
        pointsRanking,
        efficiencyRanking,
        totalManagers: allRecords.length
    };
}

// ===============================================================================
// PHASE 2 ENHANCEMENTS: Enhanced Playoff Detection and Cross-Validation
// ===============================================================================

/**
 * PHASE 2: Cross-validate award results with bracket analysis
 * @param {Object} awardResults - Results from award detection
 * @param {Object} playoffAnalysis - Results from bracket analysis
 * @returns {Object} Cross-validated results with confidence scoring
 */
function crossValidateAwardsAndBrackets(awardResults, playoffAnalysis) {
    const crossValidated = {
        playoffs: false,
        championship: false,
        divisionChamp: false,
        runnerUp: false,
        thirdPlace: false,
        toilet: false,
        confidence: 0,
        detectionMethods: []
    };

    // Start with award results as baseline
    Object.assign(crossValidated, awardResults);
    
    if (playoffAnalysis && playoffAnalysis.madePlayoffs) {
        // Cross-validate playoff participation
        if (awardResults.playoffs === playoffAnalysis.madePlayoffs) {
            crossValidated.confidence += 40; // Both methods agree
            crossValidated.detectionMethods.push('awards_bracket_consensus');
        } else {
            // Methods disagree - use bracket analysis as more reliable for playoff participation
            crossValidated.playoffs = playoffAnalysis.madePlayoffs;
            crossValidated.confidence += 20; // Partial confidence
            crossValidated.detectionMethods.push('bracket_override');
        }

        // Cross-validate specific achievements
        const bracketAchievements = playoffAnalysis.details?.achievements;
        if (bracketAchievements) {
            // Championship cross-validation
            if (bracketAchievements.champion && awardResults.championship) {
                crossValidated.confidence += 30; // High confidence
                crossValidated.detectionMethods.push('championship_verified');
            } else if (bracketAchievements.champion && !awardResults.championship) {
                crossValidated.championship = true;
                crossValidated.confidence += 15;
                crossValidated.detectionMethods.push('championship_bracket_detected');
            }

            // Runner-up cross-validation
            if (bracketAchievements.runnerUp && awardResults.runnerUp) {
                crossValidated.confidence += 20;
                crossValidated.detectionMethods.push('runnerup_verified');
            } else if (bracketAchievements.runnerUp && !awardResults.runnerUp) {
                crossValidated.runnerUp = true;
                crossValidated.confidence += 10;
                crossValidated.detectionMethods.push('runnerup_bracket_detected');
            }

            // Third place cross-validation
            if (bracketAchievements.thirdPlace && awardResults.thirdPlace) {
                crossValidated.confidence += 15;
                crossValidated.detectionMethods.push('thirdplace_verified');
            } else if (bracketAchievements.thirdPlace && !awardResults.thirdPlace) {
                crossValidated.thirdPlace = true;
                crossValidated.confidence += 8;
                crossValidated.detectionMethods.push('thirdplace_bracket_detected');
            }
        }
    } else {
        // No bracket analysis available - rely on awards only
        crossValidated.confidence = awardResults.playoffs ? 60 : 80; // Higher confidence if no playoffs
        crossValidated.detectionMethods.push('awards_only');
    }

    // Factor in bracket analysis confidence
    if (playoffAnalysis?.confidence) {
        const bracketConfidenceFactor = playoffAnalysis.confidence / 100;
        crossValidated.confidence = Math.min(100, crossValidated.confidence * (0.7 + 0.3 * bracketConfidenceFactor));
    }

    debugAwardProcessing('Cross-Validation Complete', {
        originalAwards: awardResults,
        bracketAnalysis: playoffAnalysis ? {
            madePlayoffs: playoffAnalysis.madePlayoffs,
            confidence: playoffAnalysis.confidence
        } : null,
        crossValidated
    });

    return crossValidated;
}

/**
 * PHASE 2: Enhanced field processing with better decimal and validation handling
 * @param {Object} yearData - Raw season data
 * @returns {Object} Processed field values
 */
function processSeasonFields(yearData) {
    // Enhanced points for processing with better decimal handling
    let fpts = 0;
    if (yearData.fpts !== undefined && yearData.fpts !== null) {
        fpts = parseFloat(yearData.fpts);
        // Handle decimal points if they exist as separate field
        if (yearData.fpts_decimal) {
            fpts += parseFloat(yearData.fpts_decimal) / 100;
        }
    } else if (yearData.fptsFor !== undefined && yearData.fptsFor !== null) {
        fpts = parseFloat(yearData.fptsFor);
    }
    
    // Enhanced points against processing
    let fptsAgainst = 0;
    if (yearData.fptsAgainst !== undefined && yearData.fptsAgainst !== null) {
        fptsAgainst = parseFloat(yearData.fptsAgainst);
        // Handle decimal points if they exist as separate field
        if (yearData.fptsAgainst_decimal) {
            fptsAgainst += parseFloat(yearData.fptsAgainst_decimal) / 100;
        }
    } else if (yearData.fpts_against !== undefined && yearData.fpts_against !== null) {
        fptsAgainst = parseFloat(yearData.fpts_against);
        // Handle decimal points if they exist as separate field
        if (yearData.fpts_against_decimal) {
            fptsAgainst += parseFloat(yearData.fpts_against_decimal) / 100;
        }
    }
    
    // Enhanced potential points processing
    let potentialPoints = 0;
    if (yearData.potentialPoints !== undefined && yearData.potentialPoints !== null) {
        potentialPoints = parseFloat(yearData.potentialPoints);
    } else if (yearData.ppts !== undefined && yearData.ppts !== null) {
        potentialPoints = parseFloat(yearData.ppts);
        // Handle decimal points if they exist as separate field
        if (yearData.ppts_decimal) {
            potentialPoints += parseFloat(yearData.ppts_decimal) / 100;
        }
    }
    
    // Apply rounding and ensure valid numbers
    fpts = parseFloat(round(fpts || 0));
    fptsAgainst = parseFloat(round(fptsAgainst || 0));
    potentialPoints = parseFloat(round(potentialPoints || 0));
    
    // Calculate lineup efficiency
    const lineupEfficiency = potentialPoints > 0 ? 
        parseFloat(round((fpts / potentialPoints) * 100)) : 0;

    return {
        fpts,
        fptsAgainst,
        potentialPoints,
        lineupEfficiency
    };
}

/**
 * PHASE 2 ENHANCED: Process individual season data with comprehensive award and playoff validation
 * @param {Object} yearData - Season data for a specific year
 * @param {Array} awards - Awards data (will be validated and normalized)
 * @param {Object} managerRosters - Map of year -> rosterID for this manager
 * @param {Object} bracketData - Optional: Raw bracket data for enhanced validation
 * @returns {Object} Processed season object with comprehensive validation
 */
async function processSeasonDataEnhanced(yearData, awards, managerRosters, bracketData = null) {
    debugAwardProcessing('processSeasonDataEnhanced - Input', {
        year: yearData.year,
        rosterID: yearData.rosterID,
        hasAwards: !!awards,
        awardsLength: awards?.length || 0,
        hasBracketData: !!bracketData
    });

    // PHASE 1: Validate and normalize awards data
    const validatedAwards = validateAndNormalizeAwards(awards);
    
    // PHASE 1: Use robust award detection
    const awardResults = detectAwardsForRoster(
        yearData.rosterID, 
        yearData.year, 
        validatedAwards
    );

    // PHASE 2: Enhanced playoff bracket analysis (if bracket data available)
    let playoffAnalysis = null;
    if (bracketData) {
        try {
            playoffAnalysis = await analyzePlayoffParticipation(
                parseInt(yearData.rosterID),
                yearData.year,
                bracketData.winnersData,
                bracketData.losersData,
                bracketData.leagueSettings
            );
        } catch (error) {
            debugAwardProcessing('Playoff Analysis Failed', {
                year: yearData.year,
                rosterID: yearData.rosterID,
                error: error.message
            }, 'warn');
        }
    }

    // PHASE 2: Cross-validate awards with bracket analysis
    const crossValidatedResults = crossValidateAwardsAndBrackets(awardResults, playoffAnalysis);

    debugAwardProcessing('Cross-Validation Results', {
        rosterID: yearData.rosterID,
        year: yearData.year,
        awardResults,
        playoffAnalysis: playoffAnalysis ? {
            madePlayoffs: playoffAnalysis.madePlayoffs,
            confidence: playoffAnalysis.confidence,
            achievements: playoffAnalysis.details?.achievements
        } : null,
        crossValidated: crossValidatedResults
    });

    // Extract award flags from enhanced validation
    const { 
        playoffs, 
        championship, 
        divisionChamp, 
        runnerUp, 
        thirdPlace, 
        toilet 
    } = crossValidatedResults;

    // Enhanced field processing with better decimal handling
    const processedFields = processSeasonFields(yearData);

    // PHASE 2: Enhanced season object with validation details
    const processedSeason = {
        year: yearData.year,
        wins: yearData.wins || 0,
        losses: yearData.losses || 0,
        ties: yearData.ties || 0,
        fpts: processedFields.fpts,
        fptsAgainst: processedFields.fptsAgainst,
        playoffs,
        championship,
        divisionChamp,
        runnerUp,
        thirdPlace,
        toilet,
        potentialPoints: processedFields.potentialPoints,
        lineupEfficiency: processedFields.lineupEfficiency,
        rosterID: yearData.rosterID,
        // PHASE 2: Enhanced validation metadata
        validationMetadata: {
            awardDetectionLog: awardResults.detectionLog,
            playoffAnalysis: playoffAnalysis,
            crossValidationConfidence: crossValidatedResults.confidence,
            detectionMethods: crossValidatedResults.detectionMethods
        }
    };

    debugAwardProcessing('processSeasonDataEnhanced - Output', {
        ...processedSeason,
        validationMetadata: {
            ...processedSeason.validationMetadata,
            playoffAnalysis: processedSeason.validationMetadata.playoffAnalysis ? 
                'Analysis completed' : 'No bracket data'
        }
    });
    
    return processedSeason;
}

/**
 * PHASE 2: Enhanced manager statistics computation with bracket validation
 * @param {Object} manager - The manager object
 * @param {Object} leagueTeamManagers - League team manager data
 * @param {Object} records - League records data
 * @param {String} currentRosterID - Current roster ID (for fallback)
 * @param {Array} awards - Awards data
 * @param {Object} historicalBracketData - Optional historical bracket data for validation
 * @returns {Object} Enhanced manager statistics object
 */
export async function computeManagerStatsEnhanced(manager, leagueTeamManagers, records, currentRosterID, awards, historicalBracketData = null) {
    debugAwardProcessing('Enhanced Manager Statistics Calculation - Start', {
        managerID: manager?.managerID,
        hasHistoricalBrackets: !!historicalBracketData
    });

    // Use standard computation as baseline
    const standardStats = computeManagerStats(manager, leagueTeamManagers, records, currentRosterID, awards);
    
    // If no bracket data available, return standard results
    if (!historicalBracketData) {
        debugAwardProcessing('No bracket data - returning standard stats', {});
        return standardStats;
    }

    // Re-process seasons with enhanced validation
    const enhancedSeasons = [];
    for (const season of standardStats.seasons) {
        const yearBracketData = historicalBracketData[season.year];
        
        if (yearBracketData) {
            // Re-process with bracket validation
            const enhancedSeason = await processSeasonDataEnhanced(
                season, 
                awards, 
                {}, // managerRosters not needed for re-processing
                yearBracketData
            );
            enhancedSeasons.push(enhancedSeason);
        } else {
            // Keep original season data if no bracket data available
            enhancedSeasons.push(season);
        }
    }

    // Recalculate totals with enhanced data
    const enhancedTotalStats = getEmptyStats();
    enhancedSeasons.forEach(season => {
        enhancedTotalStats.totalWins += season.wins;
        enhancedTotalStats.totalLosses += season.losses;
        enhancedTotalStats.totalTies += season.ties;
        enhancedTotalStats.totalPoints += season.fpts;
        enhancedTotalStats.totalPointsAgainst += season.fptsAgainst;
        enhancedTotalStats.seasonsPlayed++;
        
        if (season.playoffs) enhancedTotalStats.playoffAppearances++;
        if (season.championship) enhancedTotalStats.championships++;
        if (season.divisionChamp) enhancedTotalStats.divisionChampionships++;
        if (season.runnerUp) enhancedTotalStats.runnerUpFinishes++;
        if (season.thirdPlace) enhancedTotalStats.thirdPlaceFinishes++;
        if (season.toilet) enhancedTotalStats.toiletBowlWins++;
    });

    // Recalculate derived statistics
    const totalGames = enhancedTotalStats.totalWins + enhancedTotalStats.totalLosses + enhancedTotalStats.totalTies;
    enhancedTotalStats.winPercentage = totalGames > 0 ? parseFloat(round((enhancedTotalStats.totalWins / totalGames) * 100)) : 0;
    enhancedTotalStats.averagePointsPerSeason = enhancedTotalStats.seasonsPlayed > 0 ? 
        parseFloat(round(enhancedTotalStats.totalPoints / enhancedTotalStats.seasonsPlayed)) : 0;
    enhancedTotalStats.averagePointsPerGame = totalGames > 0 ? 
        parseFloat(round(enhancedTotalStats.totalPoints / totalGames)) : 0;

    const enhancedStats = {
        seasons: enhancedSeasons.sort((a, b) => b.year - a.year),
        totalStats: enhancedTotalStats,
        enhancementMetadata: {
            bracketValidationUsed: true,
            seasonsEnhanced: enhancedSeasons.filter(s => s.validationMetadata?.playoffAnalysis).length,
            averageConfidence: enhancedSeasons
                .filter(s => s.validationMetadata?.crossValidationConfidence)
                .reduce((sum, s) => sum + s.validationMetadata.crossValidationConfidence, 0) / enhancedSeasons.length
        }
    };

    debugAwardProcessing('Enhanced Manager Statistics - Complete', {
        managerID: manager?.managerID,
        enhancementMetadata: enhancedStats.enhancementMetadata
    });

    return enhancedStats;
}
