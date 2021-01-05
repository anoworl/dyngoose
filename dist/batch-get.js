"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatchGet = void 0;
const lodash_1 = require("lodash");
const config_1 = require("./config");
const projection_expression_1 = require("./query/projection-expression");
class BatchGet {
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
    constructor(connection) {
        this.items = [];
        this.projectionMap = new Map();
        this.atomicity = false;
        this.dynamo = connection == null ? config_1.default.defaultConnection.client : connection;
    }
    setConnection(dynamo) {
        this.dynamo = dynamo;
        return this;
    }
    atomic() {
        this.atomicity = true;
        return this;
    }
    nonAtomic() {
        this.atomicity = false;
        return this;
    }
    get(...records) {
        this.items.push(...records);
        return this;
    }
    /**
     * By default, DynamoDB will retrieve the entire item during a BatchGet.
     * That can rapidly become a lot of data.
     *
     * To be more selective, you can specify which attributes you'd like to retrieve
     * from DynamoDB by specifying them. Dyngoose will turn your specified list into
     * a ProjectionExpression automatically.
    */
    getSpecificAttributes(tableClass, ...attributes) {
        this.projectionMap.set(tableClass, attributes);
        return this;
    }
    async retrieve() {
        const chunkSize = this.atomicity ? BatchGet.MAX_TRANSACT_ITEMS : BatchGet.MAX_BATCH_ITEMS;
        return await Promise.all(lodash_1.chunk(this.items, chunkSize).map(async (chunkedItems) => {
            const requestMap = {};
            const transactItems = [];
            for (const item of chunkedItems) {
                const tableClass = item.constructor;
                const attributes = this.projectionMap.get(tableClass);
                const expression = attributes == null ? null : projection_expression_1.buildProjectionExpression(tableClass, attributes);
                if (this.atomicity) {
                    const transactItem = {
                        Key: item.getDynamoKey(),
                        TableName: tableClass.schema.name,
                    };
                    if (expression != null) {
                        transactItem.ProjectionExpression = expression.ProjectionExpression;
                        transactItem.ExpressionAttributeNames = expression.ExpressionAttributeNames;
                    }
                    transactItems.push({
                        Get: transactItem,
                    });
                }
                else {
                    if (requestMap[tableClass.schema.name] == null) {
                        requestMap[tableClass.schema.name] = {
                            Keys: [],
                        };
                    }
                    requestMap[tableClass.schema.name].Keys.push(item.getDynamoKey());
                    if (expression != null) {
                        requestMap[tableClass.schema.name].ProjectionExpression = expression.ProjectionExpression;
                        requestMap[tableClass.schema.name].ExpressionAttributeNames = expression.ExpressionAttributeNames;
                    }
                }
            }
            let output;
            if (this.atomicity) {
                output = await this.dynamo.transactGetItems({
                    TransactItems: transactItems,
                }).promise();
            }
            else {
                output = await this.dynamo.batchGetItem({
                    RequestItems: requestMap,
                }).promise();
            }
            const responses = output.Responses == null ? [] : output.Responses;
            if (responses.length === 0) {
                return [];
            }
            const items = chunkedItems.map((item) => {
                const tableClass = item.constructor;
                const key = item.getDynamoKey();
                let attributeMap;
                if (lodash_1.isArray(responses)) {
                    const itemResponse = responses.find((record) => {
                        if (record.Item == null) {
                            return false;
                        }
                        for (const keyName of Object.keys(key)) {
                            if (!lodash_1.isEqual(record.Item[keyName], key[keyName])) {
                                return false;
                            }
                        }
                        return true;
                    });
                    if ((itemResponse === null || itemResponse === void 0 ? void 0 : itemResponse.Item) != null) {
                        attributeMap = itemResponse === null || itemResponse === void 0 ? void 0 : itemResponse.Item;
                    }
                }
                else {
                    const records = responses[tableClass.schema.name];
                    attributeMap = records.find((record) => {
                        for (const keyName of Object.keys(key)) {
                            if (!lodash_1.isEqual(record[keyName], key[keyName])) {
                                return false;
                            }
                        }
                        return true;
                    });
                }
                if (attributeMap == null) {
                    return null;
                }
                else {
                    item.fromDynamo(attributeMap);
                    return item;
                }
            });
            return lodash_1.filter(items);
        })).then((chunks) => {
            return lodash_1.filter(lodash_1.flatten(chunks));
        });
    }
    async retrieveMapped() {
        const items = await this.retrieve();
        const map = new Map();
        for (const item of items) {
            const tableClass = item.constructor;
            let tableItems = map.get(tableClass);
            if (tableItems == null) {
                tableItems = [];
            }
            tableItems.push(item);
            map.set(tableClass, tableItems);
        }
        return map;
    }
}
exports.BatchGet = BatchGet;
BatchGet.MAX_BATCH_ITEMS = 100;
BatchGet.MAX_TRANSACT_ITEMS = 25;
//# sourceMappingURL=batch-get.js.map