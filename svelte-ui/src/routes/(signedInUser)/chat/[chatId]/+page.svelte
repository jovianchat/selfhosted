<script lang="ts">
	import { afterNavigate, beforeNavigate } from '$app/navigation';
	import { marked } from 'marked';
	import { tick } from 'svelte';
	import { Chat } from '@ai-sdk/svelte';

	const { data } = $props();
	const { chatDetails } = $derived(data);
	const { messages } = $derived(
		new Chat({
			id: chatDetails.id
			// initialMessages
		})
	);

	beforeNavigate(({ from, to, cancel }) => {
		if (from?.url.pathname === to?.url.pathname) {
			cancel();
		}
	});
	afterNavigate(() => scrollToBottom({ instant: true }));

	// Delay settings
	let scrollTimeout: NodeJS.Timeout | null = null;
	const scrollToBottom = ({ instant = false } = {}) => {
		// Clear the previous timeout if exists to reduce scroll events
		if (scrollTimeout) clearTimeout(scrollTimeout);

		// Set a timeout to delay scroll calculation by 50 ms
		scrollTimeout = setTimeout(() => {
			tick().then(() => {
				window.scrollTo({
					top: document.body.scrollHeight,
					behavior: instant ? 'instant' : 'smooth'
				});
			});
		}, 30);
	};
	// svelte:window eventListeners
	let userScrolledUp = $state(false);
	function handleWheel(event: WheelEvent) {
		if (event.deltaY < 0) {
			userScrolledUp = true;
		}
	}
	function handleScrollBottom() {
		const isAtBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 5;
		if (isAtBottom) {
			userScrolledUp = false; // Reset the flag when user reaches bottom
		}
	}

	// Scroll on dependency change
	$effect.pre(() => {
		messages;

		// let scrollUp = window.scrollY + window.innerHeight < document.body.scrollHeight - 1;
		if (messages.length > 0 && !userScrolledUp) {
			scrollToBottom();
		}
	});
</script>

<svelte:window onscroll={handleScrollBottom} onwheel={handleWheel} />

<div class="flex flex-col gap-2">
	{#each messages as message}
		{#if message.role == 'user'}
			<div class="query_bg custom_border prose prose-sm ml-auto w-fit max-w-[92%] overflow-auto">
				<div class="prose-cyan whitespace-pre px-3 py-2 shadow-sm">
					{message.content}
				</div>
			</div>
		{:else if message.role == 'assistant'}
			<div class="prose min-w-full">
				<div class="prose-cyan rounded-lg px-2 py-1">
					{@html marked.parse(message.content)}
				</div>
			</div>
		{/if}
	{/each}
</div>

<style lang="postcss">
	.custom_border {
		border-width: 1px;
		border-color: var(--fallback-bc, oklch(var(--bc) / 0.2));
	}
	.query_bg {
		@apply bg-base-300 text-base-content;
		border-radius: 0.75rem;
	}
</style>
