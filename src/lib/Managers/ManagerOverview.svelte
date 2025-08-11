<script>
    export let managerStats;


    export let commissioner;

    // Extract key metrics for the overview
    $: totalWins = managerStats?.totalWins || 0;
    $: totalLosses = managerStats?.totalLosses || 0;
    $: totalGames = totalWins + totalLosses;
    $: winRate = totalGames > 0 ? ((totalWins / totalGames) * 100) : 0;
    $: championships = managerStats?.championships || 0;
    $: playoffAppearances = managerStats?.playoffAppearances || 0;
    $: avgPointsPerSeason = managerStats?.avgPointsPerSeason || 0;
    $: totalSeasons = managerStats?.totalSeasons || 0;

    // Performance tier based on win rate
    $: performanceTier = (() => {
        if (winRate >= 70) return { label: 'Elite', color: '#27ae60', emoji: '🏆' };
        if (winRate >= 60) return { label: 'Excellent', color: '#2980b9', emoji: '🔥' };
        if (winRate >= 50) return { label: 'Solid', color: '#f39c12', emoji: '📈' };
        if (winRate >= 40) return { label: 'Developing', color: '#e67e22', emoji: '📊' };
        return { label: 'Building', color: '#95a5a6', emoji: '🔧' };
    })();

    // Championship status
    $: championshipStatus = championships > 1 ? 'Dynasty Builder' : 
                           championships === 1 ? 'Champion' : 
                           playoffAppearances >= 3 ? 'Contender' : 
                           playoffAppearances > 0 ? 'Playoff Veteran' : 'Rising Star';
</script>

<style>
    .overviewCard {
        background: linear-gradient(135deg, var(--fff) 0%, var(--f8f9fa) 100%);
        border: 1px solid var(--dee2e6);
        border-radius: 16px;
        padding: 1.5rem;
        margin: 1.5rem 0;
        box-shadow: 0 6px 20px rgba(0,0,0,0.08);
        position: relative;
        overflow: hidden;
    }

    .overviewCard::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, var(--blueOne), var(--blueTwo));
    }

    .cardHeader {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1.5rem;
    }

    .cardTitle {
        font-size: 1.3rem;
        font-weight: 600;
        color: var(--blueOne);
        margin: 0;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .performanceBadge {
        display: inline-flex;
        align-items: center;
        gap: 0.3rem;
        padding: 0.4rem 0.8rem;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 600;
        color: white;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .metricsGrid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 1rem;
        margin-bottom: 1.5rem;
    }

    .metricCard {
        background: rgba(255, 255, 255, 0.8);
        border: 1px solid var(--e9ecef);
        border-radius: 12px;
        padding: 1rem;
        text-align: center;
        transition: all 0.2s ease;
        position: relative;
    }

    .metricCard:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .metricValue {
        font-size: 1.8rem;
        font-weight: 700;
        color: var(--blueOne);
        margin-bottom: 0.3rem;
        line-height: 1;
    }

    .metricLabel {
        font-size: 0.75rem;
        color: var(--g666);
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        line-height: 1.2;
    }

    .championshipStatus {
        background: linear-gradient(135deg, rgba(52, 152, 219, 0.1) 0%, rgba(155, 89, 182, 0.1) 100%);
        border: 1px solid rgba(52, 152, 219, 0.2);
        border-radius: 12px;
        padding: 1rem;
        text-align: center;
    }

    .statusTitle {
        font-size: 0.9rem;
        color: var(--g666);
        margin-bottom: 0.5rem;
        font-weight: 500;
    }

    .statusValue {
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--blueOne);
    }

    .commissionerIndicator {
        position: absolute;
        top: 1rem;
        right: 1rem;
        background: var(--blueTwo);
        color: white;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 0.8rem;
        border: 2px solid var(--blueOne);
    }

    /* Special styling for win rate metric */
    .winRateCard {
        background: linear-gradient(135deg, rgba(52, 152, 219, 0.05) 0%, rgba(52, 152, 219, 0.1) 100%);
        border-color: var(--blueOne);
    }

    .winRateValue {
        color: var(--blueOne);
    }

    /* Special styling for championships */
    .championshipCard {
        background: linear-gradient(135deg, rgba(241, 196, 15, 0.05) 0%, rgba(241, 196, 15, 0.1) 100%);
        border-color: #f1c40f;
    }

    .championshipValue {
        color: #d4ac0d;
    }

    /* Mobile optimizations */
    @media (max-width: 768px) {
        .overviewCard {
            padding: 1.2rem;
            margin: 1.2rem 0;
        }

        .cardHeader {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.8rem;
        }

        .metricsGrid {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.8rem;
        }

        .metricCard {
            padding: 0.8rem;
        }

        .metricValue {
            font-size: 1.5rem;
        }

        .metricLabel {
            font-size: 0.7rem;
        }

        .cardTitle {
            font-size: 1.1rem;
        }
    }

    @media (max-width: 480px) {
        .metricsGrid {
            grid-template-columns: 1fr;
        }
        
        .overviewCard {
            padding: 1rem;
        }
    }
</style>

<div class="overviewCard">
    {#if commissioner}
        <div class="commissionerIndicator" title="League Commissioner">C</div>
    {/if}
    
    <div class="cardHeader">
        <h3 class="cardTitle">
            📊 Manager Overview
        </h3>
        <div class="performanceBadge" style="background-color: {performanceTier.color};">
            {performanceTier.emoji} {performanceTier.label}
        </div>
    </div>

    <div class="metricsGrid">
        <div class="metricCard winRateCard">
            <div class="metricValue winRateValue">{winRate.toFixed(1)}%</div>
            <div class="metricLabel">Win Rate</div>
        </div>

        <div class="metricCard">
            <div class="metricValue">{totalWins}</div>
            <div class="metricLabel">Total Wins</div>
        </div>

        <div class="metricCard championshipCard">
            <div class="metricValue championshipValue">{championships}</div>
            <div class="metricLabel">Championships</div>
        </div>

        <div class="metricCard">
            <div class="metricValue">{playoffAppearances}</div>
            <div class="metricLabel">Playoff Apps</div>
        </div>

        {#if avgPointsPerSeason > 0}
            <div class="metricCard">
                <div class="metricValue">{avgPointsPerSeason.toFixed(0)}</div>
                <div class="metricLabel">Avg Points/Season</div>
            </div>
        {/if}

        {#if totalSeasons > 0}
            <div class="metricCard">
                <div class="metricValue">{totalSeasons}</div>
                <div class="metricLabel">Seasons Played</div>
            </div>
        {/if}
    </div>

    <div class="championshipStatus">
        <div class="statusTitle">Manager Status</div>
        <div class="statusValue">{championshipStatus}</div>
    </div>
</div>
