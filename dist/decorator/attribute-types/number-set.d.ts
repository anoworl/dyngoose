import { DynamoDB } from 'aws-sdk';
import { DynamoAttributeType } from '../../dynamo-attribute-types';
import { IAttributeType } from '../../interfaces/attribute-type.interface';
import { NumberSetAttributeMetadata } from '../../metadata/attribute-types/number-set.metadata';
import { AttributeType } from '../../tables/attribute-type';
declare type Value = Array<number | BigInt>;
declare type Metadata = NumberSetAttributeMetadata;
export declare class NumberSetAttributeType extends AttributeType<Value, Metadata> implements IAttributeType<Value> {
    type: DynamoAttributeType;
    toDynamo(values: Value): DynamoDB.AttributeValue;
    fromDynamo(value: DynamoDB.AttributeValue): Value | null;
}
export {};
