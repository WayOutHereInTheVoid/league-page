<script>
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';

    // Dynamic import for chart library - only in browser
    let chartModule;
    
    export let data = [];
    export let title = '';
    export let height = 280;
    export let primaryLabel = 'Current Season';
    export let secondaryLabel = 'Career Average';

    let chartElement;
    let chartConfig = {};
    let isChartReady = false;

    // Process data for ApexCharts grouped bar format
    $: processedData = {
        categories: data.map(item => item.label),
        primary: data.map(item => item.y),
        secondary: data.map(item => item.secondaryY || 0)
    };

    // Update chart configuration when data changes
    $: {
        if (processedData.categories.length > 0 && browser && isChartReady) {
            updateChart();
        }
    }

    function updateChart() {
        if (!browser || !chartModule) return;
        
        chartConfig = {
            chart: {
                type: 'bar',
                height: height,
                toolbar: {
                    show: false
                },
                background: 'transparent',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                animations: {
                    enabled: true,
                    easing: 'easeinout',
                    speed: 800,
                    animateGradually: {
                        enabled: true,
                        delay: 150
                    },
                    dynamicAnimation: {
                        enabled: true,
                        speed: 350
                    }
                }
            },
            series: [
                {
                    name: primaryLabel,
                    data: processedData.primary
                },
                {
                    name: secondaryLabel,
                    data: processedData.secondary
                }
            ],
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: '55%',
                    endingShape: 'rounded',
                    borderRadius: 4,
                    dataLabels: {
                        position: 'top'
                    }
                }
            },
            colors: ['#4CAF50', '#2196F3'], // Green for current, blue for average
            fill: {
                type: 'gradient',
                gradient: {
                    shade: 'light',
                    type: 'vertical',
                    shadeIntensity: 0.25,
                    gradientToColors: ['#81C784', '#64B5F6'],
                    inverseColors: false,
                    opacityFrom: 0.95,
                    opacityTo: 0.85,
                    stops: [0, 100]
                }
            },
            dataLabels: {
                enabled: true,
                offsetY: -25,
                style: {
                    fontSize: '11px',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: '600',
                    colors: ['var(--g333)']
                },
                formatter: function (val, opts) {
                    // Format based on data type
                    const category = processedData.categories[opts.dataPointIndex];
                    if (category === 'Points') {
                        return Math.round(val).toLocaleString();
                    } else if (category === 'Efficiency') {
                        return val + '%';
                    }
                    return val;
                }
            },
            stroke: {
                show: true,
                width: 1,
                colors: ['transparent']
            },
            xaxis: {
                categories: processedData.categories,
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
                }
            },
            yaxis: {
                labels: {
                    style: {
                        colors: 'var(--g555)',
                        fontSize: '11px',
                        fontFamily: 'Inter, sans-serif'
                    },
                    formatter: function (val, opts) {
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
                    top: 10,
                    right: 15,
                    bottom: 10,
                    left: 15
                }
            },
            legend: {
                show: true,
                position: 'top',
                horizontalAlign: 'center',
                floating: false,
                fontSize: '12px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                labels: {
                    colors: 'var(--g555)'
                },
                markers: {
                    width: 8,
                    height: 8,
                    radius: 2
                },
                itemMargin: {
                    horizontal: 15,
                    vertical: 5
                }
            },
            tooltip: {
                enabled: true,
                theme: 'dark',
                style: {
                    fontSize: '13px',
                    fontFamily: 'Inter, sans-serif'
                },
                y: {
                    formatter: function (val, { series, seriesIndex, dataPointIndex, w }) {
                        const category = processedData.categories[dataPointIndex];
                        const seriesName = w.globals.seriesNames[seriesIndex];
                        
                        if (category === 'Points') {
                            return Math.round(val).toLocaleString() + ' points';
                        } else if (category === 'Efficiency') {
                            return val + '% efficiency';
                        } else {
                            return val + ' wins';
                        }
                    }
                },
                marker: {
                    show: true
                },
                custom: function({ series, seriesIndex, dataPointIndex, w }) {
                    const category = processedData.categories[dataPointIndex];
                    const currentValue = series[0][dataPointIndex];
                    const averageValue = series[1][dataPointIndex];
                    const difference = currentValue - averageValue;
                    const isPositive = difference > 0;
                    
                    let formattedCurrent, formattedAverage, formattedDiff;
                    
                    if (category === 'Points') {
                        formattedCurrent = Math.round(currentValue).toLocaleString();
                        formattedAverage = Math.round(averageValue).toLocaleString();
                        formattedDiff = Math.round(Math.abs(difference)).toLocaleString();
                    } else if (category === 'Efficiency') {
                        formattedCurrent = currentValue + '%';
                        formattedAverage = averageValue + '%';
                        formattedDiff = Math.abs(difference).toFixed(1) + '%';
                    } else {
                        formattedCurrent = currentValue;
                        formattedAverage = averageValue;
                        formattedDiff = Math.abs(difference);
                    }
                    
                    return `
                        <div class="apex-tooltip">
                            <div class="tooltip-title">${category} Comparison</div>
                            <div class="tooltip-row">
                                <span class="tooltip-label">Current Season:</span>
                                <span class="tooltip-value-current">${formattedCurrent}</span>
                            </div>
                            <div class="tooltip-row">
                                <span class="tooltip-label">Career Average:</span>
                                <span class="tooltip-value-average">${formattedAverage}</span>
                            </div>
                            <div class="tooltip-row difference ${isPositive ? 'positive' : 'negative'}">
                                <span class="tooltip-label">Difference:</span>
                                <span class="tooltip-difference">
                                    ${isPositive ? '+' : '-'}${formattedDiff}
                                    ${isPositive ? ' 📈' : ' 📉'}
                                </span>
                            </div>
                        </div>
                    `;
                }
            },
            responsive: [
                {
                    breakpoint: 768,
                    options: {
                        plotOptions: {
                            bar: {
                                columnWidth: '65%'
                            }
                        },
                        dataLabels: {
                            style: {
                                fontSize: '10px'
                            },
                            offsetY: -20
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
                        },
                        legend: {
                            fontSize: '11px'
                        }
                    }
                },
                {
                    breakpoint: 480,
                    options: {
                        plotOptions: {
                            bar: {
                                columnWidth: '75%'
                            }
                        },
                        dataLabels: {
                            enabled: false // Hide data labels on very small screens
                        },
                        legend: {
                            position: 'bottom',
                            fontSize: '10px'
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
                
                if (processedData.categories.length > 0) {
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

    /* Enhanced tooltip styles for comparison charts */
    :global(.apex-tooltip) {
        background: rgba(26, 26, 26, 0.95) !important;
        border-radius: 8px !important;
        padding: 12px !important;
        box-shadow: 0 8px 25px rgba(0,0,0,0.3) !important;
        border: 1px solid rgba(255,255,255,0.1) !important;
        min-width: 180px !important;
    }

    :global(.tooltip-title) {
        color: #ffffff !important;
        font-weight: 600 !important;
        font-size: 13px !important;
        margin-bottom: 8px !important;
        text-align: center !important;
        border-bottom: 1px solid rgba(255,255,255,0.2) !important;
        padding-bottom: 6px !important;
    }

    :global(.tooltip-row) {
        display: flex !important;
        justify-content: space-between !important;
        align-items: center !important;
        margin-bottom: 4px !important;
    }

    :global(.tooltip-label) {
        color: rgba(255,255,255,0.8) !important;
        font-size: 11px !important;
        font-weight: 500 !important;
    }

    :global(.tooltip-value-current) {
        color: #4CAF50 !important;
        font-weight: 700 !important;
        font-size: 12px !important;
    }

    :global(.tooltip-value-average) {
        color: #2196F3 !important;
        font-weight: 700 !important;
        font-size: 12px !important;
    }

    :global(.tooltip-row.difference) {
        margin-top: 6px !important;
        padding-top: 6px !important;
        border-top: 1px solid rgba(255,255,255,0.2) !important;
    }

    :global(.tooltip-difference) {
        font-weight: 700 !important;
        font-size: 12px !important;
    }

    :global(.tooltip-row.positive .tooltip-difference) {
        color: #4CAF50 !important;
    }

    :global(.tooltip-row.negative .tooltip-difference) {
        color: #f44336 !important;
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

        :global(.apex-tooltip) {
            min-width: 160px !important;
            padding: 10px !important;
        }

        :global(.tooltip-title) {
            font-size: 12px !important;
        }

        :global(.tooltip-label),
        :global(.tooltip-value-current),
        :global(.tooltip-value-average),
        :global(.tooltip-difference) {
            font-size: 11px !important;
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
        {:else if processedData.categories.length > 0 && chartModule}
            <!-- Chart component with dynamic import -->
            <div bind:this={chartElement} use:chartModule.chart={chartConfig}></div>
        {:else}
            <div class="loading-container" style="height: {height}px;">
                📊 No comparison data available
            </div>
        {/if}
    </div>
</div>
