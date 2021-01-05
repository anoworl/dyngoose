"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-var-requires */
const fs_1 = require("fs");
const _ = require("lodash");
const path_1 = require("path");
const is_1 = require("./is");
async function migrateTables(input) {
    const tableFiles = fs_1.readdirSync(input.tablesDirectory);
    const tables = [];
    const log = input.log == null ? console.log : input.log;
    const prefix = input.tableNamePrefix == null ? '' : input.tableNamePrefix;
    const suffix = input.tableNameSuffix == null ? '' : input.tableNameSuffix;
    log('Running Dyngoose migration utility…');
    for (const file of tableFiles) {
        if (file.endsWith(input.tableFileSuffix)) {
            const tableFile = path_1.join(input.tablesDirectory, file);
            const tableFileExports = require(tableFile);
            for (const exportedProperty of _.values(tableFileExports)) {
                if (is_1.isDyngooseTableClass(exportedProperty)) {
                    tables.push(exportedProperty);
                }
            }
        }
    }
    for (const SomeTable of tables) {
        SomeTable.schema.options.name = `${prefix}${SomeTable.schema.name}${suffix}`;
        log(`Migrating ${SomeTable.schema.name}`);
        await SomeTable.migrateTable();
    }
}
exports.default = migrateTables;
//# sourceMappingURL=migrate.js.map