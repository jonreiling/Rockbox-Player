module.exports = LocalQueueManager;
var BaseQueueManager = require('./BaseQueueManager.js');
var request = require('request');

function LocalQueueManager( spotifyObject ) {
	BaseQueueManager.call(this,spotifyObject);
	this.queue = [];
	this.currentTrack = null;
}

// inherit events.EventEmitter
LocalQueueManager.super_ = BaseQueueManager;
LocalQueueManager.prototype = Object.create(BaseQueueManager.prototype, {
    constructor: {
        enumerable: false,
    }
});

LocalQueueManager.prototype.addTrack = function(trackIds) {

	//See if this is the first track we're adding after a full stop.
	var firstTrack = ( this.queue.length == 0 && this.currentTrack == null );

	//Split out, in case multiples
	var tracks = trackIds.split(",");

	for ( var i = 0 ; i < tracks.length ; i ++ ) {
		var trackObj = this.spotifyObject.createFromLink( tracks[i] );
		this.queue.push( trackObj );
		this.getSpotifyObject( trackObj , function(t) {});

	}

	if ( firstTrack ) {
		this.emit( 'firstTrack' );
	} else {
		this.emit( 'queueUpdate' );
	}
};

LocalQueueManager.prototype.addAlbum = function(albumId) {

	var scope = this;
	albumId = albumId.replace("spotify:album:","");

	request( 'https://api.spotify.com/v1/albums/' + albumId +'/tracks?limit=50' , function (error, response, body) {

		if (!error){

			var json = JSON.parse( body );
			var tracks = [];

			for ( var i = 0 ; i < json.items.length ; i ++ ) {
				tracks.push(json.items[i].uri);
			}

			scope.addTrack(tracks.join(","));

		}

	});

}

LocalQueueManager.prototype.getCurrentTrack = function() {
	return this.currentTrack;
	return ( this.currentTrack != null ) ? this.currentTrack : {};
}

LocalQueueManager.prototype.getQueue = function(callback) {

	var scope = this;
	var fullQueue = ( this.queue.length == 0 ) ? [] : this.queue.slice(0);
	var fullyLoaded = false;

	if ( this.currentTrack != null ) fullQueue.unshift(this.currentTrack);

	for ( var i = 0 ; i < fullQueue.length ; i ++ ) {

//		if ( fullQueue[ i ].name == "Loading..." ){
		if ( fullQueue[ i ].object == null ){
			setTimeout( function(){ scope.getQueue(callback) } , 10 );
			return;
		}

	}

	for ( i = 0 ; i < fullQueue.length ; i ++ ) {
		fullQueue[i] = fullQueue[i].object;
	}

	return callback(fullQueue);
}


LocalQueueManager.prototype.getNextTrack = function(callback) {

	var scope = this;

	if ( this.queue.length == 0 ) {
		this.setCurrentTrack( null , callback );
	} else {

		var track = scope.queue.shift();

		this.getSpotifyObject( track , function(t) {
			scope.setCurrentTrack( track , callback );
		});
	}

};


BaseQueueManager.prototype.setCurrentTrack = function(track,callback) {
	this.currentTrack = track;
	callback(track);
	this.emit( 'queueUpdate' );
}


LocalQueueManager.prototype.hasNextTrack = function() {
	return this.queue.length != 0;
};

LocalQueueManager.prototype.emptyQueue = function() {
	this.queue = [];
	currentTrack = null;
	this.emit( 'queueUpdate' );
};
