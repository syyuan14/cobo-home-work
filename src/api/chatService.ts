// 从环境变量获取API基础URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

import type { Message, LLMModelConfig } from '../types'
import { fetchSSE } from '../utils/fetchSSE'

// 定义扩展的LLM模型接口，包含模型特定配置
export interface ExtendedLLMModel {
  id: string
  api: string
  name: string
  description: string
  config: LLMModelConfig
  modelSpecificConfig?: Record<string, number | string | boolean>
}

// 获取模型特定参数的辅助函数
const getModelSpecificParams = (
  modelId: string,
  config: LLMModelConfig
): Record<string, number | string | boolean> => {
  console.log('ysy modelId', modelId)
  // 在这里可以根据不同模型添加特定参数，默认不做处理
  const finalParams = { ...config }

  // 默认参数
  return finalParams
}

// 请求选项接口
export interface RequestOptions {
  stream?: boolean
  temperature?: number
  maxTokens?: number
  // 可以添加更多选项以支持不同模型的特性
}

// LLM请求的抽象统一接口 工厂函数
export const createLLMStream = (
  modelId: string,
  model: ExtendedLLMModel,
  messages: Omit<Message, 'id' | 'timestamp'>[],

  onToken: (token: string) => void,
  onComplete: () => void,

  onError: (error: Error) => void
): (() => void) => {
  // 根据modelId创建模型特定的配置对象
  const modelSpecificConfig = {
    modelId,
    ...getModelSpecificParams(modelId, model.config),
  }

  // 将模型特定配置存储在model对象中，以便在streamLLMResponse中使用
  const modelWithConfig = {
    ...model,
    modelSpecificConfig,
  }

  // 调用streamLLMResponse函数，并传入原始消息和包含特定配置的模型
  return streamLLMResponse(messages, modelWithConfig, onToken, onComplete, onError)
}

// 流式输出的函数
export const streamLLMResponse = (
  messages: Omit<Message, 'id' | 'timestamp'>[],
  model: ExtendedLLMModel,

  onToken: (token: string) => void,
  onComplete: () => void,

  onError: (error: Error) => void
): (() => void) => {
  const modelId = model.id // 从model对象中提取modelId

  // 创建中断函数
  let abortFn: () => void = () => {
    console.log('No active SSE stream to abort')
  }

  const startStreaming = async () => {
    try {
      // 创建一个GET请求到流式API
      // 根据不同的模型选择不同的API端点或处理方式
      const apiEndpoint = `${API_BASE_URL}${model.api}`
      // 设置fetch选项
      const fetchOptions: RequestInit = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          modelId,
          model,
          messages,
          stream: true,
        }),
      }

      // 使用通用的fetchSSE函数处理流式请求
      abortFn = await fetchSSE(
        apiEndpoint,
        fetchOptions,
        data => {
          // 处理接收到的数据
          if (data.token) {
            onToken(data.token)
          }
          if (data.done) {
            onComplete()
          }
        },
        onComplete,
        onError
      )
    } catch (error) {
      console.error('Error in streamLLMResponse:', error)
      onComplete()
      onError(error instanceof Error ? error : new Error('流式传输错误'))
    }
  }

  // 启动流式传输
  startStreaming()

  return () => abortFn()
}
