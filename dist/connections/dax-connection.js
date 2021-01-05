"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DAXConnection = void 0;
class DAXConnection {
    constructor(options) {
        const AmazonDaxClient = require('amazon-dax-client');
        this.__client = new AmazonDaxClient({
            endpoints: options.endpoints,
            requestTimeout: options.requestTimeout,
        });
    }
    get client() {
        return this.__client;
    }
}
exports.DAXConnection = DAXConnection;
//# sourceMappingURL=dax-connection.js.map