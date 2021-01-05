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
exports.TestableTable = void 0;
const _1 = require(".");
let TestableTable = class TestableTable extends _1.Dyngoose.Table {
};
__decorate([
    _1.Dyngoose.Attribute.Any(),
    __metadata("design:type", Object)
], TestableTable.prototype, "generic", void 0);
__decorate([
    _1.Dyngoose.Attribute.Number({ default: 1 }),
    __metadata("design:type", Number)
], TestableTable.prototype, "id", void 0);
__decorate([
    _1.Dyngoose.Attribute.String(),
    __metadata("design:type", String)
], TestableTable.prototype, "title", void 0);
__decorate([
    _1.Dyngoose.Attribute.Date({ nowOnCreate: true }),
    __metadata("design:type", Date)
], TestableTable.prototype, "createdAt", void 0);
__decorate([
    _1.Dyngoose.Attribute.Date({ nowOnUpdate: true }),
    __metadata("design:type", Date)
], TestableTable.prototype, "updatedAt", void 0);
__decorate([
    _1.Dyngoose.Attribute.Date({ timeToLive: true }),
    __metadata("design:type", Date)
], TestableTable.prototype, "expiresAt", void 0);
__decorate([
    _1.Dyngoose.Attribute.Date({ unixTimestamp: true }),
    __metadata("design:type", Date)
], TestableTable.prototype, "unixTimestamp", void 0);
__decorate([
    _1.Dyngoose.Attribute.Date({ millisecondTimestamp: true }),
    __metadata("design:type", Date)
], TestableTable.prototype, "msTimestamp", void 0);
__decorate([
    _1.Dyngoose.Attribute('String', { default: 'SomeDefault' }),
    __metadata("design:type", String)
], TestableTable.prototype, "defaultedString", void 0);
__decorate([
    _1.Dyngoose.Attribute.String(),
    __metadata("design:type", String)
], TestableTable.prototype, "testString", void 0);
__decorate([
    _1.Dyngoose.Attribute.String({ lowercase: true }),
    __metadata("design:type", String)
], TestableTable.prototype, "lowercaseString", void 0);
__decorate([
    _1.Dyngoose.Attribute.String({ uppercase: true }),
    __metadata("design:type", String)
], TestableTable.prototype, "uppercaseString", void 0);
__decorate([
    _1.Dyngoose.Attribute.String({ trim: true }),
    __metadata("design:type", String)
], TestableTable.prototype, "trimmedString", void 0);
__decorate([
    _1.Dyngoose.Attribute.Number(),
    __metadata("design:type", Number)
], TestableTable.prototype, "testNumber", void 0);
__decorate([
    _1.Dyngoose.Attribute.NumberSet(),
    __metadata("design:type", Array)
], TestableTable.prototype, "testNumberSet", void 0);
__decorate([
    _1.Dyngoose.Attribute.NumberSet({ default: () => [42, 420] }),
    __metadata("design:type", Array)
], TestableTable.prototype, "testNumberSetWithDefaults", void 0);
__decorate([
    _1.Dyngoose.Attribute.Number(),
    __metadata("design:type", Object)
], TestableTable.prototype, "testBigInt", void 0);
__decorate([
    _1.Dyngoose.Attribute.String({ name: 'testAttributeNameNotMatchingPropertyName' }),
    __metadata("design:type", String)
], TestableTable.prototype, "testAttributeNaming", void 0);
__decorate([
    _1.Dyngoose.$PrimaryKey('id', 'title'),
    __metadata("design:type", _1.Dyngoose.Query.PrimaryKey)
], TestableTable, "primaryKey", void 0);
__decorate([
    _1.Dyngoose.$GlobalSecondaryIndex({ hashKey: 'title', projection: 'ALL' }),
    __metadata("design:type", _1.Dyngoose.Query.GlobalSecondaryIndex)
], TestableTable, "titleIndex", void 0);
__decorate([
    _1.Dyngoose.$DocumentClient(),
    __metadata("design:type", _1.Dyngoose.DocumentClient)
], TestableTable, "documentClient", void 0);
TestableTable = __decorate([
    _1.Dyngoose.$Table({
        name: `testable-${Math.random()}`,
    })
], TestableTable);
exports.TestableTable = TestableTable;
before(async () => {
    await TestableTable.createTable();
});
after(async () => {
    await TestableTable.deleteTable();
});
//# sourceMappingURL=setup-tests.spec.js.map