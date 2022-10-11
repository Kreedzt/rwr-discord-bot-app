import { SlashCommandBuilder } from "discord.js";
import { RegisterCommand } from "../constants";
import { logger } from "../logger";
import { ICommandRegister } from "../types";
import { getAllServerStatisticsDisplay, queryAllServers } from "../utils";

const STATS_COMMAND_NAME = 'stats';

export const StatsCommandRegister: ICommandRegister = {
    name: STATS_COMMAND_NAME,
    builderRes: new SlashCommandBuilder()
        .setName(STATS_COMMAND_NAME)
        .setDescription('Get all servers statistics')
        .toJSON(),
    resolve: async (interaction, env) => {
        const serverList = await queryAllServers(env.SERVER_MATCH_REGEX);

        const text = getAllServerStatisticsDisplay(serverList);

        const totalText = text;

        logger.info(`> replay ${RegisterCommand.STATS} command`);
        logger.info(totalText);
        await interaction.reply({ content: totalText, ephemeral: true });
    }
}

export const getAllCommandsRegister = (): ICommandRegister[] => {
    return [StatsCommandRegister];
}