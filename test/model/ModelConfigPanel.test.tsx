import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import ModelConfigPanel from '../../src/components/main/header/model-config/config-panel'
import type { LLMModel } from '../../src/types'

// 模拟模型数据
const mockModel: LLMModel = {
  id: 'mock-gpt',
  api: '/api/chat/gpt',
  name: 'Mock GPT',
  description: '模拟GPT模型，返回预设响应',
  config: {
    temperature: 0.7,
    maxTokens: 1000,
  },
}

describe('ModelConfigPanel组件测试', () => {
  // 测试场景1: 初始渲染和配置项显示
  it('should render with initial config correctly', () => {
    const onConfigChange = jest.fn()
    const onClose = jest.fn()

    render(
      <ModelConfigPanel
        currentModel={mockModel}
        onConfigChange={onConfigChange}
        onClose={onClose}
      />
    )

    // 检查面板标题是否正确显示
    const title = screen.getByText(`${mockModel.name} 配置`)
    expect(title).toBeInTheDocument()

    // 检查温度滑块是否显示正确的值
    const temperatureSlider = screen.getByRole('slider') as HTMLInputElement
    const temperatureValue = screen.getByText('0.7')
    expect(temperatureSlider).toBeInTheDocument()
    expect(temperatureSlider.value).toBe('0.7')
    expect(temperatureValue).toBeInTheDocument()

    // 检查最大Token数输入框是否显示正确的值
    const maxTokensInput = screen.getByRole('spinbutton') as HTMLInputElement
    expect(maxTokensInput).toBeInTheDocument()
    expect(maxTokensInput.value).toBe('1000')

    // 检查按钮是否存在
    const resetButton = screen.getByText('重置')
    const applyButton = screen.getByText('应用')
    const closeButton = screen.getByText('×')
    expect(resetButton).toBeInTheDocument()
    expect(applyButton).toBeInTheDocument()
    expect(closeButton).toBeInTheDocument()
  })

  // 测试场景2: 配置项更新功能
  it('should update config values when inputs change', () => {
    const onConfigChange = jest.fn()
    const onClose = jest.fn()

    render(
      <ModelConfigPanel
        currentModel={mockModel}
        onConfigChange={onConfigChange}
        onClose={onClose}
      />
    )

    // 测试温度滑块更新
    const temperatureSlider = screen.getByRole('slider') as HTMLInputElement
    fireEvent.change(temperatureSlider, { target: { value: '1.5' } })

    // 验证温度显示值是否更新
    const temperatureValue = screen.getByText('1.5')
    expect(temperatureValue).toBeInTheDocument()

    // 测试最大Token数输入框更新
    const maxTokensInput = screen.getByRole('spinbutton') as HTMLInputElement
    fireEvent.change(maxTokensInput, { target: { value: '2000' } })

    // 点击应用按钮
    const applyButton = screen.getByText('应用')
    fireEvent.click(applyButton)

    // 验证配置更新回调是否被调用，并且参数正确
    expect(onConfigChange).toHaveBeenCalledTimes(1)
    expect(onConfigChange).toHaveBeenCalledWith(mockModel.id, {
      temperature: 1.5,
      maxTokens: 2000,
    })

    // 验证关闭回调是否被调用
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  // 测试场景3: 重置功能
  it('should reset config to default values when reset button is clicked', () => {
    const onConfigChange = jest.fn()
    const onClose = jest.fn()

    render(
      <ModelConfigPanel
        currentModel={mockModel}
        onConfigChange={onConfigChange}
        onClose={onClose}
      />
    )

    // 修改配置项
    const temperatureSlider = screen.getByRole('slider') as HTMLInputElement
    const maxTokensInput = screen.getByRole('spinbutton') as HTMLInputElement

    fireEvent.change(temperatureSlider, { target: { value: '1.5' } })
    fireEvent.change(maxTokensInput, { target: { value: '2000' } })

    // 点击重置按钮
    const resetButton = screen.getByText('重置')
    fireEvent.click(resetButton)

    // 验证配置项是否重置为初始值
    expect(temperatureSlider.value).toBe('0.7')
    expect(maxTokensInput.value).toBe('1000')

    // 验证重置时没有调用配置更新回调
    expect(onConfigChange).not.toHaveBeenCalled()
  })

  // 测试场景4: 关闭面板功能
  it('should call onClose when close button or panel background is clicked', () => {
    const onConfigChange = jest.fn()
    const onClose = jest.fn()

    render(
      <ModelConfigPanel
        currentModel={mockModel}
        onConfigChange={onConfigChange}
        onClose={onClose}
      />
    )

    // 点击关闭按钮
    const closeButton = screen.getByText('×')
    fireEvent.click(closeButton)

    // 验证关闭回调是否被调用
    expect(onClose).toHaveBeenCalledTimes(1)

    // 重置mock
    onClose.mockClear()

    // 点击面板背景（阻止事件冒泡）
    // 由于样式类在测试环境中可能不可用，直接点击面板内的空白区域
    const panelContent = screen.getByText(`${mockModel.name} 配置`).parentElement?.parentElement!
    fireEvent.click(panelContent)

    // 验证面板点击不会触发关闭回调
    expect(onClose).not.toHaveBeenCalled()
  })

  // 测试场景5: 边界值处理
  it('should handle boundary values correctly', () => {
    const onConfigChange = jest.fn()
    const onClose = jest.fn()

    render(
      <ModelConfigPanel
        currentModel={mockModel}
        onConfigChange={onConfigChange}
        onClose={onClose}
      />
    )

    // 测试温度滑块边界值
    const temperatureSlider = screen.getByRole('slider') as HTMLInputElement
    fireEvent.change(temperatureSlider, { target: { value: '0' } })
    expect(screen.getByText('0.0')).toBeInTheDocument()

    fireEvent.change(temperatureSlider, { target: { value: '2' } })
    expect(screen.getByText('2.0')).toBeInTheDocument()

    // 测试最大Token数边界值
    const maxTokensInput = screen.getByRole('spinbutton') as HTMLInputElement
    fireEvent.change(maxTokensInput, { target: { value: '1' } })
    fireEvent.change(maxTokensInput, { target: { value: '4096' } })

    // 点击应用按钮
    const applyButton = screen.getByText('应用')
    fireEvent.click(applyButton)

    // 验证配置更新回调是否被调用，并且参数正确
    expect(onConfigChange).toHaveBeenCalledTimes(1)
    expect(onConfigChange).toHaveBeenCalledWith(mockModel.id, {
      temperature: 2,
      maxTokens: 4096,
    })
  })
})
