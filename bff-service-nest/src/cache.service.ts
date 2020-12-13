import { Injectable } from '@nestjs/common';

@Injectable()
export class CacheService {
    private cache: any = new Map<string, string[]>();

    has(key) {
        return this.cache.has(key)
    }

    get(key) {
        return this.cache.get(key)[0];
    }

    set(key, value) {
        const timestamp = new Date();

        return this.cache.set(key, [value, timestamp]);
    }

    isExpired(key, seconds) {
        const [_, timestamp] = this.cache.get(key);

        return (Date.now() - timestamp) / 1000 > seconds;
    }
}
