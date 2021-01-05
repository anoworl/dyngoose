"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalSecondaryIndex = void 0;
const errors_1 = require("../errors");
function LocalSecondaryIndex(rangeKeyName, options = {}) {
    return (tableClass, propertyName) => {
        const range = tableClass.schema.getAttributeByName(rangeKeyName);
        if (range == null) {
            const attributes = tableClass.schema.getAttributes();
            const attributeNames = Object.keys(attributes);
            throw new errors_1.SchemaError(`Given hashKey "${rangeKeyName}" is not declared as attribute on table "${tableClass.schema.name}", known attributes are: ${attributeNames.join(', ')}`);
        }
        tableClass.schema.localSecondaryIndexes.push({
            name: options.name == null ? propertyName : options.name,
            propertyName,
            range,
        });
    };
}
exports.LocalSecondaryIndex = LocalSecondaryIndex;
//# sourceMappingURL=local-secondary-index.js.map