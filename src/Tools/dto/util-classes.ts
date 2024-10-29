import { Relations } from '../../../database/relations/relations';
import { Model, QueryBuilder } from 'objection';

export class RankedItem {
  rank: number;
}

export class PaginatedItems<I, V = any> {
  skip?: number | undefined;
  take?: number | undefined;
  total?: number | undefined;
  items: I[];
  value?: V | undefined;
}

export class PaginationParams {
  skip: number;
  take: number;
}

export interface FromToParams {
  from: string;
  to: string;
}

// TODO: make fields mandatory by resolving all conflicts
export interface JoinToParams {
  to?: string;
  join?: JoinOperation;
}

// TODO: make fields mandatory by resolving all conflicts
export interface JoinParams extends JoinToParams {
  from?: string;
}

export interface JoinThroughParams extends JoinParams {
  through: string;
}

// relation - relation name,
// joinOperation (optional) - operation to fetch data,
// select (optional) - array of columns to select from relation
export class FetchRelationsParams {
  relation: Relations | string;
  alias?: string | undefined;
  select?: string[] | undefined;
  children?: ChildFetchRelationParams[] | undefined;
}

export class ChildFetchRelationParams {
  relation: Relations | string;
  join?: JoinOperation | undefined;
}

export enum JoinOperation {
  innerJoin = 'innerJoin',
  leftJoin = 'leftJoin',
}

// use to return QueryBuilder<T, T[]> object from async function
export class BuilderContainer<T extends Model> {
  items: QueryBuilder<T, T[]>;
}
