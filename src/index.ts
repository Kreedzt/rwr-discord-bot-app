import * as dotenv from 'dotenv';
import * as discord from 'discord.js';

dotenv.config();
const env = process.env as {
    APP_ID: string;
    GUILD_ID: string;
    DISCORD_TOKEN: string;
    PUBLIC_KEY: string;
};

const { Client, GatewayIntentBits  } = discord;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'ping') {
    await interaction.reply('Pong!');
  }
});

client.login(env.DISCORD_TOKEN);

console.log('> Discord Bot started.');
