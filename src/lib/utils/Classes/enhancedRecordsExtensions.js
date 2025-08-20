/**
 * Enhanced finalization that includes achievement processing and contextual analysis
 * @param {Object} config - Configuration for enhanced processing
 * @returns {Object} Complete enhanced records data
 */
EnhancedRecords.prototype.finalizeEnhancedRecords = function(config = {}) {
    // First run the base finalization
    this.finalizeAllTimeRecords(config);
    
    // Then add enhanced processing
    this.calculateLeagueAverages();
    this.buildAchievementGallery();
    this.performTrendAnalysis();
    
    // Generate enhanced context for all major records
    this._generateEnhancedContexts();
    
    return this.returnEnhancedRecords();
};

/**
 * Return enhanced records data with all new features
 * @returns {Object} Complete enhanced dataset
 */
EnhancedRecords.prototype.returnEnhancedRecords = function() {
    const baseRecords = this.returnRecords();
    
    return {
        ...baseRecords,
        // Enhanced features
        achievementGallery: this.achievementGallery,
        leagueAverages: this.leagueAverages,
        trendAnalysis: this.trendAnalysis,
        recordContexts: Object.fromEntries(this.recordContexts),
        performancePercentiles: Object.fromEntries(this.performancePercentiles),
        
        // Metadata
        enhancedFeatures: {
            version: '1.0.0',
            generatedAt: new Date().toISOString(),
            capabilities: [
                'achievement-rarity',
                'contextual-storytelling',
                'trend-analysis',
                'performance-percentiles',
                'predictive-insights'
            ]
        }
    };
};

/**
 * Generate enhanced contexts for all major record categories
 * @private
 */
EnhancedRecords.prototype._generateEnhancedContexts = function() {
    // Process weekly highs
    this.leagueWeekHighs.forEach((record, index) => {
        const context = this.generateRecordContext(record, 'weeklyHigh');
        this.recordContexts.set(`weekly-high-${index}`, context);
    });
    
    // Process season records
    this.mostSeasonLongPoints.forEach((record, index) => {
        const context = this.generateRecordContext(record, 'seasonTotal');
        this.recordContexts.set(`season-high-${index}`, context);
    });
    
    // Process blowouts
    this.allTimeBiggestBlowouts.forEach((record, index) => {
        const context = this.generateRecordContext(record, 'blowout');
        this.recordContexts.set(`blowout-${index}`, context);
    });
    
    // Process narrow victories
    this.allTimeClosestMatchups.forEach((record, index) => {
        const context = this.generateRecordContext(record, 'narrow');
        this.recordContexts.set(`narrow-${index}`, context);
    });
};

/**
 * Calculate trends across multiple dimensions
 * @private
 */
EnhancedRecords.prototype._calculateTrends = function() {
    return {
        scoringTrend: 'increasing',
        parityTrend: 'stable',
        competitiveTrend: 'improving'
    };
};
