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
const table_1 = require("../table");
const primary_key_1 = require("./primary-key");
const decorator_1 = require("../decorator");
describe('Query/PrimaryKey', () => {
    let Card = class Card extends table_1.Table {
    };
    __decorate([
        decorator_1.Attribute.Number(),
        __metadata("design:type", Number)
    ], Card.prototype, "id", void 0);
    __decorate([
        decorator_1.Attribute.String(),
        __metadata("design:type", String)
    ], Card.prototype, "title", void 0);
    __decorate([
        decorator_1.Attribute.Number(),
        __metadata("design:type", Number)
    ], Card.prototype, "count", void 0);
    __decorate([
        decorator_1.PrimaryKey('id', 'title'),
        __metadata("design:type", primary_key_1.PrimaryKey)
    ], Card, "primaryKey", void 0);
    Card = __decorate([
        decorator_1.Table({ name: 'QueryPrimaryKeyCardTable' })
    ], Card);
    let TableWithDateRange = class TableWithDateRange extends table_1.Table {
    };
    __decorate([
        decorator_1.Attribute.Number(),
        __metadata("design:type", Number)
    ], TableWithDateRange.prototype, "id", void 0);
    __decorate([
        decorator_1.Attribute.Date(),
        __metadata("design:type", Date)
    ], TableWithDateRange.prototype, "date", void 0);
    __decorate([
        decorator_1.PrimaryKey('id', 'date'),
        __metadata("design:type", primary_key_1.PrimaryKey)
    ], TableWithDateRange, "primaryKey", void 0);
    TableWithDateRange = __decorate([
        decorator_1.Table({ name: 'QueryPrimaryKeyTableWithDateRange' })
    ], TableWithDateRange);
    let primaryKey;
    before(async () => {
        await TableWithDateRange.createTable();
    });
    after(async () => {
        await TableWithDateRange.deleteTable();
    });
    beforeEach(async () => {
        await Card.createTable();
        primaryKey = Card.primaryKey;
    });
    afterEach(async () => {
        await Card.deleteTable();
    });
    describe('#delete', () => {
        it('should delete item if exist', async () => {
            await Card.new({ id: 10, title: 'abc' }).save();
            await primaryKey.delete(10, 'abc');
            chai_1.expect(await primaryKey.get(10, 'abc')).to.eq(undefined);
        });
    });
    describe('#get', () => {
        it('should find nothing when nothing exists', async () => {
            let item = await primaryKey.get({ id: 10, title: 'abc' });
            chai_1.expect(item).to.eq(undefined);
            item = await primaryKey.get(10, 'abc');
            chai_1.expect(item).to.eq(undefined);
        });
        it('should find item using a query filter object', async () => {
            await Card.new({ id: 10, title: 'abc' }).save();
            const item = await primaryKey.get({ id: 10, title: 'abc' });
            chai_1.expect(item).to.be.instanceof(Card);
            if (item != null) {
                chai_1.expect(item.id).to.eq(10);
                chai_1.expect(item.title).to.eq('abc');
            }
        });
        it('should find item using hash and range arguments', async () => {
            await Card.new({ id: 10, title: 'abc' }).save();
            const item = await primaryKey.get(10, 'abc');
            chai_1.expect(item).to.be.instanceof(Card);
            if (item != null) {
                chai_1.expect(item.id).to.eq(10);
                chai_1.expect(item.title).to.eq('abc');
            }
        });
        it('should allow date type to be the range', async () => {
            const now = new Date();
            await TableWithDateRange.new({ id: 1, date: now }).save();
            const item = await TableWithDateRange.primaryKey.get(1, now);
            chai_1.expect(item).to.be.instanceof(TableWithDateRange);
            if (item != null) {
                chai_1.expect(item.id).to.eq(1);
                chai_1.expect(item.date.toISOString()).to.eq(now.toISOString());
            }
        });
    });
    describe('#batchGet', () => {
        it('should find items', async () => {
            await Card.new({ id: 10, title: 'abc' }).save();
            await Card.new({ id: 11, title: 'abc' }).save();
            await Card.new({ id: 12, title: 'abc' }).save();
            const items1 = await primaryKey.batchGet([
                [10, 'abc'],
                [11, 'abc'],
            ]);
            chai_1.expect(items1.length).to.eq(2);
            chai_1.expect(items1[0].id).to.eq(10);
            chai_1.expect(items1[1].id).to.eq(11);
            const items2 = await primaryKey.batchGet([
                [10, 'abc'],
                [10000, 'asdgasdgs'],
                [11, 'abc'],
            ]);
            chai_1.expect(items2.length).to.eq(2);
            chai_1.expect(items2[0].id).to.eq(10);
            chai_1.expect(items2[0].title).to.eq('abc');
            chai_1.expect(items2[1].id).to.eq(11);
            chai_1.expect(items2[1].title).to.eq('abc');
        });
    });
    describe('#query', () => {
        it('should find items', async () => {
            await Card.new({ id: 10, title: 'abc' }).save();
            await Card.new({ id: 10, title: 'abd' }).save();
            await Card.new({ id: 10, title: 'aba' }).save();
            let res = await primaryKey.query({
                id: 10,
                title: ['between', 'abc', 'abf'],
            });
            chai_1.expect(res.records.length).to.eq(2);
            chai_1.expect(res.records[0].title).to.eq('abc');
            chai_1.expect(res.records[1].title).to.eq('abd');
            res = await primaryKey.query({
                id: 10,
                title: ['between', 'abc', 'abf'],
            }, {
                rangeOrder: 'DESC',
            });
            chai_1.expect(res.records.length).to.eq(2);
            chai_1.expect(res.records[0].title).to.eq('abd');
            chai_1.expect(res.records[1].title).to.eq('abc');
        });
        it('should return an empty array when no results match', async () => {
            const res = await primaryKey.query({
                id: 420,
            });
            chai_1.expect(res.length).to.eq(0);
            chai_1.expect(res.count).to.eq(0);
            chai_1.expect(res.records.length).to.eq(0);
        });
    });
    describe('#scan', () => {
        it('should find items', async () => {
            await Card.new({ id: 10, title: 'abc' }).save();
            await Card.new({ id: 10, title: 'abd' }).save();
            await Card.new({ id: 10, title: 'aba' }).save();
            const res = await primaryKey.scan(null, {
                limit: 2,
            });
            chai_1.expect(res.records.length).to.eq(2);
            // Ordered by range key since it's "scan"
            chai_1.expect(res.records[0].title).to.eq('aba');
            chai_1.expect(res.records[1].title).to.eq('abc');
        });
    });
    describe('#update', () => {
        it('should be able to update items', async () => {
            await primaryKey.update({
                hash: 10,
                range: 'abc',
                changes: {
                    count: 1,
                },
            });
            let card = await primaryKey.get(10, 'abc');
            chai_1.expect(card).to.be.instanceOf(Card);
            if (card != null) {
                chai_1.expect(card.count).to.eq(1);
            }
            await primaryKey.update({
                hash: 10,
                range: 'abc',
                changes: {
                    count: 2,
                },
            });
            card = await primaryKey.get(10, 'abc');
            chai_1.expect(card).to.be.instanceOf(Card);
            if (card != null) {
                chai_1.expect(card.count).to.eq(2);
            }
        });
    });
});
//# sourceMappingURL=primary-key.spec.js.map