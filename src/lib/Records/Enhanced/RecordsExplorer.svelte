<script>
    import { onMount } from 'svelte';
    import Button from '@smui/button';
    import { Label } from '@smui/button';
    import RecordHeroCard from './components/RecordHeroCard.svelte';
    import PerformanceChart from './components/PerformanceChart.svelte';
    import AchievementBadge from './components/AchievementBadge.svelte';

    // Props
    let { 
        recordsData,
        activeFilters,
        selectedRecord,
        leagueTeamManagers,
        onRecordSelect
    } = $props();

    // Explorer state
    let displayMode = $state('cards'); // 'cards' | 'charts' | 'table'
    let filteredRecords = $state([]);
    let currentPage = $state(1);
    let recordsPerPage = $state(12);
    let sortBy = $state('significance'); // 'significance' | 'recency' | 'value' | 'rarity'
    let sortOrder = $state('desc'); // 'asc' | 'desc'

    // Filter and sort records
    const updateFilteredRecords = () => {
        if (!recordsData?.achievementGallery) {
            filteredRecords = [];
            return;
        }

        let records = [...recordsData.achievementGallery];

        // Apply filters
        if (activeFilters.rarity && activeFilters.rarity !== 'all') {
            records = records.filter(record => record.rarity === activeFilters.rarity);
        }

        if (activeFilters.recordType && activeFilters.recordType !== 'all') {
            records = records.filter(record => record.type === activeFilters.recordType);
        }

        if (activeFilters.timeframe && activeFilters.timeframe !== 'all-time') {
            // Implement timeframe filtering
            const currentYear = new Date().getFullYear();
            if (activeFilters.timeframe === 'current-season') {
                records = records.filter(record => record.year === currentYear);
            }
        }

        if (activeFilters.managers && activeFilters.managers.length > 0) {
            records = records.filter(record => {
                const managerId = record.manager || record.rosterID;
                return activeFilters.managers.includes(managerId);
            });
        }

        // Apply sorting
        records.sort((a, b) => {
            let aValue, bValue;
            
            switch (sortBy) {
                case 'significance':
                    aValue = a.significance || 0;
                    bValue = b.significance || 0;
                    break;
                case 'recency':
                    aValue = new Date(a.date || 0).getTime();
                    bValue = new Date(b.date || 0).getTime();
                    break;
                case 'value':
                    aValue = a.value || 0;
                    bValue = b.value || 0;
                    break;
                case 'rarity':
                    const rarityWeights = { legendary: 4, rare: 3, notable: 2, common: 1 };
                    aValue = rarityWeights[a.rarity] || 1;
                    bValue = rarityWeights[b.rarity] || 1;
                    break;
                default:
                    aValue = a.significance || 0;
                    bValue = b.significance || 0;
            }

            return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
        });

        filteredRecords = records;
        currentPage = 1; // Reset to first page when filters change
    };

    // Pagination
    $derived: totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
    $derived: startIndex = (currentPage - 1) * recordsPerPage;
    $derived: endIndex = startIndex + recordsPerPage;
    $derived: paginatedRecords = filteredRecords.slice(startIndex, endIndex);

    // Handle record selection
    const selectRecord = (record) => {
        onRecordSelect?.(record);
    };

    // Handle sorting change
    const changeSorting = (newSortBy) => {
        if (sortBy === newSortBy) {
            sortOrder = sortOrder === 'desc' ? 'asc' : 'desc';
        } else {
            sortBy = newSortBy;
            sortOrder = 'desc';
        }
    };

    // Handle pagination
    const goToPage = (page) => {
        currentPage = Math.max(1, Math.min(page, totalPages));
    };

    // Get manager info for a record
    const getManagerInfo = (record) => {
        if (!leagueTeamManagers || !record.manager && !record.rosterID) return null;
        
        const managerId = record.manager || record.rosterID;
        const managerInfo = leagueTeamManagers.find(manager => 
            manager.roster?.roster_id === managerId
        );
        
        return managerInfo || null;
    };

    // Format record value for display
    const formatValue = (record) => {
        if (!record.value) return '--';
        
        if (record.type === 'weekly' || record.type === 'season') {
            return record.value.toFixed(1);
        } else if (record.type === 'matchup') {
            return record.value.toFixed(1);
        }
        
        return record.value.toString();
    };

    // Get manager name safely
    const getManagerName = (record) => {
        const info = getManagerInfo(record);
        return info?.name || info?.roster?.name || `Manager ${record.manager || record.rosterID}`;
    };

    // Update filtered records when dependencies change
    $effect(() => {
        updateFilteredRecords();
    });
</script>

<style>
    .records-explorer {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .explorer-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 1rem;
        padding: 1rem;
        background: var(--fff);
        border-radius: 12px;
        border: 1px solid var(--ebebeb);
        box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }

    .explorer-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--g333);
        margin: 0;
    }

    .explorer-controls {
        display: flex;
        gap: 1rem;
        align-items: center;
        flex-wrap: wrap;
    }

    .view-controls {
        display: flex;
        gap: 0.5rem;
        align-items: center;
    }

    .view-button {
        padding: 0.5rem;
        border: 1px solid var(--ebebeb);
        border-radius: 6px;
        background: var(--fff);
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .view-button:hover {
        border-color: var(--blueOne);
        background: var(--r1);
    }

    .view-button.active {
        border-color: var(--blueOne);
        background: var(--blueOne);
        color: white;
    }

    .sort-controls {
        display: flex;
        gap: 0.5rem;
        align-items: center;
    }

    .sort-button {
        padding: 0.5rem 0.75rem;
        border: 1px solid var(--ebebeb);
        border-radius: 6px;
        background: var(--fff);
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 0.875rem;
        font-weight: 500;
    }

    .sort-button:hover {
        border-color: var(--blueOne);
        background: var(--r1);
    }

    .sort-button.active {
        border-color: var(--blueOne);
        background: var(--r1);
        color: var(--blueOne);
    }

    .explorer-content {
        min-height: 400px;
    }

    .records-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2rem;
    }

    .records-table {
        background: var(--fff);
        border-radius: 12px;
        border: 1px solid var(--ebebeb);
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }

    .table-header {
        display: grid;
        grid-template-columns: auto 1fr auto auto auto;
        gap: 1rem;
        padding: 1rem;
        background: var(--f8f8f8);
        border-bottom: 1px solid var(--ebebeb);
        font-weight: 600;
        color: var(--g333);
        font-size: 0.875rem;
    }

    .table-row {
        display: grid;
        grid-template-columns: auto 1fr auto auto auto;
        gap: 1rem;
        padding: 1rem;
        border-bottom: 1px solid var(--f3f3f3);
        transition: background-color 0.2s ease;
        cursor: pointer;
        align-items: center;
    }

    .table-row:hover {
        background: var(--r1);
    }

    .table-row:last-child {
        border-bottom: none;
    }

    .record-value-cell {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--blueOne);
    }

    .record-title-cell {
        font-weight: 500;
        color: var(--g333);
    }

    .record-manager-cell {
        font-size: 0.875rem;
        color: var(--g555);
    }

    .pagination {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 0.5rem;
        margin-top: 2rem;
        flex-wrap: wrap;
    }

    .pagination-button {
        padding: 0.5rem 0.75rem;
        border: 1px solid var(--ebebeb);
        border-radius: 6px;
        background: var(--fff);
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 0.875rem;
        font-weight: 500;
        min-width: 40px;
        text-align: center;
    }

    .pagination-button:hover:not(:disabled) {
        border-color: var(--blueOne);
        background: var(--r1);
    }

    .pagination-button.active {
        border-color: var(--blueOne);
        background: var(--blueOne);
        color: white;
    }

    .pagination-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .pagination-info {
        font-size: 0.875rem;
        color: var(--g555);
        margin: 0 1rem;
    }

    .no-results {
        text-align: center;
        padding: 3rem;
        color: var(--g555);
    }

    .no-results-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
        opacity: 0.5;
    }

    /* Mobile responsiveness */
    @media (max-width: 768px) {
        .explorer-header {
            padding: 0.75rem;
        }

        .explorer-controls {
            width: 100%;
            justify-content: space-between;
        }

        .records-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
        }

        .table-header,
        .table-row {
            grid-template-columns: 1fr auto;
            gap: 0.5rem;
        }

        .pagination {
            gap: 0.25rem;
        }

        .pagination-button {
            padding: 0.5rem;
            min-width: 36px;
        }
    }
</style>

<div class="records-explorer">
    <!-- Explorer Header -->
    <div class="explorer-header">
        <div>
            <h2 class="explorer-title">
                Records Explorer
                {#if filteredRecords.length > 0}
                    <span style="font-weight: 400; color: var(--g555);">
                        ({filteredRecords.length} record{filteredRecords.length !== 1 ? 's' : ''})
                    </span>
                {/if}
            </h2>
        </div>

        <div class="explorer-controls">
            <!-- View Mode Controls -->
            <div class="view-controls">
                <button 
                    class="view-button"
                    class:active={displayMode === 'cards'}
                    onclick={() => displayMode = 'cards'}
                    title="Card View">
                    📊
                </button>
                <button 
                    class="view-button"
                    class:active={displayMode === 'table'}
                    onclick={() => displayMode = 'table'}
                    title="Table View">
                    📋
                </button>
                <button 
                    class="view-button"
                    class:active={displayMode === 'charts'}
                    onclick={() => displayMode = 'charts'}
                    title="Chart View">
                    📈
                </button>
            </div>

            <!-- Sort Controls -->
            <div class="sort-controls">
                <button 
                    class="sort-button"
                    class:active={sortBy === 'significance'}
                    onclick={() => changeSorting('significance')}>
                    Impact {sortBy === 'significance' ? (sortOrder === 'desc' ? '↓' : '↑') : ''}
                </button>
                <button 
                    class="sort-button"
                    class:active={sortBy === 'value'}
                    onclick={() => changeSorting('value')}>
                    Value {sortBy === 'value' ? (sortOrder === 'desc' ? '↓' : '↑') : ''}
                </button>
                <button 
                    class="sort-button"
                    class:active={sortBy === 'rarity'}
                    onclick={() => changeSorting('rarity')}>
                    Rarity {sortBy === 'rarity' ? (sortOrder === 'desc' ? '↓' : '↑') : ''}
                </button>
            </div>
        </div>
    </div>

    <!-- Explorer Content -->
    <div class="explorer-content">
        {#if paginatedRecords.length > 0}
            {#if displayMode === 'cards'}
                <!-- Card View -->
                <div class="records-grid">
                    {#each paginatedRecords as record}
                        <RecordHeroCard
                            {record}
                            managerInfo={getManagerInfo(record)}
                            isSelected={selectedRecord?.id === record.id}
                            onSelect={() => selectRecord(record)}
                        />
                    {/each}
                </div>
            {:else if displayMode === 'table'}
                <!-- Table View -->
                <div class="records-table">
                    <div class="table-header">
                        <div>Rarity</div>
                        <div>Achievement</div>
                        <div>Value</div>
                        <div>Manager</div>
                        <div>Impact</div>
                    </div>
                    
                    {#each paginatedRecords as record}
                        <div 
                            class="table-row"
                            onclick={() => selectRecord(record)}>
                            <div>
                                <AchievementBadge 
                                    rarity={record.rarity}
                                    size="small"
                                />
                            </div>
                            <div class="record-title-cell">
                                {record.title}
                            </div>
                            <div class="record-value-cell">
                                {formatValue(record)}
                            </div>
                            <div class="record-manager-cell">
                                {getManagerName(record)}
                            </div>
                            <div class="record-value-cell" style="font-size: 1rem;">
                                {record.significance || 0}
                            </div>
                        </div>
                    {/each}
                </div>
            {:else if displayMode === 'charts'}
                <!-- Chart View -->
                <PerformanceChart
                    records={paginatedRecords}
                    chartType="overview"
                    {leagueTeamManagers}
                />
            {/if}

            <!-- Pagination -->
            {#if totalPages > 1}
                <div class="pagination">
                    <button 
                        class="pagination-button"
                        disabled={currentPage === 1}
                        onclick={() => goToPage(currentPage - 1)}>
                        ←
                    </button>
                    
                    {#if totalPages <= 7}
                        {#each Array(totalPages) as _, i}
                            <button 
                                class="pagination-button"
                                class:active={currentPage === i + 1}
                                onclick={() => goToPage(i + 1)}>
                                {i + 1}
                            </button>
                        {/each}
                    {:else}
                        <!-- Show smart pagination for many pages -->
                        {#if currentPage > 3}
                            <button class="pagination-button" onclick={() => goToPage(1)}>1</button>
                            <span class="pagination-info">...</span>
                        {/if}
                        
                        {#each Array(Math.min(5, totalPages)) as _, i}
                            {@const page = Math.max(1, Math.min(totalPages - 2, currentPage - 2)) + i}
                            {#if page <= totalPages}
                                <button 
                                    class="pagination-button"
                                    class:active={currentPage === page}
                                    onclick={() => goToPage(page)}>
                                    {page}
                                </button>
                            {/if}
                        {/each}
                        
                        {#if currentPage < totalPages - 2}
                            <span class="pagination-info">...</span>
                            <button class="pagination-button" onclick={() => goToPage(totalPages)}>{totalPages}</button>
                        {/if}
                    {/if}
                    
                    <button 
                        class="pagination-button"
                        disabled={currentPage === totalPages}
                        onclick={() => goToPage(currentPage + 1)}>
                        →
                    </button>
                    
                    <div class="pagination-info">
                        Page {currentPage} of {totalPages} ({filteredRecords.length} total)
                    </div>
                </div>
            {/if}
        {:else}
            <!-- No Results -->
            <div class="no-results">
                <div class="no-results-icon">🔍</div>
                <h3>No Records Found</h3>
                <p>
                    {#if Object.values(activeFilters).some(filter => filter !== 'all' && filter !== 'all-time' && (!Array.isArray(filter) || filter.length > 0))}
                        Try adjusting your filters to see more results.
                    {:else}
                        No achievement records are available for this dataset.
                    {/if}
                </p>
            </div>
        {/if}
    </div>
</div>
