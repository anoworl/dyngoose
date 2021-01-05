"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MagicSearch = void 0;
const lodash_1 = require("lodash");
const errors_1 = require("../errors");
const condition_1 = require("./condition");
const expression_1 = require("./expression");
const output_1 = require("./output");
const projection_expression_1 = require("./projection-expression");
/**
 * Use this via Table.search()
 */
class MagicSearch {
    constructor(tableClass, filters, input = {}) {
        this.tableClass = tableClass;
        this.input = input;
        this.filters = [];
        if (filters != null) {
            this.addFilterGroup([filters]);
        }
    }
    addFilterGroup(filters) {
        this.filters = this.filters.concat(filters);
        return this;
    }
    parenthesis(value) {
        return this.group(value);
    }
    group(value) {
        const groupedSearch = new MagicSearch(this.tableClass);
        value(groupedSearch);
        this.filters.push(groupedSearch.filters);
        return this;
    }
    filter(...attributePropertyPath) {
        return new condition_1.Condition(this, attributePropertyPath.join('.'));
    }
    where(...attributePropertyPath) {
        return new condition_1.Condition(this, attributePropertyPath.join('.'));
    }
    or() {
        this.filters.push('OR');
        return this;
    }
    and() {
        return this;
    }
    /**
     * This function will limit the number of documents that DynamoDB will process in this query request.
     *
     * Unlike most SQL databases this does not guarantee the response will contain 5 documents.
     * Instead DynamoDB will only query a maximum of 5 documents to see if they match and should be returned.
     * The limit parameter passed in should be a number representing how many documents you wish DynamoDB to process.
     */
    limit(limit) {
        this.input.limit = limit;
        return this;
    }
    /**
     * When there are more documents available to your query than DynamoDB can return,
     * Dyngoose will let you know by specifying Results.lastEvaluatedKey.
     *
     * You can pass that object into this method to get additional results from your table.
     */
    startAt(exclusiveStartKey) {
        this.input.exclusiveStartKey = exclusiveStartKey;
        return this;
    }
    /**
     * This function will limit which attributes DynamoDB returns for each item in the table
     * by building a ProjectionExpression for you.
     *
     * This can limit the size of the DynamoDB response and helps you only retrieve the data you need.
     * Simply provide an array of strings representing the property names you wish DynamoDB to return.
     */
    properties(...propertyNames) {
        const attributeNames = [];
        for (const propertyName of propertyNames) {
            const attr = this.tableClass.schema.getAttributeByPropertyName(propertyName);
            attributeNames.push(attr.name);
        }
        if (this.input.attributes == null) {
            this.input.attributes = [];
        }
        this.input.attributes = this.input.attributes.concat(attributeNames);
        return this;
    }
    /**
     * This is similar to `.properties()` except it accepts a list of attribute names
     * instead of property names.
    */
    attributes(...attributeNames) {
        if (this.input.attributes == null) {
            this.input.attributes = [];
        }
        this.input.attributes = this.input.attributes.concat(attributeNames);
        return this;
    }
    /**
     * Instead of returning the records, this function will cause the query operation to return only the count of possible results.
     */
    count() {
        this.input.returnOnlyCount = true;
        return this;
    }
    /**
     * This will cause the query to run in a consistent manner as opposed to the default eventually consistent manner.
     */
    consistent(consistent = true) {
        this.input.consistent = consistent;
        return this;
    }
    /**
     * This causes the query to be run on a specific index as opposed to the default table wide query.
     * The index parameter you pass in should represent the name of the index you wish to query on.
     */
    using(index) {
        if (index === null) {
            this.input.index = undefined;
        }
        else {
            this.input.index = index;
        }
        return this;
    }
    /**
     * This function sorts the documents you receive back by the rangeKey. By default, if not provided, it will sort in ascending order.
     *
     * The order parameter must be a string either equal to ascending or descending.
    */
    sort(direction) {
        if (direction === 'ascending') {
            this.input.rangeOrder = 'ASC';
        }
        else if (direction === 'descending') {
            this.input.rangeOrder = 'DESC';
        }
        return this;
    }
    ascending() {
        return this.sort('ascending');
    }
    descending() {
        return this.sort('descending');
    }
    /**
     * This will execute the query you constructed and return one page of results.
     *
     * A promise will be returned that will resolve to the results array upon completion.
     */
    async exec() {
        const input = this.getInput();
        return await this.page(input);
    }
    /**
     * This will execute the query you constructed and page, if necessary, until the
     * minimum number of requested documents is loaded.
     *
     * This can be useful if you are doing advanced queries without good indexing,
     * which should be avoided but can happen for infrequent operations such as analytics.
     *
     * Unlike `.all()` which pages until all results are loaded, `.minimum(min)` will
     * page only until the specified number of records is loaded and then halts.
     *
     * It is recommended you apply a `.limit(minOrMore)` before calling `.minimum` to ensure
     * you do not load too many results as well.
    */
    async minimum(minimum) {
        const input = this.getInput();
        const outputs = [];
        let page;
        let count = 0;
        while (page == null || page.lastEvaluatedKey != null) {
            if ((page === null || page === void 0 ? void 0 : page.lastEvaluatedKey) != null) {
                input.ExclusiveStartKey = page.lastEvaluatedKey;
            }
            page = await this.page(input);
            count += page.count;
            outputs.push(page);
            // if we've loaded enough, stop loading more…
            if (count >= minimum || page.lastEvaluatedKey == null) {
                break;
            }
        }
        return output_1.QueryOutput.fromSeveralOutputs(this.tableClass, outputs);
    }
    /**
     * Page internally and return all possible search results.
     *
     * Be cautious. This can easily cause timeouts if you're using Lambda functions.
     * This is also non-ideal for scans, for better performance use a segmented scan
     * via the Query.PrimaryKey.segmentedScan or Query.GlobalSecondaryIndex.segmentedScan.
     */
    async all() {
        const input = this.getInput();
        const outputs = [];
        let page;
        // if this is the first page, or if we have not hit the last page, continue loading records…
        while (page == null || page.lastEvaluatedKey != null) {
            if ((page === null || page === void 0 ? void 0 : page.lastEvaluatedKey) != null) {
                input.ExclusiveStartKey = page.lastEvaluatedKey;
            }
            page = await this.page(input);
            outputs.push(page);
        }
        return output_1.QueryOutput.fromSeveralOutputs(this.tableClass, outputs);
    }
    getInput() {
        let indexMetadata;
        if (this.input.index != null && typeof this.input.index === 'string') {
            const indexName = this.input.index;
            // if we were given an index, find the metadata object for it
            for (const index of this.tableClass.schema.globalSecondaryIndexes) {
                if (index.name === indexName) {
                    indexMetadata = index;
                }
            }
            if (indexMetadata == null) {
                for (const index of this.tableClass.schema.localSecondaryIndexes) {
                    if (index.name === indexName) {
                        indexMetadata = Object.assign({
                            hash: this.tableClass.schema.primaryKey.hash,
                        }, index);
                    }
                }
            }
            if (indexMetadata == null) {
                throw new errors_1.QueryError(`Attempted to perform ${this.tableClass.schema.name}.search using non-existent index ${indexName}`);
            }
        }
        else if (this.input.index != null) {
            if ((typeof this.input.index.metadata).hash === 'undefined') {
                const metadata = Object.assign({
                    hash: this.tableClass.schema.primaryKey.hash,
                }, this.input.index.metadata);
                indexMetadata = metadata;
            }
            else {
                indexMetadata = this.input.index.metadata;
            }
        }
        else {
            // if no index was specified, look to see if there is an available index given the query
            indexMetadata = this.findAvailableIndex();
        }
        const query = expression_1.buildQueryExpression(this.tableClass.schema, this.filters, indexMetadata);
        const input = {
            TableName: this.tableClass.schema.name,
            ConsistentRead: false,
            ExpressionAttributeNames: query.ExpressionAttributeNames,
            ExpressionAttributeValues: query.ExpressionAttributeValues,
            FilterExpression: query.FilterExpression,
        };
        if (this.input.projectionExpression != null) {
            input.ProjectionExpression = this.input.projectionExpression;
        }
        else if (this.input.attributes != null) {
            const expression = projection_expression_1.buildProjectionExpression(this.tableClass, this.input.attributes);
            input.Select = 'SPECIFIC_ATTRIBUTES';
            input.ProjectionExpression = expression.ProjectionExpression;
            input.ExpressionAttributeNames = expression.ExpressionAttributeNames;
        }
        if (this.input.rangeOrder === 'DESC') {
            input.ScanIndexForward = false;
        }
        if (this.input.limit != null) {
            input.Limit = this.input.limit;
        }
        if (this.input.exclusiveStartKey != null) {
            input.ExclusiveStartKey = this.input.exclusiveStartKey;
        }
        if (this.input.consistent != null) {
            input.ConsistentRead = this.input.consistent;
        }
        if (indexMetadata != null && typeof indexMetadata.name === 'string') {
            input.IndexName = indexMetadata.name;
        }
        if (this.input.returnOnlyCount === true) {
            input.Select = 'COUNT';
        }
        if (query.KeyConditionExpression != null) {
            input.KeyConditionExpression = query.KeyConditionExpression;
        }
        return input;
    }
    /**
     * @deprecated Use MagicSearch.prototype.exec()
     */
    async search() {
        return await this.exec();
    }
    async page(input) {
        const hasProjection = input.ProjectionExpression == null;
        let output;
        // if we are filtering based on key conditions, run a query instead of a scan
        if (input.KeyConditionExpression != null) {
            output = await this.tableClass.schema.dynamo.query(input).promise();
        }
        else {
            if (input.ScanIndexForward === false) {
                throw new Error('Cannot use specify a sort direction, range order, or use ScanIndexForward on a scan operation. Try specifying the index being used.');
            }
            else {
                delete input.ScanIndexForward;
            }
            output = await this.tableClass.schema.dynamo.scan(input).promise();
        }
        return output_1.QueryOutput.fromDynamoOutput(this.tableClass, output, !hasProjection);
    }
    findAvailableIndex() {
        // look at the primary key first
        const primaryKey = this.tableClass.schema.primaryKey;
        if (this.checkFilters(primaryKey.hash, primaryKey.range)) {
            return primaryKey;
        }
        // look through GlobalSecondaryIndexes
        for (const index of this.tableClass.schema.globalSecondaryIndexes) {
            // skip if it doesn't have a full projection
            if (index.projection === 'INCLUDE' || index.projection === 'KEYS_ONLY') {
                continue;
            }
            // determine if we can use this index
            if (this.checkFilters(index.hash, index.range)) {
                return index;
            }
        }
        // look through LocalSecondaryIndexes
        for (const index of this.tableClass.schema.localSecondaryIndexes) {
            // skip if it doesn't have a full projection
            if (index.projection === 'INCLUDE' || index.projection === 'KEYS_ONLY') {
                continue;
            }
            // determine if we can use this index
            if (this.checkFilters(primaryKey.hash, index.range)) {
                const metadata = Object.assign({
                    hash: primaryKey.hash,
                }, index);
                return metadata;
            }
        }
    }
    checkFilters(hash, range) {
        // cannot filter by a key without a value for the hash key
        for (const filters of this.filters) {
            if (!lodash_1.has(filters, hash.name)) {
                continue;
            }
            const hashFilter = lodash_1.get(filters, hash.name);
            // if there is an operator, ensure it is allowed as a key expression
            if (lodash_1.isArray(hashFilter)) {
                const operator = hashFilter[0];
                if (!lodash_1.includes(expression_1.keyConditionAllowedOperators, operator)) {
                    continue;
                }
            }
            // if it has no range, then we're all done
            if (range == null) {
                return true;
            }
            // check for the range now
            if (!lodash_1.has(filters, range.name)) {
                continue;
            }
            const rangeFilter = lodash_1.get(filters, range.name);
            // if there is an operator, ensure it is allowed as a key expression
            if (lodash_1.isArray(rangeFilter)) {
                const operator = rangeFilter[0];
                if (!lodash_1.includes(expression_1.keyConditionAllowedOperators, operator)) {
                    continue;
                }
            }
            return true;
        }
        return false;
    }
}
exports.MagicSearch = MagicSearch;
//# sourceMappingURL=search.js.map