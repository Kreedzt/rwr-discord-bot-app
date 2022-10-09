import axios from 'axios';
import { APIEmbed, Embed, EmbedBuilder, bold, quote, codeBlock, inlineCode } from 'discord.js';
import { XMLParser } from 'fast-xml-parser';
import { QUERY_USER_IN_SERVERS_LIMIT } from './constants';
import { ResServerItem, Res, OnlineServerItem } from './types';

const SERVER_API_URL = "http://rwr.runningwithrifles.com/rwr_server_list";

/**
 * Send Http Request, get server list xml raw string
 * @param params query params
 * @returns server list raw xml string
 */
const queryServersRaw = async (params: {
    start: number;
    size: number;
    names: 1 | 0;
}) => {
    const queryParams = {
        start: params.start ?? 0,
        size: params.size ?? 20,
        names: params.names ?? 1,
    };

    const url = `${SERVER_API_URL}/get_server_list.php?start=${queryParams.start}&size=${queryParams.size}&names=${queryParams.names}`;

    const res = await axios.get(url, {
        responseType: 'text'
    });
    return res.data;
}

/**
 * Parse xml raw string to server list
 * @param resString server list raw xml string
 * @returns parsed server list
 */
export const parseServerListFromString = (
    resString: string
): OnlineServerItem[] => {
    const parser = new XMLParser();
    const res = parser.parse(resString) as Res;

    return res.result.server.map(s => ({
        ...s,
        playersCount: s.player.length
    }));
}

/**
 * Get Joinable steam open url
 * @param server serverItem
 * @returns joinable steam open url
 */
export const getJoinServerUrl = (server: OnlineServerItem): string => {
    const str = `steam://rungameid/270150//server_address=${server.address}%20server_port=${server.port}`;
    return str;
}

/**
 * Get formatted server display info text
 * @param server serverItem
 * @returns formatted server display info text
 */
export const getServerInfoDisplayText = (server: OnlineServerItem): string => {
    const mapId = server.map_id;

    const mapPathArr = mapId.split('/');

    const mapName = mapPathArr[mapPathArr.length - 1];

    const serverText = `${inlineCode(server.country)} ${bold(server.name)}: ${inlineCode(server.current_players + '/' + server.max_players)} (${mapName})\n`;

    const serverUrl = getJoinServerUrl(server);

    const text = serverText + serverUrl + '\n' + '\n';

    return text;
}

/**
 * Send Http request, get all server list with matchRegex filter
 * @param matchRegex server name match regex
 * @returns all server list
 */
export const queryAllServers = async (matchRegex?: string): Promise<OnlineServerItem[]> => {
    let start = 0;
    const size = 100;

    const totalServerList: OnlineServerItem[] = [];

    let parsedServerList: OnlineServerItem[] = [];

    do {
        const resString = await queryServersRaw({
            start,
            size,
            names: 1
        });

        totalServerList.push(...parseServerListFromString(resString));
    } while (parsedServerList.length === size);


    if (matchRegex) {
        const regex = new RegExp(matchRegex);

        return totalServerList.filter(s => {
            return regex.test(s.name);
        });
    }

    return totalServerList;
}

/**
 * Get formatted combined sliced server display text
 * @param servers all server list
 * @param start start index, 0 is first item
 * @param end end index, not included
 * @returns formatted combined sliced server display text
 */
export const getSliceServerListDisplay = (servers: OnlineServerItem[], start: number, end: number): string => {
    let text = '';
    servers.slice(start, end).forEach(s => {
        text += getServerInfoDisplayText(s);
    });

    return text;
}

/**
 * Get formatted all server list display text
 * @param servers all server list
 * @returns formatted server display text
 */
export const getAllServerListDisplay = (servers: OnlineServerItem[]): string => {
    let text = '';
    servers.forEach(s => {
        text += getServerInfoDisplayText(s);
    });

    return text;
}

/**
 * Get formatted combined user & server info to display text
 * @param user user name
 * @param server server info
 * @returns formatted display text
 */
const getUserInfoInServerDisplayText = (user: string, server: OnlineServerItem): string => {
    const mapId = server.map_id;

    const mapPathArr = mapId.split('/');

    const mapName = mapPathArr[mapPathArr.length - 1];

    const serverUrl = getJoinServerUrl(server);

    const infoText = `${inlineCode(user)} is in ${inlineCode(server.country)} ${bold(server.name)}: ${inlineCode(server.current_players + '/' + server.max_players)} (${mapName})\n`;

    const text = infoText + serverUrl + '\n\n';

    return text;
}

/**
 * Get players list string array
 * @param server server item
 * @returns player list
 */
const getCorrectPlayersList = (server: OnlineServerItem): string[] => {
    if (!server.player) {
        return [];
    }

    return Array.isArray(server.player) ? server.player : [server.player];
}

/**
 * Get formatted user in server combined text
 * @param user user name in rwr
 * @param serverList all server list
 * @returns formatted user in server combined text
 */
export const getUserInServerListDisplay = (user: string, serverList: OnlineServerItem[]): string => {
    let text = '';

    let totalCount = 0;

    serverList.forEach(s => {
        const playersList = getCorrectPlayersList(s);

        playersList.forEach(player => {
            if (totalCount === QUERY_USER_IN_SERVERS_LIMIT) {
                return;
            }
            if (player.includes(user)) {
                text += getUserInfoInServerDisplayText(player, s);
                totalCount += 1;
            }
        })
    });

    text += `Total ${totalCount} results.(limit to display ${QUERY_USER_IN_SERVERS_LIMIT} results.)`;

    return text;
}