// Enhanced Records Debug Utility
// This helps identify exactly where the enhanced records loading is hanging

export const debugEnhancedRecords = async () => {
    console.log('🐛 Starting enhanced records debug...');
    
    try {
        // Test 1: Basic import
        console.log('📦 Testing import...');
        const { getEnhancedLeagueRecords } = await import('./enhancedLeagueRecords.js');
        console.log('✅ Import successful');
        
        // Test 2: Minimal options
        console.log('🎯 Testing with minimal options...');
        const result1 = await Promise.race([
            getEnhancedLeagueRecords(false, {
                includeAchievementGallery: false,
                includeContextGeneration: false,
                includeTrendAnalysis: false,
                includePercentileCalculations: false,
                maxAchievementsPerCategory: 1
            }),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout after 5s')), 5000)
            )
        ]);
        console.log('✅ Minimal options work:', result1);
        
        // Test 3: Achievement gallery only
        console.log('🏆 Testing achievement gallery...');
        const result2 = await Promise.race([
            getEnhancedLeagueRecords(false, {
                includeAchievementGallery: true,
                includeContextGeneration: false,
                includeTrendAnalysis: false,
                includePercentileCalculations: false,
                maxAchievementsPerCategory: 2
            }),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout after 10s')), 10000)
            )
        ]);
        console.log('✅ Achievement gallery works:', result2);
        
        // Test 4: Context generation
        console.log('📝 Testing context generation...');
        const result3 = await Promise.race([
            getEnhancedLeagueRecords(false, {
                includeAchievementGallery: true,
                includeContextGeneration: true,
                includeTrendAnalysis: false,
                includePercentileCalculations: false,
                maxAchievementsPerCategory: 2
            }),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Context generation timeout after 15s')), 15000)
            )
        ]);
        console.log('✅ Context generation works:', result3);
        
        console.log('🎉 All tests passed - enhanced records should work!');
        return { success: true, message: 'All tests passed' };
        
    } catch (error) {
        console.error('❌ Debug failed at:', error.message);
        return { success: false, error: error.message };
    }
};

// Call this function from browser console to debug:
// debugEnhancedRecords().then(result => console.log('Final result:', result));
