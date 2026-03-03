#!/usr/bin/env node

import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs'
import { AICrawler } from './crawlers/ai-crawler.js'
import { FinanceCrawler } from './crawlers/finance-crawler.js'
import { AISummarizer } from './ai-summarizer.js'

// 获取当前文件所在目录
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 项目根目录
const projectRoot = join(__dirname, '..', '..')

// 数据目录路径
const dataDir = join(projectRoot, 'src', 'data')
const currentDir = join(dataDir, 'current')
const historyDir = join(dataDir, 'history')

/**
 * 主爬虫控制器
 * 整合所有爬虫和总结功能
 */
class MainCrawler {
  constructor() {
    this.aiCrawler = new AICrawler()
    this.financeCrawler = new FinanceCrawler()
    this.summarizer = null // 延迟初始化
    
    // 确保数据目录存在
    this.ensureDirectories()
    
    // 解析命令行参数
    this.args = this.parseArgs()
    
    console.log('🚀 自动化资讯聚合门户 - 主爬虫启动')
    console.log('📊 参数配置:', this.args)
  }

  /**
   * 解析命令行参数
   */
  parseArgs() {
    const args = process.argv.slice(2)
    const parsed = {
      aiOnly: false,
      financeOnly: false,
      summarizeOnly: false,
      test: false,
      mock: false,
      limit: 10,
      output: 'today.json'
    }

    for (let i = 0; i < args.length; i++) {
      const arg = args[i]
      
      if (arg === '--ai-only') {
        parsed.aiOnly = true
      } else if (arg === '--finance-only') {
        parsed.financeOnly = true
      } else if (arg === '--summarize-only') {
        parsed.summarizeOnly = true
      } else if (arg === '--test') {
        parsed.test = true
      } else if (arg === '--mock') {
        parsed.mock = true
      } else if (arg === '--limit' && args[i + 1]) {
        parsed.limit = parseInt(args[i + 1], 10)
        i++
      } else if (arg === '--output' && args[i + 1]) {
        parsed.output = args[i + 1]
        i++
      } else if (arg === '--help' || arg === '-h') {
        this.showHelp()
        process.exit(0)
      }
    }

    return parsed
  }

  /**
   * 显示帮助信息
   */
  showHelp() {
    console.log(`
自动化资讯聚合门户 - 主爬虫脚本

用法:
  node src/scripts/main-crawler.js [选项]

选项:
  --ai-only          只抓取AI主题资讯
  --finance-only     只抓取赚钱主题资讯
  --summarize-only   只进行AI总结（不抓取）
  --test             测试模式（测试所有信息源）
  --mock             使用模拟数据（不实际抓取）
  --limit <数字>     每个主题限制抓取数量（默认: 10）
  --output <文件名>  输出文件名（默认: today.json）
  --help, -h         显示此帮助信息

示例:
  node src/scripts/main-crawler.js                    # 抓取所有主题并进行AI总结
  node src/scripts/main-crawler.js --ai-only          # 只抓取AI主题
  node src/scripts/main-crawler.js --test             # 测试所有信息源
  node src/scripts/main-crawler.js --mock --limit 5   # 使用模拟数据，限制5条
  node src/scripts/main-crawler.js --summarize-only   # 只对现有数据进行AI总结
    `)
  }

  /**
   * 确保数据目录存在
   */
  ensureDirectories() {
    const directories = [dataDir, currentDir, historyDir]
    
    for (const dir of directories) {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true })
        console.log(`📁 创建目录: ${dir}`)
      }
    }
  }

  /**
   * 运行主流程
   */
  async run() {
    try {
      console.log('🔄 开始运行主爬虫流程...')
      console.log('='.repeat(60))

      // 测试模式
      if (this.args.test) {
        await this.runTestMode()
        return
      }

      // 总结模式
      if (this.args.summarizeOnly) {
        await this.runSummarizeOnlyMode()
        return
      }

      // 正常抓取模式
      await this.runNormalMode()

    } catch (error) {
      console.error('❌ 主流程运行失败:', error)
      process.exit(1)
    }
  }

  /**
   * 测试模式 - 测试所有信息源
   */
  async runTestMode() {
    console.log('🧪 进入测试模式...')
    
    // 测试AI信息源
    console.log('\n📊 测试AI主题信息源:')
    const aiTestResults = await this.aiCrawler.fetchAllSourcesTest()
    
    // 测试金融信息源
    console.log('\n📊 测试赚钱主题信息源:')
    const financeTestResults = await this.financeCrawler.testAllSources()
    
    // 测试AI API
    console.log('\n🤖 测试AI总结API:')
    try {
      this.summarizer = new AISummarizer()
      const aiTestResult = await this.summarizer.testConnection()
      console.log(`AI API测试: ${aiTestResult.status === 'success' ? '✅ 成功' : '❌ 失败'}`)
      if (aiTestResult.status === 'success') {
        console.log(`模型回复: "${aiTestResult.response}"`)
      }
    } catch (error) {
      console.log(`AI API测试: ❌ 失败 - ${error.message}`)
    }
    
    console.log('\n' + '='.repeat(60))
    console.log('✅ 测试模式完成')
  }

  /**
   * 总结模式 - 只进行AI总结
   */
  async runSummarizeOnlyMode() {
    console.log('🤖 进入总结模式...')
    
    // 加载现有数据
    const existingData = this.loadExistingData()
    
    if (existingData.length === 0) {
      console.log('⚠️  没有找到现有数据，请先运行抓取模式')
      return
    }
    
    console.log(`📋 找到 ${existingData.length} 条现有数据`)
    
    // 初始化AI总结器
    this.summarizer = new AISummarizer()
    
    // 成本估算
    const costEstimate = this.summarizer.estimateCost(existingData)
    console.log('💰 成本估算:', costEstimate)
    
    // 确认是否继续
    const shouldContinue = await this.confirmAction(`确认对 ${existingData.length} 条数据进行AI总结？`)
    if (!shouldContinue) {
      console.log('⏹️  用户取消操作')
      return
    }
    
    // 批量总结
    const summarizedData = await this.summarizer.batchSummarize(existingData, 2)
    
    // 保存结果
    this.saveData(summarizedData, 'summarized.json')
    
    console.log('✅ 总结模式完成')
  }

  /**
   * 正常抓取模式
   */
  async runNormalMode() {
    console.log('🎯 进入正常抓取模式...')
    
    let allNews = []
    
    // 抓取AI主题
    if (!this.args.financeOnly) {
      console.log('\n🧠 抓取AI主题资讯...')
      
      if (this.args.mock) {
        allNews = allNews.concat(await this.aiCrawler.generateMockData())
        console.log(`📝 生成 ${this.aiCrawler.generateMockData().length} 条AI模拟数据`)
      } else {
        const aiNews = await this.aiCrawler.crawlAll()
        allNews = allNews.concat(aiNews)
        console.log(`📊 抓取到 ${aiNews.length} 条AI资讯`)
      }
    }
    
    // 抓取赚钱主题
    if (!this.args.aiOnly) {
      console.log('\n💰 抓取赚钱主题资讯...')
      
      if (this.args.mock) {
        allNews = allNews.concat(await this.financeCrawler.generateMockData())
        console.log(`📝 生成 ${this.financeCrawler.generateMockData().length} 条赚钱模拟数据`)
      } else {
        const financeNews = await this.financeCrawler.crawlAll()
        allNews = allNews.concat(financeNews)
        console.log(`📊 抓取到 ${financeNews.length} 条赚钱资讯`)
      }
    }
    
    // 限制数量
    if (allNews.length > this.args.limit) {
      allNews = allNews.slice(0, this.args.limit)
      console.log(`📦 限制为前 ${this.args.limit} 条数据`)
    }
    
    console.log(`📈 总共抓取到 ${allNews.length} 条资讯`)
    
    // AI总结
    if (!this.args.mock) {
      const shouldSummarize = await this.confirmAction('是否进行AI大白话总结？')
      
      if (shouldSummarize) {
        console.log('\n🤖 开始AI大白话总结...')
        
        // 初始化AI总结器
        this.summarizer = new AISummarizer()
        
        // 成本估算
        const costEstimate = this.summarizer.estimateCost(allNews)
        console.log('💰 成本估算:', costEstimate)
        
        // 确认是否继续
        const confirmCost = await this.confirmAction(`确认进行AI总结（估算成本约¥${costEstimate.estimated_cost_cny}）？`)
        
        if (confirmCost) {
          const summarizedNews = await this.summarizer.batchSummarize(allNews, 2)
          allNews = summarizedNews
          console.log(`✅ AI总结完成，处理 ${summarizedNews.length} 条数据`)
        } else {
          console.log('⏹️  跳过AI总结')
        }
      }
    }
    
    // 保存数据
    this.saveData(allNews, this.args.output)
    
    // 创建历史存档
    this.createHistoryArchive(allNews)
    
    console.log('\n' + '='.repeat(60))
    console.log('🎉 主爬虫流程完成！')
    console.log(`📊 总数据量: ${allNews.length} 条`)
    console.log(`💾 保存到: src/data/current/${this.args.output}`)
  }

  /**
   * 加载现有数据
   */
  loadExistingData() {
    const todayFile = join(currentDir, 'today.json')
    
    if (existsSync(todayFile)) {
      try {
        const content = readFileSync(todayFile, 'utf8')
        return JSON.parse(content)
      } catch (error) {
        console.error('❌ 加载现有数据失败:', error.message)
        return []
      }
    }
    
    return []
  }

  /**
   * 保存数据到文件
   */
  saveData(data, filename) {
    try {
      const filePath = join(currentDir, filename)
      
      // 添加元数据
      const dataWithMetadata = {
        metadata: {
          generated_at: new Date().toISOString(),
          items_count: data.length,
          categories: [...new Set(data.map(item => item.category))],
          sources: [...new Set(data.map(item => item.source))]
        },
        data: data
      }
      
      writeFileSync(filePath, JSON.stringify(dataWithMetadata, null, 2), 'utf8')
      console.log(`💾 数据保存到: ${filePath}`)
      
      return filePath
    } catch (error) {
      console.error('❌ 保存数据失败:', error.message)
      throw error
    }
  }

  /**
   * 创建历史存档
   */
  createHistoryArchive(data) {
    try {
      const today = new Date()
      const dateStr = today.toISOString().split('T')[0] // YYYY-MM-DD
      const historyFile = join(historyDir, `${dateStr}.json`)
      
      // 如果今天已经有历史文件，合并数据
      let existingData = []
      if (existsSync(historyFile)) {
        const existingContent = readFileSync(historyFile, 'utf8')
        const existingJson = JSON.parse(existingContent)
        existingData = existingJson.data || []
      }
      
      // 合并数据（去重）
      const mergedData = this.mergeAndDeduplicate(existingData, data)
      
      const historyWithMetadata = {
        metadata: {
          archived_at: today.toISOString(),
          date: dateStr,
          items_count: mergedData.length,
          note: '每日历史存档'
        },
        data: mergedData
      }
      
      writeFileSync(historyFile, JSON.stringify(historyWithMetadata, null, 2), 'utf8')
      console.log(`📚 历史存档创建: ${historyFile} (${mergedData.length} 条数据)`)
      
    } catch (error) {
      console.error('❌ 创建历史存档失败:', error.message)
    }
  }

  /**
   * 合并并去重数据
   */
  mergeAndDeduplicate(existingData, newData) {
    const mergedMap = new Map()
    
    // 添加现有数据
    for (const item of existingData) {
      if (item.id) {
        mergedMap.set(item.id, item)
      }
    }
    
    // 添加新数据（覆盖相同ID）
    for (const item of newData) {
      if (item.id) {
        mergedMap.set(item.id, item)
      }
    }
    
    return Array.from(mergedMap.values())
  }

  /**
   * 确认用户操作
   */
  async confirmAction(message) {
    // 如果是非交互模式或测试模式或自动模式，默认继续
    if (!process.stdin.isTTY || this.args.test || this.args.mock) {
      return true
    }
    
    // 检查是否在自动化环境中运行（有命令行参数）
    const hasCommandLineArgs = process.argv.length > 2
    if (hasCommandLineArgs) {
      console.log(`⏭️  自动模式: ${message} -> 自动继续`)
      return true
    }
    
    console.log(`\n❓ ${message} (y/N)`)
    
    return new Promise((resolve) => {
      process.stdin.setEncoding('utf8')
      process.stdin.once('data', (input) => {
        const answer = input.toString().trim().toLowerCase()
        resolve(answer === 'y' || answer === 'yes')
      })
    })
  }
}

/**
 * 主函数
 */
async function main() {
  try {
    const crawler = new MainCrawler()
    await crawler.run()
    
    // 等待用户输入（如果是交互模式）
    if (process.stdin.isTTY) {
      console.log('\n按回车键退出...')
      process.stdin.setEncoding('utf8')
      process.stdin.once('data', () => {
        process.exit(0)
      })
    } else {
      process.exit(0)
    }
    
  } catch (error) {
    console.error('❌ 主程序运行失败:', error)
    process.exit(1)
  }
}

// 启动主程序
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export { MainCrawler }