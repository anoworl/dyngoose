"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Table = void 0;
const _ = require("lodash");
const document_client_1 = require("./document-client");
const search_1 = require("./query/search");
const create_table_1 = require("./tables/create-table");
const delete_table_1 = require("./tables/delete-table");
const describe_table_1 = require("./tables/describe-table");
const migrate_table_1 = require("./tables/migrate-table");
const schema_1 = require("./tables/schema");
const truly_empty_1 = require("./utils/truly-empty");
class Table {
    // #endregion properties
    /**
     * Create a new Table record by attribute names, not property names.
     *
     * To create a strongly-typed record by property names, use {@link Table.new}.
    */
    constructor(values) {
        // raw storage for all attributes this record (instance) has
        this.__attributes = {};
        this.__original = {};
        this.__updatedAttributes = [];
        this.__deletedAttributes = [];
        this.__putRequired = true; // true when this is a new record and a putItem is required, false when updateItem can be used
        this.__entireDocumentIsKnown = true;
        if (values != null) {
            for (const key of _.keys(values)) {
                this.setAttribute(key, values[key]);
            }
        }
    }
    // #region static
    // #region static properties
    static get schema() {
        if (this.__schema == null) {
            this.__schema = new schema_1.Schema(this);
        }
        return this.__schema;
    }
    static set schema(schema) {
        this.__schema = schema;
    }
    static get documentClient() {
        if (this.__documentClient == null) {
            this.__documentClient = new document_client_1.DocumentClient(this);
        }
        return this.__documentClient;
    }
    static set documentClient(documentClient) {
        this.__documentClient = documentClient;
    }
    // #endregion static properties
    // #region static methods
    /**
     * Creates a new record for this table.
     *
     * This method is strongly typed and it is recommended you use over `new Table(…)`
     */
    static new(values) {
        const record = new this().applyDefaults();
        if (values != null) {
            record.setValues(values);
        }
        return record;
    }
    /**
     * Creates a new instance of Table with values from a given `DynamoDB.AttributeMap`.
     *
     * This assumes the record exists in DynamoDB and saving this record will
     * default to using an `UpdateItem` operation rather than a `PutItem` operation
     * upon being saved.
     */
    static fromDynamo(attributes, entireDocument = true) {
        return new this().fromDynamo(attributes, entireDocument);
    }
    /**
     * Creates an instance of Table from raw user input. Designs to be used for creating
     * records from requests, like:
     *
     * express.js:
     *   ```app.post('/api/create', (req, res) => {
     *     const card = Card.fromJSON(req.body)
     *   })```
     *
     * Each attribute can optionally define additional validation logic or sanitization
     * of the user input, @see {@link https://github.com/benhutchins/dyngoose/blob/master/docs/Attributes}.
     */
    static fromJSON(json) {
        return new this().fromJSON(json);
    }
    /**
     * Query DynamoDB for what you need.
     *
     * This is a powerful all-around querying method. It will detect the best index available for use,
     * but it ignores indexes that are not set to Projection of `ALL`. To please use the index-specific
     * querying when necessary.
     *
     * This will avoid performing a scan at all cost, but it will fall back to using a scan if necessary.
     *
     * By default, this returns you one "page" of results (allows DynamoDB) to process and return the
     * maximum of items DynamoDB allows. If you want it to internally page for you to return all possible
     * results (be cautious as that can easily cause timeouts for Lambda), specify `{ all: true }` as an
     * input argument for the second argument.
     */
    static search(filters, input = {}) {
        return new search_1.MagicSearch(this, filters, input);
    }
    /**
     * Creates the table in DynamoDB.
     *
     * You can also use {@link Table.migrateTable} to create and automatically
     * migrate and indexes that need changes.
     */
    static async createTable(waitForReady = true) {
        return await create_table_1.createTable(this.schema, waitForReady);
    }
    /**
     * Migrates the table to match updated specifications.
     *
     * This will create new indexes and delete legacy indexes.
     */
    static async migrateTable() {
        return await migrate_table_1.migrateTable(this.schema);
    }
    /**
     * Deletes the table from DynamoDB.
     *
     * Be a bit careful with this in production.
     */
    static async deleteTable() {
        return await delete_table_1.deleteTable(this.schema);
    }
    static async describeTable() {
        return await describe_table_1.describeTable(this.schema);
    }
    // #endregion static methods
    // #endregion static
    // #region properties
    get table() {
        return this.constructor;
    }
    // #region public methods
    /**
     * Apply any default values for attributes.
     */
    applyDefaults() {
        const attributes = this.table.schema.getAttributes();
        for (const [, attribute] of attributes) {
            const defaultValue = attribute.getDefaultValue();
            if (defaultValue != null) {
                this.setByAttribute(attribute, defaultValue);
            }
        }
        return this;
    }
    /**
     * Load values from an a DynamoDB.AttributeMap into this Table record.
     *
     * This assumes the values are loaded directly from DynamoDB, and after
     * setting the attributes it resets the attributes pending update and
     * deletion.
     */
    fromDynamo(values, entireDocument = true) {
        this.__attributes = values;
        // this is an existing record in the database, so when we save it, we need to update
        this.__updatedAttributes = [];
        this.__deletedAttributes = [];
        this.__putRequired = false;
        this.__entireDocumentIsKnown = entireDocument;
        return this;
    }
    /**
     * Converts the current attribute values into a DynamoDB.AttributeMap which
     * can be sent directly to DynamoDB within a PutItem, UpdateItem, or similar
     * request.
    */
    toDynamo() {
        // anytime toDynamo is called, it can generate new default values or manipulate values
        // this keeps the record in sync, so the instance can be used after the record is saved
        const attributeMap = this.table.schema.toDynamo(this);
        for (const attributeName of Object.keys(attributeMap)) {
            if (!_.isEqual(this.__attributes[attributeName], attributeMap[attributeName])) {
                this.__updatedAttributes.push(attributeName);
            }
        }
        this.__attributes = attributeMap;
        return this.__attributes;
    }
    /**
     * Get the DynamoDB.Key for this record.
     */
    getDynamoKey() {
        const hash = this.getAttribute(this.table.schema.primaryKey.hash.name);
        const key = {
            [this.table.schema.primaryKey.hash.name]: this.table.schema.primaryKey.hash.toDynamoAssert(hash),
        };
        if (this.table.schema.primaryKey.range != null) {
            const range = this.getAttribute(this.table.schema.primaryKey.range.name);
            key[this.table.schema.primaryKey.range.name] = this.table.schema.primaryKey.range.toDynamoAssert(range);
        }
        return key;
    }
    /**
     * Get the list of attributes pending update.
     *
     * The result includes attributes that have also been deleted. To get just
     * the list of attributes pending deletion, use {@link this.getDeletedAttributes}.
     *
     * If you want to easily know if this record has updates pending, use {@link this.hasChanges}.
     */
    getUpdatedAttributes() {
        return this.__updatedAttributes;
    }
    /**
     * Get the list of attributes pending deletion.
     *
     * To get all the attributes that have been updated, use {@link this.getUpdatedAttributes}.
     *
     * If you want to easily know if this record has updates pending, use {@link this.hasChanges}.
     */
    getDeletedAttributes() {
        return this.__deletedAttributes;
    }
    /**
     * While similar to setAttributes, this method runs the attribute's defined fromJSON
     * methods to help standardize the attribute values as much as possible.
     *
     * @param {any} json A JSON object
     * @param {boolean} [ignoreArbitrary] Whether arbitrary attributes should be ignored.
     *        When false, unknown attributes will result in an error being thrown.
     *        When true, any non-recognized attribute will be ignored. Useful if you're
     *        passing in raw request body objects or dealing with user input.
     *        Defaults to false.
     */
    fromJSON(json, ignoreArbitrary = false) {
        const blacklist = this.table.getBlacklist();
        _.each(json, (value, propertyName) => {
            let attribute;
            try {
                attribute = this.table.schema.getAttributeByPropertyName(propertyName);
            }
            catch (ex) {
                if (ignoreArbitrary) {
                    return;
                }
                else {
                    throw ex;
                }
            }
            if (!_.includes(blacklist, attribute.name)) {
                if (typeof attribute.type.fromJSON === 'function') {
                    value = attribute.type.fromJSON(value);
                }
                const currentValue = this.getAttribute(attribute.name);
                // compare to current value, to avoid unnecessarily marking attributes as needing to be saved
                if (!_.isEqual(currentValue, value)) {
                    if (truly_empty_1.isTrulyEmpty(value)) {
                        this.deleteAttribute(attribute.name);
                    }
                    else {
                        this.setByAttribute(attribute, value);
                    }
                }
            }
        });
        return this;
    }
    /**
     * Returns the DynamoDB.AttributeValue value for an attribute.
     *
     * To get the transformed value, use {@link this.getAttribute}
     */
    getAttributeDynamoValue(attributeName) {
        return this.__attributes[attributeName];
    }
    /**
     * Gets the JavaScript transformed value for an attribute.
     *
     * While you can read values directly on the Table record by it's property name,
     * sometimes you need to get attribute.
     *
     * Unlike {@link this.get}, this excepts the attribute name, not the property name.
     */
    getAttribute(attributeName) {
        const attribute = this.table.schema.getAttributeByName(attributeName);
        return this.getByAttribute(attribute);
    }
    /**
     * Sets the DynamoDB.AttributeValue for an attribute.
     *
     * To set the value from a JavaScript object, use {@link this.setAttribute}
    */
    setAttributeDynamoValue(attributeName, attributeValue) {
        // save the original value before we update the attributes value
        if (!_.isUndefined(this.__attributes[attributeName]) && _.isUndefined(this.__original[attributeName])) {
            this.__original[attributeName] = this.getAttributeDynamoValue(attributeName);
        }
        this.__attributes[attributeName] = attributeValue;
        // track that this value was updated
        this.__updatedAttributes.push(attributeName);
        _.pull(this.__deletedAttributes, attributeName);
        return this;
    }
    /**
     * Sets the value of an attribute by attribute name from a JavaScript object.
     *
     * - To set an attribute value by property name, use {@link this.set}.
     */
    setAttribute(attributeName, value, force = false) {
        const attribute = this.table.schema.getAttributeByName(attributeName);
        return this.setByAttribute(attribute, value, force);
    }
    /**
     * Sets several attribute values on this record by attribute names.
     *
     * - To set several values by property names, use {@link this.setValues}.
     * - To set a single attribute value by attribute name, use {@link this.setAttribute}.
     * - To set a single attribute value by property name, use {@link this.set}.
     *
     * @param {object} values An object, where the keys are the attribute names,
     *                        and the values are the values you'd like to set.
    */
    setAttributes(values) {
        _.forEach(values, (value, attributeName) => {
            this.setAttribute(attributeName, value);
        });
        return this;
    }
    /**
     * Marks an attribute to be deleted.
     */
    deleteAttribute(attributeName) {
        // delete the attribute as long as it existed and wasn't already null
        if (!_.isNil(this.__attributes[attributeName]) || !this.__entireDocumentIsKnown) {
            this.__attributes[attributeName] = { NULL: true };
            this.__deletedAttributes.push(attributeName);
            _.pull(this.__updatedAttributes, attributeName);
        }
        return this;
    }
    /**
     * Marks several attributes to be deleted.
     */
    deleteAttributes(attributes) {
        for (const attribute of attributes) {
            this.deleteAttribute(attribute);
        }
        return this;
    }
    /**
     * Sets a value of an attribute by it's property name.
     *
     * - To set several attribute values by property names, use {@link this.setValues}.
     * - To set an attribute value by an attribute name, use {@link this.setAttribute}.
     * - To set several attribute values by attribute names, use {@link this.setAttributes}.
     */
    set(propertyName, value) {
        const attribute = this.table.schema.getAttributeByPropertyName(propertyName);
        return this.setByAttribute(attribute, value);
    }
    /**
     * Gets a value of an attribute by it's property name.
     *
     * - To get a value by an attribute name, use {@link this.getAttribute}.
     * - To get the entire record, use {@link this.toJSON}.
     */
    get(propertyName) {
        const attribute = this.table.schema.getAttributeByPropertyName(propertyName);
        return this.getByAttribute(attribute);
    }
    /**
     * Delete the value of an attribute by it's property name.
     *
     * - To get a value by an attribute name, use {@link this.deleteAttribute}.
     * - To delete the entire record, use {@link this.delete}.
     */
    del(propertyName) {
        const attribute = this.table.schema.getAttributeByPropertyName(propertyName);
        return this.deleteAttribute(attribute.name);
    }
    /**
     * Sets several attribute values on this record by property names.
     *
     * - To set an attribute value by property name, use {@link this.set}.
     * - To set an attribute value by an attribute names, use {@link this.setAttribute}.
     * - To set several attribute values by attribute names, use {@link this.setAttributes}.
     */
    setValues(values) {
        for (const key in values) {
            this.set(key, values[key]);
        }
        return this;
    }
    /**
     * Determines if this record has any attributes pending an update or deletion.
     */
    hasChanges() {
        return this.__updatedAttributes.length > 0 || this.__deletedAttributes.length > 0;
    }
    /**
     * Return the original values for the record, if it was loaded from DynamoDB.
     */
    getOriginalValues() {
        return this.__original;
    }
    /**
     * Save this record to DynamoDB.
     *
     * Will check to see if there are changes to the record, if there are none the save request is ignored.
     * To skip this check, use {@link this.forceSave} instead.
     *
     * Calls the {@link this.beforeSave} before saving the record.
     * If {@link this.beforeSave} returns false, the save request is ignored.
     *
     * Automatically determines if the the save should use use a PutItem or UpdateItem request.
     */
    async save(conditions, meta) {
        const allowSave = await this.beforeSave(conditions, meta);
        if (allowSave && this.hasChanges()) {
            await this.forceSave(conditions, meta);
        }
    }
    /**
     * Determine the best save operation method to use based upon the item's current state
     */
    getSaveOperation() {
        let type;
        if (this.__putRequired) {
            this.__putRequired = false;
            type = 'put';
        }
        else {
            type = 'update';
        }
        return type;
    }
    /**
     * Saves this record without calling beforeSave or considering if there are changed attributes.
     *
     * Most of the time, you should use {@link this.save} instead.
     */
    async forceSave(conditions, meta) {
        const type = this.getSaveOperation();
        let output;
        if (type === 'put') {
            output = await this.table.documentClient.put(this, conditions);
            this.__putRequired = false;
        }
        else {
            output = await this.table.documentClient.update(this, conditions);
        }
        // trigger afterSave before clearing values, so the hook can determine what has been changed
        await this.afterSave({
            type,
            output,
            meta,
            deletedAttributes: this.__deletedAttributes,
            updatedAttributes: this.__updatedAttributes,
        });
        // reset internal tracking of changes attributes
        this.__deletedAttributes = [];
        this.__updatedAttributes = [];
    }
    /**
     * Deletes this record from DynamoDB.
     *
     * Before deleting, it will call {@link this.beforeDelete}. If {@link this.beforeDelete}
     * returns false then this record will not be deleted.
     *
     * After deleting, {@link this.afterDelete} will be called.
     *
     * @param {UpdateConditions} conditions Optional conditions
     * @param {any} meta Optional metadata for the action, passed to {@link this.beforeDelete}
     *                   and {@link this.afterDelete}.
     */
    async delete(conditions, meta) {
        const allowDeletion = await this.beforeDelete(meta);
        if (allowDeletion) {
            const output = await this.table.documentClient.delete(this, conditions);
            await this.afterDelete(output, meta);
        }
    }
    /**
     * Convert this record to a JSON-exportable object.
     *
     * Has no consideration for "views" or "permissions", so all attributes
     * will be exported.
     *
     * Export object uses the property names as the object keys. To convert
     * a JSON object back into a Table record, use {@link Table.fromJSON}.
     *
     * Each attribute type can define a custom toJSON and fromJSON method,
     * @see {@link https://github.com/benhutchins/dyngoose/blog/master/docs/Attributes.md#custom-attribute-types}.
     */
    toJSON() {
        const json = {};
        for (const [attributeName, attribute] of this.table.schema.getAttributes()) {
            const propertyName = attribute.propertyName;
            const value = this.getAttribute(attributeName);
            if (!truly_empty_1.isTrulyEmpty(value)) {
                if (_.isFunction(attribute.type.toJSON)) {
                    json[propertyName] = attribute.type.toJSON(value, attribute);
                }
                else {
                    json[propertyName] = value;
                }
            }
        }
        return json;
    }
    // #endregion public methods
    // #region protected methods
    async beforeSave(meta, conditions) {
        return true;
    }
    /**
     * After a record is deleted, this handler is called.
     */
    async afterSave(event) {
        return undefined;
    }
    /**
     * Before a record is deleted, this handler is called and if the promise
     * resolves as false, the delete request will be ignored.
     */
    async beforeDelete(meta) {
        return true;
    }
    /**
     * After a record is deleted, this handler is called.
     */
    async afterDelete(output, meta) {
        return undefined;
    }
    setByAttribute(attribute, value, force = false) {
        const attributeValue = attribute.toDynamo(value);
        // avoid recording the value if it is unchanged, so we do not send it as an updated value during a save
        if (!force && !_.isUndefined(this.__attributes[attribute.name]) && _.isEqual(this.__attributes[attribute.name], attributeValue)) {
            return this;
        }
        if (attributeValue == null) {
            this.deleteAttribute(attribute.name);
        }
        else {
            this.setAttributeDynamoValue(attribute.name, attributeValue);
        }
        return this;
    }
    getByAttribute(attribute) {
        const attributeValue = this.getAttributeDynamoValue(attribute.name);
        const value = attribute.fromDynamo(_.cloneDeep(attributeValue));
        return value;
    }
    /**
     * Returns a list of attributes that should not be allowed when Table.fromJSON is used.
     */
    static getBlacklist() {
        const blacklist = [
            this.schema.primaryKey.hash.name,
        ];
        return blacklist;
    }
}
exports.Table = Table;
//# sourceMappingURL=table.js.map