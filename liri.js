var keys = require("./keys.js");
var fs = require("fs");
var readline = require("readline");
var request = require("request");
var command = process.argv[2];
var name = "";
var search = getArgs();
//==================================
//Appending data to file
//==================================
function writeData(value){
	var fileName = "log.txt";
	fs.appendFile(fileName, value, function(error){
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
function logSpotify(response, song){
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
		writeData("\n"+song+"\n==============\n"+
			"Artists      : "+artists+ "\n"+
			"Song Name.   : "+song_name+ "\n"+
			"Preview Link : "+ preview_link + "\n"+
			"Album Name   : "+ album_name+ "\n");
	}
}
//==================================
//Logs movie data to console and file
//==================================
function logOMDB(data, movieName){
	console.log("\nTitle                  :"+JSON.parse(data).Title+
		"\nYear                   :"+JSON.parse(data).Year+
		"\nIMDB Rating            :"+JSON.parse(data).imdbRating+
		"\nRotten Tomatoes Rating :"+JSON.parse(data).Ratings[1].Value+
		"\nCountry                :"+JSON.parse(data).Country+
		"\nLanguage               :"+JSON.parse(data).Language+
		"\nPlot                   :"+JSON.parse(data).Plot+
		"\nActors                 :"+JSON.parse(data).Actors+"\n");
	writeData("\n"+movieName+"\n==============\n"+
		"\nTitle                  :"+JSON.parse(data).Title+
		"\nYear                   :"+JSON.parse(data).Year+
		"\nIMDB Rating            :"+JSON.parse(data).imdbRating+
		"\nRotten Tomatoes Rating :"+JSON.parse(data).Ratings[1].Value+
		"\nCountry                :"+JSON.parse(data).Country+
		"\nLanguage               :"+JSON.parse(data).Language+
		"\nPlot                   :"+JSON.parse(data).Plot+
		"\nActors                 :"+JSON.parse(data).Actors+"\n");
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
	if(song == ""){
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
		logSpotify(response, song);
	})
	.catch(function(err) {
		console.log(error);
	});
}
//==================================
//Calling OMDB API
//==================================
function callOMDB(movieName){
	var movie = movieName;
	if(movieName == ""){
		movieName = "Mr. Nobody";
	}
	var queryUrl = "http://www.omdbapi.com/?t=" + movieName + 
	"&y=&plot=short&apikey=40e9cece";
	request(queryUrl,function(error,response, body){
		if (!error && response.statusCode === 200) {
			logOMDB(body, movieName);
		}
	});
}
//==================================
//Calling random.txt for 
//do-what-it-says
//==================================
function callRandom(){
	var data=fs.readFileSync('random.txt');
	var fileArr = data.toString().split('\n');
	//Find the number of lines in the file.
	var numberOfLines = fileArr.length;
	//Generate a random number within the number of lines in the file.
	var randomNum = Math.floor((Math.random() * (numberOfLines-1)));
	var lineArr = fileArr[randomNum].split(",");
	command = lineArr[0];
	search = lineArr[1];
	commands();
}

//==================================
//Getting argument with multiple words
//==================================
function getArgs(){
	name = "";
	for (var i = 3; i < process.argv.length; i++) {
		if (i > 3 && i < process.argv.length) {
			name = name + "+" + process.argv[i];
		}
		else {
			name += process.argv[i];
		}
	}
	console.log(name);
	return name;
}
//==================================
//Handling liri commands
//==================================
function commands(){
	switch(command){
		case "my-tweets":
		callTwitter();
		break;

		case "spotify-this-song":
		callSpotify(search);
		break;

		case "movie-this":
		callOMDB(search);
		break;

		case "do-what-it-says":
		callRandom();
		break;

		default:
		console.log("Oops! Please choose from these commands:\n"+
			"========================================\n"+
			"my-tweets\nspotify-this-song <song>\n"+
			"movie-this <movie-name>\ndo-what-it-says");
	}
}
commands();