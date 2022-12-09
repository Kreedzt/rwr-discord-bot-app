import { SlashCommandBuilder } from "discord.js";
import { logger } from "../logger";
import { ICommandRegister } from "../types";
import { getAllMapIndexDisplay, getAllServerStatisticsDisplay, queryAllServers } from "../utils";

const MAP_INDEX_COMMAND_NAME = 'mapindex';
const MAP_INDEX_COMMAND_PUBLIC = 'public';

export const MapindexCommandRegister: ICommandRegister = {
    name: MAP_INDEX_COMMAND_NAME,
    builderRes: new SlashCommandBuilder()
        .setName(MAP_INDEX_COMMAND_NAME)
        .setDescription('Get all map index info')
        .addBooleanOption(option =>
            option.setName(MAP_INDEX_COMMAND_PUBLIC)
                .setDescription('Reply this message public')
                .setRequired(false))
        .toJSON(),
    resolve: async (interaction, env) => {
        const titleText = `Here's all map index info:\n`;

        const { text, count } = getAllMapIndexDisplay(env.MAP_INDEX, env.MAP_INDEX_NAME);

        const isPublic = interaction.options.getBoolean(MAP_INDEX_COMMAND_PUBLIC, false);

        const footerText = `\nTotal ${count} map(s).`;

        const totalText = titleText + text + footerText;

        logger.info(`> replay ${MAP_INDEX_COMMAND_NAME} command`);
        logger.info(totalText);
        await interaction.reply({ content: totalText, ephemeral: !isPublic });
    }
}

export const getAllCommandsRegister = (): ICommandRegister[] => {
    return [MapindexCommandRegister];
}