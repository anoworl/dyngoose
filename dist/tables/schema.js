"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Schema = void 0;
const errors_1 = require("../errors");
const Query = require("../query");
const create_table_input_1 = require("./create-table-input");
class Schema {
    constructor(table) {
        this.table = table;
        this.isDyngoose = true;
        // Additional table indexes
        this.globalSecondaryIndexes = [];
        this.localSecondaryIndexes = [];
        // List of attributes this table has
        this.attributes = new Map();
    }
    /**
     * The TableName in DynamoDB
     */
    get name() {
        var _a;
        return ((_a = this.options) === null || _a === void 0 ? void 0 : _a.name) == null ? '' : this.options.name;
    }
    setMetadata(metadata) {
        this.options = metadata;
        this.setThroughput(this.options.throughput != null ? this.options.throughput : {
            read: 5,
            write: 5,
            autoScaling: {
                targetUtilization: 70,
                minCapacity: 5,
                maxCapacity: 40000,
            },
        });
    }
    defineAttributeProperties() {
        // for each attribute, add the get and set property handlers
        for (const attribute of this.attributes.values()) {
            Object.defineProperty(this.table.prototype, attribute.propertyName, {
                configurable: true,
                enumerable: true,
                get() {
                    return this.getAttribute(attribute.name);
                },
                set(value) {
                    this.setAttribute(attribute.name, value);
                },
            });
        }
    }
    defineGlobalSecondaryIndexes() {
        for (const indexMetadata of this.globalSecondaryIndexes) {
            Object.defineProperty(this.table, indexMetadata.propertyName, {
                value: new Query.GlobalSecondaryIndex(this.table, indexMetadata),
                writable: false,
            });
        }
    }
    defineLocalSecondaryIndexes() {
        for (const indexMetadata of this.localSecondaryIndexes) {
            Object.defineProperty(this.table, indexMetadata.propertyName, {
                value: new Query.LocalSecondaryIndex(this.table, indexMetadata),
                writable: false,
            });
        }
    }
    definePrimaryKeyProperty() {
        Object.defineProperty(this.table, this.primaryKey.propertyName, {
            value: new Query.PrimaryKey(this.table, this.primaryKey),
            writable: false,
        });
    }
    setThroughput(throughput) {
        if (typeof throughput === 'number') {
            this.throughput = {
                read: throughput,
                write: throughput,
            };
        }
        else {
            this.throughput = throughput;
            if (this.throughput.autoScaling === true) {
                this.throughput.autoScaling = {
                    targetUtilization: 70,
                    minCapacity: 5,
                    maxCapacity: 40000,
                };
            }
        }
        if (this.throughput.read == null || this.throughput.write == null) {
            throw new errors_1.SchemaError(`Schema for ${this.name} has invalid throughput ${JSON.stringify(this.throughput)}`);
        }
    }
    getAttributes() {
        return this.attributes.entries();
    }
    getAttributeByName(attributeName) {
        let attribute;
        if (attributeName.includes('.')) {
            const nameSegments = attributeName.split('.');
            const firstSegment = nameSegments.shift();
            if (firstSegment != null) {
                attribute = this.attributes.get(firstSegment);
                for (const nameSegment of nameSegments) {
                    if (attribute != null) {
                        attribute = attribute.type.attributes[nameSegment];
                    }
                }
            }
        }
        else {
            attribute = this.attributes.get(attributeName);
        }
        if (attribute == null) {
            throw new errors_1.SchemaError(`Schema for ${this.name} has no attribute named ${attributeName}`);
        }
        else {
            return attribute;
        }
    }
    getAttributeByPropertyName(propertyName) {
        for (const attribute of this.attributes.values()) {
            if (attribute.propertyName === propertyName) {
                return attribute;
            }
        }
        throw new errors_1.SchemaError(`Schema for ${this.name} has no attribute by property name ${propertyName}`);
    }
    addAttribute(attribute) {
        if (this.attributes.has(attribute.name)) {
            throw new errors_1.SchemaError(`Table ${this.name} has several attributes named ${attribute.name}`);
        }
        this.attributes.set(attribute.name, attribute);
        return attribute;
    }
    setPrimaryKey(hashKey, rangeKey, propertyName) {
        const hash = this.getAttributeByName(hashKey);
        if (hash == null) {
            throw new errors_1.SchemaError(`Specified hashKey ${hashKey} attribute for the PrimaryKey for table ${this.name} does not exist`);
        }
        let range;
        if (rangeKey != null) {
            range = this.getAttributeByName(rangeKey);
            if (range == null) {
                throw new errors_1.SchemaError(`Specified rangeKey ${rangeKey} attribute for the PrimaryKey for table ${this.name} does not exist`);
            }
        }
        this.primaryKey = {
            propertyName,
            hash,
            range,
        };
    }
    createTableInput(forCloudFormation = false) {
        return create_table_input_1.createTableInput(this, forCloudFormation);
    }
    createCloudFormationResource() {
        return this.createTableInput(true);
    }
    toDynamo(record) {
        const attributeMap = {};
        for (const [attributeName, attribute] of this.attributes.entries()) {
            // there is a quirk with the typing of Table.get, where we exclude all the default Table properties and therefore
            // on the Table class itself, no property name is possible, so we pass 'as never' below to fix a linter warning
            // but this actually works as expected
            const attributeValue = attribute.toDynamo(record.get(attribute.propertyName));
            if (attributeValue != null) {
                attributeMap[attributeName] = attributeValue;
            }
        }
        return attributeMap;
    }
}
exports.Schema = Schema;
//# sourceMappingURL=schema.js.map