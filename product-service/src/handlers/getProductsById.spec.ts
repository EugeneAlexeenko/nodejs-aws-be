import {handler} from './getProductsById';

describe('getProductById handler', () => {
    it('Returns 200 and found product', async () => {
        const event: any = {
            pathParameters: {id: '7567ec4b-b10c-48c5-9345-fc73c48a80a0'}
        };
        const expectedProduct = {
            'count': 6,
            'description': 'JEYPOD Remote Control Car, 2.4 GHZ High Speed Racing Car with 4 Batteries',
            'id': '7567ec4b-b10c-48c5-9345-fc73c48a80a0',
            'price': 24.99,
            'title': 'Short Product Description3',
            'imageUrl': 'https://images-na.ssl-images-amazon.com/images/I/61s5bPvYJfL._AC_SX679_.jpg'
        };

        const result: any = await handler(event, null, () => null);
        const product = JSON.parse(result.body);

        expect(result.statusCode).toEqual(200);
        expect(product).toEqual(expectedProduct);
    });

    it('Returns 404 for non-existing product', async () => {
        const event: any = {
            pathParameters: {id: 'some-wrong-id-12345'}
        };
        const expectedBody = {
            message: "Sorry, the product with id=some-wrong-id-12345 has not been found"
        };

        const result: any = await handler(event, null, () => null);
        const body = JSON.parse(result.body);

        expect(result.statusCode).toEqual(404);
        expect(body).toEqual(expectedBody);
    });
});