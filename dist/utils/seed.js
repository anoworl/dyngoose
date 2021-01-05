"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-var-requires */
const fs_1 = require("fs");
const _ = require("lodash");
const path_1 = require("path");
const is_1 = require("./is");
async function seedTables(input) {
    const log = input.log == null ? console.log : input.log;
    const seedFiles = fs_1.readdirSync(input.seedsDirectory);
    const tableFileSuffix = input.tableFileSuffix.substr(0, 1) === '.' ? input.tableFileSuffix : `.${input.tableFileSuffix}`;
    for (const file of seedFiles) {
        const filePath = path_1.join(input.seedsDirectory, file);
        let records = [];
        if (file.endsWith('.seed.json')) {
            records = JSON.parse(fs_1.readFileSync(filePath, 'utf8'));
        }
        else if (file.endsWith('.seed.js')) {
            const seedModule = require(filePath);
            if (typeof seedModule === 'function') {
                const seedModuleReturn = seedModule();
                // if the function returns a promise, handle that
                if (seedModuleReturn instanceof Promise) {
                    records = await seedModuleReturn;
                }
                else {
                    records = seedModuleReturn;
                }
            }
            else if (seedModule instanceof Promise) {
                records = await seedModule;
            }
            else {
                records = seedModule;
            }
        }
        if (records.length > 0) {
            const modelName = file.replace(/.seed.(json|js)/, '');
            const modelPath = path_1.join(input.tablesDirectory, `${modelName}${tableFileSuffix}`);
            const prefix = input.tableNamePrefix == null ? '' : input.tableNamePrefix;
            const suffix = input.tableNameSuffix == null ? '' : input.tableNameSuffix;
            log(`Seeding ${modelName}`);
            const tableFileExports = require(modelPath);
            let hasSeeded = false;
            for (const ExportedProperty of _.values(tableFileExports)) {
                if (is_1.isDyngooseTableClass(ExportedProperty)) {
                    const ExportedTable = ExportedProperty;
                    ExportedTable.schema.options.name = `${prefix}${ExportedTable.schema.name}${suffix}`;
                    for (const data of records) {
                        if (input.preventDuplication === true) {
                            const hashKey = ExportedTable.schema.primaryKey.hash.name;
                            const rangeKey = ExportedTable.schema.primaryKey.range == null ? null : ExportedTable.schema.primaryKey.range.name;
                            const primaryKey = ExportedTable[ExportedTable.schema.primaryKey.propertyName];
                            const existingRecord = await primaryKey.get(data[hashKey], rangeKey == null ? undefined : data[rangeKey]);
                            if (existingRecord == null) {
                                continue;
                            }
                        }
                        const record = ExportedTable.new(data);
                        await record.save();
                    }
                    hasSeeded = true;
                }
            }
            if (!hasSeeded) {
                throw new Error(`Failed to seed ${modelName}`);
            }
        }
    }
}
exports.default = seedTables;
//# sourceMappingURL=seed.js.map