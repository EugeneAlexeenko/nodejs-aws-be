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

type CreateProductDTO = {
    title: string,
    description: string,
    price: number,
    count: number
}

// validation (stupid edition)
const validateProduct = (product: CreateProductDTO) => {
    return (product.title && typeof product.title === 'string') &&
        (product.description && typeof product.description === 'string') &&
        (product.price && typeof product.price === 'number') &&
        (product.count && typeof product.count === 'number');
};

export const handler: APIGatewayProxyHandler = async (event) => {
    console.log('createProduct event: ' + JSON.stringify(event));

    const newProduct = JSON.parse(event.body);
    const isProductValid = validateProduct(newProduct);

    if (!isProductValid) {
        return {
            statusCode: 400,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
            },
            body: 'Invalid data: ' + JSON.stringify(newProduct)
        };
    }

    const client = new Client(clientConfig);
    await client.connect();

    try {
        await client.query('BEGIN');

        const insertProductText = (`
            INSERT INTO product (title, description, price)
            VALUES ($1, $2, $3)
            RETURNING id
        `);
        const insertProductValues = [newProduct.title, newProduct.description, newProduct.price];

        const insertProductRes = await client.query(insertProductText, insertProductValues);
        const productId = insertProductRes.rows[0].id;

        const insertStockText = (`
            INSERT INTO stock (product_id, count)
            VALUES ($1, $2)
        `);
        const insertStockValues = [productId, newProduct.count];
        await client.query(insertStockText, insertStockValues);

        await client.query('COMMIT');

        return {
            statusCode: 201,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
            },
            body: 'Product successfully created'
        };
    } catch (err) {
        console.log(err);

        await client.query('ROLLBACK');

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
