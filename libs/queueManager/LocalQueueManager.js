module.exports = LocalQueueManager;
var BaseQueueManager = require('./BaseQueueManager.js');

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

LocalQueueManager.prototype.addTrack = function(trackId) {
	console.log( "Add track" , trackId );
	this.queue.push( this.spotifyObject.createFromLink( trackId ) );
	this.emit( 'trackUpdate' );

	if ( this.queue.length == 1 && this.currentTrack == null ) {
		this.emit( 'firstTrack' );
	}

};

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

		if ( fullQueue[ i ].name == "Loading..." ){
			setTimeout( function(){ scope.getQueue(callback) } , 10 );
			return;
		}

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
	this.emit( 'trackUpdate' );
}


LocalQueueManager.prototype.hasNextTrack = function() {
	return this.queue.length != 0;
};

LocalQueueManager.prototype.emptyQueue = function() {
	this.queue = [];
	currentTrack = null;
	this.emit( 'trackUpdate' );
};
