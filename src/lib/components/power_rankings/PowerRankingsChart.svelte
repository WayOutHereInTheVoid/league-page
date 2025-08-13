<script>
    import { onMount } from 'svelte';
    import ApexCharts from 'apexcharts';

    export let powerRankings;
    export let regularSeasonLength;
    export let totalRosters;

    let chart;
    let chartOptions;

    onMount(() => {
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

        chart = new ApexCharts(document.querySelector("#chart"), { ...chartOptions, series: powerRankings });
        chart.render();
    });
</script>

<div id="chart"></div>
