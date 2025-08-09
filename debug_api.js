// Debug script to test Sleeper API and check user IDs
import { leagueID } from './src/lib/utils/leagueInfo.js';

const currentLeagueID = leagueID;

console.log('=== SLEEPER API DEBUG SCRIPT ===');
console.log('League ID:', currentLeagueID);

async function testSleeperAPI() {
    try {
        console.log('\n=== FETCHING USERS FROM SLEEPER API ===');
        const usersResponse = await fetch(`https://api.sleeper.app/v1/league/${currentLeagueID}/users`);
        
        if (!usersResponse.ok) {
            console.error('Failed to fetch users:', usersResponse.status, usersResponse.statusText);
            return;
        }
        
        const users = await usersResponse.json();
        console.log('Users fetched successfully. Count:', users.length);
        
        console.log('\n=== USER DATA FROM API ===');
        users.forEach((user, index) => {
            console.log(`User ${index + 1}:`);
            console.log(`  User ID: ${user.user_id}`);
            console.log(`  Username: ${user.username}`);
            console.log(`  Display Name: ${user.display_name}`);
            console.log(`  Team Name: ${user.metadata?.team_name || 'N/A'}`);
            console.log(`  Is Owner: ${user.is_owner || false}`);
            console.log('---');
        });
        
        console.log('\n=== FETCHING ROSTERS FROM SLEEPER API ===');
        const rostersResponse = await fetch(`https://api.sleeper.app/v1/league/${currentLeagueID}/rosters`);
        
        if (!rostersResponse.ok) {
            console.error('Failed to fetch rosters:', rostersResponse.status, rostersResponse.statusText);
            return;
        }
        
        const rosters = await rostersResponse.json();
        console.log('Rosters fetched successfully. Count:', rosters.length);
        
        console.log('\n=== ROSTER DATA FROM API ===');
        rosters.forEach((roster, index) => {
            console.log(`Roster ${index + 1}:`);
            console.log(`  Roster ID: ${roster.roster_id}`);
            console.log(`  Owner ID: ${roster.owner_id}`);
            console.log(`  Co-owners: ${roster.co_owners || 'None'}`);
            console.log('---');
        });
        
    } catch (error) {
        console.error('Error fetching from Sleeper API:', error);
    }
}

testSleeperAPI();
