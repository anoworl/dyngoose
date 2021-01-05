"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentClient = void 0;
function DocumentClient() {
    return (tableClass, propertyKey) => {
        Object.defineProperty(tableClass, propertyKey, {
            value: tableClass.documentClient,
            writable: false,
        });
    };
}
exports.DocumentClient = DocumentClient;
//# sourceMappingURL=document-client.js.map