import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Message } from '../../src/types'

// Mock相关依赖 - 使用Jest的mock功能
const mockUseChatStore = jest.fn()
const mockCreateLLMStream = jest.fn(() => jest.fn())

// 手动mock模块
jest.mock('../../src/store/chat', () => ({
  __esModule: true,
  useChatStore: mockUseChatStore,
}))

jest.mock('../../src/api/chatService', () => ({
  __esModule: true,
  createLLMStream: mockCreateLLMStream,
}))

// Mock MessageBubble组件，添加data-testid属性
jest.mock('../../src/components/main/content/message-bubble', () => ({
  __esModule: true,
  default: ({ message, modelName, onRetry }: any) => (
    <div data-testid="message-bubble" data-role={message.role} data-id={message.id}>
      <div className="message-content">{message.content}</div>
      {modelName && <div className="model-name">{modelName}</div>}
      {message.interrupted && onRetry && (
        <button className="retry-button" onClick={onRetry} data-testid="retry-button">
          重试
        </button>
      )}
    </div>
  ),
}))

// Mock样式文件
jest.mock('../../src/components/chat/MessageList.module.scss', () => ({
  container: 'container',
  emptyState: 'emptyState',
  emptyStateContent: 'emptyStateContent',
  emptyStateIcon: 'emptyStateIcon',
  emptyStateTitle: 'emptyStateTitle',
  emptyStateDescription: 'emptyStateDescription',
  loadingContainer: 'loadingContainer',
  typingIndicator: 'typingIndicator',
  typingDot: 'typingDot',
  dot1: 'dot1',
  dot2: 'dot2',
  dot3: 'dot3',
  loadingText: 'loadingText',
}))

// 动态导入MessageList组件
let MessageList: React.ElementType

beforeAll(async () => {
  // 使用import()函数动态导入组件，避免require
  const module = await import('../../src/components/main/content/message-list')
  MessageList = module.default
})

// 重置mock
beforeEach(() => {
  jest.clearAllMocks()

  // 设置默认的mock返回值
  mockUseChatStore.mockReturnValue({
    updateMessage: jest.fn(),
    isLoading: false,
    setLoading: jest.fn(),
    setStreaming: jest.fn(),
    getCurrentConversation: jest.fn(),
    models: [
      {
        id: 'model-1',
        name: '测试模型',
        description: '测试描述',
        config: { temperature: 0.7, maxTokens: 1000 },
      },
    ],
  })
})

describe('MessageList组件测试', () => {
  // 创建测试用的消息数据
  const createTestMessage = (overrides: Partial<Message> = {}): Message => ({
    id: `message-${Date.now()}`,
    content: '测试消息内容',
    role: 'user',
    timestamp: Date.now(),
    modelId: 'model-1',
    ...overrides,
  })

  // 测试空状态渲染
  it('应该在没有消息时显示空状态', () => {
    render(<MessageList messages={[]} models={{ 'model-1': '测试模型' }} />)

    expect(screen.getByText('开始对话吧')).toBeInTheDocument()
    expect(screen.getByText('输入你的问题，我会尽力为你提供帮助')).toBeInTheDocument()
  })

  // 测试用户消息渲染 - 重点测试发消息渲染功能
  it('应该正确渲染用户发送的消息', () => {
    const userMessage = createTestMessage({
      role: 'user',
      content: '你好，AI助手！',
    })

    render(<MessageList messages={[userMessage]} models={{ 'model-1': '测试模型' }} />)

    // 验证消息是否正确渲染
    const messageBubbles = screen.getAllByTestId('message-bubble')
    expect(messageBubbles).toHaveLength(1)
    expect(messageBubbles[0]).toHaveAttribute('data-role', 'user')
    expect(screen.getByText('你好，AI助手！')).toBeInTheDocument()
  })

  // 测试多条消息渲染
  it('应该正确渲染多条消息和AI回复', () => {
    const messages: Message[] = [
      createTestMessage({
        role: 'user',
        content: '你好，AI助手！',
        id: 'message-1',
      }),
      createTestMessage({
        role: 'assistant',
        content: '你好！我是AI助手，有什么可以帮助你的吗？',
        id: 'message-2',
      }),
      createTestMessage({
        role: 'user',
        content: '如何编写一个测试用例？',
        id: 'message-3',
      }),
      createTestMessage({
        role: 'assistant',
        content: '编写测试用例需要考虑测试场景、预期结果和断言...',
        id: 'message-4',
      }),
    ]

    render(<MessageList messages={messages} models={{ 'model-1': '测试模型' }} />)

    // 验证消息数量是否正确
    const messageBubbles = screen.getAllByTestId('message-bubble')
    expect(messageBubbles).toHaveLength(4)

    // 验证消息内容是否正确
    expect(screen.getByText('你好，AI助手！')).toBeInTheDocument()
    expect(screen.getByText('你好！我是AI助手，有什么可以帮助你的吗？')).toBeInTheDocument()
    expect(screen.getByText('如何编写一个测试用例？')).toBeInTheDocument()
    expect(screen.getByText('编写测试用例需要考虑测试场景、预期结果和断言...')).toBeInTheDocument()
  })

  // 测试加载状态
  it('应该在加载时显示加载指示器', async () => {
    // 覆盖默认的mock返回值，设置isLoading为true
    mockUseChatStore.mockReturnValue({
      updateMessage: jest.fn(),
      isLoading: true,
      setLoading: jest.fn(),
      setStreaming: jest.fn(),
      getCurrentConversation: jest.fn(),
      models: [],
    })

    render(<MessageList messages={[]} models={{}} />)

    // 验证加载指示器是否显示
    expect(screen.getByText('AI 正在思考...')).toBeInTheDocument()

    // 验证加载容器是否存在
    const container = document.querySelector('.container')
    expect(container).toBeInTheDocument()
  })

  // 测试中断消息的重试功能
  it('应该为中断的消息提供重试功能', () => {
    // 创建一个用户消息和一个中断的AI消息
    const userMessage = createTestMessage({
      role: 'user',
      content: '测试问题',
      id: 'user-message',
    })

    const interruptedMessage = {
      ...createTestMessage({
        role: 'assistant',
        content: '请求中断，请重试',
        id: 'interrupted-message',
      }),
      interrupted: true, // 添加中断标记
    }

    // 设置getCurrentConversation返回正确的消息序列（用户消息在前，AI消息在后）
    mockUseChatStore.mockReturnValue({
      updateMessage: jest.fn(),
      isLoading: false,
      setLoading: jest.fn(),
      setStreaming: jest.fn(),
      getCurrentConversation: jest.fn(() => ({
        messages: [userMessage, interruptedMessage],
      })),
      models: [
        {
          id: 'model-1',
          name: '测试模型',
          description: '测试描述',
          config: { temperature: 0.7, maxTokens: 1000 },
        },
      ],
    })

    render(
      <MessageList
        messages={[userMessage, interruptedMessage]}
        models={{ 'model-1': '测试模型' }}
      />
    )

    // 验证重试按钮是否显示
    const retryButton = screen.getByTestId('retry-button')
    expect(retryButton).toBeInTheDocument()

    // 测试点击重试按钮
    fireEvent.click(retryButton)

    // 验证createLLMStream是否被调用
    expect(mockCreateLLMStream).toHaveBeenCalled()
  })
})
