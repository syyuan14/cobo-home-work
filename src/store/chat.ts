import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Conversation, LLMModel, Message } from '../types'
import { v4 as uuidv4 } from 'uuid'

import { defaultModels } from '../constants/model'

// 生成唯一ID的工具函数
const generateId = (): string => {
  return uuidv4()
}

interface ChatStore {
  // 状态
  conversations: Conversation[]
  currentConversationId: string | null
  isLoading: boolean

  models: LLMModel[]

  // 会话相关操作
  createConversation: (title?: string) => Conversation
  setCurrentConversation: (conversationId: string) => void
  deleteConversation: (conversationId: string) => void
  getCurrentConversation: () => Conversation | null
  clearConversations: () => void

  // 消息相关操作
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => string
  updateMessage: (messageId: string, content: string, interrupted?: boolean) => void

  // 模型相关操作
  setCurrentModel: (modelId: string) => void
  updateModelConfig: (modelId: string, config: Partial<LLMModel['config']>) => void

  setLoading: (loading: boolean) => void
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      // 初始状态
      conversations: [],
      currentConversationId: null,
      isLoading: false,

      theme: 'light',
      models: defaultModels,

      // 会话相关操作
      createConversation: (title?: string) => {
        const currentConversation = get().getCurrentConversation()
        const newConversation: Conversation = {
          id: generateId(),
          title: title || '新会话',
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          currentModelId: currentConversation?.currentModelId || defaultModels[0].id,
        }

        set(state => ({
          conversations: [...state.conversations, newConversation],
          currentConversationId: newConversation.id,
        }))

        return newConversation
      },

      setCurrentConversation: conversationId => {
        set({
          currentConversationId: conversationId,
          isLoading: false,
        })
      },

      deleteConversation: conversationId => {
        set(state => {
          const updatedConversations = state.conversations.filter(
            conv => conv.id !== conversationId
          )
          return {
            conversations: updatedConversations,
            currentConversationId:
              state.currentConversationId === conversationId
                ? updatedConversations[0]?.id || null
                : state.currentConversationId,
          }
        })
      },

      getCurrentConversation: () => {
        const { conversations, currentConversationId } = get()
        if (!currentConversationId) return null
        return conversations.find(conv => conv.id === currentConversationId) || null
      },

      // 消息相关操作
      addMessage: message => {
        const newMessage: Message = {
          ...message,
          id: generateId(),
          timestamp: Date.now(),
        }

        set(state => ({
          conversations: state.conversations.map(conv =>
            conv.id === state.currentConversationId
              ? {
                  ...conv,
                  messages: [...conv.messages, newMessage],
                  updatedAt: Date.now(),
                }
              : conv
          ),
        }))
        return newMessage.id
      },

      updateMessage: (messageId, content, interrupted?: boolean) => {
        set(state => ({
          conversations: state.conversations.map(conv =>
            conv.id === state.currentConversationId
              ? {
                  ...conv,
                  messages: conv.messages.map(msg =>
                    msg.id === messageId
                      ? {
                          ...msg,
                          content,
                          ...(interrupted !== undefined && { interrupted }),
                        }
                      : msg
                  ),
                  updatedAt: Date.now(),
                }
              : conv
          ),
        }))
      },

      // 模型相关操作
      setCurrentModel: modelId => {
        set(state => ({
          conversations: state.conversations.map(conv =>
            conv.id === state.currentConversationId
              ? { ...conv, currentModelId: modelId, updatedAt: Date.now() }
              : conv
          ),
        }))
      },

      // 更新选中模型的参数
      updateModelConfig: (modelId, config) => {
        set(state => ({
          models: state.models.map(model =>
            model.id === modelId ? { ...model, config: { ...model.config, ...config } } : model
          ),
        }))
      },

      setLoading: loading => {
        set({ isLoading: loading })
      },

      // 清空所有对话
      clearConversations: () => {
        set(() => ({
          conversations: [],
          currentConversationId: null,
        }))
      },
    }),
    {
      name: 'chat-app-storage',
      partialize: state => ({
        conversations: state.conversations,
        currentConversationId: state.currentConversationId,
      }),
    }
  )
)
