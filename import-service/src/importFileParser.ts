import { S3 } from '@aws-sdk/client-s3';
import { S3Handler } from 'aws-lambda';
import * as csvParser from 'csv-parser';

export const importFileParser: S3Handler = async (event, _context) => {
  console.log('event', event.Records[0].s3);
  const v3Client = new S3({ region: 'eu-west-1' });

  const { bucket, object } = event.Records[0].s3;

  try {
    const results = [];
    const res = await v3Client.getObject({
      Bucket: bucket.name,
      Key: object.key,
    });
    // Body is a readable stream https://github.com/aws/aws-sdk-js-v3/issues/1096#issuecomment-620900466
    res.Body.pipe(csvParser())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        console.log(results);
      });
  } catch (error) {}
};
