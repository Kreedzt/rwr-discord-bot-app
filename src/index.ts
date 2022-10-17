import * as dotenv from 'dotenv';
import * as discord from 'discord.js';
import { logger } from './logger';
import { GlobalEnv } from './types';
import { registerAllCommands, resolveCommands } from './commands';

// env
dotenv.config();
const _env = process.env as unknown as Record<string, string>;
const env = {
    ..._env,
    MAP_INDEX: JSON.parse(_env.MAP_INDEX ?? '[]') as string[]
} as GlobalEnv;

// Client instance
const { Client, GatewayIntentBits } = discord;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on('ready', () => {
    logger.info(`Logged in as ${client?.user?.tag}!`);
});

client.login(env.DISCORD_TOKEN);

logger.info('> Discord Bot started.');

// Register commands
registerAllCommands(env);

client.on('interactionCreate', async (interaction) => {
    // Resolve commands
    await resolveCommands(interaction, env);
});
