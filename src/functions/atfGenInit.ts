/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Callback,
  Context,
  DynamoDBRecord,
  Handler,
  SQSEvent,
} from 'aws-lambda';
import { AWSError } from 'aws-sdk';
import { SendMessageResult } from 'aws-sdk/clients/sqs';
import { PromiseResult } from 'aws-sdk/lib/request';
import { Injector } from '../models/injector/Injector';
import { SQService } from '../services/SQService';
import { StreamService } from '../services/StreamService';

/**
 * λ function to process a DynamoDB stream of test results into a queue for certificate generation.
 * @param event - DynamoDB Stream event
 * @param context - λ Context
 * @param callback - callback function
 */
const atfGenInit: Handler = async (
  event: SQSEvent,
  context?: Context,
  callback?: Callback,
): Promise<void | Array<PromiseResult<SendMessageResult, AWSError>>> => {
  if (!event) {
    console.error('ERROR: event is not defined.');
    return;
  }

  // Convert the received event into a readable array of filtered visits
  const records: DynamoDBRecord[] = StreamService.getVisitsStream(event);

  // Instantiate the Simple Queue Service
  const sqService: SQService = Injector.resolve<SQService>(SQService);
  const sendMessagePromises: Array<
    Promise<PromiseResult<SendMessageResult, AWSError>>
  > = [];

  // Add each visit record to the queue
  // eslint-disable-next-line @typescript-eslint/no-misused-promises,@typescript-eslint/require-await
  records.forEach(async (record: DynamoDBRecord) => {
    sendMessagePromises.push(sqService.sendMessage(JSON.stringify(record)));
  });

  // eslint-disable-next-line consistent-return
  return Promise.all(sendMessagePromises).catch((error: AWSError) => {
    console.error(error);
    throw error;
  });
};

export { atfGenInit };
