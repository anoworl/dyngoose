import { DynamoDB } from 'aws-sdk';
import * as Metadata from '../metadata';
import { ITable, Table } from '../table';
import { Filters as QueryFilters } from './filters';
import { QueryOutput } from './output';
import { MagicSearch, MagicSearchInput } from './search';
interface GlobalSecondaryIndexGetInput {
    /**
     * Allow Dyngoose to build the projection expression for your query.
     *
     * Pass the list of attributes you'd like retrieved. These do not have to be the attributes specific
     * to the index. If you'd like to retrieve all the attributes in the parent table, specify `select`
     * with a value of `ALL`
     */
    attributes?: string[];
    /**
     * Manually specify the ProjectionExpression for your query.
     *
     * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ProjectionExpressions.html
     */
    projectionExpression?: DynamoDB.ProjectionExpression;
    /**
     * Optionally used when you manually specify the ProjectionExpression for your query.
     *
     * This is written for you when specifying `attributes`.
     */
    expressionAttributeNames?: DynamoDB.ExpressionAttributeNameMap;
}
interface GlobalSecondaryIndexQueryScanSharedInput extends GlobalSecondaryIndexGetInput {
    /**
     * Instead of retrieving the attributes for items you can return the number of results that match your query.
     *
     * When specifying a `projectionExpression` or `attributes` option, this will have no effect.
     */
    select?: 'COUNT';
    /**
     * Limit the number of items that are read.
     *
     * For example, suppose that you query a table, with a Limit value of 6, and without a filter expression.
     * The Query result contains the first six items from the table that match the key condition expression from the request.
     *
     * Now suppose that you add a filter expression to the Query. In this case, DynamoDB reads up to six items,
     * and then returns only those that match the filter expression. The final query result contains six items
     * or fewer, even if more items would have matched the filter expression if DynamoDB had kept reading more items.
     *
     * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.html#Query.Limit
     * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Scan.html#Scan.Limit
     */
    limit?: number;
    exclusiveStartKey?: DynamoDB.Key;
}
interface GlobalSecondaryIndexQueryInput extends GlobalSecondaryIndexQueryScanSharedInput {
    /**
     * Specify the direction to order using your RANGE key
     *
     * Defaults to ASC
     */
    rangeOrder?: 'ASC' | 'DESC';
}
interface GlobalSecondaryIndexScanInput extends GlobalSecondaryIndexQueryScanSharedInput {
    totalSegments?: DynamoDB.ScanTotalSegments;
    segment?: DynamoDB.ScanSegment;
    consistent?: DynamoDB.ConsistentRead;
}
interface GlobalSecondaryIndexSegmentedScanInput extends GlobalSecondaryIndexScanInput {
    limit: number;
    totalSegments: DynamoDB.ScanTotalSegments;
}
export declare class GlobalSecondaryIndex<T extends Table> {
    readonly tableClass: ITable<T>;
    readonly metadata: Metadata.Index.GlobalSecondaryIndex;
    constructor(tableClass: ITable<T>, metadata: Metadata.Index.GlobalSecondaryIndex);
    /**
     * Performs a query and returns the first item matching your filters.
     *
     * The regular DynamoDB.GetItem does not work for indexes, because DynamoDB only enforces a
     * unique cross of the tale's primary HASH and RANGE key. The combination of those two values
     * must always be unique, however, for a GlobalSecondaryIndex, there is no uniqueness checks
     * or requirements. This means that querying for a record by the HASH and RANGE on a
     * GlobalSecondaryIndex it is always possible there are multiple matching records.
     *
     * So use this with caution. It sets the DynamoDB Limit parameter to 1, which means this will
     * not work for additional filtering. If you want to provide additional filtering, use the
     * .query() method and pass your filters, then handle if the query has more than one result.
     *
     * Avoid use whenever you do not have uniqueness for the GlobalSecondaryIndex's HASH + RANGE.
     */
    get(filters: QueryFilters<T>, input?: GlobalSecondaryIndexGetInput): Promise<T | undefined>;
    getQueryInput(input?: GlobalSecondaryIndexQueryInput, filters?: QueryFilters<T>): DynamoDB.QueryInput;
    query(filters: QueryFilters<T>, input?: GlobalSecondaryIndexQueryInput): Promise<QueryOutput<T>>;
    getScanInput(input?: GlobalSecondaryIndexScanInput, filters?: QueryFilters<T>): DynamoDB.ScanInput;
    /**
     * Performs a DynamoDB Scan.
     *
     * *WARNING*: In most circumstances this is not a good thing to do.
     * This will return all the items in this index, does not perform well!
     */
    scan(filters?: QueryFilters<T> | undefined | null, input?: GlobalSecondaryIndexScanInput): Promise<QueryOutput<T>>;
    /**
     * Performs a parallel segmented scan for you.
     *
     * You must provide the total number of segments you want to perform.
     *
     * It is recommend you also provide a Limit for the segments, which can help prevent situations
     * where one of the workers consumers all of the provisioned throughput, at the expense of the
     * other workers.
     *
     * @see {@link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Scan.html#Scan.ParallelScan}
     */
    segmentedScan(filters: QueryFilters<T> | undefined | null, input: GlobalSecondaryIndexSegmentedScanInput): Promise<QueryOutput<T>>;
    /**
     * Query DynamoDB for what you need.
     *
     * Starts a MagicSearch using this GlobalSecondaryIndex.
     */
    search(filters?: QueryFilters<T>, input?: MagicSearchInput<T>): MagicSearch<T>;
}
export {};
