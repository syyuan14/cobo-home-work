import React from 'react'
import { useChatStore } from '../../../../store/chat'
import { createLLMStream } from '../../../../api/chatService'
import styles from './index.module.scss'
import { useState, useRef, useEffect } from 'react'
import type { Conversation } from '../../../../types'

interface EditorProps {
  currentConversation: Conversation
  currentModelId: string
}

const Editor: React.FC<EditorProps> = ({ currentConversation, currentModelId }) => {
  const { addMessage, updateMessage, setLoading, models, getCurrentConversation } = useChatStore()

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [editorContent, setEditorContent] = useState('')
  const [isSending, setIsSending] = useState(false)
  const abortControllerRef = useRef<() => void | null>(null)

  const currentModel = models.find(model => model.id === currentModelId) || models[0]

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditorContent(e.target.value)
    adjustTextareaHeight()
  }

  // 自动调整textarea高度
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current
    if (textarea) {
      // 重置高度以获取准确的scrollHeight
      textarea.style.height = 'auto'
      // 设置新高度，但不超过最大高度
      const newHeight = Math.min(
        textarea.scrollHeight,
        200 // 与CSS中的max-height保持一致
      )
      textarea.style.height = `${newHeight}px`
    }
  }

  // 组件挂载时调整高度
  useEffect(() => {
    adjustTextareaHeight()
  }, [editorContent])

  // 处理发送消息
  const handleSendMessage = async () => {
    if (!editorContent.trim() || isSending) return

    setIsSending(true)
    setLoading(true)

    // 在try-catch外部声明aiMessageId变量
    let aiMessageId: string | undefined

    try {
      // 保存当前编辑内容
      const userMessageContent = editorContent.trim()
      const currentMessage = {
        role: 'user' as const,
        content: userMessageContent,
        modelId: currentModel.id,
      }
      // 添加用户消息
      addMessage(currentMessage)

      // 发送消息后清空输入框
      setEditorContent('')

      // 添加AI消息（初始为空，等待流式响应）
      aiMessageId = addMessage({
        role: 'assistant',
        content: '',
        modelId: currentModel.id,
      })

      // 模拟LLM调用，使用流式输出
      const abort = createLLMStream(
        currentModel.id,
        currentModel,
        [currentMessage],
        token => {
          // 获取当前会话信息
          const conversation = getCurrentConversation()
          // 安全检查，确保aiMessageId存在
          if (conversation && aiMessageId) {
            // 查找当前AI消息
            const aiMessage = conversation.messages.find(
              msg => msg.role === 'assistant' && msg.id === aiMessageId
            )
            if (aiMessage) {
              // 更新AI消息内容（流式追加）
              updateMessage(aiMessageId, aiMessage.content + token)
            }
          }
        },
        () => {
          // 完成回调
          setIsSending(false)
          setLoading(false)

          abortControllerRef.current = null
        },
        error => {
          // 错误回调
          console.error('LLM API Error:', error)
          setIsSending(false)
          setLoading(false)

          // 安全检查，只有在aiMessageId存在时才更新消息
          if (aiMessageId) {
            // 更新AI消息，显示错误信息
            updateMessage(aiMessageId, '请求出错，请重试', true)
          }

          abortControllerRef.current = null
        }
      )

      abortControllerRef.current = abort
    } catch (error) {
      console.error('Error sending message:', error)
      setIsSending(false)
      setLoading(false)

      // 安全检查，只有在aiMessageId存在时才更新消息
      if (aiMessageId) {
        // 更新AI消息，显示错误信息
        updateMessage(aiMessageId, '请求出错，请重试', true)
      }
    }
  }

  // 处理中断发送
  const handleAbortSend = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current()
      abortControllerRef.current = null
      setIsSending(false)
      setLoading(false)

      // 标记最后一条AI消息为被中断
      const lastAIMessage = currentConversation.messages
        .filter(msg => msg.role === 'assistant')
        .pop()
      if (lastAIMessage) {
        updateMessage(lastAIMessage.id, lastAIMessage.content, true)
      }
    }
  }

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (isSending) {
      // ESC 中断发送
      if (e.key === 'Escape') {
        e.preventDefault()
        handleAbortSend()
      }
      return
    }

    // Enter发送，Shift+Enter换行
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (editorContent.trim()) {
        handleSendMessage()
      }
    }
    // Ctrl+Enter也可以发送（为了跨平台兼容性）
    if (e.key === 'Enter' && e.ctrlKey && !e.shiftKey) {
      e.preventDefault()
      if (editorContent.trim()) {
        handleSendMessage()
      }
    }
    // 限制Shift+Enter最多四行
    if (e.key === 'Enter' && e.shiftKey) {
      const lines = editorContent.split('\n')
      if (lines.length >= 4) {
        e.preventDefault()
      }
    }
  }

  // 聚焦编辑器
  const focusEditor = () => {
    textareaRef.current?.focus()
  }

  // 当容器被点击时，聚焦编辑器
  useEffect(() => {
    const container = containerRef.current
    if (container) {
      const handleContainerClick = () => {
        focusEditor()
      }
      container.addEventListener('click', handleContainerClick)
      return () => container.removeEventListener('click', handleContainerClick)
    }
  }, [])

  return (
    <div className={styles.container} ref={containerRef}>
      <div className={styles.form}>
        <textarea
          ref={textareaRef}
          value={editorContent}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="输入你的问题...（Shift+Enter换行，最多支持四行，Enter发送）"
          disabled={isSending}
          className={styles.textarea}
          maxLength={1000}
        />

        {isSending ? (
          <button
            type="button"
            onClick={handleAbortSend}
            className={styles.abortButton}
            title="中断发送 (ESC)"
          >
            <span className={styles.abortIcon}>✕</span>
            <span>中断</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSendMessage}
            disabled={isSending || !editorContent.trim()}
            className={styles.sendButton}
          >
            <span className={styles.sendIcon}>📤</span>
            <span>发送</span>
          </button>
        )}
      </div>
      <div className={styles.footer}>
        <span className={styles.charCount}>{editorContent.length}/1000</span>
        {isSending ? (
          <span className={styles.hint}>按 ESC 中断发送</span>
        ) : (
          <span className={styles.hint}>Shift+Enter 换行，Enter 发送</span>
        )}
      </div>
    </div>
  )
}

export default Editor
