"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttributeType = void 0;
const attribute_1 = require("../attribute");
class AttributeType {
    constructor(record, propertyName, metadata) {
        this.record = record;
        this.propertyName = propertyName;
        this.metadata = metadata;
    }
    get attribute() {
        if (this.__attribute == null) {
            this.__attribute = new attribute_1.Attribute(this.propertyName, this, this.metadata);
        }
        return this.__attribute;
    }
    get table() {
        return this.record.constructor;
    }
    get schema() {
        return this.table.schema;
    }
    decorate() {
        this.schema.addAttribute(this.attribute);
    }
    toDynamo(value, attribute) {
        return { [this.type]: value };
    }
    fromDynamo(attributeValue, attribute) {
        return attributeValue[this.type];
    }
}
exports.AttributeType = AttributeType;
//# sourceMappingURL=attribute-type.js.map