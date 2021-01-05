"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const setup_tests_spec_1 = require("../../setup-tests.spec");
describe('AttributeType/NumberSet', () => {
    let record;
    beforeEach(() => {
        record = new setup_tests_spec_1.TestableTable();
    });
    it('should store values as an array of numbers', () => {
        chai_1.expect(record.testNumberSet).eq(null);
        record.testNumberSet = [10, 100];
        chai_1.expect(record.testNumberSet).deep.eq([10, 100]);
        chai_1.expect(record.get('testNumberSet')).deep.eq([10, 100]);
        chai_1.expect(record.getAttributeDynamoValue('testNumberSet')).deep.eq({ NS: ['10', '100'] });
    });
    it('supports BigInt values', () => {
        const int = BigInt('9007199254740991');
        chai_1.expect(record.testNumberSet).eq(null);
        record.testNumberSet = [int];
        chai_1.expect(record.testNumberSet).to.deep.eq([Number(int)], 'read from record');
        chai_1.expect(record.get('testNumberSet')).deep.eq([Number(int)], 'use .get');
        chai_1.expect(record.getAttribute('testNumberSet')).deep.eq([Number(int)], 'use .getAttribute');
        chai_1.expect(record.getAttributeDynamoValue('testNumberSet')).deep.eq({ NS: [int.toString()] }, 'use .getAttributeDynamoValue');
    });
    it('rejects non-number values', () => {
        chai_1.expect(record.testNumberSet).eq(null);
        // we do this primarily to ensure typing is enforced for queries
        chai_1.expect(() => {
            record.testNumberSet = ['test'];
        }).to.throw();
    });
});
//# sourceMappingURL=number-set.spec.js.map