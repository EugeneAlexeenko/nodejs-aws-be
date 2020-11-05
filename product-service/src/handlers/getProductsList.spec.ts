import { handler } from './getProductsList';
import { products as mockProducts } from '../db';

describe('getProductsList', () => {
    it('returns 200 and products list', async () => {
        const result: any = await handler(null, null, () => null);

        expect(result.statusCode).toEqual(200);
        const product = JSON.parse(result.body);
        expect(product).toEqual(mockProducts);
    });
});


