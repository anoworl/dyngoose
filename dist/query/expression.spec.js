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
const expression_1 = require("./expression");
describe('query/expression', () => {
    let DummyTable = class DummyTable extends Dyngoose.Table {
    };
    __decorate([
        Dyngoose.Attribute.String(),
        __metadata("design:type", String)
    ], DummyTable.prototype, "id", void 0);
    __decorate([
        Dyngoose.Attribute.String(),
        __metadata("design:type", String)
    ], DummyTable.prototype, "customer", void 0);
    __decorate([
        Dyngoose.Attribute.String(),
        __metadata("design:type", String)
    ], DummyTable.prototype, "someString", void 0);
    __decorate([
        Dyngoose.Attribute.Number(),
        __metadata("design:type", Number)
    ], DummyTable.prototype, "someNumber", void 0);
    __decorate([
        Dyngoose.Attribute.Boolean(),
        __metadata("design:type", Boolean)
    ], DummyTable.prototype, "someBool", void 0);
    __decorate([
        Dyngoose.Attribute.Map({
            attributes: {
                first: Dyngoose.Attribute.String(),
                second: Dyngoose.Attribute.String(),
            },
        }),
        __metadata("design:type", Object)
    ], DummyTable.prototype, "someMap", void 0);
    __decorate([
        Dyngoose.Attribute.Map({
            attributes: {
                map: Dyngoose.Attribute.Map({
                    attributes: {
                        first: Dyngoose.Attribute.String(),
                        second: Dyngoose.Attribute.String(),
                    },
                }),
            },
        }),
        __metadata("design:type", Object)
    ], DummyTable.prototype, "someDeepMap", void 0);
    __decorate([
        Dyngoose.Attribute.String(),
        __metadata("design:type", String)
    ], DummyTable.prototype, "someNonExistAttr", void 0);
    __decorate([
        Dyngoose.$PrimaryKey('id', 'customer'),
        __metadata("design:type", Dyngoose.Query.PrimaryKey)
    ], DummyTable, "primaryKey", void 0);
    __decorate([
        Dyngoose.$GlobalSecondaryIndex({ hashKey: 'customer' }),
        __metadata("design:type", Dyngoose.Query.GlobalSecondaryIndex)
    ], DummyTable, "customerIndex", void 0);
    __decorate([
        Dyngoose.$GlobalSecondaryIndex({ hashKey: 'id', rangeKey: 'someNumber' }),
        __metadata("design:type", Dyngoose.Query.GlobalSecondaryIndex)
    ], DummyTable, "someIndex", void 0);
    DummyTable = __decorate([
        Dyngoose.$Table({ name: 'QueryExpressionDummyTable' })
    ], DummyTable);
    const schema = DummyTable.schema;
    describe('buildQueryExpression', () => {
        it('works with single simple values', () => {
            chai_1.expect(expression_1.buildQueryExpression(schema, { someBool: true })).to.deep.equal({
                FilterExpression: '#a0 = :v0',
                ExpressionAttributeNames: {
                    '#a0': 'someBool',
                },
                ExpressionAttributeValues: {
                    ':v0': { BOOL: true },
                },
            });
            chai_1.expect(expression_1.buildQueryExpression(schema, { customer: 'tiny twig' }, DummyTable.customerIndex.metadata)).to.deep.equal({
                KeyConditionExpression: '#a0 = :v0',
                ExpressionAttributeNames: {
                    '#a0': 'customer',
                },
                ExpressionAttributeValues: {
                    ':v0': { S: 'tiny twig' },
                },
            });
        });
        it('works with complex filters', () => {
            chai_1.expect(expression_1.buildQueryExpression(schema, [{ customer: 'tiny twig' }], DummyTable.customerIndex.metadata)).to.deep.equal({
                KeyConditionExpression: '#a0 = :v0',
                ExpressionAttributeNames: {
                    '#a0': 'customer',
                },
                ExpressionAttributeValues: {
                    ':v0': { S: 'tiny twig' },
                },
            });
        });
        it('works with compound keys', () => {
            chai_1.expect(expression_1.buildQueryExpression(schema, {
                'someMap.first': 'bobby',
            })).to.deep.equal({
                FilterExpression: '#a00.#a01 = :v0',
                ExpressionAttributeNames: {
                    '#a00': 'someMap',
                    '#a01': 'first',
                },
                ExpressionAttributeValues: {
                    ':v0': { S: 'bobby' },
                },
            });
        });
        it('works with deep compound keys', () => {
            chai_1.expect(expression_1.buildQueryExpression(schema, {
                'someDeepMap.map.first': 'bobby',
            })).to.deep.equal({
                FilterExpression: '#a00.#a01.#a02 = :v0',
                ExpressionAttributeNames: {
                    '#a00': 'someDeepMap',
                    '#a01': 'map',
                    '#a02': 'first',
                },
                ExpressionAttributeValues: {
                    ':v0': { S: 'bobby' },
                },
            });
        });
        it('works with multiple simple values', () => {
            chai_1.expect(expression_1.buildQueryExpression(schema, {
                id: 'someUniqueValue',
                someNumber: 10,
                someBool: true,
            }, schema.primaryKey)).to.deep.equal({
                KeyConditionExpression: '#a0 = :v0',
                FilterExpression: '#a1 = :v1 AND #a2 = :v2',
                ExpressionAttributeNames: {
                    '#a0': 'id',
                    '#a1': 'someNumber',
                    '#a2': 'someBool',
                },
                ExpressionAttributeValues: {
                    ':v0': { S: 'someUniqueValue' },
                    ':v1': { N: '10' },
                    ':v2': { BOOL: true },
                },
            });
        });
        it('works with special operators', () => {
            chai_1.expect(expression_1.buildQueryExpression(schema, {
                id: ['<>', 'someValue'],
                customer: 'tiny twig',
                someNumber: ['>', 100],
                someBool: true,
            })).to.deep.equal({
                FilterExpression: '#a0 <> :v0 AND #a1 = :v1 AND #a2 > :v2 AND #a3 = :v3',
                ExpressionAttributeNames: {
                    '#a0': 'id',
                    '#a1': 'customer',
                    '#a2': 'someNumber',
                    '#a3': 'someBool',
                },
                ExpressionAttributeValues: {
                    ':v0': { S: 'someValue' },
                    ':v1': { S: 'tiny twig' },
                    ':v2': { N: '100' },
                    ':v3': { BOOL: true },
                },
            });
            chai_1.expect(expression_1.buildQueryExpression(schema, {
                customer: 'tiny twig',
                someNumber: ['<', 100],
                someBool: true,
            })).to.deep.equal({
                FilterExpression: '#a0 = :v0 AND #a1 < :v1 AND #a2 = :v2',
                ExpressionAttributeNames: {
                    '#a0': 'customer',
                    '#a1': 'someNumber',
                    '#a2': 'someBool',
                },
                ExpressionAttributeValues: {
                    ':v0': { S: 'tiny twig' },
                    ':v1': { N: '100' },
                    ':v2': { BOOL: true },
                },
            });
        });
        it('you can include or exclude an array of values', () => {
            chai_1.expect(expression_1.buildQueryExpression(schema, {
                someString: ['excludes', ['Apples', 'Carrots']],
            })).to.deep.equal({
                FilterExpression: '#a0 NOT IN (:v00, :v01)',
                ExpressionAttributeNames: {
                    '#a0': 'someString',
                },
                ExpressionAttributeValues: {
                    ':v00': { S: 'Apples' },
                    ':v01': { S: 'Carrots' },
                },
            });
        });
        it('works with between operator', () => {
            chai_1.expect(expression_1.buildQueryExpression(schema, {
                someNumber: ['between', 100, 200],
            })).to.deep.equal({
                FilterExpression: '#a0 BETWEEN :vl0 AND :vu0',
                ExpressionAttributeNames: {
                    '#a0': 'someNumber',
                },
                ExpressionAttributeValues: {
                    ':vl0': { N: '100' },
                    ':vu0': { N: '200' },
                },
            });
        });
        it('works with contains operator', () => {
            chai_1.expect(expression_1.buildQueryExpression(schema, {
                someString: ['contains', 'hello world'],
                someBool: true,
            })).to.deep.equal({
                FilterExpression: 'contains(#a0, :v0) AND #a1 = :v1',
                ExpressionAttributeNames: {
                    '#a0': 'someString',
                    '#a1': 'someBool',
                },
                ExpressionAttributeValues: {
                    ':v0': { S: 'hello world' },
                    ':v1': { BOOL: true },
                },
            });
        });
        it('works with includes/IN operator', () => {
            chai_1.expect(expression_1.buildQueryExpression(schema, {
                someString: ['includes', ['opt1', 'opt2']],
                someNumber: ['<=', -100],
                someBool: true,
            })).to.deep.equal({
                FilterExpression: '#a0 IN (:v00, :v01) AND #a1 <= :v1 AND #a2 = :v2',
                ExpressionAttributeNames: {
                    '#a0': 'someString',
                    '#a1': 'someNumber',
                    '#a2': 'someBool',
                },
                ExpressionAttributeValues: {
                    ':v00': { S: 'opt1' },
                    ':v01': { S: 'opt2' },
                    ':v1': { N: '-100' },
                    ':v2': { BOOL: true },
                },
            });
        });
        it('does not allow includes/IN operator in key conditions', () => {
            chai_1.expect(expression_1.buildQueryExpression(schema, {
                id: ['includes', ['opt1', 'opt2']],
                someNumber: ['<=', -100],
                someBool: true,
            })).to.deep.equal({
                FilterExpression: '#a0 IN (:v00, :v01) AND #a1 <= :v1 AND #a2 = :v2',
                ExpressionAttributeNames: {
                    '#a0': 'id',
                    '#a1': 'someNumber',
                    '#a2': 'someBool',
                },
                ExpressionAttributeValues: {
                    ':v00': { S: 'opt1' },
                    ':v01': { S: 'opt2' },
                    ':v1': { N: '-100' },
                    ':v2': { BOOL: true },
                },
            });
        });
        // it('works with includes/IN operators within QueryFilter', () => {
        //   expect(buildQueryExpression(schema, {
        //     someString: {
        //       operator: Query.OPERATOR.IN,
        //       value: ['opt1', 'opt2'],
        //     },
        //     someNumber: {
        //       operator: Query.OPERATOR.LTE,
        //       value: -100,
        //     },
        //     someBool: true,
        //   })).to.deep.equal({
        //     FilterExpression: '#a0 IN (:v00, :v01) AND #a1 <= :v1 AND #a2 = :v2',
        //     ExpressionAttributeNames: {
        //       '#a0': 'someString',
        //       '#a1': 'someNumber',
        //       '#a2': 'someBool',
        //     },
        //     ExpressionAttributeValues: {
        //       ':v00': { S: 'opt1' },
        //       ':v01': { S: 'opt2' },
        //       ':v1': { N: '-100' },
        //       ':v2': { BOOL: true },
        //     },
        //   })
        // })
        it('works with OR operator', () => {
            chai_1.expect(expression_1.buildQueryExpression(schema, [
                { someNumber: 10 },
                'OR',
                { someNumber: 11 },
            ])).to.deep.equal({
                FilterExpression: '#a0 = :v0 OR #a0 = :v1',
                ExpressionAttributeNames: {
                    '#a0': 'someNumber',
                },
                ExpressionAttributeValues: {
                    ':v0': { N: '10' },
                    ':v1': { N: '11' },
                },
            });
            chai_1.expect(expression_1.buildQueryExpression(schema, [
                {
                    id: ['includes', ['opt1', 'opt2']],
                },
                [{ someNumber: 10 }, 'OR', { someNumber: 11 }],
                [
                    { someString: 'test', someBool: true },
                    'OR',
                    { someString: 'other', someBool: false },
                ],
            ])).to.deep.equal({
                FilterExpression: '#a0 IN (:v00, :v01) AND (#a1 = :v1 OR #a1 = :v2) AND ((#a2 = :v3 AND #a3 = :v4) OR (#a2 = :v5 AND #a3 = :v6))',
                ExpressionAttributeNames: {
                    '#a0': 'id',
                    '#a1': 'someNumber',
                    '#a2': 'someString',
                    '#a3': 'someBool',
                },
                ExpressionAttributeValues: {
                    ':v00': { S: 'opt1' },
                    ':v01': { S: 'opt2' },
                    ':v1': { N: '10' },
                    ':v2': { N: '11' },
                    ':v3': { S: 'test' },
                    ':v4': { BOOL: true },
                    ':v5': { S: 'other' },
                    ':v6': { BOOL: false },
                },
            });
        });
        it('works with attribute_not_exists operator', () => {
            chai_1.expect(expression_1.buildQueryExpression(schema, {
                someNonExistAttr: ['not exists'],
                someNumber: ['>', 100],
                someBool: true,
            })).to.deep.equal({
                FilterExpression: 'attribute_not_exists(#a0) AND #a1 > :v1 AND #a2 = :v2',
                ExpressionAttributeNames: {
                    '#a0': 'someNonExistAttr',
                    '#a1': 'someNumber',
                    '#a2': 'someBool',
                },
                ExpressionAttributeValues: {
                    ':v1': { N: '100' },
                    ':v2': { BOOL: true },
                },
            });
        });
        it('builds key conditions when an index is provided', () => {
            chai_1.expect(expression_1.buildQueryExpression(schema, {
                id: 'some id',
                someNumber: ['>', 100],
                someBool: true,
            }, DummyTable.someIndex.metadata)).to.deep.equal({
                KeyConditionExpression: '#a0 = :v0 AND #a1 > :v1',
                FilterExpression: '#a2 = :v2',
                ExpressionAttributeNames: {
                    '#a0': 'id',
                    '#a1': 'someNumber',
                    '#a2': 'someBool',
                },
                ExpressionAttributeValues: {
                    ':v0': { S: 'some id' },
                    ':v1': { N: '100' },
                    ':v2': { BOOL: true },
                },
            });
        });
    });
});
//# sourceMappingURL=expression.spec.js.map