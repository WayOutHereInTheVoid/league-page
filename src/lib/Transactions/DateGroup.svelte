<script>
    import { slide } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';
    
    export let dateKey;
    export let displayDate;
    export let transactionCount;
    export let expanded = true;
    export let showCount = true;
    
    // Calculate relative date display
    const getRelativeDate = (dateKey) => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        
        // Normalize dates to compare only the date part
        const normalizeDate = (date) => {
            const normalized = new Date(date);
            normalized.setHours(0, 0, 0, 0);
            return normalized;
        };
        
        const targetDate = normalizeDate(new Date(dateKey));
        const todayNormalized = normalizeDate(today);
        const yesterdayNormalized = normalizeDate(yesterday);
        
        if (targetDate.getTime() === todayNormalized.getTime()) {
            return 'Today';
        } else if (targetDate.getTime() === yesterdayNormalized.getTime()) {
            return 'Yesterday';
        } else if (targetDate >= normalizeDate(weekAgo)) {
            return 'This Week';
        } else if (targetDate >= normalizeDate(monthAgo)) {
            return 'This Month';
        } else {
            // Format as "Month Year" for older dates
            return targetDate.toLocaleDateString('en-US', { 
                month: 'long', 
                year: 'numeric' 
            });
        }
    };
    
    $: relativeDate = getRelativeDate(dateKey);
    $: formattedDate = new Date(dateKey).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
    
    const toggleExpanded = () => {
        expanded = !expanded;
    };
</script>

<style>
    .date-group {
        margin-bottom: 2rem;
    }
    
    .date-header {
        background: linear-gradient(135deg, #F1F8E9 0%, #E8F5E8 100%);
        border-radius: 12px 12px 0 0;
        padding: 16px 20px;
        border-bottom: 2px solid #E8F5E8;
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
        background: linear-gradient(135deg, #E8F5E8 0%, #DCEDC8 100%);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(46, 125, 50, 0.1);
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
        color: #2E7D32;
        letter-spacing: 0.3px;
    }
    
    .full-date {
        font-size: 0.85rem;
        color: #666;
        font-style: italic;
    }
    
    .header-controls {
        display: flex;
        align-items: center;
        gap: 12px;
    }
    
    .transaction-count {
        background: rgba(46, 125, 50, 0.1);
        color: #2E7D32;
        padding: 4px 12px;
        border-radius: 16px;
        font-size: 0.8rem;
        font-weight: 600;
        border: 1px solid rgba(46, 125, 50, 0.2);
    }
    
    .expand-icon {
        color: #2E7D32;
        transition: transform 0.3s ease;
        font-size: 1.2rem;
    }
    
    .expand-icon.expanded {
        transform: rotate(180deg);
    }
    
    .date-content {
        border-left: 3px solid #E8F5E8;
        border-right: 1px solid #F0F0F0;
        border-bottom: 1px solid #F0F0F0;
        border-radius: 0 0 12px 12px;
        background: white;
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
        background: linear-gradient(180deg, #2E7D32 0%, #7CB342 100%);
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
        background: linear-gradient(90deg, #2E7D32, #7CB342);
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
