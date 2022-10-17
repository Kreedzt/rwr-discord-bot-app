import { inlineCode, SlashCommandBuilder } from "discord.js";
import { QUERY_USER_IN_SERVERS_LIMIT } from "../constants";
import { logger } from "../logger";
import { ICommandRegister } from "../types";
import { queryAllServers, getUserInServerListDisplay } from "../utils";

const WHEREIS_COMMAND_NAME = 'whereis';

export const WhereisCommandRegister: ICommandRegister = {
    name: WHEREIS_COMMAND_NAME,
    builderRes: new SlashCommandBuilder()
        .setName(WHEREIS_COMMAND_NAME)
        .setDescription('Check which user playing server.')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Enter user name in the rwr game.')
                .setRequired(true))
        .addBooleanOption(option =>
            option.setName('case_sensitivity')
                .setDescription('Enable case sensitivity search.')
        ).toJSON(),
    resolve: async (interaction, env) => {
        const serverList = await queryAllServers(env.SERVER_MATCH_REGEX);

        const queryUserName = interaction.options.getString('name', true);
        const isCaseSensitivity = interaction.options.getBoolean('case_sensitivity', false);

        const titleText = `Here's query ${inlineCode(queryUserName)} results:\n\n`;

        const { text, count } = getUserInServerListDisplay(queryUserName, serverList, {
            isCaseSensitivity
        });

        if (count === 0) {
            const nothingText = titleText + '\n No more results.';

            logger.info(`> replay ${WHEREIS_COMMAND_NAME} command:`);
            logger.info(nothingText);
            await interaction.reply({ content: nothingText, ephemeral: true });
            return;
        }

        const footerText = `Total ${inlineCode(count.toString())} results.(limited to display ${QUERY_USER_IN_SERVERS_LIMIT} results.)`;

        const totalText = titleText + text + footerText;

        logger.info(`> replay ${WHEREIS_COMMAND_NAME} command:`);
        logger.info(totalText);
        await interaction.reply({ content: totalText, ephemeral: true });
    },
}

export const getAllCommandsRegister = (): ICommandRegister[] => {
    return [WhereisCommandRegister];
}