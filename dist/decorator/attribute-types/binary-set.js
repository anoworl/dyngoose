"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BinarySetAttributeType = void 0;
const attribute_type_1 = require("../../tables/attribute-type");
class BinarySetAttributeType extends attribute_type_1.AttributeType {
    constructor() {
        super(...arguments);
        this.type = "BS" /* BinarySet */;
    }
}
exports.BinarySetAttributeType = BinarySetAttributeType;
//# sourceMappingURL=binary-set.js.map