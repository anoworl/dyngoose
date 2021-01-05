import { DynamoDB } from 'aws-sdk';
import { Connection } from './connection';
export declare class DAXConnection implements Connection {
    private readonly __client;
    constructor(options: {
        endpoints: string[];
        requestTimeout?: number;
    });
    get client(): DynamoDB;
}
