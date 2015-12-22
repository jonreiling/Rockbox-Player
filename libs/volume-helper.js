require('shelljs/global');

module.exports = VolumeHelper;
var events = require('events');

function VolumeHelper() {
	this.currentVolume = 60;
	this.perceivedVolume = 60;
}

VolumeHelper.super_ = events.EventEmitter;
VolumeHelper.prototype = Object.create(events.EventEmitter.prototype, {
    constructor: {
        enumerable: false,
    }
});

VolumeHelper.prototype.setVolume = function( volume ) {

	switch (volume) {

		case 'up':
			volume = this.currentVolume + 10
			break;

		case 'down':
			volume = this.currentVolume - 10;
			break;		

		case 'normal':
			volume = 50;
			break;

		case 'low':
			volume = 15;
			break;

		default:

			break;

	}

	//constrain the volume between 0-100. 
	volume = Math.max( 0 , Math.min( 100 , volume) );
	this.perceivedVolume = volume;
	var targetVol = 40 * (volume/100) + 40;
	
	if ( targetVol != this.currentVolume ) {
		this.emit( 'volumeUpdate' , this.perceivedVolume );
		this.currentVolume = targetVol;
		exec('amixer  sset PCM,0 '+targetVol+'%', {"silent":true}, function(code, output) {});	
	}
}

VolumeHelper.prototype.getVolume = function() {

	return this.perceivedVolume;
}