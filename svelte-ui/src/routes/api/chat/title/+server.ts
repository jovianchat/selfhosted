import type { RequestHandler } from '@sveltejs/kit';
import { generateText } from 'ai';
import { getModelForLLMProvider } from '../model';

export const POST: RequestHandler = async ({ request, fetch }) => {
	try {
		const { selectedFavId, input } = await request.json();

		// Get favModel for API Key from axum
		const res_favModel = await fetch(`/axum-api/llm-settings/fav-model/${selectedFavId}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		});
		if (!res_favModel.ok) {
			throw new Error(await res_favModel.text());
		}
		const favModel: FavModel = await res_favModel.json();

		const model = getModelForLLMProvider(favModel);

		const { text } = await generateText({
			model,
			system:
				'This query is for LLM Chat. You generate titles for these chats with strictly less than 6 words & one sentence only.',
			maxTokens: 25,
			temperature: 0.7,
			prompt: input
		});

		return new Response(text, { status: 200 });
	} catch (error) {
		console.error('Error:', error);
		return new Response('Error processing request', { status: 500 });
	}
};
