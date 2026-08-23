<script>
    /** @type {{ team: import('$lib/utils/leagueInfo.js').trlTeams[number] }} */
    export let team;

    const colorEntries = Object.entries(team.colors);
</script>

<div
    class="trl-hero"
    class:trl-hero--banner={!!team.assets.banner}
    class:trl-hero--gradient={!team.assets.banner}
>
    <!-- ── Background layer ─────────────────────────────── -->
    {#if team.assets.banner}
        <img
            src={team.assets.banner}
            alt=""
            class="hero-bg-img"
            aria-hidden="true"
        />
        <div class="hero-bg-overlay"></div>
    {:else}
        <div
            class="hero-bg-gradient"
            style="background: linear-gradient(135deg, {team.colors.dark} 0%, {team.colors.primary} 100%);"
        ></div>
    {/if}

    <!-- ── Main content ──────────────────────────────────── -->
    <div class="hero-body">
        <div class="hero-identity">

            <!-- Logo or name fallback -->
            <div class="logo-block">
                {#if team.assets.logo}
                    <img
                        src={team.assets.logo}
                        alt="{team.teamName} logo"
                        class="hero-logo"
                    />
                {:else}
                    <div
                        class="logo-fallback"
                        style="color: {team.colors.primary};"
                        aria-hidden="true"
                    >
                        {team.teamName}
                    </div>
                {/if}
            </div>

            <!-- Team text info -->
            <div class="hero-text">
                <p class="hero-city">{team.city}</p>
                <h1 class="hero-name">{team.teamName}</h1>
                <p class="hero-tagline">"{team.tagline}"</p>
            </div>

        </div>
    </div>

    <!-- ── Color palette swatches ────────────────────────── -->
    <div class="hero-swatches" aria-label="Team color palette">
        {#each colorEntries as [key, hex]}
            <div class="swatch-item">
                <div
                    class="swatch-sq"
                    style="background: {hex};"
                    title="{key}: {hex}"
                ></div>
                <p class="swatch-key">{key}</p>
                <p class="swatch-hex">{hex}</p>
            </div>
        {/each}
    </div>
</div>

<style>
    /* ── Container ───────────────────────────────────────── */
    .trl-hero {
        position: relative;
        display: flex;
        flex-direction: column;
        min-height: 320px;
        overflow: hidden;
        width: 100%;
    }

    @media (min-width: 768px) {
        .trl-hero {
            min-height: 480px;
        }
    }

    /* ── Background layers ───────────────────────────────── */
    .hero-bg-img {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center;
        pointer-events: none;
        user-select: none;
    }

    .hero-bg-overlay {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.52);
        pointer-events: none;
    }

    .hero-bg-gradient {
        position: absolute;
        inset: 0;
        pointer-events: none;
    }

    /* ── Body content ────────────────────────────────────── */
    .hero-body {
        position: relative;
        flex: 1;
        display: flex;
        align-items: center;
        padding: 2.5rem 1.25rem 1.5rem;
    }

    @media (min-width: 768px) {
        .hero-body {
            padding: 3rem 2.5rem 2rem;
        }
    }

    /* ── Identity row (logo + text) ──────────────────────── */
    .hero-identity {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1.25rem;
        width: 100%;
        text-align: center;
    }

    @media (min-width: 560px) {
        .hero-identity {
            flex-direction: row;
            align-items: center;
            text-align: left;
            gap: 2rem;
        }
    }

    /* ── Logo block ──────────────────────────────────────── */
    .logo-block {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .hero-logo {
        max-height: 140px;
        max-width: 140px;
        width: auto;
        height: auto;
        object-fit: contain;
        filter: drop-shadow(0 4px 20px rgba(0, 0, 0, 0.7));
    }

    @media (max-width: 559px) {
        .hero-logo {
            max-height: 100px;
            max-width: 100px;
        }
    }

    .logo-fallback {
        font-size: clamp(1.25rem, 4vw, 2rem);
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        line-height: 1.1;
        text-align: center;
        max-width: 180px;
        filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.6));
    }

    /* ── Text stack ──────────────────────────────────────── */
    .hero-text {
        display: flex;
        flex-direction: column;
        gap: 0.3rem;
    }

    .hero-city {
        font-size: 0.7rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.22em;
        color: var(--trl-accent, rgba(255, 255, 255, 0.55));
        margin: 0;
    }

    .hero-name {
        font-size: clamp(1.6rem, 5vw, 3.25rem);
        font-weight: 900;
        color: #fff;
        margin: 0;
        line-height: 1.05;
        text-shadow: 0 2px 16px rgba(0, 0, 0, 0.55);
    }

    .hero-tagline {
        font-size: clamp(0.8rem, 2vw, 1rem);
        color: rgba(255, 255, 255, 0.6);
        margin: 0;
        font-style: italic;
        max-width: 480px;
    }

    /* ── Swatches row ────────────────────────────────────── */
    .hero-swatches {
        position: relative;
        display: flex;
        justify-content: center;
        gap: 0.75rem;
        padding: 0.875rem 1.25rem 1rem;
        background: rgba(0, 0, 0, 0.45);
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
        flex-wrap: wrap;
    }

    @media (min-width: 480px) {
        .hero-swatches {
            flex-wrap: nowrap;
            gap: 1rem;
            padding: 1rem 2rem;
        }
    }

    .swatch-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.3rem;
        flex: 1;
        min-width: 52px;
        max-width: 80px;
    }

    .swatch-sq {
        width: 36px;
        height: 36px;
        border-radius: 6px;
        box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.18),
                    0 2px 8px rgba(0, 0, 0, 0.4);
        flex-shrink: 0;
    }

    @media (min-width: 480px) {
        .swatch-sq {
            width: 40px;
            height: 40px;
        }
    }

    .swatch-key {
        font-size: 0.6rem;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: rgba(255, 255, 255, 0.5);
        margin: 0;
        line-height: 1;
    }

    .swatch-hex {
        font-size: 0.6rem;
        font-family: ui-monospace, 'SF Mono', monospace;
        color: rgba(255, 255, 255, 0.75);
        margin: 0;
        line-height: 1;
        text-transform: uppercase;
    }
</style>
