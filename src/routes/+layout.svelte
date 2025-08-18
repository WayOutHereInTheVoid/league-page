<!-- __layout.svelte -->
<script>
	import { Nav, Footer } from "$lib/components"
    import { dev } from '$app/environment';
    import { injectAnalytics } from '@vercel/analytics/sveltekit';
 
    injectAnalytics({ mode: dev ? 'development' : 'production' });
</script>

<style>
    /* Layout styling for fixed navigation */
    main {
        min-height: 100vh;
        position: relative;
    }
    
    .content-wrapper {
        /* Account for fixed navigation height */
        padding-top: 140px;
        transition: padding-top 0.3s ease;
    }
    
    /* Mobile responsive padding */
    @media (max-width: 600px) {
        .content-wrapper {
            padding-top: 100px;
        }
    }
</style>

<main>
    <Nav /> <!-- Fixed navigation at top -->
    
    <div class="content-wrapper">
        <slot />
    </div>

    <Footer /> <!-- Footer at bottom -->
</main>
