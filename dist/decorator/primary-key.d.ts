import { ITable } from '../table';
export declare function PrimaryKey(hashKey: string, rangeKey?: string): (tableClass: ITable<any>, propertyKey: string) => void;
