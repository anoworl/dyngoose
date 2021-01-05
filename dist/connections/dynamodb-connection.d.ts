import * as AWS from 'aws-sdk';
import { Connection } from './connection';
interface DyngooseDynamoDBConnectionOptions extends AWS.DynamoDB.ClientConfiguration {
    enableAWSXray?: boolean;
}
export declare class DynamoDBConnection implements Connection {
    private readonly __client;
    constructor(options: DyngooseDynamoDBConnectionOptions);
    private httpAgent;
    get client(): AWS.DynamoDB;
}
export {};
