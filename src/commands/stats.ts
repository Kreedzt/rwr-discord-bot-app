import { SlashCommandBuilder } from "discord.js";
import { logger } from "../logger";
import { ICommandRegister } from "../types";
import { getAllServerStatisticsDisplay, queryAllServers } from "../utils";

const STATS_COMMAND_NAME = 'stats';
const STATS_COMMAND_PUBLIC = 'public';

export const StatsCommandRegister: ICommandRegister = {
    name: STATS_COMMAND_NAME,
    builderRes: new SlashCommandBuilder()
        .setName(STATS_COMMAND_NAME)
        .setDescription('Get all servers statistics')
        .addBooleanOption(option =>
            option.setName(STATS_COMMAND_PUBLIC)
                .setDescription('Reply this message public')
                .setRequired(false))
        .toJSON(),
    resolve: async (interaction, env) => {
        const isPublic = interaction.options.getBoolean(STATS_COMMAND_PUBLIC, false);

        const serverList = await queryAllServers(env.SERVER_MATCH_REGEX);

        const text = getAllServerStatisticsDisplay(serverList);

        const totalText = text;

        logger.info(`> replay ${STATS_COMMAND_NAME} command`);
        logger.info(totalText);
        await interaction.reply({ content: totalText, ephemeral: !isPublic });
    }
}

export const getAllCommandsRegister = (): ICommandRegister[] => {
    return [StatsCommandRegister];
}