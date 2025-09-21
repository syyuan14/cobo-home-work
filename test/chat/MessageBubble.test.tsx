import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import MessageBubble from '../../src/components/main/content/message-bubble'
import { Message } from '../../src/types'

// Mock MarkdownRenderer组件
jest.mock('../../src/components/main/content/markdown', () => ({
  __esModule: true,
  default: ({ content }: { content: string }) => (
    <div data-testid="markdown-renderer">{content}</div>
  ),
}))

// Mock样式文件
jest.mock('../../src/components/main/content/message-bubble/index.module.scss', () => ({
  container: 'container',
  containerUser: 'containerUser',
  containerAI: 'containerAI',
  avatar: 'avatar',
  contentContainer: 'contentContainer',
  messageBubble: 'messageBubble',
  messageBubbleUser: 'messageBubbleUser',
  messageBubbleAI: 'messageBubbleAI',
  footer: 'footer',
  time: 'time',
  modelName: 'modelName',
  retryButton: 'retryButton',
}))

// 在测试中使用的模拟组件，添加data-testid属性以便测试

describe('MessageBubble组件测试', () => {
  // 创建测试用的消息数据
  const createTestMessage = (overrides: Partial<Message> = {}): Message => ({
    id: 'test-message-id',
    content: '测试消息内容',
    role: 'user',
    timestamp: Date.now(),
    modelId: 'test-model-id',
    ...overrides,
  })

  // 测试用户消息的渲染
  it('应该正确渲染用户消息', () => {
    const message = createTestMessage({ role: 'user' })
    render(<MessageBubble message={message} />)

    // 验证消息内容是否正确渲染
    expect(screen.getByTestId('markdown-renderer')).toHaveTextContent('测试消息内容')

    // 验证用户头像是否显示
    expect(screen.getByText('👤')).toBeInTheDocument()

    // 验证时间是否显示
    const timeElement = screen.getByText(/\d{2}:\d{2}/) // 匹配时间格式
    expect(timeElement).toBeInTheDocument()
  })

  // 测试AI消息的渲染
  it('应该正确渲染AI消息和模型名称', () => {
    const message = createTestMessage({ role: 'assistant' })
    render(<MessageBubble message={message} modelName="测试模型" />)

    // 验证消息内容是否正确渲染
    expect(screen.getByTestId('markdown-renderer')).toHaveTextContent('测试消息内容')

    // 验证AI头像是否显示
    expect(screen.getByText('🤖')).toBeInTheDocument()

    // 验证模型名称是否显示
    expect(screen.getByText('测试模型')).toBeInTheDocument()

    // 验证时间是否显示
    const timeElement = screen.getByText(/\d{2}:\d{2}/) // 匹配时间格式
    expect(timeElement).toBeInTheDocument()
  })

  // 测试中断的消息是否显示重试按钮
  it('应该为中断的消息显示重试按钮并触发回调', () => {
    const mockOnRetry = jest.fn()
    // 创建一个带有额外字段的消息对象
    const message = {
      ...createTestMessage({ role: 'assistant' }),
      interrupted: true, // 添加中断标记
    }

    render(<MessageBubble message={message} modelName="测试模型" onRetry={mockOnRetry} />)

    // 验证重试按钮是否显示
    const retryButton = screen.getByText('🔄 重试')
    expect(retryButton).toBeInTheDocument()

    // 测试点击重试按钮是否触发回调
    retryButton.click()
    expect(mockOnRetry).toHaveBeenCalledTimes(1)
  })

  // 测试时间格式化功能
  it('应该正确格式化时间戳', () => {
    // 创建一个指定时间戳的消息
    const fixedTimestamp = new Date('2023-10-01T12:34:56').getTime()
    const message = createTestMessage({ timestamp: fixedTimestamp })

    render(<MessageBubble message={message} />)

    // 验证时间是否正确格式化
    expect(screen.getByText('12:34')).toBeInTheDocument()
  })
})
