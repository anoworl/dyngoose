"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const setup_tests_spec_1 = require("../setup-tests.spec");
const projection_expression_1 = require("./projection-expression");
describe('Query/ProjectionExpression', () => {
    describe('buildProjectionExpression', () => {
        it('transformed reserved keywords', () => {
            const expression = projection_expression_1.buildProjectionExpression(setup_tests_spec_1.TestableTable, ['id', 'status']);
            chai_1.expect(expression.ProjectionExpression).to.eq('id,#p0');
            chai_1.expect(expression.ExpressionAttributeNames).to.deep.eq({
                '#p0': 'status',
            });
        });
    });
});
//# sourceMappingURL=projection-expression.spec.js.map