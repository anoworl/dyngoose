import { Dyngoose } from '.';
export declare class TestableTable extends Dyngoose.Table {
    static readonly primaryKey: Dyngoose.Query.PrimaryKey<TestableTable, number, string>;
    static readonly titleIndex: Dyngoose.Query.GlobalSecondaryIndex<TestableTable>;
    static readonly documentClient: Dyngoose.DocumentClient<TestableTable>;
    generic: any;
    id: number;
    title: string;
    createdAt: Date;
    updatedAt: Date;
    expiresAt: Date;
    unixTimestamp: Date;
    msTimestamp: Date;
    defaultedString: string;
    testString: string;
    lowercaseString: string;
    uppercaseString: string;
    trimmedString: string;
    testNumber: number;
    testNumberSet: Array<BigInt | number>;
    testNumberSetWithDefaults: number[];
    testBigInt: BigInt;
    testAttributeNaming: string;
}
