"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentClient = void 0;
const batch_write_1 = require("./query/batch-write");
const expression_1 = require("./query/expression");
const transact_write_1 = require("./query/transact-write");
const update_item_input_1 = require("./query/update-item-input");
class DocumentClient {
    constructor(tableClass) {
        this.tableClass = tableClass;
    }
    getPutInput(record, conditions) {
        const input = {
            TableName: this.tableClass.schema.name,
            Item: record.toDynamo(),
        };
        if (conditions != null) {
            const conditionExpression = expression_1.buildQueryExpression(this.tableClass.schema, conditions);
            input.ConditionExpression = conditionExpression.FilterExpression;
            input.ExpressionAttributeNames = conditionExpression.ExpressionAttributeNames;
            input.ExpressionAttributeValues = conditionExpression.ExpressionAttributeValues;
        }
        return input;
    }
    async put(record, conditions) {
        const input = this.getPutInput(record, conditions);
        const output = this.tableClass.schema.dynamo.putItem(input).promise();
        return await output;
    }
    getUpdateInput(record, conditions) {
        return update_item_input_1.getUpdateItemInput(record, conditions);
    }
    async update(record, conditions) {
        const input = this.getUpdateInput(record, conditions);
        const output = this.tableClass.schema.dynamo.updateItem(input).promise();
        return await output;
    }
    async batchPut(records) {
        return await batch_write_1.batchWrite(this.tableClass.schema.dynamo, records.map((record) => {
            const request = {
                [this.tableClass.schema.name]: [
                    {
                        PutRequest: {
                            Item: record.toDynamo(),
                        },
                    },
                ],
            };
            return request;
        }));
    }
    getDeleteInput(record, conditions) {
        const input = {
            TableName: this.tableClass.schema.name,
            Key: record.getDynamoKey(),
        };
        if (conditions != null) {
            const conditionExpression = expression_1.buildQueryExpression(this.tableClass.schema, conditions);
            input.ConditionExpression = conditionExpression.FilterExpression;
            input.ExpressionAttributeNames = conditionExpression.ExpressionAttributeNames;
            input.ExpressionAttributeValues = conditionExpression.ExpressionAttributeValues;
        }
        return input;
    }
    async transactPut(records) {
        return await transact_write_1.transactWrite(this.tableClass.schema.dynamo, records.map((record) => {
            const writeRequest = {
                Put: {
                    TableName: this.tableClass.schema.name,
                    Item: record.toDynamo(),
                },
            };
            return writeRequest;
        }));
    }
    async delete(record, conditions) {
        return await new Promise((resolve, reject) => {
            const input = this.getDeleteInput(record, conditions);
            this.tableClass.schema.dynamo.deleteItem(input, (err, output) => {
                if (err != null) {
                    reject(err);
                }
                else {
                    resolve(output);
                }
            });
        });
    }
}
exports.DocumentClient = DocumentClient;
//# sourceMappingURL=document-client.js.map