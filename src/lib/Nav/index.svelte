<script>
	import NavSmall from './NavSmall.svelte';
	import NavLarge from './NavLarge.svelte';
    import { page } from '$app/state';
	import IconButton from '@smui/icon-button';
	import { Icon } from '@smui/common';
	import { onMount } from 'svelte';

	// Enhanced scroll-aware navigation state
	let navVisible = $state(true);
	let lastScrollY = $state(0);
	let scrollDirection = $state('up');
	let isScrolling = $state(false);
	let scrollTimeout;
	let isNearTop = $state(true);
	let scrollVelocity = $state(0);
	let previousTimestamp = $state(0);

	// toggle dark mode
	let darkTheme = $state(typeof window === "undefined" || window.matchMedia("(prefers-color-scheme: dark)").matches);
	function switchTheme(currentTheme) {
		currentTheme = !currentTheme;
		let themeLink = document.head.querySelector("#theme");
		if (!themeLink) {
			themeLink = document.createElement("link");
			themeLink.rel = "stylesheet";
			themeLink.id = "theme";
		}
		themeLink.href = `/smui${currentTheme ? "" : "-dark"}.css`;
		document.head
		.querySelector('link[href="/smui-dark.css"]')
		.insertAdjacentElement("afterend", themeLink);
	}

	// Enhanced scroll behavior for sticky navigation
	function handleScroll() {
		if (typeof window === 'undefined') return;

		const currentScrollY = window.scrollY;
		const currentTimestamp = Date.now();
		
		// Calculate scroll velocity for better responsiveness
		const timeDelta = currentTimestamp - previousTimestamp;
		if (timeDelta > 0) {
			scrollVelocity = Math.abs(currentScrollY - lastScrollY) / timeDelta;
		}

		// Improved thresholds based on device and scroll context
		const isMobile = window.innerWidth <= 950;
		const baseThreshold = isMobile ? 20 : 30; // Lower threshold for mobile
		const hideThreshold = isMobile ? 60 : 80; // Adjusted for mobile scrolling patterns
		const velocityThreshold = 0.3; // Minimum velocity to trigger changes
		
		// Determine scroll direction with better precision
		const scrollDelta = currentScrollY - lastScrollY;
		if (Math.abs(scrollDelta) > 3) { // Ignore tiny movements
			scrollDirection = scrollDelta > 0 ? 'down' : 'up';
		}

		// Track if we're near the top of the page
		isNearTop = currentScrollY < hideThreshold;

		// Enhanced show/hide logic
		if (isNearTop) {
			// Always show nav when near top of page
			navVisible = true;
		} else if (scrollDirection === 'up' && 
				   (Math.abs(scrollDelta) > baseThreshold || scrollVelocity > velocityThreshold)) {
			// Show nav when scrolling up with sufficient movement or velocity
			navVisible = true;
		} else if (scrollDirection === 'down' && 
				   (Math.abs(scrollDelta) > baseThreshold || scrollVelocity > velocityThreshold)) {
			// Hide nav when scrolling down with sufficient movement or velocity
			navVisible = false;
		}

		// Update tracking variables
		lastScrollY = currentScrollY;
		previousTimestamp = currentTimestamp;
		isScrolling = true;

		// Clear scroll timeout and set new one
		clearTimeout(scrollTimeout);
		scrollTimeout = setTimeout(() => {
			isScrolling = false;
			// Ensure nav is visible if user stops scrolling near top
			if (isNearTop) {
				navVisible = true;
			}
		}, 100);
	}

	onMount(() => {
		if (typeof window !== 'undefined') {
			// Throttled scroll handler for performance
			let ticking = false;
			
			function scrollHandler() {
				if (!ticking) {
					requestAnimationFrame(() => {
						handleScroll();
						ticking = false;
					});
					ticking = true;
				}
			}

			window.addEventListener('scroll', scrollHandler, { passive: true });
			
			return () => {
				window.removeEventListener('scroll', scrollHandler);
				clearTimeout(scrollTimeout);
			};
		}
	});
</script>

<svelte:head>
	<title>{!page.url.pathname[1] ? 'Home' : page.url.pathname[1].toUpperCase() + page.url.pathname.slice(2)} | League Page</title>
</svelte:head>

<style>
	a {
		display: table;
    	margin: 0 auto;
	}

	/* Enhanced Fixed Navigation with Scroll Behavior */
	nav {
		background-color: var(--fff);
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		width: 100%;
		z-index: 1000;
		border-bottom: 1px solid var(--blueOne);
		box-shadow: 0 2px 12px rgba(46, 125, 50, 0.15);
		
		/* Smooth transitions for show/hide */
		transform: translateY(0);
		transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
		           box-shadow 0.3s ease;
		
		/* Backdrop blur for modern effect (progressive enhancement) */
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
	}

	/* Hidden state when scrolling down */
	nav.nav-hidden {
		transform: translateY(-100%);
		box-shadow: 0 0 0 rgba(46, 125, 50, 0);
	}

	/* Enhanced shadow when scrolling */
	nav.nav-scrolled {
		box-shadow: 0 4px 20px rgba(46, 125, 50, 0.2);
	}

	#logo {
		height: 120px;
		width: auto;
		max-height: 120px;
		display: block;
		margin: 0 auto;
		padding: 8px 0;
		transition: height 0.3s ease, padding 0.3s ease;
	}

	/* Condensed logo when scrolled for efficiency */
	nav.nav-scrolled #logo {
		height: 80px;
		max-height: 80px;
		padding: 4px 0;
	}

    .large {
		display: block;
    }

	.small {
		display: none;
	}

	.container {
		position: absolute;
		top: 0.25em;
		right: 0.25em;
		z-index: 1001;
	}

	:global(.lightDark) {
		color: var(--g555);
		transition: color 0.2s ease;
	}

	:global(.lightDark:hover) {
		color: var(--blueOne);
	}

	/* Mobile logo sizing and responsiveness */
	@media (max-width: 600px) {
		#logo {
			height: 80px;
			max-height: 80px;
			padding: 6px 0;
		}
		
		nav.nav-scrolled #logo {
			height: 60px;
			max-height: 60px;
			padding: 3px 0;
		}
		
		.container {
			top: 0.5em;
			right: 0.5em;
		}
	}

	@media (max-width: 950px) {
		.large {
			display: none;
		}

		.small {
			display: block;
		}
	}

	/* Ensure nav doesn't interfere with page content */
	:global(body) {
		margin: 0;
		padding: 0;
	}

	/* Fallback for browsers without backdrop-filter support */
	@supports not (backdrop-filter: blur(8px)) {
		nav {
			background-color: rgba(255, 255, 255, 0.95);
		}
	}

	/* Dark mode support for fixed navigation */
	:global([data-theme="dark"]) nav {
		background-color: rgba(34, 34, 34, 0.95);
		border-bottom-color: var(--blueTwo);
	}

	/* Smooth performance optimizations */
	nav,
	#logo,
	.container {
		will-change: transform;
	}

	/* Accessibility: Reduce motion for users who prefer it */
	@media (prefers-reduced-motion: reduce) {
		nav,
		#logo {
			transition: none;
		}
	}
</style>

<nav class="{navVisible ? '' : 'nav-hidden'} {lastScrollY > 100 ? 'nav-scrolled' : ''}">
	<a href="/"><img id="logo" alt="league logo" src="https://i.ibb.co/m5BV5JGf/Untitled-design-10.png" /></a>

	<div class="container">
		<IconButton
			toggle
			bind:pressed={darkTheme}
			onclick={() => switchTheme(darkTheme)}
			class="lightDark"
		>
			<Icon class="material-icons" on>dark_mode</Icon>
			<Icon class="material-icons">light_mode</Icon>
		</IconButton>
	</div>

	<div class="large">
		<NavLarge />
	</div>

	<div class="small">
		<NavSmall />
	</div>
</nav>
