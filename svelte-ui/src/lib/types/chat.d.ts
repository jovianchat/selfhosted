import type { UUID } from 'crypto';

declare global {
	interface HistoryChatDetails {
		id: UUID;
		title: string;
	}
	interface UnstarredGroupedHistory {
		time_period: string;
		period_chats: HistoryChatDetails[];
	}
	interface ChatHistory {
		unstarred_history: UnstarredGroupedHistory[];
		starred_history: HistoryChatDetails[];
	}

	// Each chat
	interface ChatDetails {
		id: UUID;
		title: string;
		starred: boolean;
	}
	interface ChatMessage {
		id: string;
		role: 'user' | 'assistant';
		content: string;
		created_at: Date;
	}
	interface Chat {
		details: ChatDetails;
		messages: ChatMessage[];
	}
}
