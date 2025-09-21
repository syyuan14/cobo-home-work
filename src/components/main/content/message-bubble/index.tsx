import React from 'react'
import { type Message } from '../../../../types'
import MarkdownRenderer from '../markdown'
import styles from './index.module.scss'

interface MessageBubbleProps {
  message: Message
  modelName?: string
  onRetry?: () => void
}
// 格式化时间
const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp)
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, modelName, onRetry }) => {
  const { role, content, timestamp } = message
  const isUser = role === 'user'

  return (
    <div className={`${styles.container} ${isUser ? styles.containerUser : styles.containerAI}`}>
      <div className={styles.avatar}>{isUser ? '👤' : '🤖'}</div>
      <div className={styles.contentContainer}>
        <div
          className={`${styles.messageBubble} ${isUser ? styles.messageBubbleUser : styles.messageBubbleAI}`}
        >
          <MarkdownRenderer content={content} />
        </div>
        <div className={styles.footer}>
          <span className={styles.time}>{formatTime(timestamp)}</span>
          {!isUser && modelName && <span className={styles.modelName}>{modelName}</span>}
          {!isUser && message.interrupted && onRetry && (
            <button className={styles.retryButton} onClick={onRetry}>
              🔄 重试
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default MessageBubble
