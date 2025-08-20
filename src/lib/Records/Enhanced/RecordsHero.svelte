<script>
    import { onMount } from 'svelte';
    import Button from '@smui/button';
    import { Label } from '@smui/button';
    import RecordHeroCard from './components/RecordHeroCard.svelte';
    import AchievementBadge from './components/AchievementBadge.svelte';

    // Props
    let { 
        selectedRecord, 
        achievementGallery, 
        leagueAverages, 
        leagueTeamManagers,
        onRecordSelect 
    } = $props();

    // Hero state
    let featuredAchievements = $state([]);
    let currentHeroIndex = $state(0);
    let autoRotate = $state(true);
    let rotationInterval = $state(null);

    // Featured record rotation
    const setupFeaturedRotation = () => {
        if (!achievementGallery || achievementGallery.length === 0) return;
        
        // Get top 5 achievements for rotation
        featuredAchievements = achievementGallery
            .filter(achievement => achievement.rarity === 'legendary' || achievement.significance >= 75)
            .slice(0, 5);
        
        // If we don't have enough legendary/high-significance records, fill with top achievements
        if (featuredAchievements.length < 3) {
            const remaining = achievementGallery.slice(0, 5 - featuredAchievements.length);
            featuredAchievements = [...featuredAchievements, ...remaining];
        }

        // Start auto-rotation if enabled
        if (autoRotate && featuredAchievements.length > 1) {
            startAutoRotation();
        }
    };

    const startAutoRotation = () => {
        if (rotationInterval) clearInterval(rotationInterval);
        
        rotationInterval = setInterval(() => {
            if (featuredAchievements.length > 1) {
                currentHeroIndex = (currentHeroIndex + 1) % featuredAchievements.length;
            }
        }, 8000); // Rotate every 8 seconds
    };

    const stopAutoRotation = () => {
        if (rotationInterval) {
            clearInterval(rotationInterval);
            rotationInterval = null;
        }
    };

    // Handle manual hero selection
    const selectHero = (index) => {
        currentHeroIndex = index;
        stopAutoRotation();
        autoRotate = false;
        
        // Restart auto-rotation after 15 seconds of inactivity
        setTimeout(() => {
            autoRotate = true;
            if (featuredAchievements.length > 1) {
                startAutoRotation();
            }
        }, 15000);
    };

    // Handle record exploration
    const exploreRecord = (record) => {
        onRecordSelect?.(record);
    };

    // Get manager info for a record
    const getManagerInfo = (record) => {
        if (!leagueTeamManagers || !record.manager) return null;
        
        const managerInfo = leagueTeamManagers.find(manager => 
            manager.roster?.roster_id === record.manager || 
            manager.roster?.roster_id === record.rosterID
        );
        
        return managerInfo || null;
    };

    // Setup rotation when data changes
    $effect(() => {
        setupFeaturedRotation();
        
        return () => {
            stopAutoRotation();
        };
    });

    // Current featured record
    let currentFeaturedRecord = $derived(featuredAchievements[currentHeroIndex] || selectedRecord || null);
</script>

<style>
    .records-hero {
        background: linear-gradient(135deg, var(--headerPrimary) 0%, var(--fff) 100%);
        border-radius: 16px;
        padding: 2rem;
        margin-bottom: 2rem;
        box-shadow: 0 4px 20px rgba(46, 125, 50, 0.1);
        border: 1px solid var(--borderOverride);
        position: relative;
        overflow: hidden;
    }

    .hero-background {
        position: absolute;
        top: 0;
        right: 0;
        width: 100%;
        height: 100%;
        background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M20 20h60v60H20z' fill='none' stroke='%232E7D32' stroke-width='0.5' opacity='0.1'/%3E%3C/svg%3E");
        background-size: 50px 50px;
        pointer-events: none;
    }

    .hero-content {
        position: relative;
        z-index: 2;
    }

    .hero-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        flex-wrap: wrap;
        gap: 1rem;
    }

    .hero-title {
        font-size: 2rem;
        font-weight: 700;
        color: var(--blueOne);
        margin: 0;
        text-shadow: 0 1px 2px rgba(0,0,0,0.1);
    }

    .hero-subtitle {
        font-size: 1rem;
        color: var(--g555);
        margin: 0.25rem 0 0 0;
        opacity: 0.8;
    }

    .rotation-controls {
        display: flex;
        gap: 0.5rem;
        align-items: center;
    }

    .rotation-indicator {
        display: flex;
        gap: 0.25rem;
    }

    .indicator-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--ccc);
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .indicator-dot.active {
        background: var(--blueOne);
        transform: scale(1.2);
    }

    .indicator-dot:hover {
        background: var(--blueTwo);
        transform: scale(1.1);
    }

    .hero-main {
        display: grid;
        grid-template-columns: 1fr;
        gap: 2rem;
        align-items: center;
    }

    .featured-record {
        text-align: center;
    }

    .record-value {
        font-size: 3.5rem;
        font-weight: 900;
        color: var(--blueOne);
        line-height: 1;
        margin: 0.5rem 0;
        text-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .record-title {
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--g333);
        margin: 0 0 0.5rem 0;
    }

    .record-context {
        font-size: 1rem;
        color: var(--g555);
        line-height: 1.4;
        margin: 1rem 0;
        font-style: italic;
    }

    .hero-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 1rem;
        margin-top: 2rem;
    }

    .stat-item {
        text-align: center;
        padding: 1rem;
        background: var(--fff);
        border-radius: 12px;
        border: 1px solid var(--ebebeb);
        box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }

    .stat-value {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--blueOne);
        margin: 0;
    }

    .stat-label {
        font-size: 0.875rem;
        color: var(--g555);
        margin: 0.25rem 0 0 0;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .hero-actions {
        display: flex;
        gap: 1rem;
        justify-content: center;
        margin-top: 2rem;
        flex-wrap: wrap;
    }

    .no-record {
        text-align: center;
        padding: 3rem;
        color: var(--g555);
    }

    .no-record-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
        opacity: 0.5;
    }

    /* Mobile responsiveness */
    @media (max-width: 768px) {
        .records-hero {
            padding: 1.5rem;
            margin-bottom: 1.5rem;
        }

        .hero-title {
            font-size: 1.5rem;
        }

        .record-value {
            font-size: 2.5rem;
        }

        .record-title {
            font-size: 1.25rem;
        }

        .hero-stats {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.75rem;
        }

        .stat-item {
            padding: 0.75rem;
        }

        .stat-value {
            font-size: 1.25rem;
        }

        .hero-actions {
            flex-direction: column;
            align-items: center;
        }
    }

    @media (min-width: 1024px) {
        .hero-main {
            grid-template-columns: 2fr 1fr;
            text-align: left;
        }

        .featured-record {
            text-align: left;
        }
    }

    /* Animation for rotation */
    .featured-record {
        transition: opacity 0.5s ease-in-out;
    }

    .rotating {
        opacity: 0.7;
    }
</style>

<div class="records-hero">
    <div class="hero-background"></div>
    
    <div class="hero-content">
        <!-- Hero Header -->
        <div class="hero-header">
            <div>
                <h1 class="hero-title">League Records Spotlight</h1>
                <p class="hero-subtitle">Featuring the most extraordinary achievements in league history</p>
            </div>
            
            {#if featuredAchievements.length > 1}
                <div class="rotation-controls">
                    <div class="rotation-indicator">
                        {#each featuredAchievements as achievement, index}
                            <button 
                                class="indicator-dot" 
                                class:active={index === currentHeroIndex}
                                onclick={() => selectHero(index)}
                                title={achievement.title}
                            ></button>
                        {/each}
                    </div>
                </div>
            {/if}
        </div>

        {#if currentFeaturedRecord}
            <!-- Featured Record Display -->
            <div class="hero-main">
                <div class="featured-record">
                    <!-- Achievement Badge -->
                    <AchievementBadge 
                        rarity={currentFeaturedRecord.rarity}
                        size="large"
                    />
                    
                    <!-- Record Value -->
                    <div class="record-value">
                        {#if currentFeaturedRecord.value}
                            {currentFeaturedRecord.value.toFixed(1)}
                        {:else}
                            --
                        {/if}
                    </div>
                    
                    <!-- Record Title -->
                    <h2 class="record-title">{currentFeaturedRecord.title || 'Record Achievement'}</h2>
                    
                    <!-- Record Context -->
                    {#if currentFeaturedRecord.description}
                        <p class="record-context">"{currentFeaturedRecord.description}"</p>
                    {/if}
                    
                    <!-- Manager Info -->
                    {#if getManagerInfo(currentFeaturedRecord)}
                        {@const managerInfo = getManagerInfo(currentFeaturedRecord)}
                        <p class="record-context">
                            Achieved by <strong>{managerInfo.name}</strong>
                            {#if currentFeaturedRecord.year}
                                in {currentFeaturedRecord.year}
                            {/if}
                        </p>
                    {/if}
                </div>

                <!-- Quick Stats -->
                {#if currentFeaturedRecord.context}
                    <div class="hero-stats">
                        <div class="stat-item">
                            <div class="stat-value">{currentFeaturedRecord.significance || 0}</div>
                            <div class="stat-label">Impact Score</div>
                        </div>
                        
                        <div class="stat-item">
                            <div class="stat-value">{currentFeaturedRecord.rarity || 'Common'}</div>
                            <div class="stat-label">Rarity</div>
                        </div>
                        
                        {#if currentFeaturedRecord.year}
                            <div class="stat-item">
                                <div class="stat-value">{new Date().getFullYear() - currentFeaturedRecord.year}</div>
                                <div class="stat-label">Years Standing</div>
                            </div>
                        {/if}
                        
                        {#if leagueAverages.weeklyPoints?.mean && currentFeaturedRecord.type === 'weekly'}
                            <div class="stat-item">
                                <div class="stat-value">
                                    {((currentFeaturedRecord.value / leagueAverages.weeklyPoints.mean - 1) * 100).toFixed(0)}%
                                </div>
                                <div class="stat-label">Above Average</div>
                            </div>
                        {/if}
                    </div>
                {/if}
            </div>

            <!-- Hero Actions -->
            <div class="hero-actions">
                <Button 
                    variant="raised" 
                    onclick={() => exploreRecord(currentFeaturedRecord)}
                    class="fantasy-button-primary">
                    <Label>Explore This Record</Label>
                </Button>
                
                {#if featuredAchievements.length > 1}
                    <Button 
                        variant="outlined"
                        onclick={() => {
                            currentHeroIndex = (currentHeroIndex + 1) % featuredAchievements.length;
                        }}>
                        <Label>Next Achievement</Label>
                    </Button>
                {/if}
            </div>
        {:else}
            <!-- No Record State -->
            <div class="no-record">
                <div class="no-record-icon">🏆</div>
                <h3>No Featured Records Available</h3>
                <p>League records are still being processed or no achievements have been set yet.</p>
            </div>
        {/if}
    </div>
</div>
