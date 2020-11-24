import { catalogBatchProcess } from '../catalogBatchProcess';
import { SNS } from 'aws-sdk/';
import { records } from '../__fixtures__/SQSRecords';
import { createProductDb } from '../../db/product';

jest.mock('../../db/product');

// jest.mock('aws-sdk', () => {
//   return jest.fn().mockImplementation(() => {
//     return {
//       SNS: {
//         publish: jest.fn(),
//       },
//     };
//   });
// });

// jest.mock('aws-sdk', () => ({
//   SNS: jest.fn().mockImplementation(() => ({
//     publish: jest.fn().mockImplementation(() => ({
//       promise: jest.fn(),
//     })),
//   })),
// }));

jest.mock('aws-sdk', () => ({
  SNS: mockClass({
    publish: jest.fn(),
  }),
}));

describe('catalogBatchProcess', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should process records', async () => {
    (SNS.prototype.publish as jest.Mock).mockImplementation(() => ({
      promise: jest.fn().mockResolvedValue(undefined),
    }));

    await catalogBatchProcess(
      {
        Records: records,
      } as any,
      {} as any,
      () => {}
    );

    expect(SNS.prototype.publish).toHaveBeenCalledTimes(records.length);
  });

  it('should publish success messages', async () => {
    (SNS.prototype.publish as jest.Mock).mockImplementation(() => ({
      promise: jest.fn().mockResolvedValue(undefined),
    }));

    await catalogBatchProcess(
      {
        Records: records,
      } as any,
      {} as any,
      () => {}
    );

    expect(SNS.prototype.publish).toHaveBeenCalledTimes(records.length);
  });

  it('should publish error messages', async () => {
    (SNS.prototype.publish as jest.Mock).mockImplementation(() => ({
      promise: jest.fn().mockResolvedValue(undefined),
    }));
    (createProductDb as jest.Mock).mockRejectedValue('some error');

    await catalogBatchProcess(
      {
        Records: [records[0]],
      } as any,
      {} as any,
      () => {}
    );

    expect(
      (SNS.prototype.publish as jest.Mock).mock.calls[0][0]
    ).toMatchSnapshot();
  });
});

function mockClass(spec) {
  const proto = jest.fn(() => spec);
  proto.prototype = spec;
  return proto;
}
