"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTable = void 0;
async function deleteTable(schema) {
    const res = await schema.dynamo.deleteTable({ TableName: schema.name }).promise();
    return res.TableDescription;
}
exports.deleteTable = deleteTable;
//# sourceMappingURL=delete-table.js.map