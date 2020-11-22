import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { commonHeaders } from '../../commonHeaders';
import { getProductByIdFromDb } from '../db/product';

export const getProductById: APIGatewayProxyHandler = async (
  event,
  _context
) => {
  try {
    console.log(event);
    const product = await getProductByIdFromDb(event.pathParameters.productId);

    if (!product) {
      return {
        statusCode: 404,
        headers: commonHeaders,
        body: JSON.stringify({
          error: {
            message: 'Product not exist',
          },
        }),
      };
    }

    return {
      statusCode: 200,
      headers: commonHeaders,
      body: JSON.stringify(
        {
          ...product,
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
          message: "Couldn't load products from DB",
        },
      }),
    };
  }
};
