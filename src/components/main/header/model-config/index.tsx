import { useState } from 'react'
import { useChatStore } from '../../../../store/chat'

import styles from './index.module.scss'
import type { LLMModel } from '../../../../types'
import ModelConfigPanel from './config-panel'

export const ModelConfig = () => {
  const { models, getCurrentConversation, updateModelConfig } = useChatStore()
  const [showConfigPanel, setShowConfigPanel] = useState(false)

  const currentModelId = getCurrentConversation()?.currentModelId || models[0]?.id || ''
  const currentModel = models.find(model => model.id === currentModelId) || models[0]

  // 处理模型配置更新
  const handleConfigChange = (modelId: string, config: Partial<LLMModel['config']>) => {
    updateModelConfig(modelId, config)
  }
  return (
    <>
      <button
        className={styles.configButton}
        onClick={() => setShowConfigPanel(!showConfigPanel)}
        aria-label={showConfigPanel ? '关闭配置' : '打开配置'}
      >
        ⚙️
      </button>
      {showConfigPanel && (
        <div className={styles.configPanelOverlay} onClick={() => setShowConfigPanel(false)}>
          <ModelConfigPanel
            currentModel={currentModel}
            onConfigChange={handleConfigChange}
            onClose={() => setShowConfigPanel(false)}
          />
        </div>
      )}
    </>
  )
}
