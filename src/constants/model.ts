import type { LLMModel, LLMModelConfig } from '../types'

export const DEFAULT_CONFIGS: Record<string, LLMModelConfig> = {
  'mock-gpt': {
    temperature: 0.7,
    maxTokens: 1000,
  },
  'mock-doubao': {
    temperature: 0.8,
    maxTokens: 2000,
  },
  'mock-deepseek': {
    temperature: 0.8,
    maxTokens: 2000,
  },
}

// 默认的LLM模型
export const defaultModels: LLMModel[] = [
  {
    id: 'mock-gpt',
    api: '/api/chat/gpt',
    name: 'Mock GPT',
    description: '模拟GPT模型，返回预设响应',

    config: DEFAULT_CONFIGS['mock-gpt'],
  },
  {
    id: 'mock-doubao',
    api: '/api/chat/doubao',
    name: 'Mock Doubao',
    description: '模拟doubao模型，返回预设响应',
    config: DEFAULT_CONFIGS['mock-doubao'],
  },
  {
    id: 'mock-deepseek',
    api: '/api/chat/deepseek',
    name: 'Mock Deepseek',
    description: '模拟deepseek模型，返回预设响应',
    config: DEFAULT_CONFIGS['mock-deepseek'],
  },
]
