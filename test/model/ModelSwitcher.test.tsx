import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import ModelSwitcher from '../../src/components/main/header/model-switch'
import type { LLMModel } from '../../src/types'

// 模拟模型数据
const mockModels: LLMModel[] = [
  {
    id: 'mock-gpt',
    name: 'Mock GPT',
    api: '/api/chat/gpt',
    description: '模拟GPT模型，返回预设响应',
    config: {
      temperature: 0.7,
      maxTokens: 1000,
    },
  },
  {
    id: 'mock-doubao',
    name: 'Mock doubao',
    api: '/api/chat/doubao',
    description: '模拟doubao模型，返回预设响应',
    config: {
      temperature: 0.8,
      maxTokens: 2000,
    },
  },
]

describe('ModelSwitcher组件测试', () => {
  // 测试场景1: 初始渲染和模型列表显示
  it('should render with model list correctly', () => {
    const onModelChange = jest.fn()

    render(
      <ModelSwitcher
        models={mockModels}
        currentModelId={mockModels[0].id}
        onModelChange={onModelChange}
      />
    )

    // 检查选择器是否存在
    const selectElement = screen.getByRole('combobox')
    expect(selectElement).toBeInTheDocument()

    // 检查选项数量是否正确
    const options = screen.getAllByRole('option')
    expect(options).toHaveLength(mockModels.length)

    // 检查当前选中的模型是否正确
    expect(selectElement).toHaveValue(mockModels[0].id)

    // 检查模型描述是否显示
    const modelInfo = screen.getByText(mockModels[0].description)
    expect(modelInfo).toBeInTheDocument()
  })

  // 测试场景2: 模型切换功能
  it('should call onModelChange when model is selected', () => {
    const onModelChange = jest.fn()

    // 保存render结果，以便后续使用rerender
    const { rerender } = render(
      <ModelSwitcher
        models={mockModels}
        currentModelId={mockModels[0].id}
        onModelChange={onModelChange}
      />
    )

    const selectElement = screen.getByRole('combobox')

    // 模拟选择第二个模型
    fireEvent.change(selectElement, { target: { value: mockModels[1].id } })

    // 检查回调函数是否被调用，并且参数正确
    expect(onModelChange).toHaveBeenCalledTimes(1)
    expect(onModelChange).toHaveBeenCalledWith(mockModels[1].id)

    // 使用rerender更新组件props，模拟父组件更新currentModelId
    rerender(
      <ModelSwitcher
        models={mockModels}
        currentModelId={mockModels[1].id}
        onModelChange={onModelChange}
      />
    )

    // 检查模型描述是否更新
    const modelInfo = screen.getByText(mockModels[1].description)
    expect(modelInfo).toBeInTheDocument()
  })

  // 测试场景3: 选择相同的模型不触发回调
  it('should not call onModelChange when selecting the same model', () => {
    const onModelChange = jest.fn()

    render(
      <ModelSwitcher
        models={mockModels}
        currentModelId={mockModels[0].id}
        onModelChange={onModelChange}
      />
    )

    const selectElement = screen.getByRole('combobox')

    // 模拟选择相同的模型
    fireEvent.change(selectElement, { target: { value: mockModels[0].id } })

    // 检查回调函数是否没有被调用
    expect(onModelChange).not.toHaveBeenCalled()
  })

  // 测试场景4: 禁用状态测试
  it('should be disabled when disabled prop is true', () => {
    const onModelChange = jest.fn()

    render(
      <ModelSwitcher
        models={mockModels}
        currentModelId={mockModels[0].id}
        onModelChange={onModelChange}
        disabled={true}
      />
    )

    const selectElement = screen.getByRole('combobox')

    // 检查选择器是否被禁用
    expect(selectElement).toBeDisabled()

    // 尝试更改选择，但回调不应被调用
    fireEvent.change(selectElement, { target: { value: mockModels[1].id } })
    expect(onModelChange).not.toHaveBeenCalled()
  })

  // 测试场景5: 空模型列表测试
  it('should handle empty models array gracefully', () => {
    const onModelChange = jest.fn()

    render(<ModelSwitcher models={[]} currentModelId="" onModelChange={onModelChange} />)

    const selectElement = screen.getByRole('combobox')
    expect(selectElement).toBeInTheDocument()

    // 检查选项数量是否为0
    const options = screen.queryAllByRole('option')
    expect(options).toHaveLength(0)
  })
})
