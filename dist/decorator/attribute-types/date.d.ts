import { DynamoDB } from 'aws-sdk';
import { DynamoAttributeType } from '../../dynamo-attribute-types';
import { IAttributeType } from '../../interfaces/attribute-type.interface';
import { DateAttributeMetadata } from '../../metadata/attribute-types/date.metadata';
import { Table } from '../../table';
import { AttributeType } from '../../tables/attribute-type';
declare type Value = Date;
declare type Metadata = DateAttributeMetadata;
export declare class DateAttributeType extends AttributeType<Value, Metadata> implements IAttributeType<Value> {
    type: DynamoAttributeType;
    constructor(record: Table, propertyName: string, metadata?: Metadata);
    decorate(): void;
    getDefault(): Value | null;
    toDynamo(dt: Value): DynamoDB.AttributeValue;
    fromDynamo(attributeValue: DynamoDB.AttributeValue): Value | null;
    fromJSON(dt: string | number): Value;
    toJSON(dt: Value): string | number;
}
export {};
