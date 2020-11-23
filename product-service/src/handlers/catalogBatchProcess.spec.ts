jest.mock('aws-sdk');
jest.mock('../ProductRepository')

import { handler } from './catalogBatchProcess';
import { SNS } from 'aws-sdk';
import { SQSEvent } from 'aws-lambda';
import { createProduct } from '../ProductRepository';

const mockPublish = jest.fn(() => {
    return {
        promise: () => Promise.resolve()
    };
});

(SNS as unknown as jest.Mock).mockImplementation(() => ({
    publish: mockPublish
}));

describe('catalogBatchProcess handler', () => {
    it('Sends notification for created product', async () => {
        (createProduct as jest.Mock).mockReturnValue(Promise.resolve());

        const event = {
            Records: [
                {body: JSON.stringify({id: 1, title: 'prod1', description: 'desc1', price: 100, count: 1})}
            ]
        } as SQSEvent;

        await handler(event, null, null);

        expect(mockPublish).toBeCalledWith({
            Subject: 'Product created',
            Message: event.Records[0].body,
            TopicArn: undefined // don't know how to mock env vars
        });
    })

    it('Sends notification for failed product creation', async () => {
        (createProduct as jest.Mock).mockReturnValue(Promise.reject('oops'));

        const event = {
            Records: [
                {body: JSON.stringify({id: 1, title: 'prod1', description: 'desc1', price: 100, count: 1})}
            ]
        } as SQSEvent;

        await handler(event, null, null);

        expect(mockPublish).toBeCalledWith({
            Subject: 'Product creation failure',
            Message: event.Records[0].body,
            TopicArn: undefined
        });
    })
});
