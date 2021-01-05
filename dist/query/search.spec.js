"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const setup_tests_spec_1 = require("../setup-tests.spec");
const search_1 = require("./search");
describe('Query/Search', () => {
    before(async () => {
        await setup_tests_spec_1.TestableTable.documentClient.batchPut([
            setup_tests_spec_1.TestableTable.new({ id: 500, title: 'Table.search 0', lowercaseString: 'table search 0' }),
            setup_tests_spec_1.TestableTable.new({ id: 501, title: 'Table.search 1', lowercaseString: 'table search 1' }),
            setup_tests_spec_1.TestableTable.new({ id: 502, title: 'Table.search 2', lowercaseString: 'table search 2' }),
            setup_tests_spec_1.TestableTable.new({ id: 503, title: 'Table.search 3', lowercaseString: 'table search 3' }),
            setup_tests_spec_1.TestableTable.new({ id: 504, title: 'Table.search 4', lowercaseString: 'reject the search 4' }),
            setup_tests_spec_1.TestableTable.new({ id: 504, title: 'Table.search 5', lowercaseString: 'magic' }),
            setup_tests_spec_1.TestableTable.new({ id: 504, title: 'Table.search 6', lowercaseString: 'search' }),
            setup_tests_spec_1.TestableTable.new({ id: 504, title: 'Table.search 7', lowercaseString: 'search' }),
        ]);
    });
    it('should search using an available index', async () => {
        const search = new search_1.MagicSearch(setup_tests_spec_1.TestableTable, { title: 'Table.search 0' });
        const input = search.getInput();
        chai_1.expect(input.IndexName).to.eq('titleIndex');
        const result = await search.exec();
        chai_1.expect(result.count).to.eq(1);
        chai_1.expect(result.records[0].title).to.eq('Table.search 0');
        chai_1.expect(result.records[0].lowercaseString).to.eq('table search 0');
    });
    it('should ignore index if you are using a special condition', async () => {
        const search = new search_1.MagicSearch(setup_tests_spec_1.TestableTable, {
            title: ['contains', 'Table.search'],
        });
        const input = search.getInput();
        chai_1.expect(input.IndexName).to.be.a('undefined');
        chai_1.expect(input.KeyConditionExpression).to.be.a('undefined');
        const result = await search.exec();
        chai_1.expect(result.count).to.eq(8);
    });
    it('should ignore indexes if none are available', async () => {
        const search = new search_1.MagicSearch(setup_tests_spec_1.TestableTable, {
            lowercaseString: ['contains', 'table search'],
        });
        const input = search.getInput();
        chai_1.expect(input.IndexName).to.be.a('undefined');
        chai_1.expect(input.KeyConditionExpression).to.be.a('undefined');
        const result = await search.exec();
        chai_1.expect(result.count).to.eq(4);
    });
    it('should support AND operators', async () => {
        const search = new search_1.MagicSearch(setup_tests_spec_1.TestableTable)
            .filter('lowercaseString').eq('search')
            .and()
            .filter('lowercaseString').eq('magic');
        const input = search.getInput();
        chai_1.expect(input.IndexName).to.be.a('undefined');
        chai_1.expect(input.FilterExpression).to.eq('#a0 = :v0 AND #a0 = :v1');
        const result = await search.exec();
        chai_1.expect(result.count).to.eq(0);
    });
    it('should support OR operators', async () => {
        const search = new search_1.MagicSearch(setup_tests_spec_1.TestableTable)
            .filter('lowercaseString').eq('search')
            .or()
            .filter('lowercaseString').eq('magic');
        const input = search.getInput();
        chai_1.expect(input.IndexName).to.be.a('undefined');
        chai_1.expect(input.FilterExpression).to.eq('#a0 = :v0 OR #a0 = :v1');
        const result = await search.exec();
        chai_1.expect(result.count).to.eq(3);
    });
    it('should support AND and OR operators together', async () => {
        const search = new search_1.MagicSearch(setup_tests_spec_1.TestableTable)
            .filter('title').contains('Table.search')
            .and()
            .parenthesis((ps) => {
            ps.filter('lowercaseString').eq('search')
                .or()
                .filter('lowercaseString').eq('magic');
        });
        const input = search.getInput();
        chai_1.expect(input.IndexName).to.be.a('undefined');
        chai_1.expect(input.FilterExpression).to.eq('contains(#a0, :v0) AND (#a1 = :v1 OR #a1 = :v2)');
        const result = await search.exec();
        chai_1.expect(result.count).to.eq(3);
    });
    it('ConsistentRead defaults to false', async () => {
        const search = new search_1.MagicSearch(setup_tests_spec_1.TestableTable);
        const input = search.getInput();
        chai_1.expect(input.ConsistentRead).to.eq(false);
    });
    it('.consistent sets ConsistentRead on input', async () => {
        const search = new search_1.MagicSearch(setup_tests_spec_1.TestableTable);
        search.consistent(true);
        const input = search.getInput();
        chai_1.expect(input.ConsistentRead).to.eq(true);
    });
    it('.using sets IndexName on input', async () => {
        const search = new search_1.MagicSearch(setup_tests_spec_1.TestableTable);
        // try using the GSI instance
        search.using(setup_tests_spec_1.TestableTable.titleIndex);
        let input = search.getInput();
        chai_1.expect(input.IndexName).to.eq('titleIndex');
        // try using the index name
        search.using('titleIndex');
        input = search.getInput();
        chai_1.expect(input.IndexName).to.eq('titleIndex');
        // try using the primary key
        search.using(setup_tests_spec_1.TestableTable.primaryKey);
        input = search.getInput();
        chai_1.expect(input.IndexName).to.eq(undefined);
    });
    describe('.sort', () => {
        it('.sort sets ScanIndexForward on input', async () => {
            const search = new search_1.MagicSearch(setup_tests_spec_1.TestableTable);
            search.sort('descending');
            const input = search.getInput();
            chai_1.expect(input.ScanIndexForward).to.eq(false);
        });
        it('.ascending sets ScanIndexForward on input', async () => {
            const search = new search_1.MagicSearch(setup_tests_spec_1.TestableTable);
            search.ascending();
            const input = search.getInput();
            chai_1.expect(input.ScanIndexForward).to.eq(undefined);
        });
        it('.descending sets ScanIndexForward on input', async () => {
            const search = new search_1.MagicSearch(setup_tests_spec_1.TestableTable);
            search.descending();
            const input = search.getInput();
            chai_1.expect(input.ScanIndexForward).to.eq(false);
        });
    });
    it('.limit sets Limit on input', async () => {
        const search = new search_1.MagicSearch(setup_tests_spec_1.TestableTable);
        search.limit(5);
        const input = search.getInput();
        chai_1.expect(input.Limit).to.eq(5);
    });
    it('.startAt sets ExclusiveStartKey on input', async () => {
        const search = new search_1.MagicSearch(setup_tests_spec_1.TestableTable);
        search.startAt({ id: { S: 'test' } });
        const input = search.getInput();
        chai_1.expect(input.ExclusiveStartKey).to.deep.eq({ id: { S: 'test' } });
    });
    it('.attributes sets ProjectionExpression on input', async () => {
        const search = new search_1.MagicSearch(setup_tests_spec_1.TestableTable);
        search.attributes('id', 'name');
        const input = search.getInput();
        chai_1.expect(input.ProjectionExpression).to.eq('id,#p0');
        chai_1.expect(input.ExpressionAttributeNames).to.deep.eq({
            '#p0': 'name',
        });
    });
    it('.properties sets ProjectionExpression on input', async () => {
        const search = new search_1.MagicSearch(setup_tests_spec_1.TestableTable);
        search.properties('id', 'title', 'testAttributeNaming');
        const input = search.getInput();
        chai_1.expect(input.ProjectionExpression).to.eq('id,title,testAttributeNameNotMatchingPropertyName');
    });
    describe('#exec', () => {
        it('should execute the search query', async () => {
            const search = new search_1.MagicSearch(setup_tests_spec_1.TestableTable)
                .filter('title').contains('Table.search');
            const output = await search.exec();
            chai_1.expect(output.length).to.eq(8);
        });
        it('honor a limited search', async () => {
            const search = new search_1.MagicSearch(setup_tests_spec_1.TestableTable)
                .filter('title').contains('Table.search')
                .limit(2);
            const output = await search.exec();
            chai_1.expect(output.length).to.eq(2);
        });
    });
    describe('#all', () => {
        it('should execute the search query', async () => {
            const search = new search_1.MagicSearch(setup_tests_spec_1.TestableTable)
                .filter('title').contains('Table.search')
                .limit(2);
            // we set a limit and then called .all(), so it should page automatically until all results are found
            // this is stupid and slow, it would be faster to remove the limit, but we are testing the paging logic of .all
            const output = await search.all();
            chai_1.expect(output.length).to.eq(8);
        });
    });
    describe('#minimum', () => {
        it('should execute the search query', async () => {
            const search = new search_1.MagicSearch(setup_tests_spec_1.TestableTable)
                .filter('title').contains('Table.search')
                .limit(2);
            // we set a limit and then called .all(), so it should page automatically until all results are found
            const output = await search.minimum(5);
            chai_1.expect(output.length).to.be.at.least(5);
        });
    });
});
//# sourceMappingURL=search.spec.js.map