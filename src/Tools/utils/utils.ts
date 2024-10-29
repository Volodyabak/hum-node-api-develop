import { Request } from 'express';
import { camelCase, mapKeys } from 'lodash';
import { RankedItem } from '../dto/util-classes';
import { NUMBER_ORDINALS } from '../../constants';

export class Utils {
  static addRankByFieldNameToItems(items: RankedItem[], fieldName: string): void {
    if (items?.length === 0) return;

    let rank = 0;
    let prevValue;

    items.forEach((el) => {
      el.rank = prevValue === el[fieldName] ? rank : ++rank;
      prevValue = el[fieldName];
    });
  }

  static getNumberWithOrdinal(number: number): string {
    const remainder = number % 100;
    return (
      number +
      (NUMBER_ORDINALS[(remainder - 20) % 10] || NUMBER_ORDINALS[remainder] || NUMBER_ORDINALS[0])
    );
  }
}

export async function iterateNestedObject(
  object: unknown,
  callback: (object: unknown, key: string) => Promise<any>,
) {
  await Promise.all(
    Object.keys(object).map(async (key) => {
      if (typeof object[key] === 'object' && object[key] !== null) {
        return iterateNestedObject(object[key], callback);
      } else {
        await callback(object, key);
      }
    }),
  );
}

export function toCamelCase(object) {
  return mapKeys(object, (val, key) => camelCase(key));
}

export function getIp(req: Request) {
  const ip = (req.headers['x-forwarded-for'] || req.ip || req.socket.remoteAddress) as string;
  return ip.split(',').shift().trim();
}
