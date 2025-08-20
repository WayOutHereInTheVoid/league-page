/**
 * Enhanced Records Validation Test
 * 
 * This file provides basic validation that the Enhanced Records system is working correctly
 * and maintains backward compatibility with the existing Records system.
 */

import { EnhancedRecords } from '../Classes/enhancedRecords.js';
import { Records } from '../Classes/records.js';
import { calculateZScore, calculatePerformancePercentile } from './achievementCalculator.js';

/**
 * Test Enhanced Records class instantiation and basic functionality
 */
export async function testEnhancedRecordsBasics() {
    console.log('🧪 Testing Enhanced Records Basics...');
    
    try {
        // Test 1: Enhanced Records should instantiate properly
        const enhancedRecords = new EnhancedRecords();
        
        if (!(enhancedRecords instanceof Records)) {
            throw new Error('EnhancedRecords should extend Records class');
        }
        
        if (!(enhancedRecords instanceof EnhancedRecords)) {
            throw new Error('EnhancedRecords should be instance of EnhancedRecords');
        }
        
        // Test 2: Enhanced Records should have all new properties
        const requiredProperties = [
            'achievementGallery',
            'recordContexts', 
            'performancePercentiles',
            'leagueAverages',
            'trendAnalysis',
            'rarityThresholds'
        ];
        
        for (const prop of requiredProperties) {
            if (!(prop in enhancedRecords)) {
                throw new Error(`Missing required property: ${prop}`);
            }
        }
        
        // Test 3: Enhanced Records should have backward compatibility
        const basicRecords = new Records();
        const enhancedMethods = Object.getOwnPropertyNames(basicRecords);
        
        for (const method of enhancedMethods) {
            if (typeof basicRecords[method] === 'function' && !(method in enhancedRecords)) {
                throw new Error(`Missing inherited method: ${method}`);
            }
        }
        
        console.log('✅ Enhanced Records basics test passed');
        return true;
        
    } catch (error) {
        console.error('❌ Enhanced Records basics test failed:', error.message);
        return false;
    }
}

/**
 * Test achievement calculator functions
 */
export async function testAchievementCalculator() {
    console.log('🧪 Testing Achievement Calculator...');
    
    try {
        // Test data
        const testData = [100, 120, 110, 90, 150, 80, 130, 140, 95, 125];
        
        // Test 1: Z-Score calculation
        const zScore = calculateZScore(150, testData);
        
        if (!zScore || typeof zScore.zScore !== 'number') {
            throw new Error('Z-Score calculation failed');
        }
        
        if (zScore.zScore <= 0) {
            throw new Error('Z-Score should be positive for high value');
        }
        
        // Test 2: Percentile calculation
        const percentile = calculatePerformancePercentile(150, testData);
        
        if (!percentile || typeof percentile.percentile !== 'number') {
            throw new Error('Percentile calculation failed');
        }
        
        if (percentile.percentile < 90) {
            throw new Error('150 should be in top 10% of test data');
        }
        
        // Test 3: Edge cases
        const emptyZScore = calculateZScore(100, []);
        if (emptyZScore.significance !== 'insufficient-data') {
            throw new Error('Should handle empty dataset');
        }
        
        console.log('✅ Achievement Calculator test passed');
        return true;
        
    } catch (error) {
        console.error('❌ Achievement Calculator test failed:', error.message);
        return false;
    }
}

/**
 * Test Enhanced Records data processing
 */
export async function testEnhancedDataProcessing() {
    console.log('🧪 Testing Enhanced Data Processing...');
    
    try {
        const enhancedRecords = new EnhancedRecords();
        
        // Add some sample data
        enhancedRecords.addLeagueWeekRecord({
            rosterID: 1,
            fpts: 150.5,
            week: 1,
            year: 2024
        });
        
        enhancedRecords.addLeagueWeekRecord({
            rosterID: 2,
            fpts: 120.0,
            week: 1,
            year: 2024
        });
        
        enhancedRecords.addSeasonLongPoints({
            rosterID: 1,
            fpts: 1800.0,
            fptsPerGame: 120.0,
            year: 2024
        });
        
        // Test 1: Basic data should be added correctly
        if (enhancedRecords.leagueWeekRecords.length !== 2) {
            throw new Error('Week records not added correctly');
        }
        
        if (enhancedRecords.seasonLongPoints.length !== 1) {
            throw new Error('Season points not added correctly');
        }
        
        // Test 2: Achievement rarity calculation
        const testValues = [100, 110, 120, 130, 140, 150];
        const rarity = enhancedRecords.calculateAchievementRarity(150, testValues);
        
        if (!rarity || !rarity.rarity) {
            throw new Error('Achievement rarity calculation failed');
        }
        
        // Test 3: Enhanced methods should exist
        if (typeof enhancedRecords.finalizeEnhancedRecords !== 'function') {
            throw new Error('Missing finalizeEnhancedRecords method');
        }
        
        if (typeof enhancedRecords.returnEnhancedRecords !== 'function') {
            throw new Error('Missing returnEnhancedRecords method');
        }
        
        console.log('✅ Enhanced Data Processing test passed');
        return true;
        
    } catch (error) {
        console.error('❌ Enhanced Data Processing test failed:', error.message);
        return false;
    }
}

/**
 * Test backward compatibility
 */
export async function testBackwardCompatibility() {
    console.log('🧪 Testing Backward Compatibility...');
    
    try {
        const basicRecords = new Records();
        const enhancedRecords = new EnhancedRecords();
        
        // Add identical data to both
        const testRecord = {
            rosterID: 1,
            fpts: 150.5,
            week: 1,
            year: 2024
        };
        
        basicRecords.addLeagueWeekRecord(testRecord);
        enhancedRecords.addLeagueWeekRecord(testRecord);
        
        // Test 1: Basic functionality should work identically
        if (basicRecords.leagueWeekRecords.length !== enhancedRecords.leagueWeekRecords.length) {
            throw new Error('Enhanced Records should maintain basic Records functionality');
        }
        
        // Test 2: Base methods should return consistent results
        basicRecords.finalizeAllTimeRecords({currentYear: 2024, lastYear: 2020});
        enhancedRecords.finalizeAllTimeRecords({currentYear: 2024, lastYear: 2020});
        
        const basicData = basicRecords.returnRecords();
        const enhancedData = enhancedRecords.returnRecords();
        
        // Core fields should be identical
        const coreFields = ['leagueWeekHighs', 'leagueWeekLows', 'seasonLongPoints'];
        for (const field of coreFields) {
            if (JSON.stringify(basicData[field]) !== JSON.stringify(enhancedData[field])) {
                throw new Error(`Backward compatibility broken for field: ${field}`);
            }
        }
        
        console.log('✅ Backward Compatibility test passed');
        return true;
        
    } catch (error) {
        console.error('❌ Backward Compatibility test failed:', error.message);
        return false;
    }
}

/**
 * Run all validation tests
 */
export async function runEnhancedRecordsValidation() {
    console.log('🚀 Starting Enhanced Records Validation Suite...\n');
    
    const results = {
        basics: await testEnhancedRecordsBasics(),
        calculator: await testAchievementCalculator(),
        dataProcessing: await testEnhancedDataProcessing(),
        backwardCompatibility: await testBackwardCompatibility()
    };
    
    const passed = Object.values(results).filter(Boolean).length;
    const total = Object.keys(results).length;
    
    console.log('\n📊 Validation Results:');
    console.log(`✅ Passed: ${passed}/${total} tests`);
    
    if (passed === total) {
        console.log('🎉 All tests passed! Enhanced Records system is ready.');
        return true;
    } else {
        console.log('⚠️  Some tests failed. Please check the errors above.');
        return false;
    }
}

/**
 * Performance impact assessment
 */
export async function assessPerformanceImpact() {
    console.log('⚡ Assessing Performance Impact...');
    
    try {
        const basicRecords = new Records();
        const enhancedRecords = new EnhancedRecords();
        
        // Measure basic instantiation time
        const basicStart = performance.now();
        for (let i = 0; i < 1000; i++) {
            new Records();
        }
        const basicTime = performance.now() - basicStart;
        
        const enhancedStart = performance.now();
        for (let i = 0; i < 1000; i++) {
            new EnhancedRecords();
        }
        const enhancedTime = performance.now() - enhancedStart;
        
        const overhead = ((enhancedTime - basicTime) / basicTime) * 100;
        
        console.log(`📈 Performance Analysis:`);
        console.log(`   Basic Records: ${basicTime.toFixed(2)}ms (1000 instances)`);
        console.log(`   Enhanced Records: ${enhancedTime.toFixed(2)}ms (1000 instances)`);
        console.log(`   Overhead: ${overhead.toFixed(2)}%`);
        
        if (overhead > 10) {
            console.log('⚠️  Performance overhead exceeds 10% - consider optimization');
            return false;
        } else {
            console.log('✅ Performance impact acceptable');
            return true;
        }
        
    } catch (error) {
        console.error('❌ Performance assessment failed:', error.message);
        return false;
    }
}