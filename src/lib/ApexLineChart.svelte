<script>
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';

    // Dynamic import for chart library - only in browser
    let chartModule;
    
    export let data = [];
    export let title = '';
    export let height = 280;
    export let chartType = 'line'; // 'line', 'area', or 'spline'
    export let color = '#4CAF50';
    export let showDataLabels = false;
    export let showArea = false;

    let chartElement;
    let chartConfig = {};
    let isChartReady = false;

    // Process data for ApexCharts format
    $: processedData = data.map(item => ({
        x: item.label || item.x || item.year,
        y: item.y
    }));

    // Dynamic chart configuration
    $: {
        if (processedData.length > 0 && browser && isChartReady) {
            updateChart();
        }
    }

    function updateChart() {
        if (!browser || !chartModule) return;
        
        // Enhanced chart configuration for trends
        chartConfig = {
            chart: {
                type: showArea ? 'area' : 'line',
                height: height,
                toolbar: {
                    show: false
                },
                background: 'transparent',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                animations: {
                    enabled: true,
                    easing: 'easeinout',
                    speed: 1200,
                    animateGradually: {
                        enabled: true,
                        delay: 200
                    },
                    dynamicAnimation: {
                        enabled: true,
                        speed: 400
                    }
                },
                zoom: {
                    enabled: false
                }
            },
            series: [{
                name: title,
                data: processedData
            }],
            colors: [color],
            stroke: {
                curve: chartType === 'spline' ? 'smooth' : 'straight',
                width: 3,
                lineCap: 'round'
            },
            fill: showArea ? {
                type: 'gradient',
                gradient: {
                    shade: 'light',
                    type: 'vertical',
                    shadeIntensity: 0.4,
                    gradientToColors: [color],
                    inverseColors: false,
                    opacityFrom: 0.6,
                    opacityTo: 0.1,
                    stops: [0, 100]
                }
            } : {
                type: 'solid'
            },
            markers: {
                size: 5,
                colors: [color],
                strokeColors: '#fff',
                strokeWidth: 2,
                hover: {
                    size: 7,
                    sizeOffset: 2
                }
            },
            dataLabels: {
                enabled: showDataLabels,
                offsetY: -10,
                style: {
                    fontSize: '11px',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: '600',
                    colors: ['var(--g333)']
                },
                formatter: function (val) {
                    if (title.includes('Points')) {
                        return Math.round(val).toLocaleString();
                    }
                    return val;
                }
            },
            xaxis: {
                type: 'category',
                categories: processedData.map(item => item.x),
                labels: {
                    style: {
                        colors: 'var(--g555)',
                        fontSize: '11px',
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: '500'
                    }
                },
                axisBorder: {
                    show: false
                },
                axisTicks: {
                    show: false
                },
                tooltip: {
                    enabled: false
                }
            },
            yaxis: {
                labels: {
                    style: {
                        colors: 'var(--g555)',
                        fontSize: '11px',
                        fontFamily: 'Inter, sans-serif'
                    },
                    formatter: function (val) {
                        if (title.includes('Points')) {
                            return Math.round(val).toLocaleString();
                        }
                        return Math.round(val);
                    }
                },
                axisBorder: {
                    show: false
                },
                axisTicks: {
                    show: false
                }
            },
            grid: {
                show: true,
                borderColor: 'var(--eee)',
                strokeDashArray: 3,
                position: 'back',
                xaxis: {
                    lines: {
                        show: false
                    }
                },
                yaxis: {
                    lines: {
                        show: true
                    }
                },
                padding: {
                    top: 15,
                    right: 20,
                    bottom: 15,
                    left: 15
                }
            },
            tooltip: {
                enabled: true,
                theme: 'dark',
                style: {
                    fontSize: '13px',
                    fontFamily: 'Inter, sans-serif'
                },
                x: {
                    show: true,
                    format: 'yyyy'
                },
                y: {
                    formatter: function (val, { series, seriesIndex, dataPointIndex, w }) {
                        if (title.includes('Points')) {
                            return Math.round(val).toLocaleString() + ' points';
                        } else if (title.includes('Wins')) {
                            const losses = Math.max(0, 14 - val); // Assuming 14 game season
                            return val + ' wins' + (losses > 0 ? ', ' + losses + ' losses' : '');
                        } else if (title.includes('Efficiency')) {
                            return val + '% efficiency';
                        }
                        return val;
                    }
                },
                marker: {
                    show: true
                },
                custom: function({ series, seriesIndex, dataPointIndex, w }) {
                    const value = series[seriesIndex][dataPointIndex];
                    const season = processedData[dataPointIndex]?.x;
                    
                    if (title.includes('Points')) {
                        return `
                            <div class="apex-tooltip">
                                <div class="tooltip-title">${season} Season</div>
                                <div class="tooltip-value">${Math.round(value).toLocaleString()} Total Points</div>
                                <div class="tooltip-sub">Avg: ${Math.round(value/14).toLocaleString()} per game</div>
                            </div>
                        `;
                    } else if (title.includes('Wins')) {
                        const losses = Math.max(0, 14 - value);
                        const winPct = ((value / (value + losses)) * 100).toFixed(1);
                        return `
                            <div class="apex-tooltip">
                                <div class="tooltip-title">${season} Season</div>
                                <div class="tooltip-value">${value}-${losses} Record</div>
                                <div class="tooltip-sub">${winPct}% Win Rate</div>
                            </div>
                        `;
                    } else if (title.includes('Efficiency')) {
                        return `
                            <div class="apex-tooltip">
                                <div class="tooltip-title">${season} Season</div>
                                <div class="tooltip-value">${value}% Efficiency</div>
                                <div class="tooltip-sub">Lineup optimization score</div>
                            </div>
                        `;
                    }
                    
                    return `
                        <div class="apex-tooltip">
                            <div class="tooltip-title">${season}</div>
                            <div class="tooltip-value">${value}</div>
                        </div>
                    `;
                }
            },
            responsive: [
                {
                    breakpoint: 768,
                    options: {
                        stroke: {
                            width: 2
                        },
                        markers: {
                            size: 4
                        },
                        xaxis: {
                            labels: {
                                style: {
                                    fontSize: '10px'
                                }
                            }
                        },
                        yaxis: {
                            labels: {
                                style: {
                                    fontSize: '10px'
                                }
                            }
                        }
                    }
                },
                {
                    breakpoint: 480,
                    options: {
                        stroke: {
                            width: 2
                        },
                        markers: {
                            size: 3
                        },
                        dataLabels: {
                            enabled: false
                        }
                    }
                }
            ]
        };
    }

    // Initialize chart on mount - only in browser
    onMount(async () => {
        if (browser) {
            try {
                // Dynamic import of svelte-apexcharts
                chartModule = await import('svelte-apexcharts');
                isChartReady = true;
                
                if (processedData.length > 0) {
                    updateChart();
                }
            } catch (error) {
                console.warn('Failed to load ApexCharts:', error);
            }
        }
    });
</script>

<style>
    .chart-container {
        position: relative;
        background: linear-gradient(135deg, var(--fff) 0%, var(--f8f9fa) 100%);
        border-radius: 12px;
        padding: 1rem;
        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        border: 1px solid var(--eee);
        margin: 0.5rem 0;
        transition: all 0.3s ease;
        overflow: hidden;
    }

    .chart-container:hover {
        box-shadow: 0 6px 20px rgba(0,0,0,0.12);
        transform: translateY(-2px);
    }

    .chart-title {
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--g333);
        margin-bottom: 0.8rem;
        text-align: center;
        letter-spacing: 0.3px;
    }

    .chart-wrapper {
        position: relative;
        width: 100%;
        height: 100%;
    }

    .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: var(--g666);
        font-style: italic;
        background: var(--f8f9fa);
        border-radius: 8px;
        border: 2px dashed var(--ddd);
        padding: 2rem;
    }

    .loading-spinner {
        width: 24px;
        height: 24px;
        border: 2px solid var(--eee);
        border-top: 2px solid var(--blueOne);
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 1rem;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    /* Global tooltip styles */
    :global(.apex-tooltip) {
        background: rgba(26, 26, 26, 0.95) !important;
        border-radius: 8px !important;
        padding: 12px !important;
        box-shadow: 0 8px 25px rgba(0,0,0,0.3) !important;
        border: 1px solid rgba(255,255,255,0.1) !important;
    }

    :global(.tooltip-title) {
        color: #ffffff !important;
        font-weight: 600 !important;
        font-size: 13px !important;
        margin-bottom: 6px !important;
        text-align: center !important;
    }

    :global(.tooltip-value) {
        color: #4CAF50 !important;
        font-weight: 700 !important;
        font-size: 15px !important;
        margin-bottom: 4px !important;
        text-align: center !important;
    }

    :global(.tooltip-sub) {
        color: rgba(255,255,255,0.8) !important;
        font-size: 11px !important;
        text-align: center !important;
        font-style: italic !important;
    }

    /* Responsive design */
    @media (max-width: 768px) {
        .chart-container {
            padding: 0.8rem;
            margin: 0.3rem 0;
        }
        
        .chart-title {
            font-size: 1rem;
            margin-bottom: 0.6rem;
        }
    }

    @media (max-width: 480px) {
        .chart-container {
            padding: 0.6rem;
            border-radius: 8px;
        }
        
        .chart-title {
            font-size: 0.9rem;
            margin-bottom: 0.5rem;
        }
    }

    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
        .chart-container {
            background: linear-gradient(135deg, var(--fff) 0%, var(--f8f8f8) 100%);
            border-color: var(--eee);
        }
        
        .chart-title {
            color: var(--g111);
        }
    }
</style>

<div class="chart-container">
    {#if title}
        <div class="chart-title">{title}</div>
    {/if}
    
    <div class="chart-wrapper">
        {#if !browser}
            <!-- SSR fallback -->
            <div class="loading-container" style="height: {height}px;">
                📊 Chart loading...
            </div>
        {:else if !isChartReady}
            <!-- Loading state -->
            <div class="loading-container" style="height: {height}px;">
                <div class="loading-spinner"></div>
                Loading chart library...
            </div>
        {:else if processedData.length > 0 && chartModule}
            <!-- Chart component with dynamic import -->
            <div bind:this={chartElement} use:chartModule.chart={chartConfig}></div>
        {:else}
            <div class="loading-container" style="height: {height}px;">
                📊 No data available for visualization
            </div>
        {/if}
    </div>
</div>