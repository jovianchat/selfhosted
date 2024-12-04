import { sidebarState } from '$/components/layout/sidebar.svelte';
import { goto } from '$app/navigation';
import { llmState } from '../../llmSettings/state.svelte';

export async function generateChatId(input: string) {
	const res = await fetch('/api/chat/title', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			input,
			selectedFavId: llmState.activeFav!.id
		})
	});
	const title = await res.text();
	// Save title to DB and get title from DB
	const access_token = await (await fetch('/hooks_fetchHandler')).text();
	const resId = await fetch(`/axum-api/chat/new`, {
		method: 'POST',
		headers: {
			'Content-Type': 'text/plain',
			Authorization: `Bearer ${access_token}`
		},
		body: title
	});
	if (resId.ok) {
		const { id, title }: HistoryChatDetails = await resId.json();
		sidebarState.addUnstarredChatToHistory({ id, title });
		await goto(`/chat/${id}`);

		return id;
	} else {
		throw new Error(await resId.text());
	}
}
