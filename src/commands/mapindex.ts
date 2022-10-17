import { SlashCommandBuilder } from "discord.js";
import { logger } from "../logger";
import { ICommandRegister } from "../types";
import { getAllMapIndexDisplay, getAllServerStatisticsDisplay, queryAllServers } from "../utils";

const MAP_INDEX_COMMAND_NAME = 'mapindex';

export const MapindexCommandRegister: ICommandRegister = {
    name: MAP_INDEX_COMMAND_NAME,
    builderRes: new SlashCommandBuilder()
        .setName(MAP_INDEX_COMMAND_NAME)
        .setDescription('Get all map index info')
        .toJSON(),
    resolve: async (interaction, env) => {
        // const serverList = await queryAllServers(env.SERVER_MATCH_REGEX);

        const titleText = `Here's all map index info:\n`;

        const { text, count} = getAllMapIndexDisplay(env.MAP_INDEX);

        const footerText = `\nTotal ${count} map(s).`;

        const totalText = titleText + text + footerText;

        logger.info(`> replay ${MAP_INDEX_COMMAND_NAME} command`);
        logger.info(totalText);
        await interaction.reply({ content: totalText, ephemeral: true });
    }
}

export const getAllCommandsRegister = (): ICommandRegister[] => {
    return [MapindexCommandRegister];
}