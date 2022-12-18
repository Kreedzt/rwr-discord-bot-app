import * as discord from 'discord.js';
import type { Interaction } from 'discord.js';
import { logger } from '../logger';
import { GlobalEnv, ICommandRegister } from '../types';
import * as servers from './servers';
import * as stats from './stats';
import * as whereis from './whereis';
import * as mapindex from './mapindex';
import * as tdoll from './tdoll';

const { REST, Routes } = discord;

const allCommandsInfo: ICommandRegister[] = [
    ...servers.getAllCommandsRegister(),
    ...stats.getAllCommandsRegister(),
    ...whereis.getAllCommandsRegister(),
    ...mapindex.getAllCommandsRegister(),
    ...tdoll.getAllCommandsRegister()
];

export const registerAllCommands = (env: GlobalEnv) => {
    const rest = new REST({ version: '10' }).setToken(env.DISCORD_TOKEN);

    rest.put(Routes.applicationGuildCommands(env.APP_ID, env.GUILD_ID), {
        body: allCommandsInfo.map(c => c.builderRes),
    })
        .then((data: any) =>
            logger.info(
                `Successfully registered ${data.length} application commands.`
            )
        )
        .catch(err => {
            logger.error('Register commands error', err);
        });
}

export const resolveCommands = async (interaction: Interaction, env: GlobalEnv) => {
    if (!interaction.isChatInputCommand()) return;
    const commandName = interaction.commandName;

    logger.info('> interactionCreate receviced command:', commandName, interaction.options.data);
    logger.info('> triggered by:', interaction.user);

    const commandInfo = allCommandsInfo.find(c => c.name === commandName);

    if (commandInfo) {
        try {
            await commandInfo.resolve(interaction, env);
        } catch (e) {
            logger.error('resolve command error', e);
        }
    }
}