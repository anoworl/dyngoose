"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalSecondaryIndex = void 0;
const lodash_1 = require("lodash");
const errors_1 = require("../errors");
function GlobalSecondaryIndex(options) {
    return (table, propertyName) => {
        let throughput;
        if (typeof options.throughput === 'number') {
            throughput = {
                read: options.throughput,
                write: options.throughput,
            };
        }
        else if (options.throughput != null) {
            throughput = options.throughput;
        }
        if (options.projection === 'INCLUDE') {
            if (options.nonKeyAttributes == null || options.nonKeyAttributes.length === 0) {
                throw new errors_1.SchemaError('If Projection type INCLUDE is specified, some non-key attributes to include in the projection must be specified as well');
            }
            // 1. verify each attribute specified in nonKeyAttributes exists on the table
            // 2. remove the key attributes from nonKeyAttributes, as that causes problems
            // 3. remove duplicates as well
            options.nonKeyAttributes = lodash_1.uniq(options.nonKeyAttributes.filter((attributeName) => {
                // throws a SchemaError if the attribute does not exist
                table.schema.getAttributeByName(attributeName);
                // remove the attribute if it is a key attribute, as it is not necessary to be specified
                return !(attributeName === options.hashKey || attributeName === options.rangeKey);
            }));
        }
        const index = {
            propertyName,
            name: options.name == null ? propertyName : options.name,
            hash: table.schema.getAttributeByName(options.hashKey),
            range: options.rangeKey == null ? undefined : table.schema.getAttributeByName(options.rangeKey),
            projection: options.projection,
            nonKeyAttributes: options.nonKeyAttributes,
            throughput,
        };
        table.schema.globalSecondaryIndexes.push(index);
    };
}
exports.GlobalSecondaryIndex = GlobalSecondaryIndex;
//# sourceMappingURL=global-secondary-index.js.map