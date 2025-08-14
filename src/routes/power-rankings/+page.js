import { getLeagueStandings, getLeagueTeamManagers, getLeagueData } from '$lib/utils/helper';
import { getWeeklyPoints, createTableData } from '$lib/utils/helperFunctions/advancedStats';

// Helper function to get standings for a specific league ID
async function getLeagueStandingsForSeason(leagueId) {
    const leagueData = await getLeagueData(leagueId);
    const regularSeasonLength = leagueData.settings.playoff_week_start - 1;
    
    // Check if season has started
    if (leagueData.status === "pre_draft") {
        return null;
    }
    
    try {
        const rostersRes = await fetch(`https://api.sleeper.app/v1/league/${leagueId}/rosters`);
        const rosters = await rostersRes.json();
        
        if (!rostersRes.ok || !rosters || rosters.length === 0) {
            return null;
        }
        
        const standings = {};
        rosters.forEach((roster, index) => {
            standings[index] = {
                rosterID: index,
                wins: roster.settings.wins || 0,
                losses: roster.settings.losses || 0,
                ties: roster.settings.ties || 0,
                fpts: Math.round((roster.settings.fpts || 0) + ((roster.settings.fpts_decimal || 0) / 100)),
                fptsAgainst: Math.round((roster.settings.fpts_against || 0) + ((roster.settings.fpts_against_decimal || 0) / 100)),
                streak: roster.metadata?.streak || 0,
                divisionWins: null,
                divisionLosses: null,
                divisionTies: null,
            };
        });
        
        return {
            standingsInfo: standings,
            yearData: leagueData.season
        };
    } catch (error) {
        console.error('Error fetching standings for season:', leagueId, error);
        return null;
    }
}

// Helper function to get team managers for a specific league ID  
async function getLeagueTeamManagersForSeason(leagueId) {
    try {
        const [usersRes, rostersRes] = await Promise.all([
            fetch(`https://api.sleeper.app/v1/league/${leagueId}/users`),
            fetch(`https://api.sleeper.app/v1/league/${leagueId}/rosters`)
        ]);
        
        const [users, rosters] = await Promise.all([
            usersRes.json(),
            rostersRes.json()
        ]);
        
        if (!usersRes.ok || !rostersRes.ok) {
            return null;
        }
        
        return {
            users: users,
            rosters: rosters
        };
    } catch (error) {
        console.error('Error fetching team managers for season:', leagueId, error);
        return null;
    }
}

export async function load() {
    const currentLeagueData = await getLeagueData();
    let leagueData, standingsData, leagueTeamManagersData, weeklyPoints, processedStats;
    let usingPreviousSeasonData = false;
    let displayedSeason = currentLeagueData.season;
    
    // Check if current league is in pre-draft status
    if (currentLeagueData.status === "pre_draft" && currentLeagueData.previous_league_id) {
        console.log('Current league in pre-draft status, loading previous season data...');
        
        // Load data from previous season
        const previousLeagueId = currentLeagueData.previous_league_id;
        leagueData = await getLeagueData(previousLeagueId);
        standingsData = await getLeagueStandingsForSeason(previousLeagueId);
        leagueTeamManagersData = await getLeagueTeamManagersForSeason(previousLeagueId);
        
        if (standingsData && leagueTeamManagersData) {
            weeklyPoints = await getWeeklyPoints(previousLeagueId, leagueData.settings.playoff_week_start - 1);
            processedStats = createTableData(leagueTeamManagersData.users, standingsData.standingsInfo, weeklyPoints, leagueData.settings.league_average_match);
            usingPreviousSeasonData = true;
            displayedSeason = leagueData.season;
        } else {
            // Fallback to null data if previous season data isn't available
            standingsData = null;
            leagueTeamManagersData = null;
            weeklyPoints = null;
            processedStats = null;
        }
    } else {
        // Use current season data (normal flow)
        leagueData = currentLeagueData;
        standingsData = await getLeagueStandings();
        leagueTeamManagersData = await getLeagueTeamManagers();
        
        if (standingsData && leagueTeamManagersData) {
            weeklyPoints = await getWeeklyPoints(leagueData.league_id, leagueData.settings.playoff_week_start - 1);
            processedStats = createTableData(leagueTeamManagersData.users, standingsData.standingsInfo, weeklyPoints, leagueData.settings.league_average_match);
        }
    }

    return {
        leagueData,
        standingsData,
        leagueTeamManagersData,
        processedStats,
        usingPreviousSeasonData,
        displayedSeason,
        currentSeason: currentLeagueData.season
    };
}