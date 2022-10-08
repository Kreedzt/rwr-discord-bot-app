import * as dotenv from 'dotenv';
import * as discord from 'discord.js';
import { getAllServerListDisplay, getAllServerListEmbedDisplay, queryAllServers } from './utils';

dotenv.config();
const env = process.env as {
    APP_ID: string;
    GUILD_ID: string;
    DISCORD_TOKEN: string;
    PUBLIC_KEY: string;
    SERVER_MATCH_REGEX: string
};

const { Client, GatewayIntentBits, REST, SlashCommandBuilder, Routes } =
    discord;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.login(env.DISCORD_TOKEN);

console.log('> Discord Bot started.');

// commands
const commands = [
    new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with pong!'),
    new SlashCommandBuilder()
        .setName('servers')
        .setDescription('Replies with all server status!'),
].map((command) => command.toJSON());

const rest = new REST({ version: '10' }).setToken(env.DISCORD_TOKEN);

rest.put(Routes.applicationGuildCommands(env.APP_ID, env.GUILD_ID), {
    body: commands,
})
    .then((data: any) =>
        console.log(
            `Successfully registered ${data.length} application commands.`
        )
    )
    .catch(console.error);

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'ping') {
        await interaction.reply('Pong!');
    } else if (interaction.commandName === 'servers') {
        const serverList = await queryAllServers(env.SERVER_MATCH_REGEX);
        const text = getAllServerListDisplay(serverList);
        let staticText = `Here's top 10 players count server list:\n`;
        const totalText = staticText + text;
        await interaction.reply({ content: totalText, ephemeral: true });

        // Embed
        // const embedText = getAllServerListEmbedDisplay(serverList);
        // await interaction.reply({ embeds: embedText, ephemeral: true });
    }
});
