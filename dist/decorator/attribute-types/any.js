"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnyAttributeType = void 0;
const attribute_type_1 = require("../../tables/attribute-type");
class AnyAttributeType extends attribute_type_1.AttributeType {
    constructor() {
        super(...arguments);
        this.type = "S" /* String */;
    }
    toDynamo(value) {
        return {
            S: JSON.stringify(value),
        };
    }
    fromDynamo(attributeValue) {
        try {
            return JSON.parse(attributeValue.S);
        }
        catch (ex) {
            return null;
        }
    }
}
exports.AnyAttributeType = AnyAttributeType;
//# sourceMappingURL=any.js.map