import { useState } from 'react'
import { Brain, TrendingUp, Clock, ExternalLink, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { NewsCard } from '../components/news/NewsCard'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { useNews } from '../contexts/NewsContext'

export function Home() {
  const { todayNews, loading, error } = useNews()
  const [activeTab, setActiveTab] = useState('all') // 'all', 'ai', 'finance'
  
  const today = format(new Date(), 'yyyy年MM月dd日 EEEE', { locale: zhCN })
  
  // 过滤新闻
  const filteredNews = todayNews.filter(item => {
    if (activeTab === 'all') return true
    if (activeTab === 'ai') return item.category === 'ai'
    if (activeTab === 'finance') return item.category === 'finance'
    return true
  })
  
  // 分类统计
  const aiCount = todayNews.filter(item => item.category === 'ai').length
  const financeCount = todayNews.filter(item => item.category === 'finance').length
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <LoadingSpinner size="large" />
        <p className="mt-4 text-text-secondary">正在加载今日资讯...</p>
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
      {/* 页面标题和日期 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">今日精选资讯</h1>
            <p className="text-text-secondary mt-1">{today}</p>
          </div>
          <div className="flex items-center space-x-2 text-text-secondary">
            <Clock size={16} />
            <span className="text-sm">每日自动更新</span>
          </div>
        </div>
        
        {/* 统计信息 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <Brain size={20} className="text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">AI 技术</span>
                </div>
                <p className="text-2xl font-bold text-blue-900">{aiCount} 条</p>
              </div>
              <ChevronRight size={20} className="text-blue-400" />
            </div>
          </div>
          
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <TrendingUp size={20} className="text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-800">个人赚钱</span>
                </div>
                <p className="text-2xl font-bold text-emerald-900">{financeCount} 条</p>
              </div>
              <ChevronRight size={20} className="text-emerald-400" />
            </div>
          </div>
          
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <ExternalLink size={20} className="text-gray-600" />
                  <span className="text-sm font-medium text-gray-800">总计</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{todayNews.length} 条</p>
              </div>
              <span className="text-xs text-gray-500">精选</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* 标签页 */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
              activeTab === 'all'
                ? 'bg-ai-primary text-white'
                : 'bg-gray-100 text-text-secondary hover:text-text-primary'
            }`}
          >
            全部 ({todayNews.length})
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-1 ${
              activeTab === 'ai'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-text-secondary hover:text-text-primary'
            }`}
          >
            <Brain size={16} />
            <span>AI 技术 ({aiCount})</span>
          </button>
          <button
            onClick={() => setActiveTab('finance')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-1 ${
              activeTab === 'finance'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-gray-100 text-text-secondary hover:text-text-primary'
            }`}
          >
            <TrendingUp size={16} />
            <span>个人赚钱 ({financeCount})</span>
          </button>
        </div>
      </div>
      
      {/* 新闻列表 */}
      <div className="space-y-6">
        {filteredNews.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <Brain size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">暂无资讯</h3>
            <p className="text-text-secondary max-w-md mx-auto">
              今日的资讯正在抓取和处理中，请稍后再来查看。
              或者，你可以查看历史资讯。
            </p>
          </div>
        ) : (
          filteredNews.map((news, index) => (
            <NewsCard 
              key={news.id || index} 
              news={news}
              index={index}
            />
          ))
        )}
      </div>
      
      {/* 底部提示 */}
      <div className="mt-12 pt-8 border-t border-border">
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-2">💡 使用提示</h3>
          <ul className="space-y-2 text-text-secondary text-sm">
            <li className="flex items-start space-x-2">
              <span className="text-ai-primary font-bold">•</span>
              <span>所有资讯都经过 AI 总结，用大白话解释复杂概念</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-finance-primary font-bold">•</span>
              <span>点击标题或"查看原文"按钮可以访问原始文章</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-purple-600 font-bold">•</span>
              <span>系统每日自动更新，你可以在"历史回顾"中查看过往资讯</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-amber-600 font-bold">•</span>
              <span>资讯来源于公开的 RSS 和 API，确保信息一手可靠</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}