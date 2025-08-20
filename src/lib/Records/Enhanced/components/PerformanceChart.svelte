<script>
    import { onMount } from 'svelte';

    // Props
    let { 
        records = [],
        chartType = 'overview',
        leagueTeamManagers = []
    } = $props();

    // Chart state
    let chartContainer = $state(null);
    let chartData = $state([]);
    let loading = $state(true);

    // Process records for chart display
    const processChartData = () => {
        if (!records || records.length === 0) {
            chartData = [];
            return;
        }

        // Group records by type for overview chart
        const groupedByType = records.reduce((acc, record) => {
            const type = record.type || 'unknown';
            if (!acc[type]) {
                acc[type] = [];
            }
            acc[type].push(record);
            return acc;
        }, {});

        // Create chart data
        chartData = Object.entries(groupedByType).map(([type, typeRecords]) => ({
            type: type.charAt(0).toUpperCase() + type.slice(1),
            count: typeRecords.length,
            avgValue: typeRecords.reduce((sum, r) => sum + (r.value || 0), 0) / typeRecords.length,
            maxValue: Math.max(...typeRecords.map(r => r.value || 0)),
            records: typeRecords
        }));

        loading = false;
    };

    // Update chart when records change
    $effect(() => {
        processChartData();
    });
</script>

<style>
    .performance-chart {
        background: var(--fff);
        border-radius: 12px;
        border: 1px solid var(--ebebeb);
        padding: 1.5rem;
        box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }

    .chart-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
    }

    .chart-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--g333);
        margin: 0;
    }

    .chart-content {
        min-height: 300px;
        position: relative;
    }

    .chart-placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 300px;
        color: var(--g555);
        text-align: center;
    }

    .chart-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
        opacity: 0.5;
    }

    .chart-bars {
        display: flex;
        justify-content: space-between;
        align-items: end;
        height: 200px;
        gap: 1rem;
        margin: 2rem 0;
        padding: 0 1rem;
    }

    .chart-bar {
        flex: 1;
        background: linear-gradient(135deg, var(--blueOne) 0%, var(--blueTwo) 100%);
        border-radius: 4px 4px 0 0;
        min-height: 20px;
        position: relative;
        transition: all 0.3s ease;
        cursor: pointer;
    }

    .chart-bar:hover {
        opacity: 0.8;
        transform: translateY(-2px);
    }

    .bar-label {
        position: absolute;
        bottom: -30px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 0.75rem;
        color: var(--g555);
        text-align: center;
        white-space: nowrap;
    }

    .bar-value {
        position: absolute;
        top: -25px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--g333);
        text-align: center;
    }

    .chart-legend {
        display: flex;
        justify-content: center;
        gap: 2rem;
        margin-top: 2rem;
        flex-wrap: wrap;
    }

    .legend-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.875rem;
        color: var(--g555);
    }

    .legend-color {
        width: 12px;
        height: 12px;
        border-radius: 2px;
        background: var(--blueOne);
    }

    /* Mobile responsiveness */
    @media (max-width: 768px) {
        .performance-chart {
            padding: 1rem;
        }

        .chart-bars {
            height: 150px;
            gap: 0.5rem;
            margin: 1rem 0;
        }

        .chart-legend {
            gap: 1rem;
        }
    }
</style>

<div class="performance-chart">
    <div class="chart-header">
        <h3 class="chart-title">Performance Overview</h3>
    </div>

    <div class="chart-content">
        {#if loading}
            <div class="chart-placeholder">
                <div class="chart-icon">📊</div>
                <h4>Loading Chart Data...</h4>
                <p>Processing achievement records for visualization</p>
            </div>
        {:else if chartData.length === 0}
            <div class="chart-placeholder">
                <div class="chart-icon">📈</div>
                <h4>No Chart Data Available</h4>
                <p>No records found to display in chart format</p>
            </div>
        {:else}
            <!-- Simple Bar Chart -->
            <div class="chart-bars">
                {#each chartData as data, index}
                    {@const maxCount = Math.max(...chartData.map(d => d.count))}
                    {@const height = (data.count / maxCount) * 100}
                    <div 
                        class="chart-bar"
                        style="height: {height}%; background: linear-gradient(135deg, var(--barChartOne) 0%, var(--barChartTwo) 100%);"
                        title="{data.type}: {data.count} records">
                        <div class="bar-value">{data.count}</div>
                        <div class="bar-label">{data.type}</div>
                    </div>
                {/each}
            </div>

            <!-- Chart Legend -->
            <div class="chart-legend">
                <div class="legend-item">
                    <div class="legend-color"></div>
                    <span>Record Count by Type</span>
                </div>
            </div>
        {/if}
    </div>
</div>
