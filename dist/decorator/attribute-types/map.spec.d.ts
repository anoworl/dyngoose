import * as Dyngoose from '../..';
interface ITestMap {
    first: string;
    middle: string;
    last: string;
    level: number;
    nick?: string;
}
interface ITestContactMap {
    name: {
        first: string;
        last: string;
    };
    address?: {
        line1: string;
        city: string;
        state: string;
    };
}
export declare class MapTestTable extends Dyngoose.Table {
    static readonly primaryKey: Dyngoose.Query.PrimaryKey<MapTestTable, number, void>;
    static readonly documentClient: Dyngoose.DocumentClient<MapTestTable>;
    id: number;
    person: ITestMap;
    contact: ITestContactMap;
}
export {};
