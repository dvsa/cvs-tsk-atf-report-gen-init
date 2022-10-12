import mockContext = require('aws-lambda-mock-context');
import { SQService } from '../../src/services/SQService';
import { StreamService } from '../../src/services/StreamService';
import { atfGenInit } from '../../src/functions/atfGenInit';

describe('retroGenInit  Function', () => {
  const ctx = mockContext();
  afterAll(() => {
    jest.restoreAllMocks();
    jest.resetModuleRegistry();
  });
  describe('with good event', () => {
    it('should invoke SQS service with correct params', async () => {
      const sendMessage = jest.fn().mockResolvedValue('Success');
      SQService.prototype.sendMessage = sendMessage;
      StreamService.getVisitsStream = jest
        .fn()
        .mockReturnValue([{ test: 'thing' }]);
      await atfGenInit({}, ctx, () => {

      });
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
        await atfGenInit({}, ctx, () => {
        });
      } catch (e) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(e.message).toEqual(myError.message);
      }
    });
  });
});
