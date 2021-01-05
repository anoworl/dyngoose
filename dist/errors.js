"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatchError = exports.ValidationError = exports.QueryError = exports.SchemaError = exports.TableError = exports.DyngooseError = void 0;
class DyngooseError extends Error {
    constructor(message) {
        super(message);
        this.message = message;
        Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;
    }
}
exports.DyngooseError = DyngooseError;
class TableError extends DyngooseError {
}
exports.TableError = TableError;
class SchemaError extends DyngooseError {
}
exports.SchemaError = SchemaError;
class QueryError extends DyngooseError {
}
exports.QueryError = QueryError;
class ValidationError extends DyngooseError {
}
exports.ValidationError = ValidationError;
class BatchError extends DyngooseError {
    constructor(message, errors, output) {
        super(message);
        this.errors = errors;
        this.output = output;
    }
}
exports.BatchError = BatchError;
//# sourceMappingURL=errors.js.map