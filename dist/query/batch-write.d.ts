import { DynamoDB } from 'aws-sdk';
export declare function batchWrite(documentClient: DynamoDB, requests: DynamoDB.BatchWriteItemRequestMap[]): Promise<DynamoDB.BatchWriteItemOutput>;
