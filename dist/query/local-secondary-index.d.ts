import { DynamoDB } from 'aws-sdk';
import * as Metadata from '../metadata';
import { ITable, Table } from '../table';
import { Filters as QueryFilters } from './filters';
import { QueryOutput } from './output';
import { MagicSearch, MagicSearchInput } from './search';
interface LocalSecondaryIndexQueryInput {
    rangeOrder?: 'ASC' | 'DESC';
    limit?: number;
    exclusiveStartKey?: DynamoDB.Key;
    consistent?: DynamoDB.ConsistentRead;
}
interface LocalSecondaryIndexScanInput {
    limit?: number;
    select?: DynamoDB.Select;
    totalSegments?: DynamoDB.ScanTotalSegments;
    segment?: DynamoDB.ScanSegment;
    exclusiveStartKey?: DynamoDB.Key;
    projectionExpression?: DynamoDB.ProjectionExpression;
    consistent?: DynamoDB.ConsistentRead;
}
export declare class LocalSecondaryIndex<T extends Table> {
    readonly tableClass: ITable<T>;
    readonly metadata: Metadata.Index.LocalSecondaryIndex;
    constructor(tableClass: ITable<T>, metadata: Metadata.Index.LocalSecondaryIndex);
    getQueryInput(input?: LocalSecondaryIndexQueryInput): DynamoDB.QueryInput;
    query(filters: QueryFilters<T>, input?: LocalSecondaryIndexQueryInput): Promise<QueryOutput<T>>;
    getScanInput(input?: LocalSecondaryIndexScanInput): DynamoDB.ScanInput;
    scan(filters: QueryFilters<T> | undefined | null, input?: LocalSecondaryIndexScanInput): Promise<QueryOutput<T>>;
    /**
     * Query DynamoDB for what you need.
     *
     * Starts a MagicSearch using this LocalSecondaryIndex.
     */
    search(filters?: QueryFilters<T>, input?: MagicSearchInput<T>): MagicSearch<T>;
}
export {};
