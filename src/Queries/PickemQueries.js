module.exports = {
  GET_ALL_PICKEMARTISTS: `SELECT
    ds.artist_id,
    ds.daily_points,
    ds.social_points as socialPoints,
    ds.streaming_points as streamingPoints,
    ds.video_points as videoPoints,
    ds.direction,
    ds.date,
		c.category as status,
    COALESCE(a.spotify_artistkey, sa.artist_key) as spotifyId,
    a.facebook_name as artist_name,
    (
    CASE
        WHEN  a.image_file IS NULL
        THEN
            'https://emergingartistnetwork.com/images/no_profile.png'
        ELSE
            CASE
            WHEN SUBSTRING(a.image_file, 1, 4) = 'http'
            THEN a.image_file
            ELSE
            CONCAT('https://emergingartistnetwork.com/images/', a.image_file)
            END
        END) as artist_photo,
    genre.genre_name

    FROM labl.daily_scores ds

	    INNER JOIN (

	                SELECT artist_id, max(date) as max_date
	                FROM labl.daily_scores
	                GROUP BY artist_id

	    ) groupeda
	            ON groupeda.artist_id = ds.artist_id
	                AND ds.date = groupeda.max_date

    LEFT JOIN ean_collection.artist a ON a.id = groupeda.artist_id
    LEFT JOIN ean_collection.spotify_artist sa on sa.artist_id = a.id
    LEFT JOIN (
	    SELECT
	    ag.artist_id,
	    COALESCE(glt.labl_genre, COALESCE(g.genre_parent, g.genre_id)) genre_id
	    FROM
	    (
		    SELECT
		    artist_id,
		    min(genre_id) genre_id
		    FROM ean_collection.artist_genre
		    GROUP BY artist_id
	    ) ag
	    LEFT JOIN ean_collection.genre g ON g.genre_id = ag.genre_id
	    LEFT JOIN ean_collection.genre_labl_temp glt ON COALESCE(g.genre_parent, g.genre_id) = glt.genre_parent
	    ORDER BY ag.artist_id ASC
    ) master_genre
            ON a.id = master_genre.artist_id
    LEFT JOIN ean_collection.genre ON master_genre.genre_id = genre.genre_id

			LEFT JOIN ean_collection.artist_category ac
								ON ac.artist_id = a.id
									AND ac.run = (SELECT MAX(run) FROM ean_collection.artist_category WHERE artist_id = a.id)
			LEFT JOIN ean_collection.categories c ON ac.category_id = c.id
    `,

  CREATE_GAME:
    'INSERT INTO `labl`.`user_game` (user_id, number_rounds, number_questions) VALUES (:user, :rounds, :questions)',

  GET_GAME_DATA:
    'SELECT game_id, time_created, time_completed, number_questions, number_rounds FROM  `labl`.`user_game` WHERE game_id = :game AND user_id =:user',

  INSERT_GAME_ROUND_PARTIAL: `INSERT INTO labl.game_round
		(
			game_id, round_id, question_number, time_answered, artistid_guess,
			artistid_solution, artistid_nonsolution, pointsdate_artistsolution,
			pointsdate_artistnonsolution
		)

		VALUES(
			:game, :round, :question, :time, :artistid_guess, :artistid_solution,
			:artistid_nonsolution, :date_solution, :date_nonsolution
		)`,

  UPDATE_GAME_ROUND_PARTIAL: `UPDATE labl.game_round
		SET time_answered = NOW(), artistid_guess = :artistid_guess
		WHERE game_id = :game AND round_id = :round AND question_number = :question`,

  SELECT_LAST_GAMEROUND: `SELECT round_id, question_number, artistid_solution, artistid_nonsolution, ug.number_rounds,
		ug.time_created, ug.time_completed

		FROM labl.game_round gr
		INNER JOIN (

     		SELECT max(round_id) as maxround
			FROM labl.game_round gr
			WHERE gr.game_id = :game

		) temp

		JOIN labl.user_game ug on ug.game_id = gr.game_id

		WHERE round_id = temp.maxround AND gr.game_id = :game_prime`,

  // Returns Top Artists & feed artists data
  SELECT_PICKEM_ARTISTS: `
		SELECT
		ds.artist_id,
		ds.daily_points,
		ds.social_points as socialPoints,
		ds.streaming_points as streamingPoints,
		ds.video_points as videoPoints,
		ds.direction,
		ds.date,
	  c.category as status,
		COALESCE(a.spotify_artistkey, sa.artist_key) as spotifyId,
		a.facebook_name as artist_name,
         genre.genre_name,
		 (CASE
	        WHEN  a.image_file IS NULL
	        THEN
	            'https://emergingartistnetwork.com/images/no_profile.png'
	        ELSE
	            CASE
	            WHEN SUBSTRING(a.image_file, 1, 4) = 'http'
	            THEN a.image_file
	            ELSE
	            CONCAT('https://emergingartistnetwork.com/images/', a.image_file)
	            END
	        END) as artist_photo


         FROM labl.daily_scores ds

         INNER JOIN (

         		SELECT artist_id, max(date) as max_date
				FROM labl.daily_scores
				GROUP BY artist_id

			) groupeda
	    	ON groupeda.artist_id = ds.artist_id
	    		AND ds.date = groupeda.max_date

		 JOIN (

				SELECT DISTINCT artist_id FROM labl.user_feed_preferences
             		WHERE user_id = :user
			UNION

				SELECT sa.artist_id
	            FROM ean_collection.spotify_artist as sa

	            JOIN labl.user_spotify_artist as usa
	                ON usa.spotify_artist_id = sa.id
	            WHERE usa.user_id = :userPrime AND sa.artist_id IS NOT NULL

	        ) artists on artists.artist_id = ds.artist_id

		JOIN ean_collection.artist a on a.id = ds.artist_id
		LEFT JOIN ean_collection.spotify_artist sa on sa.artist_id = a.id
		LEFT JOIN (SELECT
		    ag.artist_id,
		    COALESCE(glt.labl_genre, COALESCE(g.genre_parent, g.genre_id)) genre_id
		    FROM
		    (
		    SELECT
		    artist_id,
		    min(genre_id) genre_id
		    FROM ean_collection.artist_genre
		    GROUP BY artist_id
		    ) ag
		    LEFT JOIN ean_collection.genre g ON g.genre_id = ag.genre_id
		    LEFT JOIN ean_collection.genre_labl_temp glt ON COALESCE(g.genre_parent, g.genre_id) = glt.genre_parent
		    ORDER BY ag.artist_id ASC
		    ) master_genre
		            ON ds.artist_id = master_genre.artist_id
		    LEFT JOIN ean_collection.genre ON master_genre.genre_id = genre.genre_id

				 LEFT JOIN ean_collection.artist_category ac
									 ON ac.artist_id = a.id
										 AND ac.run = (SELECT MAX(run) FROM ean_collection.artist_category WHERE artist_id = a.id)
				 LEFT JOIN ean_collection.categories c ON ac.category_id = c.id
		    `,

  END_GAME: 'UPDATE `labl`.`user_game` SET time_completed = NOW() where game_id = :game',

  COUNT_SCORE: 'SELECT Count(*) FROM `labl`.`game_round` where game_id = :game AND artistid_guess = artistid_solution',

  GET_INPROGRESS_GAME: `SELECT ug.time_created, gr.question_number,
		gr.artistid_solution as ArtistSolution, gr.artistid_nonsolution as ArtistNonsolution,
		gr.pointsdate_artistsolution as dateArtistSolution,
		gr.pointsdate_artistnonsolution as dateArtistNonsolution,
		gr.game_id, number_rounds, number_questions
		FROM labl.user_game ug
		JOIN labl.game_round gr
		ON gr.game_id = (SELECT MAX(game_id) FROM labl.user_game WHERE time_completed IS NULL
		                 AND user_id = :user )
		 AND gr.round_id = (SELECT MAX(round_id) from labl.game_round WHERE game_id = gr.game_id )
		 WHERE ug.game_id = gr.game_id`,

  GET_QUESTION_ARTISTDATA: `SELECT
		 ds.artist_id as ArtistId, ds.daily_points as buzzPoints,
		 ds.direction as rankChange,
		 a.facebook_name as artistName,
		 (CASE
	        WHEN  a.image_file IS NULL
	        THEN
	            'https://emergingartistnetwork.com/images/no_profile.png'
	        ELSE
	            CASE
	            WHEN SUBSTRING(a.image_file, 1, 4) = 'http'
	            THEN a.image_file
	            ELSE
	            CONCAT('https://emergingartistnetwork.com/images/', a.image_file)
	            END
	        END) as artistPhoto

            FROM labl.daily_scores ds

            JOIN ean_collection.artist a ON a.id = ds.artist_id
            AND ( (a.id = :artist_solution AND ds.date = :date_solution) OR (a.id = :artist_nonsolution AND ds.date = :date_nonsolution) )`,
};
