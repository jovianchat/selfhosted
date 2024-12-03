import type { RequestHandler } from '@sveltejs/kit';
import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { LlmSdk } from '$lib/types/llmSettings';
import { createAnthropic } from '@ai-sdk/anthropic';

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

		let model;
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
