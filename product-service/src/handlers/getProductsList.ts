import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { getAllProducts } from '../db';

export const handler: APIGatewayProxyHandler = async () => {
    try {
        const products = await getAllProducts();

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify(products)
        };
    } catch (err) {
        console.log(err);

        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
            },
            body: 'Server error'
        };
    }
}
