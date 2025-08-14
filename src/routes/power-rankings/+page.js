import { getLeagueStandings, getLeagueTeamManagers, getLeagueData } from '$lib/utils/helper';

export async function load() {
    try {
        console.log('Power Rankings: Starting page load...');
        
        // Always load current league data first
        const currentLeagueData = await getLeagueData();
        console.log(`Current league: ${currentLeagueData.season} (${currentLeagueData.status})`);
        
        // Initialize return data with safe defaults
        const result = {
            leagueData: currentLeagueData,
            standingsData: null,
            leagueTeamManagersData: null,
            processedStats: null,
            usingPreviousSeasonData: false,
            displayedSeason: currentLeagueData.season,
            currentSeason: currentLeagueData.season
        };
        
        // If pre-draft, try to load previous season data
        if (currentLeagueData.status === "pre_draft" && currentLeagueData.previous_league_id) {
            console.log('Pre-draft detected, loading 2024 data...');
            
            try {
                const prevLeagueId = currentLeagueData.previous_league_id;
                
                // Load previous league data
                const prevLeagueData = await getLeagueData(prevLeagueId);
                console.log(`Previous league: ${prevLeagueData.season} (${prevLeagueData.status})`);
                
                // Only proceed if previous season was completed
                if (prevLeagueData.status === "complete") {
                    // Load users for previous season
                    const usersRes = await fetch(`https://api.sleeper.app/v1/league/${prevLeagueId}/users`);
                    const users = await usersRes.json();
                    
                    // Load rosters for previous season  
                    const rostersRes = await fetch(`https://api.sleeper.app/v1/league/${prevLeagueId}/rosters`);
                    const rosters = await rostersRes.json();
                    
                    if (usersRes.ok && rostersRes.ok && users && rosters && users.length > 0 && rosters.length > 0) {
                        // Create basic standings data from rosters
                        const standings = {};
                        rosters.forEach((roster, index) => {
                            standings[index] = {
                                rosterID: index,
                                wins: roster.settings?.wins || 0,
                                losses: roster.settings?.losses || 0,
                                ties: roster.settings?.ties || 0,
                                fpts: Math.round((roster.settings?.fpts || 0) + ((roster.settings?.fpts_decimal || 0) / 100)),
                                fptsAgainst: Math.round((roster.settings?.fpts_against || 0) + ((roster.settings?.fpts_against_decimal || 0) / 100))
                            };
                        });
                        
                        // Update result with previous season data
                        result.leagueData = prevLeagueData;
                        result.standingsData = { standingsInfo: standings, yearData: prevLeagueData.season };
                        result.leagueTeamManagersData = { users, rosters };
                        result.usingPreviousSeasonData = true;
                        result.displayedSeason = prevLeagueData.season;
                        
                        console.log(`✅ Successfully loaded ${prevLeagueData.season} data`);
                    } else {
                        console.log('❌ Previous season data incomplete');
                    }
                } else {
                    console.log(`❌ Previous season status: ${prevLeagueData.status} (not complete)`);
                }
            } catch (error) {
                console.error('Error loading previous season:', error);
                // Continue with current season defaults
            }
        } else {
            console.log('Current season active, loading current data...');
            
            try {
                // Try to load current season data
                const standingsData = await getLeagueStandings();
                const leagueTeamManagersData = await getLeagueTeamManagers();
                
                result.standingsData = standingsData;
                result.leagueTeamManagersData = leagueTeamManagersData;
                
                console.log(`✅ Loaded current season data`);
            } catch (error) {
                console.error('Error loading current season data:', error);
                // Continue with null data
            }
        }
        
        console.log('Power Rankings: Page load completed');
        return result;
        
    } catch (error) {
        console.error('CRITICAL: Power Rankings load failed:', error);
        
        // Last resort fallback to prevent 404
        return {
            leagueData: { 
                season: "2025", 
                settings: { playoff_week_start: 15 }, 
                total_rosters: 12 
            },
            standingsData: null,
            leagueTeamManagersData: null,
            processedStats: null,
            usingPreviousSeasonData: false,
            displayedSeason: "2025",
            currentSeason: "2025"
        };
    }
}