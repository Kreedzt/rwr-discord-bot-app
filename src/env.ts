import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { MAP_DB_FILE_NAME, TDOLL_DB_FILE_NAME } from './constants';
import { GlobalEnv } from './types';

export const parseEnv = (): GlobalEnv => {
    dotenv.config();

    const _env = process.env as unknown as Record<string, string>;

    const map_db_content = fs.readFileSync(path.join(_env.DATA_FOLDER, MAP_DB_FILE_NAME), 'utf-8');
    const tdoll_db_content = fs.readFileSync(path.join(_env.DATA_FOLDER, TDOLL_DB_FILE_NAME), 'utf-8');

    const env = {
        ..._env,
        MAP_DATA: JSON.parse(map_db_content) as GlobalEnv['MAP_DATA'],
        TDOLL_DATA: JSON.parse(tdoll_db_content) as GlobalEnv['TDOLL_DATA'],
    } as GlobalEnv;

    return env;
};