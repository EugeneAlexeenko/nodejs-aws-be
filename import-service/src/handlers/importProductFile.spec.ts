import { importProductsFile } from './importProductsFile';
import { S3 } from 'aws-sdk';
import { APIGatewayProxyEvent } from "aws-lambda";

jest.mock('aws-sdk');

const mockGetSignedUrlPromise = jest.fn();

(S3 as unknown as jest.Mock).mockImplementation(() =>({
    getSignedUrlPromise: mockGetSignedUrlPromise
}));

describe('importProductFile', () => {
    it('Sends 200 and signed url in case of success', async () => {
        const event = {
            queryStringParameters: {
                name: 'new_product.csv'
            }
        } as unknown as APIGatewayProxyEvent;
        mockGetSignedUrlPromise.mockResolvedValue('https://test.com/uploads/new_productcsv?ABCDEFG');
        const expectedSignedUrl = JSON.stringify('https://test.com/uploads/new_productcsv?ABCDEFG');

        const result = await importProductsFile(event, null, null);

        expect(result).toHaveProperty('statusCode', 200);
        expect(result).toHaveProperty('body', expectedSignedUrl);
    });

    it('Sends 400 in case of missing name parameter', async () => {
        const event = {} as APIGatewayProxyEvent;

        const result = await importProductsFile(event, null, null);

        expect(result).toHaveProperty('statusCode', 400);
        expect(result).toHaveProperty('body', 'Bad request');
    });

    it('Sends 500 in case of server error', async () => {
        const event = {
            queryStringParameters: {
                name: 'new_product.csv'
            }
        } as unknown as APIGatewayProxyEvent;
        mockGetSignedUrlPromise.mockRejectedValue('Oops, something happened');

        const result = await importProductsFile(event, null, null);

        expect(result).toHaveProperty('statusCode', 500);
        expect(result).toHaveProperty('body', 'Server error');
    });
});