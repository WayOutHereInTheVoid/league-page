<script>
	import { gotoManager } from '$lib/utils/helper';
	import { getTeamFromTeamManagers } from '$lib/utils/helperFunctions/universalFunctions';
	import TransactionCard from './TransactionCard.svelte';

	export let transaction, players, leagueTeamManagers;
	// NEW: Search functionality props
	export let searchQuery = '';
	export let highlightSearchTerms = () => {};

    const owner = transaction.rosters[0];

    const getAvatar = (pos, player) => {
        if(pos == 'DEF') {
            return `background-image: url(https://sleepercdn.com/images/team_logos/nfl/${player.toLowerCase()}.png)`;
        }
        return `background-image: url(https://sleepercdn.com/content/nfl/players/thumb/${player}.jpg), url(https://sleepercdn.com/images/v2/icons/player_default.webp)`;
    }
</script>

<style>
    .waiver-content {
        display: flex;
        flex-direction: column;
    }
    
    .name {
        position: relative;
    }

    .core {
        display: flex;
        flex-direction: column;
        background-color: var(--fff);
        padding: 12px 0 10px;
    }

    .avatarAndDetails {
        display: flex;
        padding: 0;
        flex-direction: column;
        justify-content: end;
    }

    .avatar {
        position: absolute;
        left: 16px;
        top: -16px;
        border-radius: 50%;
        height: 32px;
        width: 32px;
        border: 2px solid var(--blueTwo);
        background-color: var(--fff);
    }

    .ownerName {
        display: inline-block;
        background: linear-gradient(135deg, #F8F9FA 0%, #FFF3E0 100%);
        margin: 0 0 10px 44px;
        padding: 8px 14px;
        border-radius: 0 18px 18px 0;
        font-weight: 700;
        font-size: 1rem;
        letter-spacing: 0.3px;
        color: #FF7043;
        border-left: 4px solid var(--blueTwo);
        box-shadow: 0 2px 4px rgba(255, 112, 67, 0.1);
    }

    .playerAvatar {
        display: inline-block;
        vertical-align: middle;
        height: 45px;
        width: 45px;
        background-position: center;
        border: 3px solid;
        border-radius: 100%;
        background-repeat: no-repeat;
        background-size: auto 45px;
        position: relative;
        box-shadow: 0 3px 8px rgba(0, 0, 0, 0.12), 0 1px 3px rgba(0, 0, 0, 0.08);
        transition: all 0.2s ease;
    }

    .currentOwner {
        font-style: italic;
        color: var(--g555);
        font-weight: normal;
    }

    .clickable {
        cursor: pointer;
        transition: all 0.2s ease;
    }
    
    .clickable:hover {
        transform: translateY(-1px);
    }

    .details {
        display: flex;
        align-items: center;
        justify-content: space-evenly;
        width: 90%;
        padding: 0 5%;
        gap: 10px;
    }

    .player {
        display: flex;
        flex-direction: column;
        align-items: center;
        min-width: 120px;
    }

    .playerName {
        font-size: 0.9rem;
        line-height: 1.2;
        text-align: center;
        font-weight: 600;
        letter-spacing: 0.2px;
        margin-top: 8px;
        color: var(--g111);
    }

    .playerInfo {
        font-size: 0.75em;
        color: var(--g444);
        line-height: 1.1;
        text-align: center;
        margin-top: 6px;
        font-weight: 500;
        letter-spacing: 0.1px;
    }

    .add {
        color: #00A693;
        font-weight: 700;
        text-shadow: 0 1px 2px rgba(0, 166, 147, 0.3);
    }

    .drop {
        color: #E91E63;
        font-weight: 700;
        text-shadow: 0 1px 2px rgba(233, 30, 99, 0.3);
    }

    .indicator {
        position: absolute;
        bottom: -10px;
        right: -10px;
        background: white;
        border-radius: 50%;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
        border: 2px solid white;
    }

    .nameHolder {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
    }

    .bid {
        color: #FF6F00;
        font-style: normal;
        font-weight: 700;
        font-size: 1.05rem;
        letter-spacing: 0.5px;
        margin-left: 12px;
        padding: 2px 6px;
        background: linear-gradient(135deg, rgba(255, 111, 0, 0.1) 0%, rgba(255, 111, 0, 0.05) 100%);
        border-radius: 6px;
        border: 1px solid rgba(255, 111, 0, 0.2);
    }

    @media (max-width: 768px) {
        .core {
            padding: 16px 0 12px;
        }
        
        .avatar {
            height: 35px;
            width: 35px;
            left: 16px;
        }
        
        .ownerName {
            margin: 0 0 12px 44px;
            padding: 6px 12px;
            font-size: 0.9em;
        }
        
        .details {
            width: 95%;
            padding: 0 2.5%;
            gap: 8px;
        }
        
        .player {
            min-width: auto;
        }
        
        .playerAvatar {
            height: 45px;
            width: 45px;
            background-size: auto 45px;
        }
        
        .playerName {
            font-size: 0.8em;
        }
        
        .playerInfo {
            font-size: 0.65em;
        }
    }

    @media (max-width: 480px) {
        .details {
            flex-direction: row;
            justify-content: center;
            gap: 16px;
        }

        .player {
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .nameHolder {
            margin-top: 0.5em;
            font-size: 0.9em;
        }
        
        .playerName {
            font-size: 0.75em;
        }
        
        .playerInfo {
            font-size: 0.6em;
        }
    }
</style>

<div class="clickable" onclick={() => gotoManager({year: transaction.season, leagueTeamManagers, rosterID: owner})}>
    <TransactionCard {transaction} {leagueTeamManagers}>
        <div class="waiver-content">
            <div class="name">
                <span class="ownerName">
                    {@html searchQuery ? highlightSearchTerms(getTeamFromTeamManagers(leagueTeamManagers, owner, transaction.season).name, searchQuery) : getTeamFromTeamManagers(leagueTeamManagers, owner, transaction.season).name}
                    {#if getTeamFromTeamManagers(leagueTeamManagers, owner, transaction.season).name != getTeamFromTeamManagers(leagueTeamManagers, owner).name}
                        <span class="currentOwner">({@html searchQuery ? highlightSearchTerms(getTeamFromTeamManagers(leagueTeamManagers, owner).name, searchQuery) : getTeamFromTeamManagers(leagueTeamManagers, owner).name})</span>
                    {/if}
                    {#if transaction.moves[0][0].bid}
                        <span class="bid">
                            ${transaction.moves[0][0].bid}
                        </span>
                    {/if}
                </span>
                <img class="avatar" src="{getTeamFromTeamManagers(leagueTeamManagers, owner, transaction.season).avatar}" alt="{getTeamFromTeamManagers(leagueTeamManagers, owner, transaction.season).name} avatar"/>
            </div>
            <div class="core">
                <div class="avatarAndDetails">
                    <div class="details">
                        {#each transaction.moves as move}
                            <div class="player">
                                <div class="playerAvatar" style="border-color: var(--{players[move[0].player].pos}); background-color: var(--{move[0].type == "Added" ? "waiverAdd" : "waiverDrop"}); {getAvatar(players[move[0].player].pos, move[0].player)}">
                                    {#if move[0].type == "Added"}
                                        <i class="add indicator material-icons" aria-hidden="true">add_circle</i>
                                    {:else if move[0].type == "Dropped"}
                                        <i class="drop indicator material-icons" aria-hidden="true">do_not_disturb_on</i>
                                    {/if}
                                </div>
                                <div class="nameHolder">
                                    <span class="playerName">{@html searchQuery ? highlightSearchTerms(`${players[move[0].player].fn} ${players[move[0].player].ln}`, searchQuery) : `${players[move[0].player].fn} ${players[move[0].player].ln}`}</span>
                                    <span class="playerInfo">
                                        <span>{players[move[0].player].pos}</span>
                                        {#if players[move[0].player].t}
                                            -
                                            <span>{players[move[0].player].t}</span> 
                                        {/if}
                                    </span>
                                </div>
                            </div>
                        {/each}
                    </div>
                </div>
            </div>
        </div>
    </TransactionCard>
</div>
