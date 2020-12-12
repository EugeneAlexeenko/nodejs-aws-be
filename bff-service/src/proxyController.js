const axios = require('axios').default;

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
        const axiosConfig = {
            method: method,
            url: `${recipientUrl}${originalUrl}`,
            ...(Object.keys(body || {}).length > 0 && {data: body})
        }

        console.log('axiosConfig', axiosConfig);

        try {
            const response = await axios(axiosConfig);

            console.log('Response from recipient', response.data);
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