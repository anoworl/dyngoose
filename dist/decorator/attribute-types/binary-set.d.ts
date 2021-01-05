import { DynamoDB } from 'aws-sdk';
import { DynamoAttributeType } from '../../dynamo-attribute-types';
import { IAttributeType } from '../../interfaces/attribute-type.interface';
import { BinarySetAttributeMetadata } from '../../metadata/attribute-types/binary-set.metadata';
import { AttributeType } from '../../tables/attribute-type';
declare type Value = DynamoDB.BinarySetAttributeValue;
declare type Metadata = BinarySetAttributeMetadata;
export declare class BinarySetAttributeType extends AttributeType<Value, Metadata> implements IAttributeType<Value> {
    type: DynamoAttributeType;
}
export {};
