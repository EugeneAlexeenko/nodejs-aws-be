import 'source-map-support/register';
import { SQSHandler } from 'aws-lambda';
import { SNS } from 'aws-sdk';
import { createProduct } from '../ProductRepository';

const { REGION, CREATE_PRODUCT_TOPIC_ARN } = process.env;

export const handler: SQSHandler = async (event) => {
    console.log('event: ' + JSON.stringify(event));
    const sns = new SNS({ region: REGION });

    try {
        const products = event.Records.map(record => JSON.parse(record.body));

        for (const product of products) {
            try {
                console.log('product creation started:', product);
                await createProduct(product);

                console.log('Product created. Sending notification');
                const params: SNS.Types.PublishInput = {
                    Subject: 'Product created',
                    Message: JSON.stringify(product),
                    TopicArn: CREATE_PRODUCT_TOPIC_ARN
                };
                await sns.publish(params).promise();
            } catch (err) {
                console.log(err);
                console.log('Product creation failed. Sending notification');
                const params: SNS.Types.PublishInput = {
                    Subject: 'Product creation failure',
                    Message: JSON.stringify(product),
                    TopicArn: CREATE_PRODUCT_TOPIC_ARN
                };
                await sns.publish(params).promise();
            }
        }
    } catch (err) {
        console.log('Product creation error: ' + JSON.stringify(err));
    }
}
