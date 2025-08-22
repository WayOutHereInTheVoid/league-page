<script>
    import { createEventDispatcher } from 'svelte';
    import { Row, Cell } from '@smui/data-table';
    import IconButton from '@smui/icon-button';
    
    const dispatch = createEventDispatcher();
    
    let { 
        expanded = false,
        record,
        leagueTeamManagers,
        year,
        allTime = false,
        expandedContent = null,
        children // In Svelte 5, children are passed as a snippet
    } = $props();
    
    const toggleExpansion = () => {
        expanded = !expanded;
        dispatch('toggle', { expanded, record });
    };
    
    // Animation classes for smooth expand/collapse
    let expansionClass = $derived(() => expanded ? 'expanded' : 'collapsed');
</script>

<style>
    .expansion-toggle {
        transition: transform 0.2s ease-out;
        cursor: pointer;
    }
    
    .expansion-toggle.expanded {
        transform: rotate(90deg);
    }
    
    .expanded-content {
        background-color: var(--r1);
        border-left: 3px solid var(--blueOne);
        margin: 0;
        overflow: hidden;
        transition: all 0.3s ease-out;
    }
    
    .expanded-content.expanded {
        max-height: 200px;
        opacity: 1;
        padding: 1rem;
    }
    
    .expanded-content.collapsed {
        max-height: 0;
        opacity: 0;
        padding: 0 1rem;
    }
    
    .detail-item {
        margin: 0.5rem 0;
        font-size: 0.9em;
        color: var(--g555);
    }
    
    .detail-label {
        font-weight: 600;
        color: var(--blueOne);
    }
    
    .detail-value {
        margin-left: 0.5rem;
    }
    
    .expansion-button {
        width: 32px !important;
        height: 32px !important;
        color: var(--blueOne) !important;
    }
    
    @media (max-width: 768px) {
        .expanded-content.expanded {
            padding: 0.75rem;
            font-size: 0.85em;
        }
        
        .expansion-button {
            width: 28px !important;
            height: 28px !important;
        }
    }
</style>

<Row>
    <Cell class="expansion-cell">
        <IconButton 
            class="expansion-button {expansionClass()}" 
            onclick={toggleExpansion}
            title={expanded ? 'Collapse details' : 'Expand details'}
        >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" />
            </svg>
        </IconButton>
    </Cell>
    
    {#if children}
        {@render children()}
    {/if}
</Row>

{#if expanded && expandedContent}
    <Row>
        <Cell colspan="100%">
            <div class="expanded-content {expansionClass()}">
                {#if expandedContent.additionalStats}
                    <div class="detail-item">
                        <span class="detail-label">Additional Statistics:</span>
                    </div>
                    
                    {#each Object.entries(expandedContent.additionalStats) as [key, value]}
                        <div class="detail-item">
                            <span class="detail-label">{key}:</span>
                            <span class="detail-value">{value}</span>
                        </div>
                    {/each}
                {/if}
                
                {#if expandedContent.breakdown}
                    <div class="detail-item">
                        <span class="detail-label">Breakdown:</span>
                        <span class="detail-value">{expandedContent.breakdown}</span>
                    </div>
                {/if}
                
                {#if expandedContent.historicalComparison}
                    <div class="detail-item">
                        <span class="detail-label">Historical Context:</span>
                        <span class="detail-value">{expandedContent.historicalComparison}</span>
                    </div>
                {/if}
            </div>
        </Cell>
    </Row>
{/if}
