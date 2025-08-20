<script>
    // Props
    let { 
        rarity = 'common',
        size = 'medium',
        showLabel = false,
        animated = false
    } = $props();

    // Badge configuration based on rarity
    const rarityConfig = {
        legendary: {
            color: '#FFD700',
            background: 'linear-gradient(135deg, #FFD700 0%, #FFA000 100%)',
            icon: '👑',
            label: 'Legendary',
            glow: 'rgba(255, 215, 0, 0.4)',
            textColor: '#8B4513'
        },
        rare: {
            color: '#9B59B6',
            background: 'linear-gradient(135deg, #9B59B6 0%, #8E44AD 100%)',
            icon: '💎',
            label: 'Rare',
            glow: 'rgba(155, 89, 182, 0.4)',
            textColor: '#FFFFFF'
        },
        notable: {
            color: '#3498DB',
            background: 'linear-gradient(135deg, #3498DB 0%, #2980B9 100%)',
            icon: '⭐',
            label: 'Notable',
            glow: 'rgba(52, 152, 219, 0.4)',
            textColor: '#FFFFFF'
        },
        common: {
            color: '#95A5A6',
            background: 'linear-gradient(135deg, #95A5A6 0%, #7F8C8D 100%)',
            icon: '🏆',
            label: 'Achievement',
            glow: 'rgba(149, 165, 166, 0.4)',
            textColor: '#FFFFFF'
        }
    };

    // Size configuration
    const sizeConfig = {
        tiny: {
            badgeSize: '16px',
            iconSize: '8px',
            fontSize: '6px',
            labelFontSize: '0.6rem',
            padding: '2px'
        },
        small: {
            badgeSize: '24px',
            iconSize: '12px',
            fontSize: '10px',
            labelFontSize: '0.75rem',
            padding: '4px'
        },
        medium: {
            badgeSize: '32px',
            iconSize: '16px',
            fontSize: '14px',
            labelFontSize: '0.875rem',
            padding: '6px'
        },
        large: {
            badgeSize: '48px',
            iconSize: '24px',
            fontSize: '20px',
            labelFontSize: '1rem',
            padding: '8px'
        },
        xlarge: {
            badgeSize: '64px',
            iconSize: '32px',
            fontSize: '28px',
            labelFontSize: '1.25rem',
            padding: '12px'
        }
    };

    // Get current configuration
    $derived: config = rarityConfig[rarity] || rarityConfig.common;
    $derived: sizing = sizeConfig[size] || sizeConfig.medium;
</script>

<style>
    .achievement-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        position: relative;
    }

    .badge-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        font-weight: bold;
        text-align: center;
        line-height: 1;
        border: 2px solid rgba(255, 255, 255, 0.3);
        box-shadow: 
            0 2px 8px rgba(0, 0, 0, 0.2),
            inset 0 1px 2px rgba(255, 255, 255, 0.3);
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
    }

    .badge-icon.animated {
        animation: pulse 2s infinite;
    }

    .badge-icon.legendary {
        animation: legendary-glow 3s ease-in-out infinite;
    }

    .badge-icon::before {
        content: '';
        position: absolute;
        top: -2px;
        left: -2px;
        right: -2px;
        bottom: -2px;
        border-radius: 50%;
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
    }

    .badge-icon:hover::before {
        opacity: 1;
    }

    .badge-icon.legendary::before {
        box-shadow: 0 0 20px var(--glow-color);
    }

    .badge-icon.rare::before {
        box-shadow: 0 0 15px var(--glow-color);
    }

    .badge-icon.notable::before {
        box-shadow: 0 0 10px var(--glow-color);
    }

    .badge-label {
        font-weight: 600;
        letter-spacing: 0.5px;
        text-transform: uppercase;
        color: var(--text-color);
        white-space: nowrap;
    }

    /* Animations */
    @keyframes pulse {
        0%, 100% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.05);
        }
    }

    @keyframes legendary-glow {
        0%, 100% {
            box-shadow: 
                0 2px 8px rgba(0, 0, 0, 0.2),
                inset 0 1px 2px rgba(255, 255, 255, 0.3),
                0 0 15px rgba(255, 215, 0, 0.6);
        }
        50% {
            box-shadow: 
                0 2px 8px rgba(0, 0, 0, 0.2),
                inset 0 1px 2px rgba(255, 255, 255, 0.3),
                0 0 25px rgba(255, 215, 0, 0.8);
        }
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
        .achievement-badge {
            gap: 0.25rem;
        }

        .badge-label {
            font-size: 0.75rem;
        }
    }

    /* Accessibility */
    .badge-icon:focus {
        outline: 2px solid var(--blueOne);
        outline-offset: 2px;
    }

    /* Hover effects */
    .badge-icon:hover {
        transform: translateY(-1px);
        box-shadow: 
            0 4px 12px rgba(0, 0, 0, 0.3),
            inset 0 1px 2px rgba(255, 255, 255, 0.3);
    }
</style>

<div 
    class="achievement-badge"
    title="{config.label} Achievement">
    <div 
        class="badge-icon {rarity}"
        class:animated={animated}
        style="
            width: {sizing.badgeSize};
            height: {sizing.badgeSize};
            background: {config.background};
            color: {config.textColor};
            font-size: {sizing.iconSize};
            padding: {sizing.padding};
            --glow-color: {config.glow};
            --text-color: {config.textColor};
        "
        role="img"
        aria-label="{config.label} achievement badge">
        {config.icon}
    </div>
    
    {#if showLabel}
        <span 
            class="badge-label"
            style="
                font-size: {sizing.labelFontSize};
                color: {config.color};
            ">
            {config.label}
        </span>
    {/if}
</div>
