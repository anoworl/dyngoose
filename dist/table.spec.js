"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const Dyngoose = require(".");
const setup_tests_spec_1 = require("./setup-tests.spec");
describe('Table', () => {
    it('should create primaryKey', () => {
        chai_1.expect(setup_tests_spec_1.TestableTable.primaryKey).to.be.instanceof(Dyngoose.Query.PrimaryKey);
    });
    it('should have attributes properties', async () => {
        const card = new setup_tests_spec_1.TestableTable();
        card.id = 10;
        card.title = '100';
        await card.save();
        const reloadedCard = await setup_tests_spec_1.TestableTable.primaryKey.get(10, '100');
        chai_1.expect(reloadedCard).to.be.instanceof(setup_tests_spec_1.TestableTable);
        if (reloadedCard != null) {
            chai_1.expect(reloadedCard.id).to.eq(10);
            chai_1.expect(reloadedCard.get('id')).to.eq(10);
            chai_1.expect(reloadedCard.title).to.eq('100');
        }
    });
    it('should allow an attribute to be emptied', async () => {
        const card = new setup_tests_spec_1.TestableTable();
        card.id = 10;
        card.title = '100';
        card.testString = 'some value';
        await card.save();
        chai_1.expect(card.testString).to.eq('some value', 'initial card created');
        card.testString = '';
        chai_1.expect(card.testString).to.eq(null, 'cleared strings become null, because DynamoDB does not allow empty string values');
        await card.save();
        const reloadedCard = await setup_tests_spec_1.TestableTable.primaryKey.get(10, '100');
        chai_1.expect(reloadedCard).to.be.instanceof(setup_tests_spec_1.TestableTable);
        if (reloadedCard != null) {
            chai_1.expect(reloadedCard.testString).to.eq(null, 'reloaded testString value compared');
        }
    });
    it('should work with TTL', async () => {
        const card = new setup_tests_spec_1.TestableTable();
        card.id = 10;
        card.title = '100';
        card.expiresAt = new Date(Date.now() + 5000); // 5 secs away
        await card.save();
        // Wait 15 seconds
        await new Promise((resolve) => setTimeout(resolve, 15000));
        const reloaded = await setup_tests_spec_1.TestableTable.primaryKey.get(10, '100', { consistent: true });
        chai_1.expect(reloaded).to.eq(undefined);
    });
    describe('saving should support conditions', () => {
        context('when condition check was failed', () => {
            it('should throw error', async () => {
                const record = setup_tests_spec_1.TestableTable.new({ id: 22, title: 'something new' });
                await record.save();
                let error;
                try {
                    record.title = 'something blue';
                    await record.save({ id: 23 });
                }
                catch (ex) {
                    error = ex;
                }
                chai_1.expect(error).to.be.instanceOf(Error)
                    .with.property('name', 'ConditionalCheckFailedException');
                chai_1.expect(error).to.have.property('message', 'The conditional request failed');
            });
        });
        context('when condition check was passed', () => {
            it('should put item as per provided condition', async () => {
                const record = setup_tests_spec_1.TestableTable.new({ id: 22, title: 'bar' });
                // save a new record, and confirm the id does not exist… useful to
                // confirm you are adding a new record and not unintentionally updating an existing one
                await record.save({ id: ['not exists'] });
                const reloaded = await setup_tests_spec_1.TestableTable.primaryKey.get({ id: 22, title: 'bar' }, { consistent: true });
                chai_1.expect(reloaded).to.be.instanceOf(setup_tests_spec_1.TestableTable);
            });
        });
    });
    describe('deleting should support conditions', () => {
        context('when condition check was failed', () => {
            it('should throw error', async () => {
                const record = setup_tests_spec_1.TestableTable.new({ id: 23, title: 'something new' });
                await record.save();
                let error;
                try {
                    await record.delete({ id: 24 });
                }
                catch (ex) {
                    error = ex;
                }
                chai_1.expect(error).to.be.instanceOf(Error)
                    .with.property('name', 'ConditionalCheckFailedException');
                chai_1.expect(error).to.have.property('message', 'The conditional request failed');
            });
        });
        context('when condition check was passed', () => {
            it('should delete item as per provided condition', async () => {
                const record = setup_tests_spec_1.TestableTable.new({ id: 24, title: 'bar' });
                // save a new record, and confirm the id does not exist… useful to
                // confirm you are adding a new record and not unintentionally updating an existing one
                await record.save();
                await record.delete({ id: 24 });
                const reloaded = await setup_tests_spec_1.TestableTable.primaryKey.get(record, { consistent: true });
                chai_1.expect(reloaded).not.to.be.instanceOf(setup_tests_spec_1.TestableTable);
            });
        });
    });
    it('should apply default values', () => {
        const record = setup_tests_spec_1.TestableTable.new();
        chai_1.expect(record.id).to.eq(1);
        chai_1.expect(record.defaultedString).to.eq('SomeDefault');
        chai_1.expect(record.testNumberSetWithDefaults).to.deep.eq([42, 420]);
    });
    it('should not apply defaults when the record is loaded from DynamoDB', () => {
        const record = setup_tests_spec_1.TestableTable.fromDynamo({});
        chai_1.expect(record.id).to.eq(null);
    });
    describe('#toJSON', () => {
        it('should export to an object', () => {
            const record = setup_tests_spec_1.TestableTable.new();
            chai_1.expect(record.toJSON()).to.deep.eq({
                id: 1,
                defaultedString: 'SomeDefault',
                testNumberSetWithDefaults: [42, 420],
                createdAt: record.createdAt.toISOString(),
                updatedAt: record.updatedAt.toISOString(),
            });
        });
        it('should not apply defaults when the record is loaded from DynamoDB', () => {
            const record = setup_tests_spec_1.TestableTable.fromDynamo({});
            chai_1.expect(record.toJSON()).to.deep.eq({});
        });
    });
});
//# sourceMappingURL=table.spec.js.map