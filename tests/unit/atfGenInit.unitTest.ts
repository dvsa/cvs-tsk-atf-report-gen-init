/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { AWSError } from 'aws-sdk';
import { ReceiveMessageResult, SendMessageResult } from 'aws-sdk/clients/sqs';
import { PromiseResult } from 'aws-sdk/lib/request';
import { SQService } from '../../src/services/SQService';
import { StreamService } from '../../src/services/StreamService';
import { SQMockClient } from '../models/SQMockClient';
import event from '../resources/stream-event.json';

describe('atf-gen-init', () => {
  let processedEvent: any;

  context('StreamService', () => {
    const expectedResult: any[] = [
      {
        id: '5e4bd304-446e-4678-8289-d34fca9256e9',
        activityType: 'visit',
        testStationName: 'Rowe, Wunsch and Wisoky',
        testStationPNumber: '87-1369569',
        testStationEmail: 'teststationname@dvsa.gov.uk',
        testStationType: 'gvts',
        testerName: 'Gica',
        testerStaffId: '132',
        startTime: '2019-02-13T09:27:21.077Z',
        endTime: '2019-02-12T15:25:27.077Z',
      },
    ];

    context(
      'when fetching an activity stream with both visits and wait times',
      () => {
        it('should result in an array of filtered js objects containing only visits', () => {
          processedEvent = StreamService.getVisitsStream(event as any);
          expect(processedEvent).toEqual(expectedResult);
        });
      },
    );
  });

  context('SQService', () => {
    const sqService: SQService = new SQService(new SQMockClient() as any);
    sqService.sqsClient.createQueue({
      QueueName: 'atf-gen-q',
    });

    context('when adding a record to the queue', () => {
      it('should successfully add the records to the queue', () => {
        const sendMessagePromises: Array<
          Promise<PromiseResult<SendMessageResult, AWSError>>
        > = [];

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
        processedEvent.forEach((record: any) => {
          sendMessagePromises.push(
            sqService.sendMessage(JSON.stringify(record)),
          );
        });

        expect.assertions(0);
        return Promise.all(sendMessagePromises).catch((error: AWSError) => {
          // eslint-disable-next-line jest/no-conditional-expect
          expect(error).toBeFalsy();
        });
      });

      it('should successfully read the added records from the queue', () =>
        sqService.getMessages().then((messages: ReceiveMessageResult) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          const actual = messages.Messages!.map((message) =>
            JSON.parse(message.Body || ''),
          );
          expect(actual).toEqual(processedEvent);
        }));
    });
  });
});
