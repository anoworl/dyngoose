import { DynamoDB } from 'aws-sdk';
import { Attribute } from '../attribute';
import { DynamoAttributeTypes } from '../dynamo-attribute-types';
import { IAttributeType } from '../interfaces/attribute-type.interface';
import { AttributeMetadata } from '../metadata/attribute';
import { ITable, Table } from '../table';
import { Schema } from './schema';
export declare class AttributeType<Value, Metadata extends AttributeMetadata<Value>> implements IAttributeType<Value> {
    protected record: Table;
    protected propertyName: string;
    protected metadata?: Metadata | undefined;
    type: DynamoAttributeTypes;
    private __attribute;
    constructor(record: Table, propertyName: string, metadata?: Metadata | undefined);
    get attribute(): Attribute<Value>;
    protected get table(): ITable<any>;
    protected get schema(): Schema;
    decorate(): void;
    toDynamo(value: Value, attribute: Attribute<Value>): DynamoDB.AttributeValue;
    fromDynamo(attributeValue: DynamoDB.AttributeValue, attribute: Attribute<Value>): Value | null;
}
