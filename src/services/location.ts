import axios from 'axios';
import { logger } from '../logger';

const LOCATION_QUERY_API_URL = 'http://ip-api.com/batch';
const IMG_PROVIDDER_URL = 'https://flagcdn.com';

interface IPInfoResponse {
    "status": string;
    "country": string;
    "countryCode": string;
    "region": string;
    "regionName": string;
    "city": string;
    "zip": string;
    "lat": number;
    "lon": string;
    "timezone": string;
    "isp": string;
    "org": string;
    "as": string;
    "query": string;
}

export class LocationService {
    static self: LocationService;

    private cacheRecord: Map<string, IPInfoResponse> = new Map();

    static getInstance() {
        if (!LocationService.self) {
            LocationService.self = new LocationService();
        }

        return LocationService.self;
    }

    constructor() {

    }

    private writeCache(res: IPInfoResponse[]) {
        res.forEach(info => {
            this.cacheRecord.set(info.query, info);
        });
    }

    private async requestIps(ips: string[]): Promise<string[]> {
        const needQueryIps: string[] = [];

        ips.forEach((ip) => {
            if (!this.cacheRecord.has(ip)) {
                needQueryIps.push(ip);
            }
        });

        try {
            if (needQueryIps.length > 0) {
                const res = await axios.post<IPInfoResponse[]>(LOCATION_QUERY_API_URL, needQueryIps);
                this.writeCache(res.data);
                logger.info(res.data);
            }
        } catch (e) {
            logger.error(e);
        }

        const resCountryCodes: string[] = ips.map(ip => {
            return this.cacheRecord.get(ip)?.countryCode ?? '';
        });

        return resCountryCodes;
    }

    async batchQuery(ips: string[]): Promise<string[]> {
        return this.requestIps(ips);
    }

    getCache(ip: string) {
        return this.cacheRecord.get(ip);
    }

    static getCountryCodeImgUrl(countryCode: string) {
        return `${IMG_PROVIDDER_URL}/w20/${countryCode}.png`;
    }
}
