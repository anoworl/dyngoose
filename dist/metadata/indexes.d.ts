import { Attribute } from '../attribute';
import { IThroughput } from '../interfaces';
export interface PrimaryKey {
    readonly propertyName: string;
    readonly hash: Attribute<any>;
    readonly range?: Attribute<any>;
}
export declare type GlobalSecondaryIndexProjection = 'ALL' | 'KEYS_ONLY' | 'INCLUDE';
export interface GlobalSecondaryIndex {
    readonly name: string;
    readonly propertyName: string;
    readonly hash: Attribute<any>;
    readonly range?: Attribute<any>;
    readonly projection?: GlobalSecondaryIndexProjection;
    readonly nonKeyAttributes?: string[];
    readonly throughput?: IThroughput;
}
export declare type LocalSecondaryIndexProjection = GlobalSecondaryIndexProjection;
export interface LocalSecondaryIndex {
    readonly name: string;
    readonly propertyName: string;
    readonly range: Attribute<any>;
    readonly projection?: LocalSecondaryIndexProjection;
    readonly nonKeyAttributes?: string[];
}
