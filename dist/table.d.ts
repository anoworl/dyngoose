import { DynamoDB } from 'aws-sdk';
import { Attribute } from './attribute';
import { DocumentClient } from './document-client';
import * as Events from './events';
import { Filters, UpdateConditions } from './query/filters';
import { MagicSearch, MagicSearchInput } from './query/search';
import { TableProperties, TableProperty } from './tables/properties';
import { Schema } from './tables/schema';
declare type StaticThis<T> = new () => T;
export declare class Table {
    static get schema(): Schema;
    static set schema(schema: Schema);
    static get documentClient(): DocumentClient<Table>;
    static set documentClient(documentClient: DocumentClient<Table>);
    private static __schema;
    private static __documentClient;
    /**
     * Creates a new record for this table.
     *
     * This method is strongly typed and it is recommended you use over `new Table(…)`
     */
    static new<T extends Table>(this: StaticThis<T>, values?: TableProperties<T>): T;
    /**
     * Creates a new instance of Table with values from a given `DynamoDB.AttributeMap`.
     *
     * This assumes the record exists in DynamoDB and saving this record will
     * default to using an `UpdateItem` operation rather than a `PutItem` operation
     * upon being saved.
     */
    static fromDynamo<T extends Table>(this: StaticThis<T>, attributes: DynamoDB.AttributeMap, entireDocument?: boolean): T;
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
    static fromJSON<T extends Table>(this: StaticThis<T>, json: {
        [attribute: string]: any;
    }): T;
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
    static search<T extends Table>(this: StaticThis<T>, filters?: Filters<T>, input?: MagicSearchInput<T>): MagicSearch<T>;
    /**
     * Creates the table in DynamoDB.
     *
     * You can also use {@link Table.migrateTable} to create and automatically
     * migrate and indexes that need changes.
     */
    static createTable(waitForReady?: boolean): Promise<DynamoDB.TableDescription>;
    /**
     * Migrates the table to match updated specifications.
     *
     * This will create new indexes and delete legacy indexes.
     */
    static migrateTable(): Promise<DynamoDB.TableDescription>;
    /**
     * Deletes the table from DynamoDB.
     *
     * Be a bit careful with this in production.
     */
    static deleteTable(): Promise<DynamoDB.TableDescription | undefined>;
    static describeTable(): Promise<DynamoDB.TableDescription>;
    protected get table(): typeof Table;
    private __attributes;
    private __original;
    private __updatedAttributes;
    private __deletedAttributes;
    private __putRequired;
    private __entireDocumentIsKnown;
    /**
     * Create a new Table record by attribute names, not property names.
     *
     * To create a strongly-typed record by property names, use {@link Table.new}.
    */
    constructor(values?: {
        [key: string]: any;
    });
    /**
     * Apply any default values for attributes.
     */
    applyDefaults(): this;
    /**
     * Load values from an a DynamoDB.AttributeMap into this Table record.
     *
     * This assumes the values are loaded directly from DynamoDB, and after
     * setting the attributes it resets the attributes pending update and
     * deletion.
     */
    fromDynamo(values: DynamoDB.AttributeMap, entireDocument?: boolean): this;
    /**
     * Converts the current attribute values into a DynamoDB.AttributeMap which
     * can be sent directly to DynamoDB within a PutItem, UpdateItem, or similar
     * request.
    */
    toDynamo(): DynamoDB.AttributeMap;
    /**
     * Get the DynamoDB.Key for this record.
     */
    getDynamoKey(): DynamoDB.Key;
    /**
     * Get the list of attributes pending update.
     *
     * The result includes attributes that have also been deleted. To get just
     * the list of attributes pending deletion, use {@link this.getDeletedAttributes}.
     *
     * If you want to easily know if this record has updates pending, use {@link this.hasChanges}.
     */
    getUpdatedAttributes(): string[];
    /**
     * Get the list of attributes pending deletion.
     *
     * To get all the attributes that have been updated, use {@link this.getUpdatedAttributes}.
     *
     * If you want to easily know if this record has updates pending, use {@link this.hasChanges}.
     */
    getDeletedAttributes(): string[];
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
    fromJSON(json: {
        [attribute: string]: any;
    }, ignoreArbitrary?: boolean): this;
    /**
     * Returns the DynamoDB.AttributeValue value for an attribute.
     *
     * To get the transformed value, use {@link this.getAttribute}
     */
    getAttributeDynamoValue(attributeName: string): DynamoDB.AttributeValue;
    /**
     * Gets the JavaScript transformed value for an attribute.
     *
     * While you can read values directly on the Table record by it's property name,
     * sometimes you need to get attribute.
     *
     * Unlike {@link this.get}, this excepts the attribute name, not the property name.
     */
    getAttribute(attributeName: string): DynamoDB.AttributeValue;
    /**
     * Sets the DynamoDB.AttributeValue for an attribute.
     *
     * To set the value from a JavaScript object, use {@link this.setAttribute}
    */
    setAttributeDynamoValue(attributeName: string, attributeValue: DynamoDB.AttributeValue): this;
    /**
     * Sets the value of an attribute by attribute name from a JavaScript object.
     *
     * - To set an attribute value by property name, use {@link this.set}.
     */
    setAttribute(attributeName: string, value: any, force?: boolean): this;
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
    setAttributes(values: {
        [name: string]: any;
    }): this;
    /**
     * Marks an attribute to be deleted.
     */
    deleteAttribute(attributeName: string): this;
    /**
     * Marks several attributes to be deleted.
     */
    deleteAttributes(attributes: string[]): this;
    /**
     * Sets a value of an attribute by it's property name.
     *
     * - To set several attribute values by property names, use {@link this.setValues}.
     * - To set an attribute value by an attribute name, use {@link this.setAttribute}.
     * - To set several attribute values by attribute names, use {@link this.setAttributes}.
     */
    set<P extends TableProperty<this>>(propertyName: P | string, value: this[P]): this;
    /**
     * Gets a value of an attribute by it's property name.
     *
     * - To get a value by an attribute name, use {@link this.getAttribute}.
     * - To get the entire record, use {@link this.toJSON}.
     */
    get<P extends TableProperty<this>>(propertyName: P | string): this[P];
    /**
     * Delete the value of an attribute by it's property name.
     *
     * - To get a value by an attribute name, use {@link this.deleteAttribute}.
     * - To delete the entire record, use {@link this.delete}.
     */
    del<P extends TableProperty<this>>(propertyName: P | string): this;
    /**
     * Sets several attribute values on this record by property names.
     *
     * - To set an attribute value by property name, use {@link this.set}.
     * - To set an attribute value by an attribute names, use {@link this.setAttribute}.
     * - To set several attribute values by attribute names, use {@link this.setAttributes}.
     */
    setValues(values: TableProperties<this>): this;
    /**
     * Determines if this record has any attributes pending an update or deletion.
     */
    hasChanges(): boolean;
    /**
     * Return the original values for the record, if it was loaded from DynamoDB.
     */
    getOriginalValues(): DynamoDB.AttributeMap;
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
    save(conditions?: UpdateConditions<this>, meta?: any): Promise<void>;
    /**
     * Determine the best save operation method to use based upon the item's current state
     */
    getSaveOperation(): 'put' | 'update';
    /**
     * Saves this record without calling beforeSave or considering if there are changed attributes.
     *
     * Most of the time, you should use {@link this.save} instead.
     */
    forceSave(conditions?: UpdateConditions<this>, meta?: any): Promise<void>;
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
    delete(conditions?: UpdateConditions<this>, meta?: any): Promise<void>;
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
    toJSON(): {
        [key: string]: any;
    };
    protected beforeSave(meta?: any, conditions?: any): Promise<boolean>;
    /**
     * After a record is deleted, this handler is called.
     */
    protected afterSave(event: Events.AfterSaveEvent): Promise<void>;
    /**
     * Before a record is deleted, this handler is called and if the promise
     * resolves as false, the delete request will be ignored.
     */
    protected beforeDelete(meta?: any): Promise<boolean>;
    /**
     * After a record is deleted, this handler is called.
     */
    protected afterDelete(output: DynamoDB.DeleteItemOutput, meta?: any): Promise<void>;
    protected setByAttribute(attribute: Attribute<any>, value: any, force?: boolean): this;
    protected getByAttribute(attribute: Attribute<any>): any;
    /**
     * Returns a list of attributes that should not be allowed when Table.fromJSON is used.
     */
    protected static getBlacklist(): string[];
}
export interface ITable<T extends Table> {
    schema: Schema;
    documentClient: DocumentClient<T>;
    new (): T;
    fromDynamo: (attributes: DynamoDB.AttributeMap, entireDocument?: boolean) => T;
}
export {};
