const { db } = require('../../../database/knex');
const { SpotifyTrackModel } = require('../../../database/Models/Spotify/SpotifyTrackModel');
const { SpotifyAlbumModel } = require('../../../database/Models/Spotify/SpotifyAlbumModel');
const { SpotifyArtistModel } = require('../../../database/Models/Spotify/SpotifyArtistModel');

const PLAYLIST_SORT = {
  HEAD: 'head',
  POPULARITY: 'popularity',
};

class PlaylistService {
  async insertNewPlaylist(playlist, sort = PLAYLIST_SORT.POPULARITY) {
    let tracks = playlist.tracks.items.map((el) => el.track);
    if (sort === PLAYLIST_SORT.POPULARITY) {
      tracks.sort((a, b) => b.popularity - a.popularity);
    }
    tracks = tracks.slice(0, 16);

    const uniqueTracks = new Map();
    tracks.forEach(track => uniqueTracks.set(track.id, track));
    tracks = Array.from(uniqueTracks.values());

    if (tracks.length < 16) {
      throw new Error('Tracks must be unique');
    }

    return await Promise.all(
      tracks.map(async (track) => {
        const [dbTrack, dbAlbum] = await Promise.all([this.createTrack(track), this.createAlbum(track.album)]);
        dbTrack.albumImage = dbAlbum.albumImage;

        const [artists, albumArtists] = await Promise.all([
          Promise.all(track.artists.map((artist) => this.createArtist(artist))),
          Promise.all(track.album.artists.map((artist) => this.createArtist(artist))),
        ]);

        await Promise.all([
          Promise.all(artists.map((artist) => this.linkTrackAlbumArtist(dbTrack.id, dbAlbum.id, artist.id))),
          Promise.all(albumArtists.map((artist) => this.linkAlbumArtist(dbAlbum.id, artist.id))),
        ]);

        return dbTrack;
      })
    );
  }

  async createTrack(track) {
    return SpotifyTrackModel.query()
      .insertAndFetch({
        trackKey: track.id,
        trackName: track.name,
        trackDisc: track.disc_number,
        trackNumber: track.track_number,
        explicit: +track.explicit,
        popularity: track.popularity,
        trackPreview: track.preview_url,
        isrc: track.external_ids.isrc,
        lastChecked: new Date(),
      })
      .onConflict()
      .merge();
  }

  async createAlbum(album) {
    return SpotifyAlbumModel.query()
      .insertAndFetch({
        albumKey: album.id,
        name: album.name,
        albumType: album.album_type,
        releaseDate: album.release_date,
        releaseDatePrecision: album.release_date_precision,
        albumImage: album.images[0].url,
        markets: album.available_markets.join(','),
        tracks: album.total_tracks,
      })
      .onConflict()
      .merge();
  }

  async createArtist(artist) {
    return SpotifyArtistModel.query()
      .insertAndFetch({ artistKey: artist.id, artistName: artist.name })
      .onConflict()
      .ignore();
  }

  async linkTrackAlbumArtist(spotifyTrackId, spotifyAlbumId, spotifyArtistId) {
    await db('ean_collection.spotify_album_track')
      .insert({ spotifyTrackId, spotifyAlbumId, spotifyArtistId })
      .onConflict()
      .ignore();
  }

  async linkAlbumArtist(albumId, artistId) {
    await db('ean_collection.spotify_album_artist').insert({ albumId, artistId }).onConflict().ignore();
  }
}

module.exports = {
  PlaylistService: new PlaylistService(),
  PLAYLIST_SORT: PLAYLIST_SORT,
};
