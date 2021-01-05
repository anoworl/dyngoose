"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const setup_tests_spec_1 = require("../../setup-tests.spec");
describe('AttributeType/Any', () => {
    let record;
    beforeEach(() => {
        record = new setup_tests_spec_1.TestableTable();
    });
    it('should store objects into JSON', async () => {
        record.id = 30;
        record.title = 'json test';
        const value = {
            dogs: 'good',
            cats: 'okay',
            ferrets: 'stinky',
        };
        chai_1.expect(record.generic).eq(null, 'starts as null');
        record.generic = value;
        chai_1.expect(record.generic).to.deep.eq(value, 'accepts a javascript object');
        chai_1.expect(record.getAttributeDynamoValue('generic')).deep.eq({ S: JSON.stringify(value) }, 'stores in json');
        try {
            await record.save();
        }
        catch (ex) {
            chai_1.should().not.exist(ex);
        }
        const loaded = await setup_tests_spec_1.TestableTable.primaryKey.get(30, 'json test');
        chai_1.expect(loaded).to.be.instanceof(setup_tests_spec_1.TestableTable);
        if (loaded != null) {
            chai_1.expect(loaded.generic).to.deep.eq(value, 'after loading record from dynamo');
        }
    });
});
//# sourceMappingURL=any.spec.js.map