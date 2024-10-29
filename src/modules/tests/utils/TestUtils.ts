import { PATTERNS } from '../test.constants';

export class TestUtils {
  static getCleanNotificationMessageText(message: string): string {
    if (!message) {
      return null;
    }
    let matchedPattern;
    PATTERNS.forEach((el) => {
      if (message.match(el)) {
        matchedPattern = el.toString();
        return;
      }
    });

    return matchedPattern || message;
  }
}
