import React from 'react'
import { useChatStore } from '../../store/chat'
import styles from './index.module.scss'
import type { Message } from '../../types'
import { formatTime } from '../../utils/format'

const Sidebar: React.FC = () => {
  const {
    conversations,
    currentConversationId,
    createConversation,
    deleteConversation,
    setCurrentConversation,
    clearConversations,
  } = useChatStore()

  // 处理新建对话
  const handleNewConversation = () => {
    const title = `对话 ${new Date().toLocaleDateString('zh-CN')} ${new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`
    createConversation(title)
  }

  // 处理删除对话
  const handleDeleteConversation = (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (window.confirm('确定要删除这个对话吗？')) {
      deleteConversation(conversationId)
    }
  }

  // 处理清空所有对话
  const handleClearAllConversations = () => {
    if (window.confirm('确定要清空所有对话吗？此操作不可恢复。')) {
      clearConversations()
    }
  }

  // 格式化对话标题显示
  const formatConversationTitle = (title: string, messages: Message[]): string => {
    // 如果标题较短且有消息，显示第一条用户消息作为副标题
    if (messages.length > 0 && title.includes('对话')) {
      const firstUserMessage = messages.find((msg: Message) => msg.role === 'user')
      if (firstUserMessage) {
        return firstUserMessage.content.length > 50
          ? firstUserMessage.content.substring(0, 50) + '...'
          : firstUserMessage.content
      }
    }
    return title
  }

  const renderConversationList = () => {
    if (conversations.length === 0) {
      return (
        <div className={styles.emptyState}>
          <p>暂无对话记录</p>
          <p className={styles.emptyStateHint}>点击上方按钮开始新对话</p>
        </div>
      )
    }
    return conversations.map(conversation => (
      <div
        key={conversation.id}
        className={`${styles.conversationItem} ${currentConversationId === conversation.id ? styles.active : ''}`}
        onClick={() => setCurrentConversation(conversation.id)}
        title={conversation.title}
      >
        <div className={styles.conversationInfo}>
          <div className={styles.conversationTitle}>
            {formatConversationTitle(conversation.title, conversation.messages)}
          </div>
          <div className={styles.conversationMeta}>
            <span className={styles.conversationTime}>{formatTime(conversation.updatedAt)}</span>
          </div>
        </div>
        <div
          className={styles.deleteButton}
          onClick={e => handleDeleteConversation(conversation.id, e)}
          aria-label={`删除对话 ${conversation.title}`}
        >
          ×
        </div>
      </div>
    ))
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>AI 聊天助手</h2>
      </div>

      <div className={styles.actions}>
        <button
          className={styles.newConversationButton}
          onClick={handleNewConversation}
          aria-label="新建对话"
        >
          <span className={styles.icon}>+</span>
          新建对话
        </button>
        {conversations.length > 0 && (
          <button
            className={styles.clearButton}
            onClick={handleClearAllConversations}
            aria-label="清空所有对话"
          >
            <span className={styles.icon}>🗑️</span>
          </button>
        )}
      </div>

      <div className={styles.conversationList}>{renderConversationList()}</div>
    </div>
  )
}

export default Sidebar
