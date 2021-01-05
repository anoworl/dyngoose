import { DynamoDB } from 'aws-sdk';
import { DynamoAttributeType } from '../../dynamo-attribute-types';
import { IAttributeType } from '../../interfaces/attribute-type.interface';
import { AnyAttributeMetadata } from '../../metadata/attribute-types/any.metadata';
import { AttributeType } from '../../tables/attribute-type';
declare type Value = any;
declare type Metadata = AnyAttributeMetadata;
export declare class AnyAttributeType extends AttributeType<Value, Metadata> implements IAttributeType<Value> {
    type: DynamoAttributeType;
    toDynamo(value: any): any;
    fromDynamo(attributeValue: DynamoDB.AttributeValue): Value | null;
}
export {};
