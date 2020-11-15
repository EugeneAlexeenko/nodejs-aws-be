import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { Client } from 'pg';
import { getClientConfig } from '../db';
import { buildResponse } from '../../../shared/utils';

const clientConfig = getClientConfig();

export const handler: APIGatewayProxyHandler = async (event) => {
    console.log('getProductById event: ' + JSON.stringify(event));

    const {id} = event.pathParameters;
    const client = new Client(clientConfig);
    await client.connect();

    try {
        const {rows} = await client.query(`
            SELECT product.id, product.title, product.description, product.price, product.photo, stock.count
            FROM product
            INNER JOIN stock
            ON product.id = stock.product_id
            WHERE product.id = $1
        `, [id]);

        const product = rows[0];

        if (!product) {
            return buildResponse(404, JSON.stringify({message: `Sorry, the product with id=${id} has not been found`}));
        }

        return buildResponse(200, JSON.stringify(product));
    } catch (err) {
        console.log(err);

        return buildResponse(500, 'Server error');
    } finally {
        await client.end();
    }
}
