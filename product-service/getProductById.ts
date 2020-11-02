import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import products from './db.json';

export const getProductById: APIGatewayProxyHandler = async (
  event,
  _context
) => {
  const product = products.find((p) => p.id === event.pathParameters.productId);

  if (!product) {
    return {
      statusCode: 404,
      body: JSON.stringify({}),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        ...product,
      },
      null,
      2
    ),
  };
};
