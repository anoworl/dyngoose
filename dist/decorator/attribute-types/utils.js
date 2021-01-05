"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNumber = exports.numberToString = exports.stringToNumber = void 0;
function stringToNumber(number) {
    if (typeof number === 'number') {
        return number;
    }
    else {
        return JSON.parse(number);
    }
}
exports.stringToNumber = stringToNumber;
function numberToString(number) {
    return number.toString();
}
exports.numberToString = numberToString;
function isNumber(value) {
    const type = typeof value;
    return type === 'number' || type === 'bigint';
}
exports.isNumber = isNumber;
//# sourceMappingURL=utils.js.map