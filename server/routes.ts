import Router from '@koa/router'
import { handleChat } from './handlers/chatHandler.js'

export const registerRoutes = (router: Router): void => {
  // gpt
  router.post('/api/chat/gpt', handleChat)
  // 豆包
  router.post('/api/chat/doubao', handleChat)
  // deepseek
  router.post('/api/chat/deepseek', handleChat)
}
