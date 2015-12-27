require('dotenv-safe').load();

var spotifyHelper = new (require('./libs/spotify-helper'))();
var queueManager = new (require('./libs/queueManager/RadioQueueManager'))(spotifyHelper.spotifyObject());
var volumeHelper = new (require('./libs/volume-helper'))();
var socketObject;

spotifyHelper.logIn( function() {

	console.log( 'logged in' );

	spotifyHelper.setQueueManager( queueManager );

	queueManager.addListener('queueUpdate',function() {
		broadcastQueue();
	});

	spotifyHelper.addListener('stateUpdate',function() {
		broadcastState();
	});

	volumeHelper.addListener('volumeUpdate',function() {
		broadcastVolume();
	});

	setupWithPassthroughServer();
});


function setupWithPassthroughServer() {

	socketObject = require('socket.io-client')(process.env.PASSTHROUGH_SERVER + '/rockbox-player');
	
	socketObject.on('add', function(id){
		queueManager.add(id);
	});

	socketObject.on('setRadio', function(onOff){
		console.log( 'SET RADIO' , onOff);
		queueManager.radioOn = onOff;
		broadcastState();
	});

	socketObject.on('setVolume', function(volume){
		volumeHelper.setVolume(volume);
	});

	socketObject.on('pause',function() {
		spotifyHelper.pause();
	});

	socketObject.on('skip',function() {
		spotifyHelper.playNextTrack();
	});

	socketObject.on('connect', function(){
		console.log( 'connected' );
		broadcastQueue();
		broadcastState();
		broadcastVolume();
	});

	socketObject.on('disconnect', function(){
		console.log('disconnect');
		spotifyHelper.stopAll();
	});	
}

function broadcastState() {

	socketObject.emit( 'stateUpdate' , {'playing':spotifyHelper.isPlaying(), 'radio':queueManager.radioOn});
}

function broadcastQueue() {

	queueManager.getQueue(function(queue) {
		socketObject.emit( 'queueUpdate',{'queue':queue});
	})
}

function broadcastVolume() {
	
	socketObject.emit( 'volumeUpdate', {'volume':volumeHelper.getVolume()});
}