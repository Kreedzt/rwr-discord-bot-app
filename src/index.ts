import * as discord from 'discord.js';
import * as http from 'http';
import { logger } from './logger';
import { parseEnv } from './env';
import { registerAllCommands, resolveCommands } from './commands';

// env
const env = parseEnv();

// Client instance
const { Client, GatewayIntentBits, Events, ActivityType } = discord;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on('ready', () => {
    logger.info(`Logged in as ${client?.user?.tag}!`);

    client.user?.setActivity('RWR server data', {
        type: ActivityType.Watching,
    });
});

client.login(env.DISCORD_TOKEN).catch((err) => {
    logger.error('Login err:', err);
    // NetworkError, Need restart
    process.exit(-1);
});

logger.info('> Discord Bot started.');

// Register commands
registerAllCommands(env);

client.on('interactionCreate', async (interaction) => {
    // Resolve commands
    await resolveCommands(interaction, env);
});

client.on(Events.ShardError, (error) => {
    logger.error('A websocket connection encountered an error:', error);
    // NetworkError, Need restart
    process.exit(-1);
});

process.on('unhandledRejection', (error) => {
    logger.error('Unhandled promise rejection:', error);
    // restart
    process.exit(-1);
});

// 帮助我编写一个 http server, 只处理 /ping 请求, 返回 pong
http.createServer((req, res) => {
    if (req.url === '/ping') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('pong');
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
}).listen(process.env.PORT || 80, () => {
    logger.info('> HTTP Server started.');
});
