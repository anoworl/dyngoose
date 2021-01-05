"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapAttributeType = void 0;
const _ = require("lodash");
const errors_1 = require("../../errors");
const attribute_type_1 = require("../../tables/attribute-type");
class MapAttributeType extends attribute_type_1.AttributeType {
    constructor(record, propertyName, metadata) {
        var _a;
        super(record, propertyName, metadata);
        this.metadata = metadata;
        this.type = "M" /* Map */;
        this.attributes = {};
        // convert attributes from ChildAttributeMetadata types to
        for (const childAttributePropertyName of Object.keys(this.metadata.attributes)) {
            const childAttributeDef = (_a = this.metadata) === null || _a === void 0 ? void 0 : _a.attributes[childAttributePropertyName];
            const childAttribute = childAttributeDef.getAttribute(record, childAttributePropertyName);
            this.attributes[childAttribute.name] = childAttribute;
        }
    }
    getDefault() {
        const map = {};
        for (const childAttribute of Object.values(this.attributes)) {
            map[childAttribute.name] = childAttribute.getDefaultValue();
        }
        return map;
    }
    toDynamo(mapValue) {
        if (!_.isObject(mapValue)) {
            throw new errors_1.ValidationError(`Map attributes require values to be an Object, but was given a ${typeof mapValue}`);
        }
        const map = {};
        for (const propertyName of Object.keys(mapValue)) {
            const attribute = _.find(this.attributes, (attr) => attr.propertyName === propertyName);
            const value = _.get(mapValue, propertyName);
            if (attribute != null) {
                const attributeValue = attribute.toDynamo(value);
                if (attributeValue != null) {
                    map[attribute.propertyName] = attributeValue;
                }
            }
            else {
                throw new errors_1.ValidationError(`Unknown property set on Map, ${propertyName}`);
            }
        }
        return { M: map };
    }
    fromDynamo(attributeValue) {
        const mapValue = attributeValue.M == null ? {} : attributeValue.M;
        const map = mapValue;
        for (const attributeName of Object.keys(mapValue)) {
            const value = mapValue[attributeName];
            const attribute = this.attributes[attributeName];
            if (attribute != null) {
                map[attribute.propertyName] = attribute.fromDynamo(value);
            }
        }
        return map;
    }
}
exports.MapAttributeType = MapAttributeType;
//# sourceMappingURL=map.js.map