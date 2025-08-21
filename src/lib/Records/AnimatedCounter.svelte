<script>
    import { onMount } from 'svelte';
    
    // Props
    export let value = 0;
    export let duration = 1200; // Animation duration in ms
    export let format = 'number'; // 'number', 'decimal', 'percentage'
    export let decimals = 1;
    
    // Internal state
    let displayValue = 0;
    let animationId = null;
    
    const formatValue = (val) => {
        switch (format) {
            case 'decimal':
                return val.toFixed(decimals);
            case 'percentage':
                return `${val.toFixed(1)}%`;
            default:
                return Math.round(val).toLocaleString();
        }
    };
    
    const animateCounter = () => {
        if (value === 0) {
            displayValue = 0;
            return;
        }
        
        const startTime = Date.now();
        const startValue = displayValue;
        const targetValue = value;
        const valueChange = targetValue - startValue;
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease-out cubic)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            
            displayValue = startValue + (valueChange * easeOut);
            
            if (progress < 1) {
                animationId = requestAnimationFrame(animate);
            } else {
                displayValue = targetValue;
            }
        };
        
        animationId = requestAnimationFrame(animate);
    };
    
    // Start animation when component mounts
    onMount(() => {
        // Small delay to allow for page rendering
        setTimeout(animateCounter, 150);
        
        return () => {
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
        };
    });
    
    // Restart animation if value changes
    $: if (value !== undefined) {
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
        animateCounter();
    }
</script>

<style>
    .counter {
        font-feature-settings: 'tnum';
        font-variant-numeric: tabular-nums;
        transition: color 0.2s ease-out;
    }
</style>

<span class="counter">
    {formatValue(displayValue)}
</span>
