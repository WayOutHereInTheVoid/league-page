<script>
    import LinearProgress from '@smui/linear-progress';
    import { Manager } from '$lib/components';
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';

    export let data;
    const { team, rosterId, manager, managers, managersInfo } = data;

    onMount(() => {
        if (!managers?.length) goto('/');
        if (manager < 0) goto('/teams');
    });
</script>

<div
    class="team-page"
    style="
        --trl-primary:   {team.colors.primary};
        --trl-secondary: {team.colors.secondary};
        --trl-accent:    {team.colors.accent};
        --trl-dark:      {team.colors.dark};
        --trl-light:     {team.colors.light};
    "
>
    <!-- ── Placeholder hero — Phase 3 will replace this with TRLHero ── -->
    <div class="trl-hero-placeholder">
        {#if team.assets.banner}
            <img
                src={team.assets.banner}
                alt="{team.teamName} banner"
                class="hero-banner"
            />
        {/if}

        <div class="hero-overlay">
            {#if team.assets.logo}
                <img
                    src={team.assets.logo}
                    alt="{team.teamName} logo"
                    class="hero-logo"
                />
            {/if}

            <div class="hero-text">
                <p class="hero-city">{team.city}</p>
                <h1 class="hero-name">{team.teamName}</h1>
                <p class="hero-tagline">{team.tagline}</p>
            </div>
        </div>

        <!-- Color-bar accent strip along the bottom of the hero -->
        <div class="hero-color-bar" aria-hidden="true">
            {#each Object.values(team.colors) as color}
                <span style="background: {color}; flex: 1;"></span>
            {/each}
        </div>
    </div>

    <!-- ── Manager / fantasy stats section ── -->
    <div class="stats-section">
        {#if managersInfo}
            {#await managersInfo}
                <div class="loading">
                    <p>Loading franchise data…</p>
                    <LinearProgress indeterminate />
                </div>
            {:then [rostersData, leagueTeamManagers, leagueData, transactionsData, awards, records]}
                {#if managers.length && manager > -1}
                    <Manager
                        {awards}
                        {records}
                        {manager}
                        {managers}
                        {rostersData}
                        {leagueTeamManagers}
                        rosterPositions={leagueData.roster_positions}
                        {transactionsData}
                    />
                {/if}
            {:catch err}
                <p class="error-msg">Something went wrong: {err.message}</p>
            {/await}
        {/if}
    </div>
</div>

<style>
    .team-page {
        min-height: 100vh;
        background: #0a0a0a;
    }

    /* ── Placeholder hero ─────────────────────────────────────────── */
    .trl-hero-placeholder {
        position: relative;
        min-height: 300px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        background: var(--trl-dark, #111);
    }

    @media (min-width: 768px) {
        .trl-hero-placeholder {
            min-height: 380px;
        }
    }

    .hero-banner {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        opacity: 0.3;
        pointer-events: none;
    }

    .hero-overlay {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        padding: 3rem 1.5rem 2.5rem;
        flex: 1;
    }

    .hero-logo {
        width: 100px;
        height: 100px;
        object-fit: contain;
        filter: drop-shadow(0 4px 20px rgba(0, 0, 0, 0.7));
    }

    @media (min-width: 768px) {
        .hero-logo {
            width: 130px;
            height: 130px;
        }
    }

    .hero-text {
        text-align: center;
    }

    .hero-city {
        font-size: 0.7rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.22em;
        color: var(--trl-accent, rgba(255, 255, 255, 0.5));
        margin: 0 0 0.3rem;
    }

    .hero-name {
        font-size: clamp(1.75rem, 5vw, 3.5rem);
        font-weight: 900;
        color: #fff;
        margin: 0 0 0.5rem;
        line-height: 1.05;
        text-shadow: 0 2px 20px rgba(0, 0, 0, 0.6);
    }

    .hero-tagline {
        font-size: 0.875rem;
        color: rgba(255, 255, 255, 0.55);
        margin: 0;
        font-style: italic;
        max-width: 480px;
    }

    .hero-color-bar {
        display: flex;
        height: 6px;
        width: 100%;
        flex-shrink: 0;
    }

    /* ── Stats section ────────────────────────────────────────────── */
    .stats-section {
        padding: 1.5rem 0 3rem;
    }

    .loading {
        padding: 3rem 1.5rem;
        text-align: center;
        color: rgba(255, 255, 255, 0.5);
        font-size: 0.9rem;
    }

    .error-msg {
        padding: 2rem 1.5rem;
        text-align: center;
        color: #ef4444;
        font-size: 0.9rem;
    }
</style>
