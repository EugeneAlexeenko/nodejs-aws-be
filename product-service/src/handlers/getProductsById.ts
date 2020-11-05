import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { getProductById } from '../db';

export const handler: APIGatewayProxyHandler = async (event) => {
    try {
        const {id} = event.pathParameters;
        const product = await getProductById(id);

        if (!product) {
            return {
                statusCode: 404,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Credentials': true,
                },
                body: JSON.stringify({message: `Sorry, the product with id=${id} has not been found`})
            }
        }

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify(product)
        }
    } catch (err) {
        console.log(err);

        return {
            statusCode: 500,
            body: 'Server error'
        }
    }
}
