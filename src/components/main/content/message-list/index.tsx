import React from 'react'
import { useChatStore } from '../../../../store/chat'
import { createLLMStream } from '../../../../api/chatService'
import { type Message } from '../../../../types'
import MessageBubble from '../message-bubble'
import styles from './index.module.scss'
import { useState, useRef, useEffect, useCallback } from 'react'

interface MessageListProps {
  messages: Message[]
  models: { [key: string]: string } // modelId -> modelName 映射
}

const MessageList: React.FC<MessageListProps> = ({ messages, models }) => {
  const {
    updateMessage,
    isLoading,
    setLoading,

    getCurrentConversation,
    models: allModels,
  } = useChatStore()

  const [retryingMessageId, setRetryingMessageId] = useState<string | undefined>(undefined)
  const [userScrolledUp, setUserScrolledUp] = useState(false) // 跟踪用户是否向上滚动
  const containerRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<() => void | null>(null)

  // 处理重试消息
  const handleRetryMessage = (message: Message) => {
    // 找到对应的用户消息
    const conversation = getCurrentConversation()
    if (!conversation) return

    // 找到这个AI消息对应的用户消息
    const aiMessageIndex = conversation.messages.findIndex(msg => msg.id === message.id)
    if (aiMessageIndex <= 0) return // 必须有前面的用户消息

    const userMessage = conversation.messages[aiMessageIndex - 1]
    if (userMessage.role !== 'user') return

    // 重置消息状态，取消中断标记
    updateMessage(message.id, '', false)

    try {
      setLoading(true)

      setRetryingMessageId(message.id) // 设置正在重试的消息ID

      // 准备传递给streamLLMResponse的消息数组（仅包含用户消息）
      const messagesForStream = [userMessage]

      // 找到对应的模型
      const model = allModels.find(m => m.id === message.modelId) || allModels[0]

      // 定义token处理函数
      let accumulatedContent = ''
      const onToken = (token: string) => {
        accumulatedContent += token
        updateMessage(message.id, accumulatedContent)
      }

      // 定义完成处理函数
      const onComplete = () => {
        setLoading(false)

        setRetryingMessageId(undefined) // 清除重试状态
        abortControllerRef.current = null
      }

      // 定义错误处理函数
      const onError = (error: Error) => {
        console.error('LLM API Error:', error)
        setLoading(false)

        setRetryingMessageId(undefined) // 清除重试状态
        abortControllerRef.current = null
        // 出错时标记为中断，允许再次重试
        updateMessage(message.id, message.content || '请求出错，请重试', true)
      }

      // 调用正确格式的createLLMStream函数
      const abort = createLLMStream(
        model.id,
        model,
        messagesForStream,
        onToken,
        onComplete,
        onError
      )

      // 保存abort函数引用
      abortControllerRef.current = abort
    } catch (error) {
      console.error('Error retrying message:', error)
      setLoading(false)

      setRetryingMessageId(undefined) // 清除重试状态
      // 出错时标记为中断，允许再次重试
      updateMessage(message.id, message.content || '请求出错，请重试', true)
    }
  }

  // 处理滚动事件，检测用户是否向上滚动
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current
    // 如果用户滚动到距离底部50px以内，认为用户想保持在底部
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 50
    setUserScrolledUp(!isNearBottom)
  }, [])

  // 添加滚动事件监听器
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  // 自动滚动到底部 - 仅在用户没有向上滚动时
  useEffect(() => {
    if (containerRef.current && messages.length > 0 && !userScrolledUp) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [messages, userScrolledUp])

  // 滚动到底部的方法
  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
      setUserScrolledUp(false)
    }
  }

  // 渲染空状态
  const renderEmptyState = () => (
    <div className={styles.emptyState}>
      <div className={styles.emptyStateContent}>
        <div className={styles.emptyStateIcon}>💬</div>
        <h3 className={styles.emptyStateTitle}>开始对话吧</h3>
        <p className={styles.emptyStateDescription}>输入你的问题，我会尽力为你提供帮助</p>
      </div>
    </div>
  )

  // 渲染加载指示器
  const renderLoading = () => (
    <div className={styles.loadingContainer}>
      <div className={styles.typingIndicator}>
        <div className={`${styles.typingDot} ${styles.dot1}`}></div>
        <div className={`${styles.typingDot} ${styles.dot2}`}></div>
        <div className={`${styles.typingDot} ${styles.dot3}`}></div>
      </div>
      <p className={styles.loadingText}>AI 正在思考...</p>
    </div>
  )

  return (
    <div ref={containerRef} className={styles.container}>
      {messages.length === 0 && !isLoading
        ? renderEmptyState()
        : messages.map(message => (
            <React.Fragment key={message.id}>
              <MessageBubble
                message={message}
                modelName={message.modelId ? models[message.modelId] : undefined}
                onRetry={message.interrupted ? () => handleRetryMessage(message) : undefined}
              />
              {/* 如果当前消息是正在重试的消息，则在其下方显示loading */}
              {message.id === retryingMessageId && renderLoading()}
            </React.Fragment>
          ))}
      {/* 对于新消息的加载，仍然显示在列表末尾 */}
      {isLoading && !retryingMessageId && renderLoading()}

      {/* 回到底部按钮 - 仅在用户向上滚动且有新消息时显示 */}
      {userScrolledUp && messages.length > 0 && (
        <button
          className={styles.scrollToBottomButton}
          onClick={scrollToBottom}
          aria-label="回到底部"
        >
          ⬇️
        </button>
      )}
    </div>
  )
}

export default MessageList
