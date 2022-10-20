import axios from 'axios';
import { APIEmbed, Embed, EmbedBuilder, bold, quote, codeBlock, inlineCode, hyperlink } from 'discord.js';
import { XMLParser } from 'fast-xml-parser';
import * as fs from 'fs';
import { QUERY_TDOLL_LIMIT, QUERY_USER_IN_SERVERS_LIMIT } from './constants';
import { ResServerItem, Res, OnlineServerItem, Nullable, TDollDBItem } from './types';
import { logger } from './logger';

const SERVER_API_URL = "http://rwr.runningwithrifles.com/rwr_server_list";

/**
 * Get players list string array
 * @param server server item
 * @returns player list
 */
const getCorrectPlayersList = (server: ResServerItem): string[] => {
    if (!server.player) {
        return [];
    }

    const playersArray = Array.isArray(server.player) ? server.player : [server.player];

    // force to string array
    return playersArray.map(p => p.toString());
}

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
        playersCount: getCorrectPlayersList(s).length
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
 * @param mapIndexCacheMap map index cache map
 * @returns formatted server display info text
 */
export const getServerInfoDisplayText = (server: OnlineServerItem, mapIndexCacheMap: Map<string, number>): string => {
    const mapId = server.map_id;

    const mapPathArr = mapId.split('/');

    const mapName = mapPathArr[mapPathArr.length - 1];

    const serverText = `${inlineCode(server.country)} ${bold(server.name)}: ${inlineCode(server.current_players + '/' + server.max_players)} (${mapName} / #${mapIndexCacheMap.get(mapName)})\n`;

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

    try {
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
    } catch (error) {
        logger.error('> queryAllServers error');
        logger.error(error);
    }

    return totalServerList;
}

/**
 * Get match query params server text
 * @param servers all server list
 * @param params query params
 * @returns match query params server list
 */
export const getQueryFilterServerList = (servers: OnlineServerItem[], params: {
    country: Nullable<string>
}): OnlineServerItem[] => {
    const { country } = params;

    return servers.filter(s => {
        if (country) {
            const inputCountry = country.toUpperCase();
            return s.country.toLocaleUpperCase().includes(inputCountry);
        }

        return true;
    });
}

/**
 * Get formatted combined sliced server display text
 * @param servers all server list
 * @param params page params
 * @returns formatted combined sliced server display text
 */
export const getSliceServerListDisplay = (servers: OnlineServerItem[], params: {
    start: number;
    end: number;
    mapIndexCacheMap: Map<string, number>
}): {
    text: string;
    count: number;
} => {
    const { start, end, mapIndexCacheMap } = params;

    let text = '';
    let count = 0;
    servers.slice(start, end).forEach(s => {
        ++count;
        text += getServerInfoDisplayText(s, mapIndexCacheMap);
    });

    return {
        text,
        count
    };
}

/**
 * Get formatted all server list display text
 * @param servers all server list
 * @param mapIndexCacheMap map index cache map
 * @returns formatted server display text
 */
export const getAllServerListDisplay = (servers: OnlineServerItem[], mapIndexCacheMap: Map<string, number>): string => {
    let text = '';
    servers.forEach(s => {
        text += getServerInfoDisplayText(s, mapIndexCacheMap);
    });

    return text;
}

/**
 * Encode player to display correct
 * @param user player name
 * @returns correct display format
 */
export const encodePlayerName = (user: string): string => {
    return `\`\`${user}\`\``;
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

    const infoText = `${encodePlayerName(user)} is in ${inlineCode(server.country)} ${bold(server.name)}: ${inlineCode(server.current_players + '/' + server.max_players)} (${mapName})\n`;

    const text = infoText + serverUrl + '\n\n';

    return text;
}

/**
 * Get formatted user in server combined text
 * @param user user name in rwr
 * @param serverList all server list
 * @returns formatted user in server combined text
 */
export const getUserInServerListDisplay = (user: string, serverList: OnlineServerItem[], options: {
    isCaseSensitivity?: Nullable<boolean>;
}): {
    text: string;
    count: number;
} => {
    let text = '';

    let count = 0;

    const { isCaseSensitivity } = options;

    serverList.forEach(s => {
        const playersList = getCorrectPlayersList(s);

        playersList.forEach(player => {
            let current = player;
            let target = user;
            if (!isCaseSensitivity) {
                current = current.toLocaleUpperCase();
                target = target.toLocaleUpperCase();
            }
            if (current.includes(target)) {
                count += 1;

                if (count >= QUERY_USER_IN_SERVERS_LIMIT) {
                    return;
                }

                text += getUserInfoInServerDisplayText(player, s);
            }
        })
    });

    return {
        text,
        count
    };
}

/**
 * Get formmated all server & user statistics text
 * @param serverList all server list
 * @returns formatted all server & user statistics
 */
export const getAllServerStatisticsDisplay = (serverList: OnlineServerItem[]): string => {
    let text = '';

    let serversCount = serverList.length;
    let capacityCount = 0;
    let playersCount = 0;

    serverList.forEach(s => {
        capacityCount += s.max_players;

        playersCount += s.current_players;
    });

    const serversCountText = `Total ${bold(serversCount.toString())} server(s) online\n\n`;

    text += serversCountText;

    const playersCountText = `Total ${bold(playersCount.toString())}/${capacityCount} player(s) online\n\n`;

    text += playersCountText;

    return text;
}

/**
 * Get map id formatted text
 * @param mapId map id
 * @param mapName map name
 * @param index pos
 * @returns formatted text
 */
export const getMapInfoDisplay = (mapId: string, mapName: string, index: number): string => {
    let text = '';

    text += `${index}. ${mapId}:  ${inlineCode(mapName)}\n`;

    return text;
}

/**
 * Get all map formatted info
 * @param mapindexArr map index array
 * @param mapNameArr map name array
 * @returns formatted info
 */
export const getAllMapIndexDisplay = (mapindexArr: string[], mapNameArr: string[]): {
    count: number;
    text: string;
} => {
    let text = '';

    mapindexArr.forEach((map, index) => {
        text += getMapInfoDisplay(map, mapNameArr[index], index + 1);
    });

    return {
        count: mapindexArr.length,
        text
    };
}

/**
 * Get all map index cache Map
 * @param mapArr map index array
 * @returns map index Map
 */
export const generateMapIndexCacheMap = (mapArr: string[]): Map<string, number> => {
    const cache = new Map<string, number>();

    mapArr.forEach((map, index) => {
        cache.set(map, index + 1);
    });

    return cache;
}

/**
 * Get tdoll db data by file path
 * @param filePath db file path
 */
export const getTDollDBContent = (filePath: string): TDollDBItem[] => {
    const file = fs.readFileSync(filePath, 'utf-8');
    const content = JSON.parse(file) as TDollDBItem[];
    return content;
}

/**
 * Get sturcture map of tdoll db data
 * @param tdollData Source tdoll db data
 * @returns structure map
 */
export const generateTdollDBCache = (tdollData: TDollDBItem[]): {
    idMap: Map<number, TDollDBItem>;
    nameMap: Map<string, TDollDBItem>;
} => {
    const idMap = new Map<number, TDollDBItem>();
    const nameMap = new Map<string, TDollDBItem>();

    tdollData.forEach(data => {
        idMap.set(data.id, data);
        nameMap.set(data.name, data);
    })

    return {
        idMap,
        nameMap
    }
};

/**
 * Get tdoll detail url
 * @param tdoll tdoll info
 * @returns detail url
 */
export const getTdollInfoUrl = (tdoll: TDollDBItem): string => {
    const rawName = tdoll.name;

    const encodeName = rawName.replace(/\s/g, '_');

    return `https://iopwiki.com/wiki/${encodeURIComponent(encodeName)}`;
}

/**
 * Get tdoll info formatted text
 * @param tdoll tdoll info
 * @returns formatted text
 */
export const getTdollFormattedText = (tdoll: TDollDBItem): string => {
    let text = '';

    const stars = `${tdoll.star}  :star:`;

    text += `No.${tdoll.id} `;

    text += ` ${inlineCode(tdoll.name)} `;

    text += ` [${tdoll.class}] `;

    text += ` (${stars}) \n`;

    text += getTdollInfoUrl(tdoll);

    return text;
}

/**
 * Get formatted tdoll info by user query
 * @param dbData tdoll db
 * @param options query options
 * @returns formatted text & count
 */
export const getAllTdollsInDB = (dbData: TDollDBItem[], options: {
    id: Nullable<number>;
    name: Nullable<string>;
}): {
    text: string;
    count: number;
} => {
    let text = '';
    let count = 0;

    const { id, name } = options;

    dbData.forEach(data => {
        if (!id && !name) {
            ++count;
            if (count <= QUERY_TDOLL_LIMIT) {
                text += `${count}. ${getTdollFormattedText(data)}\n`;
            }
            return;
        }

        if (id && id === data.id) {
            ++count;

            if (count <= QUERY_TDOLL_LIMIT) {
                text += `${count}. ${getTdollFormattedText(data)}\n`;
            }
        } else if (name && data.name.toLocaleUpperCase().includes(name.toLocaleUpperCase())) {
            ++count;
            if (count <= QUERY_TDOLL_LIMIT) {
                text += `${count}. ${getTdollFormattedText(data)}\n`;
            }
        }
    });

    return { text, count };
}