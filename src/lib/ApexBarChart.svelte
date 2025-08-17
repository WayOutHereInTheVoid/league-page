<script>
    import { onMount } from 'svelte';
    import Chart from 'svelte-apexcharts';

    export let data = [];
    export let title = '';
    export let height = 280;
    export let chartType = 'wins'; // 'wins' or 'points'

    let chartOptions = {};
    let series = [];

    // Process data for ApexCharts format
    $: processedData = data.map(item => ({
        x: item.label || item.x,
        y: item.y
    }));

    // Update chart configuration when data changes
    $: {
        updateChart();
    }

    function updateChart() {
        // Dynamic gradient colors based on chart type
        const primaryColor = chartType === 'wins' ? '#4CAF50' : '#FF7043';
        const gradientStart = chartType === 'wins' ? '#81C784' : '#FFAB91';
        const gradientEnd = chartType === 'wins' ? '#2E7D32' : '#FF5722';

        series = [{
            name: title,
            data: processedData
        }];

        chartOptions = {
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
            plotOptions: {
                bar: {
                    borderRadius: 6,
                    columnWidth: '65%',
                    distributed: false,
                    dataLabels: {
                        position: 'top'
                    }
                }
            },
            colors: [primaryColor],
            fill: {
                type: 'gradient',
                gradient: {
                    shade: 'light',
                    type: 'vertical',
                    shadeIntensity: 0.25,
                    gradientToColors: [gradientStart],
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
                    fontSize: '12px',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: '600',
                    colors: ['var(--g333)']
                },
                formatter: function (val) {
                    return chartType === 'points' ? Math.round(val).toLocaleString() : val;
                }
            },
            stroke: {
                show: true,
                width: 1,
                colors: ['transparent']
            },
            xaxis: {
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
                        return chartType === 'points' ? Math.round(val).toLocaleString() : val;
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
                row: {
                    colors: undefined,
                    opacity: 0.5
                },
                column: {
                    colors: undefined,
                    opacity: 0.5
                },
                padding: {
                    top: 10,
                    right: 15,
                    bottom: 10,
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
                y: {
                    formatter: function (val, { series, seriesIndex, dataPointIndex, w }) {
                        const season = processedData[dataPointIndex]?.x;
                        if (chartType === 'points') {
                            return Math.round(val).toLocaleString() + ' points';
                        } else {
                            const losses = Math.max(0, 14 - val); // Assuming 14 game season
                            return val + ' wins' + (losses > 0 ? ', ' + losses + ' losses' : '');
                        }
                    }
                },
                marker: {
                    show: true
                },
                custom: function({ series, seriesIndex, dataPointIndex, w }) {
                    const value = series[seriesIndex][dataPointIndex];
                    const season = processedData[dataPointIndex]?.x;
                    
                    if (chartType === 'points') {
                        return `
                            <div class="apex-tooltip">
                                <div class="tooltip-title">${season} Season</div>
                                <div class="tooltip-value">${Math.round(value).toLocaleString()} Total Points</div>
                                <div class="tooltip-sub">Avg: ${Math.round(value/14).toLocaleString()} per game</div>
                            </div>
                        `;
                    } else {
                        const losses = Math.max(0, 14 - value);
                        const winPct = ((value / (value + losses)) * 100).toFixed(1);
                        return `
                            <div class="apex-tooltip">
                                <div class="tooltip-title">${season} Season</div>
                                <div class="tooltip-value">${value}-${losses} Record</div>
                                <div class="tooltip-sub">${winPct}% Win Rate</div>
                            </div>
                        `;
                    }
                }
            },
            responsive: [
                {
                    breakpoint: 768,
                    options: {
                        plotOptions: {
                            bar: {
                                columnWidth: '75%'
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
                        }
                    }
                },
                {
                    breakpoint: 480,
                    options: {
                        plotOptions: {
                            bar: {
                                columnWidth: '85%'
                            }
                        },
                        dataLabels: {
                            enabled: false // Hide data labels on very small screens
                        }
                    }
                }
            ]
        };
    }

    // Initialize chart on mount
    onMount(() => {
        updateChart();
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
        {#if processedData.length > 0}
            <Chart options={chartOptions} {series} type="bar" height={height} />
        {:else}
            <div style="
                display: flex;
                align-items: center;
                justify-content: center;
                height: {height}px;
                color: var(--g666);
                font-style: italic;
                background: var(--f8f9fa);
                border-radius: 8px;
                border: 2px dashed var(--ddd);
            ">
                📊 No data available for visualization
            </div>
        {/if}
    </div>
</div>
