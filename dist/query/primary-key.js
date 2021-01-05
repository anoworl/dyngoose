"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrimaryKey = void 0;
const lodash_1 = require("lodash");
const batch_get_1 = require("../batch-get");
const errors_1 = require("../errors");
const is_1 = require("../utils/is");
const batch_write_1 = require("./batch-write");
const expression_1 = require("./expression");
const output_1 = require("./output");
const projection_expression_1 = require("./projection-expression");
const search_1 = require("./search");
/**
 * Determines if a given value is an accepted value for a hash or range key
 */
function isKeyValue(range) {
    const type = typeof range;
    return type === 'string' || type === 'boolean' || type === 'number' || type === 'bigint' || lodash_1.isDate(range);
}
class PrimaryKey {
    constructor(table, metadata) {
        this.table = table;
        this.metadata = metadata;
    }
    getDeleteItemInput(hash, range) {
        const input = {
            TableName: this.table.schema.name,
            // ReturnValues: "ALL_OLD",
            Key: {
                [this.metadata.hash.name]: this.metadata.hash.toDynamoAssert(hash),
            },
        };
        if (this.metadata.range != null) {
            input.Key[this.metadata.range.name] = this.metadata.range.toDynamoAssert(range);
        }
        return input;
    }
    async delete(hash, range) {
        const input = this.getDeleteItemInput(hash, range);
        return await this.table.schema.dynamo.deleteItem(input).promise();
    }
    getGetInput(input) {
        const getItemInput = {
            TableName: this.table.schema.name,
            Key: input.key,
            ProjectionExpression: input.projectionExpression,
            ConsistentRead: input.consistent,
            ReturnConsumedCapacity: input.returnConsumedCapacity,
        };
        return getItemInput;
    }
    async get(hash, range, input) {
        let record;
        if (is_1.isDyngooseTableInstance(hash)) {
            record = hash;
        }
        else if (lodash_1.isObject(hash) && !isKeyValue(hash)) {
            record = this.fromKey(hash);
        }
        else if (hash != null && (range == null || isKeyValue(range))) {
            record = this.fromKey(hash, range);
        }
        else {
            throw new errors_1.QueryError('PrimaryKey.get called with unknown arguments');
        }
        const getGetInput = input == null ? ((range == null || isKeyValue(range)) ? {} : range) : input;
        getGetInput.key = record.getDynamoKey();
        const getItemInput = this.getGetInput(getGetInput);
        const hasProjection = getItemInput.ProjectionExpression == null;
        const dynamoRecord = await this.table.schema.dynamo.getItem(getItemInput).promise();
        if (dynamoRecord.Item != null) {
            return this.table.fromDynamo(dynamoRecord.Item, !hasProjection);
        }
    }
    /**
     * Get a batch of items from this table
     *
     * This has been replaced with `Dyngoose.BatchGet` and should no longer be used.
     * `Dyngoose.BatchGet` has more functionality, supports projects and optionally atomic operations.
     *
     * @deprecated
     */
    async batchGet(inputs) {
        const batch = new batch_get_1.BatchGet();
        for (const input of inputs) {
            batch.get(this.fromKey(input[0], input[1]));
        }
        return await batch.retrieve();
    }
    async batchDelete(inputs) {
        return await batch_write_1.batchWrite(this.table.schema.dynamo, inputs.map((input) => {
            const deleteRequest = {
                Key: {
                    [this.metadata.hash.name]: this.metadata.hash.toDynamoAssert(input[0]),
                },
            };
            if (this.metadata.range != null) {
                deleteRequest.Key[this.metadata.range.name] = this.metadata.range.toDynamoAssert(input[1]);
            }
            const writeRequest = {
                DeleteRequest: deleteRequest,
            };
            const requestMap = {
                [this.table.schema.name]: [writeRequest],
            };
            return requestMap;
        }));
    }
    getQueryInput(input = {}) {
        if (input.rangeOrder == null) {
            input.rangeOrder = 'ASC';
        }
        const ScanIndexForward = input.rangeOrder === 'ASC';
        const queryInput = {
            TableName: this.table.schema.name,
            Limit: input.limit,
            ScanIndexForward,
            ExclusiveStartKey: input.exclusiveStartKey,
            ReturnConsumedCapacity: 'TOTAL',
            ConsistentRead: input.consistent,
            Select: input.select,
        };
        return queryInput;
    }
    async query(filters, input) {
        if (!lodash_1.has(filters, this.metadata.hash.propertyName)) {
            throw new errors_1.QueryError('Cannot perform a query on the PrimaryKey index without specifying a hash key value');
        }
        else if (lodash_1.isArray(lodash_1.get(filters, this.metadata.hash.propertyName)) && lodash_1.get(filters, this.metadata.hash.propertyName)[0] !== '=') {
            throw new errors_1.QueryError('DynamoDB only supports using equal operator for the HASH key');
        }
        const queryInput = this.getQueryInput(input);
        const hasProjection = queryInput.ProjectionExpression == null;
        const expression = expression_1.buildQueryExpression(this.table.schema, filters, this.metadata);
        queryInput.FilterExpression = expression.FilterExpression;
        queryInput.KeyConditionExpression = expression.KeyConditionExpression;
        queryInput.ExpressionAttributeNames = expression.ExpressionAttributeNames;
        queryInput.ExpressionAttributeValues = expression.ExpressionAttributeValues;
        const output = await this.table.schema.dynamo.query(queryInput).promise();
        return output_1.QueryOutput.fromDynamoOutput(this.table, output, hasProjection);
    }
    getScanInput(input = {}, filters) {
        const scanInput = {
            TableName: this.table.schema.name,
            Limit: input.limit,
            ExclusiveStartKey: input.exclusiveStartKey,
            ReturnConsumedCapacity: 'TOTAL',
            TotalSegments: input.totalSegments,
            Segment: input.segment,
        };
        if (input.attributes != null && input.projectionExpression == null) {
            const expression = projection_expression_1.buildProjectionExpression(this.table, input.attributes);
            scanInput.ProjectionExpression = expression.ProjectionExpression;
            scanInput.ExpressionAttributeNames = expression.ExpressionAttributeNames;
        }
        else if (input.projectionExpression != null) {
            scanInput.ProjectionExpression = input.projectionExpression;
            scanInput.ExpressionAttributeNames = input.expressionAttributeNames;
        }
        if (filters != null && Object.keys(filters).length > 0) {
            // don't pass the index metadata, avoids KeyConditionExpression
            const expression = expression_1.buildQueryExpression(this.table.schema, filters);
            scanInput.FilterExpression = expression.FilterExpression;
            scanInput.ExpressionAttributeValues = expression.ExpressionAttributeValues;
            if (scanInput.ExpressionAttributeNames == null) {
                scanInput.ExpressionAttributeNames = expression.ExpressionAttributeNames;
            }
            else {
                Object.assign(scanInput.ExpressionAttributeNames, expression.ExpressionAttributeNames);
            }
        }
        return scanInput;
    }
    async scan(filters, input) {
        const scanInput = this.getScanInput(input, filters == null ? undefined : filters);
        const output = await this.table.schema.dynamo.scan(scanInput).promise();
        const hasProjection = scanInput.ProjectionExpression == null;
        return output_1.QueryOutput.fromDynamoOutput(this.table, output, hasProjection);
    }
    /**
     * Query DynamoDB for what you need.
     *
     * Starts a MagicSearch using this GlobalSecondaryIndex.
     */
    search(filters, input = {}) {
        return new search_1.MagicSearch(this.table, filters, input).using(this);
    }
    fromKey(hash, range) {
        // if the hash was passed a query filters, then extract the hash and range
        if (lodash_1.isObject(hash) && !lodash_1.isDate(hash)) {
            const filters = hash;
            if (!lodash_1.has(filters, this.metadata.hash.propertyName)) {
                throw new errors_1.QueryError('Cannot perform .get() on a PrimaryKey without specifying a hash key value');
            }
            else if (this.metadata.range != null && !lodash_1.has(filters, this.metadata.range.propertyName)) {
                throw new errors_1.QueryError('Cannot perform .get() on a PrimaryKey with a range key without specifying a range value');
            }
            else if (Object.keys(filters).length > 2) {
                throw new errors_1.QueryError('Cannot perform a .get() on a PrimaryKey with additional filters, use .query() instead');
            }
            hash = lodash_1.get(filters, this.metadata.hash.propertyName);
            if (lodash_1.isArray(hash)) {
                if (hash[0] === '=') {
                    hash = hash[1];
                }
                else {
                    throw new errors_1.QueryError('DynamoDB only supports using equal operator for the HASH key');
                }
            }
            if (this.metadata.range != null) {
                range = lodash_1.get(filters, this.metadata.range.propertyName);
                if (lodash_1.isArray(hash)) {
                    if (hash[0] === '=') {
                        hash = hash[1];
                    }
                    else {
                        throw new errors_1.QueryError('DynamoDB only supports using equal operator for the RANGE key on GetItem operations');
                    }
                }
            }
        }
        if (this.metadata.range != null && range == null) {
            throw new errors_1.QueryError('Cannot use primaryKey.get without a range key value');
        }
        const keyMap = {
            [this.metadata.hash.name]: this.metadata.hash.toDynamoAssert(hash),
        };
        if (this.metadata.range != null) {
            keyMap[this.metadata.range.name] = this.metadata.range.toDynamoAssert(range);
        }
        return this.table.fromDynamo(keyMap, false);
    }
    /**
     * This will create a temporary Table instance, then calls record.fromJSON() passing your requested changes.
     * record.fromJSON() handles setting and deleting attributes.
     *
     * It then has the Table.Schema build the DynamoDB.UpdateItemInput with all the requested changes.
     */
    async update(input) {
        return await this.fromKey(input.hash, input.range).fromJSON(input.changes).save(input.conditions);
    }
}
exports.PrimaryKey = PrimaryKey;
//# sourceMappingURL=primary-key.js.map