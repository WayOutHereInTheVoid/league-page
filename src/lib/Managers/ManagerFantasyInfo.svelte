<script>
    export let viewManager, players;

    // Enhanced manager analysis
    $: managerProfile = (() => {
        const profile = {
            playstyle: 'Balanced',
            description: 'A well-rounded fantasy manager',
            riskLevel: 'Moderate',
            strengths: [],
            personality: 'Steady'
        };

        // Analyze trading tendencies
        if (viewManager.tradingScale >= 8) {
            profile.playstyle = 'Aggressive Trader';
            profile.description = 'Loves making deals and roster moves';
            profile.personality = 'Deal Maker';
            profile.strengths.push('Active in trade negotiations');
        } else if (viewManager.tradingScale <= 3) {
            profile.playstyle = 'Set and Forget';
            profile.description = 'Prefers stable roster construction';
            profile.personality = 'Steady Hand';
            profile.strengths.push('Patient roster management');
        }

        // Analyze rebuild vs win-now mentality
        if (viewManager.mode === 'Win Now') {
            profile.riskLevel = 'High';
            profile.strengths.push('Focused on immediate success');
        } else if (viewManager.mode === 'Rebuild') {
            profile.riskLevel = 'Low';
            profile.strengths.push('Building for future dominance');
        }

        // Analyze rookie vs vet preference
        if (viewManager.rookieOrVets === 'Rookies') {
            profile.strengths.push('Eye for young talent');
        } else if (viewManager.rookieOrVets === 'Vets') {
            profile.strengths.push('Values proven production');
        }

        return profile;
    })();

    const getTradingPersonality = (scale) => {
        if (scale >= 9) return { label: 'Trade Addict', emoji: '🔥', color: '#e74c3c' };
        if (scale >= 7) return { label: 'Deal Seeker', emoji: '💼', color: '#f39c12' };
        if (scale >= 5) return { label: 'Opportunist', emoji: '🎯', color: '#3498db' };
        if (scale >= 3) return { label: 'Selective', emoji: '🤔', color: '#9b59b6' };
        return { label: 'Hands Off', emoji: '🏛️', color: '#95a5a6' };
    };

    $: tradingPersonality = viewManager.tradingScale ? getTradingPersonality(viewManager.tradingScale) : null;
</script>

<style>
    .fantasyInfoContainer {
        background-color: var(--fff);
        padding: 1em;
        margin: 1.2em 0;
        border-radius: 12px;
        border: 1px solid var(--ccc);
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .sectionTitle {
        font-size: 1.4em;
        font-weight: 600;
        color: var(--blueOne);
        margin-bottom: 1em;
        text-align: center;
        border-bottom: 2px solid var(--blueOne);
        padding-bottom: 0.5em;
    }

    .profileSummary {
        background: linear-gradient(135deg, var(--f8f9fa) 0%, var(--e9ecef) 100%);
        border-radius: 8px;
        padding: 1em;
        margin-bottom: 1em;
        border-left: 4px solid var(--blueOne);
    }

    .profileHeader {
        display: flex;
        align-items: center;
        gap: 0.8em;
        margin-bottom: 0.8em;
        flex-wrap: wrap;
    }

    .playstyleBadge {
        background: var(--blueOne);
        color: white;
        padding: 0.4em 0.8em;
        border-radius: 15px;
        font-size: 0.8em;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .tradingPersonality {
        font-size: 0.7em;
        padding: 0.3em 0.6em;
        border-radius: 10px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .profileDescription {
        color: var(--g666);
        font-style: italic;
        margin-bottom: 0.8em;
        font-size: 0.9em;
    }

    .strengthsList {
        display: flex;
        flex-wrap: wrap;
        gap: 0.4em;
    }

    .strengthTag {
        background-color: rgba(52, 152, 219, 0.1);
        color: var(--blueOne);
        padding: 0.2em 0.5em;
        border-radius: 10px;
        font-size: 0.75em;
        border: 1px solid rgba(52, 152, 219, 0.2);
    }

    /* COMPACT HORIZONTAL BUTTON DESIGN */
    .fantasyButtons {
        display: grid;
        gap: 0.6em;
        margin-top: 1em;
    }

    .buttonRow {
        display: flex;
        gap: 0.6em;
        flex-wrap: wrap;
    }

    .fantasyButton {
        flex: 1;
        min-width: 140px;
        display: flex;
        align-items: center;
        gap: 0.6em;
        padding: 0.6em 0.8em;
        background: linear-gradient(135deg, var(--fff) 0%, var(--f8f9fa) 100%);
        border: 1px solid var(--dee2e6);
        border-radius: 8px;
        transition: all 0.2s ease;
        cursor: default;
        position: relative;
        overflow: hidden;
    }

    .fantasyButton:hover {
        transform: translateY(-1px);
        box-shadow: 0 3px 12px rgba(0,0,0,0.1);
        background: linear-gradient(135deg, var(--f8f9fa) 0%, var(--e9ecef) 100%);
    }

    .buttonIcon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: 6px;
        font-size: 1.1em;
        font-weight: 700;
        color: white;
        flex-shrink: 0;
        box-shadow: 0 2px 6px rgba(0,0,0,0.15);
    }

    .buttonContent {
        flex: 1;
        min-width: 0;
    }

    .buttonLabel {
        font-size: 0.7em;
        color: var(--blueOne);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.3px;
        margin-bottom: 0.2em;
        line-height: 1;
    }

    .buttonValue {
        font-size: 0.85em;
        color: var(--g555);
        font-weight: 500;
        line-height: 1.2;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    /* Position-specific colors */
    .QB { background: linear-gradient(135deg, #e74c3c, #c0392b); }
    .WR { background: linear-gradient(135deg, #3498db, #2980b9); }
    .RB { background: linear-gradient(135deg, #27ae60, #229954); }
    .TE { background: linear-gradient(135deg, #f39c12, #e67e22); }
    .Picks { background: linear-gradient(135deg, #73b647, #5a9236); }
    .K { background: linear-gradient(135deg, #9b59b6, #8e44ad); }
    .DEF { background: linear-gradient(135deg, #34495e, #2c3e50); }

    /* Special button styling for trading scale */
    .tradingButton .buttonIcon {
        background: var(--blueOne);
        color: white;
    }

    /* Player image in button */
    .playerImage {
        width: 32px;
        height: 32px;
        border-radius: 6px;
        object-fit: cover;
        border: 2px solid var(--fff);
        box-shadow: 0 2px 6px rgba(0,0,0,0.15);
    }

    .smallIcon {
        width: 20px;
        height: 20px;
        margin: 6px;
        object-fit: contain;
    }

    /* No data state */
    .noDataButton {
        opacity: 0.6;
        background: linear-gradient(135deg, var(--f8f9fa) 0%, var(--e9ecef) 100%);
        border: 1px dashed var(--dee2e6);
    }

    .noDataButton:hover {
        transform: none;
        box-shadow: none;
    }

    .noDataIcon {
        width: 32px;
        height: 32px;
        border-radius: 6px;
        background: var(--dee2e6);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1em;
        opacity: 0.5;
    }

    /* Mobile responsiveness */
    @media (max-width: 768px) {
        .buttonRow {
            flex-direction: column;
        }

        .fantasyButton {
            min-width: auto;
        }

        .profileHeader {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5em;
        }

        .strengthsList {
            justify-content: flex-start;
        }
    }

    @media (max-width: 480px) {
        .fantasyInfoContainer {
            padding: 0.8em;
        }

        .buttonIcon,
        .playerImage,
        .noDataIcon {
            width: 28px;
            height: 28px;
        }

        .buttonLabel {
            font-size: 0.65em;
        }

        .buttonValue {
            font-size: 0.8em;
        }

        .fantasyButton {
            padding: 0.5em 0.7em;
            gap: 0.5em;
        }
    }
</style>

<div class="fantasyInfoContainer">
    <div class="sectionTitle">Fantasy Football Profile</div>

    <!-- Manager Profile Summary -->
    <div class="profileSummary">
        <div class="profileHeader">
            <div class="playstyleBadge">{managerProfile.playstyle}</div>
            {#if tradingPersonality}
                <div class="tradingPersonality" style="background-color: {tradingPersonality.color}20; color: {tradingPersonality.color};">
                    {tradingPersonality.emoji} {tradingPersonality.label}
                </div>
            {/if}
        </div>
        <div class="profileDescription">{managerProfile.description}</div>
        {#if managerProfile.strengths.length > 0}
            <div class="strengthsList">
                {#each managerProfile.strengths as strength}
                    <span class="strengthTag">{strength}</span>
                {/each}
            </div>
        {/if}
    </div>

    <!-- Compact Horizontal Button Layout -->
    <div class="fantasyButtons">
        <!-- First Row: Trading & Position -->
        <div class="buttonRow">
            <!-- Trading Scale -->
            {#if viewManager.tradingScale}
                <div class="fantasyButton tradingButton">
                    <div class="buttonIcon">
                        {viewManager.tradingScale}
                    </div>
                    <div class="buttonContent">
                        <div class="buttonLabel">Trading Activity</div>
                        <div class="buttonValue">{viewManager.tradingScale}/10 Scale</div>
                    </div>
                </div>
            {:else}
                <div class="fantasyButton noDataButton">
                    <div class="noDataIcon">📊</div>
                    <div class="buttonContent">
                        <div class="buttonLabel">Trading Activity</div>
                        <div class="buttonValue">Not set</div>
                    </div>
                </div>
            {/if}

            <!-- Favorite Position -->
            {#if viewManager.valuePosition}
                <div class="fantasyButton">
                    <div class="buttonIcon {viewManager.valuePosition}">
                        {viewManager.valuePosition}
                    </div>
                    <div class="buttonContent">
                        <div class="buttonLabel">Favorite Position</div>
                        <div class="buttonValue">Most Valued Asset</div>
                    </div>
                </div>
            {:else}
                <div class="fantasyButton noDataButton">
                    <div class="noDataIcon">🏈</div>
                    <div class="buttonContent">
                        <div class="buttonLabel">Favorite Position</div>
                        <div class="buttonValue">Not set</div>
                    </div>
                </div>
            {/if}
        </div>

        <!-- Second Row: Player Preference & Favorite Player -->
        <div class="buttonRow">
            <!-- Rookie or Vet Preference -->
            {#if viewManager.rookieOrVets}
                <div class="fantasyButton">
                    <div class="buttonIcon" style="background: var(--blueOne);">
                        <img class="smallIcon" src="/{viewManager.rookieOrVets}.png" alt="preference"/>
                    </div>
                    <div class="buttonContent">
                        <div class="buttonLabel">Player Preference</div>
                        <div class="buttonValue">{viewManager.rookieOrVets}</div>
                    </div>
                </div>
            {:else}
                <div class="fantasyButton noDataButton">
                    <div class="noDataIcon">👶</div>
                    <div class="buttonContent">
                        <div class="buttonLabel">Player Preference</div>
                        <div class="buttonValue">Not set</div>
                    </div>
                </div>
            {/if}

            <!-- Favorite Player -->
            {#if viewManager.favoritePlayer && players[viewManager.favoritePlayer]}
                <div class="fantasyButton">
                    <img class="playerImage" src="https://sleepercdn.com/content/nfl/players/{viewManager.favoritePlayer}.jpg" alt="favorite player"/>
                    <div class="buttonContent">
                        <div class="buttonLabel">Favorite Player</div>
                        <div class="buttonValue">
                            {players[viewManager.favoritePlayer].fn} {players[viewManager.favoritePlayer].ln}
                        </div>
                    </div>
                </div>
            {:else}
                <div class="fantasyButton noDataButton">
                    <div class="noDataIcon">⭐</div>
                    <div class="buttonContent">
                        <div class="buttonLabel">Favorite Player</div>
                        <div class="buttonValue">Not set</div>
                    </div>
                </div>
            {/if}
        </div>

        <!-- Third Row: Strategy Mode (full width) -->
        <div class="buttonRow">
            {#if viewManager.mode}
                <div class="fantasyButton">
                    <div class="buttonIcon" style="background: var(--blueOne);">
                        <img class="smallIcon" src="/{viewManager.mode.replace(' ', '%20')}.png" alt="strategy"/>
                    </div>
                    <div class="buttonContent">
                        <div class="buttonLabel">Strategy Mode</div>
                        <div class="buttonValue">{viewManager.mode}</div>
                    </div>
                </div>
            {:else}
                <div class="fantasyButton noDataButton">
                    <div class="noDataIcon">🎯</div>
                    <div class="buttonContent">
                        <div class="buttonLabel">Strategy Mode</div>
                        <div class="buttonValue">Not set</div>
                    </div>
                </div>
            {/if}
        </div>
    </div>
</div>
