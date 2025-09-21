import { useChatStore } from '../../../../store/chat'
import styles from './index.module.scss'

export const EmptyMainContent = () => {
  const { createConversation } = useChatStore()
  return (
    <div className={styles.emptyMainContent}>
      <div className={styles.emptyMainIcon}>💬</div>
      <h3>欢迎使用AI助手</h3>
      <p>请选择或创建一个对话开始交流</p>
      <button className={styles.createButton} onClick={() => createConversation('新对话')}>
        创建新对话
      </button>
    </div>
  )
}
