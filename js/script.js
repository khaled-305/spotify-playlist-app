const app = {};

app.apiUrl = 'https://api.spotify.com/v1';

// allow the user to enter names of artists on the form
app.events = function() {
	$('form').on('submit', function(e) {
		e.preventDefault();
		let artists = $('input[type=search]').val();
		artists = artists.split(',');
		let search = artists.map(artistName => app.searchArtist(artistName));

		app.retreiveArtistInfo(search);
	});
};

// go to spotify and get the name of the artist
app.searchArtist = (artistName) => $.ajax({
	url: `${app.apiUrl}/search`,
	method: 'GET',
	dataType: 'json',
	data: {
		q: artistName,
		type: 'artist'
	}
});

// get albums of the artist with the ID
app.getArtistAlbums = (artistId) => $.ajax({
	url: `${app.apiUrl}/artists/${artistId}/albums`,
	method: 'GET',
	dataType: 'json',
	data: {
		album_type: 'album'
	}
});

// get tracks from the albums
app.getArtistTracks = (id) => $.ajax({
	url: `${app.apiUrl}/albums/${id}/tracks`,
	method: 'GET',
	dataType: 'json'
})

// build playlist
app.buildPlayList = function(tracks) {
	$.when(...tracks)
	.then((...tracksResults) => {
		tracksResults = tracksResults.map(getFirstElement)
		.map(item => item.items)
		.reduce(flatten, [])
		.map(item => item.id)

		const randomTracks = [];
		for (let i = 0; i < 30; i++) {
			randomTracks.push(getRandomTrack(tracksResults));
		}

		const baseUrl = `https://embed.spotify.com/?theme=white&uri=spotify:trackset:My Playlist:${randomTracks.join()}`;

		$('.playlist').html(`<iframe src="${baseUrl}" height="400"></iframe>`);

		console.log(baseUrl);
	})
}

// get artist info
app.retreiveArtistInfo = function(search) {
	$.when(...search)
	.then((...results) => {
		results = results.map(getFirstElement)
		.map(res => res.artists.items[0].id)
		.map(id => app.getArtistAlbums(id));
		app.retreiveArtistTracks(results);
	});
};

app.retreiveArtistTracks = function(artistAlbums) {
	$.when(...artistAlbums)
	.then((...albums) => {
		albumIds = albums.map(getFirstElement)
		.map(res => res.items)
		.reduce(flatten, [])
		.map(album => album.id)
		.map(ids => app.getArtistTracks(ids));
		app.buildPlayList(albumIds)
		console.log(albums);
	});
}

const getFirstElement = (item) => item[0];

const flatten = (prev, curr) => [...prev, ...curr];

const getRandomTrack = (trackArray) => {
	const randoNum = Math.floor(Math.random() * trackArray.length);
	return trackArray[randoNum];
}

app.init = function() {
	app.events();
};

$(app.init);