import { Metadata, Table } from '../..';
import { AnyAttributeType } from './any';
import { BinaryAttributeType } from './binary';
import { BinarySetAttributeType } from './binary-set';
import { BooleanAttributeType } from './boolean';
import { DateAttributeType } from './date';
import { NumberAttributeType } from './number';
import { NumberSetAttributeType } from './number-set';
import { StringAttributeType } from './string';
import { StringSetAttributeType } from './string-set';
interface AttributeTypeMap {
    Any: AnyAttributeType;
    Binary: BinaryAttributeType;
    BinarySet: BinarySetAttributeType;
    Boolean: BooleanAttributeType;
    Date: DateAttributeType;
    Number: NumberAttributeType;
    NumberSet: NumberSetAttributeType;
    String: StringAttributeType;
    StringSet: StringSetAttributeType;
}
interface AttributeMetadataMap {
    Any: Metadata.AttributeType.Any;
    Binary: Metadata.AttributeType.Binary;
    BinarySet: Metadata.AttributeType.BinarySet;
    Boolean: Metadata.AttributeType.Boolean;
    Date: Metadata.AttributeType.Date;
    Number: Metadata.AttributeType.Number;
    NumberSet: Metadata.AttributeType.NumberSet;
    String: Metadata.AttributeType.String;
    StringSet: Metadata.AttributeType.StringSet;
}
export interface AttributeDefinition {
    (record: Table, propertyName: string): void;
    getAttribute: (record: Table, propertyName: string) => any;
}
export declare function Attribute<T extends keyof AttributeTypeMap>(type: T, metadata?: AttributeMetadataMap[T]): AttributeDefinition;
export declare namespace Attribute {
    var Any: (options?: Metadata.AttributeType.Any | undefined) => AttributeDefinition;
    var Binary: (options?: Metadata.AttributeType.Binary | undefined) => AttributeDefinition;
    var BinarySet: (options?: Metadata.AttributeType.BinarySet | undefined) => AttributeDefinition;
    var Boolean: (options?: Metadata.AttributeType.Boolean | undefined) => AttributeDefinition;
    var Date: (options?: Metadata.AttributeType.Date | undefined) => AttributeDefinition;
    var Number: (options?: Metadata.AttributeType.Number | undefined) => AttributeDefinition;
    var NumberSet: (options?: Metadata.AttributeType.NumberSet | undefined) => AttributeDefinition;
    var String: (options?: Metadata.AttributeType.String | undefined) => AttributeDefinition;
    var StringSet: (options?: Metadata.AttributeType.StringSet | undefined) => AttributeDefinition;
    var Map: <Value>(options: Metadata.AttributeType.Map<Value>) => AttributeDefinition;
}
export {};
