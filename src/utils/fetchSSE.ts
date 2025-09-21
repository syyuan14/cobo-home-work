/**
 * 通用的 SSE (Server-Sent Events) 流式请求工具
 * @param apiEndpoint API 端点 URL
 * @param options fetch 请求选项
 * @param onToken 接收到新数据时的回调函数
 * @param onComplete 请求完成时的回调函数
 * @param onError 发生错误时的回调函数
 * @returns 中断函数，用于手动中断流式请求
 */

export interface StreamData {
  token?: string
  done?: boolean
  [key: string]: unknown
}

export const fetchSSE = async (
  apiEndpoint: string,
  options: RequestInit,
  onToken: (token: StreamData) => void,
  onComplete: () => void,
  onError: (error: Error) => void
): Promise<() => void> => {
  let controller: AbortController | null = null
  let reader: ReadableStreamDefaultReader | null = null

  // 创建中断函数
  const abort = () => {
    console.log('Aborting SSE stream')
    reader?.cancel()
    controller?.abort()
    onComplete()
  }

  try {
    // 如果没有提供 AbortController，则创建一个新的
    if (!options.signal) {
      controller = new AbortController()
      options.signal = controller.signal
    }

    const response = await fetch(apiEndpoint, options)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    if (!response.body) {
      throw new Error('Readable stream not supported')
    }

    reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    // 读取流数据
    const readChunk = async () => {
      try {
        const { done, value } = await reader!.read()

        if (done) {
          onComplete()
          return
        }

        // 解码新的块并添加到缓冲区
        buffer += decoder.decode(value, { stream: true })

        // 处理缓冲区中的完整SSE事件
        const lines = buffer.split('\n\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              onToken(data)
            } catch (error) {
              console.error('Error parsing stream data:', error)
            }
          }
        }

        // 继续读取下一个块
        readChunk()
      } catch (error) {
        console.error('Stream error:', error)
        onComplete()
        if (!controller?.signal.aborted) {
          onError(error instanceof Error ? error : new Error('流式传输错误'))
        }
      }
    }

    // 开始读取流
    readChunk()
  } catch (error) {
    console.error('Error in fetchSSE:', error)
    onComplete()
    if (!controller?.signal.aborted) {
      onError(error instanceof Error ? error : new Error('流式传输错误'))
    }
  }

  return abort
}
