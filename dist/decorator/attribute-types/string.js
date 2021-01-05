"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StringAttributeType = void 0;
const lodash_1 = require("lodash");
const errors_1 = require("../../errors");
const attribute_type_1 = require("../../tables/attribute-type");
class StringAttributeType extends attribute_type_1.AttributeType {
    constructor() {
        super(...arguments);
        this.type = "S" /* String */;
    }
    toDynamo(value) {
        var _a, _b, _c;
        if (typeof value !== 'string') {
            throw new errors_1.ValidationError(`Expected ${this.propertyName} to be a string, but was given a ${typeof value}`);
        }
        if (((_a = this.metadata) === null || _a === void 0 ? void 0 : _a.trim) === true) {
            value = lodash_1.trim(value);
            if (value === '') {
                return {
                    NULL: true,
                };
            }
        }
        if (((_b = this.metadata) === null || _b === void 0 ? void 0 : _b.uppercase) === true) {
            value = value.toUpperCase();
        }
        else if (((_c = this.metadata) === null || _c === void 0 ? void 0 : _c.lowercase) === true) {
            value = value.toLowerCase();
        }
        return {
            S: value,
        };
    }
}
exports.StringAttributeType = StringAttributeType;
//# sourceMappingURL=string.js.map