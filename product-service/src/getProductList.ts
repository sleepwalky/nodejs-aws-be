import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { commonHeaders } from '../../commonHeaders';
import { getProductsFromDb } from '../db/product';

export const getProductList: APIGatewayProxyHandler = async (
  event,
  _context
) => {
  try {
    console.log(event);
    const products = await getProductsFromDb();
    return {
      statusCode: 200,
      headers: commonHeaders,
      body: JSON.stringify(
        {
          items: products,
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
