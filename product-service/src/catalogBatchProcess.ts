import { SNS } from 'aws-sdk';
import { SQSHandler } from 'aws-lambda';
import 'source-map-support/register';
import { createProductDb } from '../db/product';
import { ProductSchema } from '../models/Product';

export const catalogBatchProcess: SQSHandler = async (event) => {
  console.log(event);
  const SNSClient = new SNS({ region: 'eu-west-1' });

  const { Records } = event;

  await Promise.allSettled(
    Records.map(async (record) => {
      console.log(record);
      const payload = JSON.parse(record.body);

      try {
        await ProductSchema.validate(payload);
      } catch (error) {
        console.log(error);
      }
      try {
        await createProductDb(payload);
        console.log('Going to publish message...');
        await SNSClient.publish({
          Message: `
          Item was added:
          ${record.body}
          `,
          TopicArn: process.env.SNS_ARN,
          MessageAttributes: {
            name: {
              DataType: 'String',
              StringValue: Number(payload.price) > 100 ? 'foo' : 'bar',
            },
          },
        })
          .promise()
          .then((value) => console.log(value));
      } catch (error) {
        console.log('Error', error);
        await SNSClient.publish({
          Message: `
          There was an error:
          ${record.body}
          ${JSON.stringify(error)}
          `,
          TopicArn: process.env.SNS_ARN,
          MessageAttributes: {
            name: {
              DataType: 'String',
              StringValue: Number(payload.price) > 100 ? 'foo' : 'bar',
            },
          },
        })
          .promise()
          .then((value) => console.log(value));
      }
    })
  );
};
