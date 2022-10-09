import * as dotenv from 'dotenv';
import * as discord from 'discord.js';
import { queryAllServers, getAllServerListDisplay, getSliceServerListDisplay, getUserInServerListDisplay } from './utils';
import { RegisterCommand, QUERY_SERVERS_LIMIT, QUERY_USER_IN_SERVERS_LIMIT } from './constants';
import { inlineCode } from 'discord.js';

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
    console.log(`Logged in as ${client?.user?.tag}!`);
});

client.login(env.DISCORD_TOKEN);

console.log('> Discord Bot started.');

// commands
const commands = [
    new SlashCommandBuilder()
        .setName(RegisterCommand.SERVERS)
        .setDescription(`Replies ${QUERY_SERVERS_LIMIT} server status, default is top ${QUERY_SERVERS_LIMIT} server`)
        .addNumberOption(option =>
            option.setName('start')
                .setDescription('The start index, started with 0')
                .setRequired(false)),
    new SlashCommandBuilder()
        .setName(RegisterCommand.USER)
        .setDescription('Query user if exists in rwr server')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Enter user name in the rwr game')
                .setRequired(true))
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

    console.log('> interactionCreate receviced command', interaction.commandName, interaction.options.data);
    console.log('> triggered by', interaction.user);

    switch (interaction.commandName as RegisterCommand) {
        case RegisterCommand.SERVERS: {
            const serverList = await queryAllServers(env.SERVER_MATCH_REGEX);

            const startIndex = interaction.options.getNumber('start', false) ?? 0;

            const text = getSliceServerListDisplay(serverList, startIndex, startIndex + QUERY_SERVERS_LIMIT);
            let staticText = '';

            if (startIndex === 0) {
                staticText = `Here's top ${QUERY_SERVERS_LIMIT} players count server list:\n`;
            } else {
                staticText = `Here's players count server list start index with ${startIndex}:\n`;
            }

            const totalText = staticText + text;
            console.log('> replay servers command');
            console.log(totalText);
            await interaction.reply({ content: totalText, ephemeral: true });
            break;
        }
        case RegisterCommand.USER: {
            const serverList = await queryAllServers(env.SERVER_MATCH_REGEX);

            const queryUserName = interaction.options.getString('name', true).toUpperCase();

            const staticText = `Here's query ${inlineCode(queryUserName)} results:\n\n`;

            const text = getUserInServerListDisplay(queryUserName, serverList);

            const totalText = staticText + text;

            console.log('> replay user command');
            console.log(totalText);
            await interaction.reply({ content: totalText, ephemeral: true });
            break;
        }
    }
});
