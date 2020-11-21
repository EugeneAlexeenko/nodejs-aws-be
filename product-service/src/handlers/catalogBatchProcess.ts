import { SQSHandler } from 'aws-lambda';
import 'source-map-support/register';

export const handler: SQSHandler = async (event) => {
    console.log('event: ' + JSON.stringify(event));

    const records = event.Records;

    console.log(records);
}
