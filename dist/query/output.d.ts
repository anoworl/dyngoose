import { DynamoDB } from 'aws-sdk';
import { Table } from '..';
import { ITable } from '../table';
export declare class QueryOutput<T extends Table> extends Array<T> {
    protected readonly tableClass: ITable<T>;
    static fromDynamoOutput<T extends Table>(tableClass: ITable<T>, output: DynamoDB.ScanOutput | DynamoDB.QueryOutput, hasProjection: boolean): QueryOutput<T>;
    static fromSeveralOutputs<T extends Table>(tableClass: ITable<T>, outputs: Array<QueryOutput<T>>): QueryOutput<T>;
    count: number;
    scannedCount: number;
    lastEvaluatedKey?: DynamoDB.Key;
    consumedCapacity: DynamoDB.ConsumedCapacity;
    /**
     * The items returned from DynamoDB
     *
     * @deprecated
     */
    get records(): T[];
    protected constructor(records: T[], tableClass: ITable<T>);
}
