import { MigrateTablesInput } from './migrate';
export interface SeedTablesInput extends MigrateTablesInput {
    seedsDirectory: string;
    preventDuplication?: boolean;
}
export default function seedTables(input: SeedTablesInput): Promise<void>;
