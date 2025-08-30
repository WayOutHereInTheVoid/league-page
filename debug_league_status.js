// Debug script to investigate the 2025 league status and why only 1 user is returned
const league2025ID = "1256486983484583936"; // 2025 Season
const league2024ID = "1124822402371428352"; // 2024 Season (for comparison)

console.log("=== 2025 LEAGUE INVESTIGATION ===");

async function investigateLeague(leagueID, year) {
  try {
    console.log(`\n=== INVESTIGATING ${year} LEAGUE: ${leagueID} ===`);

    // Get league info first
    console.log("Fetching league data...");
    const leagueResponse = await fetch(
      `https://api.sleeper.app/v1/league/${leagueID}`,
    );

    if (!leagueResponse.ok) {
      console.error(
        `Failed to fetch league data: ${leagueResponse.status} ${leagueResponse.statusText}`,
      );
      return;
    }

    const leagueData = await leagueResponse.json();
    console.log("League Status:", leagueData.status);
    console.log("League Name:", leagueData.name);
    console.log("Total Rosters:", leagueData.total_rosters);
    console.log("Season:", leagueData.season);
    console.log("Draft ID:", leagueData.draft_id);

    // Get users
    console.log("\nFetching users...");
    const usersResponse = await fetch(
      `https://api.sleeper.app/v1/league/${leagueID}/users`,
    );

    if (!usersResponse.ok) {
      console.error(
        `Failed to fetch users: ${usersResponse.status} ${usersResponse.statusText}`,
      );
      return;
    }

    const users = await usersResponse.json();
    console.log(`Users Count: ${users.length}`);

    if (users.length > 0) {
      console.log("\nUser Details:");
      users.forEach((user, index) => {
        console.log(
          `  ${index + 1}. ${user.display_name} (ID: ${user.user_id}) - Owner: ${user.is_owner || false}`,
        );
        if (user.metadata?.team_name) {
          console.log(`     Team: ${user.metadata.team_name}`);
        }
      });
    }

    // Get rosters
    console.log("\nFetching rosters...");
    const rostersResponse = await fetch(
      `https://api.sleeper.app/v1/league/${leagueID}/rosters`,
    );

    if (!rostersResponse.ok) {
      console.error(
        `Failed to fetch rosters: ${rostersResponse.status} ${rostersResponse.statusText}`,
      );
      return;
    }

    const rosters = await rostersResponse.json();
    console.log(`Rosters Count: ${rosters.length}`);

    if (rosters.length > 0) {
      console.log("\nRoster Details:");
      rosters.forEach((roster, index) => {
        console.log(
          `  Roster ${roster.roster_id}: Owner ID ${roster.owner_id || "NULL"}`,
        );
      });
    }

    // Check if it's a dynasty league with previous league
    if (leagueData.previous_league_id) {
      console.log(`\nPrevious League ID: ${leagueData.previous_league_id}`);
    }
  } catch (error) {
    console.error(`Error investigating ${year} league:`, error);
  }
}

async function main() {
  await investigateLeague(league2025ID, "2025");
  await investigateLeague(league2024ID, "2024");
}

main();
