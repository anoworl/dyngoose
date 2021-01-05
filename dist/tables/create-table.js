"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTable = void 0;
async function createTable(schema, waitForReady = true) {
    const res = await schema.dynamo.createTable(schema.createTableInput()).promise();
    if (waitForReady) {
        await schema.dynamo.waitFor('tableExists', { TableName: schema.name }).promise();
        // TTL
        if (schema.timeToLiveAttribute != null) {
            await schema.dynamo.updateTimeToLive({
                TableName: schema.name,
                TimeToLiveSpecification: {
                    Enabled: true,
                    AttributeName: schema.timeToLiveAttribute.name,
                },
            }).promise();
        }
    }
    return res.TableDescription;
}
exports.createTable = createTable;
//# sourceMappingURL=create-table.js.map