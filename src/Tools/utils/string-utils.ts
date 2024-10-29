export class StringUtils {
  static includesInsensitive(base: string, searched: string): boolean {
    return base.toLowerCase().includes(searched.toLowerCase());
  }
}
