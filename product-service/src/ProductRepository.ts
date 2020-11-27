import { Client } from 'pg';
import { getClientConfig } from './db';

const clientConfig = getClientConfig();

export const createProduct = async (product) => {
    const client = new Client(clientConfig);
    await client.connect();

    try {
        await client.query('BEGIN');

        const insertProductText = (`
            INSERT INTO product (title, description, price)
            VALUES ($1, $2, $3)
            RETURNING id
        `);
        const insertProductValues = [product.title, product.description, product.price];

        const insertProductRes = await client.query(insertProductText, insertProductValues);
        const productId = insertProductRes.rows[0].id;

        const insertStockText = (`
            INSERT INTO stock (product_id, count)
            VALUES ($1, $2)
        `);
        const insertStockValues = [productId, product.count];
        await client.query(insertStockText, insertStockValues);

        await client.query('COMMIT');
    } catch (err) {
        console.log(err);

        await client.query('ROLLBACK');

        throw new Error('Cannot create a new product');
    } finally {
        await client.end();
    }
};