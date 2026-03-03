import { ExternalLink, Brain, TrendingUp, Calendar, Clock, ThumbsUp, MessageSquare } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { zhCN } from 'date-fns/locale'

export function NewsCard({ news, index }) {
  const {
    id,
    title,
    summary,
    url,
    source,
    category,
    date,
    published_at,
    reading_time,
    likes,
    comments,
    tags = []
  } = news

  const isAI = category === 'ai'
  const formattedDate = date ? format(parseISO(date), 'MM月dd日', { locale: zhCN }) : ''
  const formattedTime = published_at ? format(parseISO(published_at), 'HH:mm', { locale: zhCN }) : ''

  // 生成唯一的ID用于展开/收起
  const summaryId = `summary-${id || index}`

  return (
    <div className="card animate-slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* 左侧：序号和分类标识 */}
        <div className="lg:w-16 flex-shrink-0">
          <div className="flex lg:flex-col items-center lg:items-start gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isAI ? 'bg-blue-100' : 'bg-emerald-100'
            }`}>
              <span className={`text-lg font-bold ${
                isAI ? 'text-blue-700' : 'text-emerald-700'
              }`}>
                {index + 1}
              </span>
            </div>
            
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${
              isAI ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'
            }`}>
              {isAI ? (
                <>
                  <Brain size={12} />
                  <span className="text-xs font-medium">AI</span>
                </>
              ) : (
                <>
                  <TrendingUp size={12} />
                  <span className="text-xs font-medium">赚钱</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 右侧：主要内容 */}
        <div className="flex-1">
          {/* 标题和来源 */}
          <div className="mb-4">
            <div className="flex items-start justify-between mb-2">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex-1"
              >
                <h3 className="text-xl font-bold text-text-primary group-hover:text-ai-primary transition-colors duration-200 line-clamp-2">
                  {title}
                </h3>
              </a>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-3 p-2 text-text-secondary hover:text-ai-primary hover:bg-gray-50 rounded-lg transition-colors duration-200 flex-shrink-0"
                title="查看原文"
              >
                <ExternalLink size={18} />
              </a>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 text-text-secondary text-sm">
              <div className="flex items-center space-x-1">
                <span className="font-medium">{source}</span>
                <span className="text-xs opacity-75">来源</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <Calendar size={12} />
                <span>{formattedDate}</span>
              </div>
              
              {formattedTime && (
                <div className="flex items-center space-x-1">
                  <Clock size={12} />
                  <span>{formattedTime}</span>
                </div>
              )}
              
              {reading_time && (
                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                  ⏱️ {reading_time}分钟
                </span>
              )}
            </div>
          </div>

          {/* 摘要内容 */}
          <div className="mb-6">
            <div className="prose prose-sm max-w-none">
              <p className="text-text-secondary leading-relaxed">
                {summary}
              </p>
            </div>
          </div>

          {/* 标签和互动信息 */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border">
            {/* 标签 */}
            <div className="flex flex-wrap gap-2">
              {tags.slice(0, 3).map((tag, tagIndex) => (
                <span
                  key={tagIndex}
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    isAI
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {tag}
                </span>
              ))}
              {tags.length > 3 && (
                <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">
                  +{tags.length - 3}
                </span>
              )}
            </div>

            {/* 互动信息 */}
            <div className="flex items-center space-x-4 text-text-secondary text-sm">
              {likes !== undefined && (
                <div className="flex items-center space-x-1">
                  <ThumbsUp size={14} />
                  <span>{likes}</span>
                </div>
              )}
              
              {comments !== undefined && (
                <div className="flex items-center space-x-1">
                  <MessageSquare size={14} />
                  <span>{comments}</span>
                </div>
              )}
            </div>
          </div>

          {/* AI 总结标识 */}
          <div className="mt-4 pt-4 border-t border-dashed border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  <Brain size={12} className="text-white" />
                </div>
                <span className="text-xs font-medium text-text-primary">AI 总结</span>
                <span className="text-xs text-text-secondary">· 用大白话解释复杂概念</span>
              </div>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-ai-primary hover:text-blue-600 transition-colors duration-200"
              >
                查看原文详情 →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
