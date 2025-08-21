<script>
    import { createEventDispatcher } from 'svelte';
    
    const dispatch = createEventDispatcher();
    
    let { 
        columnId,
        sortConfig = { column: null, direction: 'asc' },
        sortable = true,
        headerText = ''
    } = $props();
    
    const handleSort = () => {
        if (!sortable) return;
        
        let newDirection = 'asc';
        
        if (sortConfig.column === columnId) {
            // Toggle direction if same column
            newDirection = sortConfig.direction === 'asc' ? 'desc' : 'asc';
        }
        
        dispatch('sort', {
            column: columnId,
            direction: newDirection
        });
    };
    
    let isActive = $derived(() => sortConfig.column === columnId);
    let sortDirection = $derived(() => isActive() ? sortConfig.direction : null);
</script>

<style>
    .sortable-header {
        cursor: pointer;
        user-select: none;
        display: flex;
        align-items: center;
        gap: 0.25rem;
        padding: 4px 0;
        border-radius: 4px;
        transition: all 0.2s ease-out;
        position: relative;
        min-height: 32px;
    }
    
    .sortable-header:hover {
        background-color: rgba(46, 125, 50, 0.08);
        color: var(--blueOne);
        transform: translateY(-1px);
    }
    
    .sortable-header.active {
        color: var(--blueOne);
        font-weight: 600;
    }
    
    .header-text {
        flex: 1;
        min-width: 0;
    }
    
    .sort-indicator {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 12px;
        height: 16px;
        margin-left: 4px;
        position: relative;
    }
    
    .sort-arrow {
        width: 0;
        height: 0;
        transition: all 0.2s ease-out;
        position: absolute;
    }
    
    .sort-arrow.up {
        border-left: 4px solid transparent;
        border-right: 4px solid transparent;
        border-bottom: 5px solid currentColor;
        top: 1px;
    }
    
    .sort-arrow.down {
        border-left: 4px solid transparent;
        border-right: 4px solid transparent;
        border-top: 5px solid currentColor;
        bottom: 1px;
    }
    
    /* Default state - both arrows visible but muted */
    .sortable-header:not(.active) .sort-arrow {
        color: var(--ccc);
        opacity: 0.5;
    }
    
    .sortable-header:not(.active):hover .sort-arrow {
        color: var(--blueOne);
        opacity: 0.7;
    }
    
    /* Active state - show only the active direction */
    .sortable-header.active .sort-arrow.up {
        color: var(--blueOne);
        opacity: 1;
        display: block;
    }
    
    .sortable-header.active .sort-arrow.down {
        color: var(--blueOne);
        opacity: 1;
        display: block;
    }
    
    /* Hide inactive arrow when sorting */
    .sortable-header.active.asc .sort-arrow.down {
        opacity: 0.3;
    }
    
    .sortable-header.active.desc .sort-arrow.up {
        opacity: 0.3;
    }
    
    .not-sortable {
        cursor: default;
        color: var(--g555);
    }
    
    .sort-priority {
        position: absolute;
        top: -4px;
        right: -4px;
        background-color: var(--blueOne);
        color: white;
        border-radius: 50%;
        width: 12px;
        height: 12px;
        font-size: 0.6em;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
    }
    
    @media (max-width: 768px) {
        .sortable-header {
            min-height: 28px;
            font-size: 0.9em;
        }
        
        .sort-indicator {
            width: 10px;
            height: 14px;
        }
        
        .sort-arrow.up {
            border-left-width: 3px;
            border-right-width: 3px;
            border-bottom-width: 4px;
        }
        
        .sort-arrow.down {
            border-left-width: 3px;
            border-right-width: 3px;
            border-top-width: 4px;
        }
        
        .sort-priority {
            width: 10px;
            height: 10px;
            font-size: 0.55em;
        }
    }
</style>

<div 
    class="sortable-header {isActive() ? 'active' : ''} {sortDirection() || ''} {!sortable ? 'not-sortable' : ''}"
    onclick={handleSort}
    role={sortable ? 'button' : 'text'}
    tabindex={sortable ? 0 : -1}
    title={sortable ? `Sort by ${headerText}` : ''}
>
    <span class="header-text">{headerText}</span>
    
    {#if sortable}
        <div class="sort-indicator">
            <div class="sort-arrow up"></div>
            <div class="sort-arrow down"></div>
        </div>
    {/if}
</div>
