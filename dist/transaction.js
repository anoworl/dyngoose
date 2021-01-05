"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = void 0;
const config_1 = require("./config");
const expression_1 = require("./query/expression");
const transact_write_1 = require("./query/transact-write");
const update_item_input_1 = require("./query/update-item-input");
class Transaction {
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
    constructor(connection) {
        this.list = [];
        this.dynamo = connection == null ? config_1.default.defaultConnection.client : connection;
    }
    setConnection(dynamo) {
        this.dynamo = dynamo;
        return this;
    }
    /**
     * Add a record to be saved to this transaction.
     *
     * If the record already exists, Dyngoose will automatically use `.update()` to only
     * transmit the updated values of the record. It is highly recommended you specify
     * update conditions when updating existing items.
    */
    save(record, conditions) {
        if (record.getSaveOperation() === 'put') {
            return this.put(record, conditions);
        }
        else {
            return this.update(record, conditions);
        }
    }
    put(record, conditions) {
        const tableClass = record.constructor;
        const put = {
            TableName: tableClass.schema.name,
            Item: record.toDynamo(),
        };
        if (conditions != null) {
            const conditionExpression = expression_1.buildQueryExpression(tableClass.schema, conditions);
            put.ConditionExpression = conditionExpression.FilterExpression;
            put.ExpressionAttributeNames = conditionExpression.ExpressionAttributeNames;
            put.ExpressionAttributeValues = conditionExpression.ExpressionAttributeValues;
        }
        this.list.push({
            Put: put,
        });
        return this;
    }
    update(record, conditions) {
        const tableClass = record.constructor;
        const updateInput = update_item_input_1.getUpdateItemInput(record, conditions);
        this.list.push({
            Update: {
                TableName: tableClass.schema.name,
                Key: updateInput.Key,
                UpdateExpression: updateInput.UpdateExpression,
                ConditionExpression: updateInput.ConditionExpression,
                ExpressionAttributeNames: updateInput.ExpressionAttributeNames,
                ExpressionAttributeValues: updateInput.ExpressionAttributeValues,
            },
        });
        return this;
    }
    delete(record, conditions) {
        const tableClass = record.constructor;
        const del = {
            TableName: tableClass.schema.name,
            Key: record.getDynamoKey(),
        };
        if (conditions != null) {
            const conditionExpression = expression_1.buildQueryExpression(tableClass.schema, conditions);
            del.ConditionExpression = conditionExpression.FilterExpression;
            del.ExpressionAttributeNames = conditionExpression.ExpressionAttributeNames;
            del.ExpressionAttributeValues = conditionExpression.ExpressionAttributeValues;
        }
        this.list.push({
            Delete: del,
        });
        return this;
    }
    conditionCheck(record, conditions) {
        const tableClass = record.constructor;
        const conditionExpression = expression_1.buildQueryExpression(tableClass.schema, conditions);
        this.list.push({
            ConditionCheck: {
                TableName: tableClass.schema.name,
                Key: record.getDynamoKey(),
                ConditionExpression: conditionExpression.FilterExpression,
                ExpressionAttributeNames: conditionExpression.ExpressionAttributeNames,
                ExpressionAttributeValues: conditionExpression.ExpressionAttributeValues,
            },
        });
        return this;
    }
    async commit() {
        return await transact_write_1.transactWrite(this.dynamo, this.list);
    }
}
exports.Transaction = Transaction;
//# sourceMappingURL=transaction.js.map