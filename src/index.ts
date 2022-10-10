import * as dotenv from 'dotenv';
import * as discord from 'discord.js';
import { inlineCode } from 'discord.js';
import { queryAllServers, getAllServerListDisplay, getSliceServerListDisplay, getUserInServerListDisplay, getAllServerStatisticsDisplay } from './utils';
import { RegisterCommand, QUERY_SERVERS_LIMIT, QUERY_USER_IN_SERVERS_LIMIT } from './constants';
import { logger } from './logger';

// env
dotenv.config();
const env = process.env as {
    APP_ID: string;
    GUILD_ID: string;
    DISCORD_TOKEN: string;
    PUBLIC_KEY: string;
    SERVER_MATCH_REGEX: string
};

// Client instance
const { Client, GatewayIntentBits, REST, SlashCommandBuilder, Routes } =
    discord;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on('ready', () => {
    logger.info(`Logged in as ${client?.user?.tag}!`);
});

client.login(env.DISCORD_TOKEN);

logger.info('> Discord Bot started.');

// commands
const commands = [
    new SlashCommandBuilder()
        .setName(RegisterCommand.SERVERS)
        .setDescription(`Replies ${QUERY_SERVERS_LIMIT} server status, default is top ${QUERY_SERVERS_LIMIT} server`)
        .addNumberOption(option =>
            option.setName('page')
                .setDescription('The page number, start from 1')
                .setRequired(false)),
    new SlashCommandBuilder()
        .setName(RegisterCommand.USER)
        .setDescription('Query user if exists in rwr server')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Enter user name in the rwr game')
                .setRequired(true)),
    new SlashCommandBuilder()
        .setName(RegisterCommand.STATS)
        .setDescription('Get all servers statistics')
].map((command) => command.toJSON());

const rest = new REST({ version: '10' }).setToken(env.DISCORD_TOKEN);

rest.put(Routes.applicationGuildCommands(env.APP_ID, env.GUILD_ID), {
    body: commands,
})
    .then((data: any) =>
        logger.info(
            `Successfully registered ${data.length} application commands.`
        )
    )
    .catch(console.error);

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    logger.info('> interactionCreate receviced command', interaction.commandName, interaction.options.data);
    logger.info('> triggered by', interaction.user);

    switch (interaction.commandName as RegisterCommand) {
        case RegisterCommand.SERVERS: {
            const serverList = await queryAllServers(env.SERVER_MATCH_REGEX);

            const inputPageNum = interaction.options.getNumber('page', false);

            const pageNum = inputPageNum ? inputPageNum - 1 : 0;

            const startIndex = pageNum * QUERY_SERVERS_LIMIT;
            const endIndex = startIndex + QUERY_SERVERS_LIMIT;

            const { text, count } = getSliceServerListDisplay(serverList, startIndex, endIndex);

            let titleText = '';

            if (startIndex === 0) {
                titleText = `Here's top ${QUERY_SERVERS_LIMIT} players count server list:\n`;
            } else {
                titleText = `Here's players count server list top ${startIndex + 1}-${endIndex}:\n`;
            }

            if (count === 0) {
                const nothingText = titleText + '\n No more servers.';

                logger.info('> replay servers command');
                logger.info(nothingText);
                await interaction.reply({ content: nothingText, ephemeral: true });
                return;
            }

            const footerText = `Total ${inlineCode(serverList.length.toString())} server(s), current: ${inlineCode((startIndex + 1).toString())} - ${inlineCode((startIndex + count).toString())}`;

            const totalText = titleText + text + footerText;
            logger.info('> replay servers command');
            logger.info(totalText);
            await interaction.reply({ content: totalText, ephemeral: true });
            break;
        }
        case RegisterCommand.USER: {
            const serverList = await queryAllServers(env.SERVER_MATCH_REGEX);

            const queryUserName = interaction.options.getString('name', true).toUpperCase();

            const titleText = `Here's query ${inlineCode(queryUserName)} results:\n\n`;

            const { text, count } = getUserInServerListDisplay(queryUserName, serverList);

            if (count === 0) {
                const nothingText = titleText + '\n No more users.';

                logger.info('> replay user command');
                logger.info(nothingText);
                await interaction.reply({ content: nothingText, ephemeral: true });
                return;
            }

            const footerText = `Total ${inlineCode(count.toString())} results.(limited to display ${QUERY_USER_IN_SERVERS_LIMIT} results.)`;

            const totalText = titleText + text + footerText;

            logger.info('> replay user command');
            logger.info(totalText);
            await interaction.reply({ content: totalText, ephemeral: true });
            break;
        }
        case RegisterCommand.STATS: {
            const serverList = await queryAllServers(env.SERVER_MATCH_REGEX);

            const text = getAllServerStatisticsDisplay(serverList);

            const totalText = text;

            logger.info('> replay stats command');
            logger.info(totalText);
            await interaction.reply({ content: totalText, ephemeral: true });
            break;
        }
    }
});
