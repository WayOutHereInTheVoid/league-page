<script>
    import { createEventDispatcher } from 'svelte';
    import Button, { Label } from '@smui/button';
    
    const dispatch = createEventDispatcher();
    
    let { 
        activeFilters = [],
        availableFilters = [
            { id: 'current-season', label: 'Current Season', active: false },
            { id: 'top-performers', label: 'Top Performers', active: false },
            { id: 'recent-weeks', label: 'Recent Weeks', active: false },
            { id: 'playoffs-only', label: 'Playoffs Only', active: false }
        ]
    } = $props();
    
    const toggleFilter = (filterId) => {
        const filterIndex = availableFilters.findIndex(f => f.id === filterId);
        if (filterIndex !== -1) {
            availableFilters[filterIndex].active = !availableFilters[filterIndex].active;
            
            // Update active filters array
            if (availableFilters[filterIndex].active) {
                activeFilters = [...activeFilters, filterId];
            } else {
                activeFilters = activeFilters.filter(id => id !== filterId);
            }
            
            dispatch('filterChange', { 
                activeFilters: activeFilters,
                changedFilter: filterId,
                isActive: availableFilters[filterIndex].active
            });
        }
    };
    
    const clearAllFilters = () => {
        availableFilters = availableFilters.map(filter => ({ ...filter, active: false }));
        activeFilters = [];
        dispatch('filterChange', { 
            activeFilters: [],
            cleared: true
        });
    };
    
    let hasActiveFilters = $derived(() => activeFilters.length > 0);
</script>

<style>
    .filter-chips-container {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        align-items: center;
        margin: 1rem 0;
        padding: 1rem;
        background-color: var(--r1);
        border-radius: 8px;
        border: 1px solid var(--ebebeb);
    }
    
    .filter-chip {
        border-radius: 20px !important;
        font-size: 0.85em !important;
        padding: 6px 12px !important;
        min-height: 32px !important;
        transition: all 0.2s ease-out !important;
        border: 1px solid var(--ddd) !important;
        background-color: var(--fff) !important;
        color: var(--g555) !important;
    }
    
    .filter-chip:hover {
        background-color: var(--headerPrimary) !important;
        border-color: var(--blueOne) !important;
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .filter-chip.active {
        background-color: var(--blueOne) !important;
        color: white !important;
        border-color: var(--blueOne) !important;
        box-shadow: 0 2px 6px rgba(46, 125, 50, 0.3);
    }
    
    .filter-chip.active:hover {
        background-color: color-mix(in srgb, var(--blueOne) 90%, black 10%) !important;
        transform: translateY(-1px);
    }
    
    .clear-filters {
        border-radius: 16px !important;
        font-size: 0.8em !important;
        padding: 4px 10px !important;
        min-height: 28px !important;
        color: var(--g999) !important;
        border: 1px solid var(--ccc) !important;
        margin-left: auto;
    }
    
    .clear-filters:hover {
        background-color: var(--waiverDrop) !important;
        border-color: var(--error) !important;
        color: var(--error) !important;
    }
    
    .filter-label {
        font-weight: 600;
        color: var(--g555);
        font-size: 0.9em;
        margin-right: 0.5rem;
        white-space: nowrap;
    }
    
    .active-count {
        background-color: var(--blueOne);
        color: white;
        border-radius: 12px;
        padding: 2px 6px;
        font-size: 0.75em;
        font-weight: 600;
        margin-left: 0.25rem;
    }
    
    @media (max-width: 768px) {
        .filter-chips-container {
            padding: 0.75rem;
            gap: 0.375rem;
        }
        
        .filter-chip {
            font-size: 0.8em !important;
            padding: 5px 10px !important;
            min-height: 30px !important;
        }
        
        .filter-label {
            font-size: 0.85em;
        }
        
        .clear-filters {
            font-size: 0.75em !important;
            padding: 3px 8px !important;
            min-height: 26px !important;
        }
    }
    
    @media (max-width: 480px) {
        .filter-chips-container {
            flex-direction: column;
            align-items: stretch;
            gap: 0.5rem;
        }
        
        .filter-chips-row {
            display: flex;
            flex-wrap: wrap;
            gap: 0.375rem;
            justify-content: center;
        }
        
        .clear-filters {
            align-self: center;
            margin-left: 0;
            margin-top: 0.25rem;
        }
    }
</style>

<div class="filter-chips-container">
    <span class="filter-label">
        Quick Filters
        {#if hasActiveFilters()}
            <span class="active-count">{activeFilters.length}</span>
        {/if}
    </span>
    
    <div class="filter-chips-row">
        {#each availableFilters as filter}
            <Button 
                class="filter-chip {filter.active ? 'active' : ''}"
                onclick={() => toggleFilter(filter.id)}
                variant="outlined"
                title="Toggle {filter.label} filter"
            >
                <Label>{filter.label}</Label>
            </Button>
        {/each}
        
        {#if hasActiveFilters()}
            <Button 
                class="clear-filters"
                onclick={clearAllFilters}
                variant="outlined"
                title="Clear all active filters"
            >
                <Label>Clear All</Label>
            </Button>
        {/if}
    </div>
</div>
