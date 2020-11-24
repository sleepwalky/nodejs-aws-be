import { getProductById } from '../getProductById';
import { getProductByIdFromDb } from '../../db/product';

jest.mock('../../db/product');

describe('getProductById', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 404 if there is no product with such id', async () => {
    (getProductByIdFromDb as jest.Mock).mockResolvedValue(undefined);
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
    (getProductByIdFromDb as jest.Mock).mockResolvedValue([{ id: '123' }]);
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
    (getProductByIdFromDb as jest.Mock).mockRejectedValue(null);
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
