// Debug script to test managers loading
import { managers } from './src/lib/utils/leagueInfo.js';

console.log('=== MANAGER DEBUG SCRIPT ===');
console.log('Managers array length:', managers.length);
console.log('Managers array exists:', !!managers);

if (managers.length > 0) {
    console.log('\n=== FIRST MANAGER ===');
    console.log(JSON.stringify(managers[0], null, 2));
    
    console.log('\n=== ALL MANAGER IDs ===');
    managers.forEach((manager, index) => {
        console.log(`Manager ${index}: ${manager.name} - ID: ${manager.managerID}`);
    });
} else {
    console.log('ERROR: Managers array is empty!');
}

console.log('\n=== COMPLETE MANAGERS ARRAY ===');
console.log(JSON.stringify(managers, null, 2));
