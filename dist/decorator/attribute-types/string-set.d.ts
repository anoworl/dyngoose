import { DynamoDB } from 'aws-sdk';
import { DynamoAttributeType } from '../../dynamo-attribute-types';
import { IAttributeType } from '../../interfaces/attribute-type.interface';
import { StringSetAttributeMetadata } from '../../metadata/attribute-types/string-set.metadata';
import { AttributeType } from '../../tables/attribute-type';
declare type Value = DynamoDB.StringSetAttributeValue;
declare type Metadata = StringSetAttributeMetadata;
export declare class StringSetAttributeType extends AttributeType<Value, Metadata> implements IAttributeType<Value> {
    type: DynamoAttributeType;
}
export {};
