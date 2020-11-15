import 'source-map-support/register';
import { S3Handler } from 'aws-lambda';
import { S3 } from 'aws-sdk';
import csv from 'csv-parser';

const { REGION, BUCKET } = process.env;

export const importFileParser: S3Handler = async (event) => {
    console.log('importFileParser event: ' + JSON.stringify(event));

    const s3 = new S3({region: REGION});

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
                .on('data', (data) => {
                    console.log('data:', data);
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
