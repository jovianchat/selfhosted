import type { RequestHandler } from '@sveltejs/kit';
import { streamText } from 'ai';
import { getModelForLLMProvider } from './model';

export const POST: RequestHandler = async ({ request, fetch }) => {
	try {
		// console.log('request', await request.json());
		const { selectedFavId, messages } = await request.json();

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

		const result = streamText({
			model,
			system: favModel.prompt.system_prompt,
			messages
		});

		return result.toDataStreamResponse();
	} catch (error) {
		console.error('Error:', error);
		return new Response('Error processing request', { status: 500 });
	}
};
