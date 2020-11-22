import { SQSHandler } from 'aws-lambda';
import 'source-map-support/register';

export const catalogBatchProcess: SQSHandler = (event) => {
  console.log(event);

  const { Records } = event;

  for (const record of Records) {
    console.log(record);
  }
};
