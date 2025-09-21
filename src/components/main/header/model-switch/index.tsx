import React from 'react'
import type { LLMModel } from '../../../../types'
import styles from './index.module.scss'

interface ModelSwitcherProps {
  models: LLMModel[]
  currentModelId: string

  onModelChange: (modelId: string) => void
  disabled?: boolean
}

const ModelSwitcher: React.FC<ModelSwitcherProps> = ({
  models,
  currentModelId,
  onModelChange,
  disabled = false,
}) => {
  // 处理模型选择
  const handleModelSelect = (modelId: string) => {
    if (modelId !== currentModelId && !disabled) {
      onModelChange(modelId)
    }
  }

  return (
    <div className={styles.container}>
      <select
        value={currentModelId}
        onChange={e => handleModelSelect(e.target.value)}
        disabled={disabled}
        className={styles.select}
      >
        {models.map(model => (
          <option key={model.id} value={model.id}>
            {model.name}
          </option>
        ))}
      </select>
      <div className={styles.modelInfo}>
        {models.find(model => model.id === currentModelId)?.description}
      </div>
    </div>
  )
}

export default ModelSwitcher
