import { getProductList } from '../getProductList';
import { getProductsFromDb } from '../db/product';

jest.mock('../db/product', () => ({
  __esModule: true,
  getProductsFromDb: jest.fn(),
}));

describe('getProductList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return product list', async () => {
    (getProductsFromDb as jest.Mock).mockResolvedValue([
      { id: '1' },
      { id: '2' },
    ]);
    const result = await getProductList({} as any, {} as any, () => {});

    expect(result).toMatchSnapshot();
  });

  it('should return 500 if db throws', async () => {
    (getProductsFromDb as jest.Mock).mockRejectedValue(null);
    const result = await getProductList(
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
