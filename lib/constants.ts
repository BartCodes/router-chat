export interface OpenRouterModel {
  id: string;
  name: string;
}

export const SUPPORTED_MODELS: OpenRouterModel[] = [
  {
    id: 'nousresearch/deephermes-3-llama-3-8b-preview:free',
    name: 'Llama 3 8B Preview',
  },
  {
    id: 'meta-llama/llama-3.3-70b-instruct:free',
    name: 'Llama 3.3 70B Instruct',
  },
  {
    id: 'deepseek/deepseek-chat-v3-0324:free',
    name: 'DeepSeek V3 0324',
  }
];

export const DEFAULT_MODEL_ID = 'meta-llama/llama-3.2-3b-instruct:free'; 