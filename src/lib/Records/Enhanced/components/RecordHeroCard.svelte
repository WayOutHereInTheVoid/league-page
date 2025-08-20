<script>
    // Props
    let { 
        record,
        managerInfo,
        isSelected = false,
        onSelect
    } = $props();

    // Handle card selection
    const handleSelect = () => {
        onSelect?.(record);
    };

    // Format value for display
    const formatValue = (record) => {
        if (!record.value) return '--';
        return record.value.toFixed(1);
    };

    // Get manager name
    const getManagerName = () => {
        return managerInfo?.name || managerInfo?.roster?.name || `Manager ${record.manager || record.rosterID}`;
    };

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };
</script>

<style>
    .record-hero-card {
        background: var(--fff);
        border-radius: 12px;
        border: 2px solid var(--ebebeb);
        padding: 1.5rem;
        cursor: pointer;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }

    .record-hero-card:hover {
        border-color: var(--blueOne);
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(46, 125, 50, 0.15);
    }

    .record-hero-card.selected {
        border-color: var(--blueOne);
        background: var(--r1);
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(46, 125, 50, 0.25);
    }

    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 1rem;
    }

    .record-value {
        font-size: 2.5rem;
        font-weight: 900;
        color: var(--blueOne);
        line-height: 1;
        margin: 0;
    }

    .record-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--g333);
        margin: 0.5rem 0;
        line-height: 1.2;
    }

    .record-description {
        font-size: 0.875rem;
        color: var(--g555);
        line-height: 1.4;
        margin: 0.75rem 0;
        font-style: italic;
    }

    .record-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid var(--f3f3f3);
    }

    .manager-info {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .manager-name {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--g333);
    }

    .record-date {
        font-size: 0.75rem;
        color: var(--g555);
    }

    .impact-score {
        text-align: right;
    }

    .impact-label {
        font-size: 0.75rem;
        color: var(--g555);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin: 0;
    }

    .impact-value {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--blueTwo);
        margin: 0;
    }

    /* Card background pattern */
    .record-hero-card::before {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        width: 100px;
        height: 100px;
        background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M20 20h60v60H20z' fill='none' stroke='%232E7D32' stroke-width='0.5' opacity='0.05'/%3E%3C/svg%3E");
        background-size: 20px 20px;
        pointer-events: none;
    }

    /* Mobile responsiveness */
    @media (max-width: 768px) {
        .record-hero-card {
            padding: 1rem;
        }

        .record-value {
            font-size: 2rem;
        }

        .record-title {
            font-size: 1.1rem;
        }

        .record-meta {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
        }

        .impact-score {
            text-align: left;
        }
    }
</style>

<div 
    class="record-hero-card"
    class:selected={isSelected}
    onclick={handleSelect}
    role="button"
    tabindex="0"
    title="Click to explore this record">
    
    <div class="card-header">
        <div class="record-value">
            {formatValue(record)}
        </div>
        
        <div style="position: relative; z-index: 2;">
            <AchievementBadge 
                rarity={record.rarity}
                size="medium"
                animated={isSelected}
            />
        </div>
    </div>

    <div class="record-title">
        {record.title || 'Achievement Record'}
    </div>

    {#if record.description}
        <div class="record-description">
            "{record.description}"
        </div>
    {/if}

    <div class="record-meta">
        <div class="manager-info">
            <div class="manager-name">
                {getManagerName()}
            </div>
            {#if record.year}
                <div class="record-date">
                    {record.year}
                    {#if record.week}
                        • Week {record.week}
                    {/if}
                </div>
            {/if}
        </div>

        <div class="impact-score">
            <div class="impact-label">Impact</div>
            <div class="impact-value">
                {record.significance || 0}
            </div>
        </div>
    </div>
</div>
