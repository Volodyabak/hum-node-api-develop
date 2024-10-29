import { Injectable } from '@nestjs/common';
import {
  ArtistModel,
  SpotifyAlbumArtistModel,
  SpotifyAlbumModel,
  SpotifyAlbumTrackModel,
  SpotifyArtistModel,
  SpotifyTrackModel,
} from '@database/Models';
import { expr } from '@database/relations/relation-builder';
import { Relations } from '@database/relations/relations';
import { SpotifySdk } from './spotify.sdk';
import { CentralIsrcModel } from '@database/Models/Spotify/central-isrc.model';

@Injectable()
export class SpotifyContentService {
  constructor(private readonly spotifySdk: SpotifySdk) {}

  async getArtist(id: number | string) {
    const data = typeof id === 'number' ? { 'a.id': id } : { spotifyArtistkey: id };
    return ArtistModel.query()
      .alias('a')
      .findOne(data)
      .withGraphJoined(expr([Relations.SpotifyArtist]));
  }

  async findOrInsertArtist(id: string) {
    const artist = await this.getArtist(id);

    if (!artist || !artist.spotifyArtist?.id) {
      return this.insertArtist(id);
    }

    return artist;
  }

  async insertArtist(id: string) {
    const spotifySdkArtist = await this.spotifySdk.getArtist(id);
    await ArtistModel.query()
      .insert({
        isActive: 0,
        facebookName: spotifySdkArtist.name,
        imageFile: spotifySdkArtist.images[0]?.url,
        spotifyArtistkey: spotifySdkArtist.id,
        lastUpdate: new Date(),
      })
      .onConflict()
      .merge(['facebookName', 'imageFile', 'lastUpdate']);

    const artist = await ArtistModel.query().findOne({ spotifyArtistkey: spotifySdkArtist.id });

    await SpotifyArtistModel.query()
      .insert({
        artistId: artist.id,
        artistKey: spotifySdkArtist.id,
        artistName: spotifySdkArtist.name,
        lastChecked: new Date(),
      })
      .onConflict()
      .merge(['artistName', 'lastChecked']);

    artist.spotifyArtist = await SpotifyArtistModel.query().findOne({
      artistKey: spotifySdkArtist.id,
    });

    return artist;
  }

  async saveTrackFromAlbum(trackId: string) {
    const spotifyTrack = await this.spotifySdk.getTrack(trackId);
    await this.findOrInsertAlbum(spotifyTrack.album.id, trackId);
  }

  async findOrInsertTrack(trackId: string) {
    const track = await this.getTrack(trackId);
    return track ? track : this.saveTrack(trackId);
  }

  getTrack(id: number | string) {
    const data = typeof id === 'number' ? { id } : { trackKey: id };
    return SpotifyTrackModel.query().findOne(data);
  }

  async saveTrack(id: string) {
    const spotifyTrack = await this.spotifySdk.getTrack(id);

    let isrc = await CentralIsrcModel.query().findOne({ isrc: spotifyTrack.external_ids.isrc });

    if (!isrc) {
      isrc = await CentralIsrcModel.query()
        .insertAndFetch({
          isrc: spotifyTrack.external_ids.isrc,
        })
        .onConflict()
        .merge();
    }

    await SpotifyTrackModel.query()
      .insert({
        trackKey: spotifyTrack.id,
        trackName: spotifyTrack.name,
        trackDisc: spotifyTrack.disc_number,
        trackNumber: spotifyTrack.track_number,
        explicit: Number(spotifyTrack.explicit),
        popularity: spotifyTrack.popularity,
        trackUri: spotifyTrack.uri,
        trackPreview: spotifyTrack.preview_url,
        isrc: spotifyTrack.external_ids.isrc,
        isrcId: isrc.id,
        lastChecked: new Date(),
      })
      .onConflict()
      .merge(['trackName', 'trackDisc', 'explicit', 'trackNumber', 'popularity', 'lastChecked']);
    return SpotifyTrackModel.query().findOne({ trackKey: spotifyTrack.id });
  }

  async findOrInsertAlbum(albumId: string, trackId?: string) {
    const spotifyAlbum = await this.spotifySdk.getAlbum(albumId);
    const albumModel = await this.saveAlbum(spotifyAlbum);

    for (const artist of spotifyAlbum.artists) {
      const artistModel = await this.findOrInsertArtist(artist.id);
      await this.linkAlbumArtist(albumModel.id, artistModel.spotifyArtist.id);
    }

    let tracks = spotifyAlbum.tracks.items;
    if (trackId) {
      tracks = tracks.filter((t) => t.id === trackId);
    }

    for (const track of tracks) {
      const trackModel = await this.findOrInsertTrack(track.id);

      for (const artist of track.artists) {
        const artistModel = await this.findOrInsertArtist(artist.id);
        await this.linkAlbumArtistTrack(albumModel.id, artistModel.spotifyArtist.id, trackModel.id);
      }
    }

    return this.getAlbum(albumModel.id);
  }

  async getAlbum(id: number | string) {
    const data = typeof id === 'number' ? { id } : { albumKey: id };
    return SpotifyAlbumModel.query()
      .findOne(data)
      .withGraphFetched(expr([Relations.SpotifyArtists]));
  }

  async saveAlbum(spotifyAlbum: SpotifyApi.SingleAlbumResponse) {
    await SpotifyAlbumModel.query()
      .insert({
        albumKey: spotifyAlbum.id,
        name: spotifyAlbum.name,
        albumType: spotifyAlbum.album_type,
        releaseDate: new Date(spotifyAlbum.release_date),
        releaseDatePrecision: spotifyAlbum.release_date_precision,
        albumImage: spotifyAlbum.images[0]?.url, // check good quality image
        // albumLabel: spotifyAlbum.label,
        // copyrights: spotifyAlbum.copyrights[0]?.text?.replace(/©\s|℗\s/, ''),
        // genres: spotifyAlbum.genres.join(','),
        // markets: spotifyAlbum.available_markets.join(','),
      })
      .onConflict()
      .merge(['name']);
    return SpotifyAlbumModel.query().findOne({ albumKey: spotifyAlbum.id });
  }

  async linkAlbumArtist(albumId: number, artistId: number) {
    return SpotifyAlbumArtistModel.query().insert({ albumId, artistId }).onConflict().ignore();
  }

  async linkAlbumArtistTrack(
    spotifyAlbumId: number,
    spotifyArtistId: number,
    spotifyTrackId: number,
  ) {
    return SpotifyAlbumTrackModel.query()
      .insert({ spotifyAlbumId, spotifyArtistId, spotifyTrackId })
      .onConflict()
      .ignore();
  }
}
