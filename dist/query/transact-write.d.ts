import { DynamoDB } from 'aws-sdk';
export declare function transactWrite(documentClient: DynamoDB, requests: DynamoDB.TransactWriteItem[]): Promise<DynamoDB.TransactWriteItemsOutput>;
