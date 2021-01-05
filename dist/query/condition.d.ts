import { Table } from '../dyngoose';
import { MagicSearch } from './search';
export declare class Condition<T extends Table, Attr, AttributeValueType> {
    private readonly search;
    private readonly key;
    private _not;
    private filter;
    constructor(search: MagicSearch<T>, attributeName: Attr);
    not(): this;
    eq(value: AttributeValueType): MagicSearch<T>;
    lt(value: AttributeValueType): MagicSearch<T>;
    lte(value: AttributeValueType): MagicSearch<T>;
    gt(value: AttributeValueType): MagicSearch<T>;
    gte(value: AttributeValueType): MagicSearch<T>;
    beginsWith(value: Exclude<AttributeValueType, number>): MagicSearch<T>;
    contains(value: AttributeValueType): MagicSearch<T>;
    exists(): MagicSearch<T>;
    includes(...values: AttributeValueType[]): MagicSearch<T>;
    excludes(...values: AttributeValueType[]): MagicSearch<T>;
    between(start: AttributeValueType, end: AttributeValueType): MagicSearch<T>;
    null(): MagicSearch<T>;
    private finalize;
}
