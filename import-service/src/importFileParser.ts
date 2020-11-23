import { DeleteObjectCommand, CopyObjectCommand, S3 } from '@aws-sdk/client-s3';
import { SQS } from 'aws-sdk';
import { S3Handler } from 'aws-lambda';
import * as csvParser from 'csv-parser';

export const importFileParser: S3Handler = async ({ Records }) => {
  console.log('event', Records);
  const v3Client = new S3({ region: 'eu-west-1' });
  const SQSClient = new SQS({ region: 'eu-west-1' });

  for (const record of Records) {
    const { bucket, object } = record.s3;
    const filename = object.key;

    try {
      const results = [];
      const res = await v3Client.getObject({
        Bucket: bucket.name,
        Key: filename,
      });
      // Body is a readable stream https://github.com/aws/aws-sdk-js-v3/issues/1096#issuecomment-620900466
      await new Promise((resolve, reject) => {
        res.Body.pipe(csvParser())
          .on('data', (data) => {
            results.push(data);
            SQSClient.sendMessage(
              {
                QueueUrl: process.env.SQS_QUEUE,
                MessageBody: JSON.stringify(data),
              },
              (error) => {
                console.log(error, data);
              }
            );
          })
          .on('end', async () => {
            console.log(results);

            const newFileName = filename.slice(filename.indexOf('/') + 1);
            try {
              await v3Client.send(
                new CopyObjectCommand({
                  Bucket: bucket.name,
                  Key: `parsed/${newFileName}`,
                  CopySource: `${bucket.name}/${filename}`,
                })
              );
              console.log('CopyObjectCommand', `parsed/${newFileName}`);
              await v3Client.send(
                new DeleteObjectCommand({
                  Bucket: bucket.name,
                  Key: filename,
                })
              );
              console.log('DeleteObjectCommand', filename);
              resolve();
            } catch (error) {
              console.log(error);
              reject(error);
            }
          });
      });
    } catch (error) {
      console.log(error);
    }
  }
};
