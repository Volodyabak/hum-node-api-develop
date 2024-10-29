import { FilterQuery, Model, QueryWithHelpers, Document, FlattenMaps } from 'mongoose';
import { CommonQueryDto, PaginationDto } from '../dto/query/query.dto';

type FilterOperators =
  | '$eq'
  | '$eqi'
  | '$ne'
  | '$nei'
  | '$lt'
  | '$lte'
  | '$gt'
  | '$gte'
  | '$contains';

interface Filter {
  [field: string]: {
    [operator in FilterOperators]?: any;
  };
}

function parseMongoFilters(filters: any) {
  const mongooseFilter: FilterQuery<any> = {};

  for (const field in filters) {
    const fieldFilters = filters[field];
    for (const operator in fieldFilters) {
      const value = fieldFilters[operator];

      switch (operator) {
        case '$eq':
          mongooseFilter[field] = { $eq: value };
          break;
        case '$eqi':
          mongooseFilter[field] = { $regex: new RegExp(`^${value}$`, 'i') };
          break;
        case '$ne':
          mongooseFilter[field] = { $ne: value };
          break;
        case '$nei':
          mongooseFilter[field] = { $not: { $regex: new RegExp(`^${value}$`, 'i') } };
          break;
        case '$lt':
          mongooseFilter[field] = { $lt: value };
          break;
        case '$lte':
          mongooseFilter[field] = { $lte: value };
          break;
        case '$gt':
          mongooseFilter[field] = { $gt: value };
          break;
        case '$gte':
          mongooseFilter[field] = { $gte: value };
          break;
        case '$contains':
          mongooseFilter[field] = { $regex: new RegExp(value, 'i') };
          break;
        default:
          break;
      }
    }
  }

  return mongooseFilter;
}

function parseMongoPagination<Res, Doc>(
  queryBuilder: QueryWithHelpers<Res, Doc>,
  pagination: PaginationDto,
) {
  return queryBuilder.limit(pagination.pageSize).skip(pagination.skip);
}

function parseMongoSort<Res, Doc>(
  queryBuilder: QueryWithHelpers<Res, Doc>,
  sort: string | string[],
) {
  const mongoSort: Record<string, 1 | -1> = {};
  const sortingArray = Array.isArray(sort) ? sort : [sort];

  sortingArray.forEach((sortField) => {
    const [field, order] = sortField.split(':');

    if (field) {
      mongoSort[field] = order === 'desc' ? -1 : 1;
    }
  });

  queryBuilder.sort(mongoSort);
  return queryBuilder;
}

export function findAllMongoQB<DocType extends Document, Res>(
  model: Model<DocType>,
  query: CommonQueryDto,
): [Promise<Res[]>, Promise<number>] {
  const filters = parseMongoFilters(query.filters);
  const modelQB = model.find(filters);
  const totalQB: Promise<number> = model.find(filters).countDocuments();
  parseMongoPagination(modelQB, query.pagination);
  parseMongoSort(modelQB, query.sort);

  return [modelQB.lean<Res[]>().exec(), totalQB];
}

export function parseKnexFilters<T>(queryBuilder: any, filters: any): any {
  for (const field in filters) {
    const fieldFilters = filters[field];

    for (const operator in fieldFilters) {
      const value = fieldFilters[operator as FilterOperators];

      switch (operator) {
        case '$eq':
          queryBuilder.where(field, '=', value);
          break;
        case '$eqi':
          queryBuilder.whereRaw(`LOWER(${field}) = ?`, value.toLowerCase());
          break;
        case '$ne':
          queryBuilder.where(field, '!=', value);
          break;
        case '$nei':
          queryBuilder.whereRaw(`LOWER(${field}) != ?`, value.toLowerCase());
          break;
        case '$lt':
          queryBuilder.where(field, '<', value);
          break;
        case '$lte':
          queryBuilder.where(field, '<=', value);
          break;
        case '$gt':
          queryBuilder.where(field, '>', value);
          break;
        case '$gte':
          queryBuilder.where(field, '>=', value);
          break;
        case '$contains':
          queryBuilder.where(field, 'like', `%${value}%`);
          break;
        default:
          break;
      }
    }
  }

  return queryBuilder;
}

export function parseKnexPagination(queryBuilder: any, pagination: PaginationDto) {
  return queryBuilder.limit(pagination.pageSize).offset(pagination.skip);
}

export function parseKnexSort(queryBuilder: any, sort: string | string[]) {
  const sortingArray = Array.isArray(sort) ? sort : [sort];

  sortingArray.forEach((sortField) => {
    const [field, order] = sortField.split(':');

    if (field) {
      queryBuilder.orderBy(field, order === 'desc' ? 'desc' : 'asc');
    }
  });

  return queryBuilder;
}

export function parseCommonDtoKnex(queryBuilder: any, query: CommonQueryDto) {
  parseKnexFilters(queryBuilder, query.filters);
  parseKnexPagination(queryBuilder, query.pagination);
  parseKnexSort(queryBuilder, query.sort);

  return queryBuilder;
}
