import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import {Client, ClientConfig} from 'pg';

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

        console.log(products);

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
    } finally {
        await client.end();
    }
}
