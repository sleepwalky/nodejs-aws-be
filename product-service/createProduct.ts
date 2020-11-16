import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { commonHeaders } from '../commonHeaders';
import { ProductSchema } from './models/Product';
import { createProductDb } from './db/product';

export const createProduct: APIGatewayProxyHandler = async (
  event,
  _context
) => {
  try {
    console.log(event);
    const payload = JSON.parse(event.body);

    try {
      await ProductSchema.validate(payload);
    } catch (error) {
      return {
        statusCode: 400,
        headers: commonHeaders,
        body: JSON.stringify({
          error,
        }),
      };
    }

    const result = await createProductDb(payload);

    return {
      statusCode: 200,
      headers: commonHeaders,
      body: JSON.stringify(
        {
          ...result,
        },
        null,
        2
      ),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: commonHeaders,
      body: JSON.stringify({
        error: {
          message: "Couldn't save product to DB",
        },
      }),
    };
  }
};
