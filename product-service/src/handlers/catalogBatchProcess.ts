import { SQSHandler } from 'aws-lambda';
import { SNS } from 'aws-sdk';
import 'source-map-support/register';

const { REGION, CREATE_PRODUCT_TOPIC_ARN } = process.env;

export const handler: SQSHandler = async (event) => {
    console.log('event: ' + JSON.stringify(event));

    const sns = new SNS({ region: REGION });

    const records = event.Records.map(record => JSON.parse(record.body));
    console.log(records);

    try {
        await sns.publish({
            Subject: 'Product created',
            Message: 'test',
            TopicArn: CREATE_PRODUCT_TOPIC_ARN
        }).promise();
    } catch (err) {
        console.log('Cannot create new product: ' + JSON.stringify(err));
    }
}
