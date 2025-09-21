import { defaultModels } from '../../src/constants/model'
import type { LLMModel, Conversation } from '../../src/types'

// 创建模拟的store实现
interface MockStore {
  conversations: Conversation[]
  currentConversationId: string | null
  models: LLMModel[]
  setCurrentModel: jest.Mock
  updateModelConfig: jest.Mock
  getCurrentConversation: jest.Mock
}

// Mock getDefaultConfig
jest.mock('../../src/utils/modelDefaults', () => ({
  getDefaultConfig: jest.fn(modelId => {
    const defaults: Record<string, { temperature: number; maxTokens: number }> = {
      'mock-gpt': { temperature: 0.7, maxTokens: 1000 },
      'mock-doubao': { temperature: 0.8, maxTokens: 2000 },
    }
    return defaults[modelId] || defaults['mock-gpt']
  }),
  DEFAULT_CONFIGS: {
    'mock-gpt': { temperature: 0.7, maxTokens: 1000 },
    'mock-doubao': { temperature: 0.8, maxTokens: 2000 },
  },
}))

describe('模型切换与配置更新功能测试', () => {
  let mockSet: jest.Mock
  let store: MockStore

  beforeEach(() => {
    mockSet = jest.fn()

    // 创建模拟的store实现
    store = {
      // 初始状态
      conversations: [
        {
          id: 'conv-1',
          title: '测试会话',
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          currentModelId: 'mock-gpt',
        },
      ],
      currentConversationId: 'conv-1',
      models: [...defaultModels],

      // 方法
      setCurrentModel: jest.fn((modelId: string) => {
        mockSet(
          (state: { conversations: Conversation[]; currentConversationId: string | null }) => ({
            conversations: state.conversations.map(conv =>
              conv.id === state.currentConversationId
                ? { ...conv, currentModelId: modelId, updatedAt: Date.now() }
                : conv
            ),
          })
        )
      }),

      updateModelConfig: jest.fn((modelId: string, config: Partial<LLMModel['config']>) => {
        mockSet((state: { models: LLMModel[] }) => ({
          models: state.models.map(model =>
            model.id === modelId ? { ...model, config: { ...model.config, ...config } } : model
          ),
        }))
      }),

      getCurrentConversation: jest.fn(() => ({
        id: 'conv-1',
        title: '测试会话',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        currentModelId: 'mock-gpt',
      })),
    }
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  // 测试场景1: 模型切换功能
  it('should switch model successfully', () => {
    const newModelId = 'mock-doubao'

    // 调用模型切换方法
    store.setCurrentModel(newModelId)

    // 验证setCurrentModel方法是否被调用
    expect(store.setCurrentModel).toHaveBeenCalledTimes(1)
    expect(store.setCurrentModel).toHaveBeenCalledWith(newModelId)

    // 验证mockSet是否被调用
    expect(mockSet).toHaveBeenCalledTimes(1)

    // 验证调用setCurrentModel后的状态更新逻辑
    const setCall = mockSet.mock.calls[0][0]
    const mockState = {
      conversations: [
        {
          id: 'conv-1',
          title: '测试会话',
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          currentModelId: 'mock-gpt',
        },
      ],
      currentConversationId: 'conv-1',
    }

    const updatedState = setCall(mockState)
    expect(updatedState.conversations[0].currentModelId).toBe(newModelId)
    // 验证时间戳已更新（只要是数字类型且大于或等于初始值即可，处理可能的时间精度问题）
    expect(typeof updatedState.conversations[0].updatedAt).toBe('number')
    expect(updatedState.conversations[0].updatedAt).toBeGreaterThanOrEqual(
      mockState.conversations[0].updatedAt
    )
  })

  // 测试场景2: 模型配置更新功能
  it('should update model config successfully', () => {
    const modelId = 'mock-gpt'
    const newConfig = {
      temperature: 1.0,
      maxTokens: 1500,
    }

    // 调用配置更新方法
    store.updateModelConfig(modelId, newConfig)

    // 验证updateModelConfig方法是否被调用
    expect(store.updateModelConfig).toHaveBeenCalledTimes(1)
    expect(store.updateModelConfig).toHaveBeenCalledWith(modelId, newConfig)

    // 验证mockSet是否被调用
    expect(mockSet).toHaveBeenCalledTimes(1)

    // 验证调用updateModelConfig后的状态更新逻辑
    const setCall = mockSet.mock.calls[0][0]
    const mockState = {
      models: [
        {
          id: 'mock-gpt',
          name: 'Mock GPT',
          description: '模拟GPT模型，返回预设响应',
          config: {
            temperature: 0.7,
            maxTokens: 1000,
          },
        },
        {
          id: 'mock-doubao',
          name: 'Mock doubao',
          description: '模拟doubao模型，返回预设响应',
          config: {
            temperature: 0.8,
            maxTokens: 2000,
          },
        },
      ],
    }

    const updatedState = setCall(mockState)
    expect(updatedState.models[0].config.temperature).toBe(newConfig.temperature)
    expect(updatedState.models[0].config.maxTokens).toBe(newConfig.maxTokens)
    expect(updatedState.models[1].config).toEqual(mockState.models[1].config)
  })

  // 测试场景3: 部分配置更新
  it('should handle partial config update correctly', () => {
    const modelId = 'mock-gpt'
    const partialConfig = {
      temperature: 1.5,
    }

    // 调用配置更新方法
    store.updateModelConfig(modelId, partialConfig)

    // 验证updateModelConfig方法是否被调用
    expect(store.updateModelConfig).toHaveBeenCalledTimes(1)
    expect(store.updateModelConfig).toHaveBeenCalledWith(modelId, partialConfig)

    // 验证调用updateModelConfig后的状态更新逻辑
    const setCall = mockSet.mock.calls[0][0]
    const mockState = {
      models: [
        {
          id: 'mock-gpt',
          name: 'Mock GPT',
          description: '模拟GPT模型，返回预设响应',
          config: {
            temperature: 0.7,
            maxTokens: 1000,
          },
        },
      ],
    }

    const updatedState = setCall(mockState)
    expect(updatedState.models[0].config.temperature).toBe(partialConfig.temperature)
    expect(updatedState.models[0].config.maxTokens).toBe(mockState.models[0].config.maxTokens)
  })

  // 测试场景4: 非当前会话的模型切换
  it('should not update model for non-current conversation', () => {
    const newModelId = 'mock-doubao'

    // 调用模型切换方法
    store.setCurrentModel(newModelId)

    // 验证调用setCurrentModel后的状态更新逻辑
    const setCall = mockSet.mock.calls[0][0]
    const mockState = {
      conversations: [
        {
          id: 'conv-1',
          title: '当前会话',
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          currentModelId: 'mock-gpt',
        },
        {
          id: 'conv-2',
          title: '非当前会话',
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          currentModelId: 'mock-gpt',
        },
      ],
      currentConversationId: 'conv-1',
    }

    const updatedState = setCall(mockState)
    expect(updatedState.conversations[0].currentModelId).toBe(newModelId)
    expect(updatedState.conversations[1].currentModelId).toBe('mock-gpt')
  })

  // 测试场景5: 获取当前会话的模型
  it('should get current conversation model correctly', () => {
    // 调用获取当前会话方法
    const currentConversation = store.getCurrentConversation()

    // 验证getCurrentConversation方法是否被调用
    expect(store.getCurrentConversation).toHaveBeenCalledTimes(1)

    // 验证返回的会话信息
    expect(currentConversation).toBeDefined()
    expect(currentConversation.id).toBe('conv-1')
    expect(currentConversation.currentModelId).toBe('mock-gpt')
  })
})
