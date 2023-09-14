/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Config {
  [key: string]: any;
  sqs?: { [key: string]: any };
}
