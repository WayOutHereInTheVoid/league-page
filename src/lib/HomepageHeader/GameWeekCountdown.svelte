<script>
	import { onMount, onDestroy } from 'svelte';

	export let countdownData;

	let timeRemaining = {
		days: 0,
		hours: 0,
		minutes: 0,
		seconds: 0
	};
	let countdownInterval = null;

	onMount(() => {
		updateCountdown();
		countdownInterval = setInterval(updateCountdown, 1000);
	});

	onDestroy(() => {
		if (countdownInterval) {
			clearInterval(countdownInterval);
		}
	});

	function updateCountdown() {
		if (!countdownData?.targetDate) return;

		const now = new Date().getTime();
		const target = new Date(countdownData.targetDate).getTime();
		const difference = target - now;

		if (difference > 0) {
			timeRemaining = {
				days: Math.floor(difference / (1000 * 60 * 60 * 24)),
				hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
				minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
				seconds: Math.floor((difference % (1000 * 60)) / 1000)
			};
		} else {
			timeRemaining = { days: 0, hours: 0, minutes: 0, seconds: 0 };
		}
	}

	function getCountdownMessage() {
		if (!countdownData) return '';
		
		const { seasonType, week, isDraftCountdown, draftInfo } = countdownData;
		
		// Draft countdown mode during preseason
		if (isDraftCountdown && seasonType === 'pre') {
			return 'Until Draft Day!';
		}
		// Regular season/postseason modes (existing logic)
		else if (seasonType === 'pre') {
			return 'Until Season Starts';
		} else if (seasonType === 'post') {
			return 'Until Playoffs Continue';
		} else {
			return `Until Week ${week + 1} Lineups Lock`;
		}
	}

	function getCountdownTitle() {
		if (!countdownData) return '⏰ Game Week Countdown';
		
		const { isDraftCountdown } = countdownData;
		
		if (isDraftCountdown) {
			return '🏈 Draft Countdown';
		} else {
			return '⏰ Game Week Countdown';
		}
	}

	function getDraftSubtitle() {
		if (!countdownData?.isDraftCountdown || !countdownData?.draftInfo) return '';
		
		return countdownData.draftInfo.dateString;
	}
</script>

<style>
	.countdown-container {
		text-align: center;
	}

	.countdown-title {
		font-size: 1.2rem;
		font-weight: 600;
		margin-bottom: 1rem;
		opacity: 0.9;
	}

	.countdown-display {
		display: flex;
		justify-content: center;
		gap: 1.5rem;
		margin-bottom: 0.5rem;
	}

	.time-unit {
		display: flex;
		flex-direction: column;
		align-items: center;
		min-width: 60px;
	}

	.time-value {
		font-size: 2.5rem;
		font-weight: 700;
		line-height: 1;
		background: var(--r1);                        // Use theme background color
		border-radius: 8px;
		padding: 0.5rem;
		min-width: 60px;
		border: 2px solid var(--blueOne);             // Use theme primary color
		color: var(--blueOne);                        // Use theme primary color
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);    // Subtle shadow for depth
	}

	.time-label {
		font-size: 0.8rem;
		margin-top: 0.25rem;
		opacity: 0.8;
		font-weight: 500;
	}

	.countdown-message {
		font-size: 1rem;
		opacity: 0.8;
		font-style: italic;
	}

	/* Draft countdown specific styles */
	.draft-mode {
		background: linear-gradient(135deg, var(--blueOne) 0%, var(--blueTwo) 100%);  // Use theme colors
		border-radius: 12px;
		padding: 0.5rem;
		margin: -0.5rem;
		box-shadow: 0 4px 12px rgba(46, 125, 50, 0.3);                              // Green shadow to match theme
	}

	.draft-mode .countdown-title {
		color: #ffffff;                                          // Professional white text on gradient
		font-weight: 700;
		text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);           // Dark shadow for readability
	}

	.draft-mode .time-value {
		background: rgba(255, 255, 255, 0.95);                  // Clean white background
		color: var(--blueOne);                                   // Theme primary color
		border: 2px solid rgba(255, 255, 255, 0.8);            // White border
		font-weight: 800;
		text-shadow: none;                                       // Remove text shadow for clean look
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);              // Enhanced shadow for depth
	}

	.draft-mode .time-label {
		color: #ffffff;                                          // Professional white text
		text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);           // Dark shadow for readability
		font-weight: 600;
		opacity: 1;
	}

	.draft-mode .countdown-message {
		color: #ffffff;                                          // Professional white text
		text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);           // Dark shadow for readability
		font-weight: 600;
		opacity: 1;
	}

	.draft-subtitle {
		font-size: 0.9rem;
		color: #ffffff;                                          // Professional white text
		font-weight: 500;
		margin-top: 0.5rem;
		opacity: 0.9;
	}

	.countdown-left {
		display: none;
	}

	@media (max-width: 768px) {
		.countdown-container {
			display: flex;
			align-items: center;
			justify-content: space-between;
			text-align: left;
		}

		.countdown-left {
			display: block;
			flex: 1;
		}

		.countdown-title {
			font-size: 0.9rem;
			margin-bottom: 0.25rem;
		}

		.countdown-message {
			font-size: 0.8rem;
			margin: 0;
		}

		.countdown-display {
			gap: 0.5rem;
			margin-bottom: 0;
			justify-content: flex-end;
		}
		
		.time-value {
			font-size: 1.2rem;
			min-width: 32px;
			padding: 0.2rem 0.1rem;
		}
		
		.time-unit {
			min-width: 32px;
		}

		.time-label {
			font-size: 0.65rem;
			margin-top: 0.1rem;
		}
	}

	@media (max-width: 480px) {
		.countdown-display {
			gap: 0.25rem;
		}
		
		.time-value {
			font-size: 1rem;
			min-width: 28px;
			padding: 0.15rem 0.05rem;
		}
		
		.time-unit {
			min-width: 28px;
		}

		.time-label {
			font-size: 0.6rem;
		}

		.countdown-title {
			font-size: 0.85rem;
		}

		.countdown-message {
			font-size: 0.75rem;
		}
	}

	/* Show/hide desktop vs mobile layouts */
	@media (min-width: 769px) {
		.countdown-left {
			display: none !important;
		}
		
		.countdown-title:not(.countdown-left .countdown-title) {
			display: block !important;
		}
		
		.countdown-message:not(.countdown-left .countdown-message) {
			display: block !important;
		}
	}
</style>

<div class="countdown-container" class:draft-mode={countdownData?.isDraftCountdown}>
	<!-- Mobile compact layout -->
	<div class="countdown-left">
		<div class="countdown-title">
			{getCountdownTitle()}
		</div>
		<div class="countdown-message">
			{getCountdownMessage()}
		</div>
		{#if countdownData?.isDraftCountdown}
			<div class="draft-subtitle">
				{getDraftSubtitle()}
			</div>
		{/if}
	</div>
	
	<!-- Desktop layout / Mobile countdown numbers -->
	<div>
		<!-- Desktop title (hidden on mobile) -->
		<div class="countdown-title" style="display: none;">
			{getCountdownTitle()}
		</div>
		
		<div class="countdown-display">
			<div class="time-unit">
				<div class="time-value">{timeRemaining.days}</div>
				<div class="time-label">Days</div>
			</div>
			<div class="time-unit">
				<div class="time-value">{timeRemaining.hours}</div>
				<div class="time-label">Hours</div>
			</div>
			<div class="time-unit">
				<div class="time-value">{timeRemaining.minutes}</div>
				<div class="time-label">Minutes</div>
			</div>
			<div class="time-unit">
				<div class="time-value">{timeRemaining.seconds}</div>
				<div class="time-label">Seconds</div>
			</div>
		</div>
		
		<!-- Desktop message (hidden on mobile) -->
		<div class="countdown-message" style="display: none;">
			{getCountdownMessage()}
		</div>
		{#if countdownData?.isDraftCountdown}
			<div class="draft-subtitle" style="display: none;">
				{getDraftSubtitle()}
			</div>
		{/if}
	</div>
</div>
