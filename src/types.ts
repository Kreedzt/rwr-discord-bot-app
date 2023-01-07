import type { ChatInputCommandInteraction, Interaction, RESTPostAPIApplicationCommandsJSONBody, SlashCommandBuilder } from "discord.js";

export type Nullable<T> = T | null | undefined;

export interface MapDataItem {
    id: string;
    name: string;
}

export interface GlobalEnv {
    APP_ID: string;
    GUILD_ID: string;
    DISCORD_TOKEN: string;
    PUBLIC_KEY: string;
    SERVER_MATCH_REGEX: string;
    DATA_FOLDER: string;
    TDOLL_DATA: TDollDBItem[];
    MAP_DATA: MapDataItem[];
}

export interface ResServerItem {
    name: string;
    address: string;
    port: number;
    map_id: string;
    map_name: string;
    bots: number;
    country: string;
    current_players: number;
    timeStamp: number;
    version: number;
    dedicated: number;
    mod: number,
    // [AAA, BBB] | AAA
    player?: string[] | string,
    comment: string;
    url: string;
    max_players: number;
    mode: string;
    realm: string;
}

export interface Res {
    result: {
        server: ResServerItem[];
    }
}

export interface OnlineServerItem extends ResServerItem {
    playersCount: number;
}

export interface ICommandRegister {
    name: string;
    builderRes: RESTPostAPIApplicationCommandsJSONBody;
    resolve: (interaction: ChatInputCommandInteraction, env: GlobalEnv) => Promise<void>;
}

export interface TDollDBItem {
    name: string;
    id: number;
    class: string;
    /**
     * 2 | 3 | 4 | 5 | 6 | Extra
     */
    star: string;
}