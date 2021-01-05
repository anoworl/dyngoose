"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NumberSetAttributeType = void 0;
const lodash_1 = require("lodash");
const errors_1 = require("../../errors");
const attribute_type_1 = require("../../tables/attribute-type");
const utils_1 = require("./utils");
class NumberSetAttributeType extends attribute_type_1.AttributeType {
    constructor() {
        super(...arguments);
        this.type = "NS" /* NumberSet */;
    }
    toDynamo(values) {
        if (!lodash_1.isArray(values) || !lodash_1.every(values, utils_1.isNumber)) {
            throw new errors_1.ValidationError(`Expected ${this.propertyName} to be an array of numbers`);
        }
        // dynamodb does not allow sets to contain duplicate values, so ensure uniqueness here
        return {
            NS: lodash_1.uniq(values.map((value) => utils_1.numberToString(value))),
        };
    }
    fromDynamo(value) {
        // this needs to return null when there is no value, so the default value can be set if necessary
        // returning an empty array means there was a value from DynamoDB with a Set containing no items
        if (value.NS == null) {
            return null;
        }
        else {
            return value.NS.map((item) => utils_1.stringToNumber(item));
        }
    }
}
exports.NumberSetAttributeType = NumberSetAttributeType;
//# sourceMappingURL=number-set.js.map