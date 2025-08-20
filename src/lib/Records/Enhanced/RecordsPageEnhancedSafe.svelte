<script>
    import { onMount } from 'svelte';
    import Button, { Group, Label } from '@smui/button';
    import LinearProgress from '@smui/linear-progress';

    // Props from parent page
    let { leagueData, totals, stale, leagueTeamManagers } = $props();

    // Simple state management
    let enhancedData = $state(null);
    let loading = $state(true);
    let error = $state(null);
    let loadingStage = $state('Initializing...');
    let dataKey = $state('regularSeasonData');
    let selectedRecord = $state(null);

    // Safe data loading with comprehensive error handling
    const loadEnhancedData = async () => {
        try {
            loading = true;
            error = null;
            
            loadingStage = 'Validating data...';
            console.log('🔍 Validating input data:', {
                leagueData: !!leagueData,
                leagueDataType: typeof leagueData,
                totals: !!totals,
                leagueTeamManagers: !!leagueTeamManagers
            });

            // Safety check: Ensure we have the minimum required data
            if (!leagueData || leagueData === null) {
                throw new Error('League data is null or undefined');
            }

            if (!totals || totals === null) {
                throw new Error('Totals data is null or undefined');
            }

            loadingStage = 'Loading basic records...';
            
            // Import and load regular records with timeout
            const { getLeagueRecords } = await import('$lib/utils/helper');
            const baseRecords = await Promise.race([
                getLeagueRecords(false),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Base records timeout after 10 seconds')), 10000)
                )
            ]);
            
            console.log('✅ Base records loaded:', baseRecords);

            if (!baseRecords) {
                throw new Error('Base records returned null');
            }

            loadingStage = 'Creating enhanced view...';
            
            // Create a safe enhanced structure
            enhancedData = createSafeEnhancedData(baseRecords);
            
            // Set a default selected record
            setDefaultRecord();
            
            console.log('✅ Enhanced records ready:', enhancedData);
            
        } catch (err) {
            console.error('❌ Error loading enhanced records:', err);
            error = err.message;
            
            // Create minimal fallback data structure
            enhancedData = createMinimalFallback();
            
        } finally {
            loading = false;
        }
    };

    // Create safe enhanced data structure
    const createSafeEnhancedData = (baseRecords) => {
        const createSafeDataSet = (data, dataType) => {
            // Ensure data exists and has required properties
            const safeData = data || {};
            const weeklyHighs = safeData.leagueWeekHighs || [];
            const seasonHighs = safeData.mostSeasonLongPoints || [];
            
            // Create simple achievement gallery
            const achievements = [];
            
            // Add weekly achievements
            weeklyHighs.slice(0, 3).forEach((record, index) => {
                if (record && record.fpts) {
                    achievements.push({
                        id: `${dataType}-weekly-${index}`,
                        type: 'weekly',
                        title: `${record.fpts.toFixed(1)} Point Week`,
                        description: `Outstanding weekly performance`,
                        value: record.fpts,
                        rarity: index === 0 ? 'legendary' : index === 1 ? 'rare' : 'notable',
                        significance: 100 - (index * 20),
                        record: record,
                        year: record.year,
                        week: record.week
                    });
                }
            });

            // Add season achievements
            seasonHighs.slice(0, 2).forEach((record, index) => {
                if (record && record.fpts) {
                    achievements.push({
                        id: `${dataType}-season-${index}`,
                        type: 'season',
                        title: `${record.fpts.toFixed(1)} Point Season`,
                        description: `Exceptional season total`,
                        value: record.fpts,
                        rarity: index === 0 ? 'legendary' : 'rare',
                        significance: 90 - (index * 15),
                        record: record,
                        year: record.year
                    });
                }
            });

            return {
                ...safeData,
                achievementGallery: achievements,
                leagueAverages: {
                    weeklyPoints: { mean: 100, median: 95 },
                    seasonPoints: { mean: 1500, median: 1450 }
                }
            };
        };

        return {
            regularSeasonData: createSafeDataSet(baseRecords.regularSeasonData, 'regular'),
            playoffData: createSafeDataSet(baseRecords.playoffData, 'playoff'),
            enhancedFeatures: {
                safeMode: true,
                achievementGallery: true,
                generatedAt: new Date().toISOString()
            }
        };
    };

    // Create minimal fallback if everything fails
    const createMinimalFallback = () => {
        return {
            regularSeasonData: {
                leagueWeekHighs: [],
                mostSeasonLongPoints: [],
                achievementGallery: [],
                leagueAverages: { weeklyPoints: { mean: 0 }, seasonPoints: { mean: 0 } }
            },
            playoffData: {
                leagueWeekHighs: [],
                mostSeasonLongPoints: [],
                achievementGallery: [],
                leagueAverages: { weeklyPoints: { mean: 0 }, seasonPoints: { mean: 0 } }
            },
            enhancedFeatures: {
                errorMode: true,
                message: 'Enhanced records could not be loaded'
            }
        };
    };

    // Set default selected record safely
    const setDefaultRecord = () => {
        try {
            const achievements = enhancedData?.[dataKey]?.achievementGallery;
            if (achievements && achievements.length > 0) {
                selectedRecord = achievements[0];
                console.log('🎖️ Selected default record:', selectedRecord);
            } else {
                // Fallback to weekly high
                const weeklyHighs = enhancedData?.[dataKey]?.leagueWeekHighs;
                if (weeklyHighs && weeklyHighs.length > 0) {
                    selectedRecord = {
                        type: 'weekly',
                        title: `${weeklyHighs[0].fpts?.toFixed(1)} Point Week`,
                        value: weeklyHighs[0].fpts,
                        record: weeklyHighs[0]
                    };
                }
            }
        } catch (err) {
            console.warn('⚠️ Could not set default record:', err);
        }
    };

    // Handle data key changes
    const handleDataKeyChange = (newKey) => {
        dataKey = newKey;
        setDefaultRecord();
    };

    // Load data on mount
    onMount(() => {
        loadEnhancedData();
    });

    // Refresh if stale
    $effect(() => {
        if (stale) {
            loadEnhancedData();
        }
    });
</script>

<style>
    .enhanced-container {
        width: 100%;
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 1rem;
    }

    .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 400px;
        gap: 1rem;
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

    .safe-mode-notice {
        background: #e8f4fd;
        color: #0c5460;
        padding: 1rem;
        border-radius: 8px;
        margin: 1rem 0;
        border: 1px solid #b8daff;
        text-align: center;
        font-size: 0.9rem;
    }

    .data-selector {
        text-align: center;
        margin: 1rem 0 2rem;
    }

    .achievements-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1.5rem;
        margin: 2rem 0;
    }

    .achievement-card {
        background: var(--f8f8f8);
        border-radius: 12px;
        padding: 1.5rem;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        border: 1px solid var(--e8e8e8);
        transition: transform 0.2s, box-shadow 0.2s;
        cursor: pointer;
    }

    .achievement-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    }

    .achievement-card.selected {
        border-color: var(--headerPrimary);
        box-shadow: 0 0 0 2px rgba(var(--headerPrimary), 0.2);
    }

    .achievement-header {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 1rem;
    }

    .rarity-badge {
        padding: 0.25rem 0.5rem;
        border-radius: 6px;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
    }

    .rarity-legendary {
        background: #ffd700;
        color: #b8860b;
    }

    .rarity-rare {
        background: #e6e6fa;
        color: #663399;
    }

    .rarity-notable {
        background: #e6f3ff;
        color: #2563eb;
    }

    .achievement-value {
        font-size: 2rem;
        font-weight: bold;
        color: var(--headerPrimary);
        margin: 0.5rem 0;
    }

    .achievement-title {
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--g333);
        margin: 0.5rem 0;
    }

    .achievement-description {
        color: var(--g666);
        font-size: 0.9rem;
        line-height: 1.4;
    }

    .achievement-meta {
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid var(--e8e8e8);
        font-size: 0.8rem;
        color: var(--g888);
    }

    .debug-info {
        background: var(--f8f8f8);
        border-radius: 8px;
        padding: 1rem;
        margin: 2rem 0;
        font-family: monospace;
        font-size: 0.85rem;
    }
</style>

<div class="enhanced-container">
    {#if loading}
        <div class="loading-container">
            <h3>Loading Enhanced Records</h3>
            <p>Analyzing league achievements safely</p>
            <LinearProgress indeterminate />
            <div style="color: var(--g666); margin-top: 0.5rem;">{loadingStage}</div>
        </div>
    {:else if error}
        <div class="error-container">
            <h3>Enhanced Records Error</h3>
            <p>{error}</p>
            <Button onclick={loadEnhancedData} variant="outlined">
                <Label>Try Again</Label>
            </Button>
        </div>
    {:else if enhancedData}
        
        <!-- Safe mode notice -->
        {#if enhancedData.enhancedFeatures?.safeMode}
            <div class="safe-mode-notice">
                🛡️ <strong>Safe Mode:</strong> Enhanced records are running with additional error protection and simplified features.
            </div>
        {/if}

        <!-- Error mode notice -->
        {#if enhancedData.enhancedFeatures?.errorMode}
            <div class="error-container">
                <h3>Limited Functionality</h3>
                <p>{enhancedData.enhancedFeatures.message}</p>
            </div>
        {/if}

        <!-- Data selector -->
        <div class="data-selector">
            <Group variant="outlined">
                <Button 
                    onclick={() => handleDataKeyChange("regularSeasonData")} 
                    variant={dataKey === "regularSeasonData" ? "raised" : "outlined"}>
                    <Label>Regular Season</Label>
                </Button>
                <Button 
                    onclick={() => handleDataKeyChange("playoffData")} 
                    variant={dataKey === "playoffData" ? "raised" : "outlined"}>
                    <Label>Playoffs</Label>
                </Button>
            </Group>
        </div>

        <!-- Achievements display -->
        {#if enhancedData[dataKey]?.achievementGallery?.length > 0}
            <div class="achievements-grid">
                {#each enhancedData[dataKey].achievementGallery as achievement}
                    <div 
                        class="achievement-card"
                        class:selected={selectedRecord?.id === achievement.id}
                        onclick={() => selectedRecord = achievement}
                        onkeydown={(e) => e.key === 'Enter' && (selectedRecord = achievement)}
                        role="button"
                        tabindex="0"
                        aria-label="Select {achievement.title}"
                    >
                        <div class="achievement-header">
                            <div class="rarity-badge rarity-{achievement.rarity}">
                                {achievement.rarity}
                            </div>
                            <span style="font-size: 1.2rem;">
                                {achievement.rarity === 'legendary' ? '👑' : 
                                 achievement.rarity === 'rare' ? '💎' : '⭐'}
                            </span>
                        </div>
                        
                        <div class="achievement-value">
                            {achievement.value?.toFixed(1) || 'N/A'}
                        </div>
                        
                        <div class="achievement-title">
                            {achievement.title}
                        </div>
                        
                        <div class="achievement-description">
                            {achievement.description}
                        </div>
                        
                        <div class="achievement-meta">
                            {#if achievement.year}
                                {achievement.year} Season
                            {/if}
                            {#if achievement.week}
                                • Week {achievement.week}
                            {/if}
                            • Significance: {achievement.significance}%
                        </div>
                    </div>
                {/each}
            </div>
        {:else}
            <div style="text-align: center; padding: 3rem; color: var(--g666);">
                <h3>No Achievements Available</h3>
                <p>No records found for the selected timeframe.</p>
            </div>
        {/if}

        <!-- Debug information -->
        <div class="debug-info">
            <strong>Debug Info:</strong><br>
            Records Available: {enhancedData[dataKey]?.achievementGallery?.length || 0}<br>
            Data Key: {dataKey}<br>
            Selected Record: {selectedRecord?.title || 'None'}<br>
            Enhanced Features: {JSON.stringify(enhancedData.enhancedFeatures)}
        </div>
    {/if}
</div>
