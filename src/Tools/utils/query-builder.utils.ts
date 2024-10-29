import { Model, QueryBuilder, raw } from 'objection';
import {
  FetchRelationsParams,
  JoinOperation,
  JoinParams,
  PaginationParams,
} from '../dto/util-classes';
import { BrackhitModel } from '../../../database/Models/BrackhitModel';
import { RankGroupedItemsParams } from './interfaces/utils-interfaces';

export class QueryBuilderUtils {
  // calls offset and limit on query builder object
  static addPaginationToBuilder<T extends Model>(
    builder: QueryBuilder<T, T[]>,
    params: PaginationParams,
  ): void {
    builder.offset(params.skip).limit(params.take);
  }

  static setDefaultJoinParams(
    params: JoinParams,
    from: string,
    to: string,
    joinOperation?: JoinOperation,
  ): void {
    params.from = params.from || from;
    params.to = params.to || to;
    params.join = params.join || joinOperation || JoinOperation.innerJoin;
  }

  /***
   * Fetches a graphs list of related items to builder object, applies provided params to each graph. <br>
   *
   * Params properties description: <br>
   * 1. relation - relation name to be fetched. <br>
   * 2. alias - table alias for main relation, which can be used inside select method. <br>
   * 3. select - string array of columns to be selected. <br>
   * 4. children - child relation expressions to be joined. <br>
   * 4.1. relation - child relation name to be joined <br>
   * 4.2. join - join operation used when joining child expression <br>
   */
  static fetchRelationsToBuilder<T extends Model>(
    builder: QueryBuilder<T, T> | QueryBuilder<T, T[]>,
    params: FetchRelationsParams[],
  ): void {
    params.forEach((param) => {
      builder.withGraphFetched(param.relation);
      builder.modifyGraph(param.relation, (graphBuilder) => {
        if (param.alias) {
          graphBuilder.alias(param.alias);
        }

        if (param.select) {
          graphBuilder.select(...param.select);
        }

        if (param.children) {
          param.children.forEach((child) => {
            if (child.join === JoinOperation.leftJoin) {
              graphBuilder.leftJoinRelated(child.relation);
            } else {
              graphBuilder.joinRelated(child.relation);
            }
          });
        }

        return graphBuilder;
      });
    });
  }

  // calls where(`${alias}.timeLive`, '<=', date) on QueryBuilder object
  static excludeNotStartedBrackhits<T extends Model>(
    builder: QueryBuilder<T, T[]>,
    date: Date,
    alias: string = 'b',
  ) {
    builder.where(`${alias}.timeLive`, '<=', date);
  }

  static performJoinOperationOnBuilder<T extends Model>(
    builder: QueryBuilder<T, T[]>,
    alias: string,
    callback: () => void,
    joinOperation: JoinOperation,
  ): void {
    if (joinOperation === JoinOperation.innerJoin) {
      builder.join(alias, callback);
    } else if (joinOperation === JoinOperation.leftJoin) {
      builder.leftJoin(alias, callback);
    }
  }

  static excludeHiddenBrackhits<T extends BrackhitModel>(
    brackhits: QueryBuilder<T, T[]>,
    alias: string = 'b',
  ) {
    brackhits.where(`${alias}.hidden`, 0);
  }

  static rankItemsByGroupColumn<T extends Model>(
    items: QueryBuilder<T, T[]>,
    params: RankGroupedItemsParams,
  ) {
    const itemsQuery = items.toKnexQuery().toQuery();

    return Model.query()
      .select(
        '*',
        raw(
          `@currentRank := if(@currentGroup = items.${params.groupColumnRaw}, @currentRank + 1, 1)`,
        ).as(params.rankColumnName),
        raw(`@currentGroup := items.${params.groupColumnRaw}`),
      )
      .from(
        raw(`(${itemsQuery}) as items, (select @currentRank := 0, @currentGroup := null) as vars`),
      ) as QueryBuilder<T, T[]>;
  }
}
