// 定义消息类型
export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  modelId?: string
  interrupted?: boolean // 标识消息是否被用户中断
}

// 定义LLM模型配置
export interface LLMModelConfig {
  temperature: number
  maxTokens: number
}

// 定义LLM模型类型
export interface LLMModel {
  id: string
  api: string
  name: string
  description: string
  config: LLMModelConfig
}

// 定义对话类型
export interface Conversation {
  id: string
  title: string
  createdAt: number
  updatedAt: number
  currentModelId: string
  messages: Message[]
}

// 应用主题类型
export type Theme = 'light' | 'dark'
