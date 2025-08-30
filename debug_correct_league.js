// Debug script to test with the correct league ID from the document
const correctLeagueID = "1124822402371428352"; // From TRL League Info document (2024 Season)

console.log("=== TESTING WITH CORRECT LEAGUE ID ===");
console.log("Correct League ID from document:", correctLeagueID);

async function testCorrectLeagueID() {
  try {
    console.log("\n=== FETCHING USERS FROM CORRECT LEAGUE ===");
    const usersResponse = await fetch(
      `https://api.sleeper.app/v1/league/${correctLeagueID}/users`,
    );

    if (!usersResponse.ok) {
      console.error(
        "Failed to fetch users:",
        usersResponse.status,
        usersResponse.statusText,
      );
      return;
    }

    const users = await usersResponse.json();
    console.log("Users fetched successfully. Count:", users.length);

    console.log("\n=== USER DATA FROM CORRECT LEAGUE ===");
    users.forEach((user, index) => {
      console.log(`User ${index + 1}:`);
      console.log(`  User ID: ${user.user_id}`);
      console.log(`  Username: ${user.username}`);
      console.log(`  Display Name: ${user.display_name}`);
      console.log(`  Team Name: ${user.metadata?.team_name || "N/A"}`);
      console.log(`  Is Owner: ${user.is_owner || false}`);
      console.log("---");
    });

    console.log("\n=== FETCHING ROSTERS FROM CORRECT LEAGUE ===");
    const rostersResponse = await fetch(
      `https://api.sleeper.app/v1/league/${correctLeagueID}/rosters`,
    );

    if (!rostersResponse.ok) {
      console.error(
        "Failed to fetch rosters:",
        rostersResponse.status,
        rostersResponse.statusText,
      );
      return;
    }

    const rosters = await rostersResponse.json();
    console.log("Rosters fetched successfully. Count:", rosters.length);

    console.log("\n=== ROSTER DATA FROM CORRECT LEAGUE ===");
    rosters.forEach((roster, index) => {
      console.log(`Roster ${index + 1}:`);
      console.log(`  Roster ID: ${roster.roster_id}`);
      console.log(`  Owner ID: ${roster.owner_id}`);
      console.log(`  Co-owners: ${roster.co_owners || "None"}`);
      console.log("---");
    });
  } catch (error) {
    console.error("Error fetching from Sleeper API:", error);
  }
}

testCorrectLeagueID();
