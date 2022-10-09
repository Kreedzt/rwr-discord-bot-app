export interface ResServerItem {
    name: string;
    address: string;
    port: number;
    map_id: string;
    map_name: string;
    bots: number;
    country: string;
    current_players: string;
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