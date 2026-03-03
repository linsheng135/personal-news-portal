import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { format, subDays } from 'date-fns'

const NewsContext = createContext()

// 获取数据文件URL
const getDataUrl = (path) => {
  // 在生产环境中，数据文件在GitHub Pages上
  // 在开发环境中，从本地public目录加载
  if (process.env.NODE_ENV === 'production') {
    // GitHub Pages路径
    return `/personal-news-portal/${path}`
  } else {
    // 开发环境路径
    return `/${path}`
  }
}

// 数据文件路径
const TODAY_DATA_URL = getDataUrl('src/data/current/today.json')
const HISTORY_DATA_URLS = [
  getDataUrl('src/data/history/2024-03-02.json')
  // 可以添加更多历史文件
]

export function NewsProvider({ children }) {
  const [todayNews, setTodayNews] = useState([])
  const [historyNews, setHistoryNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  // 从数据文件加载新闻数据
  const fetchNewsData = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      console.log('📥 开始加载新闻数据...')
      console.log('今日数据URL:', TODAY_DATA_URL)
      console.log('历史数据URLs:', HISTORY_DATA_URLS)
      
      // 加载今日数据
      let todayData = []
      let todayMetadata = {}
      
      try {
        const todayResponse = await fetch(TODAY_DATA_URL)
        if (!todayResponse.ok) {
          throw new Error(`HTTP ${todayResponse.status}: ${todayResponse.statusText}`)
        }
        
        const todayJson = await todayResponse.json()
        
        // 处理不同的数据格式
        if (todayJson.data && Array.isArray(todayJson.data)) {
          // 新格式: { metadata: {...}, data: [...] }
          todayData = todayJson.data
          todayMetadata = todayJson.metadata || {}
          console.log(`✅ 加载今日数据成功: ${todayData.length} 条新闻`)
        } else if (Array.isArray(todayJson.news)) {
          // 旧格式: { news: [...] }
          todayData = todayJson.news
          console.log(`✅ 加载今日数据成功 (旧格式): ${todayData.length} 条新闻`)
        } else if (Array.isArray(todayJson)) {
          // 直接数组格式
          todayData = todayJson
          console.log(`✅ 加载今日数据成功 (数组格式): ${todayData.length} 条新闻`)
        } else {
          console.warn('⚠️  未知的数据格式:', todayJson)
          todayData = []
        }
      } catch (todayError) {
        console.error('❌ 加载今日数据失败:', todayError.message)
        // 继续尝试加载历史数据
      }
      
      // 加载历史数据
      let allHistoryData = []
      
      for (const historyUrl of HISTORY_DATA_URLS) {
        try {
          const historyResponse = await fetch(historyUrl)
          if (!historyResponse.ok) {
            console.warn(`⚠️  无法加载历史数据 ${historyUrl}: HTTP ${historyResponse.status}`)
            continue
          }
          
          const historyJson = await historyResponse.json()
          let historyItems = []
          
          // 处理不同的数据格式
          if (historyJson.data && Array.isArray(historyJson.data)) {
            historyItems = historyJson.data
          } else if (Array.isArray(historyJson.news)) {
            historyItems = historyJson.news
          } else if (Array.isArray(historyJson)) {
            historyItems = historyJson
          }
          
          if (historyItems.length > 0) {
            console.log(`✅ 加载历史数据 ${historyUrl}: ${historyItems.length} 条新闻`)
            allHistoryData = [...allHistoryData, ...historyItems]
          }
        } catch (historyError) {
          console.error(`❌ 加载历史数据 ${historyUrl} 失败:`, historyError.message)
        }
      }
      
      // 确保数据格式正确
      const processedTodayData = todayData.map(item => ({
        ...item,
        // 确保有date字段
        date: item.date || format(new Date(item.published_at || new Date()), 'yyyy-MM-dd'),
        // 确保有必要的字段
        url: item.url || `https://example.com/missing-link-${item.id}`,
        category: item.category || (item.source?.toLowerCase().includes('ai') ? 'ai' : 'finance')
      }))
      
      const processedHistoryData = allHistoryData.map(item => ({
        ...item,
        date: item.date || format(new Date(item.published_at || new Date()), 'yyyy-MM-dd'),
        url: item.url || `https://example.com/missing-link-${item.id}`,
        category: item.category || (item.source?.toLowerCase().includes('ai') ? 'ai' : 'finance')
      }))
      
      setTodayNews(processedTodayData)
      setHistoryNews(processedHistoryData)
      setLastUpdated(new Date().toISOString())
      
      console.log(`📊 数据加载完成: 今日 ${processedTodayData.length} 条, 历史 ${processedHistoryData.length} 条`)
      
    } catch (err) {
      console.error('❌ 加载新闻数据失败:', err)
      setError(`无法加载新闻数据: ${err.message}`)
      
      // 不提供模拟数据作为后备，用户要求真实数据
      // 保持空数组，让用户知道没有数据
      setTodayNews([])
      setHistoryNews([])
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