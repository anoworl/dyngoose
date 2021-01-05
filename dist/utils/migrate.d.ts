export interface MigrateTablesInput {
    tablesDirectory: string;
    tableFileSuffix: string;
    tableNamePrefix?: string;
    tableNameSuffix?: string;
    log?: Function;
}
export default function migrateTables(input: MigrateTablesInput): Promise<void>;
