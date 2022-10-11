import * as dotenv from 'dotenv';
import * as discord from 'discord.js';
import { logger } from './logger';
import { GlobalEnv } from './types';
import { registerAllCommands, resolveCommands } from './commands';

// env
dotenv.config();
const env = process.env as unknown as GlobalEnv;

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
