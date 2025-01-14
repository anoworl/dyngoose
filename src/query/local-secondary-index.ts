import { DynamoDB } from 'aws-sdk'
import { has } from 'lodash'
import { QueryError } from '../errors'
import * as Metadata from '../metadata'
import { ITable, Table } from '../table'
import { buildQueryExpression } from './expression'
import { Filters as QueryFilters } from './filters'
import { QueryOutput } from './output'
import { MagicSearch, MagicSearchInput } from './search'

interface LocalSecondaryIndexQueryInput {
  rangeOrder?: 'ASC' | 'DESC'
  limit?: number
  exclusiveStartKey?: DynamoDB.Key
  consistent?: DynamoDB.ConsistentRead
}

interface LocalSecondaryIndexScanInput {
  limit?: number
  select?: DynamoDB.Select
  totalSegments?: DynamoDB.ScanTotalSegments
  segment?: DynamoDB.ScanSegment
  exclusiveStartKey?: DynamoDB.Key
  projectionExpression?: DynamoDB.ProjectionExpression
  consistent?: DynamoDB.ConsistentRead
}

export class LocalSecondaryIndex<T extends Table> {
  constructor(
    readonly tableClass: ITable<T>,
    readonly metadata: Metadata.Index.LocalSecondaryIndex,
  ) {}

  public getQueryInput(input: LocalSecondaryIndexQueryInput = {}): DynamoDB.QueryInput {
    if (input.rangeOrder == null) {
      input.rangeOrder = 'ASC'
    }
    const ScanIndexForward = input.rangeOrder === 'ASC'
    const queryInput: DynamoDB.QueryInput = {
      TableName: this.tableClass.schema.name,
      IndexName: this.metadata.name,
      Limit: input.limit,
      ScanIndexForward,
      ExclusiveStartKey: input.exclusiveStartKey,
      ReturnConsumedCapacity: 'TOTAL',
      ConsistentRead: input.consistent,
    }

    return queryInput
  }

  public async query(filters: QueryFilters<T>, input: LocalSecondaryIndexQueryInput = {}): Promise<QueryOutput<T>> {
    if (!has(filters, this.tableClass.schema.primaryKey.hash.propertyName)) {
      throw new QueryError('Cannot perform a query on a LocalSecondaryIndex without specifying a hash key value')
    }

    const queryInput = this.getQueryInput(input)

    // convert the LocalSecondaryIndex metadata to a GlobalSecondaryIndex, which just adds the hash property
    const metadata: Metadata.Index.GlobalSecondaryIndex = Object.assign({
      hash: this.tableClass.schema.primaryKey.hash,
    }, this.metadata)

    const expression = buildQueryExpression(this.tableClass.schema, filters, metadata)
    queryInput.FilterExpression = expression.FilterExpression
    queryInput.KeyConditionExpression = expression.KeyConditionExpression
    queryInput.ExpressionAttributeNames = expression.ExpressionAttributeNames
    queryInput.ExpressionAttributeValues = expression.ExpressionAttributeValues
    const hasProjection = queryInput.ProjectionExpression == null
    const output = await this.tableClass.schema.dynamo.query(queryInput).promise()
    return QueryOutput.fromDynamoOutput(this.tableClass, output, hasProjection)
  }

  public getScanInput(input: LocalSecondaryIndexScanInput = {}): DynamoDB.ScanInput {
    const scanInput: DynamoDB.ScanInput = {
      TableName: this.tableClass.schema.name,
      IndexName: this.metadata.name,
      Limit: input.limit,
      ExclusiveStartKey: input.exclusiveStartKey,
      ReturnConsumedCapacity: 'TOTAL',
      TotalSegments: input.totalSegments,
      Segment: input.segment,
    }

    return scanInput
  }

  public async scan(filters: QueryFilters<T> | undefined | null, input: LocalSecondaryIndexScanInput = {}): Promise<QueryOutput<T>> {
    const scanInput = this.getScanInput(input)
    if (filters != null && Object.keys(filters).length > 0) {
      // don't pass the index metadata, avoids KeyConditionExpression
      const expression = buildQueryExpression(this.tableClass.schema, filters)
      scanInput.FilterExpression = expression.FilterExpression
      scanInput.ExpressionAttributeNames = expression.ExpressionAttributeNames
      scanInput.ExpressionAttributeValues = expression.ExpressionAttributeValues
    }
    const hasProjection = scanInput.ProjectionExpression == null
    const output = await this.tableClass.schema.dynamo.scan(scanInput).promise()
    return QueryOutput.fromDynamoOutput(this.tableClass, output, hasProjection)
  }

  /**
   * Query DynamoDB for what you need.
   *
   * Starts a MagicSearch using this LocalSecondaryIndex.
   */
  public search(filters?: QueryFilters<T>, input: MagicSearchInput<T> = {}): MagicSearch<T> {
    return new MagicSearch<T>(this.tableClass as any, filters, input).using(this)
  }
}
