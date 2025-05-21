export interface OpenRouterModel {
  id: string;
  name: string;
}

export const SUPPORTED_MODELS: OpenRouterModel[] = [
  {
    id: 'meta-llama/llama-3.2-3b-instruct:free',
    name: 'Llama 3.2 3B Instruct',
  },
  {
    id: 'google/gemma-3-1b-it:free',
    name: 'Gemma 3 1B',
  },
  {
    id: 'deepseek/deepseek-chat-v3-0324:free',
    name: 'DeepSeek V3 0324',
  },
  {
    id: 'deepseek/deepseek-r1:free',
    name: 'DeepSeek R1',
  }
];

export const DEFAULT_MODEL_ID = 'meta-llama/llama-3.2-3b-instruct:free'; 