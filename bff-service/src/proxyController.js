const axios = require('axios').default;
const cache = require('./cacheService');

const proxyRequestHandler = async (req, res) => {
    const {
        originalUrl,
        method,
        body
    } = req;

    console.log('originalUrl', originalUrl);
    console.log('method', method);
    console.log('body', body);

    const recipient = originalUrl.split('/')[1];
    console.log('recipient', recipient);

    const recipientUrl = process.env[recipient];
    console.log('recipientUrl', recipientUrl);

    if (recipientUrl) {
        const url = `${recipientUrl}${originalUrl}`;

        if (method === 'GET' && cache.has(url) && !cache.isExpired(url, 120)) {
            console.log('Found cached value for url', url);

            res.json(cache.get(url));

            return;
        }

        const axiosConfig = {
            method,
            url,
            ...(Object.keys(body || {}).length > 0 && {data: body})
        }

        console.log('axiosConfig', axiosConfig);

        try {
            const response = await axios(axiosConfig);
            console.log('Response from recipient', response.data);

            if (method === 'GET') {
                cache.set(url, response.data);
                console.log(`Response from ${url} has been cashed`, response.data);
            }

            res.json(response.data);
        } catch (err) {
            console.log('Some error', JSON.stringify(err));

            if (err.response) {
                const {
                    status,
                    data
                } = err.response;

                res.status(status).json(data);
            } else {
                res.status(502).json({error: err.message});
            }
        }
    } else {
        res.status(502).json({error: 'Cannot process request'});
    }
};

module.exports = {
    proxyRequestHandler
};