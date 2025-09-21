import { useEffect } from 'react'
import { useChatStore } from './store/chat'
import { useAppConfigStore } from './store/appConfig'
import Sidebar from './components/sidebar'
import MainContent from './components/main'
import './styles/global.scss'
import styles from './App.module.scss'

function App() {
  const { createConversation } = useChatStore()
  const { theme } = useAppConfigStore()

  // 初始化应用
  useEffect(() => {
    // 仅在组件首次加载时检查是否有对话
    const { conversations } = useChatStore.getState()
    if (conversations.length === 0) {
      createConversation('新对话')
    }
  }, [createConversation])

  // 使用useEffect监听主题变化，并更新HTML元素的data-theme属性
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <div className={styles.container}>
      <Sidebar />
      <MainContent />
    </div>
  )
}

export default App
