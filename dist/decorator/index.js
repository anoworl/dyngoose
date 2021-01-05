"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentClient = exports.PrimaryKey = exports.LocalSecondaryIndex = exports.GlobalSecondaryIndex = exports.Table = exports.Attribute = void 0;
const attribute_types_1 = require("./attribute-types");
Object.defineProperty(exports, "Attribute", { enumerable: true, get: function () { return attribute_types_1.Attribute; } });
var table_1 = require("./table");
Object.defineProperty(exports, "Table", { enumerable: true, get: function () { return table_1.Table; } });
var global_secondary_index_1 = require("./global-secondary-index");
Object.defineProperty(exports, "GlobalSecondaryIndex", { enumerable: true, get: function () { return global_secondary_index_1.GlobalSecondaryIndex; } });
var local_secondary_index_1 = require("./local-secondary-index");
Object.defineProperty(exports, "LocalSecondaryIndex", { enumerable: true, get: function () { return local_secondary_index_1.LocalSecondaryIndex; } });
var primary_key_1 = require("./primary-key");
Object.defineProperty(exports, "PrimaryKey", { enumerable: true, get: function () { return primary_key_1.PrimaryKey; } });
var document_client_1 = require("./document-client");
Object.defineProperty(exports, "DocumentClient", { enumerable: true, get: function () { return document_client_1.DocumentClient; } });
//# sourceMappingURL=index.js.map