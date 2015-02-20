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

	this.perceivedVolume = volume;
	var targetVol = 40 * (volume/100) + 60;
	if ( targetVol > 100 ) targetVol = 100;
	
	if ( targetVol != this.currentVolume ) {
		this.emit( 'volumeUpdate' , this.perceivedVolume );
		this.currentVolume = targetVol;
		exec('amixer  sset PCM,0 '+targetVol+'%', {"silent":true}, function(code, output) {});	
	}
}

VolumeHelper.prototype.getVolume = function() {

	return this.perceivedVolume;
}