require( "console-stamp" )( console, { pattern : "mm/dd/yyyy HH:MM:ss.l" } );
require('dotenv-safe').load();
require('shelljs/global');

var spotify = require('node-spotify')({ appkeyFile: 'spotify_appkey.key' });
var socketObject;

function setupSpotify() {

  spotify.on({

  	ready:function() {

      console.log('Log-in successful');

      setupSockets();

      //Set up end of track functions.
      spotify.player.on({

        endOfTrack:function(err, player) {
          socketObject.emit( 'endOfTrack' );
        },

        logout:function() {
          console.log( 'Logged out' );
        }
      })
  	},

    playTokenLost: function() {
      socketObject.emit( 'playTokenLost' );
      console.log('The play token has been lost');
    }      
  });

  console.log('Logging in');
  spotify.login(process.env.SPOTIFY_USER, process.env.SPOTIFY_PASS, true, false);
}

function setupSockets() {

	socketObject = require('socket.io-client')(process.env.PASSTHROUGH_SERVER + '/rockbox-player');

	socketObject.on('play', function(id){
		console.log('play',id);
    spotify.player.play( spotify.createFromLink( id ) );
	});

	socketObject.on('resume', function(id){
   		spotify.player.resume();
	});

	socketObject.on('pause', function(id){
		console.log('pause');
   		spotify.player.pause();
	});


	socketObject.on('setVolume', function(volume){
    if ( !isNaN(volume) && volume < 100 ) { //Normally, I would trust the info coming in. But in this case, could damage hardware if this number gets set wrong.
      exec('amixer  sset PCM,0 '+volume+'%', {"silent":true}, function(code, output) {});
    }
	});

	socketObject.on('connect', function(){
		console.log( 'Connected' );
	});

	socketObject.on('disconnect', function(){
		console.log('Disconnected');
    	spotify.player.stop();
	});
}

setupSpotify();
