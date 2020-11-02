import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import products from './db.json';

export const getProductList: APIGatewayProxyHandler = async (
  event,
  _context
) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        items: products,
      },
      null,
      2
    ),
  };
};
