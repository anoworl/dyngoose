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
const Decorator = require("../decorator");
const errors_1 = require("../errors");
const table_1 = require("../table");
const Query = require("./index");
let Card = class Card extends table_1.Table {
    customMethod() {
        return 1;
    }
};
__decorate([
    Decorator.Attribute.Number(),
    __metadata("design:type", Number)
], Card.prototype, "id", void 0);
__decorate([
    Decorator.Attribute.String(),
    __metadata("design:type", String)
], Card.prototype, "title", void 0);
__decorate([
    Decorator.Attribute.Number(),
    __metadata("design:type", Number)
], Card.prototype, "count", void 0);
__decorate([
    Decorator.PrimaryKey('id', 'title'),
    __metadata("design:type", Query.PrimaryKey)
], Card, "primaryKey", void 0);
__decorate([
    Decorator.GlobalSecondaryIndex({ hashKey: 'title' }),
    __metadata("design:type", Query.GlobalSecondaryIndex)
], Card, "hashTitleIndex", void 0);
__decorate([
    Decorator.GlobalSecondaryIndex({ hashKey: 'title', rangeKey: 'id' }),
    __metadata("design:type", Query.GlobalSecondaryIndex)
], Card, "fullTitleIndex", void 0);
__decorate([
    Decorator.GlobalSecondaryIndex({ hashKey: 'id', rangeKey: 'title' }),
    __metadata("design:type", Query.GlobalSecondaryIndex)
], Card, "filterableTitleIndex", void 0);
__decorate([
    Decorator.GlobalSecondaryIndex({
        hashKey: 'id',
        projection: 'INCLUDE',
        nonKeyAttributes: ['title'],
    }),
    __metadata("design:type", Query.GlobalSecondaryIndex)
], Card, "includeTestIndex", void 0);
Card = __decorate([
    Decorator.Table({ name: 'QueryGlobalSecondaryIndexCardTable' })
], Card);
describe('Query/GlobalSecondaryIndex', () => {
    beforeEach(async () => {
        await Card.createTable();
    });
    afterEach(async () => {
        await Card.deleteTable();
    });
    describe('hash only index', () => {
        describe('#get', () => {
            it('should throw error when no range key is specified', async () => {
                let exception;
                try {
                    await Card.filterableTitleIndex.get({ id: 10 });
                }
                catch (ex) {
                    exception = ex;
                }
                chai_1.should().exist(exception);
            });
            it('should find item', async () => {
                await Card.new({ id: 10, title: 'abc', count: 1 }).save();
                // this .get() will perform a query with a limit of 1,
                // so it will get the first matching record
                const card = await Card.filterableTitleIndex.get({ id: 10, title: 'abc' });
                chai_1.should().exist(card);
                if (card != null) {
                    chai_1.expect(card.id).to.eq(10);
                    chai_1.expect(card.title).to.eq('abc');
                    chai_1.expect(card.count).to.eq(1);
                }
            });
        });
        describe('#query', () => {
            it('should find items', async () => {
                await Card.new({ id: 10, title: 'abc' }).save();
                await Card.new({ id: 11, title: 'abd' }).save();
                await Card.new({ id: 12, title: 'abd' }).save();
                const res = await Card.hashTitleIndex.query({ title: 'abd' });
                chai_1.expect(res.records.length).to.eq(2);
                chai_1.expect(res.records[0].id).to.eq(12);
                chai_1.expect(res.records[1].id).to.eq(11);
            });
            it('should return an empty array when no items match', async () => {
                const res = await Card.hashTitleIndex.query({ title: '404' });
                chai_1.expect(res.records.length).to.eq(0);
                chai_1.expect(res.length).to.eq(0);
                chai_1.expect(res.count).to.eq(0);
                for (const card of res.records) {
                    chai_1.expect(card).to.eq('does not exist');
                }
                for (const card of res) {
                    chai_1.expect(card).to.eq('does not exist');
                }
            });
            it('should complain when HASH key is not provided', async () => {
                await Card.hashTitleIndex.query({ id: 10 }).then(() => {
                    chai_1.expect(true).to.be.eq('false');
                }, (err) => {
                    chai_1.expect(err).to.be.instanceOf(errors_1.QueryError);
                    chai_1.expect(err.message).to.contain('Cannot perform');
                });
            });
            it('should complain when HASH key attempts to use unsupported operator', async () => {
                await Card.hashTitleIndex.query({ title: ['<>', 'abd'] }).then(() => {
                    chai_1.expect(true).to.be.eq('false');
                }, (err) => {
                    chai_1.expect(err).to.be.instanceOf(errors_1.QueryError);
                    chai_1.expect(err.message).to.contain('DynamoDB only supports');
                });
            });
            it('should allow use of query operators for RANGE', async () => {
                await Card.new({ id: 10, title: 'prefix/abc' }).save();
                await Card.new({ id: 10, title: 'prefix/123' }).save();
                await Card.new({ id: 10, title: 'prefix/xyz' }).save();
                const res = await Card.filterableTitleIndex.query({ id: 10, title: ['beginsWith', 'prefix/'] });
                chai_1.expect(res.records.length).to.eq(3);
                chai_1.expect(res.records[0].id).to.eq(10);
                chai_1.expect(res.records[1].id).to.eq(10);
                chai_1.expect(res.records[2].id).to.eq(10);
            });
            it('should complain when using unsupported query operators for RANGE', async () => {
                await Card.filterableTitleIndex.query({ id: 10, title: ['contains', 'prefix/'] }).then(() => {
                    chai_1.expect(true).to.be.eq('false');
                }, (err) => {
                    chai_1.expect(err).to.be.instanceOf(errors_1.QueryError);
                    chai_1.expect(err.message).to.contain('Cannot use');
                });
            });
        });
        describe('#scan', () => {
            const cardIds = [111, 222, 333, 444, 555];
            beforeEach(async () => {
                for (const cardId of cardIds) {
                    await Card.new({ id: cardId, title: cardId.toString() }).save();
                }
            });
            it('should return results', async () => {
                const res1 = await Card.hashTitleIndex.scan();
                const res2 = await Card.hashTitleIndex.scan(null, { limit: 2 });
                const res3 = await Card.hashTitleIndex.scan(null, { limit: 2, exclusiveStartKey: res2.lastEvaluatedKey });
                chai_1.expect(res1.records.map((r) => r.id)).to.have.all.members(cardIds);
                chai_1.expect(cardIds).to.include.members(res2.records.map((r) => r.id));
                chai_1.expect(cardIds).to.include.members(res3.records.map((r) => r.id));
            });
        });
    });
    describe('hash and range index', () => {
        describe('#query', () => {
            it('should find items', async () => {
                await Card.new({ id: 10, title: 'abc' }).save();
                await Card.new({ id: 11, title: 'abd' }).save();
                await Card.new({ id: 12, title: 'abd' }).save();
                await Card.new({ id: 13, title: 'abd' }).save();
                const res = await Card.fullTitleIndex.query({
                    title: 'abd',
                    id: ['>=', 12],
                }, {
                    rangeOrder: 'DESC',
                });
                chai_1.expect(res.records.length).to.eq(2);
                chai_1.expect(res.records[0].id).to.eq(13);
                chai_1.expect(res.records[1].id).to.eq(12);
            });
        });
        describe('#scan', () => {
            const cardIds = [111, 222, 333, 444, 555];
            beforeEach(async () => {
                for (const cardId of cardIds) {
                    await Card.new({ id: cardId, title: cardId.toString() }).save();
                }
            });
            it('should support filters', async () => {
                const search = await Card.fullTitleIndex.scan({
                    id: ['includes', cardIds],
                });
                chai_1.expect(search.records.map((r) => r.id)).to.have.all.members(cardIds);
            });
            it('should work without filters', async () => {
                const res1 = await Card.fullTitleIndex.scan();
                const res2 = await Card.fullTitleIndex.scan(null, { limit: 2 });
                const res3 = await Card.fullTitleIndex.scan(null, { limit: 2, exclusiveStartKey: res2.lastEvaluatedKey });
                chai_1.expect(res1.records.map((r) => r.id)).to.have.all.members(cardIds);
                chai_1.expect(cardIds).to.include.members(res2.records.map((r) => r.id));
                chai_1.expect(cardIds).to.include.members(res3.records.map((r) => r.id));
            });
        });
    });
    describe('include projection index', () => {
        it('allows you to query and returns the nonKeyAttributes', async () => {
            const newCard = Card.new({ id: 10, title: 'abc' });
            newCard.count = 10;
            await newCard.save();
            const card = await Card.includeTestIndex.get({ id: 10 });
            chai_1.should().exist(card);
            if (card != null) {
                chai_1.expect(card.id).to.eq(10);
                chai_1.expect(card.title).to.eq('abc');
                chai_1.should().not.exist(card.count);
            }
        });
    });
});
//# sourceMappingURL=global-secondary-index.spec.js.map