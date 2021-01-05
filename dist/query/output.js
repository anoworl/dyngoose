"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryOutput = void 0;
class QueryOutput extends Array {
    constructor(records, tableClass) {
        super(records.length);
        this.tableClass = tableClass;
        for (let i = 0; i < records.length; i++) {
            this[i] = records[i];
        }
    }
    static fromDynamoOutput(tableClass, output, hasProjection) {
        const items = [];
        if (output.Items != null) {
            for (const item of output.Items) {
                items.push(tableClass.fromDynamo(item, !hasProjection));
            }
        }
        const queryOutput = new QueryOutput(items, tableClass);
        queryOutput.count = output.Count == null ? items.length : output.Count;
        queryOutput.scannedCount = output.ScannedCount;
        queryOutput.lastEvaluatedKey = output.LastEvaluatedKey;
        queryOutput.consumedCapacity = output.ConsumedCapacity;
        return queryOutput;
    }
    static fromSeveralOutputs(tableClass, outputs) {
        let count = 0;
        let scannedCount = 0;
        let capacityUnits = 0;
        let writeCapacityUnits = 0;
        let readCapacityUnits = 0;
        let items = [];
        // if this is the first page, or if we have not hit the last page, continue loading records…
        for (const output of outputs) {
            // append the query results
            items = items.concat(output);
            count += output.count;
            if (output.scannedCount != null) {
                scannedCount += output.scannedCount;
            }
            if (output.consumedCapacity != null) {
                if (output.consumedCapacity.CapacityUnits != null) {
                    capacityUnits += output.consumedCapacity.CapacityUnits;
                }
                if (output.consumedCapacity.WriteCapacityUnits != null) {
                    writeCapacityUnits += output.consumedCapacity.WriteCapacityUnits;
                }
                if (output.consumedCapacity.ReadCapacityUnits != null) {
                    readCapacityUnits += output.consumedCapacity.ReadCapacityUnits;
                }
            }
        }
        const queryOutput = new QueryOutput(items, tableClass);
        queryOutput.count = count;
        queryOutput.scannedCount = scannedCount;
        queryOutput.consumedCapacity = {
            CapacityUnits: capacityUnits,
            WriteCapacityUnits: writeCapacityUnits,
            ReadCapacityUnits: readCapacityUnits,
        };
        // pass the lastEvaluatedKey from the last output, so paging could continue
        const last = outputs[outputs.length - 1];
        if (last != null) {
            queryOutput.lastEvaluatedKey = last.lastEvaluatedKey;
        }
        return queryOutput;
    }
    /**
     * The items returned from DynamoDB
     *
     * @deprecated
     */
    get records() {
        return this;
    }
}
exports.QueryOutput = QueryOutput;
//# sourceMappingURL=output.js.map