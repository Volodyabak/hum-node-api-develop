import Tools from '../src/Tools';

export class Database {
  // casts results of Tools.promisifiedQuery to desired type
  static async executeQuery<T>(query: string, params: any = {}, errMsg = ''): Promise<T[]> {
    const results = await Tools.promisifiedQuery(query, params, errMsg);
    return results as T[];
  }

  static async executeQueryGetFirst<T>(query: string, params: any = {}, errMsg = ''): Promise<T> {
    const results = await Tools.promisifiedQuery(query, params, errMsg);
    return results.length === 0 ? undefined : (results[0] as T);
  }
}
