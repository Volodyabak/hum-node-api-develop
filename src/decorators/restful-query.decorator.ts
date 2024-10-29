import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import restfulFilter from '../Tools/Parsers/restful-filter';
import { Model, OrderByDirection, QueryBuilder } from 'objection';
import { BadRequestError } from '../Errors';

export const LIKE_OPERATORS = ['$like', '$iLike', '$notLike', '$notILike'];

export interface RestfulQuery {
  searchedParams: SearchedParams[];
  paginationParams: PaginationParams;
  orderParams: OrderByDirection[][];
}

interface SearchedParams {
  operator: string;
  operatorSQL: string;
  column: string;
  value: string;
}

interface PaginationParams {
  skip: number;
  take: number;
}

export const RestQuery = createParamDecorator<object, ExecutionContext, RestfulQuery>(
  (data: object, ctx: ExecutionContext) => {
    const response = ctx.switchToHttp().getResponse();
    const query = response.req.query;
    const allowedColumns = Object.keys(data || {});

    // checks whether query params contain only allowed columns for filtering
    Object.keys(query)
      .filter((param) => param.includes('__'))
      .forEach((param) => {
        const column = param.split('__')[0];
        if (!allowedColumns.includes(column)) {
          throw new BadRequestError(
            `Query param '${param}' is forbidden. Allowed columns: [${allowedColumns.join(', ')}]`,
          );
        }
      });

    const searchedParams: SearchedParams[] =
      restfulFilter.parse(query, allowedColumns).filter || [];

    // parses values for like operations into proper format
    searchedParams.forEach((param) => {
      param.column = data[param.column];
      if (LIKE_OPERATORS.includes(param.operator)) {
        param.value = `%${param.value}%`;
      }
    });

    return {
      searchedParams,
      paginationParams: {
        skip: +query.skip || 0,
        take: +query.take || 20,
      },
      orderParams: restfulFilter.parse(query).order,
    };
  },
);

export const joinSearchParamsToQueryBuilder = function <T extends Model>(
  builder: QueryBuilder<T, T[]>,
  restQuery: RestfulQuery,
): void {
  restQuery.searchedParams?.forEach((param) => {
    builder.where(param.column, param.operatorSQL, param.value);
  });
};

export const joinOrderParamsToQueryBuilder = function <T extends Model>(
  builder: QueryBuilder<T, T[]>,
  restQuery: RestfulQuery,
): void {
  restQuery.orderParams.forEach((param) => {
    builder.orderBy(param[0], param[1]);
  });
};

export const joinPaginationParamsToQueryBuilder = function <T extends Model>(
  builder: QueryBuilder<T, T[]>,
  restQuery: Partial<RestfulQuery>,
): void {
  builder.offset(restQuery.paginationParams.skip).limit(restQuery.paginationParams.take);
};
