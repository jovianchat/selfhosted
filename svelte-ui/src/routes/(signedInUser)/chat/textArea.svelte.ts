import { chatState } from './[chatId]/state.svelte';
import { generateResponse, type SseRequestBody } from './[chatId]/chatResponse';
import { llmState } from '../llmSettings/state.svelte';
import { generateChatId } from './new';

class TextAreaState {
	value = $state('');
}
export const textArea = new TextAreaState();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function submitQuery(chatId: any) {
	let sseRequestBody: SseRequestBody = {
		chatId: chatId,
		query: textArea.value,
		selected_fav_model_id: llmState.activeFav!.id
	};
	// New chat
	if (chatId === 'new') {
		sseRequestBody = await generateChatId(sseRequestBody);
	}
	chatState.addQuery(textArea.value);
	textArea.value = '';
	// Generate response for both existing and new chat
	generateResponse(sseRequestBody);
}
