import type { Context } from 'koa'
import { generateMockResponse } from '../utils/mockGenerator.js'

// 定义消息类型
interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

// 定义模型类型
interface LLMModel {
  id: string
  name: string
  description?: string
}

// 模拟API调用延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const handleChat = async (ctx: Context): Promise<void> => {
  try {
    const {
      messages,
      model,
      stream = false,
    } = ctx.request.body as { messages: Message[]; model: LLMModel; stream?: boolean }

    if (!messages || !model || !model.id) {
      ctx.status = 400
      ctx.body = { error: '缺少必要的参数: messages 或 model' }
      return
    }

    // 获取最新的用户消息
    const userMessage = messages.filter((msg: Message) => msg.role === 'user').pop()?.content || ''

    // 生成模拟响应
    const fullResponse = generateMockResponse(userMessage, model.id)

    if (stream) {
      // 流式响应
      ctx.status = 200
      ctx.set('Content-Type', 'text/event-stream')
      ctx.set('Cache-Control', 'no-cache')
      ctx.set('Connection', 'keep-alive')

      // 模拟思考延迟
      await delay(800 + Math.random() * 1200)

      // 将响应分割成token
      const tokens = fullResponse.split('')

      // 逐个发送token
      for (const token of tokens) {
        ctx.res.write(`data: ${JSON.stringify({ token })}\n\n`)
        await delay(Math.random() * 30)
      }

      // 发送结束信号
      ctx.res.write(`data: ${JSON.stringify({ done: true })}\n\n`)
      ctx.res.end()
    } else {
      // 非流式响应
      ctx.status = 200
      await delay(1500 + Math.random() * 2000)
      ctx.body = {
        content: fullResponse,
        modelId: model.id,
        timestamp: Date.now(),
      }
    }
  } catch (error) {
    console.error('处理聊天请求时出错:', error)
    ctx.status = 500
    ctx.body = { error: '处理请求时发生错误' }
  }
}
