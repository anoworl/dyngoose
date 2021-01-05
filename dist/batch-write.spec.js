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
const batch_write_1 = require("./batch-write");
const primary_key_1 = require("./query/primary-key");
const table_1 = require("./table");
const decorator_1 = require("./decorator");
const errors_1 = require("./errors");
describe('BatchWrite', () => {
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
        decorator_1.Table({ name: 'BatchWriteTestCardTable' })
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
            Card.new({ id: 10, title: 'd', count: 1 }),
        ]);
    });
    it('should operate a successful batch operation', async () => {
        const batch = new batch_write_1.BatchWrite();
        // add a bunch of records, above the limit for DynamoDB
        for (let i = 0; i < 250; i++) {
            batch.put(Card.new({ id: 42, title: `new record ${i}`, count: i }));
        }
        // delete a few records
        batch.delete(Card.primaryKey.fromKey(10, 'b'));
        batch.delete(Card.primaryKey.fromKey(10, 'c'), Card.primaryKey.fromKey(10, 'd'));
        // commit the transaction
        await batch.commit();
        // now verify the results
        const results1 = await Card.primaryKey.query({ id: 42 }, { select: 'COUNT' });
        chai_1.expect(results1.count).eq(250);
        const results2 = await Card.primaryKey.query({ id: 10 });
        chai_1.expect(results2.count).eq(1);
        chai_1.expect(results2[0].id).eq(10);
        chai_1.expect(results2[0].title).eq('a');
    });
    it('should fail with a BatchError', async () => {
        const batch = new batch_write_1.BatchWrite();
        // this will fail because we're using the same hash and range key value, which must be unique in DynamoDB
        // however, one of the documents will be written because BatchWrite is not atomic
        batch.put(Card.new({ id: 1, title: 'same', count: 1 }));
        batch.put(Card.new({ id: 1, title: 'same', count: 2 }));
        let exception;
        try {
            await batch.commit();
        }
        catch (ex) {
            exception = ex;
        }
        chai_1.expect(exception).to.be.instanceOf(errors_1.BatchError);
    });
});
//# sourceMappingURL=batch-write.spec.js.map