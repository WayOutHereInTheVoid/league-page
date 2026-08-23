<script>
    import { trlTeams } from '$lib/utils/leagueInfo.js';

    const teams = Object.entries(trlTeams).map(([id, team]) => ({
        ...team,
        rosterId: parseInt(id),
    }));
</script>

<div class="teams-hub">
    <header class="hub-header">
        <h1 class="page-title">TRL Franchises</h1>
        <p class="page-sub">12 teams. One championship.</p>
    </header>

    <div class="franchise-grid">
        {#each teams as team (team.rosterId)}
            <a
                href="/teams/{team.slug}"
                class="franchise-card"
                style="background: linear-gradient(160deg, {team.colors.primary}22 0%, #111 65%);
                       border-top: 3px solid {team.colors.primary};"
            >
                <div class="card-inner">
                    <div class="logo-wrap">
                        {#if team.assets.logo}
                            <img
                                src={team.assets.logo}
                                alt="{team.teamName} logo"
                                class="team-logo"
                                loading="lazy"
                            />
                        {:else}
                            <div class="name-fallback" style="color: {team.colors.primary};">
                                {team.teamName}
                            </div>
                        {/if}
                    </div>

                    <div class="team-info">
                        <p class="team-city">{team.city}</p>
                        <h2 class="team-name">{team.teamName}</h2>
                    </div>

                    <div class="color-swatches" aria-hidden="true">
                        {#each Object.values(team.colors) as color}
                            <span class="swatch" style="background: {color};"></span>
                        {/each}
                    </div>
                </div>
            </a>
        {/each}
    </div>
</div>

<style>
    .teams-hub {
        min-height: 100vh;
        background: #0a0a0a;
        padding: 2rem 1rem 5rem;
    }

    .hub-header {
        text-align: center;
        margin-bottom: 2.5rem;
    }

    .page-title {
        font-size: clamp(1.5rem, 4vw, 2.5rem);
        font-weight: 900;
        color: #fff;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        margin: 0 0 0.4rem;
    }

    .page-sub {
        font-size: 0.85rem;
        color: rgba(255, 255, 255, 0.4);
        text-transform: uppercase;
        letter-spacing: 0.15em;
        margin: 0;
    }

    .franchise-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 0.75rem;
        max-width: 1400px;
        margin: 0 auto;
    }

    @media (min-width: 600px) {
        .franchise-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 1rem;
        }
    }

    @media (min-width: 1024px) {
        .teams-hub {
            padding: 2.5rem 2rem 5rem;
        }
        .franchise-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 1.25rem;
        }
    }

    .franchise-card {
        display: block;
        border-radius: 10px;
        overflow: hidden;
        text-decoration: none;
        border: 1px solid rgba(255, 255, 255, 0.07);
        transition: transform 0.18s ease, box-shadow 0.18s ease;
        -webkit-tap-highlight-color: transparent;
    }

    .franchise-card:hover,
    .franchise-card:focus-visible {
        transform: translateY(-3px);
        box-shadow: 0 10px 32px rgba(0, 0, 0, 0.6);
        outline: none;
    }

    .card-inner {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 1.25rem 0.875rem 0.75rem;
        gap: 0.625rem;
        min-height: 200px;
    }

    @media (min-width: 600px) {
        .card-inner {
            min-height: 220px;
            padding: 1.5rem 1rem 0.875rem;
        }
    }

    .logo-wrap {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
    }

    .team-logo {
        width: 80px;
        height: 80px;
        object-fit: contain;
    }

    @media (min-width: 600px) {
        .team-logo {
            width: 96px;
            height: 96px;
        }
    }

    .name-fallback {
        font-size: 0.95rem;
        font-weight: 800;
        text-align: center;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        line-height: 1.2;
        padding: 0.5rem;
    }

    .team-info {
        text-align: center;
        width: 100%;
    }

    .team-city {
        font-size: 0.6rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.18em;
        color: rgba(255, 255, 255, 0.45);
        margin: 0 0 0.2rem;
    }

    .team-name {
        font-size: 0.82rem;
        font-weight: 700;
        color: #fff;
        margin: 0;
        line-height: 1.25;
    }

    @media (min-width: 600px) {
        .team-name {
            font-size: 0.9rem;
        }
    }

    .color-swatches {
        display: flex;
        gap: 3px;
        width: 100%;
        padding-top: 0.25rem;
    }

    .swatch {
        height: 3px;
        flex: 1;
        border-radius: 2px;
    }
</style>
