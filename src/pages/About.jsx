import { Link } from 'react-router-dom'
import { ArrowLeft, Brain, TrendingUp, RefreshCw, Globe, Shield, Zap, Users, Code, Database } from 'lucide-react'

export function About() {
  const features = [
    {
      icon: <Brain className="text-blue-600" size={24} />,
      title: "AI 技术主题",
      description: "每日抓取最新的 AI 研究、技术突破、应用案例，帮你紧跟技术前沿。",
      details: [
        "Hacker News 技术精选",
        "arXiv 最新 AI 论文",
        "技术博客和社区讨论",
        "开源项目动态"
      ]
    },
    {
      icon: <TrendingUp className="text-emerald-600" size={24} />,
      title: "个人赚钱主题",
      description: "收集实用的赚钱思路、副业项目、理财技巧，帮你发现更多收入机会。",
      details: [
        "独立开发者经验分享",
        "副业项目和思路",
        "创业和投资机会",
        "个人成长和技能提升"
      ]
    },
    {
      icon: <RefreshCw className="text-purple-600" size={24} />,
      title: "自动化处理",
      description: "全自动流程，从抓取到展示无需人工干预，每天定时更新。",
      details: [
        "GitHub Actions 自动化",
        "AI 智能总结和提炼",
        "自动去重和筛选",
        "历史数据归档"
      ]
    },
    {
      icon: <Globe className="text-amber-600" size={24} />,
      title: "信息源可靠",
      description: "精选一手信息源，避免二手转载，确保信息质量和时效性。",
      details: [
        "官方 RSS 和 API",
        "技术社区一手信息",
        "权威媒体和博客",
        "公开数据和报告"
      ]
    },
    {
      icon: <Shield className="text-red-600" size={24} />,
      title: "隐私安全",
      description: "本地化处理，不收集用户数据，所有操作透明可控。",
      details: [
        "本地 API 密钥存储",
        "不收集用户信息",
        "开源代码透明",
        "数据自主可控"
      ]
    },
    {
      icon: <Zap className="text-indigo-600" size={24} />,
      title: "快速访问",
      description: "响应式设计，手机、平板、电脑都能良好显示，随时随地查看。",
      details: [
        "移动端优化",
        "快速加载",
        "离线缓存支持",
        "简洁易用的界面"
      ]
    }
  ]

  const techStack = [
    { name: "React", description: "前端框架，构建用户界面", color: "bg-blue-100 text-blue-800" },
    { name: "Tailwind CSS", description: "CSS 框架，快速构建样式", color: "bg-emerald-100 text-emerald-800" },
    { name: "GitHub Actions", description: "自动化工作流，定时任务", color: "bg-purple-100 text-purple-800" },
    { name: "DeepSeek-R1", description: "AI 模型，内容总结和分析", color: "bg-amber-100 text-amber-800" },
    { name: "RSS/API", description: "数据抓取，获取最新资讯", color: "bg-gray-100 text-gray-800" },
    { name: "GitHub Pages", description: "静态网站托管，免费部署", color: "bg-red-100 text-red-800" },
    { name: "Zustand", description: "状态管理，数据共享", color: "bg-indigo-100 text-indigo-800" },
    { name: "Date-fns", description: "日期处理，时间格式化", color: "bg-pink-100 text-pink-800" }
  ]

  const dataSources = [
    {
      category: "AI 技术",
      sources: [
        { name: "Hacker News", url: "https://news.ycombinator.com/", type: "API" },
        { name: "arXiv.org", url: "https://arxiv.org/", type: "RSS" },
        { name: "Towards Data Science", url: "https://towardsdatascience.com/", type: "RSS" },
        { name: "Reddit r/MachineLearning", url: "https://www.reddit.com/r/MachineLearning/", type: "API" },
        { name: "GitHub Trending", url: "https://github.com/trending", type: "HTML" }
      ]
    },
    {
      category: "个人赚钱",
      sources: [
        { name: "Indie Hackers", url: "https://www.indiehackers.com/", type: "RSS" },
        { name: "Reddit r/sidehustle", url: "https://www.reddit.com/r/sidehustle/", type: "API" },
        { name: "Product Hunt", url: "https://www.producthunt.com/", type: "RSS" },
        { name: "独立博客精选", url: "#", type: "RSS" },
        { name: "中文社区精选", url: "#", type: "HTML" }
      ]
    }
  ]

  return (
    <div className="animate-fade-in">
      {/* 返回按钮和标题 */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <Link
            to="/"
            className="flex items-center space-x-2 text-text-secondary hover:text-text-primary transition-colors duration-200"
          >
            <ArrowLeft size={20} />
            <span>返回首页</span>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-text-primary">关于本项目</h1>
            <p className="text-text-secondary mt-1">了解资讯聚合门户的设计理念和技术实现</p>
          </div>
        </div>
      </div>

      {/* 项目简介 */}
      <div className="bg-gradient-to-r from-blue-50 to-emerald-50 border border-blue-200 rounded-xl p-8 mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl font-bold text-text-primary mb-4">🎯 项目目标</h2>
            <p className="text-text-secondary mb-4">
              资讯聚合门户旨在帮助用户高效获取 AI 技术和个人赚钱两个主题的优质信息。
              通过自动化抓取、AI 智能总结和清晰展示，让你在几分钟内了解最新趋势和机会。
            </p>
            <p className="text-text-secondary">
              我们希望解决信息过载的问题，让你不再需要浏览数十个网站和社区，
              而是通过一个统一的入口，快速获取最相关、最有价值的信息。
            </p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Users size={24} className="text-blue-600" />
              <div>
                <h3 className="font-semibold text-text-primary">为用户</h3>
                <p className="text-sm text-text-secondary">节省时间，提升信息获取效率</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Code size={24} className="text-emerald-600" />
              <div>
                <h3 className="font-semibold text-text-primary">为开发者</h3>
                <p className="text-sm text-text-secondary">展示自动化项目的最佳实践</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Database size={24} className="text-purple-600" />
              <div>
                <h3 className="font-semibold text-text-primary">为学习者</h3>
                <p className="text-sm text-text-secondary">提供持续的学习资源和灵感</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 核心功能 */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-text-primary mb-6">✨ 核心功能</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="card hover:shadow-card-hover transition-all duration-300">
              <div className="flex items-start space-x-3 mb-4">
                <div className="p-2 rounded-lg bg-gray-50">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">{feature.title}</h3>
                  <p className="text-text-secondary text-sm mt-1">{feature.description}</p>
                </div>
              </div>
              <ul className="space-y-2">
                {feature.details.map((detail, idx) => (
                  <li key={idx} className="flex items-center text-sm text-text-secondary">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mr-2"></span>
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* 技术栈 */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-text-primary mb-6">🛠️ 技术栈</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {techStack.map((tech, index) => (
            <div key={index} className="bg-card border border-border rounded-xl p-4">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-2 ${tech.color}`}>
                {tech.name}
              </span>
              <p className="text-text-secondary text-sm">{tech.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 数据来源 */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-text-primary mb-6">📡 数据来源</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {dataSources.map((category, index) => (
            <div key={index} className="card">
              <h3 className="text-xl font-semibold text-text-primary mb-4">{category.category}</h3>
              <div className="space-y-3">
                {category.sources.map((source, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-text-primary">{source.name}</h4>
                      <p className="text-text-secondary text-sm mt-1">{source.type} · 每日抓取</p>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium bg-gray-200 text-gray-700 rounded">
                      来源
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="text-text-secondary text-sm mt-4">
          注：所有数据来源均为公开可访问的 RSS、API 或网页，遵循相关网站的使用条款。
        </p>
      </div>

      {/* 工作原理 */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-text-primary mb-6">⚙️ 工作原理</h2>
        <div className="bg-gray-50 rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-bold text-lg">1</span>
              </div>
              <h4 className="font-semibold text-text-primary mb-2">抓取</h4>
              <p className="text-text-secondary text-sm">定时抓取各信息源的最新内容</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-emerald-100 flex items-center justify-center">
                <span className="text-emerald-600 font-bold text-lg">2</span>
              </div>
              <h4 className="font-semibold text-text-primary mb-2">处理</h4>
              <p className="text-text-secondary text-sm">去重、分类、AI 总结、格式化</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="text-purple-600 font-bold text-lg">3</span>
              </div>
              <h4 className="font-semibold text-text-primary mb-2">存储</h4>
              <p className="text-text-secondary text-sm">保存到 GitHub 仓库，更新数据文件</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-amber-100 flex items-center justify-center">
                <span className="text-amber-600 font-bold text-lg">4</span>
              </div>
              <h4 className="font-semibold text-text-primary mb-2">展示</h4>
              <p className="text-text-secondary text-sm">前端加载数据，展示给用户</p>
            </div>
          </div>
        </div>
      </div>

      {/* 开源信息 */}
      <div className="bg-card border border-border rounded-xl p-8">
        <h2 className="text-2xl font-bold text-text-primary mb-4">🌍 开源项目</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <p className="text-text-secondary mb-4">
              资讯聚合门户是一个完全开源的项目，代码托管在 GitHub 上。
              任何人都可以查看、使用、修改和分发这个项目。
            </p>
            <div className="space-y-3">
              <a
                href="https://github.com/linsheng135/personal-news-portal"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-text-primary">GitHub 仓库</h4>
                  <p className="text-text-secondary text-sm">查看源代码和贡献指南</p>
                </div>
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-3">贡献和反馈</h3>
            <ul className="space-y-2 text-text-secondary">
              <li className="flex items-start space-x-2">
                <span className="text-green-500 font-bold">•</span>
                <span>提交 Issue 报告问题或建议新功能</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 font-bold">•</span>
                <span>创建 Pull Request 贡献代码改进</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-purple-500 font-bold">•</span>
                <span>分享项目给更多需要的人</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-amber-500 font-bold">•</span>
                <span>建议新的信息源或功能优化</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}