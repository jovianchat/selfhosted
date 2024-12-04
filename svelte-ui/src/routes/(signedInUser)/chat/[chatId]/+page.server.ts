import type { Message } from 'ai';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, fetch }) => {
	const chatId = params.chatId;

	const res = await fetch(`/axum-api/chat/${chatId}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json'
		}
	});
	if (res.ok) {
		const chat: Chat = await res.json(); // Rename 'created_at' to 'createdAt' in each message object
		const messages: Message[] = chat.messages.map((msg) => {
			const { created_at, ...rest } = msg; // Destructure the object
			return { ...rest, createdAt: created_at };
		});
		return { chat, messages };
	} else {
		throw new Error(await res.text());
	}
};
