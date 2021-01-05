"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.describeTable = void 0;
async function describeTable(schema) {
    const params = {
        TableName: schema.name,
    };
    const result = await schema.dynamo.describeTable(params).promise();
    return result.Table;
}
exports.describeTable = describeTable;
//# sourceMappingURL=describe-table.js.map