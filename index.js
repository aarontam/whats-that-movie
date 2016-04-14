var rp = require('request-promise'),
	xmlParser = require('simple-xml2json').parser;

var apiKey = process.argv[2],
	description = process.argv[3];

var optionsMovie = {
	uri: 'https://api.whatismymovie.com/1.0/?api_key=' + apiKey + '&text=' + description,
	rejectUnauthorized: false, // needed for https, ssl-root-cas didn't quite work, can debug more later
	json: true
};

rp(optionsMovie)
	.then(function (movies) {
		var movie = movies[0]; // only retrieving the first movie, for now
		return movie;
	})
	.then(function (movie) {
		var optionsOmdb = {
			uri: 'http://omdbapi.com/?i=' + movie.imdb_id_long,
			json: true
		};

		return rp(optionsOmdb);
	})
	.then(function (movie) {
		var imdbId = movie.imdbID,
			data = {};

		if (imdbId) {
			data.title = movie.Title;
			data.year = movie.Year;
			data.runtime = movie.Runtime;
			data.director = movie.Director;
			data.actors = movie.Actors;
			data.plot = movie.Plot;
			data.rating = movie.imdbRating;
			data.posterUrl = movie.Poster;
			data.id = imdbId;

			return data;
		}
	})
	.then(function (data) {
		var optionsTA = {
			uri: 'http://api.traileraddict.com/?imdb=' + data.id.substring(2) + '&width=1080',
			transform: function (json) {
				return xmlParser(json);
			},
			json: true
		};

		rp(optionsTA)
			.then(function (trailerData) {
				data.trailerUrl = 'v.traileraddict.com/' + trailerData.trailers.trailer.trailer_id;
				// do something with the data!
				return data;
			})
			.catch(function (err) {
				// maybe do something with the existing data, regardless - could use finally via ES6
				console.log(err);
			});
	})
	.catch(function (err) {
		console.log(err);
	});