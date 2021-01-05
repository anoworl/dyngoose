"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactWrite = void 0;
const _ = require("lodash");
// this is limit of dynamoDB
const MAX_ITEMS = 25;
async function transactWrite(documentClient, requests) {
    await Promise.all(_.chunk(requests, MAX_ITEMS).map(async (chunk) => {
        const res = await documentClient.transactWriteItems({
            TransactItems: [...chunk],
        }).promise();
        return res;
    }));
    // there is nothing to merge because we do not ask for ConsumedCapacity or ItemCollectionMetrics
    const output = {};
    return output;
}
exports.transactWrite = transactWrite;
//# sourceMappingURL=transact-write.js.map