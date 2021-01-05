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
const primary_key_1 = require("./query/primary-key");
const table_1 = require("./table");
const transaction_1 = require("./transaction");
const decorator_1 = require("./decorator");
describe('Transaction', () => {
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
        decorator_1.Table({ name: 'TransactionTestCardTable' })
    ], Card);
    before(async () => {
        await Card.createTable();
    });
    after(async () => {
        await Card.deleteTable();
    });
    beforeEach(async () => {
        await Card.documentClient.batchPut([
            Card.new({ id: 10, title: 'a', count: 4 }),
            Card.new({ id: 10, title: 'b', count: 3 }),
            Card.new({ id: 10, title: 'c', count: 2 }),
            Card.new({ id: 11, title: 'd', count: 1 }),
        ]);
    });
    it('should operate a successful commit', async () => {
        const transaction = new transaction_1.Transaction();
        // add a new record
        transaction.save(Card.new({ id: 42, title: 'new record', count: 1 }));
        // perform an update without loading the record
        transaction.update(Card.primaryKey.fromKey(10, 'a').set('count', 5));
        // delete a few records
        transaction.delete(Card.primaryKey.fromKey(10, 'b'), { count: 3 });
        transaction.delete(Card.primaryKey.fromKey(10, 'c'));
        // add a condition
        transaction.conditionCheck(Card.primaryKey.fromKey(11, 'd'), { count: 1 });
        // commit the transaction
        await transaction.commit();
        // now verify the results
        const results = await Card.primaryKey.scan();
        const records = lodash_1.sortBy(results.records, 'id');
        chai_1.expect(results.count).eq(3);
        chai_1.expect(records[0].id).eq(10);
        chai_1.expect(records[1].id).eq(11);
        chai_1.expect(records[2].id).eq(42);
    });
    it('should fail with a ConditionalCheckFailed error', async () => {
        const transaction = new transaction_1.Transaction();
        // add a new record
        transaction.save(Card.new({ id: 42, title: 'new record', count: 1 }));
        // add a condition
        transaction.conditionCheck(Card.primaryKey.fromKey(11, 'd'), { count: 3 }); // note: 3 is not the right number
        let error;
        try {
            await transaction.commit();
        }
        catch (ex) {
            error = ex;
        }
        chai_1.expect(error).to.be.instanceOf(Error)
            .with.property('name', 'TransactionCanceledException');
    });
});
//# sourceMappingURL=transaction.spec.js.map