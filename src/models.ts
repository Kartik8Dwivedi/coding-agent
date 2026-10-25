import { ChatOpenAI, type ChatOpenAIFields } from '@langchain/openai';
import AppConfig, { type AppConfigType } from './config/AppConfig.js';

// Every AppConfig key that ends in "_API_KEY", e.g. 'OPENAI_API_KEY'.
type ApiKeyName = Extract<keyof AppConfigType, `${string}_API_KEY`>;

export interface Provider {
  readonly name: string;
  readonly env_var: ApiKeyName;
  readonly if_free: boolean;
  readonly base_url: string | null;
  readonly model: string;
}

const PROVIDERS: Provider[] = [
  {
    name: 'OpenAI',
    env_var: 'OPENAI_API_KEY',
    if_free: false,
    base_url: 'https://api.openai.com/v1',
    model: 'gpt-3.5-turbo',
  },
  {
    name: 'Groq',
    env_var: 'GROQ_API_KEY',
    if_free: false,
    base_url: 'https://api.groq.com/openai/v1',
    model: 'groq-3.5-turbo',
  },
  {
    name: 'Gemini',
    env_var: 'GEMINI_API_KEY',
    if_free: false,
    base_url: 'https://generativelanguage.googleapis.com/v1beta/openai/',
    model: 'gemini-flash-latest',
  },
];

function selectProvider(): [Provider, string] {
  for (const provider of PROVIDERS) {
    const apiKey = AppConfig[provider.env_var];
    if (apiKey) {
      return [provider, apiKey];
    }
  }
  throw new Error(
    'No valid provider found. Please set the appropriate environment variable.',
  );
}

export function buildChatModel(): [ChatOpenAI, Provider] {
  const [provider, apiKey] = selectProvider();

  const config: ChatOpenAIFields = {
    model: provider.model,
    apiKey: apiKey,
  };

  if (provider.base_url !== null) {
    config.configuration = {
      baseURL: provider.base_url,
    };
  }

  return [new ChatOpenAI(config), provider];
}
