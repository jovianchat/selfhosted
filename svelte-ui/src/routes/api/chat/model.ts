import { LlmSdk } from '$lib/types/llmSettings';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import type { LanguageModel } from 'ai';

export function getModelForLLMProvider(favModel: FavModel) {
	let model: LanguageModel;
	if (favModel.api.endpoint_sdk === LlmSdk.OpenAI) {
		const openai = createOpenAI({
			apiKey: favModel.api.secret_key
		});
		model = openai(favModel.model);
	} else if (favModel.api.endpoint_sdk === LlmSdk.OpenAICompatible) {
		const openai = createOpenAI({
			apiKey: favModel.api.secret_key,
			baseURL: favModel.api.base_url
		});
		model = openai(favModel.model);
	} else if (favModel.api.endpoint_sdk === LlmSdk.Anthropic) {
		const anthropic = createAnthropic({
			apiKey: favModel.api.secret_key
		});
		model = anthropic(favModel.model);
	} else if (favModel.api.endpoint_sdk === LlmSdk.GoogleGenerativeAI) {
		const google = createGoogleGenerativeAI({
			apiKey: favModel.api.secret_key
		});
		model = google(favModel.model);
	} else {
		throw new Error('Unsupported endpoint SDK');
	}

	return model;
}
