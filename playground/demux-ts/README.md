# Demuxer TS Playground

这是一个使用 Vite + TypeScript 构建的 Demuxer TS 播放器示例。它展示了如何使用 Demuxer 库解析 TS 流并通过 WebCodecs API 进行解码和渲染。

## 环境要求

- Node.js 16+ 版本
- 支持 WebCodecs API 的现代浏览器（Chrome 94+, Edge 94+, Safari 15.4+）

## 安装

```bash
# 使用 pnpm 安装依赖
pnpm install
```

## 开发

启动开发服务器：

```bash
pnpm dev
```

这将启动 Vite 开发服务器，通常在 http://localhost:3000 上可访问。

## 构建

构建生产版本：

```bash
pnpm build
```

构建后的文件将位于 `dist` 目录中。

## 预览构建结果

预览构建后的应用：

```bash
pnpm preview
```

## 项目结构

```
playground/demux-ts/
├── public/
│   └── assets/             # 存放示例媒体文件
│       └── *.ts            # TS 视频文件
├── src/
│   ├── demux-ts.ts         # TS 解复用处理类
│   ├── main.ts             # 主入口文件
│   └── style.css           # 样式文件
├── index.html              # HTML 主页面
├── package.json            # 项目配置
├── tsconfig.json           # TypeScript 配置
└── vite.config.ts          # Vite 配置
```

## 工作原理

1. 通过 fetch API 获取 TS 文件数据
2. 使用 Demuxer 库的 TSDemux 解析 TS 流
3. 提取 H.264 视频帧并配置 WebCodecs VideoDecoder
4. 解码视频帧并将它们绘制到 Canvas 上显示

## 注意事项

- 此示例需要浏览器支持 WebCodecs API
- 如果遇到 CORS 问题，请确保媒体文件与应用位于同一域或配置正确的 CORS 头
- 在生产环境中应禁用 debug 模式以提高性能
