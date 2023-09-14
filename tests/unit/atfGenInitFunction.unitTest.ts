/* eslint-disable jest/no-conditional-expect */
import { Context } from 'aws-lambda';
import { atfGenInit } from '../../src/functions/atfGenInit';
import { SQService } from '../../src/services/SQService';
import { StreamService } from '../../src/services/StreamService';

describe('retroGenInit  Function', () => {
  const ctx = '' as unknown as Context;
  afterAll(() => {
    jest.restoreAllMocks();
    jest.resetModules();
  });
  describe('with good event', () => {
    it('should invoke SQS service with correct params', async () => {
      const sendMessage = jest.fn().mockResolvedValue('Success');
      SQService.prototype.sendMessage = sendMessage;
      StreamService.getVisitsStream = jest
        .fn()
        .mockReturnValue([{ test: 'thing' }]);
      await atfGenInit({}, ctx, () => {});
      expect(sendMessage).toHaveBeenCalledWith(
        JSON.stringify({ test: 'thing' }),
      );
      expect(sendMessage).toHaveBeenCalledTimes(1);
    });
  });

  describe('when SQService throws error', () => {
    it('should bubble up the error', async () => {
      StreamService.getVisitsStream = jest.fn().mockReturnValue([{}]);
      const myError = new Error('It Broke!');
      SQService.prototype.sendMessage = jest.fn().mockRejectedValue(myError);

      expect.assertions(1);
      try {
        await atfGenInit({}, ctx, () => {});
      } catch (e) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(e.message).toEqual(myError.message);
      }
    });
  });
});
