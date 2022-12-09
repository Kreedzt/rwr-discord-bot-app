import { inlineCode, SlashCommandBuilder } from "discord.js";
import { QUERY_SERVERS_LIMIT } from "../constants";
import { logger } from "../logger";
import { ICommandRegister } from "../types";
import { generateMapIndexCacheMap, getQueryFilterServerList, getSliceServerListDisplay, queryAllServers } from "../utils";

const SERVERS_COMMAND_NAME = 'servers';
const SERVERS_COMMAND_PAGE_PARAM_NAME = 'page';
const SERVERS_COMMAND_COUNTRY_PARAM_NAME = 'country';
const SERVERS_COMMAND_PUBLIC = 'public';

/**
 * All map index cache
 * key: map name: map1, map2, ...
 * value: index: 1, 2, 3, ...
 */
let MAP_INDEX_CACHE_MAP = new Map<string, number>();

export const ServersCommandRegister: ICommandRegister = {
    name: SERVERS_COMMAND_NAME,
    builderRes: new SlashCommandBuilder()
        .setName(SERVERS_COMMAND_NAME)
        .setDescription(`Replies ${QUERY_SERVERS_LIMIT} server status, default is top ${QUERY_SERVERS_LIMIT} servers`)
        .addNumberOption(option =>
            option.setName(SERVERS_COMMAND_PAGE_PARAM_NAME)
                .setDescription('The page number, start from 1')
                .setRequired(false))
        .addStringOption(option =>
            option.setName(SERVERS_COMMAND_COUNTRY_PARAM_NAME)
                .setDescription('Filter by country')
                .setRequired(false))
        .addBooleanOption(option =>
            option.setName(SERVERS_COMMAND_PUBLIC)
                .setDescription('Reply this message public')
                .setRequired(false))
        .toJSON(),
    resolve: async (interaction, env) => {
        // generate map cache map
        if (MAP_INDEX_CACHE_MAP.size === 0) {
            MAP_INDEX_CACHE_MAP = generateMapIndexCacheMap(env.MAP_INDEX);
        }

        const serverList = await queryAllServers(env.SERVER_MATCH_REGEX);

        const inputPageNum = interaction.options.getNumber(SERVERS_COMMAND_PAGE_PARAM_NAME, false);
        const inputCountry = interaction.options.getString(SERVERS_COMMAND_COUNTRY_PARAM_NAME, false);
        const isPublic = interaction.options.getBoolean(SERVERS_COMMAND_PUBLIC, false);

        const pageNum = inputPageNum ? inputPageNum - 1 : 0;

        const startIndex = pageNum * QUERY_SERVERS_LIMIT;
        const endIndex = startIndex + QUERY_SERVERS_LIMIT;

        const filteredTotal = getQueryFilterServerList(serverList, {
            country: inputCountry
        });

        const { text, count } = getSliceServerListDisplay(filteredTotal, {
            start: startIndex,
            end: endIndex,
            mapIndexCacheMap: MAP_INDEX_CACHE_MAP
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

            logger.info(`> replay ${SERVERS_COMMAND_NAME} command:`);
            logger.info(nothingText);
            await interaction.reply({ content: nothingText, ephemeral: !isPublic });
            return;
        }

        const footerText = `Total ${inlineCode(filteredTotal.length.toString())} server(s), current: ${inlineCode((startIndex + 1).toString())} - ${inlineCode((startIndex + count).toString())}`;

        const totalText = titleText + text + footerText;
        logger.info(`> replay ${SERVERS_COMMAND_NAME} command:`);
        logger.info(totalText);
        await interaction.reply({ content: totalText, ephemeral: !isPublic });
    }
}

export const getAllCommandsRegister = (): ICommandRegister[] => {
    return [ServersCommandRegister];
}