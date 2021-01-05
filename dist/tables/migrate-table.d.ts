import { DynamoDB } from 'aws-sdk';
import { Schema } from './schema';
export declare function migrateTable(schema: Schema, waitForReady?: boolean): Promise<DynamoDB.TableDescription>;
