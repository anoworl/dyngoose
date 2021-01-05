import { DynamoDB } from 'aws-sdk';
import { Attribute } from '../attribute';
import { IThroughput } from '../interfaces';
import * as Metadata from '../metadata';
import { ITable, Table } from '../table';
export declare class Schema {
    private readonly table;
    isDyngoose: boolean;
    options: Metadata.Table;
    /**
     * The TableName in DynamoDB
     */
    get name(): string;
    primaryKey: Metadata.Index.PrimaryKey;
    timeToLiveAttribute?: Attribute<Date>;
    globalSecondaryIndexes: Metadata.Index.GlobalSecondaryIndex[];
    localSecondaryIndexes: Metadata.Index.LocalSecondaryIndex[];
    /**
     * The desired Throughput for this table in DynamoDB
     */
    throughput: IThroughput;
    /**
     * Holds the DynamoDB Client for the table
     */
    dynamo: DynamoDB;
    private readonly attributes;
    constructor(table: ITable<any>);
    setMetadata(metadata: Metadata.Table): void;
    defineAttributeProperties(): void;
    defineGlobalSecondaryIndexes(): void;
    defineLocalSecondaryIndexes(): void;
    definePrimaryKeyProperty(): void;
    setThroughput(throughput: number | IThroughput): void;
    getAttributes(): IterableIterator<[string, Attribute<any>]>;
    getAttributeByName(attributeName: string): Attribute<any>;
    getAttributeByPropertyName(propertyName: string): Attribute<any>;
    addAttribute(attribute: Attribute<any>): Attribute<any>;
    setPrimaryKey(hashKey: string, rangeKey: string | undefined, propertyName: string): void;
    createTableInput(forCloudFormation?: boolean): DynamoDB.CreateTableInput;
    createCloudFormationResource(): any;
    toDynamo(record: Table | Map<string, any>): DynamoDB.AttributeMap;
}
