<script>
    import { onMount } from 'svelte';
    import Button, { Group, Label } from '@smui/button';
    import LinearProgress from '@smui/linear-progress';

    // Props from parent page
    let { leagueData, totals, stale, leagueTeamManagers } = $props();

    // Simple state for testing
    let loading = $state(false);
    let error = $state(null);
    let testMessage = $state("Enhanced Records Test Component Loaded");

    // Simple test function
    const testEnhancedFunction = async () => {
        try {
            loading = true;
            console.log('🧪 Testing enhanced records import...');
            
            const { getEnhancedLeagueRecords } = await import('$lib/utils/helperFunctions/enhancedLeagueRecords.js');
            console.log('✅ Enhanced function imported successfully');
            
            testMessage = "Enhanced function imported successfully!";
            
        } catch (err) {
            console.error('❌ Test failed:', err);
            error = err.message;
            testMessage = `Test failed: ${err.message}`;
        } finally {
            loading = false;
        }
    };

    onMount(() => {
        console.log('🧪 Test component mounted');
        testEnhancedFunction();
    });
</script>

<div style="padding: 2rem; text-align: center;">
    <h2>Enhanced Records Test</h2>
    
    {#if loading}
        <p>Testing enhanced records...</p>
        <LinearProgress indeterminate />
    {:else if error}
        <div style="color: red; background: #ffe6e6; padding: 1rem; border-radius: 8px; margin: 1rem 0;">
            <h3>Error Detected</h3>
            <p>{error}</p>
        </div>
    {:else}
        <div style="color: green; background: #e6ffe6; padding: 1rem; border-radius: 8px; margin: 1rem 0;">
            <h3>Status</h3>
            <p>{testMessage}</p>
        </div>
    {/if}
    
    <div style="margin-top: 2rem;">
        <h3>Debug Information</h3>
        <p><strong>League Data Available:</strong> {!!leagueData}</p>
        <p><strong>Totals Available:</strong> {!!totals}</p>
        <p><strong>Team Managers Available:</strong> {!!leagueTeamManagers}</p>
        <p><strong>Stale Flag:</strong> {stale}</p>
    </div>

    <div style="margin-top: 2rem;">
        <Button onclick={testEnhancedFunction} variant="raised">
            <Label>Retry Test</Label>
        </Button>
    </div>
</div>
