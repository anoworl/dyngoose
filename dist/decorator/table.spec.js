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
const Dyngoose = require("..");
let Card = class Card extends Dyngoose.Table {
};
__decorate([
    Dyngoose.Attribute.Number(),
    __metadata("design:type", Number)
], Card.prototype, "id", void 0);
__decorate([
    Dyngoose.Attribute.String(),
    __metadata("design:type", String)
], Card.prototype, "title", void 0);
__decorate([
    Dyngoose.Attribute.String({ name: 'complicated_field' }),
    __metadata("design:type", String)
], Card.prototype, "complicatedField", void 0);
__decorate([
    Dyngoose.Attribute.String(),
    __metadata("design:type", String)
], Card.prototype, "testString", void 0);
__decorate([
    Dyngoose.$PrimaryKey('id', 'title'),
    __metadata("design:type", Dyngoose.Query.PrimaryKey)
], Card, "primaryKey", void 0);
__decorate([
    Dyngoose.$DocumentClient(),
    __metadata("design:type", Dyngoose.DocumentClient)
], Card, "documentClient", void 0);
Card = __decorate([
    Dyngoose.$Table({ name: 'prod-Card1' })
], Card);
describe('Table Decorator', () => {
    it('should build table metadata', () => {
        chai_1.expect(Card.schema.name).eq('prod-Card1');
    });
    it('should create primaryKey', () => {
        chai_1.expect(Card.primaryKey).to.be.instanceof(Dyngoose.Query.PrimaryKey);
    });
    it('should have writer', () => {
        chai_1.expect(Card.documentClient).to.be.instanceof(Dyngoose.DocumentClient);
    });
    it('should have attributes properties', () => {
        const card = new Card();
        card.id = 10;
        card.title = '100';
        card.complicatedField = 'data';
        chai_1.expect(card.getAttribute('complicated_field')).to.eq('data');
        card.setAttribute('complicated_field', 'data2');
        chai_1.expect(card.complicatedField).to.eq('data2');
    });
});
//# sourceMappingURL=table.spec.js.map