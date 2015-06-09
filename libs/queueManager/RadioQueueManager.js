module.exports = RadioQueueManager;
var LocalQueueManager = require('./LocalQueueManager.js');
var request = require('request');

function RadioQueueManager( spotifyObject ) {
	LocalQueueManager.call(this,spotifyObject);
	this.radioCreateBaseOnTrackURI = "http://developer.echonest.com/api/v4/playlist/dynamic/create?api_key=HTKXMA4SPYNBDPBMZ&song_id=[ID]&type=song-radio&bucket=id:spotify-US&bucket=tracks&limit=true&session_catalog=CAYDQBV146395B2439"
	this.nextTrackURI = "http://developer.echonest.com/api/v4/playlist/dynamic/next?api_key=HTKXMA4SPYNBDPBMZ&format=json&session_id=[SESSION]";
	this.radioSession = null;
	this.seedTrack = null;
	this.radioOn = true;
}

// inherit events.EventEmitter
RadioQueueManager.super_ = LocalQueueManager;
RadioQueueManager.prototype = Object.create(LocalQueueManager.prototype, {
    constructor: {
        enumerable: false,
    }
});


RadioQueueManager.prototype.addTrack = function(trackId) {

	this.radioSession = null;
	this.seedTrack = trackId;

	LocalQueueManager.prototype.addTrack.call(this,trackId);

};


RadioQueueManager.prototype.getNextTrack = function(callback) {

	console.log( "getNextTrack" );
	var scope = this;


	if ( this.queue.length == 0 ) {
		console.log( "1" );

		if ( this.radioOn ) {
		console.log( "2" );

			if ( this.radioSession == null ) {
		console.log( "3" );

				this.startRadioStation(this.seedTrack,function(){

					var innerscope = scope;
					var innercallback = callback;
					scope.fetchNextTrackInStation(function(track) {
						console.log( "setCurrentTrack" );
						innerscope.setCurrentTrack(track,innercallback);
					});

				});

			} else {

		console.log( "4" );
				this.fetchNextTrackInStation(function(track) {
					scope.setCurrentTrack(track,callback);

				});

			}

		} else {
		console.log( "5" );

			scope.setCurrentTrack(null,callback);
		}



	} else {

		console.log( "6" );
		LocalQueueManager.prototype.getNextTrack.call(this,callback);

	}



};

RadioQueueManager.prototype.startRadioStation = function(seed,callback) {

	console.log( "startRadioStation" );

	var scope = this;
	var requestURI = this.radioCreateBaseOnTrackURI;
	
	seed = seed.replace( "spotify" , "spotify-WW" );
	requestURI = requestURI.replace( "[ID]" , seed );
	
	request(requestURI, function (error, response, body) {
  	
	  if (!error && response.statusCode == 200) {

	 	var rawResponseJSON = JSON.parse( body ).response;
		scope.radioSession = rawResponseJSON.session_id;
		console.log( "scope.radioSession is set to " + scope.radioSession );
		callback();

	  } else {

	  	scope.radioSession = null;
	  	scope.seedTrack = null;
	  	callback();
	  }

	});
}

RadioQueueManager.prototype.fetchNextTrackInStation = function(callback) {
	
	console.log( "fetchNextTrackInStation" );

	var scope = this;
	var requestURI = this.nextTrackURI.replace( "[SESSION]" , this.radioSession );

	request(requestURI, function (error, response, body) {

  	  if (!error && response.statusCode == 200) {
		 	var rawResponseJSON = JSON.parse( body ).response;
			var trackId = rawResponseJSON.songs[0].tracks[0].foreign_id;
			trackId = trackId.replace( "spotify-US" , "spotify" );

			var track = scope.spotifyObject.createFromLink( trackId );

			var innerscope = scope;
			var innercallback = callback;
			scope.getSpotifyObject( track , function(t) {
				t.radioPlay = true;
				innerscope.currentTrack = t;
				innercallback(track);
			});

	  } else {

	  	callback(null);
	  }

	});	
	
}

RadioQueueManager.prototype.emptyQueue = function() {

	this.radioSession = null;
	this.seedTrack = null;

	LocalQueueManager.prototype.emptyQueue.call(this);

};

