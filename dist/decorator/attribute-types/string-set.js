"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StringSetAttributeType = void 0;
const attribute_type_1 = require("../../tables/attribute-type");
class StringSetAttributeType extends attribute_type_1.AttributeType {
    constructor() {
        super(...arguments);
        this.type = "SS" /* StringSet */;
    }
}
exports.StringSetAttributeType = StringSetAttributeType;
//# sourceMappingURL=string-set.js.map