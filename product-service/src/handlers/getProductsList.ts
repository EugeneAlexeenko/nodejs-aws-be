import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { Client } from 'pg';
import { getClientConfig } from '../db';
import { buildResponse } from '../utils';

const clientConfig = getClientConfig();

export const handler: APIGatewayProxyHandler = async (event) => {
    console.log('getProductList event: ' + JSON.stringify(event));

    const client = new Client(clientConfig);
    await client.connect();

    try {
        const { rows: products } = await client.query(`
            SELECT product.id, product.title, product.description, product.price, product.photo, stock.count
            FROM product
            INNER JOIN stock
            ON product.id = stock.product_id
        `);

        return buildResponse(200, JSON.stringify(products));
    } catch (err) {
        console.log(err);

        return buildResponse(500, 'Server error');
    } finally {
        await client.end();
    }
}
