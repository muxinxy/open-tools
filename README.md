# 开源工具箱 Open Tools

一个功能丰富的开源在线工具箱，使用 TypeScript 和 Next.js 构建。

## 功能特点

- 🎬 **视频工具** - 视频格式转换、压缩等
- 🎵 **音频工具** - 音频格式转换、剪辑等
- 🖼️ **图片工具** - 图片格式转换、压缩、调整大小等
- 📄 **文档处理** - PDF合并、拆分等
- 📝 **文档转换** - Word转PDF、PDF转Word等
- 📊 **数据图表** - 图表生成、数据可视化等
- 🤖 **智能文本** - 文本分析、摘要生成等
- 💼 **办公辅助** - 二维码生成、条形码生成等
- 📃 **文本工具** - 文本格式化、对比、字数统计等
- 🔢 **数字工具** - 计算器、进制转换等
- 🔐 **加密工具** - 哈希生成、Base64编码、URL编码等
- ⚖️ **单位转换** - 长度、重量、温度等单位转换

## 技术栈

- **Next.js 16** - React框架
- **TypeScript** - 类型安全
- **Tailwind CSS** - 样式框架
- **React 19** - UI库

## 开始使用

### 安装依赖

```bash
npm install
```

### 运行开发服务器

```bash
npm run dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看结果。

### 构建生产版本

```bash
npm run build
```

### 运行生产服务器

```bash
npm start
```

## 项目结构

```
open-tools/
├── app/                  # Next.js 应用目录
│   ├── about/           # 关于页面
│   ├── tools/           # 工具页面
│   │   └── text/        # 文本工具
│   │       └── counter/ # 字数统计工具
│   ├── layout.tsx       # 根布局
│   └── page.tsx         # 首页
├── components/          # React组件
│   ├── CategoryCard.tsx # 分类卡片组件
│   ├── Header.tsx       # 头部组件
│   └── Footer.tsx       # 底部组件
├── lib/                 # 工具函数和数据
│   └── tools-data.ts    # 工具数据定义
├── types/               # TypeScript类型定义
│   └── tools.ts         # 工具类型
└── public/              # 静态资源
```

## 特性

- ✅ 完全免费开源
- ✅ 无需注册登录
- ✅ 本地处理，保护隐私
- ✅ 响应式设计，支持移动设备
- ✅ 深色模式支持
- ✅ 类型安全（TypeScript）

## 贡献

欢迎贡献代码、报告问题或提出新功能建议！

## 许可证

本项目采用开源许可证，详见 [LICENSE](LICENSE) 文件。
