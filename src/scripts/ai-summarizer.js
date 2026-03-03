import OpenAI from 'openai'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

// 获取当前文件所在目录
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * AI 内容总结器
 * 使用 DeepSeek-R1 模型通过 SiliconFlow API 进行内容总结
 */
export class AISummarizer {
  constructor() {
    // 加载 API 密钥
    const apiKeysPath = join(__dirname, '..', '..', '..', 'api-keys.json')
    let apiKeys
    
    try {
      apiKeys = JSON.parse(readFileSync(apiKeysPath, 'utf8'))
    } catch (error) {
      console.error('❌ 无法加载 API 密钥文件:', error.message)
      console.log('⚠️  使用环境变量中的 API 密钥')
      apiKeys = {
        siliconflow: {
          api_key: process.env.SILICONFLOW_API_KEY || '',
          model: process.env.SILICONFLOW_MODEL || 'THUDM/GLM-4-9B-0414',
          base_url: process.env.SILICONFLOW_BASE_URL || 'https://api.siliconflow.cn/v1'
        }
      }
    }

    const config = apiKeys.siliconflow
    
    if (!config.api_key) {
      throw new Error('❌ SiliconFlow API 密钥未配置。请设置 SILICONFLOW_API_KEY 环境变量或配置 api-keys.json 文件')
    }

    // 初始化 OpenAI 客户端（兼容 SiliconFlow）
    this.client = new OpenAI({
      apiKey: config.api_key,
      baseURL: config.base_url,
      defaultHeaders: {
        'Content-Type': 'application/json'
      }
    })
    
    this.model = config.model
    this.maxTokens = 1000
    this.temperature = 0.7
    
    console.log(`✅ AI Summarizer 初始化完成，使用模型: ${this.model}`)
  }

  /**
   * 生成大白话总结
   * @param {string} content - 需要总结的原始内容
   * @param {string} title - 内容标题（可选）
   * @param {string} source - 内容来源（可选）
   * @returns {Promise<string>} - AI 生成的总结
   */
  async generateSummary(content, title = '', source = '') {
    try {
      // 构建提示词
      const prompt = this.buildPrompt(content, title, source)
      
      console.log(`🤖 正在生成总结: ${title || '无标题内容'}`)
      
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: '你是一个专业的内容总结助手，擅长用大白话解释复杂概念，让普通人都能轻松理解。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        stream: false
      })

      const summary = response.choices[0]?.message?.content?.trim()
      
      if (!summary) {
        throw new Error('AI 返回了空内容')
      }
      
      console.log(`✅ 总结生成完成: ${title || '无标题内容'}`)
      return summary
      
    } catch (error) {
      console.error(`❌ 生成总结失败 (${title || '无标题内容'}):`, error.message)
      
      // 返回降级总结（使用简单规则）
      return this.generateFallbackSummary(content, title, source)
    }
  }

  /**
   * 构建提示词
   */
  buildPrompt(content, title, source) {
    const contentPreview = content.length > 1000 
      ? content.substring(0, 1000) + '...' 
      : content
    
    let prompt = `请用大白话总结以下内容，只输出总结内容本身，不要有任何开场白或结束语。\n\n`
    
    if (title) {
      prompt += `标题: ${title}\n`
    }
    
    if (source) {
      prompt += `来源: ${source}\n`
    }
    
    prompt += `\n内容:\n${contentPreview}\n\n`
    
    prompt += `总结要求:
1. 使用通俗易懂的简体中文，避免专业术语
2. 用生活中的例子解释复杂概念
3. 突出核心观点和关键信息
4. 控制在300-500字
5. 使用Markdown格式（如## 小标题、- 要点）
6. 只输出总结内容，不要有"嗯，"、"好的，"等开头

直接开始总结:`
    
    return prompt
  }

  /**
   * 降级总结（当AI API不可用时使用）
   */
  generateFallbackSummary(content, title, source) {
    console.log('⚠️  使用降级总结方案')
    
    const contentPreview = content.length > 500 
      ? content.substring(0, 500) + '...' 
      : content
    
    let summary = ''
    
    if (title) {
      summary += `《${title}》的主要内容是：`
    } else {
      summary += '这篇文章的主要内容是：'
    }
    
    // 简单的规则总结
    const sentences = contentPreview.split(/[.!?。！？]+/).filter(s => s.trim().length > 0)
    
    if (sentences.length > 0) {
      // 取前3个有意义的句子
      const keySentences = sentences.slice(0, 3).map(s => s.trim())
      summary += keySentences.join('。') + '。'
    } else {
      summary += contentPreview.substring(0, 200) + '...'
    }
    
    if (source) {
      summary += `（来源：${source}）`
    }
    
    return summary
  }

  /**
   * 批量总结多个内容
   * @param {Array} items - 需要总结的内容数组
   * @param {number} concurrency - 并发数（默认3）
   * @returns {Promise<Array>} - 包含总结的内容数组
   */
  async batchSummarize(items, concurrency = 3) {
    console.log(`🤖 开始批量总结 ${items.length} 个内容，并发数: ${concurrency}`)
    
    const results = []
    const batches = []
    
    // 分批次处理
    for (let i = 0; i < items.length; i += concurrency) {
      batches.push(items.slice(i, i + concurrency))
    }
    
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex]
      console.log(`📦 处理批次 ${batchIndex + 1}/${batches.length} (${batch.length} 个内容)`)
      
      const batchPromises = batch.map(async (item, index) => {
        try {
          const summary = await this.generateSummary(
            item.summary || item.content || item.title,
            item.title,
            item.source
          )
          
          return {
            ...item,
            ai_summary: summary,
            summarized_at: new Date().toISOString(),
            summary_status: 'success'
          }
        } catch (error) {
          console.error(`❌ 内容总结失败 (${item.title || '无标题'}):`, error.message)
          
          return {
            ...item,
            ai_summary: this.generateFallbackSummary(
              item.summary || item.content || item.title,
              item.title,
              item.source
            ),
            summarized_at: new Date().toISOString(),
            summary_status: 'error',
            summary_error: error.message
          }
        }
      })
      
      const batchResults = await Promise.all(batchPromises)
      results.push(...batchResults)
      
      // 批次间延迟，避免速率限制
      if (batchIndex < batches.length - 1) {
        await this.delay(2000) // 2秒延迟
      }
    }
    
    console.log(`✅ 批量总结完成: ${results.length} 个内容处理完毕`)
    
    return results
  }

  /**
   * 延迟函数
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 测试 API 连接
   */
  async testConnection() {
    try {
      console.log('🧪 测试 AI API 连接...')
      
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'user',
            content: '请用一句话介绍你自己。'
          }
        ],
        max_tokens: 100,
        temperature: 0.3
      })
      
      const reply = response.choices[0]?.message?.content?.trim()
      
      if (reply) {
        console.log(`✅ API 连接测试成功，模型回复: "${reply}"`)
        return {
          status: 'success',
          model: this.model,
          response: reply
        }
      } else {
        throw new Error('API 返回了空响应')
      }
    } catch (error) {
      console.error('❌ API 连接测试失败:', error.message)
      return {
        status: 'error',
        model: this.model,
        error: error.message
      }
    }
  }

  /**
   * 估算 API 使用成本
   * @param {Array} items - 需要总结的内容数组
   * @returns {Object} - 成本估算信息
   */
  estimateCost(items) {
    // 简单估算：假设每个内容平均500字，每个token约0.75个中文字符
    const totalChars = items.reduce((sum, item) => {
      const content = item.summary || item.content || item.title || ''
      return sum + content.length
    }, 0)
    
    const estimatedTokens = Math.ceil(totalChars / 0.75)
    
    // SiliconFlow DeepSeek-R1 价格（假设价格，实际需查看文档）
    const pricePer1KTokens = 0.001 // 假设每1000个token 0.001美元
    
    const estimatedCost = (estimatedTokens / 1000) * pricePer1KTokens
    
    return {
      items_count: items.length,
      total_characters: totalChars,
      estimated_tokens: estimatedTokens,
      estimated_cost_usd: estimatedCost.toFixed(6),
      estimated_cost_cny: (estimatedCost * 7.2).toFixed(4), // 假设汇率7.2
      note: '此为估算值，实际使用可能有所不同。请参考 SiliconFlow 官方定价。'
    }
  }
}

/**
 * 使用示例
 */
async function exampleUsage() {
  try {
    const summarizer = new AISummarizer()
    
    // 测试连接
    const testResult = await summarizer.testConnection()
    console.log('测试结果:', testResult)
    
    if (testResult.status === 'success') {
      // 示例内容
      const exampleContent = `
        人工智能（AI）是计算机科学的一个分支，它企图了解智能的实质，
        并生产出一种新的能以人类智能相似的方式做出反应的智能机器。
        该领域的研究包括机器人、语言识别、图像识别、自然语言处理和专家系统等。
        
        AI可以分为弱人工智能和强人工智能。弱人工智能是专门设计来执行特定任务的人工智能，
        比如语音助手、推荐系统等。强人工智能则是具有人类智能水平，能够理解、学习和应用知识的AI。
      `
      
      // 单个内容总结
      const summary = await summarizer.generateSummary(
        exampleContent,
        '什么是人工智能？',
        '技术百科'
      )
      
      console.log('单个内容总结示例:')
      console.log(summary)
      console.log('\n---\n')
      
      // 批量总结示例
      const items = [
        {
          id: '1',
          title: '如何学习编程',
          summary: '学习编程需要掌握基础知识，选择合适语言，坚持练习，参与项目实践。',
          source: '编程教程'
        },
        {
          id: '2',
          title: '健康饮食的重要性',
          summary: '均衡饮食提供身体所需营养，预防疾病，保持健康体重，提高生活质量。',
          source: '健康指南'
        }
      ]
      
      // 成本估算
      const costEstimate = summarizer.estimateCost(items)
      console.log('成本估算:', costEstimate)
      
      // 批量总结
      const summarizedItems = await summarizer.batchSummarize(items, 2)
      console.log('批量总结结果:', summarizedItems)
    }
  } catch (error) {
    console.error('示例运行失败:', error)
  }
}

// 如果直接运行此文件，执行示例
if (import.meta.url === `file://${process.argv[1]}`) {
  exampleUsage()
}