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
const document_client_1 = require("../document-client");
const table_1 = require("../table");
const Query = require("./index");
let Card = class Card extends table_1.Table {
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
    Decorator.LocalSecondaryIndex('count'),
    __metadata("design:type", Query.LocalSecondaryIndex)
], Card, "countIndex", void 0);
__decorate([
    Decorator.DocumentClient(),
    __metadata("design:type", document_client_1.DocumentClient)
], Card, "documentClient", void 0);
Card = __decorate([
    Decorator.Table({ name: 'QueryLocalSecondaryIndexCardTable' })
], Card);
describe('Query/LocalSecondaryIndex', () => {
    beforeEach(async () => {
        await Card.createTable();
    });
    afterEach(async () => {
        await Card.deleteTable();
    });
    describe('#query', () => {
        it('should find items', async () => {
            await Card.documentClient.batchPut([
                Card.new({ id: 10, title: 'a', count: 4 }),
                Card.new({ id: 10, title: 'b', count: 3 }),
                Card.new({ id: 10, title: 'c', count: 2 }),
                Card.new({ id: 10, title: 'd', count: 1 }),
            ]);
            const res = await Card.countIndex.query({
                id: 10,
                count: ['>', 2],
            }, {
                rangeOrder: 'DESC',
            });
            chai_1.expect(res.records.length).to.eq(2);
            chai_1.expect(res.records[0].count).to.eq(4);
            chai_1.expect(res.records[1].count).to.eq(3);
        });
    });
});
//# sourceMappingURL=local-secondary-index.spec.js.map