import { IThroughput } from '../interfaces';
import * as Metadata from '../metadata';
import { ITable } from '../table';
export interface GlobalSecondaryIndexOptions {
    hashKey: string;
    rangeKey?: string;
    name?: string;
    projection?: Metadata.Index.GlobalSecondaryIndexProjection;
    nonKeyAttributes?: string[];
    throughput?: IThroughput | number;
}
export declare function GlobalSecondaryIndex(options: GlobalSecondaryIndexOptions): (table: ITable<any>, propertyName: string) => void;
