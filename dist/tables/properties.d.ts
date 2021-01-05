import { Table } from '../table';
export declare type TableProperty<T> = Exclude<Exclude<keyof T, keyof Table>, Function>;
export declare type TableProperties<T> = {
    [key in TableProperty<T>]?: T[key];
};
