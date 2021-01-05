"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const connections_1 = require("./connections");
class Config {
    static get defaultConnection() {
        if (this.__defaultConnection == null) {
            this.__defaultConnection = new connections_1.DynamoDBConnection({
                endpoint: process.env.DYNAMO_ENDPOINT,
                region: process.env.DYNAMO_REGION,
                accessKeyId: process.env.DYNAMO_ACCESS_KEY_ID,
                secretAccessKey: process.env.DYNAMO_SECRET_ACCESS_KEY,
                enableAWSXray: process.env.ENABLE_XRAY === 'true',
            });
        }
        return this.__defaultConnection;
    }
}
exports.default = Config;
//# sourceMappingURL=config.js.map