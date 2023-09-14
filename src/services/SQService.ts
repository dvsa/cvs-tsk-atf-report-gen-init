import { config as AWSConfig, AWSError } from 'aws-sdk';
import SQS, {
  GetQueueUrlResult,
  MessageBodyAttributeMap,
  ReceiveMessageResult,
  SendMessageResult,
} from 'aws-sdk/clients/sqs';
import { PromiseResult } from 'aws-sdk/lib/request';
import { captureAWSClient } from 'aws-xray-sdk';
import { Service } from '../models/injector/ServiceDecorator';
import { Configuration } from '../utils/Configuration';
import { Config } from '../utils/types';

/**
 * Service class for interfacing with the Simple Queue Service
 */
@Service()
class SQService {
  public readonly sqsClient: SQS;

  private readonly config: Config;

  /**
   * Constructor for the ActivityService class
   * @param sqsClient - The Simple Queue Service client
   */
  constructor(sqsClient: SQS) {
    const config = Configuration.getInstance().getConfig();
    this.sqsClient = captureAWSClient(sqsClient) as SQS;

    if (!config.sqs) {
      throw new Error('SQS config is not defined in the config file.');
    }

    // Not defining BRANCH will default to local
    const env: string =
      !process.env.BRANCH || process.env.BRANCH === 'local'
        ? 'local'
        : 'remote';

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.config = config.sqs[env];

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    AWSConfig.sqs = this.config.params;
  }

  /**
   * Send a message to the queue
   * @param messageBody - A string message body
   * @param messageAttributes - A MessageAttributeMap
   */
  public async sendMessage(
    messageBody: string,
    messageAttributes?: MessageBodyAttributeMap,
  ): Promise<PromiseResult<SendMessageResult, AWSError>> {
    // Get the queue URL for the provided queue name
    const queueUrlResult: GetQueueUrlResult = await this.sqsClient
      .getQueueUrl({ QueueName: this.config.queueName as string })
      .promise();

    const params = {
      QueueUrl: queueUrlResult.QueueUrl,
      MessageBody: messageBody,
    };

    if (messageAttributes) {
      Object.assign(params, { MessageAttributes: messageAttributes });
    }

    // Send a message to the queue
    return this.sqsClient
      .sendMessage(params as SQS.Types.SendMessageRequest)
      .promise();
  }

  /**
   * Get the messages in the queue
   */
  public async getMessages(): Promise<
    PromiseResult<ReceiveMessageResult, AWSError>
  > {
    // Get the queue URL for the provided queue name
    const queueUrlResult: GetQueueUrlResult = await this.sqsClient
      .getQueueUrl({ QueueName: this.config.queueName as string })
      .promise();

    // Get the messages from the queue
    return this.sqsClient
      .receiveMessage({ QueueUrl: queueUrlResult.QueueUrl! })
      .promise();
  }
}

export { SQService };
