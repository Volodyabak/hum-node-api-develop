const { db } = require('../../database/knex');
const { BrackhitModel } = require('../../database/Models/BrackhitModel');

module.exports.createBrackhit = async ({
  typeId,
  name,
  description,
  ownerId,
  timeLive,
  duration,
  size,
  thumbnail,
  scoringState,
  playlistKey,
  displaySeeds,
  sortingId,
  startingRound = 1,
}) => {
  return BrackhitModel.query().insertAndFetch({
    typeId,
    name,
    description,
    ownerId,
    timeLive,
    duration,
    size,
    thumbnail,
    scoringState,
    playlistKey,
    displaySeeds,
    sortingId,
    startingRound,
  });
};

module.exports.findBrackhitContent = async (content_type_id, content_id) => {
  return db('labl.brackhit_content').where({ content_type_id, content_id }).first();
};

module.exports.createOrUpdateBrackhitContent = async (contentTypeId, contentId) => {
  await db('labl.brackhit_content').insert({ contentTypeId, contentId }).onConflict().merge();
  return this.findBrackhitContent(contentTypeId, contentId);
};

module.exports.createBrackhitContentArtistTrack = async (brackhitId, choiceId, trackId) => {
  await db('labl.brackhit_content_artisttrack')
    .insert({ brackhitId, choiceId, trackId })
    .onConflict()
    .merge();
};
