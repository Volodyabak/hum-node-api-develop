module.exports = {
  GET_TRACK_INFO: `
    SELECT st.id,
           st.track_name                                            as trackName,
           GROUP_CONCAT(DISTINCT (s_ar.artist_name) SEPARATOR ', ') as artists,
           st.track_key                                             as trackKey,
           s_al.album_image                                         as albumImage,
           COALESCE(st.track_preview, atr.track_preview)            as preview
    FROM ean_collection.spotify_track st
           JOIN ean_collection.spotify_album_track sat ON sat.spotify_track_id = st.id
           JOIN ean_collection.spotify_album s_al ON s_al.id = sat.spotify_album_id
           JOIN ean_collection.spotify_artist s_ar ON s_ar.id = sat.spotify_artist_id
           LEFT JOIN ean_collection.apple_track atr ON atr.isrc = st.isrc
    WHERE st.id = :trackId;
  `,

  GET_TRACK_INFO_WITH_ALBUM_NAMES: `
    SELECT st.id,
           st.track_name                                            as trackName,
           GROUP_CONCAT(DISTINCT (s_ar.artist_name) SEPARATOR ', ') as artists,
           st.track_key                                             as trackKey,
           s_al.name                                                as albumName,
           s_al.album_image                                         as albumImage,
           COALESCE(st.track_preview, atr.track_preview)            as preview
    FROM ean_collection.spotify_track st
           JOIN ean_collection.spotify_album_track sat ON sat.spotify_track_id = st.id
           JOIN ean_collection.spotify_album s_al ON s_al.id = sat.spotify_album_id
           JOIN ean_collection.spotify_artist s_ar ON s_ar.id = sat.spotify_artist_id
           LEFT JOIN ean_collection.apple_track atr ON atr.isrc = st.isrc
    WHERE st.id = :trackId;
  `,

  GET_HOT_TAKE_CONTENT_META: `
    SELECT st.track_name                                            as trackName,
           s_al.album_image                                         as albumImage,
           GROUP_CONCAT(DISTINCT (s_ar.artist_name) SEPARATOR ', ') as artists
    FROM labl.brackhit_content bc
           JOIN ean_collection.spotify_track st ON st.id = bc.content_id
           JOIN ean_collection.spotify_album_track sat ON sat.spotify_track_id = st.id
           JOIN ean_collection.spotify_album s_al ON s_al.id = sat.spotify_album_id
           JOIN ean_collection.spotify_artist s_ar ON s_ar.id = sat.spotify_artist_id
           LEFT JOIN ean_collection.apple_track atr ON atr.isrc = st.isrc
    WHERE bc.choice_id = :choiceId;
  `,
};
