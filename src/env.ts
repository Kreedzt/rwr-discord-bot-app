import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { GlobalEnv } from './types';

export const parseEnv = (): GlobalEnv => {
    dotenv.config();

    const _env = process.env as unknown as Record<string, string>;

    const map_db_content = fs.readFileSync(_env.MAP_DB, 'utf-8');

    const env = {
        ..._env,
        MAP_DATA: JSON.parse(map_db_content) as GlobalEnv['MAP_DATA']
    } as GlobalEnv;

    return env;
};