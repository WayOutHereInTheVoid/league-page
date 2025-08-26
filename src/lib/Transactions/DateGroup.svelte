<script>
    import { slide } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';
    import { createEventDispatcher } from 'svelte';
    
    export let dateKey;
    export let transactionCount;
    export let expanded = true;
    export let showCount = true;
    
    const dispatch = createEventDispatcher();
    
    // Enhanced intelligent date display mapping
    const getRelativeDate = (groupKey) => {
        // Handle intelligent group keys
        const groupLabels = {
            'today': 'Today',
            'yesterday': 'Yesterday',
            'thisWeek': 'This Week',
            'lastWeek': 'Last Week',
            'thisMonth': 'This Month',
            'lastMonth': 'Last Month'
        };
        
        if (groupLabels[groupKey]) {
            return groupLabels[groupKey];
        }
        
        // For month-year keys (like "January 2024"), return as-is
        return groupKey;
    };
    
    // Enhanced date display for intelligent groups
    const getFormattedDate = (groupKey) => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        switch (groupKey) {
            case 'today':
                return today.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                });
            case 'yesterday':
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                return yesterday.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                });
            case 'thisWeek':
                const thisWeekStart = new Date(today);
                thisWeekStart.setDate(today.getDate() - today.getDay());
                const thisWeekEnd = new Date(today);
                return `${thisWeekStart.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                })} - ${thisWeekEnd.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric' 
                })}`;
            case 'lastWeek':
                const lastWeekStart = new Date(today);
                lastWeekStart.setDate(today.getDate() - today.getDay() - 7);
                const lastWeekEnd = new Date(lastWeekStart);
                lastWeekEnd.setDate(lastWeekStart.getDate() + 6);
                return `${lastWeekStart.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                })} - ${lastWeekEnd.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric' 
                })}`;
            case 'thisMonth':
                return now.toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric'
                }) + ' (current)';
            case 'lastMonth':
                const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                return lastMonth.toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric'
                });
            default:
                // For month-year strings, just return a simple format
                return groupKey;
        }
    };
    
    $: relativeDate = getRelativeDate(dateKey);
    $: formattedDate = getFormattedDate(dateKey);
    
    const toggleExpanded = () => {
        expanded = !expanded;
        // Dispatch toggle event with new state
        dispatch('toggle', {
            expanded: expanded,
            groupKey: dateKey
        });
    };
</script>

<style>
    .date-group {
        margin-bottom: 2rem;
    }
    
    .date-header {
        background: var(--transaction-card-header-bg);
        border-radius: 12px 12px 0 0;
        padding: 16px 20px;
        border-bottom: 2px solid var(--transaction-card-border);
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        justify-content: space-between;
        align-items: center;
        user-select: none;
        position: relative;
        overflow: hidden;
    }
    
    .date-header:hover {
        background: var(--headerPrimary);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px var(--transaction-card-shadow);
    }
    
    .date-header.collapsed {
        border-radius: 12px;
        margin-bottom: 1rem;
    }
    
    .date-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }
    
    .relative-date {
        font-size: 1.1rem;
        font-weight: 700;
        color: var(--blueOne);
        letter-spacing: 0.3px;
    }
    
    .full-date {
        font-size: 0.85rem;
        color: var(--g555);
        font-style: italic;
    }
    
    .header-controls {
        display: flex;
        align-items: center;
        gap: 12px;
    }
    
    .transaction-count {
        background: var(--r1);
        color: var(--blueOne);
        padding: 4px 12px;
        border-radius: 16px;
        font-size: 0.8rem;
        font-weight: 600;
        border: 1px solid var(--blueOne);
        opacity: 0.8;
    }
    
    .expand-icon {
        color: var(--blueOne);
        transition: transform 0.3s ease;
        font-size: 1.2rem;
    }
    
    .expand-icon.expanded {
        transform: rotate(180deg);
    }
    
    .date-content {
        border-left: 3px solid var(--transaction-card-border);
        border-right: 1px solid var(--transaction-card-footer-border);
        border-bottom: 1px solid var(--transaction-card-footer-border);
        border-radius: 0 0 12px 12px;
        background: var(--transaction-card-bg);
        overflow: hidden;
    }
    
    .transactions-container {
        padding: 0;
    }
    
    /* Decorative accent line */
    .date-header::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        width: 4px;
        height: 100%;
        background: linear-gradient(180deg, var(--blueOne) 0%, var(--blueTwo) 100%);
    }
    
    /* Mobile responsiveness */
    @media (max-width: 768px) {
        .date-header {
            padding: 12px 16px;
            border-radius: 8px 8px 0 0;
        }
        
        .date-header.collapsed {
            border-radius: 8px;
            margin-bottom: 0.8rem;
        }
        
        .relative-date {
            font-size: 1rem;
        }
        
        .full-date {
            font-size: 0.8rem;
        }
        
        .transaction-count {
            font-size: 0.75rem;
            padding: 3px 8px;
        }
        
        .date-content {
            border-radius: 0 0 8px 8px;
        }
    }
    
    @media (max-width: 480px) {
        .date-header {
            padding: 10px 12px;
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
        }
        
        .header-controls {
            align-self: flex-end;
            gap: 8px;
        }
        
        .relative-date {
            font-size: 0.95rem;
        }
        
        .full-date {
            font-size: 0.75rem;
        }
    }
    
    /* Animation enhancements */
    .date-header {
        position: relative;
    }
    
    .date-header::after {
        content: '';
        position: absolute;
        left: 0;
        bottom: 0;
        width: 0;
        height: 2px;
        background: linear-gradient(90deg, var(--blueOne), var(--blueTwo));
        transition: width 0.3s ease;
    }
    
    .date-header:hover::after {
        width: 100%;
    }
</style>

<div class="date-group">
    <div 
        class="date-header {expanded ? 'expanded' : 'collapsed'}" 
        onclick={toggleExpanded}
        role="button"
        tabindex="0"
        aria-expanded={expanded}
        aria-controls="date-content-{dateKey}"
        onkeydown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleExpanded();
            }
        }}
    >
        <div class="date-info">
            <div class="relative-date">{relativeDate}</div>
            <div class="full-date">{formattedDate}</div>
        </div>
        
        <div class="header-controls">
            {#if showCount}
                <div class="transaction-count">
                    {transactionCount} {transactionCount === 1 ? 'transaction' : 'transactions'}
                </div>
            {/if}
            <i class="expand-icon material-icons {expanded ? 'expanded' : ''}" aria-hidden="true">
                expand_more
            </i>
        </div>
    </div>
    
    {#if expanded}
        <div 
            class="date-content" 
            id="date-content-{dateKey}"
            transition:slide={{ duration: 400, easing: quintOut }}
        >
            <div class="transactions-container">
                <slot />
            </div>
        </div>
    {/if}
</div>
