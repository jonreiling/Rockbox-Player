module.exports = SpotifyHelper;

var events = require('events');

/**
	Constructor.
*/
function SpotifyHelper() {
    events.EventEmitter.call(this);
    this.spotify = require('spotify')({ appkeyFile: 'spotify_appkey.key' });
	this.playing = false;
	this.queueManager = null;
	this.keepAliveIntervalReference = undefined;
	this.keepAliveTimeout = 1000 * 60 * 60; //Every hour of inactivity.
}

/**
	Set up class to inheret event emitter. 
*/
SpotifyHelper.super_ = events.EventEmitter;
SpotifyHelper.prototype = Object.create(events.EventEmitter.prototype, {
    constructor: {
        enumerable: false,
    }
});

/**
	Set the queue manager that SpotifyHelper will use to populate upcoming tracks.
*/
SpotifyHelper.prototype.setQueueManager = function( queueManager ) {

	var scope = this;

	this.queueManager = queueManager;

	//When a new track has been added to an empty queue, we want to play that
	//song right away, if one isn't already playing.
	this.queueManager.addListener('firstTrack',function() {
		scope.playNextTrack();
	});
}


/**
	Log-in based on the contents of credentials.js.
*/
SpotifyHelper.prototype.logIn = function( callback ) {

	var scope = this;
	this.spotify.on({
		
		ready:function() {
		
			callback();

			//Start our keepalive process.
			scope.startKeepAlive();

			//Set up end of track functions.
			scope.spotify.player.on({
			
				endOfTrack:function(err, player) {
					scope.playNextTrack();
				}
	
			})
		}
	});
	this.spotify.login(process.env.SPOTIFY_USER, process.env.SPOTIFY_PASS, true, false);
}


/**
	Toggle the play/paused state.
*/
SpotifyHelper.prototype.pause = function() {

	//If there's no current track, don't do anything.
	if ( this.queueManager.getCurrentTrack() == null ) {
		return;
	}
	
	//Toggle play/paused
	if ( this.playing ) {
		this.spotify.player.pause();
		this.setPlayState( false );
	} else {
		this.spotify.player.resume();
		this.setPlayState( true );
	}	
};


/**
	Play the next upcoming track.
*/
SpotifyHelper.prototype.playNextTrack = function() {
	
	var scope = this;

	//Fetch the next track.
	this.queueManager.getNextTrack( function(track) {
		//If there's no upcoming track, stop everything.
		if ( track == null ) {

			scope.setPlayState( false );
			scope.spotify.player.stop();

		} else {

			//Attempt to play the next song. We need to do a try/catch here because
			//occasionally we get songs back from services like Echonest that aren't
			//licensed to be played.
			try {

				scope.setPlayState( true );
				scope.spotify.player.play( track );
			
			} catch(err){

				//If there's an error, log it and move onto the next track.
				console.log( "THERE WAS AN ERROR PLAYING A TRACK" , track);
				console.log(err);
				scope.playNextTrack();
			}

		}
	});

}

/**
	Skip to the next track.
*/
SpotifyHelper.prototype.skip = function() {
	
	this.playNextTrack();
}

/**
	Return if there is currently something playing.
*/
SpotifyHelper.prototype.isPlaying = function(){
	return this.playing;
}

SpotifyHelper.prototype.setPlayState = function( newState ) {
	
	//If there's a state change then broadcast it.
	if ( this.playing != newState ) {
		this.playing = newState;
		this.emit( 'stateUpdate' );
	}
	
	if ( this.playing ) {
		this.stopKeepAlive();
	} else {
		this.startKeepAlive(); //If we're paused, start our keep alive timer.
	}
	
	this.playing = newState;
}


/**
	Stop all activity in case of disconnect 
*/
SpotifyHelper.prototype.stopAll = function() {

	//If there's no current track, don't do anything.
	if ( this.queueManager.getCurrentTrack() == null ) {
		return;
	}

	this.spotify.player.pause();
	this.setPlayState( false );
	
};


/**
	Start our keepalive timer.
*/
SpotifyHelper.prototype.startKeepAlive = function() {
	
	var scope = this;
	this.keepAliveIntervalReference = setTimeout(function() {
		scope.keepAlive();
	},this.keepAliveTimeout);
}

/**
	Stop the keepalive timer.
*/
SpotifyHelper.prototype.stopKeepAlive = function() {
	clearTimeout( this.keepAliveIntervalReference );
}

/**
	Spotify needs to be hit every so often in order to maintain a valid log-in session.
	In this case, if there's been an hour of inactivity, we play a few moments of a song
	and then stop. 
*/
SpotifyHelper.prototype.keepAlive = function() {
	
	console.log( "Keep alive fired" , new Date() );

	var scope = this;
	
	//Empty out the queue, on the off-chance the inactivity is due ot a song
	//being puased. Otherwise, we'd have a weird bit of logic to do on resumption of play.
	this.queueManager.emptyQueue();
	
	//Faith by GM. Has a nice bit of silence in front of it. Plus, it's awesome.
	var keepAliveTrack = this.spotify.createFromLink( "spotify:track:0HEmnAUT8PHznIAAmVXqFJ" ); 
	this.spotify.player.play( keepAliveTrack );
	
	//Play for one second and then stop.
	setTimeout( function() {
		scope.spotify.player.stop(); //Stop after 1 second.
	},1000);
		
	//Star the keepalive timer again.
	this.startKeepAlive();
}

/**
	Return the spotify object (can be used elsewhere)
*/
SpotifyHelper.prototype.spotifyObject = function() {
	return this.spotify;
}