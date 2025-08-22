<script>
    let { 
        text = '',
        position = 'top', // top, bottom, left, right
        delay = 500,
        maxWidth = '250px',
        showOnHover = true,
        showOnFocus = true,
        disabled = false
    } = $props();
    
    let showTooltip = $state(false);
    let tooltipTimeout;
    let tooltipElement;
    let triggerElement;
    
    const showTooltipDelayed = () => {
        if (disabled || !text) return;
        
        clearTimeout(tooltipTimeout);
        tooltipTimeout = setTimeout(() => {
            showTooltip = true;
        }, delay);
    };
    
    const hideTooltip = () => {
        clearTimeout(tooltipTimeout);
        showTooltip = false;
    };
    
    const handleMouseEnter = () => {
        if (showOnHover) {
            showTooltipDelayed();
        }
    };
    
    const handleMouseLeave = () => {
        if (showOnHover) {
            hideTooltip();
        }
    };
    
    const handleFocus = () => {
        if (showOnFocus) {
            showTooltipDelayed();
        }
    };
    
    const handleBlur = () => {
        if (showOnFocus) {
            hideTooltip();
        }
    };
    
    const handleKeyDown = (event) => {
        if (event.key === 'Escape') {
            hideTooltip();
        }
    };
</script>

<style>
    .tooltip-container {
        position: relative;
        display: inline-block;
    }
    
    .tooltip {
        position: absolute;
        z-index: 1000;
        background-color: var(--g333);
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 0.85em;
        line-height: 1.3;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        pointer-events: none;
        white-space: normal;
        word-wrap: break-word;
        opacity: 0;
        transform: scale(0.8);
        transition: opacity 0.2s ease-out, transform 0.2s ease-out;
    }
    
    .tooltip.visible {
        opacity: 1;
        transform: scale(1);
    }
    
    .tooltip::before {
        content: '';
        position: absolute;
        width: 0;
        height: 0;
        border-style: solid;
    }
    
    /* Position variants */
    .tooltip.top {
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%) scale(0.8);
        margin-bottom: 8px;
    }
    
    .tooltip.top.visible {
        transform: translateX(-50%) scale(1);
    }
    
    .tooltip.top::before {
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border-width: 6px 6px 0 6px;
        border-color: var(--g333) transparent transparent transparent;
    }
    
    .tooltip.bottom {
        top: 100%;
        left: 50%;
        transform: translateX(-50%) scale(0.8);
        margin-top: 8px;
    }
    
    .tooltip.bottom.visible {
        transform: translateX(-50%) scale(1);
    }
    
    .tooltip.bottom::before {
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        border-width: 0 6px 6px 6px;
        border-color: transparent transparent var(--g333) transparent;
    }
    
    .tooltip.left {
        right: 100%;
        top: 50%;
        transform: translateY(-50%) scale(0.8);
        margin-right: 8px;
    }
    
    .tooltip.left.visible {
        transform: translateY(-50%) scale(1);
    }
    
    .tooltip.left::before {
        left: 100%;
        top: 50%;
        transform: translateY(-50%);
        border-width: 6px 0 6px 6px;
        border-color: transparent transparent transparent var(--g333);
    }
    
    .tooltip.right {
        left: 100%;
        top: 50%;
        transform: translateY(-50%) scale(0.8);
        margin-left: 8px;
    }
    
    .tooltip.right.visible {
        transform: translateY(-50%) scale(1);
    }
    
    .tooltip.right::before {
        right: 100%;
        top: 50%;
        transform: translateY(-50%);
        border-width: 6px 6px 6px 0;
        border-color: transparent var(--g333) transparent transparent;
    }
    
    /* Responsive adjustments */
    @media (max-width: 768px) {
        .tooltip {
            font-size: 0.8em;
            padding: 6px 10px;
            max-width: 200px;
        }
        
        .tooltip::before {
            border-width: 5px;
        }
        
        .tooltip.top::before {
            border-width: 5px 5px 0 5px;
        }
        
        .tooltip.bottom::before {
            border-width: 0 5px 5px 5px;
        }
        
        .tooltip.left::before {
            border-width: 5px 0 5px 5px;
        }
        
        .tooltip.right::before {
            border-width: 5px 5px 5px 0;
        }
    }
    
    /* Edge detection and repositioning */
    @media (max-width: 480px) {
        .tooltip.left,
        .tooltip.right {
            /* Force top positioning on small screens to avoid edge issues */
            position: absolute;
            bottom: 100%;
            left: 50%;
            right: auto;
            top: auto;
            transform: translateX(-50%) scale(0.8);
            margin: 0 0 8px 0;
        }
        
        .tooltip.left.visible,
        .tooltip.right.visible {
            transform: translateX(-50%) scale(1);
        }
        
        .tooltip.left::before,
        .tooltip.right::before {
            top: 100%;
            left: 50%;
            right: auto;
            transform: translateX(-50%);
            border-width: 0 5px 5px 5px;
            border-color: transparent transparent var(--g333) transparent;
        }
    }
    
    .trigger {
        cursor: help;
        position: relative;
    }
    
    .help-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background-color: var(--blueOne);
        color: white;
        font-size: 0.7em;
        font-weight: 600;
        margin-left: 4px;
        cursor: help;
    }
    
    @media (max-width: 768px) {
        .help-icon {
            width: 14px;
            height: 14px;
            font-size: 0.65em;
        }
    }
</style>

<svelte:window onkeydown={handleKeyDown} />

<div class="tooltip-container">
    <div 
        class="trigger"
        bind:this={triggerElement}
        onmouseenter={handleMouseEnter}
        onmouseleave={handleMouseLeave}
        onfocus={handleFocus}
        onblur={handleBlur}
        tabindex="0"
        role="button"
        aria-describedby={showTooltip ? 'tooltip-text' : undefined}
    >
        <!-- Always show help icon since this component is used without children -->
        <span class="help-icon">?</span>
    </div>
    
    {#if showTooltip && text}
        <div 
            bind:this={tooltipElement}
            class="tooltip {position} {showTooltip ? 'visible' : ''}"
            style="max-width: {maxWidth};"
            id="tooltip-text"
            role="tooltip"
        >
            {text}
        </div>
    {/if}
</div>
