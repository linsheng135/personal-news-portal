import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { format, subDays } from 'date-fns'

const NewsContext = createContext()

// 示例数据（开发期间使用）
const MOCK_TODAY_NEWS = [
  {
    id: '1',
    title: 'OpenAI 发布新一代语言模型，推理能力大幅提升',
    summary: 'OpenAI 刚刚发布了他们的最新语言模型，这个新模型在逻辑推理和数学计算方面有了很大的进步。简单说就是比以前更聪明了，能更好地理解复杂问题，并在需要推理的任务上表现更好。',
    url: 'https://example.com/openai-new-model',
    source: 'TechCrunch',
    category: 'ai',
    date: '2024-03-03',
    published_at: '2024-03-03T09:30:00Z',
    reading_time: 3,
    likes: 245,
    comments: 42,
    tags: ['OpenAI', '语言模型', '人工智能']
  },
  {
    id: '2',
    title: '独立开发者分享：如何通过小程序月入过万',
    summary: '一位独立开发者分享了他如何通过开发微信小程序实现月入过万的经验。关键是要找到小而美的需求，快速验证，持续迭代。他建议从解决自己的实际问题开始，然后扩展到更广泛的用户。',
    url: 'https://example.com/mini-program-income',
    source: 'Indie Hackers',
    category: 'finance',
    date: '2024-03-03',
    published_at: '2024-03-03T11:15:00Z',
    reading_time: 5,
    likes: 189,
    comments: 31,
    tags: ['独立开发', '副业', '小程序']
  },
  {
    id: '3',
    title: 'GitHub Copilot 新功能：代码审查助手',
    summary: 'GitHub Copilot 推出了新的代码审查功能，可以自动检查代码质量、发现潜在问题，并给出改进建议。这个功能特别适合团队协作，能帮助提高代码质量，减少bug。',
    url: 'https://example.com/copilot-code-review',
    source: 'GitHub Blog',
    category: 'ai',
    date: '2024-03-03',
    published_at: '2024-03-03T14:20:00Z',
    reading_time: 4,
    likes: 312,
    comments: 56,
    tags: ['GitHub', 'Copilot', '编程工具']
  },
  {
    id: '4',
    title: 'Reddit 用户分享：通过内容创作月赚5000美元',
    summary: '一位 Reddit 用户详细分享了他如何通过内容创作（博客、视频、社交媒体）实现月入5000美元的经历。他强调找到自己擅长的领域，提供有价值的内容，并通过多种渠道变现的重要性。',
    url: 'https://example.com/content-creation-income',
    source: 'Reddit',
    category: 'finance',
    date: '2024-03-03',
    published_at: '2024-03-03T16:45:00Z',
    reading_time: 6,
    likes: 423,
    comments: 78,
    tags: ['内容创作', '变现', '社交媒体']
  }
]

const MOCK_HISTORY_NEWS = [
  {
    id: '5',
    title: 'AI 在医疗诊断中的应用突破',
    summary: '研究人员开发了一种新的 AI 系统，能在早期更准确地诊断某些疾病。这个系统通过分析医疗影像，能发现医生可能忽略的细微特征。',
    url: 'https://example.com/ai-medical-diagnosis',
    source: 'Nature',
    category: 'ai',
    date: '2024-03-02',
    published_at: '2024-03-02T10:30:00Z',
    reading_time: 4,
    likes: 156,
    comments: 23,
    tags: ['医疗AI', '诊断', '研究']
  },
  {
    id: '6',
    title: '如何通过电商 dropshipping 开始副业',
    summary: '电商 dropshipping 是一种低风险的创业方式，不需要囤货，适合新手。文章详细介绍了如何选品、搭建店铺、营销推广的全流程。',
    url: 'https://example.com/dropshipping-guide',
    source: 'Shopify Blog',
    category: 'finance',
    date: '2024-03-02',
    published_at: '2024-03-02T13:15:00Z',
    reading_time: 7,
    likes: 287,
    comments: 45,
    tags: ['电商', 'dropshipping', '副业']
  },
  {
    id: '7',
    title: 'Google 发布新的 AI 开发工具',
    summary: 'Google 推出了新的 AI 开发工具包，让开发者更容易构建和部署 AI 应用。这个工具包包含了预训练模型、部署工具和监控功能。',
    url: 'https://example.com/google-ai-tools',
    source: 'Google AI Blog',
    category: 'ai',
    date: '2024-03-01',
    published_at: '2024-03-01T09:45:00Z',
    reading_time: 3,
    likes: 198,
    comments: 32,
    tags: ['Google', '开发工具', 'AI']
  },
  {
    id: '8',
    title: '理财小白如何开始投资',
    summary: '针对投资新手的入门指南，介绍了基本的投资概念、风险评估和简单的投资策略。建议从低风险的基金开始，逐步学习。',
    url: 'https://example.com/investing-beginners',
    source: '理财社区',
    category: 'finance',
    date: '2024-03-01',
    published_at: '2024-03-01T15:20:00Z',
    reading_time: 8,
    likes: 345,
    comments: 67,
    tags: ['投资', '理财', '入门']
  }
]

export function NewsProvider({ children }) {
  const [todayNews, setTodayNews] = useState([])
  const [historyNews, setHistoryNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  // 从 GitHub 仓库加载数据
  const fetchNewsData = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      // 在实际部署中，这里会从 GitHub Pages 或 API 获取数据
      // 暂时使用模拟数据
      
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // 设置今日数据
      const today = format(new Date(), 'yyyy-MM-dd')
      const todayData = MOCK_TODAY_NEWS.map(news => ({
        ...news,
        date: today
      }))
      
      // 设置历史数据
      const historyData = [...MOCK_HISTORY_NEWS, ...MOCK_TODAY_NEWS]
      
      setTodayNews(todayData)
      setHistoryNews(historyData)
      setLastUpdated(new Date().toISOString())
      
    } catch (err) {
      console.error('加载新闻数据失败:', err)
      setError('无法加载新闻数据，请稍后重试')
      
      // 如果加载失败，使用模拟数据作为后备
      setTodayNews(MOCK_TODAY_NEWS)
      setHistoryNews([...MOCK_HISTORY_NEWS, ...MOCK_TODAY_NEWS])
    } finally {
      setLoading(false)
    }
  }, [])

  // 手动刷新数据
  const refreshNews = useCallback(async () => {
    await fetchNewsData()
  }, [fetchNewsData])

  // 搜索新闻
  const searchNews = useCallback((query, category = 'all', dateRange = null) => {
    let results = [...todayNews, ...historyNews]
    
    if (query) {
      const q = query.toLowerCase()
      results = results.filter(news => 
        news.title.toLowerCase().includes(q) || 
        news.summary.toLowerCase().includes(q) ||
        news.tags.some(tag => tag.toLowerCase().includes(q))
      )
    }
    
    if (category !== 'all') {
      results = results.filter(news => news.category === category)
    }
    
    if (dateRange) {
      const { start, end } = dateRange
      results = results.filter(news => {
        const newsDate = new Date(news.date)
        return newsDate >= start && newsDate <= end
      })
    }
    
    return results
  }, [todayNews, historyNews])

  // 按日期获取新闻
  const getNewsByDate = useCallback((date) => {
    const targetDate = format(date, 'yyyy-MM-dd')
    return historyNews.filter(news => news.date === targetDate)
  }, [historyNews])

  // 获取统计数据
  const getStats = useCallback(() => {
    const totalToday = todayNews.length
    const totalHistory = historyNews.length
    const aiToday = todayNews.filter(news => news.category === 'ai').length
    const financeToday = todayNews.filter(news => news.category === 'finance').length
    const aiHistory = historyNews.filter(news => news.category === 'ai').length
    const financeHistory = historyNews.filter(news => news.category === 'finance').length
    
    return {
      totalToday,
      totalHistory,
      aiToday,
      financeToday,
      aiHistory,
      financeHistory,
      totalDays: new Set(historyNews.map(news => news.date)).size
    }
  }, [todayNews, historyNews])

  // 初始化加载数据
  useEffect(() => {
    fetchNewsData()
    
    // 设置定时刷新（每5分钟检查一次）
    const intervalId = setInterval(fetchNewsData, 5 * 60 * 1000)
    
    return () => clearInterval(intervalId)
  }, [fetchNewsData])

  const value = {
    todayNews,
    historyNews,
    loading,
    error,
    lastUpdated,
    refreshNews,
    searchNews,
    getNewsByDate,
    getStats
  }

  return (
    <NewsContext.Provider value={value}>
      {children}
    </NewsContext.Provider>
  )
}

export function useNews() {
  const context = useContext(NewsContext)
  if (!context) {
    throw new Error('useNews 必须在 NewsProvider 内部使用')
  }
  return context
}