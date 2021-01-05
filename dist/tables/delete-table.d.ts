import { DynamoDB } from 'aws-sdk';
import { Schema } from './schema';
export declare function deleteTable(schema: Schema): Promise<DynamoDB.TableDescription | undefined>;
