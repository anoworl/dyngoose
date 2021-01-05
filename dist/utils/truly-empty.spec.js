"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const truly_empty_1 = require("./truly-empty");
describe('utils/empty', () => {
    describe('isTrulyEmpty', () => {
        it('nil', () => {
            chai_1.expect(truly_empty_1.isTrulyEmpty(null)).to.eq(true);
            chai_1.expect(truly_empty_1.isTrulyEmpty(undefined)).to.eq(true);
        });
        it('booleans', () => {
            chai_1.expect(truly_empty_1.isTrulyEmpty(true)).to.eq(false);
            chai_1.expect(truly_empty_1.isTrulyEmpty(false)).to.eq(false);
        });
        it('dates', () => {
            chai_1.expect(truly_empty_1.isTrulyEmpty(new Date())).to.eq(false);
            chai_1.expect(truly_empty_1.isTrulyEmpty(new Date(0))).to.eq(false);
        });
        it('strings', () => {
            chai_1.expect(truly_empty_1.isTrulyEmpty('')).to.eq(true);
            chai_1.expect(truly_empty_1.isTrulyEmpty(' ')).to.eq(true);
            chai_1.expect(truly_empty_1.isTrulyEmpty('a')).to.eq(false);
        });
        it('numbers', () => {
            chai_1.expect(truly_empty_1.isTrulyEmpty(0)).to.eq(false);
            chai_1.expect(truly_empty_1.isTrulyEmpty(0.0)).to.eq(false);
            chai_1.expect(truly_empty_1.isTrulyEmpty(100.500)).to.eq(false);
        });
        it('objects', () => {
            chai_1.expect(truly_empty_1.isTrulyEmpty({})).to.eq(true);
            chai_1.expect(truly_empty_1.isTrulyEmpty({ a: undefined })).to.eq(true);
            chai_1.expect(truly_empty_1.isTrulyEmpty({ a: true })).to.eq(false);
        });
        it('arrays', () => {
            chai_1.expect(truly_empty_1.isTrulyEmpty([])).to.eq(true);
            chai_1.expect(truly_empty_1.isTrulyEmpty([null])).to.eq(true);
            chai_1.expect(truly_empty_1.isTrulyEmpty([true])).to.eq(false);
            chai_1.expect(truly_empty_1.isTrulyEmpty([false])).to.eq(false);
        });
    });
});
//# sourceMappingURL=truly-empty.spec.js.map