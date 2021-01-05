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
exports.MapTestTable = void 0;
const chai_1 = require("chai");
const Dyngoose = require("../..");
let MapTestTable = class MapTestTable extends Dyngoose.Table {
};
__decorate([
    Dyngoose.Attribute.Number(),
    __metadata("design:type", Number)
], MapTestTable.prototype, "id", void 0);
__decorate([
    Dyngoose.Attribute.Map({
        attributes: {
            first: Dyngoose.Attribute.String(),
            middle: Dyngoose.Attribute.String(),
            last: Dyngoose.Attribute.String(),
            level: Dyngoose.Attribute.Number(),
            nick: Dyngoose.Attribute.String(),
        },
    }),
    __metadata("design:type", Object)
], MapTestTable.prototype, "person", void 0);
__decorate([
    Dyngoose.Attribute.Map({
        attributes: {
            name: Dyngoose.Attribute.Map({
                attributes: {
                    first: Dyngoose.Attribute.String({ lowercase: true }),
                    last: Dyngoose.Attribute.String({ uppercase: true }),
                },
            }),
            address: Dyngoose.Attribute.Map({
                attributes: {
                    line1: Dyngoose.Attribute.String(),
                    city: Dyngoose.Attribute.String(),
                    state: Dyngoose.Attribute.String(),
                },
            }),
        },
    }),
    __metadata("design:type", Object)
], MapTestTable.prototype, "contact", void 0);
__decorate([
    Dyngoose.$PrimaryKey('id'),
    __metadata("design:type", Dyngoose.Query.PrimaryKey)
], MapTestTable, "primaryKey", void 0);
__decorate([
    Dyngoose.$DocumentClient(),
    __metadata("design:type", Dyngoose.DocumentClient)
], MapTestTable, "documentClient", void 0);
MapTestTable = __decorate([
    Dyngoose.$Table({
        name: `MapTest-${Math.random()}`,
    })
], MapTestTable);
exports.MapTestTable = MapTestTable;
describe('AttributeType/Map', () => {
    before(async () => {
        await MapTestTable.createTable();
    });
    after(async () => {
        await MapTestTable.deleteTable();
    });
    it('should store the object as a map', async () => {
        const record = MapTestTable.new({
            id: 1,
            person: {
                first: 'John',
                middle: 'Jacobs',
                last: 'Smith',
                level: 1,
            },
        });
        await record.save();
        const loaded = await MapTestTable.primaryKey.get(1);
        chai_1.expect(loaded === null || loaded === void 0 ? void 0 : loaded.getAttributeDynamoValue('person')).to.deep.eq({
            M: {
                first: { S: 'John' },
                middle: { S: 'Jacobs' },
                last: { S: 'Smith' },
                level: { N: '1' },
            },
        });
        chai_1.expect(loaded === null || loaded === void 0 ? void 0 : loaded.person.first).to.eq('John');
        chai_1.expect(loaded === null || loaded === void 0 ? void 0 : loaded.getAttributeDynamoValue('person')).to.deep.eq({
            M: {
                first: { S: 'John' },
                middle: { S: 'Jacobs' },
                last: { S: 'Smith' },
                level: { N: '1' },
            },
        });
        chai_1.expect(loaded === null || loaded === void 0 ? void 0 : loaded.toJSON()).to.deep.eq({
            id: 1,
            person: {
                first: 'John',
                middle: 'Jacobs',
                last: 'Smith',
                level: 1,
            },
        });
    });
    it('should allow you to query using child attributes', async () => {
        const record = MapTestTable.new({
            id: 2,
            person: {
                first: 'Sally',
                middle: 'Shelly',
                last: 'Samuel',
                level: 1,
            },
        });
        await record.save();
        const result = await MapTestTable.search({
            'person.first': 'Sally',
        }).exec();
        chai_1.expect(result.count).to.eq(1);
        chai_1.expect(result[0].person.first).to.eq('Sally');
        chai_1.expect(result.records[0].person.first).to.eq('Sally');
        // ensure you can look through the result as an array
        for (const doc of result) {
            chai_1.expect(doc.person.first).to.eq('Sally');
        }
        const searchOutput = await MapTestTable.search()
            .filter('person', 'first').eq('Sally')
            .exec();
        chai_1.expect(searchOutput.count).to.eq(1);
        chai_1.expect(searchOutput[0].person.first).to.eq('Sally');
    });
    it('should allow maps within maps', async () => {
        var _a, _b;
        const record = MapTestTable.new({
            id: 3,
            contact: {
                name: {
                    first: 'Homer',
                    last: 'Simpson',
                },
                address: {
                    line1: '742 Evergreen Terrace',
                    city: 'Springfield',
                    state: 'Simpcity',
                },
            },
        });
        chai_1.expect((_a = record.contact) === null || _a === void 0 ? void 0 : _a.name.first).to.eq('homer');
        chai_1.expect((_b = record.contact) === null || _b === void 0 ? void 0 : _b.name.last).to.eq('SIMPSON');
        await record.save();
        const loaded = await MapTestTable.primaryKey.get(3);
        chai_1.should().exist(loaded);
        if (loaded != null) {
            chai_1.expect(loaded.getAttributeDynamoValue('contact')).to.deep.eq({
                M: {
                    name: {
                        M: {
                            first: { S: 'homer' },
                            last: { S: 'SIMPSON' },
                        },
                    },
                    address: {
                        M: {
                            line1: { S: '742 Evergreen Terrace' },
                            city: { S: 'Springfield' },
                            state: { S: 'Simpcity' },
                        },
                    },
                },
            });
            chai_1.expect(loaded.contact.name.first).to.eq('homer');
            chai_1.expect(loaded.contact.name.last).to.eq('SIMPSON');
            chai_1.expect(loaded.toJSON()).to.deep.eq({
                id: 3,
                contact: {
                    name: {
                        first: 'homer',
                        last: 'SIMPSON',
                    },
                    address: {
                        line1: '742 Evergreen Terrace',
                        city: 'Springfield',
                        state: 'Simpcity',
                    },
                },
            });
        }
    });
    it('should allow you to query using deep child attributes', async () => {
        const record = MapTestTable.new({
            id: 4,
            contact: {
                name: {
                    first: 'Marge',
                    last: 'Simpson',
                },
            },
        });
        await record.save();
        const result = await MapTestTable.search({
            'contact.name.first': 'Marge',
        }).exec();
        chai_1.expect(result.count).to.eq(1);
        chai_1.expect(result.length).to.eq(1);
        chai_1.expect(result[0].contact.name.first).to.eq('marge');
        const searchOutput = await MapTestTable.search()
            .filter('contact', 'name', 'first').eq('marge')
            .exec();
        chai_1.expect(searchOutput.count).to.eq(1);
        chai_1.expect(searchOutput.length).to.eq(1);
        chai_1.expect(searchOutput[0].contact.name.first).to.eq('marge');
    });
});
//# sourceMappingURL=map.spec.js.map