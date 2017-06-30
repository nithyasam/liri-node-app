var keys = require("./keys.js");
var fs = require("fs");
var request = require("request");
var command = process.argv[2];
var name = "";
//==================================
//Appending data to file
//==================================
function writeData(value){
	fs.appendFile("log.txt",value, function(error){
		if(error){
			console.log(error);
		}
	});
}
//==================================
//Logs tweets to console and file
//==================================
function logTweets(screen_name, tweets){
	console.log("\n@"+screen_name + " tweets :\n"+ 
		"====================\n");
	writeData(command+"\n@"+screen_name + " tweets :\n"+ 
		"====================\n");
	for(var i=0; i<tweets.length; i++){
		console.log(tweets[i].text);
		writeData(tweets[i].text + "\n");
	}
}
//==================================
//Logs "spotify-this-song" to 
//console and file
//==================================
function logSpotify(response){
	var items = response.tracks.items;
	var artists = "";
	var song_name = items[0].name;
	var preview_link = items[0].preview_url;
	var album_name = items[0].album.name;
	if(items.length>0){
		artists = items[0].artists[0].name;
		for(var i=1; i<items[0].artists.length;i++){
			artists += ", "+ items[0].artists[i].name;
		}
		console.log("Artists      : "+artists+ "\n"+
			"Song Name.   : "+song_name+ "\n"+
			"Preview Link : "+ preview_link + "\n"+
			"Album Name   : "+ album_name+ "\n");
		writeData(command+"\n==============\n"+
			"Artists      : "+artists+ "\n"+
			"Song Name.   : "+song_name+ "\n"+
			"Preview Link : "+ preview_link + "\n"+
			"Album Name   : "+ album_name+ "\n")
	}
}
//==================================
//Calling Twitter API
//==================================
function callTwitter(){
	var Twitter = require('twitter');
	var client = new Twitter({
		consumer_key: keys.twitterKeys.consumer_key,
		consumer_secret: keys.twitterKeys.consumer_secret,
		access_token_key: keys.twitterKeys.access_token_key,
		access_token_secret: keys.twitterKeys.access_token_secret
	});

	var params = {screen_name: 'Nithya_SMU', count: 20};
	client.get('statuses/user_timeline', params, function(error, tweets, response) {
		if (!error) {
			logTweets(params.screen_name, tweets);
		}
	});
}
//==================================
//Calling Spotify API
//==================================
function callSpotify(song){
	var song = song;
	if(song == undefined){
		song = '"The Sign" by Ace of Base';
	}
	var Spotify = require('node-spotify-api');

	var spotify = new Spotify({
		id: keys.spotifyKeys.client_id,
		secret: keys.spotifyKeys.client_secret
	});

	spotify
	.search({ type: 'track', query: song})
	.then(function(response) {
		logSpotify(response);
	})
	.catch(function(err) {
		console.log(error);
	});
}
//==================================
//Calling OMDB API
//==================================
function callOMDB(movieName){
	var queryUrl = "http://www.omdbapi.com/?t=" + movieName + 
					"&y=&plot=short&apikey=40e9cece";
	request(queryUrl,function(error,response, body){
		if (!error && response.statusCode === 200) {
			console.log(JSON.parse(body));
		}
	});
}
//==================================
//Getting argument with multiple words
//==================================
function getArgs(){
	for (var i = 3; i < process.argv.length; i++) {
		if (i > 3 && i < process.argv.length) {
			name = name + "+" + process.argv[i];
		}
		else {
			name += process.argv[i];
		}
	}
	return name;
}
//==================================
//Handling input commands
//==================================
switch(command){
	case "my-tweets":
	callTwitter();
	break;

	case "spotify-this-song":
	var song = getArgs();
	callSpotify(song);
	break;

	case "movie-this":
	var movie = getArgs();
	callOMDB();
	break;

	case "do-what-it-says":
	break;

	default:
}