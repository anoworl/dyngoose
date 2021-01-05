import { DynamoDB } from 'aws-sdk';
import { Attribute } from '../../attribute';
import { DynamoAttributeType } from '../../dynamo-attribute-types';
import { IAttributeType } from '../../interfaces/attribute-type.interface';
import { MapAttributeMetadata } from '../../metadata/attribute-types/map.metadata';
import { Table } from '../../table';
import { AttributeType } from '../../tables/attribute-type';
export declare class MapAttributeType<Value> extends AttributeType<Value, MapAttributeMetadata<Value>> implements IAttributeType<Value> {
    protected metadata: MapAttributeMetadata<Value>;
    type: DynamoAttributeType;
    attributes: {
        [key: string]: Attribute<any>;
    };
    constructor(record: Table, propertyName: string, metadata: MapAttributeMetadata<Value>);
    getDefault(): Value;
    toDynamo(mapValue: Value): DynamoDB.AttributeValue;
    fromDynamo(attributeValue: DynamoDB.AttributeValue): Value;
}
