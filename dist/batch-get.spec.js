"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const lodash_1 = require("lodash");
const batch_get_1 = require("./batch-get");
const primary_key_1 = require("./query/primary-key");
const table_1 = require("./table");
const decorator_1 = require("./decorator");
describe('BatchGet', () => {
    let TestTable1 = class TestTable1 extends table_1.Table {
    };
    __decorate([
        decorator_1.Attribute.Number(),
        __metadata("design:type", Number)
    ], TestTable1.prototype, "id", void 0);
    __decorate([
        decorator_1.Attribute.String(),
        __metadata("design:type", String)
    ], TestTable1.prototype, "status", void 0);
    __decorate([
        decorator_1.PrimaryKey('id'),
        __metadata("design:type", primary_key_1.PrimaryKey)
    ], TestTable1, "primaryKey", void 0);
    TestTable1 = __decorate([
        decorator_1.Table({ name: 'BatchGetTestCardTable1' })
    ], TestTable1);
    let TestTable2 = class TestTable2 extends table_1.Table {
    };
    __decorate([
        decorator_1.Attribute.Number(),
        __metadata("design:type", Number)
    ], TestTable2.prototype, "id", void 0);
    __decorate([
        decorator_1.Attribute.String(),
        __metadata("design:type", String)
    ], TestTable2.prototype, "status", void 0);
    __decorate([
        decorator_1.PrimaryKey('id'),
        __metadata("design:type", primary_key_1.PrimaryKey)
    ], TestTable2, "primaryKey", void 0);
    TestTable2 = __decorate([
        decorator_1.Table({ name: 'BatchGetTestCardTable2' })
    ], TestTable2);
    before(async () => {
        await TestTable1.createTable();
        await TestTable2.createTable();
    });
    after(async () => {
        await TestTable1.deleteTable();
        await TestTable2.deleteTable();
    });
    beforeEach(async () => {
        await TestTable1.documentClient.batchPut([
            TestTable1.new({ id: 1, status: 'a' }),
            TestTable1.new({ id: 2, status: 'b' }),
            TestTable1.new({ id: 3, status: 'c' }),
            TestTable1.new({ id: 4, status: 'd' }),
        ]);
        await TestTable2.documentClient.batchPut([
            TestTable2.new({ id: 1, status: 'a' }),
            TestTable2.new({ id: 2, status: 'b' }),
            TestTable2.new({ id: 3, status: 'c' }),
            TestTable2.new({ id: 4, status: 'd' }),
        ]);
    });
    it('should operate a successful batch operation', async () => {
        const batch = new batch_get_1.BatchGet();
        const item = TestTable1.primaryKey.fromKey(1);
        batch.get(item);
        batch.get(TestTable1.primaryKey.fromKey(2));
        batch.get(TestTable2.primaryKey.fromKey(3));
        batch.get(TestTable2.primaryKey.fromKey(4));
        chai_1.expect(item.status).to.eq(null);
        // execute the retrieval
        const results = await batch.retrieve();
        // now verify the results
        const records = lodash_1.sortBy(results, 'id');
        chai_1.expect(results.length).eq(4);
        chai_1.expect(records[0].id).eq(1);
        chai_1.expect(records[0]).to.be.instanceOf(TestTable1);
        chai_1.expect(records[1].id).eq(2);
        chai_1.expect(records[1]).to.be.instanceOf(TestTable1);
        chai_1.expect(records[2].id).eq(3);
        chai_1.expect(records[2]).to.be.instanceOf(TestTable2);
        chai_1.expect(records[3].id).eq(4);
        chai_1.expect(records[3]).to.be.instanceOf(TestTable2);
        // verify the original items are mutated
        chai_1.expect(item.status).to.eq('a');
    });
    it('should operate a successful atomic batch operation', async () => {
        const batch = new batch_get_1.BatchGet().atomic();
        const item = TestTable1.primaryKey.fromKey(1);
        batch.get(item);
        batch.get(TestTable1.primaryKey.fromKey(2));
        batch.get(TestTable2.primaryKey.fromKey(3));
        batch.get(TestTable2.primaryKey.fromKey(4));
        chai_1.expect(item.status).to.eq(null);
        // execute the retrieval
        const results = await batch.retrieve();
        // now verify the results
        const records = lodash_1.sortBy(results, 'id');
        chai_1.expect(results.length).eq(4);
        chai_1.expect(records[0].id).eq(1);
        chai_1.expect(records[0]).to.be.instanceOf(TestTable1);
        chai_1.expect(records[1].id).eq(2);
        chai_1.expect(records[1]).to.be.instanceOf(TestTable1);
        chai_1.expect(records[2].id).eq(3);
        chai_1.expect(records[2]).to.be.instanceOf(TestTable2);
        chai_1.expect(records[3].id).eq(4);
        chai_1.expect(records[3]).to.be.instanceOf(TestTable2);
        // verify the original items are mutated
        chai_1.expect(item.status).to.eq('a');
    });
    it('should return an empty array when nothing matches', async () => {
        const batch = new batch_get_1.BatchGet();
        batch.get(TestTable1.primaryKey.fromKey(420));
        const results = await batch.retrieve();
        chai_1.expect(results.length).eq(0);
    });
    it('should not return records that were missing', async () => {
        const batch = new batch_get_1.BatchGet();
        batch.get(TestTable1.primaryKey.fromKey(1));
        batch.get(TestTable1.primaryKey.fromKey(42));
        // execute the retrieval
        const results = await batch.retrieve();
        // now verify the results
        chai_1.expect(results.length).eq(1);
        chai_1.expect(results[0].id).eq(1);
    });
    it('should accept projection expressions', async () => {
        const batch = new batch_get_1.BatchGet();
        const item = TestTable1.primaryKey.fromKey(1);
        batch.getSpecificAttributes(TestTable1, 'id');
        batch.get(item);
        // execute the retrieval
        const results = await batch.retrieve();
        chai_1.expect(results.length).eq(1);
        chai_1.expect(results[0].status).eq(null);
        chai_1.expect(item.status).to.eq(null);
        chai_1.expect(item.toJSON()).to.deep.eq({
            id: 1,
        });
    });
    it('should accept projection expressions with reserved keywords', async () => {
        const batch = new batch_get_1.BatchGet();
        const item = TestTable1.primaryKey.fromKey(1);
        batch.getSpecificAttributes(TestTable1, 'id', 'status');
        batch.get(item);
        // execute the retrieval
        const results = await batch.retrieve();
        chai_1.expect(results.length).eq(1);
        chai_1.expect(results[0].status).eq('a');
        chai_1.expect(item.status).to.eq('a');
    });
});
//# sourceMappingURL=batch-get.spec.js.map