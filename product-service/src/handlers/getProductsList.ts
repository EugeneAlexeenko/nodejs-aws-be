import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { Client, ClientConfig } from 'pg';
import { buildResponse } from '../utils';

const { PG_HOST, PG_PORT, PG_USER, PG_PASSWORD } = process.env;
const clientConfig: ClientConfig = {
    host: PG_HOST,
    port: Number(PG_PORT),
    user: PG_USER,
    password: PG_PASSWORD,
    ssl: {
        rejectUnauthorized: false
    },
    connectionTimeoutMillis: 5000
};

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
