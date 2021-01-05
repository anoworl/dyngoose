"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Attribute = void 0;
const any_1 = require("./any");
const binary_1 = require("./binary");
const binary_set_1 = require("./binary-set");
const boolean_1 = require("./boolean");
const date_1 = require("./date");
const map_1 = require("./map");
const number_1 = require("./number");
const number_set_1 = require("./number-set");
const string_1 = require("./string");
const string_set_1 = require("./string-set");
const AttributeTypes = {
    Any: any_1.AnyAttributeType,
    Binary: binary_1.BinaryAttributeType,
    BinarySet: binary_set_1.BinarySetAttributeType,
    Boolean: boolean_1.BooleanAttributeType,
    Date: date_1.DateAttributeType,
    Number: number_1.NumberAttributeType,
    NumberSet: number_set_1.NumberSetAttributeType,
    String: string_1.StringAttributeType,
    StringSet: string_set_1.StringSetAttributeType,
};
function Attribute(type, metadata) {
    const define = function (record, propertyName) {
        const AttributeTypeClass = AttributeTypes[type];
        const decorator = new AttributeTypeClass(record, propertyName, metadata);
        decorator.decorate();
    };
    define.getAttribute = function (record, propertyName) {
        const AttributeTypeClass = AttributeTypes[type];
        const decorator = new AttributeTypeClass(record, propertyName, metadata);
        return decorator.attribute;
    };
    return define;
}
exports.Attribute = Attribute;
/**
 * Stores JSON objects as strings in DynamoDB.
 *
 * Can be used to store any values. Values will be parsed back into objects.
 */
Attribute.Any = (options) => Attribute('Any', options);
Attribute.Binary = (options) => Attribute('Binary', options);
Attribute.BinarySet = (options) => Attribute('BinarySet', options);
Attribute.Boolean = (options) => Attribute('Boolean', options);
/**
 * Stores a Date value.
 *
 * By default, dates are stored in an ISO 8601 compliant string format in UTC timezone.
 *
 * Use metadata options to store values as timestamps or dates without the time.
 */
Attribute.Date = (options) => Attribute('Date', options);
/**
 * For all your numbers needs.
 */
Attribute.Number = (options) => Attribute('Number', options);
/**
 * If you have a lot of numbers, a NumberSet is what you need.
 */
Attribute.NumberSet = (options) => Attribute('NumberSet', options);
Attribute.String = (options) => Attribute('String', options);
Attribute.StringSet = (options) => Attribute('StringSet', options);
Attribute.Map = (options) => {
    const define = function (record, propertyName) {
        const decorator = new map_1.MapAttributeType(record, propertyName, options);
        decorator.decorate();
    };
    define.getAttribute = function (record, propertyName) {
        const decorator = new map_1.MapAttributeType(record, propertyName, options);
        return decorator.attribute;
    };
    return define;
};
//# sourceMappingURL=index.js.map