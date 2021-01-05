import { DynamoAttributeType } from '../../dynamo-attribute-types';
import { IAttributeType } from '../../interfaces/attribute-type.interface';
import { BooleanAttributeMetadata, BooleanAttributeValue } from '../../metadata/attribute-types/boolean.metadata';
import { AttributeType } from '../../tables/attribute-type';
declare type Value = BooleanAttributeValue;
declare type Metadata = BooleanAttributeMetadata;
export declare class BooleanAttributeType extends AttributeType<Value, Metadata> implements IAttributeType<Value> {
    type: DynamoAttributeType;
}
export {};
