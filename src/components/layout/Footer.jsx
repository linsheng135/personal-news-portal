import { Github, Heart, Coffee, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

export function Footer() {
  const currentYear = new Date().getFullYear()
  const lastUpdated = format(new Date(), 'yyyy年MM月dd日 HH:mm', { locale: zhCN })
  
  return (
    <footer className="bg-card border-t border-border mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Project Info */}
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-4">资讯聚合门户</h3>
            <p className="text-text-secondary text-sm mb-4">
              每日自动抓取 AI 技术和个人赚钱主题的优质信息，
              用 AI 进行大白话总结，帮你快速了解最新趋势。
            </p>
            <div className="flex items-center space-x-2 text-text-secondary text-sm">
              <RefreshCw size={14} />
              <span>最后更新: {lastUpdated}</span>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-4">快速链接</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://github.com/linsheng135/personal-news-portal" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-text-secondary hover:text-ai-primary transition-colors duration-200 text-sm"
                >
                  <Github size={16} />
                  <span>GitHub 仓库</span>
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com/linsheng135" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-text-secondary hover:text-ai-primary transition-colors duration-200 text-sm"
                >
                  <Coffee size={16} />
                  <span>作者主页</span>
                </a>
              </li>
              <li>
                <button className="flex items-center space-x-2 text-text-secondary hover:text-ai-primary transition-colors duration-200 text-sm">
                  <Heart size={16} />
                  <span>支持项目</span>
                </button>
              </li>
            </ul>
          </div>
          
          {/* Technology Stack */}
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-4">技术栈</h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                React
              </span>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-medium rounded-full">
                Tailwind CSS
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                GitHub Actions
              </span>
              <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                DeepSeek-R1
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                RSS/API
              </span>
              <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                GitHub Pages
              </span>
            </div>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-border text-center">
          <p className="text-text-secondary text-sm">
            © {currentYear} 资讯聚合门户 · 基于开源技术构建 · 
            数据来源于公开信息源 · 总结内容由 AI 生成
          </p>
          <p className="text-text-secondary text-xs mt-2">
            本项目仅供学习交流使用，不对内容的准确性和完整性负责。
            如需引用，请自行核实原始来源。
          </p>
        </div>
      </div>
    </footer>
  )
}