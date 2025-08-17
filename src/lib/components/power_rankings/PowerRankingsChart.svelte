<script>
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';

    export let powerRankings;
    export let regularSeasonLength;
    export let totalRosters;

    let chart;
    let chartOptions;
    let chartElement;
    let isChartReady = false;
    let ApexCharts;

    onMount(async () => {
        if (browser) {
            try {
                // Dynamic import of ApexCharts
                const apexModule = await import('apexcharts');
                ApexCharts = apexModule.default;
                
                chartOptions = {
                    chart: {
                        width: "97%",
                        foreColor: "#111827",
                        id: "power-ranking",
                        toolbar: {
                            show: false,
                        },
                        zoom: {
                            enabled: false,
                        },
                    },
                    colors: [
                        "#ef4444",
                        "#f97316",
                        "#f59e0b",
                        "#eab308",
                        "#84cc16",
                        "#14b8a6",
                        "#22c55e",
                        "#0ea5e9",
                        "#6366f1",
                        "#a855f7",
                        "#ec4899",
                        "#f43f5e",
                    ],
                    xaxis: {
                        categories: [...Array(regularSeasonLength + 1).keys()].slice(1),
                        title: {
                            text: "Week",
                            style: {
                                fontSize: "16px",
                                fontFamily:
                                    "ui-sans-serif, system-ui, sans-serif, Apple Color Emoji, Segoe UI Emoji",
                                fontWeight: 600,
                            },
                        },
                    },
                    yaxis: {
                        reversed: true,
                        min: 1,
                        stepSize: 1,
                        tickAmount: totalRosters - 1,
                        title: {
                            text: "Ranking",
                            offsetX: -10,
                            style: {
                                fontSize: "16px",
                                fontFamily:
                                    "ui-sans-serif, system-ui, sans-serif, Apple Color Emoji, Segoe UI Emoji",
                                fontWeight: 600,
                            },
                        },
                    },
                    tooltip: {
                        theme: "light",
                        x: {
                            show: true,
                            formatter: (x) => `Week ${x}`,
                        },
                    },
                    stroke: {
                        curve: "straight",
                        width: 5,
                    },
                    markers: {
                        size: 6,
                        strokeWidth: 2,
                        strokeColors: "#374151",
                        hover: {
                            size: 7,
                        },
                    },
                    legend: {
                        offsetX: 20,
                    },
                };

                if (chartElement && powerRankings) {
                    chart = new ApexCharts(chartElement, { ...chartOptions, series: powerRankings });
                    chart.render();
                    isChartReady = true;
                }
            } catch (error) {
                console.warn('Failed to load ApexCharts:', error);
            }
        }
    });

    // Update chart when data changes
    $: if (browser && chart && powerRankings && isChartReady) {
        chart.updateSeries(powerRankings);
    }
</script>

<style>
    .chart-container {
        position: relative;
        width: 100%;
        height: 400px;
        background: var(--fff);
        border-radius: 8px;
        padding: 1rem;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: var(--g666);
        font-style: italic;
        background: var(--f8f9fa);
        border-radius: 8px;
        border: 2px dashed var(--ddd);
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
</style>

<div class="chart-container">
    {#if !browser}
        <!-- SSR fallback -->
        <div class="loading-container">
            📈 Power Rankings Chart loading...
        </div>
    {:else if !isChartReady}
        <!-- Loading state -->
        <div class="loading-container">
            <div class="loading-spinner"></div>
            Loading chart...
        </div>
    {:else}
        <!-- Chart will be rendered here -->
        <div bind:this={chartElement}></div>
    {/if}
</div>
