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
        /* Account for fixed navigation height with improved mobile consideration */
        padding-top: 130px;
        transition: padding-top 0.3s ease;
    }
    
    /* Mobile responsive padding - adjusted for mobile nav behavior */
    @media (max-width: 600px) {
        .content-wrapper {
            padding-top: 90px;
        }
    }
    
    /* Tablet responsive padding */
    @media (max-width: 950px) and (min-width: 601px) {
        .content-wrapper {
            padding-top: 110px;
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
