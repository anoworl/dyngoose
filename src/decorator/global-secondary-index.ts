import { SchemaError } from '../errors'
import { IThroughput } from '../interfaces'
import * as Metadata from '../metadata'
import { ITable } from '../table'

export interface GlobalSecondaryIndexOptions {
  partitionKey: string
  sortKey?: string
  name?: string
  projection?: Metadata.Index.GlobalSecondaryIndexProjection
  nonKeyAttributes?: string[]
  throughput?: IThroughput
}

export function GlobalSecondaryIndex(options: GlobalSecondaryIndexOptions) {
  return (table: ITable<any>, propertyName: string) => {
    const index: Metadata.Index.GlobalSecondaryIndex = {
      propertyName,
      name: options.name || propertyName,
      hash: table.schema.getAttributeByName(options.partitionKey),
      range: options.sortKey ? table.schema.getAttributeByName(options.sortKey) : undefined,
      projection: options.projection,
      nonKeyAttributes: options.nonKeyAttributes,
      throughput: options.throughput,
    }

    if (index.projection === 'INCLUDE' && (!options.nonKeyAttributes || options.nonKeyAttributes.length === 0)) {
      throw new SchemaError(`If Projection type INCLUDE is specified, some non-key attributes to include in the projection must be specified as well`)
    }

    table.schema.globalSecondaryIndexes.push(index)
  }
}
