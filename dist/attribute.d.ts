import { DynamoDB } from 'aws-sdk';
import { IAttributeType } from './interfaces/attribute-type.interface';
import { AttributeMetadata } from './metadata/attribute';
export declare class Attribute<Value> {
    readonly propertyName: string;
    readonly type: IAttributeType<Value>;
    metadata: AttributeMetadata<Value>;
    name: string;
    constructor(propertyName: string, type: IAttributeType<Value>, metadata?: AttributeMetadata<Value>);
    /**
     * Set the default value for an attribute, if no value is currently set
     */
    getDefaultValue(): Value | null;
    /**
     * Convert the given value for this attribute to a DynamoDB AttributeValue
     */
    toDynamo(value: Value | null): DynamoDB.AttributeValue | null;
    toDynamoAssert(value: any): DynamoDB.AttributeValue;
    /**
     * Convert DynamoDB raw response to understandable data
     */
    fromDynamo(attributeValue: DynamoDB.AttributeValue | null): Value | null;
}
