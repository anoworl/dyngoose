"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const utils_1 = require("./utils");
describe('AttributeType/Utils', () => {
    describe('stringToNumber', () => {
        it('should convert strings to numbers', () => {
            chai_1.expect(utils_1.stringToNumber('1000')).to.eq(1000);
            chai_1.expect(utils_1.stringToNumber('1000.50')).to.eq(1000.5);
            // it also accepts numbers and returns them without changing them
            chai_1.expect(utils_1.stringToNumber(1000)).to.eq(1000);
            chai_1.expect(utils_1.stringToNumber(1000.50)).to.eq(1000.5);
        });
    });
});
//# sourceMappingURL=utils.spec.js.map