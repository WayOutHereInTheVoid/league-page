<script>
    import { createEventDispatcher } from 'svelte';
    import Button, { Label } from '@smui/button';
    import IconButton from '@smui/icon-button';
    
    const dispatch = createEventDispatcher();
    
    let { 
        leagueTeamManagers,
        highlightedTeam = null,
        highlightMode = false
    } = $props();
    
    // Process available teams from leagueTeamManagers
    let availableTeams = $derived(() => {
        if (!leagueTeamManagers?.users) return [];
        
        return Object.entries(leagueTeamManagers.users).map(([userID, user]) => ({
            userID,
            displayName: user.display_name || user.username,
            avatar: user.avatar,
            teamName: user.metadata?.team_name || ''
        })).sort((a, b) => a.displayName.localeCompare(b.displayName));
    });
    
    const toggleHighlightMode = () => {
        highlightMode = !highlightMode;
        if (!highlightMode) {
            highlightedTeam = null;
        }
        dispatch('highlightChange', { 
            highlightMode, 
            highlightedTeam 
        });
    };
    
    const selectTeam = (userID) => {
        highlightedTeam = userID;
        highlightMode = true;
        dispatch('highlightChange', { 
            highlightMode, 
            highlightedTeam,
            teamSelected: true
        });
    };
    
    const clearHighlight = () => {
        highlightedTeam = null;
        highlightMode = false;
        dispatch('highlightChange', { 
            highlightMode, 
            highlightedTeam,
            cleared: true
        });
    };
    
    // Get selected team info
    let selectedTeam = $derived(() => {
        return highlightedTeam ? availableTeams().find(team => team.userID === highlightedTeam) : null;
    });
</script>

<style>
    .team-highlighter {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.75rem;
        margin: 1rem 0;
        padding: 1rem;
        background-color: var(--headerPrimary);
        border-radius: 8px;
        border: 1px solid var(--ebebeb);
    }
    
    .highlight-toggle {
        border-radius: 6px !important;
        font-weight: 600 !important;
        transition: all 0.2s ease-out !important;
        min-height: 40px !important;
        display: flex !important;
        align-items: center !important;
        gap: 0.5rem !important;
    }
    
    .highlight-toggle.active {
        background-color: var(--blueOne) !important;
        color: white !important;
        box-shadow: 0 2px 6px rgba(46, 125, 50, 0.3);
    }
    
    .highlight-toggle:not(.active) {
        background-color: var(--fff) !important;
        color: var(--blueOne) !important;
        border: 1px solid var(--blueOne) !important;
    }
    
    .team-selector {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .team-dropdown {
        position: relative;
        display: inline-block;
    }
    
    .team-button {
        background-color: var(--fff) !important;
        border: 1px solid var(--ddd) !important;
        border-radius: 6px !important;
        padding: 8px 12px !important;
        font-size: 0.9em !important;
        min-height: 36px !important;
        display: flex !important;
        align-items: center !important;
        gap: 0.5rem !important;
        cursor: pointer !important;
        transition: all 0.2s ease-out !important;
    }
    
    .team-button:hover {
        background-color: var(--r1) !important;
        border-color: var(--blueOne) !important;
    }
    
    .team-dropdown-content {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        border: 1px solid var(--ddd);
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 100;
        max-height: 200px;
        overflow-y: auto;
        margin-top: 4px;
    }
    
    .team-option {
        padding: 10px 12px;
        cursor: pointer;
        border-bottom: 1px solid var(--eee);
        transition: background-color 0.2s ease-out;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.9em;
    }
    
    .team-option:hover {
        background-color: var(--r1);
    }
    
    .team-option:last-child {
        border-bottom: none;
    }
    
    .team-avatar {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background-color: var(--ebebeb);
        background-size: cover;
        background-position: center;
        flex-shrink: 0;
    }
    
    .team-info {
        display: flex;
        flex-direction: column;
        min-width: 0;
    }
    
    .team-name {
        font-weight: 600;
        color: var(--g333);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    
    .team-display-name {
        font-size: 0.8em;
        color: var(--g999);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    
    .clear-highlight {
        color: var(--g999) !important;
        border: 1px solid var(--ccc) !important;
        background-color: var(--fff) !important;
        border-radius: 50% !important;
        width: 32px !important;
        height: 32px !important;
        padding: 0 !important;
    }
    
    .clear-highlight:hover {
        background-color: var(--waiverDrop) !important;
        border-color: var(--error) !important;
        color: var(--error) !important;
    }
    
    .highlight-icon {
        width: 16px;
        height: 16px;
    }
    
    .status-text {
        font-size: 0.85em;
        color: var(--g555);
        font-style: italic;
    }
    
    @media (max-width: 768px) {
        .team-highlighter {
            padding: 0.75rem;
            gap: 0.5rem;
        }
        
        .highlight-toggle {
            font-size: 0.85em !important;
            min-height: 36px !important;
        }
        
        .team-button {
            font-size: 0.8em !important;
            padding: 6px 10px !important;
            min-height: 32px !important;
        }
        
        .team-avatar {
            width: 20px;
            height: 20px;
        }
    }
    
    @media (max-width: 480px) {
        .team-highlighter {
            flex-direction: column;
            align-items: stretch;
            gap: 0.75rem;
        }
        
        .team-selector {
            justify-content: center;
        }
    }
    
    /* Styles for highlighted rows (to be applied to table rows) */
    :global(.highlighted-team-row) {
        background-color: rgba(46, 125, 50, 0.1) !important;
        border-left: 4px solid var(--blueOne) !important;
        box-shadow: 0 2px 4px rgba(46, 125, 50, 0.2) !important;
    }
    
    :global(.highlighted-team-row .cellName) {
        font-weight: 600 !important;
        color: var(--blueOne) !important;
    }
</style>

<div class="team-highlighter">
    <Button 
        class="highlight-toggle {highlightMode ? 'active' : ''}"
        onclick={toggleHighlightMode}
        variant="outlined"
        title={highlightMode ? 'Disable team highlighting' : 'Enable team highlighting'}
    >
        <svg class="highlight-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,2A7,7 0 0,0 5,9C5,11.38 6.19,13.47 8,14.74V17A1,1 0 0,0 9,18H15A1,1 0 0,0 16,17V14.74C17.81,13.47 19,11.38 19,9A7,7 0 0,0 12,2M9,21V20H15V21A1,1 0 0,1 14,22H10A1,1 0 0,1 9,21Z" />
        </svg>
        <Label>{highlightMode ? 'Highlighting ON' : 'Highlight My Team'}</Label>
    </Button>
    
    {#if highlightMode}
        <div class="team-selector">
            <div class="team-dropdown">
                <button class="team-button">
                    {#if selectedTeam()}
                        <div class="team-avatar" style="background-image: url('https://sleepercdn.com/avatars/thumbs/{selectedTeam().avatar}');"></div>
                        <div class="team-info">
                            <div class="team-name">
                                {selectedTeam().teamName || selectedTeam().displayName}
                            </div>
                        </div>
                    {:else}
                        <span>Select Team</span>
                    {/if}
                    
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M7,10L12,15L17,10H7Z" />
                    </svg>
                </button>
                
                <div class="team-dropdown-content">
                    {#each availableTeams() as team}
                        <div 
                            class="team-option"
                            onclick={() => selectTeam(team.userID)}
                            role="button"
                            tabindex="0"
                        >
                            <div class="team-avatar" style="background-image: url('https://sleepercdn.com/avatars/thumbs/{team.avatar}');"></div>
                            <div class="team-info">
                                <div class="team-name">
                                    {team.teamName || team.displayName}
                                </div>
                                <div class="team-display-name">
                                    {team.displayName}
                                </div>
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
            
            {#if highlightedTeam}
                <IconButton 
                    class="clear-highlight"
                    onclick={clearHighlight}
                    title="Clear team highlight"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                    </svg>
                </IconButton>
            {/if}
        </div>
        
        {#if selectedTeam()}
            <span class="status-text">
                Highlighting: {selectedTeam().teamName || selectedTeam().displayName}
            </span>
        {/if}
    {/if}
</div>
