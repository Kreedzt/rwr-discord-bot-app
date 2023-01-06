# RWR Discord Bot

![license](https://badgen.net/github/license/Kreedzt/rwr-discord-bot-app)
![latest release](https://badgen.net/github/release/Kreedzt/rwr-discord-bot-app)
![commits count](https://badgen.net/github/commits/Kreedzt/rwr-discord-bot-app)
![last commit](https://badgen.net/github/last-commit/Kreedzt/rwr-discord-bot-app)

简易的用以查询 RWR Server 状态的 Discord Bot

[English](README_en.md) | 简体中文

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

## 开发

克隆此项目后, 首先进行依赖包安装

```sh
pnpm i
```

打包及启动:

```sh
pnpm build:dev
# 启动项目
node dist/index.js
```

根据 `.env-example` 文件, 编写自己的 `.env` 文件, 变量描述如下:

- APP_ID: 你 Bot 的 Application ID
- GUILD_ID: 你 Bot 所在的服务器 ID
- DISCORD_TOKEN: 你 bot 的 token
- PUBLIC_KEY: 你 bot 的 Public Key
- SERVER_MATCH_REGEX: 通过此正则匹配想要查询的 RWR 服务器名称
- DATA_FOLDER: 数据文件存放目录, 通常为 `data`, 然后挂载目录也与此一致为 `/app/data`

准备 data 目录所需文件:

- `data/map_db.json`: 参考 `map_db_example.json`, 提供地图顺序信息文件
- `data/tdoll_db.json`: 通过克隆此项目, 执行命令 `npm run updatedb`, 获取 `tdoll_db.json` 文件, 移动到 `data/tdoll_db.json` 中

## 部署

准备工作:

1. 准备 data 目录所需文件:

- `data/map_db.json`: 参考 `map_db_example.json`, 提供地图顺序信息文件
- `data/tdoll_db.json`: 通过克隆此项目, 执行命令 `npm run updatedb`, 获取 `tdoll_db.json` 文件, 移动到 `data/tdoll_db.json` 中

2. 建立空 logs 文件夹

3. 准备环境变量信息

- APP_ID: 你 Bot 的 Application ID
- GUILD_ID: 你 Bot 所在的服务器 ID
- DISCORD_TOKEN: 你 bot 的 token
- PUBLIC_KEY: 你 bot 的 Public Key
- SERVER_MATCH_REGEX: 通过此正则匹配想要查询的 RWR 服务器名称
- DATA_FOLDER: 数据文件存放目录, 通常为 `data`, 然后挂载目录也与此一致为 `/app/data`

4. 使用如下方式之一启动:

- PM2
- Docker
- Docker compose

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
-e "SERVER_MATCH_REGEX=<SERVER_MATCH_REGEX>" \
-e "DATA_FOLDER=data" \
-v ${PWD}/data:/app/data \
-v ${PWD}/logs:/app/logs \
-d zhaozisong0/rwr-discord-bot:latest
```

### Docker compose

通过编写 `.env` 文件(参考 `.env-example`) 与 `docker-compose.yaml`文件(参考 `docker-compose-example.yaml`) 文件进行启动

编写好后, 使用如下命令启动:

```sh
docker-compose up -d
```

使用如下命令关闭:

```sh
docker-compose down
```

## LICENSE

[MIT](http://opensource.org/licenses/MIT)