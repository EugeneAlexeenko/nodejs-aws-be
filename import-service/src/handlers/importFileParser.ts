import 'source-map-support/register';
import { S3Handler } from 'aws-lambda';
import { S3, SQS } from 'aws-sdk';
import * as csv from 'csv-parser';
import {SendMessageRequest} from "aws-sdk/clients/sqs";

const { REGION, BUCKET, CATALOG_ITEMS_QUEUE_URL } = process.env;

export const importFileParser: S3Handler = async (event) => {
    console.log('importFileParser event: ' + JSON.stringify(event));

    const s3 = new S3({region: REGION});
    const sqs = new SQS();

    const promises = [];

    for (const record of event.Records) {
        const { key } = record.s3.object
        const promise = new Promise((resolve, reject) => {
            const params = {
                Bucket: BUCKET,
                Key: key
            };
            const s3Stream = s3.getObject(params).createReadStream()

            s3Stream.pipe(csv())
                .on('data', (csvRow) => {
                    console.log('csvRow:', csvRow);

                    const sqsParams: SendMessageRequest = {
                        QueueUrl: CATALOG_ITEMS_QUEUE_URL,
                        MessageBody: JSON.stringify(csvRow)
                    };
                    sqs.sendMessage(sqsParams, (err, result) => {
                        if (err) {
                            console.log(err);

                            reject(err)
                        }

                        console.log('Message has been sent to queue, result:', result);
                    });
                })
                .on('error', error => {
                    console.log(error);

                    reject(error)
                })
                .on('end', async () => {
                    const source = `${BUCKET}/${key}`;
                    const destination = key.replace('uploaded', 'parsed')

                    console.log(`Copy from "${source}" to "${destination}"`);
                    await s3.copyObject({
                        Bucket: BUCKET,
                        CopySource: source,
                        Key: destination
                    }).promise();
                    console.log(`Copied`);

                    console.log(`Delete from ${source}`);
                    await s3.deleteObject({
                        Bucket: BUCKET,
                        Key: key
                    }).promise();
                    console.log(`Deleted`);

                    resolve();
                });
        });

        promises.push(promise);
    }

    await Promise.all(promises);
}
