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

	//There's a new track, so destroy any previous radioSessions.
	this.radioSession = null;

	//Set the seedTrack to the last track added.
	this.seedTrack = trackId;

	LocalQueueManager.prototype.addTrack.call(this,trackId);

};


RadioQueueManager.prototype.getNextTrack = function(callback) {

	console.log( "getNextTrack" );
	var scope = this;

	//If there's nothing in the queue, look into starting a radio station
	if ( this.queue.length == 0 ) {

		//If radioOn is true and if there's a seed track, then...
		if ( this.radioOn && this.seedTrack != null ) {

			//See if an existing radio session exists. 
			if ( this.radioSession == null ) {

				//Start a radio station based on the seed track
				this.startRadioStation(this.seedTrack,function(){

					var innerscope = scope;
					var innercallback = callback;

					//Fetch the next track based on that new radio session
					scope.fetchNextTrackInStation(function(track) {
						innerscope.setCurrentTrack(track,innercallback);
					});

				});

			} else {

				//A radio session already exists, so get the next track.
				this.fetchNextTrackInStation(function(track) {
					scope.setCurrentTrack(track,callback);
				});

			}

		} else {

			//The radio is off and we're at the end of our queue.
			//Set the current track to null.
			scope.setCurrentTrack(null,callback);
		}



	} else {

		//There are still songs in the queue, so proceed as normal
		LocalQueueManager.prototype.getNextTrack.call(this,callback);
	}
};

RadioQueueManager.prototype.startRadioStation = function(seed,callback) {

	var scope = this;
	var requestURI = this.radioCreateBaseOnTrackURI;
	
	requestURI = requestURI.replace( "[ID]" , seed );
	
	request(requestURI, function (error, response, body) {
  	
	  if (!error && response.statusCode == 200) {

	 	var rawResponseJSON = JSON.parse( body ).response;
		scope.radioSession = rawResponseJSON.session_id;
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
	//this.seedTrack = null;

	LocalQueueManager.prototype.emptyQueue.call(this);

};

