import React from 'react'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css' // 使用GitHub风格的代码高亮
import styles from './index.module.scss'

interface MarkdownRendererProps {
  content: string
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  // 初始化MarkdownIt实例
  const md: MarkdownIt = new MarkdownIt({
    html: true, // 允许HTML标签
    linkify: true, // 自动识别链接
    typographer: true, // 替换一些排版元素
    highlight: (str: string, lang: string): string => {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return `<pre class="hljs"><code>${hljs.highlight(str, { language: lang }).value}</code></pre>`
        } catch (e) {
          console.log('ysy', e)
          // 如果高亮失败，返回带有原始代码的HTML
          return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`
        }
      }

      // 对于未知语言，尝试自动检测
      try {
        return `<pre class="hljs"><code>${hljs.highlightAuto(str).value}</code></pre>`
      } catch (e) {
        console.log('ysy', e)
        // 如果自动检测也失败，返回转义后的代码
        return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`
      }
    },
  })

  // 渲染Markdown内容
  const renderedContent = content ? md.render(content) : ''

  return <div className={styles.container} dangerouslySetInnerHTML={{ __html: renderedContent }} />
}

export default MarkdownRenderer
