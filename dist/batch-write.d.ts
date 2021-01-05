import { DynamoDB } from 'aws-sdk';
import { Table } from './table';
export declare class BatchWrite {
    private readonly options;
    static readonly MAX_BATCH_ITEMS = 25;
    static readonly MAX_PARALLEL_WRITES = 25;
    private dynamo;
    private readonly list;
    /**
     * Perform a BatchWrite operation.
     *
     * @see {@link https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_BatchWriteItem.html}
     *
     * A Batch operation puts or deletes multiple items in one or more tables.
     *
     * The individual `PutItem` and `DeleteItem` operations specified in batch operation are atomic,
     * however, the whole batch operation is not atomic. This means that some puts and deletes can
     * be successful and others can fail.
     *
     * To perform an atomic operation, use `Dyngoose.Transaction`. Additioanlyl, BatchWrites cannot
     * update partial items, however, TransactWrites can.
     *
     * Uses a semaphore to limit parallel writes.
     *
     * @param {DynamoDB} connection You can optionally specify the DynamoDB connection to utilize.
     * @see {@link https://github.com/benhutchins/dyngoose/blob/master/docs/Connections.md}.
     */
    constructor(options?: {
        connection?: DynamoDB;
        maxItemsPerBatch?: number;
        /**
         * Dyngoose.BatchWrite uses a semaphore to limit parallel writes.
         * Specify the number of parallel operations you'd like to consume.
         * Default is `25`.
         */
        maxParallelWrites?: number;
        /**
         * Stop future chunks and parallel writes if an exception is encountered.
         * Outputs that contain UnprocessedItems, such as due to provisioned throughout exceptions.
         * True by default. Set to false to disable.
        */
        breakOnException?: boolean;
    });
    setConnection(dynamo: DynamoDB): this;
    put<T extends Table>(...records: T[]): this;
    delete<T extends Table>(...records: T[]): this;
    commit(): Promise<DynamoDB.BatchWriteItemOutput>;
}
