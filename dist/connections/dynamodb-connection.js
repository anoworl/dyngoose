"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamoDBConnection = void 0;
/* eslint-disable @typescript-eslint/no-var-requires */
const AWS = require("aws-sdk");
const http_1 = require("http");
const https_1 = require("https");
class DynamoDBConnection {
    constructor(options) {
        options.httpOptions = {
            agent: this.httpAgent(options.endpoint),
        };
        if (options.enableAWSXray === true) {
            // Since "require" itself does something for this lib, such as logging
            // importing this only when it's needed
            const AWSXRay = require('aws-xray-sdk-core');
            const aws = AWSXRay.captureAWS(AWS);
            this.__client = new aws.DynamoDB(options);
        }
        else {
            this.__client = new AWS.DynamoDB(options);
        }
    }
    httpAgent(endpoint) {
        if ((endpoint === null || endpoint === void 0 ? void 0 : endpoint.startsWith('http://')) === true) {
            return new http_1.Agent({
                keepAlive: true,
            });
        }
        else {
            return new https_1.Agent({
                rejectUnauthorized: true,
                keepAlive: true,
            });
        }
    }
    get client() {
        return this.__client;
    }
}
exports.DynamoDBConnection = DynamoDBConnection;
//# sourceMappingURL=dynamodb-connection.js.map