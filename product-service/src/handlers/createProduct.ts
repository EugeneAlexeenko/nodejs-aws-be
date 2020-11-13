import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { Client } from 'pg';
import { getClientConfig } from '../db';
import { buildResponse } from '../utils';

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

const clientConfig = getClientConfig();

export const handler: APIGatewayProxyHandler = async (event) => {
    console.log('createProduct event: ' + JSON.stringify(event));

    const newProduct = JSON.parse(event.body);
    const isProductValid = validateProduct(newProduct);

    if (!isProductValid) {
        return buildResponse(400, 'Invalid data: ' + JSON.stringify(newProduct));
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

        return buildResponse(201, 'Product successfully created');
    } catch (err) {
        console.log(err);

        await client.query('ROLLBACK');

        return buildResponse(500, 'Server error');
    } finally {
        await client.end();
    }
}
