import { inlineCode, SlashCommandBuilder } from "discord.js";
import { QUERY_SERVERS_LIMIT, RegisterCommand } from "../constants";
import { logger } from "../logger";
import { ICommandRegister } from "../types";
import { getSliceServerListDisplay, queryAllServers } from "../utils";

const SERVERS_COMMAND_NAME = 'servers';
const SERVERS_COMMAND_PAGE_PARAM_NAME = 'page';
const SERVERS_COMMAND_COUNTRY_PARAM_NAME = 'country';

export const ServersCommandRegister: ICommandRegister = {
    name: SERVERS_COMMAND_NAME,
    builderRes: new SlashCommandBuilder()
        .setName(SERVERS_COMMAND_NAME)
        .setDescription(`Replies ${QUERY_SERVERS_LIMIT} server status, default is top ${QUERY_SERVERS_LIMIT} server`)
        .addNumberOption(option =>
            option.setName(SERVERS_COMMAND_PAGE_PARAM_NAME)
                .setDescription('The page number, start from 1')
                .setRequired(false))
        .addStringOption(option =>
            option.setName(SERVERS_COMMAND_COUNTRY_PARAM_NAME)
                .setDescription('Filter by country')
                .setRequired(false))
        .toJSON(),
    resolve: async (interaction, env) => {
        const serverList = await queryAllServers(env.SERVER_MATCH_REGEX);

        const inputPageNum = interaction.options.getNumber(SERVERS_COMMAND_PAGE_PARAM_NAME, false);
        const inputCountry = interaction.options.getString(SERVERS_COMMAND_COUNTRY_PARAM_NAME, false);

        const pageNum = inputPageNum ? inputPageNum - 1 : 0;

        const startIndex = pageNum * QUERY_SERVERS_LIMIT;
        const endIndex = startIndex + QUERY_SERVERS_LIMIT;

        const { text, count } = getSliceServerListDisplay(serverList, {
            start: startIndex,
            end: endIndex,
            country: inputCountry
        });

        let titleText = '';

        // Concat Query string format
        const queryTextArr: string[] = [];

        if (inputPageNum) {
            queryTextArr.push(`Page: ${inputPageNum}`);
        }

        if (inputCountry) {
            queryTextArr.push(`Country: ${inputCountry}`);
        }

        const queryText = queryTextArr.length > 0 ? `(${queryTextArr.join(' & ')})` : '';
        const hasQuery = queryTextArr.length > 0;

        if (startIndex === 0) {
            if (hasQuery) {
                titleText = `Here's query${queryText} result top 10 server list:\n`;
            } else {
                titleText = `Here's top ${QUERY_SERVERS_LIMIT} players count server list:\n`;
            }
        } else {
            if (hasQuery) {
                titleText = `Here's query${queryText} result top ${startIndex + 1}-${endIndex} server list:\n`;
            } else {
                titleText = `Here's players count server list top ${startIndex + 1}-${endIndex}:\n`;
            }
        }

        if (count === 0) {
            const nothingText = titleText + '\n No more results.';

            logger.info(`> replay ${RegisterCommand.SERVERS} command:`);
            logger.info(nothingText);
            await interaction.reply({ content: nothingText, ephemeral: true });
            return;
        }

        const footerText = `Total ${inlineCode(serverList.length.toString())} server(s), current: ${inlineCode((startIndex + 1).toString())} - ${inlineCode((startIndex + count).toString())}`;

        const totalText = titleText + text + footerText;
        logger.info(`> replay ${RegisterCommand.SERVERS} command:`);
        logger.info(totalText);
        await interaction.reply({ content: totalText, ephemeral: true });
    }
}

export const getAllCommandsRegister = (): ICommandRegister[] => {
    return [ServersCommandRegister];
}