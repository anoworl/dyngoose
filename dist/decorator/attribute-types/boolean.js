"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BooleanAttributeType = void 0;
const attribute_type_1 = require("../../tables/attribute-type");
class BooleanAttributeType extends attribute_type_1.AttributeType {
    constructor() {
        super(...arguments);
        this.type = "BOOL" /* Boolean */;
    }
}
exports.BooleanAttributeType = BooleanAttributeType;
//# sourceMappingURL=boolean.js.map