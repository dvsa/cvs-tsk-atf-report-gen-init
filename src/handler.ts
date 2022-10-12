import { config as AWSConfig } from 'aws-sdk';
import { atfGenInit } from './functions/atfGenInit';

const isOffline: boolean = !process.env.BRANCH || process.env.BRANCH === 'local';

if (isOffline) {
  AWSConfig.credentials = {
    accessKeyId: 'offline',
    secretAccessKey: 'offline',
  };
}

export { atfGenInit as handler };
