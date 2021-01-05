import { DynamoDB } from 'aws-sdk';
import { UpdateConditions } from './query/filters';
import { ITable, Table } from './table';
export declare class DocumentClient<T extends Table> {
    private readonly tableClass;
    constructor(tableClass: ITable<T>);
    getPutInput(record: T, conditions?: UpdateConditions<T>): DynamoDB.PutItemInput;
    put(record: T, conditions?: UpdateConditions<T>): Promise<DynamoDB.PutItemOutput>;
    getUpdateInput(record: T, conditions?: UpdateConditions<T>): DynamoDB.UpdateItemInput;
    update(record: T, conditions?: UpdateConditions<T>): Promise<DynamoDB.UpdateItemOutput>;
    batchPut(records: T[]): Promise<DynamoDB.BatchWriteItemOutput>;
    getDeleteInput(record: T, conditions?: UpdateConditions<T>): DynamoDB.DeleteItemInput;
    transactPut(records: T[]): Promise<DynamoDB.TransactWriteItemsOutput>;
    delete(record: T, conditions?: UpdateConditions<T>): Promise<DynamoDB.DeleteItemOutput>;
}
