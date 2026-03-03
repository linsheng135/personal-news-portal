import { useState } from 'react'
import { ArrowLeft, Calendar, Filter, Search, ChevronDown, ChevronUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { format, parseISO, isSameDay } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { NewsCard } from '../components/news/NewsCard'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { useNews } from '../contexts/NewsContext'

export function History() {
  const { historyNews, loading, error } = useNews()
  const [selectedDate, setSelectedDate] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all') // 'all', 'ai', 'finance'
  const [expandedDates, setExpandedDates] = useState({})

  // 按日期分组
  const groupedNews = historyNews.reduce((acc, news) => {
    const date = news.date
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(news)
    return acc
  }, {})

  // 获取所有日期并排序
  const dates = Object.keys(groupedNews).sort((a, b) => b.localeCompare(a))

  // 过滤日期
  const filteredDates = dates.filter(date => {
    let filteredNews = groupedNews[date]
    
    // 按分类过滤
    if (categoryFilter !== 'all') {
      filteredNews = filteredNews.filter(news => news.category === categoryFilter)
    }
    
    // 按搜索词过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filteredNews = filteredNews.filter(news => 
        news.title.toLowerCase().includes(query) || 
        news.summary.toLowerCase().includes(query)
      )
    }
    
    return filteredNews.length > 0
  })

  // 获取选定日期的新闻
  const selectedNews = selectedDate ? groupedNews[selectedDate] || [] : []

  // 统计信息
  const totalDays = dates.length
  const totalNews = historyNews.length
  const aiNews = historyNews.filter(news => news.category === 'ai').length
  const financeNews = historyNews.filter(news => news.category === 'finance').length

  // 切换日期展开状态
  const toggleDate = (date) => {
    setExpandedDates(prev => ({
      ...prev,
      [date]: !prev[date]
    }))
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <LoadingSpinner size="large" />
        <p className="mt-4 text-text-secondary">正在加载历史资讯...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md">
          <h3 className="text-lg font-semibold text-red-800 mb-2">加载失败</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200"
          >
            重新加载
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      {/* 返回按钮和标题 */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link
            to="/"
            className="flex items-center space-x-2 text-text-secondary hover:text-text-primary transition-colors duration-200"
          >
            <ArrowLeft size={20} />
            <span>返回首页</span>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-text-primary">历史资讯回顾</h1>
            <p className="text-text-secondary mt-1">查看过往的精选资讯</p>
          </div>
        </div>
      </div>

      {/* 统计信息 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-800 mb-1">总天数</p>
              <p className="text-2xl font-bold text-blue-900">{totalDays}</p>
            </div>
            <Calendar size={20} className="text-blue-400" />
          </div>
        </div>
        
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-800 mb-1">总资讯</p>
              <p className="text-2xl font-bold text-emerald-900">{totalNews}</p>
            </div>
            <span className="text-xs text-emerald-500">条</span>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-800 mb-1">AI 技术</p>
              <p className="text-2xl font-bold text-blue-900">{aiNews}</p>
            </div>
            <span className="text-xs text-blue-500">条</span>
          </div>
        </div>
        
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-800 mb-1">个人赚钱</p>
              <p className="text-2xl font-bold text-emerald-900">{financeNews}</p>
            </div>
            <span className="text-xs text-emerald-500">条</span>
          </div>
        </div>
      </div>

      {/* 筛选和搜索 */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 搜索框 */}
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              placeholder="搜索历史资讯..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {/* 分类筛选 */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                categoryFilter === 'all'
                  ? 'bg-ai-primary text-white'
                  : 'bg-gray-100 text-text-secondary hover:text-text-primary'
              }`}
            >
              全部
            </button>
            <button
              onClick={() => setCategoryFilter('ai')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                categoryFilter === 'ai'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-text-secondary hover:text-text-primary'
              }`}
            >
              AI 技术
            </button>
            <button
              onClick={() => setCategoryFilter('finance')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                categoryFilter === 'finance'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-gray-100 text-text-secondary hover:text-text-primary'
              }`}
            >
              个人赚钱
            </button>
            <button className="flex items-center space-x-1 px-4 py-2 bg-gray-100 text-text-secondary hover:text-text-primary rounded-lg transition-colors duration-200">
              <Filter size={16} />
              <span>更多筛选</span>
            </button>
          </div>
        </div>
      </div>

      {/* 历史日期列表和内容 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 日期列表 */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <div className="bg-card rounded-xl border border-border p-4 mb-4">
              <h3 className="text-lg font-semibold text-text-primary mb-3">日期列表</h3>
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                {filteredDates.length === 0 ? (
                  <p className="text-text-secondary text-center py-4">暂无匹配的日期</p>
                ) : (
                  filteredDates.map((date, index) => {
                    const newsCount = groupedNews[date].length
                    const isExpanded = expandedDates[date]
                    const isSelected = selectedDate === date
                    const parsedDate = parseISO(date)
                    const formattedDate = format(parsedDate, 'MM月dd日 EEEE', { locale: zhCN })
                    
                    return (
                      <div key={date}>
                        <button
                          onClick={() => toggleDate(date)}
                          className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors duration-200 ${
                            isSelected
                              ? 'bg-ai-primary text-white'
                              : 'bg-gray-50 hover:bg-gray-100 text-text-primary'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              isSelected ? 'bg-white/20' : 'bg-gray-200'
                            }`}>
                              <span className={`text-sm font-medium ${
                                isSelected ? 'text-white' : 'text-gray-600'
                              }`}>
                                {index + 1}
                              </span>
                            </div>
                            <div className="text-left">
                              <div className="font-medium">{formattedDate}</div>
                              <div className={`text-xs ${
                                isSelected ? 'text-white/80' : 'text-text-secondary'
                              }`}>
                                {newsCount} 条资讯
                              </div>
                            </div>
                          </div>
                          {isExpanded ? (
                            <ChevronUp size={18} />
                          ) : (
                            <ChevronDown size={18} />
                          )}
                        </button>
                        
                        {/* 展开的详细资讯 */}
                        {isExpanded && (
                          <div className="mt-2 ml-4 space-y-2 animate-fade-in">
                            {groupedNews[date]
                              .filter(news => {
                                if (categoryFilter !== 'all' && news.category !== categoryFilter) {
                                  return false
                                }
                                if (searchQuery) {
                                  const query = searchQuery.toLowerCase()
                                  return news.title.toLowerCase().includes(query) || 
                                         news.summary.toLowerCase().includes(query)
                                }
                                return true
                              })
                              .map((news, newsIndex) => (
                                <button
                                  key={news.id || newsIndex}
                                  onClick={() => setSelectedDate(date)}
                                  className="w-full text-left p-2 rounded-lg bg-white hover:bg-gray-50 transition-colors duration-200"
                                >
                                  <div className="flex items-start space-x-2">
                                    <div className={`w-2 h-2 rounded-full mt-1.5 ${
                                      news.category === 'ai' ? 'bg-blue-500' : 'bg-emerald-500'
                                    }`} />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-text-primary truncate">
                                        {news.title}
                                      </p>
                                      <p className="text-xs text-text-secondary mt-0.5">
                                        {news.source}
                                      </p>
                                    </div>
                                  </div>
                                </button>
                              ))}
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* 选定日期的详细内容 */}
        <div className="lg:col-span-2">
          {selectedDate ? (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-text-primary">
                    {format(parseISO(selectedDate), 'yyyy年MM月dd日 EEEE', { locale: zhCN })}
                  </h2>
                  <p className="text-text-secondary mt-1">
                    共 {groupedNews[selectedDate].length} 条资讯
                  </p>
                </div>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  清除选择
                </button>
              </div>
              
              <div className="space-y-6">
                {groupedNews[selectedDate]
                  .filter(news => {
                    if (categoryFilter !== 'all' && news.category !== categoryFilter) {
                      return false
                    }
                    if (searchQuery) {
                      const query = searchQuery.toLowerCase()
                      return news.title.toLowerCase().includes(query) || 
                             news.summary.toLowerCase().includes(query)
                    }
                    return true
                  })
                  .map((news, index) => (
                    <NewsCard 
                      key={news.id || index} 
                      news={news}
                      index={index}
                    />
                  ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                <Calendar size={32} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-3">选择日期查看详情</h3>
              <p className="text-text-secondary max-w-md mx-auto mb-6">
                从左侧日期列表中选择一个日期，查看该日的所有精选资讯。
                你可以使用搜索和筛选功能快速找到感兴趣的资讯。
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button
                  onClick={() => {
                    if (dates.length > 0) {
                      setSelectedDate(dates[0])
                    }
                  }}
                  className="px-6 py-3 bg-ai-primary text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
                >
                  查看最新一天
                </button>
                <button
                  onClick={() => {
                    const today = format(new Date(), 'yyyy-MM-dd')
                    const todayDate = dates.find(date => isSameDay(parseISO(date), new Date()))
                    if (todayDate) {
                      setSelectedDate(todayDate)
                    }
                  }}
                  className="px-6 py-3 border border-border rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  查看今日资讯
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}