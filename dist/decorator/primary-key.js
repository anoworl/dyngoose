"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrimaryKey = void 0;
function PrimaryKey(hashKey, rangeKey) {
    return (tableClass, propertyKey) => {
        tableClass.schema.setPrimaryKey(hashKey, rangeKey, propertyKey);
    };
}
exports.PrimaryKey = PrimaryKey;
//# sourceMappingURL=primary-key.js.map