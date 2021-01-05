"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTableInput = void 0;
const lodash_1 = require("lodash");
const errors_1 = require("../errors");
function createTableInput(schema, forCloudFormation = false) {
    const params = {
        TableName: schema.name,
        AttributeDefinitions: [
            {
                AttributeName: schema.primaryKey.hash.name,
                AttributeType: schema.primaryKey.hash.type.type,
            },
        ],
        KeySchema: [
            {
                AttributeName: schema.primaryKey.hash.name,
                KeyType: 'HASH',
            },
        ],
    };
    if (schema.options.billingMode === 'PAY_PER_REQUEST') {
        params.BillingMode = 'PAY_PER_REQUEST';
    }
    else {
        params.ProvisionedThroughput = {
            ReadCapacityUnits: schema.throughput.read,
            WriteCapacityUnits: schema.throughput.write,
        };
    }
    if (schema.primaryKey.range != null) {
        params.AttributeDefinitions.push({
            AttributeName: schema.primaryKey.range.name,
            AttributeType: schema.primaryKey.range.type.type,
        });
        params.KeySchema.push({
            AttributeName: schema.primaryKey.range.name,
            KeyType: 'RANGE',
        });
    }
    if (schema.options.encrypted === true) {
        if (forCloudFormation) {
            params.SSESpecification = {
                SSEEnabled: true,
            };
        }
        else {
            params.SSESpecification = { Enabled: true };
        }
    }
    if (schema.options.stream != null) {
        if (typeof schema.options.stream === 'boolean') {
            params.StreamSpecification = {
                StreamEnabled: true,
                StreamViewType: 'NEW_AND_OLD_IMAGES',
            };
        }
        else {
            params.StreamSpecification = schema.options.stream;
        }
        // CloudFormation template syntax is slightly different than the input for the CreateTable operation
        // so we delete the StreamEnabled because it is not valid within CloudFormation templates
        if (forCloudFormation) {
            delete params.StreamSpecification.StreamEnabled;
        }
    }
    if (schema.localSecondaryIndexes.length > 0) {
        params.LocalSecondaryIndexes = schema.localSecondaryIndexes.map((indexMetadata) => {
            const KeySchema = [
                {
                    AttributeName: schema.primaryKey.hash.name,
                    KeyType: 'HASH',
                },
                {
                    AttributeName: indexMetadata.range.name,
                    KeyType: 'RANGE',
                },
            ];
            // make sure this attribute is defined in the AttributeDefinitions
            if (params.AttributeDefinitions.find((ad) => indexMetadata.range.name === ad.AttributeName) == null) {
                params.AttributeDefinitions.push({
                    AttributeName: indexMetadata.range.name,
                    AttributeType: indexMetadata.range.type.type,
                });
            }
            const index = {
                IndexName: indexMetadata.name,
                KeySchema,
                Projection: {
                    ProjectionType: indexMetadata.projection == null ? 'ALL' : indexMetadata.projection,
                },
            };
            if (indexMetadata.nonKeyAttributes != null && indexMetadata.nonKeyAttributes.length > 0) {
                if (indexMetadata.projection !== 'INCLUDE') {
                    throw new errors_1.SchemaError(`Invalid configuration for LocalSecondaryIndex ${schema.name}/${indexMetadata.name}. nonKeyAttributes can only be used with projection INCLUDE.`);
                }
                index.Projection.NonKeyAttributes = indexMetadata.nonKeyAttributes;
            }
            return index;
        });
    }
    if (schema.globalSecondaryIndexes.length > 0) {
        params.GlobalSecondaryIndexes = schema.globalSecondaryIndexes.map((indexMetadata) => {
            const KeySchema = [{
                    AttributeName: indexMetadata.hash.name,
                    KeyType: 'HASH',
                }];
            // make sure this attribute is defined in the AttributeDefinitions
            if (params.AttributeDefinitions.find((ad) => indexMetadata.hash.name === ad.AttributeName) == null) {
                params.AttributeDefinitions.push({
                    AttributeName: indexMetadata.hash.name,
                    AttributeType: indexMetadata.hash.type.type,
                });
            }
            if (indexMetadata.range != null) {
                // make sure the rangeKey is defined in the AttributeDefinitions
                if (params.AttributeDefinitions.find((ad) => indexMetadata.range.name === ad.AttributeName) == null) {
                    params.AttributeDefinitions.push({
                        AttributeName: indexMetadata.range.name,
                        AttributeType: indexMetadata.range.type.type,
                    });
                }
                KeySchema.push({
                    AttributeName: indexMetadata.range.name,
                    KeyType: 'RANGE',
                });
            }
            // by default, indexes will share the same throughput as the table
            const throughput = indexMetadata.throughput == null ? schema.throughput : indexMetadata.throughput;
            const index = {
                IndexName: indexMetadata.name,
                KeySchema,
                Projection: {
                    ProjectionType: indexMetadata.projection == null ? 'ALL' : indexMetadata.projection,
                },
                ProvisionedThroughput: {
                    ReadCapacityUnits: throughput.read,
                    WriteCapacityUnits: throughput.write,
                },
            };
            if (indexMetadata.nonKeyAttributes != null && indexMetadata.nonKeyAttributes.length > 0) {
                if (indexMetadata.projection !== 'INCLUDE') {
                    throw new errors_1.SchemaError(`Invalid configuration for GlobalSecondaryIndex ${schema.name}/${indexMetadata.name}. nonKeyAttributes can only be used with projection INCLUDE.`);
                }
                index.Projection.NonKeyAttributes = indexMetadata.nonKeyAttributes;
            }
            return index;
        });
    }
    if (forCloudFormation && schema.timeToLiveAttribute != null) {
        params.TimeToLiveSpecification = {
            AttributeName: schema.timeToLiveAttribute.name,
            Enabled: true,
        };
    }
    params.AttributeDefinitions = lodash_1.uniqBy(params.AttributeDefinitions, (attr) => attr.AttributeName);
    return params;
}
exports.createTableInput = createTableInput;
//# sourceMappingURL=create-table-input.js.map