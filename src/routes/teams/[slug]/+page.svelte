<script>
    import LinearProgress from '@smui/linear-progress';
    import { Manager } from '$lib/components';
    import TRLHero from '$lib/components/trl/TRLHero.svelte';
    import TRLFranchise from '$lib/components/trl/TRLFranchise.svelte';
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
    <!-- ── Hero ── -->
    <TRLHero {team} />

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

    <!-- ── Franchise dossier ── -->
    <div class="dossier-section">
        <TRLFranchise {team} />
    </div>
</div>

<style>
    .team-page {
        min-height: 100vh;
        background: #0a0a0a;
    }

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

    .dossier-section {
        padding: 0 1rem 3rem;
    }

    @media (min-width: 768px) {
        .dossier-section {
            padding: 0 2rem 4rem;
        }
    }
</style>
