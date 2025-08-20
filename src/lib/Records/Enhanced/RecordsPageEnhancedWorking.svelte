<script>
    import { onMount } from 'svelte';
    import Button, { Group, Label } from '@smui/button';
    import LinearProgress from '@smui/linear-progress';
    import RecordsHero from './RecordsHero.svelte';
    import RecordsNavigation from './RecordsNavigation.svelte';
    import RecordsExplorer from './RecordsExplorer.svelte';

    // Props from parent page with validation
    let { leagueData, totals, stale, leagueTeamManagers } = $props();

    // Validate and provide defaults for props
    $effect(() => {
        console.log('📊 Props validation:', {
            leagueData: !!leagueData,
            totals: !!totals,
            stale,
            leagueTeamManagers: !!leagueTeamManagers,
            leagueDataType: typeof leagueData,
            leagueDataKeys: leagueData ? Object.keys(leagueData) : 'null'
        });
        
        // Check for null data that might cause standingsInfo error
        if (leagueData === null) {
            console.warn('⚠️ leagueData is null - this may cause standingsInfo errors');
        }
        
        if (leagueData && !leagueData.regularSeasonData && !leagueData.playoffData) {
            console.warn('⚠️ leagueData missing expected properties');
        }
    });

    // Enhanced records state management
    let enhancedData = $state(null);
    let loading = $state(true);
    let error = $state(null);
    let loadingStage = $state('Initializing...');
    
    // View mode state
    let viewMode = $state('enhanced');
    let dataKey = $state('regularSeasonData');
    
    // Enhanced features state
    let selectedRecord = $state(null);
    let activeFilters = $state({
        timeframe: 'all-time',
        recordType: 'all',
        rarity: 'all',
        managers: []
    });

    // Progressive loading with fallback strategy
    const loadEnhancedData = async () => {
        try {
            loading = true;
            error = null;
            
            loadingStage = 'Loading basic records...';
            console.log('🚀 Starting progressive enhanced records load...');
            
            // Step 1: Load regular records first as baseline
            const { getLeagueRecords } = await import('$lib/utils/helper');
            const baseRecords = await getLeagueRecords(false);
            console.log('✅ Base records loaded:', baseRecords);
            
            loadingStage = 'Enhancing with basic features...';
            
            // Step 2: Try enhanced records with minimal features
            try {
                const { getEnhancedLeagueRecords } = await import('$lib/utils/helperFunctions/enhancedLeagueRecords.js');
                
                console.log('📞 Attempting enhanced records with minimal features...');
                enhancedData = await Promise.race([
                    getEnhancedLeagueRecords(false, {
                        includeAchievementGallery: true,
                        includeContextGeneration: false,
                        includeTrendAnalysis: false,
                        includePercentileCalculations: false,
                        maxAchievementsPerCategory: 3
                    }),
                    new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Enhanced loading timeout after 15 seconds')), 15000)
                    )
                ]);
                
                console.log('✅ Enhanced records loaded successfully:', enhancedData);
                
            } catch (enhancedError) {
                console.warn('⚠️ Enhanced loading failed, using fallback:', enhancedError.message);
                
                // Fallback: Create enhanced structure from regular records
                enhancedData = createEnhancedFallback(baseRecords);
            }
            
            loadingStage = 'Finalizing display...';
            
            // Set default selected record
            setDefaultSelectedRecord();
            
        } catch (err) {
            console.error('❌ Complete failure loading records:', err);
            error = err.message;
            
            // Ultimate fallback: Show error but with some basic data
            enhancedData = {
                regularSeasonData: { leagueWeekHighs: [], achievementGallery: [] },
                playoffData: { leagueWeekHighs: [], achievementGallery: [] },
                enhancedFeatures: { error: err.message }
            };
            
        } finally {
            loading = false;
        }
    };

    // Create enhanced fallback from regular records
    const createEnhancedFallback = (baseRecords) => {
        console.log('🔄 Creating enhanced fallback from base records...');
        
        const enhanceDataSet = (data) => {
            if (!data) return { achievementGallery: [], leagueWeekHighs: [] };
            
            // Create basic achievement gallery from existing records
            const achievements = [];
            
            // Add top weekly scores as achievements
            if (data.leagueWeekHighs?.length > 0) {
                data.leagueWeekHighs.slice(0, 5).forEach((record, index) => {
                    achievements.push({
                        id: `weekly-high-${index}`,
                        type: 'weekly',
                        title: `${record.fpts?.toFixed(1)} Point Explosion`,
                        description: `Dominant weekly performance`,
                        value: record.fpts,
                        rarity: index === 0 ? 'legendary' : index < 3 ? 'rare' : 'notable',
                        significance: 100 - (index * 15),
                        record: record,
                        badge: { 
                            color: index === 0 ? '#FFD700' : index < 3 ? '#9B59B6' : '#3498DB',
                            icon: index === 0 ? '👑' : index < 3 ? '💎' : '⭐',
                            label: index === 0 ? 'Legendary' : index < 3 ? 'Rare' : 'Notable'
                        }
                    });
                });
            }
            
            // Add season records
            if (data.mostSeasonLongPoints?.length > 0) {
                data.mostSeasonLongPoints.slice(0, 3).forEach((record, index) => {
                    achievements.push({
                        id: `season-high-${index}`,
                        type: 'season',
                        title: `${record.fpts?.toFixed(1)} Point Season`,
                        description: `Outstanding season performance`,
                        value: record.fpts,
                        rarity: index === 0 ? 'legendary' : 'rare',
                        significance: 90 - (index * 10),
                        record: record,
                        badge: { 
                            color: index === 0 ? '#FFD700' : '#9B59B6',
                            icon: index === 0 ? '👑' : '💎',
                            label: index === 0 ? 'Legendary' : 'Rare'
                        }
                    });
                });
            }
            
            return {
                ...data,
                achievementGallery: achievements,
                leagueAverages: {
                    weeklyPoints: { mean: 100, median: 95 },
                    seasonPoints: { mean: 1500, median: 1450 }
                }
            };
        };
        
        return {
            regularSeasonData: enhanceDataSet(baseRecords.regularSeasonData),
            playoffData: enhanceDataSet(baseRecords.playoffData),
            enhancedFeatures: {
                fallbackMode: true,
                achievementGallery: true,
                generatedAt: new Date().toISOString()
            }
        };
    };

    // Set default selected record
    const setDefaultSelectedRecord = () => {
        if (enhancedData?.[dataKey]?.achievementGallery?.length > 0) {
            selectedRecord = enhancedData[dataKey].achievementGallery[0];
            console.log('🎖️ Selected default record:', selectedRecord);
        } else if (enhancedData?.[dataKey]?.leagueWeekHighs?.length > 0) {
            // Fallback to basic record
            const topRecord = enhancedData[dataKey].leagueWeekHighs[0];
            selectedRecord = {
                type: 'weekly',
                title: `${topRecord.fpts?.toFixed(1)} Point Performance`,
                value: topRecord.fpts,
                record: topRecord
            };
            console.log('🔄 Using fallback record:', selectedRecord);
        }
    };

    // Handle data key changes (Regular Season vs Playoffs)
    const handleDataKeyChange = (newKey) => {
        dataKey = newKey;
        setDefaultSelectedRecord();
    };

    // Handle filter changes from navigation
    const handleFilterChange = (filters) => {
        activeFilters = { ...filters };
    };

    // Handle record selection
    const handleRecordSelection = (record) => {
        selectedRecord = record;
    };

    // Load data on mount
    onMount(() => {
        loadEnhancedData();
    });

    // Refresh data if needed
    $effect(() => {
        if (stale) {
            loadEnhancedData();
        }
    });
</script>

<style>
    .records-enhanced-container {
        width: 100%;
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 1rem;
        position: relative;
        z-index: 1;
    }

    .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 400px;
        gap: 1rem;
    }

    .loading-progress {
        width: 100%;
        max-width: 500px;
    }

    .loading-stage {
        font-size: 0.9rem;
        color: var(--g666);
        margin-top: 0.5rem;
    }

    .error-container {
        text-align: center;
        padding: 2rem;
        background: #ffe6e6;
        color: #d63384;
        border-radius: 8px;
        margin: 2rem 0;
        border: 1px solid #f5c6cb;
    }

    .fallback-notice {
        background: #fff3cd;
        color: #856404;
        padding: 1rem;
        border-radius: 8px;
        margin: 1rem 0;
        border: 1px solid #ffeaa7;
        text-align: center;
        font-size: 0.9rem;
    }

    .data-selector {
        text-align: center;
        margin: 1rem 0 2rem;
    }

    .enhanced-layout {
        display: grid;
        grid-template-columns: 1fr;
        gap: 2rem;
        margin-top: 2rem;
    }

    @media (min-width: 1024px) {
        .enhanced-layout {
            grid-template-columns: 1fr 350px;
            gap: 3rem;
        }
    }

    .hero-section {
        margin-bottom: 2rem;
    }

    .main-content {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .sidebar {
        position: sticky;
        top: 2rem;
        height: fit-content;
    }

    @media (max-width: 768px) {
        .enhanced-layout {
            grid-template-columns: 1fr;
            gap: 1.5rem;
        }
        
        .sidebar {
            position: static;
        }
    }
</style>

<div class="records-enhanced-container">
    {#if loading}
        <!-- Enhanced Loading State with Progress -->
        <div class="loading-container">
            <h3>Loading Enhanced Records</h3>
            <p>Analyzing league achievements and generating insights</p>
            <div class="loading-progress">
                <LinearProgress indeterminate />
            </div>
            <div class="loading-stage">{loadingStage}</div>
        </div>
    {:else if error}
        <!-- Enhanced Error State -->
        <div class="error-container">
            <h3>Unable to Load Enhanced Records</h3>
            <p>Error: {error}</p>
            <Button onclick={loadEnhancedData} variant="outlined">
                <Label>Try Again</Label>
            </Button>
        </div>
    {:else if enhancedData}
        
        <!-- Fallback mode notice -->
        {#if enhancedData.enhancedFeatures?.fallbackMode}
            <div class="fallback-notice">
                💡 <strong>Fallback Mode:</strong> Enhanced features are running in compatibility mode. Core functionality is available with simplified enhancements.
            </div>
        {/if}

        <!-- Data Type Selector (Regular Season vs Playoffs) -->
        <div class="data-selector">
            <Group variant="outlined">
                <Button 
                    class="selectionButtons" 
                    onclick={() => handleDataKeyChange("regularSeasonData")} 
                    variant={dataKey === "regularSeasonData" ? "raised" : "outlined"}>
                    <Label>Regular Season</Label>
                </Button>
                <Button 
                    class="selectionButtons" 
                    onclick={() => handleDataKeyChange("playoffData")} 
                    variant={dataKey === "playoffData" ? "raised" : "outlined"}>
                    <Label>Playoffs</Label>
                </Button>
            </Group>
        </div>

        <!-- Enhanced Records Layout -->
        <div class="enhanced-layout">
            <!-- Main Content Area -->
            <div class="main-content">
                <!-- Hero Section -->
                <div class="hero-section">
                    <RecordsHero 
                        {selectedRecord}
                        achievementGallery={enhancedData[dataKey]?.achievementGallery || []}
                        leagueAverages={enhancedData[dataKey]?.leagueAverages || {}}
                        {leagueTeamManagers}
                        onRecordSelect={handleRecordSelection}
                    />
                </div>

                <!-- Records Explorer -->
                <RecordsExplorer
                    recordsData={enhancedData[dataKey]}
                    {activeFilters}
                    {selectedRecord}
                    {leagueTeamManagers}
                    onRecordSelect={handleRecordSelection}
                />
            </div>

            <!-- Navigation Sidebar -->
            <div class="sidebar">
                <RecordsNavigation
                    recordsData={enhancedData[dataKey]}
                    {activeFilters}
                    {leagueTeamManagers}
                    onFilterChange={handleFilterChange}
                    onRecordSelect={handleRecordSelection}
                />
            </div>
        </div>
    {:else}
        <!-- No Data State -->
        <div class="loading-container">
            <h3>No Records Available</h3>
            <p>No league data found for enhanced records display.</p>
            <Button onclick={loadEnhancedData} variant="raised">
                <Label>Reload</Label>
            </Button>
        </div>
    {/if}
</div>
