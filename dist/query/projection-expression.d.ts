import { DynamoDB } from 'aws-sdk';
import { ITable, Table } from '../table';
interface IProjectionExpression {
    ProjectionExpression: DynamoDB.ProjectionExpression;
    ExpressionAttributeNames?: DynamoDB.ExpressionAttributeNameMap;
}
export declare function buildProjectionExpression(tableClass: typeof Table | ITable<any>, attributes: string[]): IProjectionExpression;
export {};
