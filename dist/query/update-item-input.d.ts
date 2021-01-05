import { DynamoDB } from 'aws-sdk';
import { Table } from '../table';
import { UpdateConditions } from './filters';
interface UpdateItemInput extends DynamoDB.UpdateItemInput {
    UpdateExpression: string;
}
export declare function getUpdateItemInput<T extends Table>(record: T, conditions?: UpdateConditions<T>): UpdateItemInput;
export {};
