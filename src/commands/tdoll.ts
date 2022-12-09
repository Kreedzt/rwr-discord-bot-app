import { inlineCode, SlashCommandBuilder } from "discord.js";
import { QUERY_TDOLL_LIMIT, QUERY_USER_IN_SERVERS_LIMIT } from "../constants";
import { logger } from "../logger";
import { ICommandRegister, TDollDBItem } from "../types";
import { queryAllServers, getUserInServerListDisplay, generateTdollDBCache, getTDollDBContent, getAllTdollsInDB } from "../utils";

const TDOLL_COMMAND_NAME = 'tdoll';
const TDOLL_COMMAND_PUBLIC = 'public';

const dbCache: {
    idMap: Map<number, TDollDBItem>;
    nameMap: Map<string, TDollDBItem>;
} = {
    idMap: new Map(),
    nameMap: new Map()
};

export const TdollCommandRegister: ICommandRegister = {
    name: TDOLL_COMMAND_NAME,
    builderRes: new SlashCommandBuilder()
        .setName(TDOLL_COMMAND_NAME)
        .setDescription('Query t-doll info by name or id.')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Enter t-doll name.'))
        .addNumberOption(option =>
            option.setName('id')
                .setDescription('Enable tdoll id')
        )
        .addBooleanOption(option =>
            option.setName(TDOLL_COMMAND_PUBLIC)
                .setDescription('Reply this message public')
                .setRequired(false))
        .toJSON(),
    resolve: async (interaction, env) => {
        // const serverList = await queryAllServers(env.SERVER_MATCH_REGEX);

        const queryTdollName = interaction.options.getString('name', false);
        const queryTdollId = interaction.options.getNumber('id', false);
        const isPublic = interaction.options.getBoolean(TDOLL_COMMAND_PUBLIC, false);

        // Cache
        if (dbCache.idMap.size === 0 || dbCache.nameMap.size === 0) {
            const db = getTDollDBContent(env.TDOLL_DB);
            const cacheMap = generateTdollDBCache(db);
            dbCache.idMap = cacheMap.idMap;
            dbCache.nameMap = cacheMap.nameMap;
        }


        const { text, count } = getAllTdollsInDB([...dbCache.nameMap.values()], {
            id: queryTdollId,
            name: queryTdollName
        });

        let queryText = '';

        if (queryTdollName) {
            queryText = `(name: ${queryTdollName})`
        } else if (queryTdollId) {
            queryText = `(id: ${queryTdollId})`;
        }

        const titleText = `Here's query t-doll${queryText} result list:\n`;

        if (count === 0) {
            const nothingText = titleText + '\n No more results.';

            logger.info(`> replay ${TDOLL_COMMAND_NAME} command:`);
            logger.info(nothingText);
            await interaction.reply({ content: nothingText, ephemeral: !isPublic });
            return;
        }

        const footerText = `\nTotal ${inlineCode(count.toString())} result(s).(limited to display ${QUERY_TDOLL_LIMIT} results.)`;

        const totalText = titleText + text + footerText;

        logger.info(`> replay ${TDOLL_COMMAND_NAME} command:`);
        logger.info(totalText);
        await interaction.reply({ content: totalText, ephemeral: !isPublic });
    },
}

export const getAllCommandsRegister = (): ICommandRegister[] => {
    return [TdollCommandRegister];
}