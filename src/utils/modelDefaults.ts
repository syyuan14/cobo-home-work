// 模型默认配置常量
import { DEFAULT_CONFIGS } from '../constants/model'
import type { LLMModelConfig } from '../types'

// 获取指定模型的默认配置
export const getDefaultConfig = (modelId: string): LLMModelConfig => {
  return DEFAULT_CONFIGS[modelId] || DEFAULT_CONFIGS['mock-gpt']
}
