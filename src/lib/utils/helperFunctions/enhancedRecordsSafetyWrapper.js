// Enhanced Records Preseason Safety Wrapper
// This file provides a safer interface for enhanced records during preseason

import { browser } from '$app/environment';

/**
 * Check if the league is in preseason and enhanced records should be limited
 */
export const isPreseasonMode = async () => {
    try {
        // Check NFL state
        const nflStateRes = await fetch('https://api.sleeper.app/v1/state/nfl');
        const nflState = await nflStateRes.json();
        
        // Check if it's preseason or week < 1
        const isPreseason = nflState.season_type === 'pre' || nflState.week < 1;
        
        console.log('🏈 NFL State:', {
            season: nflState.season,
            seasonType: nflState.season_type,
            week: nflState.week,
            isPreseason
        });
        
        return isPreseason;
    } catch (error) {
        console.warn('⚠️ Could not determine NFL state, assuming preseason:', error);
        return true; // Default to safe mode
    }
};

/**
 * Get safe enhanced records options based on current season state
 */
export const getSafeEnhancedOptions = async () => {
    const preseason = await isPreseasonMode();
    
    if (preseason) {
        console.log('🔒 Preseason mode: Using minimal enhanced features');
        return {
            includeAchievementGallery: true,
            includeContextGeneration: false,    // Disabled in preseason
            includeTrendAnalysis: false,        // Disabled in preseason
            includePercentileCalculations: false, // Disabled in preseason
            maxAchievementsPerCategory: 5
        };
    } else {
        console.log('🚀 Regular season mode: Using full enhanced features');
        return {
            includeAchievementGallery: true,
            includeContextGeneration: true,
            includeTrendAnalysis: true,
            includePercentileCalculations: true,
            maxAchievementsPerCategory: 15
        };
    }
};

/**
 * Safe wrapper for getEnhancedLeagueRecords that handles preseason gracefully
 */
export const getSafeEnhancedRecords = async (refresh = false, customOptions = null) => {
    try {
        // Import the actual function
        const { getEnhancedLeagueRecords } = await import('./enhancedLeagueRecords.js');
        
        // Get safe options or use custom ones
        const options = customOptions || await getSafeEnhancedOptions();
        
        console.log('🔧 Using enhanced options:', options);
        
        // Call with safe options
        const result = await getEnhancedLeagueRecords(refresh, options);
        
        console.log('✅ Enhanced records loaded successfully');
        return result;
        
    } catch (error) {
        console.error('❌ Enhanced records failed, providing fallback:', error);
        
        // Provide a safe fallback structure
        return {
            regularSeasonData: {
                leagueWeekHighs: [],
                leagueWeekLows: [],
                mostSeasonLongPoints: [],
                leastSeasonLongPoints: [],
                allTimeBiggestBlowouts: [],
                allTimeClosestMatchups: [],
                achievementGallery: [],
                enhancementInfo: {
                    isEnhanced: false,
                    fallbackMode: true,
                    error: error.message
                }
            },
            playoffData: {
                leagueWeekHighs: [],
                leagueWeekLows: [],
                mostSeasonLongPoints: [],
                leastSeasonLongPoints: [],
                allTimeBiggestBlowouts: [],
                allTimeClosestMatchups: [],
                achievementGallery: [],
                enhancementInfo: {
                    isEnhanced: false,
                    fallbackMode: true,
                    error: error.message
                }
            },
            enhancedFeatures: {
                achievementGallery: false,
                contextGeneration: false,
                trendAnalysis: false,
                percentileCalculations: false,
                fallbackMode: true,
                error: error.message,
                generatedAt: new Date().toISOString()
            }
        };
    }
};
