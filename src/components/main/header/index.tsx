import { useChatStore } from '../../../store/chat'

import styles from './index.module.scss'
import React from 'react'
import { ThemeSwitch } from './theme-switch'
import ModelSwitcher from './model-switch'
import { ModelConfig } from './model-config'

const Header: React.FC = () => {
  const { models, getCurrentConversation, setCurrentModel } = useChatStore()

  const currentModelId = getCurrentConversation()?.currentModelId || models[0]?.id || ''

  // 处理模型切换
  const handleModelChange = (modelId: string) => {
    setCurrentModel(modelId)
  }

  return (
    <div className={styles.container}>
      <div className={styles.leftSection}>
        <ModelSwitcher
          models={models}
          currentModelId={currentModelId}
          onModelChange={handleModelChange}
        />

        <ModelConfig />
      </div>

      <div className={styles.rightSection}>
        <ThemeSwitch />
      </div>
    </div>
  )
}

export default Header
