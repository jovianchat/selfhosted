// Import or export anything needed to make the types work globally

declare global {
	interface PromptConfig {
		id?: number;
		name: string;
		max_tokens: number;
		temperature: number;
		system_prompt: string;
	}

	// type LlmSdk = 'OpenAI' | 'Anthropic' | 'Together';
	interface ApiConfig {
		id: number | '';
		name: string;
		endpoint_sdk: LlmSdk;
		secret_key?: string;
		base_url?: string;
		models?: string[];
	}

	interface FavModel {
		id: number;
		api: ApiConfig;
		model: string;
		prompt: PromptConfig;
	}

	interface LLMSettings {
		apiConfigs: ApiConfig[];
		promptConfigs: PromptConfig[];
		favModels: FavModel[];
	}
}

export enum LlmSdk {
	OpenAI = 'OpenAI',
	Anthropic = 'Anthropic',
	OpenAICompatible = 'OpenAICompatible'
}
