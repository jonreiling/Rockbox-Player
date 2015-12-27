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

BaseQueueManager.prototype.add = function(id) {
	if ( id.indexOf(':track:') != -1 ) {
		this.addTrack(id);
	} else if ( id.indexOf(':album:') != -1 ) {
		this.addAlbum(id);
	}
}

BaseQueueManager.prototype.addTrack = function(trackId) {
	this.emit( 'queueUpdate' );

};

BaseQueueManager.prototype.addAlbum = function(albumId) {

};


BaseQueueManager.prototype.getSpotifyObject = function( object , callback ) {


	//If the object is already loaded, make the call-back immediately.
	if (object.isLoaded) {

		this.getSpotifyExtras(object,callback);

	} else { //Otherwise, wait for it load.
		var scope = this;
		this.spotifyObject.waitForLoaded([object], function(){
			scope.getSpotifyExtras(object,callback);
		});		
	}
	
}

BaseQueueManager.prototype.getSpotifyExtras = function( track , callback ) {

	//If the object extras already exist (not sure why they would, but just in case), just callback.
	if (track.album_art_url) {

		callback(track);

	} else { //Otherwise, call the api.

		var id = track.link;
		id = id.replace("spotify:track:","");

		request( 'https://api.spotify.com/v1/tracks/' + id , function (error, response, body) {

			if (!error){

				var json = JSON.parse( body );

				//Set track album art
	//			track.album_art = json.album.images[0].url;
	//			track.explicit = json.explicit;
				track.object = json;

			} else {
	//			track.album_art = '';
	//			track.explicit = false;
			}


			callback(track);
		});
	}
}