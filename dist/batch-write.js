"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatchWrite = void 0;
const async_sema_1 = require("async-sema");
const _ = require("lodash");
const config_1 = require("./config");
const errors_1 = require("./errors");
class BatchWrite {
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
    constructor(options = {}) {
        this.options = options;
        this.list = [];
        this.dynamo = options.connection == null ? config_1.default.defaultConnection.client : options.connection;
        if (this.options.maxItemsPerBatch != null && this.options.maxItemsPerBatch > BatchWrite.MAX_BATCH_ITEMS) {
            throw new Error(`maxItemsPerBatch cannot be greater than ${BatchWrite.MAX_BATCH_ITEMS}`);
        }
    }
    setConnection(dynamo) {
        this.dynamo = dynamo;
        return this;
    }
    put(...records) {
        for (const record of records) {
            const tableClass = record.constructor;
            const requestMap = {
                [tableClass.schema.name]: [
                    {
                        PutRequest: {
                            Item: record.toDynamo(),
                        },
                    },
                ],
            };
            this.list.push(requestMap);
        }
        return this;
    }
    delete(...records) {
        for (const record of records) {
            const tableClass = record.constructor;
            const requestMap = {
                [tableClass.schema.name]: [
                    {
                        DeleteRequest: {
                            Key: record.getDynamoKey(),
                        },
                    },
                ],
            };
            this.list.push(requestMap);
        }
        return this;
    }
    async commit() {
        const limit = async_sema_1.RateLimit(this.options.maxParallelWrites == null ? BatchWrite.MAX_PARALLEL_WRITES : this.options.maxParallelWrites);
        const chunks = _.chunk(this.list, this.options.maxItemsPerBatch == null ? BatchWrite.MAX_BATCH_ITEMS : this.options.maxItemsPerBatch);
        const exceptions = [];
        const promises = chunks.map(async (chunk) => {
            // Wait if the maximum amount of parallel writes has been reached
            await limit();
            // If previous batches have already had an exception, then stop and do not continue
            if (exceptions.length > 0 && this.options.breakOnException !== false) {
                return;
            }
            const mergedMap = {};
            for (const requestMap of chunk) {
                for (const tableName of Object.keys(requestMap)) {
                    const request = requestMap[tableName];
                    if (mergedMap[tableName] == null) {
                        mergedMap[tableName] = request;
                    }
                    else {
                        mergedMap[tableName] = mergedMap[tableName].concat(request);
                    }
                }
            }
            try {
                return await this.dynamo.batchWriteItem({ RequestItems: mergedMap }).promise();
            }
            catch (ex) {
                // save the exception to stop all future chunks, because without this the other chunks would continue
                // this is not perfect, because operations that are in-progress will still continue, although they
                // might fail as well for the same reason as the first exception
                exceptions.push(ex);
            }
        });
        const results = _.filter(await Promise.all(promises));
        // merge together the outputs to unify the UnprocessedItems into a single output array
        const output = {};
        for (const result of results) {
            if (result.UnprocessedItems != null) {
                if (output.UnprocessedItems == null) {
                    output.UnprocessedItems = {};
                }
                for (const tableName of Object.keys(result.UnprocessedItems)) {
                    if (output.UnprocessedItems[tableName] == null) {
                        output.UnprocessedItems[tableName] = [];
                    }
                    output.UnprocessedItems[tableName] = output.UnprocessedItems[tableName].concat(result.UnprocessedItems[tableName]);
                }
            }
        }
        // at this point, we might have some results and some exceptions
        if (exceptions.length > 0) {
            throw new errors_1.BatchError('Some or all of your batch write operation failed', exceptions, output);
        }
        return output;
    }
}
exports.BatchWrite = BatchWrite;
BatchWrite.MAX_BATCH_ITEMS = 25; // limit imposed by DynamoDB
BatchWrite.MAX_PARALLEL_WRITES = 25; // 25 concurrent writes of 25 records is a lot…
//# sourceMappingURL=batch-write.js.map