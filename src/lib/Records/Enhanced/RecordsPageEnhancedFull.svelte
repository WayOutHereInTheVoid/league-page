<script>
    import { onMount } from 'svelte';
    import Button, { Group, Label } from '@smui/button';
    import LinearProgress from '@smui/linear-progress';
    import RecordsHero from './RecordsHero.svelte';
    import RecordsNavigation from './RecordsNavigation.svelte';
    import RecordsExplorer from './RecordsExplorer.svelte';
    import { getEnhancedLeagueRecords } from '$lib/utils/helperFunctions/enhancedLeagueRecords.js';

    // Props from parent page
    let { leagueData, totals, stale, leagueTeamManagers } = $props();

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

    // Full enhanced loading with all features enabled
    const loadEnhancedData = async () => {
        try {
            loading = true;
            error = null;
            
            loadingStage = 'Validating league data...';
            console.log('🚀 Starting FULL enhanced records load...');
            
            // Safety validation
            if (!leagueData || !totals) {
                throw new Error('Required league data or totals missing');
            }
            
            loadingStage = 'Loading enhanced records with full features...';
            
            // Load FULL enhanced records with all features
            enhancedData = await Promise.race([
                getEnhancedLeagueRecords(false, {
                    includeAchievementGallery: true,
                    includeContextGeneration: true,   // ✅ FULL FEATURE
                    includeTrendAnalysis: true,       // ✅ FULL FEATURE
                    includePercentileCalculations: true, // ✅ FULL FEATURE
                    maxAchievementsPerCategory: 15    // ✅ MORE ACHIEVEMENTS
                }),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Enhanced loading timeout after 30 seconds')), 30000)
                )
            ]);
            
            loadingStage = 'Finalizing enhanced display...';
            
            console.log('✅ FULL Enhanced records loaded successfully:', enhancedData);
            console.log('🎯 Enhanced features enabled:', enhancedData?.enhancedFeatures);
            
            // Set default selected record to the most significant achievement
            if (enhancedData?.[dataKey]?.achievementGallery?.length > 0) {
                selectedRecord = enhancedData[dataKey].achievementGallery[0];
                console.log('🎖️ Selected default record:', selectedRecord);
            }
            
        } catch (err) {
            console.error('❌ Error loading FULL enhanced records:', err);
            console.error('📍 Stack trace:', err.stack);
            error = err.message;
            
            // Fallback: Try with minimal features if full features fail
            try {
                console.log('🔄 Attempting fallback with minimal features...');
                loadingStage = 'Loading with fallback features...';
                
                enhancedData = await getEnhancedLeagueRecords(false, {
                    includeAchievementGallery: true,
                    includeContextGeneration: false,
                    includeTrendAnalysis: false,
                    includePercentileCalculations: false,
                    maxAchievementsPerCategory: 5
                });
                
                console.log('✅ Fallback enhanced records loaded:', enhancedData);
                error = null; // Clear error since fallback worked
                
            } catch (fallbackErr) {
                console.error('❌ Fallback also failed:', fallbackErr);
                error = `Enhanced records failed: ${err.message}. Fallback failed: ${fallbackErr.message}`;
            }
        } finally {
            console.log('🏁 Enhanced loading finished');
            loading = false;
        }
    };

    // Handle data key changes (Regular Season vs Playoffs)
    const handleDataKeyChange = (newKey) => {
        dataKey = newKey;
        // Update selected record for new data context
        if (enhancedData?.[dataKey]?.achievementGallery?.length > 0) {
            selectedRecord = enhancedData[dataKey].achievementGallery[0];
        }
    };

    // Handle filter changes from navigation
    const handleFilterChange = (filters) => {
        activeFilters = { ...filters };
    };

    // Handle record selection from navigation or explorer
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

    .full-features-notice {
        background: linear-gradient(135deg, #e8f5e8 0%, #f0f8ff 100%);
        color: #0c5460;
        padding: 1rem;
        border-radius: 8px;
        margin: 1rem 0;
        border: 1px solid #b8daff;
        text-align: center;
        font-size: 0.9rem;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .features-list {
        display: flex;
        justify-content: center;
        gap: 1rem;
        margin-top: 0.5rem;
        flex-wrap: wrap;
    }

    .feature-badge {
        background: #28a745;
        color: white;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.75rem;
        font-weight: 600;
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
        
        .records-enhanced-container {
            padding: 0 2rem;
        }
    }

    @media (min-width: 1200px) {
        .enhanced-layout {
            gap: 4rem;
        }
    }

    /* Enhanced styling for better visual hierarchy */
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

    /* Mobile responsiveness */
    @media (max-width: 768px) {
        .records-enhanced-container {
            padding: 0 0.5rem;
        }
        
        .enhanced-layout {
            grid-template-columns: 1fr;
            gap: 1.5rem;
        }
        
        .sidebar {
            position: static;
        }
        
        .features-list {
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
        }
    }

    /* Button styling enhancements */
    :global(.data-selector .mdc-button) {
        margin: 0 0.25rem;
    }

    /* Responsive button sizing */
    @media (max-width: 540px) {
        :global(.data-selector .mdc-button) {
            font-size: 0.75rem;
            padding: 0.5rem 1rem;
            margin: 0.25rem;
        }
    }
</style>

<div class="records-enhanced-container">
    {#if loading}
        <!-- Enhanced Loading State with Progress -->
        <div class="loading-container">
            <h3>Loading Enhanced Records</h3>
            <p>Analyzing league achievements and generating insights with full features</p>
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
        
        <!-- Full Features Notice -->
        {#if enhancedData.enhancedFeatures && !enhancedData.enhancedFeatures.fallbackMode}
            <div class="full-features-notice">
                🚀 <strong>Enhanced Records - Full Features Active!</strong>
                <div class="features-list">
                    {#if enhancedData.enhancedFeatures.achievementGallery}
                        <span class="feature-badge">Achievement Gallery</span>
                    {/if}
                    {#if enhancedData.enhancedFeatures.contextGeneration}
                        <span class="feature-badge">Context Generation</span>
                    {/if}
                    {#if enhancedData.enhancedFeatures.trendAnalysis}
                        <span class="feature-badge">Trend Analysis</span>
                    {/if}
                    {#if enhancedData.enhancedFeatures.percentileCalculations}
                        <span class="feature-badge">Percentile Calculations</span>
                    {/if}
                </div>
            </div>
        {:else if enhancedData.enhancedFeatures?.fallbackMode}
            <div class="full-features-notice" style="background: #fff3cd; border-color: #ffeaa7;">
                ⚠️ <strong>Fallback Mode:</strong> Some enhanced features are simplified for stability.
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
