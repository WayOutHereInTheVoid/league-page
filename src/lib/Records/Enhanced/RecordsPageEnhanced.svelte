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
    
    // View mode state (allows switching between classic and enhanced)
    let viewMode = $state('enhanced'); // 'classic' | 'enhanced'
    let dataKey = $state('regularSeasonData'); // 'regularSeasonData' | 'playoffData'
    
    // Enhanced features state
    let selectedRecord = $state(null);
    let activeFilters = $state({
        timeframe: 'all-time',
        recordType: 'all',
        rarity: 'all',
        managers: []
    });

    // Load enhanced records data
    const loadEnhancedData = async () => {
        try {
            console.log('🚀 Starting enhanced records load...');
            loading = true;
            error = null;
            
            console.log('📞 Calling getEnhancedLeagueRecords...');
            // Use enhanced league records with all features enabled
            enhancedData = await getEnhancedLeagueRecords(false, {
                includeAchievementGallery: true,
                includeContextGeneration: true,
                includeTrendAnalysis: true,
                includePercentileCalculations: true,
                maxAchievementsPerCategory: 15
            });
            
            console.log('✅ Enhanced records loaded successfully:', enhancedData);
            console.log('📊 Regular season data available:', !!enhancedData?.regularSeasonData);
            console.log('🏆 Playoff data available:', !!enhancedData?.playoffData);
            console.log('🎯 Enhanced features:', enhancedData?.enhancedFeatures);
            
            // Set default selected record to the most significant achievement
            if (enhancedData?.[dataKey]?.achievementGallery?.length > 0) {
                selectedRecord = enhancedData[dataKey].achievementGallery[0];
                console.log('🎖️ Selected default record:', selectedRecord);
            }
            
        } catch (err) {
            console.error('❌ Error loading enhanced records:', err);
            console.error('📍 Stack trace:', err.stack);
            error = err.message;
        } finally {
            console.log('🏁 Loading finished, setting loading = false');
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
        // Filter logic will be implemented in RecordsExplorer
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

    .error-container {
        text-align: center;
        padding: 2rem;
        background: var(--error);
        color: white;
        border-radius: 8px;
        margin: 2rem 0;
    }

    .view-mode-selector {
        text-align: center;
        margin: 1rem 0 2rem;
        padding: 1rem;
        background: var(--f8f8f8);
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .view-mode-title {
        font-size: 0.875rem;
        color: var(--g555);
        margin-bottom: 0.5rem;
        font-weight: 500;
    }

    .data-selector {
        text-align: center;
        margin: 1rem 0;
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
        
        .view-mode-selector {
            margin: 0.5rem 0 1rem;
            padding: 0.75rem;
        }
        
        .sidebar {
            position: static;
        }
    }

    /* Button styling enhancements */
    :global(.view-mode-selector .mdc-button) {
        margin: 0 0.25rem;
    }

    :global(.data-selector .mdc-button) {
        margin: 0 0.25rem;
    }

    /* Responsive button sizing */
    @media (max-width: 540px) {
        :global(.view-mode-selector .mdc-button),
        :global(.data-selector .mdc-button) {
            font-size: 0.75rem;
            padding: 0.5rem 1rem;
            margin: 0.25rem;
        }
    }
</style>

<div class="records-enhanced-container">
    <!-- View Mode Selector (Enhanced vs Classic) -->
    <div class="view-mode-selector">
        <div class="view-mode-title">Records Experience</div>
        <Group variant="outlined">
            <Button 
                class="selectionButtons" 
                onclick={() => viewMode = "enhanced"} 
                variant={viewMode === "enhanced" ? "raised" : "outlined"}>
                <Label>Enhanced View</Label>
            </Button>
            <Button 
                class="selectionButtons" 
                onclick={() => viewMode = "classic"} 
                variant={viewMode === "classic" ? "raised" : "outlined"}>
                <Label>Classic View</Label>
            </Button>
        </Group>
    </div>

    {#if viewMode === 'classic'}
        <!-- Fall back to original Records component for classic view -->
        <div>
            <!-- This will be populated with the original Records component -->
            <p style="text-align: center; padding: 2rem; color: var(--g555);">
                Classic view integration coming next...
            </p>
        </div>
    {:else if loading}
        <!-- Enhanced Loading State -->
        <div class="loading-container">
            <h3>Loading Enhanced Records...</h3>
            <p>Analyzing league achievements and generating insights</p>
            <div class="loading-progress">
                <LinearProgress indeterminate />
            </div>
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
        </div>
    {/if}
</div>
