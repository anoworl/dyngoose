import { DynamoDB } from 'aws-sdk';
import { Table } from './table';
export declare class BatchGet<T extends Table> {
    static readonly MAX_BATCH_ITEMS = 100;
    static readonly MAX_TRANSACT_ITEMS = 25;
    private dynamo;
    private readonly items;
    private readonly projectionMap;
    private atomicity;
    /**
     * Perform a BatchGet operation.
     *
     * @see {@link https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_BatchGetItem.html}
     *
     * A BatchGet operation retrieves multiple from multiple tables in one operation.
     *
     * There is a limit of 16MB and 100 items we request. Dyngoose will automatically chunk requests
     * and will perform several operations if requesting more than 100 items, however, it is possible
     * requests can fail due to the 16MB of data limitation.
     *
     * It is possible for the request to partially fail and some items will not be retrieved, these
     * items will be specified under UnprocessedKeys.
     *
     * @param {DynamoDB} connection You can optionally specify the DynamoDB connection to utilize.
     * @see {@link https://github.com/benhutchins/dyngoose/blob/master/docs/Connections.md}.
     */
    constructor(connection?: DynamoDB);
    setConnection(dynamo: DynamoDB): this;
    atomic(): this;
    nonAtomic(): this;
    get(...records: T[]): this;
    /**
     * By default, DynamoDB will retrieve the entire item during a BatchGet.
     * That can rapidly become a lot of data.
     *
     * To be more selective, you can specify which attributes you'd like to retrieve
     * from DynamoDB by specifying them. Dyngoose will turn your specified list into
     * a ProjectionExpression automatically.
    */
    getSpecificAttributes(tableClass: typeof Table, ...attributes: string[]): this;
    retrieve(): Promise<T[]>;
    retrieveMapped(): Promise<Map<typeof Table, T[]>>;
}
