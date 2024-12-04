import type { RequestHandler } from '@sveltejs/kit';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText, type LanguageModel } from 'ai';
import { LlmSdk } from '$lib/types/llmSettings';
import { createAnthropic } from '@ai-sdk/anthropic';

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

		let model: LanguageModel;
		if (favModel.api.endpoint_sdk === LlmSdk.OpenAI) {
			const openai = createOpenAI({
				apiKey: favModel.api.secret_key
			});
			model = openai(favModel.model);
		} else if (favModel.api.endpoint_sdk === LlmSdk.Anthropic) {
			const anthropic = createAnthropic({
				apiKey: favModel.api.secret_key
			});
			model = anthropic(favModel.model);
		} else if (favModel.api.endpoint_sdk === LlmSdk.OpenAICompatible) {
			const openai = createOpenAI({
				apiKey: favModel.api.secret_key,
				baseURL: favModel.api.base_url
			});
			model = openai(favModel.model);
		} else {
			throw new Error('Unsupported endpoint SDK');
		}

		const { text } = await generateText({
			model,
			system:
				'This query is for LLM Chat. You generate titles for these chats with strictly less than 6 words & one sentence only.',
			maxTokens: 10,
			temperature: 0.3,
			prompt: input
		});

		return new Response(text, { status: 200 });
	} catch (error) {
		console.error('Error:', error);
		return new Response('Error processing request', { status: 500 });
	}
};
