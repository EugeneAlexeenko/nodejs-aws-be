const cache = new Map();

module.exports = {
    has(key) {
        return cache.has(key)
    },
    get(key) {
        return cache.get(key)[0];
    },
    set(key, value) {
        const timestamp = new Date();

        return cache.set(key, [value, timestamp]);
    },
    isExpired(key, seconds) {
        [_, timestamp] = cache.get(key);

        return (Date.now() - timestamp) / 1000 > seconds;
    }
};