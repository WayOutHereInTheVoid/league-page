/**
 * Team Filter Utilities for TRL Transactions Page
 * Provides data preparation and filtering utilities for team-based transaction filtering
 */

/**
 * Extracts unique teams from transaction history
 * @param {Array} transactions - Array of all transactions from getLeagueTransactions
 * @param {Object} leagueTeamManagers - Team managers mapping data from getLeagueTeamManagers
 * @returns {Object} Object containing uniqueRosterIDs Set and teamSeasonHistory Map
 */
export const extractUniqueTeamsFromTransactions = (transactions, leagueTeamManagers) => {
    // Initialize return structure with safe defaults
    const result = {
        uniqueRosterIDs: new Set(),
        teamSeasonHistory: new Map()
    };
    
    try {
        // Validate inputs - critical for preventing runtime errors
        if (!Array.isArray(transactions)) {
            console.warn('teamFilterUtils: transactions is not an array, received:', typeof transactions);
            return result;
        }
        
        if (!leagueTeamManagers || typeof leagueTeamManagers !== 'object') {
            console.warn('teamFilterUtils: leagueTeamManagers is invalid, received:', typeof leagueTeamManagers);
            return result;
        }
        
        // Ensure we have the teamManagersMap structure
        if (!leagueTeamManagers.teamManagersMap || typeof leagueTeamManagers.teamManagersMap !== 'object') {
            console.warn('teamFilterUtils: leagueTeamManagers.teamManagersMap is missing');
            return result;
        }
        
        // Process each transaction to extract team involvement
        transactions.forEach((transaction, index) => {
            try {
                // Validate transaction structure
                if (!transaction || typeof transaction !== 'object') {
                    console.warn(`teamFilterUtils: Invalid transaction at index ${index}`);
                    return; // Continue to next transaction
                }
                
                // Get roster IDs involved in this transaction
                const rosters = transaction.rosters;
                if (!Array.isArray(rosters)) {
                    // Some transactions might have missing or malformed rosters array
                    console.warn(`teamFilterUtils: Transaction ${transaction.id || index} has invalid rosters:`, rosters);
                    return; // Continue to next transaction
                }
                
                // Determine season for this transaction
                // Priority: transaction.season > leagueTeamManagers.currentSeason > fallback
                const season = transaction.season || leagueTeamManagers.currentSeason || new Date().getFullYear();
                
                // Process each roster ID in this transaction
                rosters.forEach(rosterID => {
                    try {
                        // Validate roster ID
                        if (typeof rosterID !== 'number' && typeof rosterID !== 'string') {
                            console.warn(`teamFilterUtils: Invalid roster ID in transaction ${transaction.id || index}:`, rosterID);
                            return; // Continue to next roster
                        }
                        
                        // Convert to number for consistency (roster IDs should be numbers)
                        const numericRosterID = parseInt(rosterID, 10);
                        if (isNaN(numericRosterID)) {
                            console.warn(`teamFilterUtils: Could not parse roster ID:`, rosterID);
                            return;
                        }
                        
                        // Add to unique teams set
                        result.uniqueRosterIDs.add(numericRosterID);
                        
                        // Track team data across seasons for continuity analysis
                        const teamKey = `${numericRosterID}-${season}`;
                        
                        // Only add to history map if we don't already have this team-season combo
                        if (!result.teamSeasonHistory.has(teamKey)) {
                            // Attempt to get team data for this season
                            const teamData = leagueTeamManagers.teamManagersMap?.[season]?.[numericRosterID];
                            
                            // Store team data if available, or placeholder if not
                            const historyEntry = {
                                rosterID: numericRosterID,
                                season: season,
                                teamName: teamData?.team?.name || null,
                                teamAvatar: teamData?.team?.avatar || null,
                                managers: teamData?.managers?.map(manager => ({
                                    name: manager.display_name,
                                    userID: manager.user_id
                                })) || [],
                                hasData: !!teamData // Track whether we found actual data
                            };
                            
                            result.teamSeasonHistory.set(teamKey, historyEntry);
                        }
                        
                    } catch (rosterError) {
                        console.error(`teamFilterUtils: Error processing roster ${rosterID} in transaction ${transaction.id || index}:`, rosterError);
                        // Continue processing other rosters
                    }
                });
                
            } catch (transactionError) {
                console.error(`teamFilterUtils: Error processing transaction at index ${index}:`, transactionError);
                // Continue processing other transactions
            }
        });
        
        // Log summary for debugging
        if (result.uniqueRosterIDs.size > 0) {
            console.log(`teamFilterUtils: Successfully extracted ${result.uniqueRosterIDs.size} unique teams from ${transactions.length} transactions`);
        }
        
    } catch (error) {
        console.error('teamFilterUtils: Critical error in extractUniqueTeamsFromTransactions:', error);
        // Return safe defaults even on critical error
    }
    
    return result;
};

/**
 * Gets a summary of extracted team data for debugging/validation
 * @param {Object} extractionResult - Result from extractUniqueTeamsFromTransactions
 * @returns {Object} Summary statistics and validation info
 */
export const getExtractionSummary = (extractionResult) => {
    if (!extractionResult || typeof extractionResult !== 'object') {
        return { error: 'Invalid extraction result' };
    }
    
    const { uniqueRosterIDs, teamSeasonHistory } = extractionResult;
    
    // Count teams with complete data vs placeholders
    let teamsWithData = 0;
    let teamsWithoutData = 0;
    const seasonBreakdown = new Map();
    
    teamSeasonHistory.forEach((entry, key) => {
        if (entry.hasData) {
            teamsWithData++;
        } else {
            teamsWithoutData++;
        }
        
        // Track season distribution
        const count = seasonBreakdown.get(entry.season) || 0;
        seasonBreakdown.set(entry.season, count + 1);
    });
    
    return {
        totalUniqueTeams: uniqueRosterIDs.size,
        totalTeamSeasonCombinations: teamSeasonHistory.size,
        teamsWithCompleteData: teamsWithData,
        teamsWithMissingData: teamsWithoutData,
        seasonsRepresented: Array.from(seasonBreakdown.keys()).sort(),
        seasonBreakdown: Object.fromEntries(seasonBreakdown)
    };
};

/**
 * Validates that extraction results are ready for further processing
 * @param {Object} extractionResult - Result from extractUniqueTeamsFromTransactions
 * @returns {Object} Validation result with success flag and any issues
 */
export const validateExtractionResult = (extractionResult) => {
    const validation = {
        isValid: false,
        issues: [],
        warnings: []
    };
    
    try {
        // Check basic structure
        if (!extractionResult || typeof extractionResult !== 'object') {
            validation.issues.push('Extraction result is not a valid object');
            return validation;
        }
        
        const { uniqueRosterIDs, teamSeasonHistory } = extractionResult;
        
        // Validate uniqueRosterIDs
        if (!(uniqueRosterIDs instanceof Set)) {
            validation.issues.push('uniqueRosterIDs is not a Set');
        } else if (uniqueRosterIDs.size === 0) {
            validation.warnings.push('No unique roster IDs found - may indicate empty transaction history');
        }
        
        // Validate teamSeasonHistory
        if (!(teamSeasonHistory instanceof Map)) {
            validation.issues.push('teamSeasonHistory is not a Map');
        } else if (teamSeasonHistory.size === 0) {
            validation.warnings.push('No team season history found');
        }
        
        // Check data consistency
        if (uniqueRosterIDs instanceof Set && teamSeasonHistory instanceof Map) {
            // Count unique rosters in history
            const rostersInHistory = new Set();
            teamSeasonHistory.forEach(entry => {
                rostersInHistory.add(entry.rosterID);
            });
            
            // Every unique roster should appear in history
            if (rostersInHistory.size !== uniqueRosterIDs.size) {
                validation.warnings.push(`Roster count mismatch: ${uniqueRosterIDs.size} unique vs ${rostersInHistory.size} in history`);
            }
        }
        
        // If no critical issues, mark as valid
        validation.isValid = validation.issues.length === 0;
        
    } catch (error) {
        validation.issues.push(`Validation error: ${error.message}`);
    }
    
    return validation;
};

/**
 * Creates a comprehensive team lookup map for filtering purposes
 * @param {Set} uniqueRosterIDs - Set of roster IDs from transactions
 * @param {Object} leagueTeamManagers - Team managers mapping data  
 * @param {string|number} currentSeason - Current season for primary lookups
 * @returns {Map} Map of roster IDs to team data optimized for filtering
 */
export const createTeamLookupMap = (uniqueRosterIDs, leagueTeamManagers, currentSeason) => {
    const teamLookupMap = new Map();
    
    try {
        // Validate inputs
        if (!uniqueRosterIDs || !(uniqueRosterIDs instanceof Set)) {
            console.warn('teamFilterUtils: uniqueRosterIDs is not a Set');
            return teamLookupMap;
        }
        
        if (!leagueTeamManagers || typeof leagueTeamManagers !== 'object') {
            console.warn('teamFilterUtils: leagueTeamManagers is invalid');
            return teamLookupMap;
        }
        
        if (!leagueTeamManagers.teamManagersMap) {
            console.warn('teamFilterUtils: teamManagersMap is missing');
            return teamLookupMap;
        }
        
        // Ensure currentSeason is a number
        const season = parseInt(currentSeason, 10) || new Date().getFullYear();
        
        uniqueRosterIDs.forEach(rosterID => {
            try {
                // Primary lookup: current season
                let teamData = leagueTeamManagers.teamManagersMap?.[season]?.[rosterID];
                let lookupSeason = season;
                
                // Fallback: search recent seasons if not found in current
                if (!teamData) {
                    // Search last 3 seasons for team data
                    const seasonsToCheck = [season - 1, season - 2, season - 3];
                    for (const fallbackSeason of seasonsToCheck) {
                        teamData = leagueTeamManagers.teamManagersMap?.[fallbackSeason]?.[rosterID];
                        if (teamData) {
                            lookupSeason = fallbackSeason;
                            break;
                        }
                    }
                }
                
                if (teamData) {
                    teamLookupMap.set(rosterID, {
                        rosterID: rosterID,
                        teamName: teamData.team?.name || `Team ${rosterID}`,
                        teamAvatar: teamData.team?.avatar || null,
                        managers: teamData.managers?.map(manager => ({
                            name: manager.display_name,
                            userID: manager.user_id
                        })) || [],
                        season: lookupSeason,
                        isHistorical: lookupSeason !== season
                    });
                } else {
                    // Fallback for teams with no data found
                    teamLookupMap.set(rosterID, {
                        rosterID: rosterID,
                        teamName: `Unknown Team ${rosterID}`,
                        teamAvatar: null,
                        managers: [],
                        season: null,
                        isHistorical: true
                    });
                }
                
            } catch (error) {
                console.error(`teamFilterUtils: Error processing roster ${rosterID} in createTeamLookupMap:`, error);
                // Add fallback entry
                teamLookupMap.set(rosterID, {
                    rosterID: rosterID,
                    teamName: `Error Team ${rosterID}`,
                    teamAvatar: null,
                    managers: [],
                    season: null,
                    isHistorical: true
                });
            }
        });
        
        console.log(`teamFilterUtils: Created lookup map for ${teamLookupMap.size} teams`);
        
    } catch (error) {
        console.error('teamFilterUtils: Critical error in createTeamLookupMap:', error);
    }
    
    return teamLookupMap;
};

/**
 * Gets team data for a specific roster ID with season awareness
 * @param {number} rosterID - The roster ID to look up
 * @param {string|number} season - Specific season to look up
 * @param {Object} leagueTeamManagers - Team managers mapping data
 * @returns {Object|null} Team data for the specified roster and season
 */
export const getTeamDataForSeason = (rosterID, season, leagueTeamManagers) => {
    try {
        // Validate inputs
        if (!leagueTeamManagers?.teamManagersMap) {
            console.warn('teamFilterUtils: Invalid leagueTeamManagers in getTeamDataForSeason');
            return null;
        }
        
        const numericRosterID = parseInt(rosterID, 10);
        const numericSeason = parseInt(season, 10);
        
        if (isNaN(numericRosterID) || isNaN(numericSeason)) {
            console.warn('teamFilterUtils: Invalid rosterID or season in getTeamDataForSeason');
            return null;
        }
        
        const teamData = leagueTeamManagers.teamManagersMap[numericSeason]?.[numericRosterID];
        if (!teamData) return null;
        
        return {
            rosterID: numericRosterID,
            teamName: teamData.team?.name || `Team ${numericRosterID}`,
            teamAvatar: teamData.team?.avatar || null,
            managers: teamData.managers?.map(manager => ({
                name: manager.display_name,
                userID: manager.user_id
            })) || [],
            season: numericSeason
        };
        
    } catch (error) {
        console.error('teamFilterUtils: Error in getTeamDataForSeason:', error);
        return null;
    }
};

/**
 * Generates a sorted list of teams for filter dropdown component
 * @param {Map} teamLookupMap - Map of roster IDs to team data
 * @returns {Array} Sorted array of team options for filtering UI
 */
export const generateTeamFilterOptions = (teamLookupMap) => {
    try {
        if (!teamLookupMap || !(teamLookupMap instanceof Map) || teamLookupMap.size === 0) {
            console.warn('teamFilterUtils: Invalid or empty teamLookupMap in generateTeamFilterOptions');
            return [{ value: null, label: "All Teams", avatar: null, managers: "", isHistorical: false, season: null }];
        }
        
        const teamOptions = Array.from(teamLookupMap.values())
            .map(team => ({
                value: team.rosterID,
                label: team.teamName,
                avatar: team.teamAvatar,
                managers: team.managers.map(m => m.name).join(', '),
                isHistorical: team.isHistorical,
                season: team.season
            }))
            .sort((a, b) => {
                // Sort current season teams first, then alphabetically
                if (a.isHistorical !== b.isHistorical) {
                    return a.isHistorical ? 1 : -1;
                }
                return a.label.localeCompare(b.label);
            });
        
        // Add "All Teams" option at the beginning
        return [
            {
                value: null,
                label: "All Teams",
                avatar: null,
                managers: "",
                isHistorical: false,
                season: null
            },
            ...teamOptions
        ];
        
    } catch (error) {
        console.error('teamFilterUtils: Error in generateTeamFilterOptions:', error);
        return [{ value: null, label: "All Teams", avatar: null, managers: "", isHistorical: false, season: null }];
    }
};

/**
 * Fast lookup utility for team names in search/display contexts
 * @param {number} rosterID - The roster ID to look up
 * @param {Map} teamLookupMap - Pre-built team lookup map
 * @returns {string} Team name or fallback
 */
export const getTeamNameByRosterID = (rosterID, teamLookupMap) => {
    try {
        if (!teamLookupMap || !(teamLookupMap instanceof Map)) {
            return `Team ${rosterID}`;
        }
        
        const teamData = teamLookupMap.get(rosterID);
        return teamData?.teamName || `Team ${rosterID}`;
        
    } catch (error) {
        console.error('teamFilterUtils: Error in getTeamNameByRosterID:', error);
        return `Team ${rosterID}`;
    }
};

/**
 * Fast lookup utility for team avatars in display contexts  
 * @param {number} rosterID - The roster ID to look up
 * @param {Map} teamLookupMap - Pre-built team lookup map
 * @returns {string|null} Team avatar URL or null
 */
export const getTeamAvatarByRosterID = (rosterID, teamLookupMap) => {
    try {
        if (!teamLookupMap || !(teamLookupMap instanceof Map)) {
            return null;
        }
        
        const teamData = teamLookupMap.get(rosterID);
        return teamData?.teamAvatar || null;
        
    } catch (error) {
        console.error('teamFilterUtils: Error in getTeamAvatarByRosterID:', error);
        return null;
    }
};

/**
 * Gets complete team data for display purposes
 * @param {number} rosterID - The roster ID to look up
 * @param {Map} teamLookupMap - Pre-built team lookup map
 * @returns {Object|null} Complete team data or null
 */
export const getTeamDataByRosterID = (rosterID, teamLookupMap) => {
    try {
        if (!teamLookupMap || !(teamLookupMap instanceof Map)) {
            return null;
        }
        
        return teamLookupMap.get(rosterID) || null;
        
    } catch (error) {
        console.error('teamFilterUtils: Error in getTeamDataByRosterID:', error);
        return null;
    }
};

/**
 * Checks if a specific team is involved in a transaction
 * @param {Object} transaction - Transaction object to check
 * @param {number} targetRosterID - Roster ID to search for
 * @returns {boolean} True if team is involved in the transaction
 */
export const isTeamInvolvedInTransaction = (transaction, targetRosterID) => {
    try {
        if (!transaction?.rosters || !Array.isArray(transaction.rosters)) {
            return false;
        }
        
        // Ensure targetRosterID is a number for comparison
        const numericTargetID = parseInt(targetRosterID, 10);
        if (isNaN(numericTargetID)) {
            return false;
        }
        
        // Direct roster involvement check
        return transaction.rosters.includes(numericTargetID);
        
    } catch (error) {
        console.error('teamFilterUtils: Error in isTeamInvolvedInTransaction:', error);
        return false;
    }
};

/**
 * Filters transactions to only those involving a specific team
 * @param {Array} transactions - Array of transactions to filter
 * @param {number|null} targetRosterID - Roster ID to filter by (null = all teams)
 * @param {Map} teamLookupMap - Team lookup map for additional context (optional)
 * @returns {Array} Filtered transactions array
 */
export const filterTransactionsByTeamInvolvement = (transactions, targetRosterID, teamLookupMap = null) => {
    try {
        // Validate inputs
        if (!Array.isArray(transactions)) {
            console.warn('teamFilterUtils: transactions is not an array in filterTransactionsByTeamInvolvement');
            return [];
        }
        
        // If no target roster ID specified, return all transactions
        if (targetRosterID === null || targetRosterID === undefined) {
            return transactions;
        }
        
        // Ensure targetRosterID is a number
        const numericTargetID = parseInt(targetRosterID, 10);
        if (isNaN(numericTargetID)) {
            console.warn('teamFilterUtils: Invalid targetRosterID in filterTransactionsByTeamInvolvement');
            return [];
        }
        
        return transactions.filter(transaction => 
            isTeamInvolvedInTransaction(transaction, numericTargetID)
        );
        
    } catch (error) {
        console.error('teamFilterUtils: Error in filterTransactionsByTeamInvolvement:', error);
        return [];
    }
};