import { db } from '../../../database/knex';

class ArtistUtils {
  constructor() {}

  async getDailyScoreCurrentDate() {
    const { date } = await db('labl.daily_scores').max('date', { as: 'date' }).first();
    return date.toISOString().split('T')[0];
  }
}

const ArtistUtilsInstance = new ArtistUtils();

export { ArtistUtilsInstance as ArtistUtils };
