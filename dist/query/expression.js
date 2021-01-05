"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildQueryExpression = exports.keyConditionAllowedOperators = void 0;
const _ = require("lodash");
const errors_1 = require("../errors");
exports.keyConditionAllowedOperators = [
    '=',
    '<',
    '<=',
    '>',
    '>=',
    'between',
    'beginsWith',
];
function buildQueryExpression(schema, filters, index) {
    const filterExpression = new FilterExpressionQuery(schema, filters, index);
    const filterConditions = filterExpression.filterConditions;
    const keyConditions = filterExpression.keyConditions;
    const query = {
        ExpressionAttributeValues: filterExpression.values,
        ExpressionAttributeNames: filterExpression.attrs,
    };
    if (_.size(query.ExpressionAttributeValues) === 0) {
        delete query.ExpressionAttributeValues;
    }
    if (filterConditions.length > 0) {
        query.FilterExpression = filterConditions.join(' AND ');
    }
    if (keyConditions.length > 0) {
        query.KeyConditionExpression = keyConditions.join(' AND ');
    }
    return query;
}
exports.buildQueryExpression = buildQueryExpression;
class FilterExpressionQuery {
    constructor(schema, filters, indexMetadata) {
        this.schema = schema;
        this.filters = filters;
        this.indexMetadata = indexMetadata;
        this.attrs = {};
        this.values = {};
        this.filterConditions = [];
        this.keyConditionsMap = [];
        this.attributeNamePrefixMap = [];
        this.valuePrefixMap = [];
        this.parse();
        // double check, we can't filter by the range as a key condition without a value for the HASH
        if (this.keyConditionsMap.length === 1) {
            const condition = this.keyConditionsMap[0];
            const attribute = condition.attribute;
            if (this.isRangeKey(attribute)) {
                this.filterConditions.push(condition.filter);
                this.keyConditionsMap = [];
            }
        }
    }
    get keyConditions() {
        return this.keyConditionsMap.map((condition) => condition.filter);
    }
    parse() {
        if (_.isArray(this.filters) && this.filters.length === 1 && !_.isObjectLike(this.filters[0])) {
            this.filters = this.filters[0];
        }
        if (_.isArray(this.filters)) { // handle ComplexFilters
            const conditions = this.parseComplexFilters(this.filters, false);
            if (conditions.length > 0) {
                this.filterConditions.push(conditions);
            }
        }
        else {
            _.each(this.filters, (value, attrName) => {
                this.handleFilter(attrName, value);
            });
        }
    }
    handleFilter(attrName, value, push = true) {
        const attribute = this.schema.getAttributeByName(attrName);
        let filter;
        if (_.isArray(value)) {
            filter = value;
        }
        else {
            filter = ['=', value];
        }
        const queryValue = this.parseFilter(attribute, filter, attrName);
        if (push && queryValue.query != null) {
            _.extend(this.attrs, queryValue.attrs);
            _.extend(this.values, queryValue.values);
            this.push(attribute, queryValue.query, filter[0]);
        }
        return queryValue;
    }
    parseComplexFilters(complexFilters, child) {
        const orGroups = [];
        let conditions = [];
        for (const filters of complexFilters) {
            if (filters === 'OR') {
                if (conditions.length > 0) {
                    if (conditions.length > 1) {
                        orGroups.push(`(${conditions.join(' AND ')})`);
                    }
                    else {
                        orGroups.push(conditions.join(' AND '));
                    }
                    conditions = [];
                }
            }
            else if (_.isArray(filters)) {
                conditions.push(this.parseComplexFilters(filters, true));
            }
            else {
                _.each(filters, (value, attrName) => {
                    const queryValue = this.handleFilter(attrName, value, false);
                    const attribute = this.schema.getAttributeByName(attrName);
                    if (queryValue.query != null) {
                        _.extend(this.attrs, queryValue.attrs);
                        _.extend(this.values, queryValue.values);
                        if (this.isHashKey(attribute) || this.isRangeKey(attribute)) {
                            let filter;
                            if (_.isArray(value)) {
                                filter = value;
                            }
                            else {
                                filter = ['=', value];
                            }
                            this.push(attribute, queryValue.query, filter[0]);
                        }
                        else {
                            conditions.push(queryValue.query);
                        }
                    }
                });
            }
        }
        // we push the last remaining conditions as the last remaining OR group
        if (conditions.length > 0) {
            if (conditions.length > 1 && child) {
                orGroups.push(`(${conditions.join(' AND ')})`);
            }
            else {
                orGroups.push(conditions.join(' AND '));
            }
        }
        return child ? `(${orGroups.join(' OR ')})` : orGroups.join(' OR ');
    }
    getAttributeNamePrefix(attrName) {
        if (!this.attributeNamePrefixMap.includes(attrName)) {
            this.attributeNamePrefixMap.push(attrName);
        }
        return this.attributeNamePrefixMap.indexOf(attrName).toString();
    }
    getValuePrefix(value) {
        if (!this.valuePrefixMap.includes(value)) {
            this.valuePrefixMap.push(value);
        }
        return this.valuePrefixMap.indexOf(value).toString();
    }
    parseFilter(attr, filter, attrName) {
        const attrs = {};
        const values = {};
        const prefix = this.getAttributeNamePrefix(attrName);
        let query;
        let attrNameMappedTo;
        if (attrName === null || attrName === void 0 ? void 0 : attrName.includes('.')) {
            attrNameMappedTo = attrName;
            attrName.split('.').forEach((attrNameSegment, i) => {
                const attrNameSegmentMappedTo = '#a' + prefix + String(i);
                attrs[attrNameSegmentMappedTo] = attrNameSegment;
                attrNameMappedTo = attrNameMappedTo.replace(attrNameSegment, attrNameSegmentMappedTo);
            });
        }
        else {
            attrNameMappedTo = '#a' + prefix;
            attrs[attrNameMappedTo] = attr.name;
        }
        const operator = filter[0];
        const variableName = ':v' + this.getValuePrefix(filter[1]);
        switch (operator) {
            case '=':
            case '<>':
            case '<':
            case '<=':
            case '>':
            case '>=': {
                const filterValue = attr.toDynamoAssert(filter[1]);
                query = `${attrNameMappedTo} ${operator} ${variableName}`;
                values[variableName] = filterValue;
                break;
            }
            case 'contains':
            case 'not contains':
            case 'beginsWith': {
                /**
                 * Prevent begins_with with number operators, which is not supported by DynamoDB.
                 *
                 * @see {@link https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#query-property}
                 */
                if (operator === 'beginsWith' && attr.type.type === 'N') {
                    throw new errors_1.QueryError('Cannot use beginsWith with number attributes');
                }
                const strValue = attr.toDynamoAssert(filter[1]);
                const queryOperator = operator === 'beginsWith' ? 'begins_with' : operator.replace(' ', '_');
                query = `${queryOperator}(${attrNameMappedTo}, ${variableName})`;
                values[variableName] = strValue;
                break;
            }
            case 'exists':
            case 'not exists': {
                const existsOperator = operator === 'exists' ? 'attribute_exists' : 'attribute_not_exists';
                query = `${existsOperator}(${attrNameMappedTo})`;
                break;
            }
            case 'includes':
            case 'excludes': {
                const filterValues = filter[1];
                const possibleVariableNames = [];
                _.each(filterValues, (possibleValue, possibleValueIndex) => {
                    const value = attr.toDynamoAssert(possibleValue);
                    const possibleVariableName = ':v' + prefix + String(possibleValueIndex);
                    possibleVariableNames.push(possibleVariableName);
                    this.values[possibleVariableName] = value;
                });
                const possibleVariableNamesStr = possibleVariableNames.join(', ');
                query = `${attrNameMappedTo} ${operator === 'includes' ? 'IN' : 'NOT IN'} (${possibleVariableNamesStr})`;
                // if ((filter.operator === Query.OPERATOR.IN || filter.operator === Query.OPERATOR.NOT_IN) && _.isArray(filter.value)) {
                //   this.parseArrayOfStrings(prefix, attr, filter.value, filter.operator)
                // } else {
                //   value = attr.toDynamo(filter.value)
                //   operator = filter.operator
                //   // convert String Set (SS) to a String (S)
                //   if (value && _.isString(value.SS)) {
                //     value.S = value.SS
                //     delete value.SS
                //   }
                // }
                break;
            }
            case 'null': {
                query = `${attrNameMappedTo} = :NULL`;
                values[':NULL'] = { NULL: true };
                break;
            }
            case 'not null': {
                query = `${attrNameMappedTo} = :NOT_NULL`;
                values[':NOT_NULL'] = { NULL: false };
                break;
            }
            case 'between': {
                if (typeof filter[1] !== 'undefined' && typeof filter[2] !== 'undefined') {
                    const lowerVariableName = ':vl' + prefix;
                    const upperVariableName = ':vu' + prefix;
                    values[lowerVariableName] = attr.toDynamoAssert(filter[1]);
                    values[upperVariableName] = attr.toDynamoAssert(filter[2]);
                    query = `${attrNameMappedTo} BETWEEN ${lowerVariableName} AND ${upperVariableName}`;
                }
                else {
                    throw new errors_1.QueryError('BETWEEN filter missing a lower or upper bound');
                }
                break;
            }
        }
        return { values, attrs, query };
    }
    push(attribute, filter, operator) {
        if (this.isHashKey(attribute)) {
            if (operator === '=') {
                this.keyConditionsMap.push({ attribute, filter });
            }
            else {
                throw new errors_1.QueryError(`Cannot use ${operator} for a HASH key, can only use equals (=) operator`);
            }
        }
        else if (this.isRangeKey(attribute)) {
            if (_.includes(exports.keyConditionAllowedOperators, operator)) {
                this.keyConditionsMap.push({ attribute, filter });
            }
            else {
                throw new errors_1.QueryError(`Cannot use ${operator} for a HASH key, can only use ${exports.keyConditionAllowedOperators.join(', ')} operators`);
            }
        }
        else {
            this.filterConditions.push(filter);
        }
    }
    isHashKey(attribute) {
        return this.indexMetadata != null && attribute.name === this.indexMetadata.hash.name;
    }
    isRangeKey(attribute) {
        var _a;
        if (((_a = this.indexMetadata) === null || _a === void 0 ? void 0 : _a.range) != null) {
            return this.indexMetadata.range.name === attribute.name;
        }
        else {
            return false;
        }
    }
}
//# sourceMappingURL=expression.js.map