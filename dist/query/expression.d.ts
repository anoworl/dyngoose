import { DynamoDB } from 'aws-sdk';
import * as Metadata from '../metadata';
import { Table } from '../table';
import { Schema } from '../tables/schema';
import { Filters } from './filters';
interface Expression {
    ExpressionAttributeNames: DynamoDB.ExpressionAttributeNameMap;
    ExpressionAttributeValues?: DynamoDB.ExpressionAttributeValueMap;
    FilterExpression?: string;
    KeyConditionExpression?: string;
}
declare type ConditionOperator = '=' | '<>' | '<' | '<=' | '>' | '>=' | 'beginsWith' | 'between';
export declare const keyConditionAllowedOperators: ConditionOperator[];
declare type IndexMetadata = Metadata.Index.GlobalSecondaryIndex | Metadata.Index.PrimaryKey;
export declare function buildQueryExpression<T extends Table>(schema: Schema, filters: Filters<T>, index?: IndexMetadata): Expression;
export {};
