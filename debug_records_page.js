// TEMPORARY DEBUG SCRIPT
// Add this to the browser console to check data status

console.log('=== RECORDS PAGE DEBUG ===');
console.log('Current URL:', window.location.href);
console.log('Page loaded at:', new Date().toLocaleTimeString());

// Check if the main data variables exist
setTimeout(() => {
    console.log('--- Checking for Records data ---');
    
    // Try to access the component's data through window or inspect elements
    const recordsElements = document.querySelectorAll('[data-testid*="record"]');
    console.log('Records elements found:', recordsElements.length);
    
    const tables = document.querySelectorAll('table');
    console.log('Tables found:', tables.length);
    
    const dataTableElements = document.querySelectorAll('.mdc-data-table');
    console.log('SMUI DataTable elements found:', dataTableElements.length);
    
    // Check for any visible content
    const recordsContainer = document.querySelector('.records-container') || document.querySelector('[class*="record"]');
    if (recordsContainer) {
        console.log('Records container found:', recordsContainer);
        console.log('Container children:', recordsContainer.children.length);
    } else {
        console.log('❌ No records container found');
    }
    
}, 2000); // Wait 2 seconds for page to load
