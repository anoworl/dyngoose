import { DynamoDB } from 'aws-sdk';
import { UpdateConditions } from './query/filters';
import { Table } from './table';
export declare class Transaction {
    private dynamo;
    private readonly list;
    /**
     * Perform a Transaction operation.
     *
     * @see {@link https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_TransactWriteItems.html}
     *
     * Transaction operations are a synchronous write operation which can perform put, update, and delete actions
     * can target items in different tables, but not in different AWS accounts or Regions, and no two actions can
     * target the same item.
     *
     * To perform a non-atomic operation, use `Dyngoose.Batch`.
     *
     * **WARNING** Dyngoose will internally chunk your requested write items if you attempt to write more than
     *   the DynamoDB limit of 25 items per transactions, however, when doing so Dyngoose cannot guarantee this
     *   operation will be entirely atomic and you should avoid specifying more than 25 items.
     *
     * @param {DynamoDB} connection You can optionally specify the DynamoDB connection to utilize.
     * @see {@link https://github.com/benhutchins/dyngoose/blob/master/docs/Connections.md}.
     */
    constructor(connection?: DynamoDB);
    setConnection(dynamo: DynamoDB): this;
    /**
     * Add a record to be saved to this transaction.
     *
     * If the record already exists, Dyngoose will automatically use `.update()` to only
     * transmit the updated values of the record. It is highly recommended you specify
     * update conditions when updating existing items.
    */
    save<T extends Table>(record: T, conditions?: UpdateConditions<T>): this;
    put<T extends Table>(record: T, conditions?: UpdateConditions<T>): this;
    update<T extends Table>(record: T, conditions?: UpdateConditions<T>): this;
    delete<T extends Table>(record: T, conditions?: UpdateConditions<T>): this;
    conditionCheck<T extends Table>(record: T, conditions: UpdateConditions<T>): this;
    commit(): Promise<DynamoDB.TransactWriteItemsOutput>;
}
