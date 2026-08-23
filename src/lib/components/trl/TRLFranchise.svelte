<script>
    /** @type {{ team: import('$lib/utils/leagueInfo.js').trlTeams[number] }} */
    export let team;
</script>

{#if team.lore}
<div
    class="franchise-dossier"
    style="
        background: {team.colors.dark};
        border-left: 4px solid {team.colors.secondary};
    "
>
    <p class="dossier-header" style="color: {team.colors.primary};">Franchise File</p>
    <div class="dossier-divider" style="border-color: {team.colors.primary};"></div>

    <dl class="dossier-meta">
        <div class="meta-row">
            <dt class="meta-label">Founded</dt>
            <dd class="meta-value" style="color: {team.colors.light};">{team.founded}</dd>
        </div>
        <div class="meta-row">
            <dt class="meta-label">Rival</dt>
            <dd class="meta-value" style="color: {team.colors.light};">{team.rival}</dd>
        </div>
        <div class="meta-row">
            <dt class="meta-label">Motto</dt>
            <dd class="meta-value meta-value--motto" style="color: {team.colors.primary};">"{team.motto}"</dd>
        </div>
    </dl>

    <p class="dossier-lore" style="color: {team.colors.light};">{team.lore}</p>
</div>
{/if}

<style>
    .franchise-dossier {
        max-width: 860px;
        margin: 0 auto;
        border-radius: 8px;
        padding: 1.5rem 1.5rem 1.75rem;
    }

    @media (min-width: 768px) {
        .franchise-dossier {
            padding: 2rem 2.25rem 2.25rem;
        }
    }

    .dossier-header {
        font-size: 0.65rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.22em;
        margin: 0 0 0.6rem;
    }

    .dossier-divider {
        border: none;
        border-top: 1px solid;
        width: 60px;
        margin: 0 0 1.25rem;
        opacity: 0.6;
    }

    .dossier-meta {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin: 0 0 1.25rem;
    }

    .meta-row {
        display: flex;
        gap: 0.75rem;
        align-items: baseline;
    }

    .meta-label {
        font-size: 0.7rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: rgba(255, 255, 255, 0.4);
        min-width: 64px;
        flex-shrink: 0;
    }

    .meta-value {
        font-size: 0.9rem;
        font-weight: 500;
        margin: 0;
    }

    .meta-value--motto {
        font-style: italic;
        font-weight: 600;
    }

    .dossier-lore {
        font-size: 0.9rem;
        line-height: 1.7;
        color: rgba(255, 255, 255, 0.72);
        margin: 0;
    }

    @media (min-width: 768px) {
        .dossier-lore {
            font-size: 0.95rem;
        }
    }
</style>
