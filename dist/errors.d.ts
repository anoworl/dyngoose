import { AWSError } from 'aws-sdk';
import { BatchWriteItemOutput } from 'aws-sdk/clients/dynamodb';
export declare class DyngooseError extends Error {
    constructor(message: string);
}
export declare class TableError extends DyngooseError {
}
export declare class SchemaError extends DyngooseError {
}
export declare class QueryError extends DyngooseError {
}
export declare class ValidationError extends DyngooseError {
}
export declare class BatchError extends DyngooseError {
    errors: AWSError[];
    output: BatchWriteItemOutput;
    constructor(message: string, errors: AWSError[], output: BatchWriteItemOutput);
}
