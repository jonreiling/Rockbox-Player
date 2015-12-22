module.exports = BaseQueueManager;
var events = require('events');
var request = require('request');



BaseQueueManager.super_ = events.EventEmitter;
BaseQueueManager.prototype = Object.create(events.EventEmitter.prototype, {
    constructor: {
        enumerable: false,
    }
});

function BaseQueueManager( spotifyObject ) {
	this.spotifyObject = spotifyObject;
}


BaseQueueManager.prototype.getNextTrack = function(callback) {

};

BaseQueueManager.prototype.addTrack = function(trackId) {
	this.emit( 'trackUpdate' );

};

BaseQueueManager.prototype.getSpotifyObject = function( object , callback ) {


	//If the object is already loaded, make the call-back immediately.
	if (object.isLoaded) {

		this.getSpotifyArt(object,callback);
//		callback(object);

	} else { //Otherwise, wait for it load.
		var scope = this;
		this.spotifyObject.waitForLoaded([object], function(){
			scope.getSpotifyArt(object,callback);
//			callback(object);
		});		
	}
	
}

BaseQueueManager.prototype.getSpotifyArt = function( track , callback ) {

	//If the object is already loaded, make the call-back immediately.
	if (track.album_art_url) {

		callback(track);

	} else { //Otherwise, wait for it load.

		console.log(track);

		var id = track.album.link;
		id = id.replace("spotify:album:","");

		request( 'https://api.spotify.com/v1/albums/' + id , function (error, response, body) {

			if (!error){

				var json = JSON.parse( body );
				console.log(json.images[0].url);
				track.album_cover_art = json.images[0].url;

			} else {
				track.album_cover_art = '';
			}

			console.log(track);
			callback(track);
		});
	}
}