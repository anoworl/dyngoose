"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BinaryAttributeType = void 0;
const attribute_type_1 = require("../../tables/attribute-type");
class BinaryAttributeType extends attribute_type_1.AttributeType {
    constructor() {
        super(...arguments);
        this.type = "B" /* Binary */;
    }
}
exports.BinaryAttributeType = BinaryAttributeType;
//# sourceMappingURL=binary.js.map