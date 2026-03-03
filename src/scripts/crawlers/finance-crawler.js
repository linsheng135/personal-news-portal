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
 * 个人赚钱主题资讯抓取器
 * 从多个来源抓取赚钱、副业、创业相关资讯
 */
export class FinanceCrawler {
  constructor() {
    this.sources = [
      {
        name: 'Indie Hackers',
        url: 'https://www.indiehackers.com/feed',
        type: 'rss',
        category: 'finance',
        enabled: false,  // 测试发现RSS格式不规范
        note: 'RSS XML格式问题，暂时禁用'
      },
      {
        name: 'Reddit r/sidehustle',
        url: 'https://www.reddit.com/r/sidehustle/hot.json?limit=10',
        type: 'api',
        category: 'finance',
        enabled: false,  // Reddit API需要OAuth令牌
        note: '需要OAuth认证令牌，暂时禁用'
      },
      {
        name: 'Product Hunt 今日产品',
        url: 'https://www.producthunt.com/feed',
        type: 'rss',
        category: 'finance',
        enabled: true,   // 测试验证可用
        note: '测试验证可用，产品更新信息丰富'
      },
      {
        name: 'Hacker News Show HN',
        url: 'https://hacker-news.firebaseio.com/v0/showstories.json',
        type: 'api',
        category: 'finance',
        enabled: false,  // 需要特殊User-Agent配置
        note: 'API访问限制，需要特殊配置'
      },
      {
        name: 'Medium 创业与赚钱',
        url: 'https://medium.com/feed/tag/making-money',
        type: 'rss',
        category: 'finance',
        enabled: false,  // 连接超时
        note: '连接超时，可能需要代理'
      },
      // 中文赚钱信息源
      {
        name: '知乎热门话题-赚钱',
        url: 'https://www.zhihu.com/rss',
        type: 'rss',
        category: 'finance',
        enabled: true,
        note: '知乎热门话题，关注赚钱、副业等主题'
      },
      {
        name: '36氪-创业投资',
        url: 'https://36kr.com/feed',
        type: 'rss',
        category: 'finance',
        enabled: true,
        note: '中国科技创业和投资新闻'
      }
    ]
  }

  /**
   * 从 Indie Hackers 抓取文章
   */
  async fetchIndieHackers() {
    try {
      const feed = await parser.parseURL(this.sources[0].url)
      
      return feed.items.slice(0, 5).map(item => {
        return {
          id: `indie_${item.guid || Date.now()}`,
          title: item.title || 'Indie Hackers Article',
          summary: item.contentSnippet ? item.contentSnippet.substring(0, 300) + '...' : 'Article about indie hacking, startups, and making money online',
          url: item.link || '',
          source: 'Indie Hackers',
          category: 'finance',
          published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
          tags: ['indie-hacking', 'startup', 'online-business']
        }
      })
    } catch (error) {
      console.error('Error fetching Indie Hackers:', error.message)
      return []
    }
  }

  /**
   * 从 Reddit r/sidehustle 抓取热门帖子
   */
  async fetchRedditSideHustle() {
    try {
      const response = await axios.get(this.sources[1].url, {
        headers: {
          'User-Agent': 'NewsPortalBot/1.0'
        }
      })

      const posts = response.data.data.children.slice(0, 5)
      
      return posts
        .filter(post => post.data && !post.data.stickied)
        .map(post => ({
          id: `reddit_sh_${post.data.id}`,
          title: post.data.title,
          summary: post.data.selftext ? post.data.selftext.substring(0, 200) + '...' : 'Discussion about side hustles and making extra money',
          url: `https://reddit.com${post.data.permalink}`,
          source: 'Reddit r/sidehustle',
          category: 'finance',
          published_at: new Date(post.data.created_utc * 1000).toISOString(),
          likes: post.data.ups,
          comments: post.data.num_comments,
          tags: ['reddit', 'side-hustle', 'extra-income']
        }))
    } catch (error) {
      console.error('Error fetching Reddit sidehustle:', error.message)
      return []
    }
  }

  /**
   * 从 Product Hunt 抓取今日产品
   */
  async fetchProductHunt() {
    try {
      const feed = await parser.parseURL(this.sources[2].url)
      
      return feed.items.slice(0, 5).map(item => {
        // 从描述中提取产品信息
        const description = item.contentSnippet || item.content || 'New product on Product Hunt'
        
        return {
          id: `ph_${item.guid || Date.now()}`,
          title: item.title || 'Product Hunt Product',
          summary: description.substring(0, 300) + '...',
          url: item.link || '',
          source: 'Product Hunt',
          category: 'finance',
          published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
          tags: ['product-hunt', 'new-products', 'startup-tools']
        }
      })
    } catch (error) {
      console.error('Error fetching Product Hunt:', error.message)
      return []
    }
  }

  /**
   * 从 Hacker News Show HN 抓取展示项目
   */
  async fetchHackerNewsShow() {
    try {
      const response = await axios.get(this.sources[3].url)
      const storyIds = response.data.slice(0, 5) // 取前5个展示故事
      
      const stories = await Promise.all(
        storyIds.map(async (id) => {
          const storyResponse = await axios.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
          return storyResponse.data
        })
      )

      return stories
        .filter(story => story && story.title)
        .map(story => ({
          id: `hn_show_${story.id}`,
          title: story.title,
          summary: story.text ? story.text.substring(0, 200) + '...' : 'Show HN project - someone showing off their work',
          url: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
          source: 'Hacker News Show HN',
          category: 'finance',
          published_at: new Date(story.time * 1000).toISOString(),
          likes: story.score || 0,
          comments: story.descendants || 0,
          tags: ['show-hn', 'project-showcase', 'hacker-news']
        }))
    } catch (error) {
      console.error('Error fetching Hacker News Show:', error.message)
      return []
    }
  }

  /**
   * 从 Medium 赚钱标签抓取文章
   */
  async fetchMediumMakingMoney() {
    try {
      const feed = await parser.parseURL(this.sources[4].url)
      
      return feed.items.slice(0, 5).map(item => {
        // 提取作者信息
        const creator = item.creator || item.author || 'Medium Author'
        
        return {
          id: `medium_${item.guid || Date.now()}`,
          title: item.title || 'Medium Article',
          summary: item.contentSnippet ? item.contentSnippet.substring(0, 300) + '...' : 'Article about making money, side hustles, and entrepreneurship',
          url: item.link || '',
          source: 'Medium Making Money',
          category: 'finance',
          published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
          author: creator,
          tags: ['medium', 'entrepreneurship', 'money-making']
        }
      })
    } catch (error) {
      console.error('Error fetching Medium Making Money:', error.message)
      return []
    }
  }

  /**
   * 从 V2EX 抓取技术创业话题（备用源）
   */
  async fetchV2EX() {
    try {
      // V2EX 最新话题页面
      const response = await axios.get('https://www.v2ex.com/?tab=create', {
        headers: {
          'User-Agent': 'NewsPortalBot/1.0',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      })

      const $ = load(response.data)
      const topics = []

      // 解析话题列表
      $('.item_title').slice(0, 5).each((index, element) => {
        const title = $(element).find('a').text().trim()
        const url = 'https://www.v2ex.com' + $(element).find('a').attr('href')
        const node = $(element).closest('.cell').find('.node').text().trim()

        if (title && url) {
          topics.push({
            id: `v2ex_${Date.now()}_${index}`,
            title: title,
            summary: `V2EX话题 - 节点: ${node || '未分类'}`,
            url: url,
            source: 'V2EX 技术创业社区',
            category: 'finance',
            published_at: new Date().toISOString(),
            tags: ['v2ex', 'chinese-community', 'tech-entrepreneurship']
          })
        }
      })

      return topics
    } catch (error) {
      console.error('Error fetching V2EX:', error.message)
      return []
    }
  }

  /**
   * 执行所有抓取任务
   */
  async crawlAll() {
    console.log('🔄 Starting finance news crawl...')
    console.log('📊 可用信息源:', this.sources.map(s => `${s.name} (${s.note})`).join(', '))
    
    // 根据启用的源构建抓取任务列表
    const crawlTasks = []
    
    // 只添加已验证可用的源
    for (const source of this.sources) {
      if (source.enabled === true) {
        switch (source.name) {
          case 'Product Hunt 今日产品':
            crawlTasks.push(this.fetchProductHunt())
            console.log(`✅ 启用: ${source.name} - ${source.note}`)
            break
          case '知乎热门话题-赚钱':
            crawlTasks.push(this.fetchZhihuFinance())
            console.log(`✅ 启用: ${source.name} - ${source.note}`)
            break
          case '36氪-创业投资':
            crawlTasks.push(this.fetch36Kr())
            console.log(`✅ 启用: ${source.name} - ${source.note}`)
            break
          // 其他已验证的源可以在这里添加
        }
      } else {
        console.log(`⏭️  跳过: ${source.name} - ${source.note}`)
      }
    }
    
    // 如果所有源都不可用，添加备用源
    if (crawlTasks.length === 0) {
      console.log('⚠️  所有主要信息源都不可用，尝试备用源...')
      crawlTasks.push(this.fetchV2EX())  // V2EX作为备用源
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

    console.log(`✅ 赚钱主题抓取完成: 共找到 ${allNews.length} 条数据`)
    
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
        id: 'finance_mock_1',
        title: '如何通过副业每月多赚5000元：我的实战经验分享',
        summary: '作者分享了自己在业余时间通过自由职业平台接项目，每月稳定增加5000元收入的经验。重点介绍了如何选择适合自己的技能、如何定价、如何与客户沟通等实用技巧。',
        url: 'https://example.com/side-hustle-5000',
        source: '个人博客',
        category: 'finance',
        published_at: new Date().toISOString(),
        likes: 128,
        comments: 24,
        tags: ['副业', '自由职业', '额外收入']
      },
      {
        id: 'finance_mock_2',
        title: 'Indie Hackers: 我的SaaS产品如何做到月入1万美元',
        summary: '一位独立开发者分享了他如何从零开始构建一个SaaS产品，并在一年内实现月收入1万美元的经历。内容包括产品创意、技术选型、营销策略和用户增长的关键节点。',
        url: 'https://example.com/saas-10000-monthly',
        source: 'Indie Hackers',
        category: 'finance',
        published_at: new Date(Date.now() - 3600000).toISOString(),
        likes: 356,
        comments: 42,
        tags: ['SaaS', '独立开发', '月入过万']
      },
      {
        id: 'finance_mock_3',
        title: 'Product Hunt今日精选：AI写作助手获得1000+ upvotes',
        summary: '今天Product Hunt上最火的产品是一个AI写作助手，它可以帮助用户快速生成高质量的文章、邮件和社交媒体内容。该产品上线一周就获得了1000多个upvotes和大量正面评价。',
        url: 'https://example.com/ai-writing-assistant',
        source: 'Product Hunt',
        category: 'finance',
        published_at: new Date(Date.now() - 7200000).toISOString(),
        likes: 1042,
        comments: 156,
        tags: ['Product Hunt', 'AI工具', '写作助手']
      },
      {
        id: 'finance_mock_4',
        title: 'Reddit热议：有哪些低门槛的在线赚钱方式？',
        summary: 'Reddit r/sidehustle板块的热门帖子，网友们分享了各种低门槛的在线赚钱方式，包括问卷调查、内容创作、微任务平台等。帖子有300多条回复，提供了很多实用建议。',
        url: 'https://example.com/low-barrier-money-making',
        source: 'Reddit r/sidehustle',
        category: 'finance',
        published_at: new Date(Date.now() - 10800000).toISOString(),
        likes: 287,
        comments: 312,
        tags: ['Reddit', '在线赚钱', '低门槛']
      },
      {
        id: 'finance_mock_5',
        title: 'Show HN: 我开发了一个自动化股票分析工具',
        summary: '一位开发者在Hacker News上展示了他开发的股票分析工具，该工具可以自动分析股票数据、生成投资建议，并且完全开源。项目获得了大量关注和建设性反馈。',
        url: 'https://example.com/stock-analysis-tool',
        source: 'Hacker News Show HN',
        category: 'finance',
        published_at: new Date(Date.now() - 14400000).toISOString(),
        likes: 421,
        comments: 89,
        tags: ['Show HN', '股票分析', '开源工具']
      }
    ]

    return mockNews
  }

  /**
   * 从知乎抓取赚钱相关话题
   */
  async fetchZhihuFinance() {
    try {
      const feed = await parser.parseURL('https://www.zhihu.com/rss')
      
      // 筛选赚钱、副业、创业相关话题
      const financeKeywords = ['赚钱', '副业', '创业', '投资', '理财', '收入', '兼职']
      
      const financeItems = feed.items
        .filter(item => {
          const title = item.title || ''
          const content = item.content || ''
          const text = (title + content).toLowerCase()
          return financeKeywords.some(keyword => text.includes(keyword.toLowerCase()))
        })
        .slice(0, 5)
        .map(item => ({
          id: `zhihu_${item.guid || Date.now()}`,
          title: item.title || '知乎话题',
          summary: item.contentSnippet ? item.contentSnippet.substring(0, 300) + '...' : '知乎上关于赚钱、副业、创业的讨论',
          url: item.link || '',
          source: '知乎热门话题',
          category: 'finance',
          published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
          tags: ['知乎', '中文社区', '赚钱讨论']
        }))
      
      // 如果筛选结果太少，取最新的5个
      if (financeItems.length < 3 && feed.items.length > 0) {
        return feed.items.slice(0, 5).map(item => ({
          id: `zhihu_${item.guid || Date.now()}`,
          title: item.title || '知乎话题',
          summary: item.contentSnippet ? item.contentSnippet.substring(0, 300) + '...' : '知乎热门话题',
          url: item.link || '',
          source: '知乎热门话题',
          category: 'finance',
          published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
          tags: ['知乎', '中文社区']
        }))
      }
      
      return financeItems
    } catch (error) {
      console.error('Error fetching Zhihu:', error.message)
      return []
    }
  }

  /**
   * 从36氪抓取创业投资新闻
   */
  async fetch36Kr() {
    try {
      const feed = await parser.parseURL('https://36kr.com/feed')
      
      return feed.items.slice(0, 5).map(item => {
        return {
          id: `36kr_${item.guid || Date.now()}`,
          title: item.title || '36氪新闻',
          summary: item.contentSnippet ? item.contentSnippet.substring(0, 300) + '...' : '36氪科技创业和投资新闻',
          url: item.link || '',
          source: '36氪',
          category: 'finance',
          published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
          tags: ['36氪', '创业', '投资', '科技新闻']
        }
      })
    } catch (error) {
      console.error('Error fetching 36Kr:', error.message)
      return []
    }
  }

  /**
   * 测试所有信息源的可用性
   */
  async testAllSources() {
    console.log('🧪 Testing all finance sources...')
    
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
            message: `Found ${feed.items?.length || 0} items`
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
            message: `API responded with status ${response.status}`
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
    
    console.log('📊 Finance sources test results:')
    testResults.forEach(result => {
      const statusIcon = result.status === 'success' ? '✅' : '❌'
      console.log(`${statusIcon} ${result.source}: ${result.message} (${result.responseTime}ms)`)
    })
    
    return testResults
  }
}