import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { S3, PutObjectCommand } from '@aws-sdk/client-s3';
import { S3RequestPresigner } from '@aws-sdk/s3-request-presigner';
import { createRequest } from '@aws-sdk/util-create-request';
import { formatUrl } from '@aws-sdk/util-format-url';
import { commonHeaders } from '../../commonHeaders';

const REGION = 'eu-west-1';
const BUCKET = 'store-imported-products';
const PREFIX = 'uploaded';

export const importProductsFile: APIGatewayProxyHandler = async (
  event,
  _context
) => {
  let signedUrl;

  const name = event.queryStringParameters?.name;
  if (!name) {
    return {
      statusCode: 400,
      headers: commonHeaders,
      body: JSON.stringify(
        {
          error: 'Query parameter name is required',
        },
        null,
        2
      ),
    };
  }
  const key = `${PREFIX}/${name}`;

  // @ts-ignore
  const v3Client = new S3({ region: REGION, signatureVersion: 'v4' });

  try {
    //Create an S3RequestPresigner object
    const signer = new S3RequestPresigner({ ...v3Client.config });
    // Create request
    const request = await createRequest(
      v3Client,
      new PutObjectCommand({
        Key: key,
        Bucket: BUCKET,
      })
    );
    // Define the duration until expiration of the presigned URL
    // const expiration = new Date(Date.now() + EXPIRATION);

    // Create and format presigned URL
    signedUrl = formatUrl(
      await signer.presign(request, {
        expiresIn: 3600,
      })
    );
    console.log(`\nPutting "${key}" using signedUrl`);
  } catch (err) {
    console.log('Error creating presigned URL', err);
    return {
      statusCode: 400,
      headers: commonHeaders,
      body: JSON.stringify(
        {
          error: err,
        },
        null,
        2
      ),
    };
  }

  return {
    statusCode: 200,
    headers: commonHeaders,
    body: signedUrl,
  };
};
