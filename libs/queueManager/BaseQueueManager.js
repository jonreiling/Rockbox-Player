module.exports = BaseQueueManager;
var events = require('events');



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

		callback(object);

	} else { //Otherwise, wait for it load.

		this.spotifyObject.waitForLoaded([object], function(){
			callback(object);
		});		
	}
	
}