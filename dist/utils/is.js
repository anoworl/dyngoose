"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDyngooseTableClass = exports.isDyngooseTableInstance = void 0;
const table_1 = require("../table");
function isDyngooseTableInstance(obj) {
    return obj instanceof table_1.Table || isDyngooseTableClass(obj.constructor);
}
exports.isDyngooseTableInstance = isDyngooseTableInstance;
function isDyngooseTableClass(obj) {
    var _a;
    const comp = obj.prototype instanceof table_1.Table || ((_a = obj === null || obj === void 0 ? void 0 : obj.schema) === null || _a === void 0 ? void 0 : _a.isDyngoose);
    return comp;
}
exports.isDyngooseTableClass = isDyngooseTableClass;
//# sourceMappingURL=is.js.map