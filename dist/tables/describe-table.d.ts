import { DynamoDB } from 'aws-sdk';
import { Schema } from './schema';
export declare function describeTable(schema: Schema): Promise<DynamoDB.TableDescription>;
