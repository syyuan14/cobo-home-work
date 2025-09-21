/**
 * 根据用户消息和模型ID生成模拟响应
 */
export const generateMockResponse = (userMessage: string, modelId: string): string => {
  const responses: Record<string, Record<string, string[]>> = {
    'mock-gpt': {
      你好: [
        '你好！我是Mock GPT，一个AI助手。我可以帮助你解答问题、生成内容、提供建议等。请问有什么我可以帮助你的吗？',
        '嗨！很高兴见到你。我是Mock GPT，一个模拟的语言模型。我能理解并生成自然语言，回答各种问题，协助完成各种任务。有什么需求尽管告诉我。',
      ],
      介绍一下自己: [
        '我是Mock GPT，一个模拟的AI助手。我能够理解和生成自然语言，处理各种任务，提供信息和建议。我基于预设的回复模式来响应用户的问题。',
        '您好！我是Mock GPT，一个模拟的人工智能助手。我可以理解您的问题，提供回答，协助您完成各种任务。我会尽力为您提供帮助。',
      ],
      markdown: [
        '# Mock GPT 的 Markdown 支持\n\n我支持多种 Markdown 格式：\n\n## 文本格式\n\n*斜体*、**粗体**、***粗斜体***\n\n## 分割线\n\n---\n\n## 代码\n\n`单行代码`\n\n## 列表\n\n- 项目 A\n- 项目 B\n  - 子项目 B1\n  - 子项目 B2',
      ],
      代码: [
        '这是一个简单的 HTML 代码示例：\n\n```html\n<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Mock GPT 示例</title>\n</head>\n<body>\n    <h1>欢迎使用 Mock GPT</h1>\n    <p>这是一个模拟的 AI 助手。</p>\n</body>\n</html>\n```',
      ],
    },
    'mock-doubao': {
      你好: [
        '你好！我是Mock doubao，一个AI助手。我可以帮助你解答问题、提供信息和建议。请问有什么我可以帮助你的吗？',
        '嗨！很高兴为你服务。我是Mock doubao，一个模拟的语言模型。我能响应你的各种需求，无论是简单的问题还是复杂的任务。',
      ],
      介绍一下自己: [
        '我是Mock doubao，一个模拟的语言模型。我设计用于以自然对话方式与人类交互，能够理解问题、生成文本、提供信息和协助完成各种任务。',
        '你好！我是Mock doubao，一个AI语言模型。我能够理解和生成自然语言，回答问题，协助创作，提供建议等。',
      ],
      markdown: [
        '# Mock doubao 的 Markdown 演示\n\n## 标题层级\n\n# H1\n## H2\n### H3\n\n## 引用块\n\n> 这是一级引用\n>> 这是嵌套引用\n\n## 链接和图片\n\n[链接示例](https://example.com)\n![图片示例](https://via.placeholder.com/100)',
      ],
      代码: [
        '以下是一个简单的 Java 代码示例：\n\n```java\npublic class HelloWorld {\n    public static void main(String[] args) {\n        // 打印欢迎信息\n        System.out.println("Hello from Mock doubao!");\n        \n        // 创建一个变量\n        int number = 42;\n        System.out.println("The answer is: " + number);\n    }\n}\n```',
      ],
    },
    'mock-deepseek': {
      你好: [
        '你好！我是Mock deepseek，一个AI助手。我可以帮助你解答问题、提供信息和建议。请问有什么我可以帮助你的吗？',
        '嗨！很高兴为你服务。我是Mock deepseek，一个模拟的语言模型。我能响应你的各种需求，无论是简单的问题还是复杂的任务。',
      ],
      介绍一下自己: [
        '我是Mock deepseek，一个模拟的语言模型。我设计用于以自然对话方式与人类交互，能够理解问题、生成文本、提供信息和协助完成各种任务。',
        '你好！我是Mock deepseek，一个AI语言模型。我能够理解和生成自然语言，回答问题，协助创作，提供建议等。',
      ],
      markdown: [
        '# Mock deepseek 的 Markdown 演示\n\n## 标题层级\n\n# H1\n## H2\n### H3\n\n## 引用块\n\n> 这是一级引用\n>> 这是嵌套引用\n\n## 链接和图片\n\n[链接示例](https://example.com)\n![图片示例](https://via.placeholder.com/100)',
      ],
      代码: [
        '以下是一个简单的 Python 代码示例：\n\n```python\nprint("Hello from Mock deepseek!")\n```',
      ],
    },
  }

  // 查找匹配的响应
  const userMessageLower = userMessage.toLowerCase()

  // 精确匹配关键词
  if (responses[modelId] && responses[modelId][userMessageLower]) {
    const modelResponses = responses[modelId][userMessageLower]
    const response = modelResponses[Math.floor(Math.random() * modelResponses.length)]
    return response
  }

  // 如果没有精确匹配，检查是否包含markdown或代码关键词
  if (
    userMessageLower.includes('markdown') &&
    responses[modelId] &&
    responses[modelId]['markdown']
  ) {
    const modelResponses = responses[modelId]['markdown']
    const response = modelResponses[Math.floor(Math.random() * modelResponses.length)]
    return response
  }

  if (userMessageLower.includes('代码') && responses[modelId] && responses[modelId]['代码']) {
    const modelResponses = responses[modelId]['代码']
    const response = modelResponses[Math.floor(Math.random() * modelResponses.length)]
    return response
  }

  // 默认响应
  const defaultResponses: { [key: string]: string } = {
    'mock-gpt':
      '# 问题解答\n\n这是一个很好的问题！以下是我的解答：\n\n## 解决方案\n\n- 首先，需要明确问题的核心\n- 其次，考虑可能的解决途径\n- 最后，选择最佳方案\n\n*提示：输入 `markdown` 或 `代码` 查看格式示例*',
    'mock-doubao':
      '感谢你的提问！我会尽力为你提供帮助...\n\n**建议**：尝试使用 `markdown` 或 `代码` 关键词查看格式示例。',
  }

  return defaultResponses[modelId] || '感谢你的提问！我会尽力为你提供帮助。'
}
