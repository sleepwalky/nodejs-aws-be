import { getProductById } from '../getProductById';
import { getProductsFromDb } from '../db/product';

jest.mock('../db/product', () => ({
  __esModule: true,
  getProductsFromDb: jest.fn(),
}));

describe('getProductById', () => {
  it('should return 404 if there is no product with such id', async () => {
    (getProductsFromDb as jest.Mock).mockResolvedValue([]);
    const result = await getProductById(
      {
        pathParameters: {
          productId: 'test',
        },
      } as any,
      {} as any,
      () => {}
    );

    expect(result).toMatchSnapshot();
  });

  it('should return product by id', async () => {
    (getProductsFromDb as jest.Mock).mockResolvedValue([{ id: '123' }]);
    const result = await getProductById(
      {
        pathParameters: {
          productId: '123',
        },
      } as any,
      {} as any,
      () => {}
    );

    expect(result).toMatchSnapshot();
  });

  it('should return 500 if db throws', async () => {
    (getProductsFromDb as jest.Mock).mockRejectedValue(null);
    const result = await getProductById(
      {
        pathParameters: {
          productId: '123',
        },
      } as any,
      {} as any,
      () => {}
    );

    expect(result).toMatchSnapshot();
  });
});
