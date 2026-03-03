import axios from 'axios'
import Parser from 'rss-parser'
import { load } from 'cheerio'

// 创建 RSS 解析器
const parser = new Parser({
  customFields: {
    item: [
      ['content:encoded', 'contentEncoded'],
      ['dc:creator', 'creator'],
      ['pubDate', 'pubDate']
    ]
  }
})

/**
 * AI 主题资讯抓取器
 * 从多个来源抓取 AI 相关资讯
 */
export class AICrawler {
  constructor() {
    this.sources = [
      {
        name: 'Hacker News Best Stories',
        url: 'https://hacker-news.firebaseio.com/v0/beststories.json',
        type: 'api',
        category: 'ai',
        enabled: false,  // 需要特殊配置
        note: '需要有效的 User-Agent 头和特殊配置'
      },
      {
        name: 'arXiv.org AI Papers',
        url: 'http://export.arxiv.org/rss/cs.AI',
        type: 'rss',
        category: 'ai',
        enabled: true,
        note: '测试验证可用，提供高质量AI论文'
      },
      {
        name: 'Towards Data Science',
        url: 'https://towardsdatascience.com/feed',
        type: 'rss',
        category: 'ai',
        enabled: true,
        note: '测试验证可用，更新频繁的技术文章'
      },
      {
        name: 'Google AI Blog',
        url: 'https://ai.googleblog.com/feeds/posts/default',
        type: 'rss',
        category: 'ai',
        enabled: false,  // 测试发现连接问题
        note: '连接重置，可能被防火墙限制'
      },
      {
        name: 'OpenAI Blog',
        url: 'https://openai.com/blog/rss',
        type: 'rss',
        category: 'ai',
        enabled: false,  // 测试发现403错误
        note: '返回403错误，访问限制'
      },
      {
        name: 'DeepLearning.AI',
        url: 'https://www.deeplearning.ai/the-batch/feed',
        type: 'rss',
        category: 'ai',
        enabled: false,  // 测试发现404错误
        note: '返回404错误，RSS地址可能已变更'
      }
      // Reddit r/MachineLearning 需要 OAuth 令牌，暂时禁用
      // GitHub Trending 需要网页抓取，作为额外源单独处理
    ]
  }

  /**
   * 从 Hacker News 抓取最佳故事
   */
  async fetchHackerNews() {
    try {
      // Hacker News API 需要有效的 User-Agent
      const response = await axios.get(this.sources[0].url, {
        headers: {
          'User-Agent': 'NewsPortalBot/1.0 (+https://github.com/yourusername/personal-news-portal)'
        },
        timeout: 10000
      })
      
      const storyIds = response.data.slice(0, 5) // 取前5个故事
      
      const stories = await Promise.all(
        storyIds.map(async (id) => {
          const storyResponse = await axios.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, {
            headers: {
              'User-Agent': 'NewsPortalBot/1.0 (+https://github.com/yourusername/personal-news-portal)'
            },
            timeout: 10000
          })
          return storyResponse.data
        })
      )

      return stories
        .filter(story => story && story.title)
        .map(story => ({
          id: `hn_${story.id}`,
          title: story.title,
          summary: story.text ? story.text.substring(0, 200) + '...' : 'Hacker News story about technology and programming',
          url: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
          source: 'Hacker News',
          category: 'ai',
          published_at: new Date(story.time * 1000).toISOString(),
          likes: story.score || 0,
          comments: story.descendants || 0,
          tags: ['hackernews', 'technology', 'programming']
        }))
    } catch (error) {
      console.error('Error fetching Hacker News:', error.message)
      console.log('⚠️  Hacker News API 访问失败，将跳过此信息源')
      return []
    }
  }

  /**
   * 从 arXiv 抓取 AI 论文
   */
  async fetchArxivPapers() {
    try {
      const feed = await parser.parseURL(this.sources[1].url)
      
      return feed.items.slice(0, 5).map(item => {
        // 提取论文 ID 和摘要
        const arxivId = item.link?.match(/abs\/(\d+\.\d+)/)?.[1] || ''
        const summary = item.contentSnippet || item.content || 'AI research paper from arXiv'
        
        return {
          id: `arxiv_${arxivId || Date.now()}`,
          title: item.title || 'arXiv Paper',
          summary: summary.substring(0, 300) + '...',
          url: item.link || `https://arxiv.org/abs/${arxivId}`,
          source: 'arXiv.org',
          category: 'ai',
          published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
          tags: ['research', 'ai-papers', 'academic']
        }
      })
    } catch (error) {
      console.error('Error fetching arXiv papers:', error.message)
      return []
    }
  }

  /**
   * 从 Towards Data Science 抓取文章
   */
  async fetchTowardsDataScience() {
    try {
      const feed = await parser.parseURL(this.sources[2].url)
      
      return feed.items.slice(0, 5).map(item => {
        return {
          id: `tds_${item.guid || Date.now()}`,
          title: item.title || 'Towards Data Science Article',
          summary: item.contentSnippet ? item.contentSnippet.substring(0, 300) + '...' : 'Data science and AI article',
          url: item.link || '',
          source: 'Towards Data Science',
          category: 'ai',
          published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
          tags: ['data-science', 'machine-learning', 'tutorial']
        }
      })
    } catch (error) {
      console.error('Error fetching Towards Data Science:', error.message)
      return []
    }
  }

  /**
   * 从 Reddit r/MachineLearning 抓取热门帖子
   */
  async fetchRedditML() {
    try {
      const response = await axios.get(this.sources[3].url, {
        headers: {
          'User-Agent': 'NewsPortalBot/1.0'
        }
      })

      const posts = response.data.data.children.slice(0, 5)
      
      return posts
        .filter(post => post.data && !post.data.stickied)
        .map(post => ({
          id: `reddit_${post.data.id}`,
          title: post.data.title,
          summary: post.data.selftext ? post.data.selftext.substring(0, 200) + '...' : 'Reddit discussion about machine learning',
          url: `https://reddit.com${post.data.permalink}`,
          source: 'Reddit r/MachineLearning',
          category: 'ai',
          published_at: new Date(post.data.created_utc * 1000).toISOString(),
          likes: post.data.ups,
          comments: post.data.num_comments,
          tags: ['reddit', 'discussion', 'community']
        }))
    } catch (error) {
      console.error('Error fetching Reddit:', error.message)
      return []
    }
  }

  /**
   * 抓取 GitHub Trending AI 项目
   */
  async fetchGitHubTrending() {
    try {
      // GitHub Trending 页面需要解析 HTML
      const response = await axios.get('https://github.com/trending?since=daily&spoken_language_code=en', {
        headers: {
          'User-Agent': 'NewsPortalBot/1.0'
        }
      })

      const $ = load(response.data)
      const repos = []

      $('article.Box-row').slice(0, 5).each((index, element) => {
        const title = $(element).find('h2 a').text().trim()
        const url = 'https://github.com' + $(element).find('h2 a').attr('href')
        const description = $(element).find('p').text().trim()
        const stars = $(element).find('a[href$="/stargazers"]').text().trim()
        const language = $(element).find('span[itemprop="programmingLanguage"]').text().trim()

        if (title && url) {
          repos.push({
            id: `github_${Date.now()}_${index}`,
            title: title.replace(/\s+/g, ' '),
            summary: description || `GitHub project trending today${language ? ` in ${language}` : ''}`,
            url: url,
            source: 'GitHub Trending',
            category: 'ai',
            published_at: new Date().toISOString(),
            likes: stars ? parseInt(stars.replace(/,/g, '')) || 0 : 0,
            tags: ['github', 'open-source', 'trending'].concat(language ? [language.toLowerCase()] : [])
          })
        }
      })

      return repos
    } catch (error) {
      console.error('Error fetching GitHub Trending:', error.message)
      return []
    }
  }

  /**
   * 从 Google AI Blog 抓取文章
   */
  async fetchGoogleAIBlog() {
    try {
      const feed = await parser.parseURL(this.sources[3].url)
      
      return feed.items.slice(0, 5).map(item => {
        return {
          id: `google_ai_${item.guid || Date.now()}`,
          title: item.title || 'Google AI Blog Article',
          summary: item.contentSnippet ? item.contentSnippet.substring(0, 300) + '...' : 'Google AI research and technology updates',
          url: item.link || '',
          source: 'Google AI Blog',
          category: 'ai',
          published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
          tags: ['google', 'ai-research', 'official-blog']
        }
      })
    } catch (error) {
      console.error('Error fetching Google AI Blog:', error.message)
      return []
    }
  }

  /**
   * 从 OpenAI Blog 抓取文章
   */
  async fetchOpenAIBlog() {
    try {
      const feed = await parser.parseURL(this.sources[4].url)
      
      return feed.items.slice(0, 5).map(item => {
        return {
          id: `openai_${item.guid || Date.now()}`,
          title: item.title || 'OpenAI Blog Article',
          summary: item.contentSnippet ? item.contentSnippet.substring(0, 300) + '...' : 'OpenAI research and product updates',
          url: item.link || '',
          source: 'OpenAI Blog',
          category: 'ai',
          published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
          tags: ['openai', 'gpt', 'official-blog']
        }
      })
    } catch (error) {
      console.error('Error fetching OpenAI Blog:', error.message)
      return []
    }
  }

  /**
   * 从 DeepLearning.AI 抓取文章
   */
  async fetchDeepLearningAI() {
    try {
      const feed = await parser.parseURL(this.sources[5].url)
      
      return feed.items.slice(0, 5).map(item => {
        return {
          id: `dlai_${item.guid || Date.now()}`,
          title: item.title || 'DeepLearning.AI Article',
          summary: item.contentSnippet ? item.contentSnippet.substring(0, 300) + '...' : 'Deep learning tutorials and news',
          url: item.link || '',
          source: 'DeepLearning.AI',
          category: 'ai',
          published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
          tags: ['deep-learning', 'tutorial', 'education']
        }
      })
    } catch (error) {
      console.error('Error fetching DeepLearning.AI:', error.message)
      return []
    }
  }

  /**
   * 执行所有抓取任务
   */
  async crawlAll() {
    console.log('🔄 Starting AI news crawl...')
    console.log('📊 可用信息源:', this.sources.map(s => `${s.name} (${s.note})`).join(', '))
    
    // 根据启用的源构建抓取任务列表
    const crawlTasks = []
    
    // Hacker News (如果启用)
    if (this.sources[0].enabled !== false) {
      crawlTasks.push(this.fetchHackerNews())
    }
    
    // arXiv Papers (总是启用，已验证可用)
    crawlTasks.push(this.fetchArxivPapers())
    
    // Towards Data Science (总是启用，已验证可用)
    crawlTasks.push(this.fetchTowardsDataScience())
    
    // 新添加的信息源
    crawlTasks.push(this.fetchGoogleAIBlog())
    crawlTasks.push(this.fetchOpenAIBlog())
    crawlTasks.push(this.fetchDeepLearningAI())
    
    // GitHub Trending (作为额外源，尝试但不保证)
    try {
      // 检查网络连接
      crawlTasks.push(this.fetchGitHubTrending())
    } catch (error) {
      console.log('⚠️  GitHub Trending 抓取可能不可用，跳过')
    }
    
    const results = await Promise.allSettled(crawlTasks)

    // 合并所有成功的结果
    const allNews = results.reduce((acc, result) => {
      if (result.status === 'fulfilled') {
        const items = result.value || []
        if (items.length > 0) {
          console.log(`✅ 抓取到 ${items.length} 条来自 ${items[0]?.source || '未知源'} 的数据`)
        }
        return acc.concat(items)
      } else {
        console.error('抓取错误:', result.reason?.message || result.reason)
        return acc
      }
    }, [])

    console.log(`✅ AI抓取完成: 共找到 ${allNews.length} 条数据`)
    
    // 确保每条数据都有原始链接
    const validatedNews = allNews.map(item => {
      if (!item.url) {
        console.warn(`⚠️  数据缺少链接: ${item.title}`)
        // 如果没有URL，至少提供一个占位符
        item.url = `https://example.com/missing-link-${item.id}`
      }
      return item
    })
    
    return validatedNews
  }

  /**
   * 生成模拟数据（用于测试）
   */
  async generateMockData() {
    const mockNews = [
      {
        id: 'ai_mock_1',
        title: 'OpenAI 发布新一代语言模型，推理能力大幅提升',
        summary: 'OpenAI 刚刚发布了他们的最新语言模型，这个新模型在逻辑推理和数学计算方面有了很大的进步。简单说就是比以前更聪明了，能更好地理解复杂问题，并在需要推理的任务上表现更好。',
        url: 'https://example.com/openai-new-model',
        source: 'OpenAI Blog',
        category: 'ai',
        published_at: new Date().toISOString(),
        likes: 245,
        comments: 42,
        tags: ['OpenAI', '语言模型', '人工智能']
      },
      {
        id: 'ai_mock_2',
        title: 'GitHub Copilot 新功能：代码审查助手',
        summary: 'GitHub Copilot 推出了新的代码审查功能，可以自动检查代码质量、发现潜在问题，并给出改进建议。这个功能特别适合团队协作，能帮助提高代码质量，减少bug。',
        url: 'https://example.com/copilot-code-review',
        source: 'GitHub Blog',
        category: 'ai',
        published_at: new Date(Date.now() - 3600000).toISOString(),
        likes: 312,
        comments: 56,
        tags: ['GitHub', 'Copilot', '编程工具']
      },
      {
        id: 'ai_mock_3',
        title: 'DeepSeek 发布新的开源模型，性能接近 GPT-4',
        summary: 'DeepSeek 开源了他们的最新语言模型，在多项基准测试中表现接近 GPT-4。这个模型完全免费，可以本地部署，对于开发者和小公司来说是个好消息。',
        url: 'https://example.com/deepseek-open-source',
        source: 'DeepSeek Blog',
        category: 'ai',
        published_at: new Date(Date.now() - 7200000).toISOString(),
        likes: 521,
        comments: 89,
        tags: ['DeepSeek', '开源', '语言模型']
      }
    ]

    return mockNews
  }

  /**
   * 测试所有信息源的可用性
   */
  async fetchAllSourcesTest() {
    console.log('🧪 测试AI信息源可用性...')
    
    const testResults = []
    
    for (const source of this.sources) {
      try {
        const startTime = Date.now()
        
        if (source.type === 'rss') {
          const feed = await parser.parseURL(source.url)
          testResults.push({
            source: source.name,
            status: 'success',
            items: feed.items?.length || 0,
            responseTime: Date.now() - startTime,
            message: `找到 ${feed.items?.length || 0} 个项目`
          })
        } else if (source.type === 'api') {
          const response = await axios.get(source.url, {
            headers: { 'User-Agent': 'NewsPortalBot/1.0' },
            timeout: 10000
          })
          testResults.push({
            source: source.name,
            status: 'success',
            responseTime: Date.now() - startTime,
            message: `API响应状态: ${response.status}`
          })
        }
      } catch (error) {
        testResults.push({
          source: source.name,
          status: 'error',
          responseTime: 0,
          message: error.message
        })
      }
    }
    
    console.log('📊 AI信息源测试结果:')
    testResults.forEach(result => {
      const statusIcon = result.status === 'success' ? '✅' : '❌'
      console.log(`${statusIcon} ${result.source}: ${result.message} (${result.responseTime}ms)`)
    })
    
    return testResults
  }
}