export interface SeedCategory {
  name: string;
  icon: string;
  order_index: number;
  websites: {
    title: string;
    url: string;
    description: string;
    icon_url: string;
    order_index: number;
  }[];
}

export const DEFAULT_SEED_DATA: SeedCategory[] = [
  {
    name: '常用搜索',
    icon: 'Search',
    order_index: 0,
    websites: [
      {
        title: 'Google',
        url: 'https://www.google.com',
        description: '全球最大搜索引擎与信息检索服务',
        icon_url: 'https://www.google.com/favicon.ico',
        order_index: 0,
      },
      {
        title: '百度',
        url: 'https://www.baidu.com',
        description: '百度一下，你就知道 - 国内领先搜索引擎',
        icon_url: 'https://www.baidu.com/favicon.ico',
        order_index: 1,
      },
      {
        title: 'Bing',
        url: 'https://www.bing.com',
        description: '微软必应搜索与智能 AI 助手',
        icon_url: 'https://www.bing.com/favicon.ico',
        order_index: 2,
      },
    ],
  },
  {
    name: 'AI 与智能工具',
    icon: 'Bot',
    order_index: 1,
    websites: [
      {
        title: 'ChatGPT',
        url: 'https://chatgpt.com',
        description: 'OpenAI 智能会话模型与多功能创作助手',
        icon_url: 'https://chatgpt.com/favicon.ico',
        order_index: 0,
      },
      {
        title: 'Claude',
        url: 'https://claude.ai',
        description: 'Anthropic 研发的高智能安全 AI 助手',
        icon_url: 'https://claude.ai/favicon.ico',
        order_index: 1,
      },
      {
        title: 'Gemini',
        url: 'https://gemini.google.com',
        description: 'Google 全新多模态旗舰大语言模型',
        icon_url: 'https://gemini.google.com/favicon.ico',
        order_index: 2,
      },
      {
        title: 'DeepSeek',
        url: 'https://chat.deepseek.com',
        description: '深度求索新一代高效推理 AI 大模型',
        icon_url: 'https://chat.deepseek.com/favicon.ico',
        order_index: 3,
      },
    ],
  },
  {
    name: '开发与社区',
    icon: 'Code2',
    order_index: 2,
    websites: [
      {
        title: 'GitHub',
        url: 'https://github.com',
        description: '全球最大的代码托管、开源协作与版本控制社区',
        icon_url: 'https://github.com/favicon.ico',
        order_index: 0,
      },
      {
        title: 'V2EX',
        url: 'https://v2ex.com',
        description: '创意工作者、程序员和技术探索者交流社区',
        icon_url: 'https://v2ex.com/favicon.ico',
        order_index: 1,
      },
      {
        title: 'MDN Web Docs',
        url: 'https://developer.mozilla.org',
        description: '权威全面的 Web 标准技术与 API 开发文档',
        icon_url: 'https://developer.mozilla.org/favicon.ico',
        order_index: 2,
      },
      {
        title: '稀土掘金',
        url: 'https://juejin.cn',
        description: '优质中文开发者技术内容分享与互动平台',
        icon_url: 'https://juejin.cn/favicon.ico',
        order_index: 3,
      },
    ],
  },
  {
    name: '效率与设计',
    icon: 'Sparkles',
    order_index: 3,
    websites: [
      {
        title: 'Notion',
        url: 'https://www.notion.so',
        description: '全合一工作区、笔记管理与团队知识库平台',
        icon_url: 'https://www.notion.so/favicon.ico',
        order_index: 0,
      },
      {
        title: 'Figma',
        url: 'https://www.figma.com',
        description: '现代化团队协作原型与 UI/UX 界面设计工具',
        icon_url: 'https://www.figma.com/favicon.ico',
        order_index: 1,
      },
      {
        title: '哔哩哔哩',
        url: 'https://www.bilibili.com',
        description: '国内著名的视频弹幕分享与年轻人学习娱乐站点',
        icon_url: 'https://www.bilibili.com/favicon.ico',
        order_index: 2,
      },
    ],
  },
];
