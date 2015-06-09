var spotifyHelper = new (require('./libs/spotify-helper'))();
var queueManager = new (require('./libs/queueManager/RadioQueueManager'))(spotifyHelper.spotifyObject());
var volumeHelper = new (require('./libs/volume-helper'))();
var socketObject;

spotifyHelper.logIn( function() {

	console.log( "logged in" );

	spotifyHelper.setQueueManager( queueManager );

	queueManager.addListener('trackUpdate',function() {
		broadcastTracks();
	});

	spotifyHelper.addListener('stateUpdate',function() {
		broadcastState();
	});

	volumeHelper.addListener('volumeUpdate',function() {
		broadcastVolume();
	});


	//setupWithPassthroughServer();
	setupAsServer();
});

function setupAsServer() {

	var http = require('http');
	var express = require('express');
	var app = express();
	var server = http.createServer(app);
	var io = require('socket.io').listen(server, {"log":true});

	app.get('/', function(req, res){
	  res.send('');
	});

	server.listen(3000, function () {});

	socketObject = io.of('/rockbox-client');

	io.of('rockbox-client').on('connection', function (socket) {

		broadcastTracks();
		broadcastState();
		broadcastVolume();

		socket.on('pause',function() {
			spotifyHelper.pause();
		});

		socket.on('play',function(trackId) {
			queueManager.addTrack(trackId);
		});

		socket.on('skip',function(trackId) {
			spotifyHelper.playNextTrack();
		});

		socket.on('setVolume', function(volume){
			volumeHelper.setVolume(volume);
		});	

		socket.on('setRadio', function(onOff){
			console.log( "SET RADIO " , onOff);
			queueManager.radioOn = onOff;
			broadcastState();
		});


	});



}

function setupWithPassthroughServer() {

//	socketObject = require('socket.io-client')('http://rockbox-reiling.rhcloud.com/rockbox-player');
	socketObject = require('socket.io-client')('rockbox-reiling.rhcloud.com/rockbox-player');
	
	socketObject.on('play', function(trackId){
		queueManager.addTrack(trackId);
	});

	socketObject.on('setRadio', function(onOff){
		console.log( "SET RADIO " , onOff);
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
		broadcastTracks();
		broadcastState();
		broadcastVolume();
	});

	socketObject.on('disconnect', function(){
		console.log('disconnect')
		//TODO: Shut things down in case of disconnect...
	});	
}

function broadcastState() {
	socketObject.emit( 'stateUpdate' , {'playing':spotifyHelper.isPlaying(), 'radio':queueManager.radioOn});
}

function broadcastTracks() {

	queueManager.getQueue(function(queue) {

		socketObject.emit( 'trackUpdate',queue);
	})
}

function broadcastVolume() {
	
	socketObject.emit( 'volumeUpdate', {'volume':volumeHelper.getVolume()});
}