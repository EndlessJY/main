# hack.chat 中文版改造分支

本项目基于 [hack.chat](https://github.com/hack-chat/main) 改造。hack.chat 是一个极简、无账号、无日志、消息短暂存在的聊天室服务，适合自行部署为私有聊天站点。本分支保留原项目的核心聊天能力，并针对现代 Node.js 运行环境、中文昵称、移动端输入体验、Solana 钱包签名和容器化部署做了整理。

## 运行环境

- Node.js 20 或更高版本
- npm 10 或更高版本

## 本地开发

```bash
npm install
npm start
```

启动后默认包含两个服务：

- WebSocket 服务：`6060`
- 静态客户端服务：`3000`

默认配置文件为 `.hcserver.json`，命令模块目录为 `./commands`。

## Docker 部署

```bash
docker build -t hack-chat-cn .
docker run --rm -p 3000:3000 -p 6060:6060 hack-chat-cn
```

Docker 镜像会排除本地依赖、日志、运行密钥、备份文件和临时修复文件，避免把本机运行数据打包进镜像。

## GHCR 自动发布

本仓库已配置 GitHub Actions，在推送 `master` 分支、推送 `v*` 标签或手动触发 workflow 时自动构建并上传 Docker 镜像到 GitHub Container Registry。

默认镜像地址：

```bash
ghcr.io/endlessjy/main
```

拉取示例：

```bash
docker pull ghcr.io/endlessjy/main:latest
docker run --rm -p 3000:3000 -p 6060:6060 ghcr.io/endlessjy/main:latest
```

镜像包已公开，拉取时不需要 GitHub Token。

项目仓库为公开仓库，但仍是独立仓库，不是原 `hack-chat/main` 的 fork。

自动发布的标签：

- `latest`：`master` 分支最新构建。
- `master`：分支名标签。
- `sha-<commit>`：提交短哈希标签。
- `vX.Y.Z` 标签推送时会额外生成语义化版本标签。

## 常用命令

```bash
npm start      # 同时启动 WebSocket 服务和静态客户端
npm run test   # 运行 ESLint 和 Mocha 测试
npm run coverage
npm run config
```

## 和原项目相比的主要改动

### 运行与部署

- 将运行要求升级到 Node.js 20 / npm 10。
- 移除 PM2 启动方式，改为 `scripts/start.js` 直接拉起 WebSocket 服务和静态客户端服务。
- 移除安装后的交互式 `postinstall` 配置流程，避免 `npm install` 在自动化环境中阻塞。
- 新增 `Dockerfile` 和 `.dockerignore`，支持容器化部署。
- 格式化 `.hcserver.json`，并固定使用仓库内 `./commands` 目录。

### 前端体验

- 新增底部输入栏 `composerbar`，包含消息输入框、发送按钮和表情选择器。
- 为移动端增加 `viewport-fit=cover`，改善安全区和全屏浏览体验。
- 增加表情插入逻辑，并保持输入框焦点和发送交互。
- 客户端不再默认从本地存储恢复昵称，降低旧昵称误入房间的概率。
- 客户端昵称校验支持中文、英文、数字、下划线和短横线，长度 1-24 个字符。

### 昵称与权限逻辑

- 服务端昵称校验同步支持 Unicode 字母和数字，支持中文昵称。
- 更新昵称错误提示为中文。
- 修复 `/nick` 缺少目标昵称时的返回值。
- `unlockroom` 在用户未进入频道时直接返回，避免访问未定义频道状态。
- `claimchannel` 移除了原有 ASCII captcha 接管流程。

### 钱包签名

- 客户端新增 Solana 钱包连接、消息签名请求和签名回传。
- `signsiw` 保留签名验证和钱包绑定逻辑。
- 暂时移除链上频道权限同步、Anchor IDL 解码和 devnet PDA 查询逻辑。
- 交易签名入口暂未启用，客户端会返回明确提示。

### 依赖与测试

- 移除 `pm2`、`@coral-xyz/anchor`、`codecov`、`nyc` 等不再使用的依赖。
- 保留 `c8`，并新增 `coverage` 命令。
- 新增项目健康检查测试，覆盖启动配置、安装行为、Docker 忽略规则、昵称校验和 Composer 单一实现。
- 更新现有 `dumb` 与 `uac` 测试，匹配当前命令返回值和昵称校验行为。

## 贡献约定

- 使用两个空格缩进。
- 文件名保持 camelCase 风格。
- 提交前运行 `npm run test`。

## 致谢

本项目继承自 hack.chat 社区工作，原项目主要贡献者包括 Marzavec、MinusGix、Neel Kamath、Carlos Villavicencio、OpSimple、Andrew Belt 以及其他参与者。

## 许可证

本项目沿用 [MIT License](LICENSE)。
