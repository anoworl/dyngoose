"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-var-requires */
const fs_1 = require("fs");
const _ = require("lodash");
const path_1 = require("path");
const table_1 = require("../table");
async function createCloudFormationResources(input) {
    const tableFiles = fs_1.readdirSync(input.tablesDirectory);
    const tables = [];
    const resources = {};
    const log = input.log == null ? console.log : input.log;
    const prefix = input.tableNamePrefix == null ? '' : input.tableNamePrefix;
    const suffix = input.tableNameSuffix == null ? '' : input.tableNameSuffix;
    log('Running Dyngoose CloudFormation template generation utility…');
    for (const file of tableFiles) {
        if (file.endsWith(input.tableFileSuffix)) {
            const tableFile = path_1.join(input.tablesDirectory, file);
            const tableFileExports = require(tableFile);
            for (const exportedProperty of _.values(tableFileExports)) {
                if (exportedProperty.prototype instanceof table_1.Table) {
                    tables.push(exportedProperty);
                }
            }
        }
    }
    for (const SomeTable of tables) {
        const properties = SomeTable.schema.createCloudFormationResource();
        const tableName = properties.TableName;
        let resourceName = _.upperFirst(SomeTable.name);
        if (!resourceName.toLowerCase().endsWith('table')) {
            resourceName += 'Table';
        }
        properties.TableName = `${prefix}${tableName}${suffix}`;
        log(`Generated ${tableName} into ${resourceName} resource`);
        resources[resourceName] = {
            Type: 'AWS::DynamoDB::Table',
            Properties: properties,
        };
    }
    return resources;
}
exports.default = createCloudFormationResources;
//# sourceMappingURL=cloudformation.js.map