import { Table } from '../table';
export declare type AttributeNames<T extends Table> = Exclude<Exclude<keyof T, keyof Table>, Function>;
export declare type Filter<Type> = [
    '=',
    Type
] | [
    '<>',
    Type
] | // not equals
[
    '<',
    Type
] | [
    '<=',
    Type
] | [
    '>',
    Type
] | [
    '>=',
    Type
] | [
    'beginsWith',
    Exclude<Type, number>
] | // causes a type error when a number is used with beginsWith, which is unsupported by DynamoDB
[
    'between',
    Type,
    Type
] | [
    'includes',
    Type[]
] | [
    'excludes',
    Type[]
] | [
    'contains',
    Type
] | // contains can be used on a list or a string attribute
[
    'not contains',
    Type
] | // not contains can be used on a list or a string attribute
[
    'null'
] | [
    'not null'
] | [
    'exists'
] | [
    'not exists'
];
export declare type Filters<T extends Table> = {
    [A in AttributeNames<T>]?: T[A] | Filter<T[A]>;
};
export declare type ComplexFilters<T extends Table> = Array<Filters<T> | ComplexFilters<T> | 'OR'>;
export declare type UpdateConditions<T extends Table> = Filters<T>;
