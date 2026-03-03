# 个人资讯聚合门户 - 系统架构设计

## 🎯 项目目标
构建一个自动化的个人资讯聚合网站，每天抓取 AI 技术和个人赚钱两个主题的优质信息，用 AI 进行大白话总结，并提供历史存档功能。

## 📊 系统架构

```
用户访问 GitHub Pages 网站
    ↓
[前端界面] React + Tailwind CSS
    ↓ 获取数据
[数据存储] GitHub 仓库中的 JSON 文件
    ↑ 更新数据
[自动化处理] GitHub Actions
    ↓
[数据抓取模块] → 抓取 RSS/API
[去重模块] → 过滤重复内容
[AI 总结模块] → DeepSeek-R1 模型
[数据存储模块] → 更新 JSON 文件
```

## 🗂️ 项目结构

```
personal-news-portal/
├── src/
│   ├── frontend/              # 前端界面
│   │   ├── components/        # React 组件
│   │   ├── pages/            # 页面组件
│   │   ├── styles/           # 样式文件
│   │   └── App.jsx           # 主应用
│   ├── scripts/              # 数据处理脚本
│   │   ├── crawlers/         # 抓取脚本
│   │   ├── processors/       # 处理脚本
│   │   └── utils/            # 工具函数
│   └── data/                 # 数据存储
│       ├── current/          # 当前数据
│       └── history/          # 历史数据
├── .github/workflows/        # GitHub Actions
├── public/                   # 静态资源
├── package.json              # 项目配置
└── README.md                 # 项目说明
```

## 🔗 信息源配置

### AI 技术主题（5个信息源）
1. **Hacker News Best Stories** - 技术社区精选
   - API: `https://hacker-news.firebaseio.com/v0/beststories.json`
   - 格式: JSON
   - 频率: 每天抓取前10条

2. **arXiv.org 最新 AI 论文**
   - RSS: `http://export.arxiv.org/rss/cs.AI`
   - 格式: RSS
   - 频率: 每天抓取最新5篇

3. **Towards Data Science**
   - RSS: `https://towardsdatascience.com/feed`
   - 格式: RSS
   - 频率: 每天抓取最新5篇

4. **Reddit r/MachineLearning**
   - API: `https://www.reddit.com/r/MachineLearning/hot.json`
   - 格式: JSON
   - 频率: 每天抓取热门5条

5. **GitHub Trending AI 项目**
   - 抓取: GitHub Trending 页面
   - 格式: HTML 解析
   - 频率: 每天抓取前5个

### 个人赚钱主题（5个信息源）
1. **Indie Hackers**
   - RSS: `https://www.indiehackers.com/feed`
   - 格式: RSS
   - 频率: 每天抓取最新5篇

2. **Reddit r/sidehustle**
   - API: `https://www.reddit.com/r/sidehustle/hot.json`
   - 格式: JSON
   - 频率: 每天抓取热门5条

3. **Product Hunt 今日产品**
   - RSS: `https://www.producthunt.com/feed`
   - 格式: RSS
   - 频率: 每天抓取最新5个产品

4. **小众独立博客聚合**
   - 自定义列表: 精选独立博客 RSS
   - 格式: RSS
   - 频率: 每天轮流抓取

5. **中文社区精选**
   - 抓取: v2ex、知乎等社区精选
   - 格式: HTML 解析
   - 频率: 每天抓取5条

## 🔄 数据处理流程

### 1. 抓取阶段
```javascript
// 伪代码流程
for 每个信息源:
  发送 HTTP 请求获取数据
  解析数据格式 (JSON/RSS/HTML)
  提取关键信息: 标题、链接、摘要、发布时间
  存储到临时数据池
```

### 2. 去重阶段
```javascript
// 基于 URL 和内容相似度去重
加载历史数据 (过去30天)
计算每条新内容的哈希值 (标题+摘要)
与历史哈希值比较
过滤掉重复内容
```

### 3. AI 总结阶段
```javascript
// 使用 DeepSeek-R1 模型
for 每条筛选后的内容:
  构建提示词: "用大白话总结以下内容，不超过500字，让小白也能看懂"
  发送到 SiliconFlow API
  接收 AI 总结结果
  存储原链接和总结内容
```

### 4. 存储阶段
```javascript
// 更新 JSON 数据文件
合并新旧数据
按主题分类存储
更新今日数据文件: data/current/today.json
添加到历史存档: data/history/YYYY-MM-DD.json
```

## 🖥️ 前端界面设计

### 页面布局
```
┌─────────────────────────────────┐
│ 头部: 网站标题 + 主题切换按钮    │
├─────────────────────────────────┤
│ 今日内容 (默认显示)              │
│  ┌─────────┐ ┌─────────┐       │
│  │ AI主题  │ │赚钱主题 │       │
│  │ 5条信息 │ │ 5条信息 │       │
│  └─────────┘ └─────────┘       │
│                                  │
│ [查看历史按钮]                   │
└─────────────────────────────────┘
```

### 历史页面
```
┌─────────────────────────────────┐
│ 头部: 返回按钮 + 日期选择器      │
├─────────────────────────────────┤
│ 历史日期列表                     │
│  - 2024-03-02 (10条)            │
│  - 2024-03-01 (10条)            │
│  - 2024-02-28 (10条)            │
│                                  │
│ 选中日期的详细内容               │
└─────────────────────────────────┘
```

## 🤖 GitHub Actions 自动化

### 每日定时任务
```yaml
name: Daily News Update
on:
  schedule:
    - cron: '0 8 * * *'  # 每天 UTC 8:00 (北京时间 16:00)
  workflow_dispatch:      # 支持手动触发

jobs:
  update-news:
    runs-on: ubuntu-latest
    steps:
      - 检出代码
      - 安装依赖 (Node.js/Python)
      - 运行抓取脚本
      - 运行去重脚本
      - 运行 AI 总结脚本
      - 提交更新的数据文件
      - 触发 GitHub Pages 构建
```

### 数据备份任务
```yaml
name: Monthly Data Backup
on:
  schedule:
    - cron: '0 0 1 * *'  # 每月1号

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - 压缩历史数据
      - 创建备份分支
      - 推送备份文件
```

## 🔒 安全性考虑

1. **API 密钥管理**
   - 存储在本地 `api-keys.json` 文件
   - 通过 `.gitignore` 排除上传
   - GitHub Actions 中使用 Secrets

2. **数据隐私**
   - 使用私有仓库存储数据
   - 仅通过 GitHub Pages 公开展示内容
   - 不存储用户个人信息

3. **请求限制**
   - 添加请求间隔避免被封
   - 错误重试机制
   - 监控 API 使用量

## 🚀 部署方案

1. **GitHub Pages**
   - 自动构建和部署前端
   - 通过 GitHub Actions 更新数据
   - 支持自定义域名

2. **数据更新机制**
   - 前端通过 fetch 获取 JSON 数据
   - 数据存储在仓库的 `data/` 目录
   - 每日自动更新

## 📈 扩展性设计

1. **新增主题**
   - 添加新的信息源配置
   - 扩展前端主题分类
   - 更新数据处理流程

2. **自定义信息源**
   - 用户可配置 RSS 链接
   - 支持自定义抓取规则
   - 灵活的主题分类

3. **个性化推荐**
   - 基于阅读历史推荐
   - 用户偏好设置
   - 智能过滤系统

## ⏱️ 开发计划

### 第一阶段 (1-2天)
- [ ] 创建 GitHub 仓库和基础结构
- [ ] 实现基础抓取脚本
- [ ] 搭建前端框架

### 第二阶段 (2-3天)
- [ ] 完善数据处理流程
- [ ] 实现 AI 总结功能
- [ ] 配置 GitHub Actions

### 第三阶段 (1-2天)
- [ ] 前端界面优化
- [ ] 测试和部署
- [ ] 文档编写

---

*最后更新: 2024-03-03*