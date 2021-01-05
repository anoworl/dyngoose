"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalSecondaryIndex = void 0;
const lodash_1 = require("lodash");
const errors_1 = require("../errors");
const expression_1 = require("./expression");
const output_1 = require("./output");
const projection_expression_1 = require("./projection-expression");
const search_1 = require("./search");
class GlobalSecondaryIndex {
    constructor(tableClass, metadata) {
        this.tableClass = tableClass;
        this.metadata = metadata;
    }
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
    async get(filters, input = {}) {
        if (!lodash_1.has(filters, this.metadata.hash.propertyName)) {
            throw new errors_1.QueryError('Cannot perform .get() on a GlobalSecondaryIndex without specifying a hash key value');
        }
        else if (this.metadata.range != null && !lodash_1.has(filters, this.metadata.range.propertyName)) {
            throw new errors_1.QueryError('Cannot perform .get() on a GlobalSecondaryIndex with a range key without specifying a range value');
        }
        else if (Object.keys(filters).length > 2) {
            throw new errors_1.QueryError('Cannot perform a .get() on a GlobalSecondaryIndex with additional filters, use .query() instead');
        }
        input.limit = 1;
        // because you are specifying the hashKey and rangeKey, we can apply a limit to this search
        // DynamoDB will start the search at the first match and limit means it will only process
        // that document and return it, however, you cannot use any additional filters on this .get
        // method; for that, you need to use .query()
        const results = await this.query(filters, input);
        if (results.count > 0) {
            return results[0];
        }
    }
    getQueryInput(input = {}, filters) {
        if (input.rangeOrder == null) {
            input.rangeOrder = 'ASC';
        }
        const ScanIndexForward = input.rangeOrder === 'ASC';
        const queryInput = {
            TableName: this.tableClass.schema.name,
            Limit: input.limit,
            IndexName: this.metadata.name,
            ScanIndexForward,
            ExclusiveStartKey: input.exclusiveStartKey,
            ReturnConsumedCapacity: 'TOTAL',
        };
        if (input.select === 'COUNT') {
            queryInput.Select = 'COUNT';
        }
        if (input.attributes != null && input.projectionExpression == null) {
            const expression = projection_expression_1.buildProjectionExpression(this.tableClass, input.attributes);
            queryInput.Select = 'SPECIFIC_ATTRIBUTES';
            queryInput.ProjectionExpression = expression.ProjectionExpression;
            queryInput.ExpressionAttributeNames = expression.ExpressionAttributeNames;
        }
        else if (input.projectionExpression != null) {
            queryInput.Select = 'SPECIFIC_ATTRIBUTES';
            queryInput.ProjectionExpression = input.projectionExpression;
            queryInput.ExpressionAttributeNames = input.expressionAttributeNames;
        }
        if (filters != null && Object.keys(filters).length > 0) {
            const expression = expression_1.buildQueryExpression(this.tableClass.schema, filters, this.metadata);
            queryInput.FilterExpression = expression.FilterExpression;
            queryInput.KeyConditionExpression = expression.KeyConditionExpression;
            queryInput.ExpressionAttributeValues = expression.ExpressionAttributeValues;
            if (queryInput.ExpressionAttributeNames == null) {
                queryInput.ExpressionAttributeNames = expression.ExpressionAttributeNames;
            }
            else {
                Object.assign(queryInput.ExpressionAttributeNames, expression.ExpressionAttributeNames);
            }
        }
        return queryInput;
    }
    async query(filters, input) {
        if (!lodash_1.has(filters, this.metadata.hash.propertyName)) {
            throw new errors_1.QueryError('Cannot perform a query on a GlobalSecondaryIndex without specifying a hash key value');
        }
        else if (lodash_1.isArray(lodash_1.get(filters, this.metadata.hash.propertyName)) && lodash_1.get(filters, this.metadata.hash.propertyName)[0] !== '=') {
            throw new errors_1.QueryError('DynamoDB only supports using equal operator for the HASH key');
        }
        const queryInput = this.getQueryInput(input, filters);
        const hasProjection = queryInput.ProjectionExpression == null;
        const output = await this.tableClass.schema.dynamo.query(queryInput).promise();
        return output_1.QueryOutput.fromDynamoOutput(this.tableClass, output, hasProjection);
    }
    getScanInput(input = {}, filters) {
        const scanInput = {
            TableName: this.tableClass.schema.name,
            IndexName: this.metadata.name,
            Limit: input.limit,
            ExclusiveStartKey: input.exclusiveStartKey,
            ReturnConsumedCapacity: 'TOTAL',
            TotalSegments: input.totalSegments,
            Segment: input.segment,
            Select: input.select,
            ConsistentRead: input.consistent,
        };
        if (input.attributes != null && input.projectionExpression == null) {
            const expression = projection_expression_1.buildProjectionExpression(this.tableClass, input.attributes);
            scanInput.ProjectionExpression = expression.ProjectionExpression;
            scanInput.ExpressionAttributeNames = expression.ExpressionAttributeNames;
        }
        else if (input.projectionExpression != null) {
            scanInput.ProjectionExpression = input.projectionExpression;
            scanInput.ExpressionAttributeNames = input.expressionAttributeNames;
        }
        if (filters != null && Object.keys(filters).length > 0) {
            // don't pass the index metadata, avoids KeyConditionExpression
            const expression = expression_1.buildQueryExpression(this.tableClass.schema, filters);
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
    /**
     * Performs a DynamoDB Scan.
     *
     * *WARNING*: In most circumstances this is not a good thing to do.
     * This will return all the items in this index, does not perform well!
     */
    async scan(filters, input = {}) {
        const scanInput = this.getScanInput(input, filters == null ? undefined : filters);
        const hasProjection = scanInput.ProjectionExpression == null;
        const output = await this.tableClass.schema.dynamo.scan(scanInput).promise();
        return output_1.QueryOutput.fromDynamoOutput(this.tableClass, output, hasProjection);
    }
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
    async segmentedScan(filters, input) {
        const scans = [];
        for (let i = 0; i < input.totalSegments; i++) {
            input.segment = i;
            scans.push(this.scan(filters, input));
        }
        const scanOutputs = await Promise.all(scans);
        const output = output_1.QueryOutput.fromSeveralOutputs(this.tableClass, scanOutputs);
        return output;
    }
    /**
     * Query DynamoDB for what you need.
     *
     * Starts a MagicSearch using this GlobalSecondaryIndex.
     */
    search(filters, input = {}) {
        return new search_1.MagicSearch(this.tableClass, filters, input).using(this);
    }
}
exports.GlobalSecondaryIndex = GlobalSecondaryIndex;
//# sourceMappingURL=global-secondary-index.js.map