<script>
    // Skeleton loading component for Records page
    // Provides visual feedback while data loads
    export let type = 'table'; // 'table', 'cards', 'charts'
</script>

<style>
    .skeleton-container {
        margin: 2em auto;
        max-width: 1200px;
        padding: 0 1rem;
    }

    .skeleton-header {
        height: 48px;
        background: linear-gradient(90deg, var(--f3f3f3) 25%, var(--eee) 50%, var(--f3f3f3) 75%);
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
        border-radius: 8px;
        margin-bottom: 2em;
    }

    .skeleton-buttons {
        display: flex;
        justify-content: center;
        gap: 1rem;
        margin: 2em 0;
        flex-wrap: wrap;
    }

    .skeleton-button {
        height: 36px;
        width: 120px;
        background: linear-gradient(90deg, var(--f3f3f3) 25%, var(--eee) 50%, var(--f3f3f3) 75%);
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
        border-radius: 4px;
    }

    .skeleton-table {
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0px 3px 3px -2px var(--boxShadowOne), 
                    0px 3px 4px 0px var(--boxShadowTwo), 
                    0px 1px 8px 0px var(--boxShadowThree);
        margin: 2em;
        background: var(--fff);
    }

    .skeleton-table-header {
        height: 56px;
        background: var(--headerPrimary);
        position: relative;
        overflow: hidden;
    }

    .skeleton-table-header::after {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
        animation: shimmer-wave 2s infinite;
    }

    .skeleton-row {
        height: 52px;
        border-bottom: 1px solid var(--borderOverride);
        display: flex;
        align-items: center;
        padding: 0 16px;
        gap: 16px;
    }

    .skeleton-cell {
        background: linear-gradient(90deg, var(--f8f8f8) 25%, var(--f3f3f3) 50%, var(--f8f8f8) 75%);
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
        border-radius: 4px;
        height: 20px;
    }

    .skeleton-cell.rank {
        width: 30px;
    }

    .skeleton-cell.manager {
        width: 180px;
        flex-grow: 1;
    }

    .skeleton-cell.stat {
        width: 80px;
    }

    .skeleton-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 2em;
        margin: 2em;
    }

    .skeleton-chart-container {
        height: 300px;
        background: var(--fff);
        border-radius: 8px;
        box-shadow: 0px 3px 3px -2px var(--boxShadowOne), 
                    0px 3px 4px 0px var(--boxShadowTwo), 
                    0px 1px 8px 0px var(--boxShadowThree);
        position: relative;
        overflow: hidden;
    }

    .skeleton-chart-header {
        height: 60px;
        background: var(--headerPrimary);
        position: relative;
    }

    .skeleton-chart-content {
        padding: 20px;
        height: 240px;
        display: flex;
        align-items: end;
        gap: 8px;
    }

    .skeleton-bar {
        background: linear-gradient(90deg, var(--f3f3f3) 25%, var(--eee) 50%, var(--f3f3f3) 75%);
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
        border-radius: 4px 4px 0 0;
        flex: 1;
    }

    .skeleton-bar:nth-child(1) { height: 80%; }
    .skeleton-bar:nth-child(2) { height: 60%; }
    .skeleton-bar:nth-child(3) { height: 90%; }
    .skeleton-bar:nth-child(4) { height: 45%; }
    .skeleton-bar:nth-child(5) { height: 70%; }
    .skeleton-bar:nth-child(6) { height: 35%; }

    @keyframes shimmer {
        0% {
            background-position: -200% 0;
        }
        100% {
            background-position: 200% 0;
        }
    }

    @keyframes shimmer-wave {
        0% {
            left: -100%;
        }
        100% {
            left: 100%;
        }
    }

    /* Mobile Responsive Adjustments */
    @media (max-width: 768px) {
        .skeleton-container {
            padding: 0 0.5rem;
        }

        .skeleton-table {
            margin: 1em 0.5em;
        }

        .skeleton-grid {
            grid-template-columns: 1fr;
            margin: 1em 0.5em;
        }

        .skeleton-buttons {
            gap: 0.5rem;
        }

        .skeleton-button {
            width: 100px;
            height: 32px;
        }

        .skeleton-row {
            padding: 0 8px;
            gap: 8px;
        }

        .skeleton-cell.manager {
            width: 120px;
        }
    }

    @media (max-width: 480px) {
        .skeleton-button {
            width: 80px;
            height: 28px;
            font-size: 0.8rem;
        }

        .skeleton-row {
            height: 44px;
            padding: 0 4px;
            gap: 4px;
        }

        .skeleton-cell.rank {
            width: 20px;
        }

        .skeleton-cell.manager {
            width: 100px;
        }

        .skeleton-cell.stat {
            width: 60px;
        }
    }
</style>

<div class="skeleton-container">
    <!-- Loading Header -->
    <div class="skeleton-header"></div>
    
    <!-- Filter Buttons -->
    <div class="skeleton-buttons">
        <div class="skeleton-button"></div>
        <div class="skeleton-button"></div>
    </div>
    <div class="skeleton-buttons">
        <div class="skeleton-button"></div>
        <div class="skeleton-button"></div>
    </div>

    {#if type === 'table'}
        <!-- Records Tables -->
        <div class="skeleton-grid">
            <!-- Single Week Records Table -->
            <div class="skeleton-table">
                <div class="skeleton-table-header"></div>
                {#each Array(5) as _, i}
                    <div class="skeleton-row">
                        <div class="skeleton-cell rank"></div>
                        <div class="skeleton-cell manager"></div>
                        <div class="skeleton-cell stat"></div>
                        <div class="skeleton-cell stat"></div>
                    </div>
                {/each}
            </div>

            <!-- Weekly Lows Table -->
            <div class="skeleton-table">
                <div class="skeleton-table-header"></div>
                {#each Array(5) as _, i}
                    <div class="skeleton-row">
                        <div class="skeleton-cell rank"></div>
                        <div class="skeleton-cell manager"></div>
                        <div class="skeleton-cell stat"></div>
                        <div class="skeleton-cell stat"></div>
                    </div>
                {/each}
            </div>

            <!-- Biggest Blowouts Table -->
            <div class="skeleton-table">
                <div class="skeleton-table-header"></div>
                {#each Array(5) as _, i}
                    <div class="skeleton-row">
                        <div class="skeleton-cell rank"></div>
                        <div class="skeleton-cell manager"></div>
                        <div class="skeleton-cell stat"></div>
                        <div class="skeleton-cell stat"></div>
                    </div>
                {/each}
            </div>

            <!-- Closest Matchups Table -->
            <div class="skeleton-table">
                <div class="skeleton-table-header"></div>
                {#each Array(5) as _, i}
                    <div class="skeleton-row">
                        <div class="skeleton-cell rank"></div>
                        <div class="skeleton-cell manager"></div>
                        <div class="skeleton-cell stat"></div>
                        <div class="skeleton-cell stat"></div>
                    </div>
                {/each}
            </div>
        </div>

        <!-- Rankings Chart Skeleton -->
        <div class="skeleton-chart-container">
            <div class="skeleton-chart-header"></div>
            <div class="skeleton-chart-content">
                {#each Array(6) as _, i}
                    <div class="skeleton-bar"></div>
                {/each}
            </div>
        </div>

        <!-- Rankings Table -->
        <div class="skeleton-table" style="margin: 2em auto; max-width: 800px;">
            <div class="skeleton-table-header"></div>
            {#each Array(8) as _, i}
                <div class="skeleton-row">
                    <div class="skeleton-cell rank"></div>
                    <div class="skeleton-cell manager"></div>
                    <div class="skeleton-cell stat"></div>
                    <div class="skeleton-cell stat"></div>
                    <div class="skeleton-cell stat"></div>
                </div>
            {/each}
        </div>
    {/if}
</div>
