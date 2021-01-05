"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.batchWrite = void 0;
const _ = require("lodash");
// this is limit of dynamoDB
const MAX_ITEMS = 25;
async function batchWrite(documentClient, requests) {
    const results = await Promise.all(_.chunk(requests, MAX_ITEMS).map(async (chunk) => {
        const mergedMap = {};
        for (const requestMap of chunk) {
            for (const tableName of Object.keys(requestMap)) {
                const request = requestMap[tableName];
                if (mergedMap[tableName] == null) {
                    mergedMap[tableName] = request;
                }
                else {
                    mergedMap[tableName] = mergedMap[tableName].concat(request);
                }
            }
        }
        const res = await documentClient.batchWriteItem({ RequestItems: mergedMap }).promise();
        return res;
    }));
    // merge together the outputs to unify the UnprocessedItems into a single output array
    const output = {};
    for (const result of results) {
        if (result.UnprocessedItems != null) {
            if (output.UnprocessedItems == null) {
                output.UnprocessedItems = {};
            }
            for (const tableName of Object.keys(result.UnprocessedItems)) {
                if (output.UnprocessedItems[tableName] == null) {
                    output.UnprocessedItems[tableName] = [];
                }
                output.UnprocessedItems[tableName] = output.UnprocessedItems[tableName].concat(result.UnprocessedItems[tableName]);
            }
        }
    }
    return output;
}
exports.batchWrite = batchWrite;
//# sourceMappingURL=batch-write.js.map