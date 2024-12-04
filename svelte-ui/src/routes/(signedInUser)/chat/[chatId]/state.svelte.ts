import type { Message } from 'ai';

class GlobalChatState {
	// Starred and title needed for sidebar too alongside page
	starred = $state(false);
	title = $state('');
}

export const chatState = new GlobalChatState();

export async function saveMsgToDb(chatId: string, userAndAssistentMsg: Message[]) {
	const access_token = await (await fetch('/hooks_fetchHandler')).text();
	// Rename 'createdAt' to 'created_at' in each message object
	const modifiedMessages = userAndAssistentMsg.map((msg) => {
		const { createdAt, ...rest } = msg; // Destructure the object
		return { ...rest, created_at: createdAt }; // Rename 'createdAt' to 'created_at'
	});
	const res = await fetch(`/axum-api/chat/${chatId}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${access_token}`
		},
		body: JSON.stringify(modifiedMessages)
	});
	if (!res.ok) {
		throw new Error(await res.text());
	}
}
