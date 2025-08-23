<script>
    import Button, { Group, Label } from '@smui/button';

    // Props Interface (as specified in roadmap)
    export let podiums = [];           // Array of podium objects
    export let selectedYearIndex = 0;  // Currently selected year index
    export let onYearChange;           // Callback function

    // Extract years from podiums data and maintain correct indexing after sort
    $: years = podiums
        .map((podium, originalIndex) => ({
            year: podium.year,
            originalIndex: originalIndex
        }))
        .sort((a, b) => b.year - a.year); // Sort newest to oldest

    // Handle year selection
    const handleYearSelect = (originalIndex) => {
        if (onYearChange && typeof onYearChange === 'function') {
            onYearChange(originalIndex);
        }
    };

    // Keyboard navigation support (arrow keys)
    const handleKeydown = (event, originalIndex) => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            event.preventDefault();
            const currentIndex = years.findIndex(y => y.originalIndex === selectedYearIndex);
            let newIndex;
            
            if (event.key === 'ArrowLeft') {
                newIndex = currentIndex > 0 ? currentIndex - 1 : years.length - 1;
            } else {
                newIndex = currentIndex < years.length - 1 ? currentIndex + 1 : 0;
            }
            
            handleYearSelect(years[newIndex].originalIndex);
        }
    };
</script>

<style>
    /* Follow existing project patterns - Button Styling */
    .year-navigator {
        text-align: center;
        margin: 20px 0;
        width: 100%;
    }

    /* Touch-friendly sizing (44px min height) - Mobile-first responsive design */
    :global(.year-navigator .year-button) {
        min-height: 44px;
        min-width: 80px;
        margin: 4px;
        transition: all 0.2s ease-in-out; /* Smooth hover transitions */
    }

    /* Smooth hover transitions (following project patterns) */
    :global(.year-navigator .year-button:hover) {
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }

    /* Active/inactive button states (raised/outlined) */
    :global(.year-navigator .year-button.active) {
        background-color: var(--primary);
        color: white;
    }

    /* Mobile-first responsive design */
    @media (max-width: 768px) {
        .year-navigator {
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            padding: 0 1rem;
            -webkit-overflow-scrolling: touch;
        }
        
        :global(.year-navigator .mdc-button__group) {
            display: flex;
            flex-wrap: nowrap;
            min-width: max-content;
        }
        
        :global(.year-navigator .year-button) {
            scroll-snap-align: center;
            flex-shrink: 0;
            margin: 0 4px;
        }
    }

    /* Desktop: Standard button group */
    @media (min-width: 769px) {
        :global(.year-navigator .mdc-button__group) {
            justify-content: center;
            flex-wrap: wrap;
        }
    }

    /* Responsive button sizing - following project patterns */
    @media (max-width: 540px) {
        :global(.year-navigator .year-button) {
            font-size: 0.9em;
            min-width: 70px;
        }
    }

    @media (max-width: 415px) {
        :global(.year-navigator .year-button) {
            font-size: 0.8em;
            padding: 0 12px;
            min-width: 60px;
        }
    }

    @media (max-width: 315px) {
        :global(.year-navigator .year-button) {
            font-size: 0.75em;
            padding: 0 8px;
            min-width: 50px;
        }
    }
</style>

<div class="year-navigator">
    {#if years.length > 0}
        <Group variant="outlined">
            {#each years as {year, originalIndex}, ix}
                <Button 
                    class="year-button {selectedYearIndex === originalIndex ? 'active' : ''}" 
                    onclick={() => handleYearSelect(originalIndex)} 
                    onkeydown={(e) => handleKeydown(e, originalIndex)}
                    variant="{selectedYearIndex === originalIndex ? 'raised' : 'outlined'}"
                    tabindex="0"
                    role="tab"
                    aria-selected="{selectedYearIndex === originalIndex}"
                    aria-label="Select {year} season"
                >
                    <Label>{year}</Label>
                </Button>
            {/each}
        </Group>
    {:else}
        <p>No seasons available</p>
    {/if}
</div>
