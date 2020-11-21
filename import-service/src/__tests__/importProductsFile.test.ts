import { importProductsFile } from '../importProductsFile';
import { createRequest } from '@aws-sdk/util-create-request';

jest.mock('@aws-sdk/s3-request-presigner');
jest.mock('@aws-sdk/client-s3');
jest.mock('@aws-sdk/util-create-request');
jest.mock('@aws-sdk/util-format-url', () => ({
  formatUrl: () => 'signedUrl',
}));

describe('importProductsFile', () => {
  it('should return 400 if name is not passed in queryparams', async () => {
    const result = await importProductsFile({} as any, {} as any, () => {});
    expect(result).toMatchSnapshot();
  });

  it('should return 200 and signed url', async () => {
    const result = await importProductsFile(
      {
        queryStringParameters: {
          name: 'test',
        },
      } as any,
      {} as any,
      () => {}
    );
    expect(result).toMatchSnapshot();
  });

  it('should return 500 if something goes wrong', async () => {
    (createRequest as jest.Mock).mockRejectedValue('error');
    const result = await importProductsFile(
      {
        queryStringParameters: {
          name: 'test',
        },
      } as any,
      {} as any,
      () => {}
    );

    expect(result).toMatchSnapshot();
  });
});
