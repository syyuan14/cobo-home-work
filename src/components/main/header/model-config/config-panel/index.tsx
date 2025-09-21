import React, { useState } from 'react'

import styles from './index.module.scss'
import type { LLMModel } from '../../../../../types'
import { getDefaultConfig } from '../../../../../utils/modelDefaults'

interface ModelConfigPanelProps {
  currentModel: LLMModel
  onConfigChange: (
    modelId: string,

    config: Partial<{ temperature: number; maxTokens: number }>
  ) => void
  onClose: () => void
}

const ModelConfigPanel: React.FC<ModelConfigPanelProps> = ({
  currentModel,
  onConfigChange,
  onClose,
}) => {
  const [config, setConfig] = useState(currentModel.config)

  // 处理配置项变化
  const handleConfigChange = (key: keyof LLMModel['config'], value: number) => {
    const newConfig = { ...config, [key]: value }
    setConfig(newConfig)
  }

  // 重置配置
  const handleReset = () => {
    const defaultConfig = getDefaultConfig(currentModel.id)
    setConfig(defaultConfig)
  }

  const handleApply = () => {
    onConfigChange(currentModel.id, config)
    onClose()
  }

  return (
    <div className={styles.container} onClick={e => e.stopPropagation()}>
      <div className={styles.header}>
        <h3 className={styles.title}>{currentModel.name} 配置</h3>
        <div className={styles.closeButton} onClick={onClose}>
          ×
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.configItem}>
          <label className={styles.configLabel}>温度 (Temperature)</label>
          <div className={styles.sliderContainer}>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={config.temperature}
              onChange={e => handleConfigChange('temperature', parseFloat(e.target.value))}
              className={styles.slider}
            />
            <span className={styles.sliderValue}>{config.temperature.toFixed(1)}</span>
          </div>
          <p className={styles.configDescription}>
            控制响应的随机性。较低的值产生更确定的响应，较高的值产生更多样化的响应。
          </p>
        </div>

        <div className={styles.configItem}>
          <label className={styles.configLabel}>最大Token数 (Max Tokens)</label>
          <div className={styles.inputContainer}>
            <input
              type="number"
              min="1"
              max="4096"
              value={config.maxTokens}
              onChange={e => handleConfigChange('maxTokens', parseInt(e.target.value))}
              className={styles.input}
            />
          </div>
          <p className={styles.configDescription}>
            限制生成内容的最大长度。值越大，生成的内容可能越长。
          </p>
        </div>
      </div>

      <div className={styles.footer}>
        <button className={styles.resetButton} onClick={handleReset}>
          重置
        </button>
        <button className={styles.applyButton} onClick={handleApply}>
          应用
        </button>
      </div>
    </div>
  )
}

export default ModelConfigPanel
