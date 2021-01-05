"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalSecondaryIndex = void 0;
const lodash_1 = require("lodash");
const errors_1 = require("../errors");
const expression_1 = require("./expression");
const output_1 = require("./output");
const search_1 = require("./search");
class LocalSecondaryIndex {
    constructor(tableClass, metadata) {
        this.tableClass = tableClass;
        this.metadata = metadata;
    }
    getQueryInput(input = {}) {
        if (input.rangeOrder == null) {
            input.rangeOrder = 'ASC';
        }
        const ScanIndexForward = input.rangeOrder === 'ASC';
        const queryInput = {
            TableName: this.tableClass.schema.name,
            IndexName: this.metadata.name,
            Limit: input.limit,
            ScanIndexForward,
            ExclusiveStartKey: input.exclusiveStartKey,
            ReturnConsumedCapacity: 'TOTAL',
            ConsistentRead: input.consistent,
        };
        return queryInput;
    }
    async query(filters, input = {}) {
        if (!lodash_1.has(filters, this.tableClass.schema.primaryKey.hash.propertyName)) {
            throw new errors_1.QueryError('Cannot perform a query on a LocalSecondaryIndex without specifying a hash key value');
        }
        const queryInput = this.getQueryInput(input);
        // convert the LocalSecondaryIndex metadata to a GlobalSecondaryIndex, which just adds the hash property
        const metadata = Object.assign({
            hash: this.tableClass.schema.primaryKey.hash,
        }, this.metadata);
        const expression = expression_1.buildQueryExpression(this.tableClass.schema, filters, metadata);
        queryInput.FilterExpression = expression.FilterExpression;
        queryInput.KeyConditionExpression = expression.KeyConditionExpression;
        queryInput.ExpressionAttributeNames = expression.ExpressionAttributeNames;
        queryInput.ExpressionAttributeValues = expression.ExpressionAttributeValues;
        const hasProjection = queryInput.ProjectionExpression == null;
        const output = await this.tableClass.schema.dynamo.query(queryInput).promise();
        return output_1.QueryOutput.fromDynamoOutput(this.tableClass, output, hasProjection);
    }
    getScanInput(input = {}) {
        const scanInput = {
            TableName: this.tableClass.schema.name,
            IndexName: this.metadata.name,
            Limit: input.limit,
            ExclusiveStartKey: input.exclusiveStartKey,
            ReturnConsumedCapacity: 'TOTAL',
            TotalSegments: input.totalSegments,
            Segment: input.segment,
        };
        return scanInput;
    }
    async scan(filters, input = {}) {
        const scanInput = this.getScanInput(input);
        if (filters != null && Object.keys(filters).length > 0) {
            // don't pass the index metadata, avoids KeyConditionExpression
            const expression = expression_1.buildQueryExpression(this.tableClass.schema, filters);
            scanInput.FilterExpression = expression.FilterExpression;
            scanInput.ExpressionAttributeNames = expression.ExpressionAttributeNames;
            scanInput.ExpressionAttributeValues = expression.ExpressionAttributeValues;
        }
        const hasProjection = scanInput.ProjectionExpression == null;
        const output = await this.tableClass.schema.dynamo.scan(scanInput).promise();
        return output_1.QueryOutput.fromDynamoOutput(this.tableClass, output, hasProjection);
    }
    /**
     * Query DynamoDB for what you need.
     *
     * Starts a MagicSearch using this LocalSecondaryIndex.
     */
    search(filters, input = {}) {
        return new search_1.MagicSearch(this.tableClass, filters, input).using(this);
    }
}
exports.LocalSecondaryIndex = LocalSecondaryIndex;
//# sourceMappingURL=local-secondary-index.js.map