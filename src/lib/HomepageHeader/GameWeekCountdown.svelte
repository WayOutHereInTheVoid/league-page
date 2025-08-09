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
		
		const { seasonType, week } = countdownData;
		
		if (seasonType === 'pre') {
			return 'Until Season Starts';
		} else if (seasonType === 'post') {
			return 'Until Playoffs Continue';
		} else {
			return `Until Week ${week + 1} Lineups Lock`;
		}
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
		background: rgba(255, 255, 255, 0.15);
		border-radius: 8px;
		padding: 0.5rem;
		min-width: 60px;
		border: 2px solid rgba(255, 255, 255, 0.2);
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

	@media (max-width: 768px) {
		.countdown-display {
			gap: 1rem;
		}
		
		.time-value {
			font-size: 2rem;
			min-width: 50px;
			padding: 0.25rem;
		}
		
		.time-unit {
			min-width: 50px;
		}
		
		.countdown-title {
			font-size: 1.1rem;
		}
	}

	@media (max-width: 480px) {
		.countdown-display {
			gap: 0.5rem;
		}
		
		.time-value {
			font-size: 1.5rem;
			min-width: 40px;
		}
		
		.time-unit {
			min-width: 40px;
		}
	}
</style>

<div class="countdown-container">
	<div class="countdown-title">
		⏰ Game Week Countdown
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
	
	<div class="countdown-message">
		{getCountdownMessage()}
	</div>
</div>
