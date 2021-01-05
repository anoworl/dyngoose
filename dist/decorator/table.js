"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Table = void 0;
const config_1 = require("../config");
function Table(metadata) {
    return (table) => {
        table.schema.dynamo = metadata.connection != null ? metadata.connection : config_1.default.defaultConnection.client;
        table.schema.setMetadata(metadata);
        // setup dynamic properties
        table.schema.defineAttributeProperties();
        table.schema.defineGlobalSecondaryIndexes();
        table.schema.defineLocalSecondaryIndexes();
        table.schema.definePrimaryKeyProperty();
    };
}
exports.Table = Table;
//# sourceMappingURL=table.js.map