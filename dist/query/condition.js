"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Condition = void 0;
class Condition {
    constructor(search, attributeName) {
        this.search = search;
        this._not = false;
        this.key = attributeName;
        return this;
    }
    not() {
        this._not = !this._not;
        return this;
    }
    eq(value) {
        if (this._not) {
            this.filter = ['<>', value];
        }
        else {
            this.filter = ['=', value];
        }
        return this.finalize();
    }
    lt(value) {
        if (this._not) {
            this.filter = ['>=', value];
        }
        else {
            this.filter = ['<', value];
        }
        return this.finalize();
    }
    lte(value) {
        if (this._not) {
            this.filter = ['>', value];
        }
        else {
            this.filter = ['<=', value];
        }
        return this.finalize();
    }
    gt(value) {
        if (this._not) {
            this.filter = ['<=', value];
        }
        else {
            this.filter = ['>', value];
        }
        return this.finalize();
    }
    gte(value) {
        if (this._not) {
            this.filter = ['<', value];
        }
        else {
            this.filter = ['>=', value];
        }
        return this.finalize();
    }
    beginsWith(value) {
        this.filter = ['beginsWith', value];
        return this.finalize();
    }
    contains(value) {
        if (this._not) {
            this.filter = ['not contains', value];
        }
        else {
            this.filter = ['contains', value];
        }
        return this.finalize();
    }
    exists() {
        if (this._not) {
            this.filter = ['not exists'];
        }
        else {
            this.filter = ['exists'];
        }
        return this.finalize();
    }
    includes(...values) {
        if (this._not) {
            this.filter = ['excludes', values];
        }
        else {
            this.filter = ['includes', values];
        }
        return this.finalize();
    }
    excludes(...values) {
        if (this._not) {
            this.filter = ['includes', values];
        }
        else {
            this.filter = ['excludes', values];
        }
        return this.finalize();
    }
    between(start, end) {
        this.filter = ['between', start, end];
        return this.finalize();
    }
    null() {
        if (this._not) {
            this.filter = ['not null'];
        }
        else {
            this.filter = ['null'];
        }
        return this.finalize();
    }
    finalize() {
        const key = this.key;
        this.search.addFilterGroup([
            {
                [key]: this.filter,
            },
        ]);
        return this.search;
    }
}
exports.Condition = Condition;
//# sourceMappingURL=condition.js.map