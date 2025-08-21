<script>
    import AnimatedCounter from './AnimatedCounter.svelte';
    import RecordTeam from './RecordTeam.svelte';
    
    // Props
    export let title = '';
    export let value = 0;
    export let subtitle = '';
    export let icon = '';
    export let season = 2024;
    export let format = 'number';
    export let decimals = 1;
    export let teamData = null; // {rosterID, year, leagueTeamManagers, points}
    export let extraInfo = ''; // Additional context like "vs Team Name"
</script>

<style>
    .stat-card {
        background: var(--fff);
        border-radius: 12px;
        padding: 1.5rem;
        box-shadow: 0px 4px 6px -1px rgba(0, 0, 0, 0.1), 
                    0px 2px 4px -1px rgba(0, 0, 0, 0.06);
        transition: all 0.2s ease-out;
        position: relative;
        overflow: hidden;
        border-left: 4px solid var(--blueOne);
        min-height: 140px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }
    
    .stat-card:hover {
        box-shadow: 0px 10px 15px -3px rgba(0, 0, 0, 0.1), 
                    0px 4px 6px -2px rgba(0, 0, 0, 0.05);
        transform: translateY(-2px);
    }
    
    .season-badge {
        position: absolute;
        top: 12px;
        right: 12px;
        background: var(--blueOne);
        color: white;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 0.7rem;
        font-weight: 500;
        line-height: 1;
        opacity: 0.9;
    }
    
    .card-header {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        margin-bottom: 1rem;
    }
    
    .card-icon {
        font-size: 1.5rem;
        opacity: 0.8;
        color: var(--blueOne);
        min-width: 24px;
    }
    
    .card-title {
        font-size: 0.9rem;
        font-weight: 600;
        color: var(--g555);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        line-height: 1.2;
        margin: 0;
        flex: 1;
    }
    
    .card-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .main-value {
        font-size: 2.25rem;
        font-weight: 700;
        color: var(--blueOne);
        line-height: 1;
        margin: 0.5rem 0;
    }
    
    .card-subtitle {
        font-size: 0.85rem;
        color: var(--g555);
        margin: 0;
    }
    
    .team-info {
        margin-top: 0.5rem;
        padding-top: 0.75rem;
        border-top: 1px solid var(--ebebeb);
    }
    
    .extra-info {
        font-size: 0.8rem;
        color: var(--g999);
        margin-top: 0.25rem;
        font-style: italic;
    }
    
    /* Mobile Responsive */
    @media (max-width: 768px) {
        .stat-card {
            padding: 1.25rem;
            min-height: 120px;
        }
        
        .main-value {
            font-size: 1.9rem;
        }
        
        .card-title {
            font-size: 0.8rem;
        }
        
        .season-badge {
            font-size: 0.65rem;
            padding: 3px 6px;
        }
    }
    
    @media (max-width: 480px) {
        .stat-card {
            padding: 1rem;
            min-height: 110px;
        }
        
        .main-value {
            font-size: 1.7rem;
        }
        
        .card-header {
            gap: 0.5rem;
            margin-bottom: 0.75rem;
        }
        
        .card-icon {
            font-size: 1.25rem;
        }
    }
</style>

<div class="stat-card">
    <div class="season-badge">
        {season} Season
    </div>
    
    <div class="card-header">
        {#if icon}
            <div class="card-icon">
                {icon}
            </div>
        {/if}
        <h3 class="card-title">{title}</h3>
    </div>
    
    <div class="card-content">
        <div class="main-value">
            <AnimatedCounter {value} {format} {decimals} />
        </div>
        
        {#if subtitle}
            <p class="card-subtitle">{subtitle}</p>
        {/if}
        
        {#if teamData}
            <div class="team-info">
                <RecordTeam 
                    leagueTeamManagers={teamData.leagueTeamManagers}
                    rosterID={teamData.rosterID}
                    year={teamData.year}
                    points={teamData.points}
                    compressed={true}
                />
            </div>
        {/if}
        
        {#if extraInfo}
            <div class="extra-info">{extraInfo}</div>
        {/if}
    </div>
</div>
