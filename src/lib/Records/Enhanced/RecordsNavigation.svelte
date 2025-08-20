<script>
    import { onMount } from 'svelte';
    import Button from '@smui/button';
    import { Label } from '@smui/button';
    import Paper from '@smui/paper';
    import AchievementBadge from './components/AchievementBadge.svelte';

    // Props
    let { 
        recordsData,
        activeFilters,
        leagueTeamManagers,
        onFilterChange,
        onRecordSelect
    } = $props();

    // Navigation state
    let quickFilters = $state([]);
    let topAchievements = $state([]);
    let filterSummary = $state({});
    let expandedSections = $state({
        quickAccess: true,
        filters: false,
        topRecords: true,
        insights: false
    });

    // Quick filter presets
    const filterPresets = [
        {
            id: 'legendary',
            label: 'Legendary Only',
            icon: '👑',
            filters: { rarity: 'legendary' }
        },
        {
            id: 'this-season',
            label: 'This Season',
            icon: '📅',
            filters: { timeframe: 'current-season' }
        },
        {
            id: 'weekly-highs',
            label: 'Weekly Explosions',
            icon: '🚀',
            filters: { recordType: 'weekly', subtype: 'high' }
        },
        {
            id: 'blowouts',
            label: 'Biggest Blowouts',
            icon: '💥',
            filters: { recordType: 'matchup', subtype: 'blowout' }
        },
        {
            id: 'close-games',
            label: 'Nail-Biters',
            icon: '⚡',
            filters: { recordType: 'matchup', subtype: 'narrow' }
        }
    ];

    // Update data when recordsData changes
    const updateNavigationData = () => {
        if (!recordsData?.achievementGallery) return;

        // Get top achievements for quick access
        topAchievements = recordsData.achievementGallery
            .slice(0, 8)
            .map(achievement => ({
                ...achievement,
                managerInfo: getManagerInfo(achievement)
            }));

        // Generate filter summary
        generateFilterSummary();
    };

    // Generate summary of available records for filter insights
    const generateFilterSummary = () => {
        if (!recordsData?.achievementGallery) return;

        const gallery = recordsData.achievementGallery;
        
        filterSummary = {
            total: gallery.length,
            byRarity: {
                legendary: gallery.filter(a => a.rarity === 'legendary').length,
                rare: gallery.filter(a => a.rarity === 'rare').length,
                notable: gallery.filter(a => a.rarity === 'notable').length,
                common: gallery.filter(a => a.rarity === 'common').length
            },
            byType: {
                weekly: gallery.filter(a => a.type === 'weekly').length,
                season: gallery.filter(a => a.type === 'season').length,
                matchup: gallery.filter(a => a.type === 'matchup').length
            },
            byManager: getManagerCounts(gallery)
        };
    };

    // Get achievement counts by manager
    const getManagerCounts = (achievements) => {
        const counts = {};
        achievements.forEach(achievement => {
            const managerId = achievement.manager || achievement.rosterID;
            if (managerId) {
                counts[managerId] = (counts[managerId] || 0) + 1;
            }
        });
        return counts;
    };

    // Get manager info for display
    const getManagerInfo = (record) => {
        if (!leagueTeamManagers || !record.manager && !record.rosterID) return null;
        
        const managerId = record.manager || record.rosterID;
        const managerInfo = leagueTeamManagers.find(manager => 
            manager.roster?.roster_id === managerId
        );
        
        return managerInfo || null;
    };

    // Apply filter preset
    const applyFilterPreset = (preset) => {
        const newFilters = { ...activeFilters, ...preset.filters };
        onFilterChange?.(newFilters);
    };

    // Clear all filters
    const clearFilters = () => {
        const resetFilters = {
            timeframe: 'all-time',
            recordType: 'all',
            rarity: 'all',
            managers: []
        };
        onFilterChange?.(resetFilters);
    };

    // Toggle section expansion
    const toggleSection = (section) => {
        expandedSections[section] = !expandedSections[section];
    };

    // Handle record selection
    const selectRecord = (record) => {
        onRecordSelect?.(record);
    };

    // Format achievement value for display
    const formatValue = (achievement) => {
        if (!achievement.value) return '--';
        
        if (achievement.type === 'weekly' || achievement.type === 'season') {
            return achievement.value.toFixed(1);
        } else if (achievement.type === 'matchup') {
            return achievement.value.toFixed(1);
        }
        
        return achievement.value.toString();
    };

    // Get manager name safely
    const getManagerName = (achievement) => {
        const info = achievement.managerInfo;
        return info?.name || info?.roster?.name || `Manager ${achievement.manager || achievement.rosterID}`;
    };

    // Update navigation when data changes
    $effect(() => {
        updateNavigationData();
    });
</script>

<style>
    .records-navigation {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .nav-section {
        background: var(--fff);
        border-radius: 12px;
        border: 1px solid var(--ebebeb);
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }

    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 1.25rem;
        background: var(--f8f8f8);
        border-bottom: 1px solid var(--ebebeb);
        cursor: pointer;
        transition: background-color 0.2s ease;
    }

    .section-header:hover {
        background: var(--f3f3f3);
    }

    .section-title {
        font-size: 1rem;
        font-weight: 600;
        color: var(--g333);
        margin: 0;
        flex: 1;
    }

    .section-toggle {
        font-size: 1.25rem;
        color: var(--g555);
        transition: transform 0.2s ease;
    }

    .section-toggle.expanded {
        transform: rotate(180deg);
    }

    .section-content {
        padding: 1.25rem;
    }

    .quick-filters {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .filter-preset {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem;
        border: 1px solid var(--ebebeb);
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
        background: var(--fff);
    }

    .filter-preset:hover {
        border-color: var(--blueOne);
        background: var(--r1);
        transform: translateY(-1px);
    }

    .filter-preset.active {
        border-color: var(--blueOne);
        background: var(--r1);
    }

    .preset-icon {
        font-size: 1.25rem;
        width: 24px;
        text-align: center;
    }

    .preset-label {
        font-weight: 500;
        color: var(--g333);
        flex: 1;
    }

    .preset-count {
        font-size: 0.875rem;
        color: var(--g555);
        background: var(--f3f3f3);
        padding: 0.25rem 0.5rem;
        border-radius: 12px;
    }

    .top-records {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .record-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem;
        border: 1px solid var(--ebebeb);
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .record-item:hover {
        border-color: var(--blueOne);
        background: var(--r1);
        transform: translateY(-1px);
    }

    .record-info {
        flex: 1;
        min-width: 0;
    }

    .record-value {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--blueOne);
        margin: 0;
        line-height: 1;
    }

    .record-title {
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--g333);
        margin: 0.25rem 0 0 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .record-manager {
        font-size: 0.75rem;
        color: var(--g555);
        margin: 0.25rem 0 0 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .filter-actions {
        display: flex;
        gap: 0.5rem;
        margin-top: 1rem;
    }

    .insights {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .insight-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.75rem;
    }

    .insight-item {
        text-align: center;
        padding: 0.75rem;
        background: var(--f8f8f8);
        border-radius: 8px;
        border: 1px solid var(--ebebeb);
    }

    .insight-value {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--blueOne);
        margin: 0;
    }

    .insight-label {
        font-size: 0.75rem;
        color: var(--g555);
        margin: 0.25rem 0 0 0;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .rarity-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .rarity-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem;
        background: var(--f8f8f8);
        border-radius: 6px;
    }

    .rarity-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.875rem;
        font-weight: 500;
    }

    .rarity-count {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--blueOne);
    }

    /* Mobile responsiveness */
    @media (max-width: 768px) {
        .records-navigation {
            gap: 1rem;
        }

        .section-content {
            padding: 1rem;
        }

        .insight-grid {
            grid-template-columns: 1fr;
        }

        .filter-preset,
        .record-item {
            padding: 0.5rem;
        }

        .record-value {
            font-size: 1rem;
        }

        .record-title {
            font-size: 0.8rem;
        }
    }

    /* Hidden class for collapsed sections */
    .section-content.collapsed {
        display: none;
    }
</style>

<div class="records-navigation">
    <!-- Quick Access Filters -->
    <div class="nav-section">
        <div 
            class="section-header" 
            onclick={() => toggleSection('quickAccess')}>
            <h3 class="section-title">Quick Filters</h3>
            <span 
                class="section-toggle" 
                class:expanded={expandedSections.quickAccess}>
                ▼
            </span>
        </div>
        
        <div 
            class="section-content" 
            class:collapsed={!expandedSections.quickAccess}>
            <div class="quick-filters">
                {#each filterPresets as preset}
                    <div 
                        class="filter-preset"
                        class:active={activeFilters[Object.keys(preset.filters)[0]] === Object.values(preset.filters)[0]}
                        onclick={() => applyFilterPreset(preset)}>
                        <span class="preset-icon">{preset.icon}</span>
                        <span class="preset-label">{preset.label}</span>
                        <span class="preset-count">
                            {filterSummary.byRarity?.[preset.filters.rarity] || 
                             filterSummary.byType?.[preset.filters.recordType] || 
                             filterSummary.total || 0}
                        </span>
                    </div>
                {/each}
            </div>
            
            <div class="filter-actions">
                <Button 
                    variant="outlined" 
                    onclick={clearFilters}
                    size="small">
                    <Label>Clear All</Label>
                </Button>
            </div>
        </div>
    </div>

    <!-- Top Records -->
    <div class="nav-section">
        <div 
            class="section-header" 
            onclick={() => toggleSection('topRecords')}>
            <h3 class="section-title">Top Achievements</h3>
            <span 
                class="section-toggle" 
                class:expanded={expandedSections.topRecords}>
                ▼
            </span>
        </div>
        
        <div 
            class="section-content" 
            class:collapsed={!expandedSections.topRecords}>
            <div class="top-records">
                {#each topAchievements as achievement, index}
                    <div 
                        class="record-item"
                        onclick={() => selectRecord(achievement)}>
                        <AchievementBadge 
                            rarity={achievement.rarity}
                            size="small"
                        />
                        
                        <div class="record-info">
                            <div class="record-value">
                                {formatValue(achievement)}
                            </div>
                            <div class="record-title">
                                {achievement.title}
                            </div>
                            <div class="record-manager">
                                {getManagerName(achievement)}
                            </div>
                        </div>
                    </div>
                {/each}
                
                {#if topAchievements.length === 0}
                    <p style="text-align: center; color: var(--g555); margin: 1rem 0;">
                        No achievements available
                    </p>
                {/if}
            </div>
        </div>
    </div>

    <!-- League Insights -->
    <div class="nav-section">
        <div 
            class="section-header" 
            onclick={() => toggleSection('insights')}>
            <h3 class="section-title">League Insights</h3>
            <span 
                class="section-toggle" 
                class:expanded={expandedSections.insights}>
                ▼
            </span>
        </div>
        
        <div 
            class="section-content" 
            class:collapsed={!expandedSections.insights}>
            <div class="insights">
                <!-- Quick Stats -->
                <div class="insight-grid">
                    <div class="insight-item">
                        <div class="insight-value">{filterSummary.total || 0}</div>
                        <div class="insight-label">Total Records</div>
                    </div>
                    <div class="insight-item">
                        <div class="insight-value">{filterSummary.byRarity?.legendary || 0}</div>
                        <div class="insight-label">Legendary</div>
                    </div>
                    <div class="insight-item">
                        <div class="insight-value">{filterSummary.byType?.weekly || 0}</div>
                        <div class="insight-label">Weekly Records</div>
                    </div>
                    <div class="insight-item">
                        <div class="insight-value">{filterSummary.byType?.matchup || 0}</div>
                        <div class="insight-label">Matchup Records</div>
                    </div>
                </div>

                <!-- Rarity Breakdown -->
                {#if filterSummary.byRarity}
                    <div class="rarity-breakdown">
                        <h4 style="margin: 0 0 0.5rem 0; font-size: 0.875rem; color: var(--g555);">
                            Achievement Rarity
                        </h4>
                        
                        {#each Object.entries(filterSummary.byRarity) as [rarity, count]}
                            {#if count > 0}
                                <div class="rarity-item">
                                    <div class="rarity-label">
                                        <AchievementBadge {rarity} size="tiny" />
                                        {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
                                    </div>
                                    <span class="rarity-count">{count}</span>
                                </div>
                            {/if}
                        {/each}
                    </div>
                {/if}
            </div>
        </div>
    </div>
</div>
