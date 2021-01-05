"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const setup_tests_spec_1 = require("../../setup-tests.spec");
describe('AttributeType/String', () => {
    let record;
    beforeEach(() => {
        record = setup_tests_spec_1.TestableTable.new();
    });
    it('should store values as strings', () => {
        chai_1.expect(record.testString).eq(null);
        record.testString = 'some value';
        chai_1.expect(record.testString).eq('some value');
        chai_1.expect(record.get('testString')).eq('some value');
        chai_1.expect(record.getAttribute('testString')).eq('some value');
        chai_1.expect(record.getAttributeDynamoValue('testString')).deep.eq({ S: 'some value' });
    });
    it('rejects non-string values', () => {
        chai_1.expect(record.testString).eq(null);
        // we do this primarily to ensure typing is enforced for queries
        chai_1.expect(() => { record.testString = 10; }).to.throw();
    });
    describe('default values', () => {
        it('supports default values', () => {
            chai_1.expect(record.defaultedString).eq('SomeDefault');
        });
        it('ignores default when it has a value from constructor', () => {
            record = setup_tests_spec_1.TestableTable.new({ defaultedString: '123' });
            chai_1.expect(record.defaultedString).eq('123');
        });
        it('ignores default when it has a value from DynamoDB', () => {
            record = setup_tests_spec_1.TestableTable.fromDynamo({ defaultedString: { S: '123' } });
            chai_1.expect(record.defaultedString).eq('123');
        });
    });
    describe('additional metadata options', () => {
        it('lowercase', () => {
            record.lowercaseString = 'Hello World';
            chai_1.expect(record.lowercaseString).eq('hello world');
        });
        it('uppercase', () => {
            record.uppercaseString = 'Hello World';
            chai_1.expect(record.uppercaseString).eq('HELLO WORLD');
        });
        it('trim', () => {
            record.trimmedString = ' what ';
            chai_1.expect(record.trimmedString).eq('what');
        });
    });
});
//# sourceMappingURL=string.spec.js.map