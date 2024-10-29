import { Injectable } from '@nestjs/common';
import { uniqBy } from 'lodash';

import { IPlaylistService } from '../interfaces/spotify.interfaces';
import { MAX_PLAYLIST_SIZE, MIN_PLAYLIST_SIZE, SpotifyPlaylistSort } from '../constants';
import { ErrorConst } from '../../../constants';
import {
  SpotifyAlbumArtistModel,
  SpotifyAlbumModel,
  SpotifyAlbumTrackModel,
  SpotifyArtistModel,
  SpotifyTrackModel,
} from '@database/Models';
import { SpotifyParser } from '../parsers/spotify.parser';
import { SpotifyTrackDto } from '../dto/spotify.dto';

@Injectable()
export class PlaylistService implements IPlaylistService {
  async createPlaylist(
    tracks: SpotifyApi.TrackObjectFull[],
    sort: SpotifyPlaylistSort,
  ): Promise<SpotifyTrackModel[]> {
    const uniqueTracks = uniqBy(tracks, 'id');

    if (sort === SpotifyPlaylistSort.POPULARITY) {
      uniqueTracks.sort((a, b) => b.popularity - a.popularity);
    }

    const playlistTracks = uniqueTracks.slice(0, MAX_PLAYLIST_SIZE);

    if (uniqueTracks.length % 2 === 0 && playlistTracks.length < MIN_PLAYLIST_SIZE) {
      throw new Error(ErrorConst.TRACKS_MUST_BE_UNIQUE);
    }

    return this.savePlaylistTracks(
      playlistTracks.map((track) => SpotifyParser.parseSpotifyTrack(track)),
    );
  }

  async savePlaylistTracks(tracks: SpotifyTrackDto[]): Promise<SpotifyTrackModel[]> {
    const uniqueTracks = uniqBy(tracks, 'trackKey');

    if (uniqueTracks.length % 2 === 0 && uniqueTracks.length < MIN_PLAYLIST_SIZE) {
      throw new Error(ErrorConst.TRACKS_MUST_BE_UNIQUE);
    }

    return Promise.all(
      uniqueTracks.map(async (el) => {
        const {
          artists,
          album: { artists: albumArtists, ...album },
          ...track
        } = el;

        await Promise.all([
          SpotifyTrackModel.query()
            .insert({ ...track })
            .onConflict()
            .merge(),
          SpotifyAlbumModel.query()
            .insert({ ...album })
            .onConflict()
            .merge(),
          Promise.all(
            artists.map((artist) =>
              SpotifyArtistModel.query().insert(artist).onConflict().ignore(),
            ),
          ),
          Promise.all(
            albumArtists.map((artist) =>
              SpotifyArtistModel.query().insert(artist).onConflict().ignore(),
            ),
          ),
        ]);

        const [dbTrack, dbAlbum, dbArtists, dbAlbumArtists] = await Promise.all([
          SpotifyTrackModel.query().findOne({ trackKey: track.trackKey }),
          SpotifyAlbumModel.query().findOne({ albumKey: album.albumKey }),
          SpotifyArtistModel.query().whereIn(
            'artistKey',
            artists.map((el) => el.artistKey),
          ),
          SpotifyArtistModel.query().whereIn(
            'artistKey',
            albumArtists.map((el) => el.artistKey),
          ),
        ]);

        await Promise.all([
          Promise.all(
            dbArtists.map((artist) =>
              SpotifyAlbumTrackModel.query()
                .insert({
                  spotifyTrackId: dbTrack.id,
                  spotifyAlbumId: dbAlbum.id,
                  spotifyArtistId: artist.id,
                })
                .onConflict()
                .merge(),
            ),
          ),
          Promise.all(
            dbAlbumArtists.map((artist) =>
              SpotifyAlbumArtistModel.query()
                .insert({
                  albumId: dbAlbum.id,
                  artistId: artist.id,
                })
                .onConflict()
                .merge(),
            ),
          ),
        ]);

        dbTrack.album = dbAlbum;
        dbTrack.artists = dbArtists;

        return dbTrack;
      }),
    );
  }

  private async createTrack(track: SpotifyApi.TrackObjectFull): Promise<SpotifyTrackModel> {
    await SpotifyTrackModel.query()
      .insert({
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

    return SpotifyTrackModel.query().findOne({ trackKey: track.id });
  }

  private async createAlbum(album: SpotifyApi.AlbumObjectSimplified): Promise<SpotifyAlbumModel> {
    await SpotifyAlbumModel.query()
      .insert({
        albumKey: album.id,
        name: album.name,
        albumType: album.album_type,
        releaseDate: new Date(album.release_date),
        releaseDatePrecision: album.release_date_precision,
        albumImage: album.images[0].url,
        markets: album.available_markets.join(','),
        tracks: album.total_tracks,
      })
      .onConflict()
      .merge();

    return SpotifyAlbumModel.query().findOne({ albumKey: album.id });
  }

  private async createArtist(
    artist: SpotifyApi.ArtistObjectSimplified,
  ): Promise<SpotifyArtistModel> {
    await SpotifyArtistModel.query()
      .insert({ artistKey: artist.id, artistName: artist.name })
      .onConflict()
      .merge();

    return SpotifyArtistModel.query().findOne({ artistKey: artist.id });
  }

  private async linkTrackAlbumArtist(
    trackId: number,
    albumId: number,
    artistId: number,
  ): Promise<void> {
    await SpotifyAlbumTrackModel.query()
      .insert({
        spotifyTrackId: trackId,
        spotifyAlbumId: albumId,
        spotifyArtistId: artistId,
      })
      .onConflict()
      .merge();
  }

  private async linkAlbumArtist(albumId: number, artistId: number): Promise<void> {
    await SpotifyAlbumArtistModel.query().insert({ albumId, artistId }).onConflict().merge();
  }
}
