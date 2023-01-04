# RWR Discord Bot

> TODO: 文档还在完善中, 会有较大改动

简易的用以查询 RWR Server 状态的 Discord Bot

## 构建

1. 安装依赖包

```sh
pnpm i
```

2. 打包及启动

保留文件源码映射使用 dev 打包:

```sh
pnpm build:dev
# 启动项目
node dist/index.js
```

不保留映射, 使用 release 打包:
```sh
pnpm build:release
# 启动项目
node dist/app.js
```

## 部署

### PM2

1. 打包

```sh
pnpm i
pnpm build:dev
```

2. 部署

```sh
pm2 start --name rwr-discord-bot dist/index.js
```

### Docker

通过 `-e` 指定环境变量, `-v` 挂载 data 目录

```sh
docker run --name rwr-discord-bot \
-e "APP_ID=<APP_ID>" \
-e "GUILD_ID=<GUILD_ID>" \
-e "DISCORD_TOKEN=<DISCORD_TOKEN>" \
-e "PUBLIC_KEY=<PUBLIC_KEY>" \
-e "TARGET_CHANNEL=<TARGET_CHANNEL>" \
-e "SERVER_MATCH_REGEX=<SERVER_MATCH_REGEX>" \
-e "DATA_FOLDER=data" \
-v ${PWD}/data:/app/data \
-d rwr-discord-bot-app
```