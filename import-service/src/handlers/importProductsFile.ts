import 'source-map-support/register';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { S3 } from 'aws-sdk';
import { buildResponse } from '../../../shared/utils';

const { REGION, BUCKET } = process.env;
const SIGNED_URL_EXPIRATION_SECONDS = 60;

export const importProductsFile: APIGatewayProxyHandler = async (event) => {
    console.log('importProductFile event: ' + JSON.stringify(event));

    const fileName = event?.queryStringParameters?.name;

    if (!fileName) {
        return buildResponse(400, 'Bad request');
    }

    const filePath = `uploaded/${fileName}`;

    const s3 = new S3({region: REGION});
    const params = {
        Bucket: BUCKET,
        Key: filePath,
        Expires: SIGNED_URL_EXPIRATION_SECONDS,
        ContentType: 'text/csv'
    };

    try {
        const url = await s3.getSignedUrlPromise('putObject', params);
        console.log('Signed url created:', url);

        return buildResponse(200, JSON.stringify(url));
    } catch (err) {
        console.log(err);

        return buildResponse(500, 'Server error');
    }
}
