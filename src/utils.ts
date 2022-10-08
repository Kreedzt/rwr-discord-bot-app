import axios from 'axios';
import { APIEmbed, Embed, EmbedBuilder, bold, quote, codeBlock, inlineCode } from 'discord.js';
import { XMLParser } from 'fast-xml-parser';
import { ResServerItem, Res, OnlineServerItem } from './types';

const SERVER_API_URL = "http://rwr.runningwithrifles.com/rwr_server_list";

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

export const getJoinServerUrl = (server: OnlineServerItem): string => {
    const str = `steam://rungameid/270150//server_address=${server.address}%20server_port=${server.port}`;
    return str;
}

export const queryAllServers = async (matchRegex: string): Promise<OnlineServerItem[]> => {
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

    const regex = new RegExp(matchRegex);

    return totalServerList.filter(s => {
        return regex.test(s.name);
    });
}

export const getAllServerListDisplay = (servers: OnlineServerItem[]): string => {
    let text = '';
    servers.slice(0, 10).forEach(s => {
        const mapId = s.map_id;

        const mapPathArr = mapId.split('/');

        const mapName = mapPathArr[mapPathArr.length - 1];

        // const serverText = `${s.name}:${s.current_players}/${s.max_players} ${mapName}\n`;
        const serverText = `${inlineCode(s.country)} ${bold(s.name)}: ${inlineCode(s.current_players + '/' + s.max_players)} ${mapName}\n`;

        const serverUrl = getJoinServerUrl(s);

        text += serverText + serverUrl + '\n' + '\n';
    });

    return text;
}

export const getAllServerListEmbedDisplay = (servers: OnlineServerItem[]): APIEmbed[] => {
    const builder = new EmbedBuilder();
    builder.setColor(0x0099FF)
        .setTitle('Here\'s top 10 servers');

    let description = '';

    servers.slice(0, 10).forEach(s => {
        const mapId = s.map_id;

        const mapPathArr = mapId.split('/');

        const mapName = mapPathArr[mapPathArr.length - 1];

        // const serverText = `${s.name}:${s.current_players}/${s.max_players} ${mapName}\n`;

        const serverUrl = getJoinServerUrl(s);

        // description += serverText;
        // description += serverUrl + '\n';

        builder.addFields({
            name: 'Server Item',
            value: ''
        })
    });

    builder.setDescription(description);

    return [builder.toJSON()];
}