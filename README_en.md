# RWR Discord Bot

![license](https://badgen.net/github/license/Kreedzt/rwr-discord-bot-app)
![latest release](https://badgen.net/github/release/Kreedzt/rwr-discord-bot-app)
![commits count](https://badgen.net/github/commits/Kreedzt/rwr-discord-bot-app)
![last commit](https://badgen.net/github/last-commit/Kreedzt/rwr-discord-bot-app)

Simple Discord Bot for querying RWR Server status

English | [简体中文](README.md)

## Build

1. Install Dependency Packages

```sh
pnpm i
```

2. Packing and start-up

Retention file source mapping: use dev command:

```sh
pnpm build:dev
# start
node dist/index.js
```

No retention file source mapping, use release command:
```sh
pnpm build:release
# start
node dist/app.js
```

## Development

1. After cloning this project, first install the dependency package

```sh
pnpm i
```

2. Packing and start-up:

```sh
pnpm build:dev
# start
node dist/index.js
```

Based on the `.env-example` file, write your own `.env` file with the following variable descriptions:

- APP_ID: Your bot' application id
- GUILD_ID: The id of the server where your bot is located
- DISCORD_TOKEN: Your bot's token
- PUBLIC_KEY: Your bot's public Key
- SERVER_MATCH_REGEX: Match the name of the RWR server you want to query with this regular
- DATA_FOLDER: The data file storage directory, usually `data`, is then mounted in the same directory as `/app/data`

Prepare the required files for the data directory

- `data/map_db.json`: Reference `map_db_example.json`, providing map order information file
- `data/tdoll_db.json`: By cloning this project, execute the command `npm run updatedb`, get the `tdoll_db.json` file, and move it to `data/tdoll_db.json`

## Deployment

Preparation:

1. Prepare the required files for the data directory:

- `data/map_db.json`: Reference `map_db_example.json`, providing map order information file
- `data/tdoll_db.json`: By cloning this project, execute the command `npm run updatedb`, get the `tdoll_db.json` file, and move it to `data/tdoll_db.json`

2. Create an empty logs folder

3. Prepare environment variable information

- APP_ID: Your bot' application id
- GUILD_ID: The id of the server where your bot is located
- DISCORD_TOKEN: Your bot's token
- PUBLIC_KEY: Your bot's public Key
- SERVER_MATCH_REGEX: Match the name of the RWR server you want to query with this regular
- DATA_FOLDER: The data file storage directory, usually `data`, is then mounted in the same directory as `/app/data`

4. Start using one of the following methods:

- PM2
- Docker
- Docker compose

### PM2

1. Packing

```sh
pnpm i
pnpm build:dev
```

2. Deployment

```sh
pm2 start --name rwr-discord-bot dist/index.js
```

### Docker

Specify environment variables with `-e` and mount the data directory with `-v`

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

Start by writing the `.env` file (refer to `.env-example`) and the `docker-compose.yaml` file (refer to `docker-compose-example.yaml`)

Use the following command to start:

```sh
docker-compose up -d
```

Use the following command to stop:

```sh
docker-compose down
```