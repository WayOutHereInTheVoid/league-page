// Enhanced Records Table Utilities
// Provides data processing and enhancement functions for Phase 3 interactive features

/**
 * Sort table data by column with support for multiple data types
 * @param {Array} data - Array of data objects to sort
 * @param {string} column - Column key to sort by
 * @param {string} direction - 'asc' or 'desc'
 * @returns {Array} Sorted data array
 */
export function sortTableData(data, column, direction = 'asc') {
    if (!data || !Array.isArray(data) || data.length === 0) {
        return data;
    }

    const sortedData = [...data].sort((a, b) => {
        let aVal = a[column];
        let bVal = b[column];

        // Handle null/undefined values
        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return direction === 'asc' ? 1 : -1;
        if (bVal == null) return direction === 'asc' ? -1 : 1;

        // Handle numeric values (including strings that represent numbers)
        const aNum = parseFloat(aVal);
        const bNum = parseFloat(bVal);
        
        if (!isNaN(aNum) && !isNaN(bNum)) {
            return direction === 'asc' ? aNum - bNum : bNum - aNum;
        }

        // Handle string values
        const aStr = String(aVal).toLowerCase();
        const bStr = String(bVal).toLowerCase();
        
        if (direction === 'asc') {
            return aStr.localeCompare(bStr);
        } else {
            return bStr.localeCompare(aStr);
        }
    });

    return sortedData;
}

/**
 * Filter table data based on active filters
 * @param {Array} data - Array of data objects to filter
 * @param {Array} activeFilters - Array of active filter IDs
 * @param {Object} filterDefinitions - Object mapping filter IDs to filter functions
 * @returns {Array} Filtered data array
 */
export function filterTableData(data, activeFilters, filterDefinitions = {}) {
    if (!data || !Array.isArray(data) || activeFilters.length === 0) {
        return data;
    }

    return data.filter(row => {
        return activeFilters.every(filterId => {
            const filterFunc = filterDefinitions[filterId];
            return filterFunc ? filterFunc(row) : true;
        });
    });
}

/**
 * Check if a row should be highlighted based on team matching
 * @param {Object} row - Data row object
 * @param {string} highlightedTeam - User ID of highlighted team
 * @param {Object} leagueTeamManagers - League team managers data
 * @returns {boolean} Whether row should be highlighted
 */
export function shouldHighlightRow(row, highlightedTeam, leagueTeamManagers) {
    if (!highlightedTeam || !row || !leagueTeamManagers) {
        return false;
    }

    // Check direct user ID match
    if (row.managerID === highlightedTeam || row.userID === highlightedTeam) {
        return true;
    }

    // Check roster ID match by finding the roster owned by the highlighted team
    if (row.rosterID && leagueTeamManagers.rosters) {
        const matchingRoster = Object.values(leagueTeamManagers.rosters).find(
            roster => roster.owner_id === highlightedTeam
        );
        return matchingRoster && String(matchingRoster.roster_id) === String(row.rosterID);
    }

    return false;
}

/**
 * Convert table data to exportable format
 * @param {Array} data - Array of data objects
 * @param {Object} columnMapping - Object mapping data keys to display names
 * @returns {Array} Formatted data for export
 */
export function prepareDataForExport(data, columnMapping = {}) {
    if (!data || !Array.isArray(data) || data.length === 0) {
        return [];
    }

    return data.map(row => {
        const exportRow = {};
        
        Object.keys(row).forEach(key => {
            // Use column mapping for display names, or clean up the key name
            const displayName = columnMapping[key] || key
                .replace(/([A-Z])/g, ' $1') // Add spaces before capital letters
                .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
                .trim();
            
            let value = row[key];
            
            // Format common data types for export
            if (typeof value === 'number') {
                // Round numbers to 2 decimal places if they have decimals
                value = Number.isInteger(value) ? value : Number(value.toFixed(2));
            } else if (value === null || value === undefined) {
                value = '';
            }
            
            exportRow[displayName] = value;
        });
        
        return exportRow;
    });
}

/**
 * Generate additional statistics for expandable row content
 * @param {Object} record - Record data object
 * @param {string} recordType - Type of record (week, season, matchup, etc.)
 * @returns {Object} Additional statistics and context
 */
export function generateExpandedContent(record, recordType) {
    const content = {
        additionalStats: {},
        breakdown: null,
        historicalComparison: null
    };

    switch (recordType) {
        case 'weekRecord':
            if (record.fpts) {
                content.additionalStats = {
                    'Points Per Game Average': record.fptsPerGame ? record.fptsPerGame.toFixed(2) : 'N/A',
                    'Week Performance': `Week ${record.week} of ${record.year || 'season'}`,
                    'League Rank': record.rank ? `#${record.rank}` : 'N/A'
                };
                
                if (record.fpts > 150) {
                    content.breakdown = 'Exceptional weekly performance - top tier scoring';
                } else if (record.fpts > 120) {
                    content.breakdown = 'Strong weekly performance - above average';
                } else {
                    content.breakdown = 'Standard weekly performance';
                }
            }
            break;

        case 'seasonRecord':
            if (record.fpts && record.fptsPerGame) {
                content.additionalStats = {
                    'Total Games': record.games || 'N/A',
                    'Points Per Game': record.fptsPerGame.toFixed(2),
                    'Season': record.year || 'N/A'
                };
                
                content.breakdown = `Averaged ${record.fptsPerGame.toFixed(1)} points per game over the season`;
            }
            break;

        case 'matchupRecord':
            if (record.differential) {
                content.additionalStats = {
                    'Winner Score': record.home?.fpts?.toFixed(1) || 'N/A',
                    'Loser Score': record.away?.fpts?.toFixed(1) || 'N/A',
                    'Week': `Week ${record.week}`,
                    'Season': record.year || 'Current'
                };
                
                if (record.differential > 50) {
                    content.breakdown = 'Dominant victory - significant point differential';
                } else if (record.differential < 5) {
                    content.breakdown = 'Nail-biting finish - very close game';
                } else {
                    content.breakdown = 'Competitive matchup with clear winner';
                }
            }
            break;

        case 'winPercentage':
            if (record.wins !== undefined && record.losses !== undefined) {
                const totalGames = record.wins + record.losses + (record.ties || 0);
                content.additionalStats = {
                    'Total Games': totalGames,
                    'Win Rate': `${record.percentage}%`,
                    'Games Above .500': record.wins - record.losses
                };
                
                if (record.percentage > 70) {
                    content.breakdown = 'Dominant season - playoff bound performance';
                } else if (record.percentage > 50) {
                    content.breakdown = 'Winning record - competitive team';
                } else {
                    content.breakdown = 'Rebuilding season - room for improvement';
                }
            }
            break;

        case 'lineupIQ':
            if (record.iq && record.potentialPoints) {
                const missedPoints = record.potentialPoints - record.fpts;
                content.additionalStats = {
                    'Optimal Score': record.potentialPoints.toFixed(1),
                    'Actual Score': record.fpts.toFixed(1),
                    'Missed Points': missedPoints.toFixed(1),
                    'Lineup Efficiency': `${record.iq}%`
                };
                
                if (record.iq > 90) {
                    content.breakdown = 'Excellent lineup management - minimal missed opportunities';
                } else if (record.iq > 80) {
                    content.breakdown = 'Good lineup decisions - few missed points';
                } else {
                    content.breakdown = 'Room for improvement in lineup optimization';
                }
            }
            break;

        default:
            content.additionalStats = {
                'Record Type': recordType,
                'Data Available': Object.keys(record).length + ' fields'
            };
    }

    return content;
}

/**
 * Create filter definitions for common record filters
 * @param {Object} params - Parameters for filter creation (currentYear, etc.)
 * @returns {Object} Filter definitions object
 */
export function createFilterDefinitions(params = {}) {
    const { currentYear = new Date().getFullYear(), recentWeeksThreshold = 4 } = params;

    return {
        'current-season': (row) => {
            return row.year === currentYear || row.year === String(currentYear) || !row.year;
        },
        
        'top-performers': (row) => {
            // Define top performers based on various metrics
            if (row.percentage !== undefined) {
                return parseFloat(row.percentage) > 60; // Win percentage > 60%
            }
            if (row.fpts !== undefined) {
                return parseFloat(row.fpts) > 120; // Points > 120
            }
            if (row.iq !== undefined) {
                return parseFloat(row.iq) > 85; // Lineup IQ > 85%
            }
            return false;
        },
        
        'recent-weeks': (row) => {
            if (row.week !== undefined) {
                const currentWeek = new Date().getDate(); // Simplified - you might want to get actual NFL week
                return (currentWeek - row.week) <= recentWeeksThreshold;
            }
            return false;
        },
        
        'playoffs-only': (row) => {
            // Filter for playoff-specific data
            return row.isPlayoff || row.week > 14 || (row.round && row.round > 0);
        }
    };
}

/**
 * Get contextual tooltip text for different record types and columns
 * @param {string} recordType - Type of record
 * @param {string} column - Column identifier
 * @returns {string} Tooltip text
 */
export function getTooltipText(recordType, column) {
    const tooltips = {
        'lineupIQ': {
            'iq': 'Percentage of potential points captured by optimal lineup decisions. Higher percentages indicate better lineup management.',
            'potentialPoints': 'Maximum possible points if optimal lineup was set each week. Calculated using highest-scoring players at each position.',
            'fpts': 'Total fantasy points scored with actual lineup decisions made each week.'
        },
        'winPercentage': {
            'percentage': 'Win percentage calculated as wins divided by total games played. Ties count as half wins.',
            'wins': 'Total number of games won during the specified period.',
            'losses': 'Total number of games lost during the specified period.',
            'ties': 'Total number of tied games. Ties are rare but count as 0.5 wins in percentage calculations.'
        },
        'weekRecord': {
            'fpts': 'Fantasy points scored in a single week. Includes all starting lineup positions.',
            'week': 'NFL week number when this performance occurred.',
            'rank': 'Ranking among all weekly performances in league history.'
        },
        'matchupRecord': {
            'differential': 'Point difference between winner and loser. Higher differentials indicate more dominant victories.',
            'matchup': 'The two teams that faced each other in this game.',
            'week': 'Week when this matchup took place.'
        },
        'seasonRecord': {
            'fpts': 'Total fantasy points accumulated over an entire season.',
            'fptsPerGame': 'Average points scored per game during the season. Calculated as total points divided by games played.',
            'games': 'Number of games played during the season.'
        },
        'transactions': {
            'trades': 'Number of trade transactions completed. Includes both sending and receiving players.',
            'waivers': 'Number of waiver wire claims and free agent pickups made during the period.',
            'total': 'Combined number of all roster moves including trades, waivers, and free agent acquisitions.'
        }
    };

    return tooltips[recordType]?.[column] || 'Additional information about this statistic.';
}

/**
 * Debounce function for performance optimization
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
