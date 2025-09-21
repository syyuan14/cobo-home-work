import { useChatStore } from '../../../store/chat'

import MessageList from './message-list'
import Editor from './editor'
import { EmptyMainContent } from './empty'
import styles from './index.module.scss'
import React from 'react'

export const Content: React.FC = () => {
  const { getCurrentConversation, models } = useChatStore()

  const currentConversation = getCurrentConversation()

  const modelMap: { [key: string]: string } = {}
  models.forEach(model => {
    modelMap[model.id] = model.name
  })

  if (!currentConversation) {
    return <EmptyMainContent />
  }
  return (
    <div className={styles.chatContainer}>
      {/* 消息列表区域 */}
      <MessageList messages={currentConversation.messages} models={modelMap} />
      {/* 输入框区域 */}
      <Editor
        currentConversation={currentConversation}
        currentModelId={currentConversation.currentModelId}
      />
    </div>
  )
}

export default Content
