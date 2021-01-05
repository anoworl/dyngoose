import { DynamoDB } from 'aws-sdk';
import { DynamoAttributeType } from '../../dynamo-attribute-types';
import { IAttributeType } from '../../interfaces/attribute-type.interface';
import { StringAttributeMetadata } from '../../metadata/attribute-types/string.metadata';
import { AttributeType } from '../../tables/attribute-type';
declare type Value = DynamoDB.StringAttributeValue;
declare type Metadata = StringAttributeMetadata;
export declare class StringAttributeType extends AttributeType<Value, Metadata> implements IAttributeType<Value> {
    type: DynamoAttributeType;
    toDynamo(value: Value): DynamoDB.AttributeValue;
}
export {};
