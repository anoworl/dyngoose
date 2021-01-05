import { DynamoDB } from 'aws-sdk';
import { DynamoAttributeType } from '../../dynamo-attribute-types';
import { IAttributeType } from '../../interfaces/attribute-type.interface';
import { NumberAttributeMetadata } from '../../metadata/attribute-types/number.metadata';
import { AttributeType } from '../../tables/attribute-type';
declare type Value = number | BigInt;
declare type Metadata = NumberAttributeMetadata;
export declare class NumberAttributeType extends AttributeType<Value, Metadata> implements IAttributeType<Value> {
    type: DynamoAttributeType;
    toDynamo(value: Value): DynamoDB.AttributeValue;
    fromDynamo(value: DynamoDB.AttributeValue): Value | null;
}
export {};
