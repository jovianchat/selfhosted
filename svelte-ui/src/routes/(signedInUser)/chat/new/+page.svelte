<script lang="ts">
  	import { Chat, type Message } from '@ai-sdk/svelte';
	import { generateChatId } from '.';
	import { llmState } from '../../llmSettings/state.svelte';
	import { saveMsgToDb } from '../[chatId]/state.svelte';

	let defaultPrompts = [
		'What is the weather like today?',
		'Tell me a joke.',
		'Explain quantum physics in simple terms.',
		'How to cook pasta?',
		"What's the latest news?",
		"Translate 'Hello' to Spanish.",
		'How do I learn programming?',
		'What are the top movies right now?',
		'How many planets are in the solar system?'
	];

	let chatId = $state('new');
	let chat = $derived(new Chat({ id: chatId, onFinish }));
	function onFinish() {
		const lastUserAndAssistantMsg: Message[] = chat.messages.slice(-2);
		saveMsgToDb(chatId, lastUserAndAssistantMsg);
	}
</script>

<div class="my-auto flex flex-col">
	<h2 class="mx-auto mb-4 text-xl font-bold">Choose a Default Prompt</h2>
	<div class="grid grid-cols-3 gap-4">
		{#each defaultPrompts as prompt}
			<button
				class="rounded-lg bg-emerald-600 bg-opacity-70 p-3 text-white shadow transition-all hover:bg-emerald-800"
				onclick={async (e) => {
					chatId = await generateChatId(prompt);
					chat.input = prompt;
					chat.handleSubmit(e, {
						body: {
							selectedFavId: llmState.activeFav?.id
						}
					});
				}}
			>
				{prompt}
			</button>
		{/each}
	</div>
</div>
