"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Attribute = void 0;
const _ = require("lodash");
const errors_1 = require("./errors");
const truly_empty_1 = require("./utils/truly-empty");
class Attribute {
    constructor(propertyName, type, metadata = {}) {
        this.propertyName = propertyName;
        this.type = type;
        this.metadata = metadata;
        this.name = this.metadata.name == null ? this.propertyName : this.metadata.name;
    }
    /**
     * Set the default value for an attribute, if no value is currently set
     */
    getDefaultValue() {
        if (typeof this.metadata.default !== 'undefined') {
            return _.isFunction(this.metadata.default) ? this.metadata.default() : this.metadata.default;
        }
        else if (typeof this.type.getDefault === 'function') {
            return this.type.getDefault();
        }
        else {
            return null;
        }
    }
    /**
     * Convert the given value for this attribute to a DynamoDB AttributeValue
     */
    toDynamo(value) {
        // if there is no value, inject the default value for this attribute
        if (value == null || truly_empty_1.isTrulyEmpty(value)) {
            return null;
        }
        // if we have no value, allow the manipulateWrite a chance to provide a value
        if (typeof this.metadata.manipulateWrite === 'function' && value == null) {
            const customAttributeValue = this.metadata.manipulateWrite(null, null, this);
            if (customAttributeValue != null) {
                return customAttributeValue;
            }
        }
        // if there is no value, do not not return an empty DynamoDB.AttributeValue
        if (value == null) {
            if (this.metadata.required === true) {
                throw new errors_1.ValidationError('Required value missing: ' + this.name);
            }
            return null;
        }
        if (typeof this.metadata.validate === 'function' && !this.metadata.validate(value)) {
            throw new errors_1.ValidationError('Validation failed: ' + this.name);
        }
        const attributeValue = this.type.toDynamo(value, this);
        if (typeof this.metadata.manipulateWrite === 'function') {
            return this.metadata.manipulateWrite(attributeValue, value, this);
        }
        else {
            return attributeValue;
        }
    }
    toDynamoAssert(value) {
        const attributeValue = this.toDynamo(value);
        if (attributeValue == null) {
            throw new errors_1.ValidationError('Attribute.toDynamoAssert called without a valid value');
        }
        else {
            return attributeValue;
        }
    }
    /**
     * Convert DynamoDB raw response to understandable data
     */
    fromDynamo(attributeValue) {
        // if there is no value, apply the default, but allow the value to become null
        if (attributeValue == null) {
            attributeValue = this.toDynamo(null);
        }
        // all attributes support null
        if (attributeValue == null || attributeValue.NULL === true) {
            return null;
        }
        const value = this.type.fromDynamo(attributeValue, this);
        if (typeof this.metadata.manipulateRead === 'function') {
            return this.metadata.manipulateRead(value, attributeValue, this);
        }
        else {
            return value;
        }
    }
}
exports.Attribute = Attribute;
//# sourceMappingURL=attribute.js.map