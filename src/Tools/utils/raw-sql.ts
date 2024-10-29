export class RawSql {
  // ids param must be comma seperated string of numbers. Example: '1,2,3,4'
  static orderByFieldId(alias: string, ids: string) {
    return `FIELD(${alias}.id, ${ids})`;
  }
}
